import React, { useState, useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
} from "react-leaflet";
import L from "leaflet";
import axios from "axios";
import API from "../../services/api";
import "leaflet/dist/leaflet.css";
import "./SmartRoute.css";

import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

L.Marker.prototype.options.icon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const coloredIcon = (color) =>
  L.divIcon({
    className: "",
    html: `<div style="
      width:16px;height:16px;border-radius:50%;
      background:${color};border:3px solid #fff;
      box-shadow:0 2px 8px rgba(0,0,0,0.25);">
    </div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  });

const NGO_ICON = coloredIcon("#1a3d2b");
const RESTAURANT_ICON = coloredIcon("#e8952a");
const ROUTE_ICON = coloredIcon("#2a7ae8");

const SmartRoute = () => {
  const [route, setRoute] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState("");
  const [stats, setStats] = useState(null);
  const [ngoLocation, setNgoLocation] = useState(null);
  const [restaurants, setRestaurants] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      setDataLoading(true);

      // Step 1 — Browser geolocation
      const getGeoLocation = () =>
        new Promise((resolve, reject) =>
          navigator.geolocation.getCurrentPosition(resolve, reject),
        );

      try {
        const pos = await getGeoLocation();
        const { latitude, longitude } = pos.coords;

        try {
          const geo = await axios.get(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
          );
          const addr = geo.data?.address;
          const name =
            addr?.amenity ||
            addr?.suburb ||
            addr?.city_district ||
            addr?.city ||
            "Your NGO";
          setNgoLocation({ lat: latitude, lng: longitude, name });
        } catch {
          setNgoLocation({ lat: latitude, lng: longitude, name: "Your NGO" });
        }

        // Step 2 — Approved requests se pickup locations
        const requestRes = await API.get("/request/ngo");
        const allRequests = Array.isArray(requestRes.data)
          ? requestRes.data
          : requestRes.data?.data || [];

        const approved = allRequests.filter((r) => r.status === "APPROVED");

        const restaurantList = [];
        for (const req of approved) {
          const loc = req.food?.location;
          if (!loc) continue;
          try {
            const geo = await axios.get(
              `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(loc)}&format=json&limit=1`,
            );
            if (geo.data?.[0]) {
              restaurantList.push({
                lat: parseFloat(geo.data[0].lat),
                lng: parseFloat(geo.data[0].lon),
                name: req.food?.restaurant?.name || loc,
                foodTitle: req.food?.title,
              });
            }
          } catch {
            // skip this location
          }
        }
        setRestaurants(restaurantList);
      } catch (err) {
        if (err.code === 1) {
          setError(
            "Location permission denied. Please enable location to use route planner.",
          );
        } else {
          setError("Could not load data. Please try again.");
        }
      } finally {
        setDataLoading(false);
      }
    };

    fetchData();
  }, []);

  const getOptimizedRoute = async () => {
    if (!ngoLocation) {
      setError("NGO location not available.");
      return;
    }
    if (restaurants.length === 0) {
      setError("No approved pickup locations found.");
      return;
    }
    setLoading(true);
    setError("");
    setRoute([]);
    setStats(null);
    try {
      const res = await axios.post("http://localhost:5000/optimize-route", {
        ngoLocation: { lat: ngoLocation.lat, lng: ngoLocation.lng },
        locations: restaurants,
      });
      setRoute(res.data.optimizedRoute);
      setStats(res.data.stats || null);
    } catch {
      setError("AI server not responding. Showing default order as fallback.");
      setRoute(restaurants);
    } finally {
      setLoading(false);
    }
  };

  const mapCenter = ngoLocation
    ? [ngoLocation.lat, ngoLocation.lng]
    : [23.2599, 77.4126];

  const polyline = ngoLocation
    ? [[ngoLocation.lat, ngoLocation.lng], ...route.map((l) => [l.lat, l.lng])]
    : [];

  const totalDistance = stats?.totalKm
    ? `${stats.totalKm} km`
    : route.length > 0
      ? `~${(route.length * 2.4).toFixed(1)} km (est.)`
      : null;

  if (dataLoading) return <div className="loader">Loading route data</div>;

  return (
    <div className="route-page">
      <div className="route-header">
        <div className="route-header__text">
          <h1 className="route-title">Smart Route Planner</h1>
          <p className="route-sub">
            AI optimises your pickup path — save up to 30% fuel per trip.
          </p>
        </div>
        <button
          className={`optimize-btn ${loading ? "loading" : ""}`}
          onClick={getOptimizedRoute}
          disabled={loading || restaurants.length === 0}
        >
          {loading ? (
            <>
              <span className="btn-spinner" /> Calculating…
            </>
          ) : (
            <>📍 Find Shortest Path</>
          )}
        </button>
      </div>

      {error && <div className="route-error">{error}</div>}

      {!dataLoading && restaurants.length === 0 && !error && (
        <div className="route-error">
          No approved food requests found. Once a restaurant approves your
          request, pickup locations will appear here.
        </div>
      )}

      {route.length > 0 && (
        <div className="route-stats">
          <div className="route-stat">
            <span className="route-stat__num">{route.length}</span>
            <span className="route-stat__label">Stops</span>
          </div>
          {totalDistance && (
            <div className="route-stat">
              <span className="route-stat__num">{totalDistance}</span>
              <span className="route-stat__label">Total distance</span>
            </div>
          )}
          <div className="route-stat">
            <span className="route-stat__num">~{route.length * 8} min</span>
            <span className="route-stat__label">Est. time</span>
          </div>
          <div className="route-stat route-stat--green">
            <span className="route-stat__num">30%</span>
            <span className="route-stat__label">Fuel saved</span>
          </div>
        </div>
      )}

      <div className="map-wrap">
        <MapContainer
          center={mapCenter}
          zoom={13}
          scrollWheelZoom={true}
          className="leaflet-map"
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          />

          {ngoLocation && (
            <Marker
              position={[ngoLocation.lat, ngoLocation.lng]}
              icon={NGO_ICON}
            >
              <Popup>
                🏠 <strong>{ngoLocation.name}</strong>
              </Popup>
            </Marker>
          )}

          {restaurants.map((r, i) => (
            <Marker key={i} position={[r.lat, r.lng]} icon={RESTAURANT_ICON}>
              <Popup>
                🍴 <strong>{r.name}</strong>
                {r.foodTitle && (
                  <>
                    <br />
                    {r.foodTitle}
                  </>
                )}
              </Popup>
            </Marker>
          ))}

          {route.length > 0 && (
            <>
              <Polyline
                positions={polyline}
                color="#e8952a"
                weight={4}
                dashArray="12 6"
                opacity={0.85}
              />
              {route.map((loc, i) => (
                <Marker
                  key={`route-${i}`}
                  position={[loc.lat, loc.lng]}
                  icon={ROUTE_ICON}
                >
                  <Popup>
                    <strong>Stop {i + 1}</strong>
                    <br />
                    {loc.name}
                  </Popup>
                </Marker>
              ))}
            </>
          )}
        </MapContainer>

        <div className="map-legend">
          <div className="legend-item">
            <span className="legend-dot" style={{ background: "#1a3d2b" }} />{" "}
            Your NGO
          </div>
          <div className="legend-item">
            <span className="legend-dot" style={{ background: "#e8952a" }} />{" "}
            Pickup points
          </div>
          {route.length > 0 && (
            <div className="legend-item">
              <span className="legend-dot" style={{ background: "#2a7ae8" }} />{" "}
              Optimized stops
            </div>
          )}
        </div>
      </div>

      {route.length > 0 && (
        <div className="route-steps">
          <h3 className="route-steps__title">Optimized Pickup Order</h3>
          <div className="steps-list">
            <div className="step-item step-item--start">
              <div className="step-node">
                <div className="step-dot step-dot--green" />
                <div className="step-line" />
              </div>
              <div className="step-info">
                <p className="step-name">🏠 {ngoLocation?.name}</p>
                <p className="step-label">Starting point</p>
              </div>
            </div>
            {route.map((stop, i) => (
              <div key={i} className="step-item">
                <div className="step-node">
                  <div className="step-num">{i + 1}</div>
                  {i < route.length - 1 && <div className="step-line" />}
                </div>
                <div className="step-info">
                  <p className="step-name">🍴 {stop.name || `Stop ${i + 1}`}</p>
                  {stop.foodTitle && (
                    <p className="step-label">{stop.foodTitle}</p>
                  )}
                  <p className="step-label">
                    {stop.lat?.toFixed(4)}, {stop.lng?.toFixed(4)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SmartRoute;
