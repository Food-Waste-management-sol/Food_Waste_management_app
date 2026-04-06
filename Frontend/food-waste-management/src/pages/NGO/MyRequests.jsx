import React, { useEffect, useState } from "react";
import API from "../../services/api";
import "./NGO.css";

const STATUS_CONFIG = {
  APPROVED: { label: "Approved", cls: "approved", icon: "✅" },
  PENDING: { label: "Pending", cls: "pending", icon: "⏳" },
  REJECTED: { label: "Rejected", cls: "rejected", icon: "❌" },
};

const MyRequests = () => {
  const [myReqs, setMyReqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");

  useEffect(() => {
    fetchMyRequests();
  }, []);

  const fetchMyRequests = async () => {
    setLoading(true);
    try {
      const { data } = await API.get("/request/ngo");
      setMyReqs(Array.isArray(data) ? data : data.data || []);
    } catch (err) {
      console.error("Error fetching requests", err);
    } finally {
      setLoading(false);
    }
  };

  const tabs = ["ALL", "PENDING", "APPROVED", "REJECTED"];

  const filtered =
    filter === "ALL" ? myReqs : myReqs.filter((r) => r.status === filter);

  const counts = tabs.reduce((acc, t) => {
    acc[t] =
      t === "ALL" ? myReqs.length : myReqs.filter((r) => r.status === t).length;
    return acc;
  }, {});

  return (
    <div className="ngo-page">
      {/* Header */}
      <div className="ngo-header">
        <div>
          <h1 className="ngo-title">My Requests</h1>
          <p className="ngo-sub">
            {myReqs.length} total request{myReqs.length !== 1 ? "s" : ""}
          </p>
        </div>
        <button
          className="refresh-btn"
          onClick={fetchMyRequests}
          title="Refresh"
        >
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

      {/* Status tabs */}
      <div className="status-tabs">
        {tabs.map((t) => (
          <button
            key={t}
            className={`status-tab ${filter === t ? "active" : ""} ${t !== "ALL" ? `status-tab--${t.toLowerCase()}` : ""}`}
            onClick={() => setFilter(t)}
          >
            {t === "ALL" ? "All" : STATUS_CONFIG[t]?.label}
            {counts[t] > 0 && <span className="tab-count">{counts[t]}</span>}
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div className="ngo-skeleton-grid">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="skeleton-card skeleton-card--row">
              <div className="skeleton-body">
                <div className="skeleton-line w60" />
                <div className="skeleton-line w40" />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="ngo-empty">
          <span>📭</span>
          <p>No {filter !== "ALL" ? filter.toLowerCase() : ""} requests yet.</p>
        </div>
      ) : (
        <div className="requests-list">
          {filtered.map((req, i) => {
            const cfg = STATUS_CONFIG[req.status] || STATUS_CONFIG.PENDING;
            return (
              <div
                key={req.id}
                className={`request-card request-card--${cfg.cls}`}
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                {/* Left accent bar comes from CSS border-left */}

                <div className="request-card__main">
                  <div className="request-card__top">
                    <h3 className="request-card__title">{req.food?.title}</h3>
                    <span className={`status-badge status-badge--${cfg.cls}`}>
                      {cfg.icon} {cfg.label}
                    </span>
                  </div>

                  <div className="request-card__meta">
                    <span>
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        width="14"
                        height="14"
                      >
                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                        <polyline points="9 22 9 12 15 12 15 22" />
                      </svg>
                      {req.food?.restaurant?.name}
                    </span>
                    <span>
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        width="14"
                        height="14"
                      >
                        <rect
                          x="3"
                          y="4"
                          width="18"
                          height="18"
                          rx="2"
                          ry="2"
                        />
                        <line x1="16" y1="2" x2="16" y2="6" />
                        <line x1="8" y1="2" x2="8" y2="6" />
                        <line x1="3" y1="10" x2="21" y2="10" />
                      </svg>
                      {req.createdAt
                        ? new Date(req.createdAt).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })
                        : "—"}
                    </span>
                    <span>
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        width="14"
                        height="14"
                      >
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                      </svg>
                      {req.food?.quantity} servings
                    </span>
                  </div>
                </div>

                {req.status === "APPROVED" && (
                  <div className="request-card__action">
                    <div className="pickup-note">
                      <span>🚗</span>
                      <span>
                        Ready for pickup! Head to {req.food?.location}.
                      </span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyRequests;
