import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { addFood } from "../../services/api";
import "./Restaurant.css";

const AI_SERVER = "http://localhost:5000";

const AddFood = () => {
  const [food, setFood] = useState({
    title: "",
    quantity: 1,
    location: "",
    expiryTime: "",
  });
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [locLoading, setLocLoading] = useState(false);
  const [alert, setAlert] = useState(null);
  const [autoTag, setAutoTag] = useState(null);

  const locationRef = useRef(null);
  const autocompleteRef = useRef(null);
  const inputRef = useRef(null);

  const CLOUD_NAME = "dwxixdxsi";
  const UPLOAD_PRESET = "mc9vsbzd";
  const GOOGLE_MAPS_API_KEY = "AIzaSyCcmSCKN89mVGf1OLM67PmWiJUCtC9m1go";

  useEffect(() => {
    if (window.google) {
      initAutocomplete();
      return;
    }
    const existingScript = document.getElementById("google-maps-script");
    if (!existingScript) {
      const script = document.createElement("script");
      script.id = "google-maps-script";
      script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = initAutocomplete;
      document.head.appendChild(script);
    } else {
      existingScript.addEventListener("load", initAutocomplete);
    }
    return () => {
      if (autocompleteRef.current && window.google)
        window.google.maps.event.clearInstanceListeners(
          autocompleteRef.current,
        );
    };
  }, []);

  const initAutocomplete = () => {
    if (!inputRef.current || !window.google) return;
    autocompleteRef.current = new window.google.maps.places.Autocomplete(
      inputRef.current,
      {
        types: ["geocode", "establishment"],
        componentRestrictions: { country: "in" },
      },
    );
    autocompleteRef.current.addListener("place_changed", () => {
      const place = autocompleteRef.current.getPlace();
      if (place?.formatted_address)
        setFood((f) => ({ ...f, location: place.formatted_address }));
      else if (place?.name) setFood((f) => ({ ...f, location: place.name }));
    });
  };

  const showAlert = (type, msg) => {
    setAlert({ type, msg });
    setTimeout(() => setAlert(null), 4000);
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation)
      return showAlert("error", "Geolocation not supported.");
    setLocLoading(true);
    navigator.geolocation.getCurrentPosition(
      async ({ coords: { latitude, longitude } }) => {
        try {
          const res = await axios.get(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
          );
          const address = res.data.display_name || `${latitude}, ${longitude}`;
          setFood((f) => ({ ...f, location: address }));
          if (inputRef.current) inputRef.current.value = address;
        } catch {
          const fallback = `${latitude}, ${longitude}`;
          setFood((f) => ({ ...f, location: fallback }));
          if (inputRef.current) inputRef.current.value = fallback;
        } finally {
          setLocLoading(false);
        }
      },
      () => {
        showAlert("error", "Unable to retrieve your location.");
        setLocLoading(false);
      },
    );
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImage(file);
    setPreview(URL.createObjectURL(file));
    setAutoTag(null);
  };

  const uploadImageToCloudinary = async () => {
    if (!image) return null;
    const data = new FormData();
    data.append("file", image);
    data.append("upload_preset", UPLOAD_PRESET);
    data.append("cloud_name", CLOUD_NAME);
    try {
      const resp = await axios.post(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
        data,
      );
      return resp.data.secure_url;
    } catch {
      return null;
    }
  };

  // ✅ UPDATED — ab return karta hai tag data
  const fetchAutoTag = async (imageUrl) => {
    try {
      const res = await axios.post(`${AI_SERVER}/auto-tag`, { imageUrl });
      setAutoTag(res.data);
      return res.data;
    } catch {
      return null;
    }
  };

  // ✅ UPDATED — success message mein food title + AI label dikhata hai
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const currentTitle = food.title;
    try {
      const imageUrl = await uploadImageToCloudinary();
      if (!imageUrl) {
        showAlert("error", "Image upload failed. Please try again.");
        return;
      }

      const foodPayload = {
        ...food,
        imageUrl,
        expiryTime: food.expiryTime
          ? new Date(food.expiryTime).toISOString().slice(0, 19)
          : null,
      };

      const [tagResult] = await Promise.all([
        fetchAutoTag(imageUrl),
        addFood(foodPayload),
      ]);

      const labelPart = tagResult?.detectedLabel
        ? ` AI ne "${tagResult.detectedLabel}" detect kiya — freshness verified! ✦`
        : " AI ne freshness verify kar li! ✦";

      showAlert(
        "success",
        `"${currentTitle}" successfully listed! 🎉${labelPart} Aapka food ab nearby NGOs ko dikh raha hai.`,
      );

      setFood({ title: "", quantity: 1, location: "", expiryTime: "" });
      if (inputRef.current) inputRef.current.value = "";
      setImage(null);
      setPreview(null);
      setTimeout(() => setAutoTag(null), 5000);
    } catch (error) {
      const msg =
        error.response?.data?.message || error.response?.data || "Server Error";
      showAlert("error", msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="restaurant-page">
      <div className="page-header">
        <h2>Donate Extra Food</h2>
        <p>
          List your surplus food — our AI will verify freshness automatically.
        </p>
      </div>

      {alert && (
        <div
          className={alert.type === "success" ? "auth-success" : "auth-error"}
          style={{
            marginBottom: "1.25rem",
            maxWidth: 720,
            margin: "0 auto 1.25rem",
          }}
        >
          {alert.type === "error" ? "❌ " : "✅ "}
          {alert.msg}
        </div>
      )}

      <div className="food-form-card">
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            {/* Title */}
            <div className="form-group">
              <label className="form-label">
                Food Title <span className="required">*</span>
              </label>
              <input
                className="form-input"
                type="text"
                placeholder="e.g. 20 Thalis, Biryani Box"
                value={food.title}
                onChange={(e) =>
                  setFood((f) => ({ ...f, title: e.target.value }))
                }
                required
              />
            </div>

            {/* Quantity */}
            <div className="form-group">
              <label className="form-label">
                Quantity (servings) <span className="required">*</span>
              </label>
              <input
                className="form-input"
                type="number"
                placeholder="Number of servings"
                min="1"
                value={food.quantity}
                onChange={(e) =>
                  setFood((f) => ({ ...f, quantity: e.target.value }))
                }
                required
              />
            </div>

            {/* Location */}
            <div className="form-group full" ref={locationRef}>
              <label className="form-label">
                Pickup Location <span className="required">*</span>
              </label>
              <div className="loc-wrap">
                <input
                  ref={inputRef}
                  className="form-input"
                  type="text"
                  placeholder="Type address or use current location…"
                  defaultValue={food.location}
                  onChange={(e) =>
                    setFood((f) => ({ ...f, location: e.target.value }))
                  }
                  required
                />
                <button
                  type="button"
                  className="loc-btn"
                  onClick={getCurrentLocation}
                  disabled={locLoading}
                >
                  {locLoading ? (
                    <>
                      <span className="spinner" /> Fetching...
                    </>
                  ) : (
                    "📍 Use My Location"
                  )}
                </button>
              </div>
              <p
                style={{
                  fontSize: "11.5px",
                  color: "#b5b3a8",
                  marginTop: "4px",
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                Start typing — suggestions will appear automatically
              </p>
            </div>

            {/* Image upload */}
            <div className="form-group full">
              <label className="form-label">
                Food Photo <span className="required">*</span>
              </label>
              <div
                className="file-zone"
                style={preview ? { borderColor: "#3d8a5e" } : {}}
              >
                <div className="file-zone-icon">📷</div>
                <p>
                  Drag & drop or <strong>browse</strong> to upload
                </p>
                <p className="hint">JPG, PNG up to 10MB</p>
                <input
                  type="file"
                  className="file-input-hidden"
                  accept="image/*"
                  onChange={handleImageChange}
                  required={!image}
                />
              </div>
              {preview && (
                <img src={preview} alt="Preview" className="preview-img" />
              )}

              {/* Auto Tag Result */}
              {autoTag && (
                <div
                  style={{
                    marginTop: "10px",
                    padding: "12px 16px",
                    background: "#f0faf4",
                    borderRadius: "10px",
                    border: "1px solid #a8dbbe",
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: "13px",
                  }}
                >
                  <p
                    style={{
                      fontWeight: 500,
                      color: "#1a3d2b",
                      margin: "0 0 6px",
                    }}
                  >
                    🤖 AI Detected: {autoTag.detectedLabel}
                  </p>
                  <div
                    style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}
                  >
                    <span
                      style={{
                        padding: "3px 10px",
                        borderRadius: "20px",
                        fontSize: "12px",
                        background: "#1a3d2b",
                        color: "#fff",
                      }}
                    >
                      {autoTag.category}
                    </span>
                    <span
                      style={{
                        padding: "3px 10px",
                        borderRadius: "20px",
                        fontSize: "12px",
                        background: autoTag.isVeg ? "#e8f5ed" : "#feeaea",
                        color: autoTag.isVeg ? "#1a6b3a" : "#c0392b",
                        border: `1px solid ${autoTag.isVeg ? "#a8dbbe" : "#f5b8b8"}`,
                      }}
                    >
                      {autoTag.isVeg ? "🟢 Veg" : "🔴 Non-Veg"}
                    </span>
                    {autoTag.tags?.map((tag, i) => (
                      <span
                        key={i}
                        style={{
                          padding: "3px 10px",
                          borderRadius: "20px",
                          fontSize: "12px",
                          background: "#fff8ec",
                          color: "#b87a1a",
                          border: "1px solid #f5d08a",
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <p
                    style={{
                      margin: "6px 0 0",
                      color: "#8a8a7a",
                      fontSize: "12px",
                    }}
                  >
                    Confidence: {autoTag.confidence}%
                  </p>
                </div>
              )}
            </div>

            {/* Expiry */}
            <div className="form-group full">
              <label className="form-label">
                Expiry Time <span className="required">*</span>
              </label>
              <input
                className="form-input"
                type="datetime-local"
                value={food.expiryTime}
                onChange={(e) =>
                  setFood((f) => ({ ...f, expiryTime: e.target.value }))
                }
                required
              />
            </div>
          </div>

          <div className="form-divider" />
          <div className="ai-badge">
            ✦ AI will analyze your food photo for freshness before listing
          </div>

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? (
              <>
                <span className="spinner" /> AI is Analyzing Image...
              </>
            ) : (
              "List Food Item"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddFood;
