import React, { useEffect, useState } from "react";
import { getAvailableFood, createFoodRequest } from "../../services/api";
import "./NGO.css";

const FALLBACK_IMG =
  "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&q=80";

const getExpiryStatus = (expiryTime) => {
  const diff = new Date(expiryTime) - new Date();
  const hours = diff / 1000 / 60 / 60;
  if (hours < 0) return { label: "Expired", cls: "expired" };
  if (hours < 2) return { label: "< 2 hrs", cls: "urgent" };
  if (hours < 6) return { label: "< 6 hrs", cls: "soon" };
  return { label: `${Math.floor(hours)}h left`, cls: "ok" };
};

const AvailableFood = () => {
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(null); // id of item being claimed
  const [toast, setToast] = useState(null); // { msg, type }
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all"); // all | urgent | available

  useEffect(() => {
    fetchFood();
  }, []);

  const fetchFood = async () => {
    setLoading(true);
    try {
      const { data } = await getAvailableFood();
      setFoods(Array.isArray(data) ? data : data.data || []);
    } catch (err) {
      showToast("Failed to load food listings.", "error");
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleClaim = async (id) => {
    setClaiming(id);
    try {
      await createFoodRequest(id);
      showToast("🎉 Request sent to the restaurant!");
      fetchFood();
    } catch (err) {
      showToast(
        err.response?.data?.message || "Could not process request.",
        "error",
      );
    } finally {
      setClaiming(null);
    }
  };

  const filtered = foods.filter((f) => {
    const status = getExpiryStatus(f.expiryTime);
    if (status.cls === "expired") return false; // ← ye add karo

    const matchSearch =
      f.title?.toLowerCase().includes(search.toLowerCase()) ||
      f.location?.toLowerCase().includes(search.toLowerCase());
    const matchFilter =
      filter === "all" ||
      (filter === "urgent" && status.cls === "urgent") ||
      (filter === "available" && status.cls !== "expired");
    return matchSearch && matchFilter;
  });

  return (
    <div className="ngo-page">
      {/* Toast */}
      {toast && <div className={`toast toast--${toast.type}`}>{toast.msg}</div>}

      {/* Header */}
      <div className="ngo-header">
        <div>
          <h1 className="ngo-title">Food Board</h1>
          {/* // Header mein ye change karo: */}
          <p className="ngo-sub">
            {filtered.length} listing{filtered.length !== 1 ? "s" : ""}{" "}
            available near you
          </p>
        </div>
        <button className="refresh-btn" onClick={fetchFood} title="Refresh">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <polyline points="23 4 23 10 17 10" />
            <polyline points="1 20 1 14 7 14" />
            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
          </svg>
        </button>
      </div>

      {/* Filters */}
      <div className="ngo-toolbar">
        <div className="search-wrap">
          <svg
            className="search-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            className="search-input"
            type="text"
            placeholder="Search by name or location…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="filter-tabs">
          {["all", "urgent", "available"].map((f) => (
            <button
              key={f}
              className={`filter-tab ${filter === f ? "active" : ""}`}
              onClick={() => setFilter(f)}
            >
              {f === "all"
                ? "All"
                : f === "urgent"
                  ? "⚡ Urgent"
                  : "✅ Available"}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="ngo-skeleton-grid">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="skeleton-card">
              <div className="skeleton-img" />
              <div className="skeleton-body">
                <div className="skeleton-line w60" />
                <div className="skeleton-line w80" />
                <div className="skeleton-line w40" />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="ngo-empty">
          <span>🍽️</span>
          <p>No listings match your search.</p>
          <button
            onClick={() => {
              setSearch("");
              setFilter("all");
            }}
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="ngo-grid">
          {filtered.map((item, i) => {
            const expiry = getExpiryStatus(item.expiryTime);
            return (
              <div
                key={item.id}
                className="food-card"
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                {/* Image */}
                <div className="food-card__img-wrap">
                  <img
                    src={item.imageUrl || FALLBACK_IMG}
                    alt={item.title}
                    onError={(e) => {
                      e.target.src = FALLBACK_IMG;
                    }}
                  />
                  <span className={`expiry-badge expiry-badge--${expiry.cls}`}>
                    {expiry.label}
                  </span>
                </div>

                {/* Body */}
                <div className="food-card__body">
                  <h3 className="food-card__title">{item.title}</h3>

                  <div className="food-card__meta">
                    <span>
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                      </svg>
                      {item.quantity} servings
                    </span>
                    <span>
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                        <circle cx="12" cy="10" r="3" />
                      </svg>
                      {item.location}
                    </span>
                    <span>
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 16 14" />
                      </svg>
                      {new Date(item.expiryTime).toLocaleString("en-IN", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>

                  <button
                    className="claim-btn"
                    onClick={() => handleClaim(item.id)}
                    disabled={claiming === item.id || expiry.cls === "expired"}
                  >
                    {claiming === item.id ? (
                      <>
                        <span className="btn-spinner" /> Requesting…
                      </>
                    ) : expiry.cls === "expired" ? (
                      "Expired"
                    ) : (
                      "Request Pickup →"
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AvailableFood;
