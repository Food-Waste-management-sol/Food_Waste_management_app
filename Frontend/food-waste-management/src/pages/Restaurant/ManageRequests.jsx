import React, { useEffect, useState } from "react";
import API from "../../services/api";
import "./Restaurant.css";

const ManageRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [approvingId, setApprovingId] = useState(null);
  const [filter, setFilter] = useState("ALL");

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const { data } = await API.get("/request/restaurant");
      setRequests(data);
    } catch (error) {
      console.error("Error fetching requests", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    setApprovingId(id);
    try {
      await API.post(`/request/approve/${id}`);
      setRequests((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: "APPROVED" } : r)),
      );
    } catch (error) {
      alert("Approval failed: " + (error.response?.data?.message || "Error"));
    } finally {
      setApprovingId(null);
    }
  };

  const pending = requests.filter((r) => r.status === "PENDING").length;
  const approved = requests.filter((r) => r.status === "APPROVED").length;

  const filtered =
    filter === "ALL" ? requests : requests.filter((r) => r.status === filter);

  if (loading)
    return (
      <div className="mr-loader">
        <div className="mr-loader-ring" />
        <span>Loading requests…</span>
      </div>
    );

  return (
    <div className="mr-page">
      {/* Header */}
      <div className="mr-header">
        <div>
          <h2 className="mr-title">NGO Food Requests</h2>
          <p className="mr-subtitle">
            Approve or review incoming requests for your donated food items.
          </p>
        </div>
        <div className="mr-header-dot" />
      </div>

      {/* Stats */}
      <div className="mr-stats">
        <div className="mr-stat mr-stat--amber">
          <span className="mr-stat-num">{pending}</span>
          <span className="mr-stat-label">Pending</span>
          <div
            className="mr-stat-bar"
            style={{ width: `${pending > 0 ? 100 : 0}%` }}
          />
        </div>
        <div className="mr-stat mr-stat--green">
          <span className="mr-stat-num">{approved}</span>
          <span className="mr-stat-label">Approved</span>
          <div
            className="mr-stat-bar mr-stat-bar--green"
            style={{
              width: `${requests.length > 0 ? (approved / requests.length) * 100 : 0}%`,
            }}
          />
        </div>
        <div className="mr-stat mr-stat--neutral">
          <span className="mr-stat-num">{requests.length}</span>
          <span className="mr-stat-label">Total</span>
          <div
            className="mr-stat-bar mr-stat-bar--neutral"
            style={{ width: "100%" }}
          />
        </div>
      </div>

      {/* Filter tabs */}
      <div className="mr-filters">
        {["ALL", "PENDING", "APPROVED"].map((f) => (
          <button
            key={f}
            className={`mr-filter-btn ${filter === f ? "active" : ""}`}
            onClick={() => setFilter(f)}
          >
            {f === "ALL" ? "All" : f.charAt(0) + f.slice(1).toLowerCase()}
            <span className="mr-filter-count">
              {f === "ALL"
                ? requests.length
                : requests.filter((r) => r.status === f).length}
            </span>
          </button>
        ))}
      </div>

      {/* Cards */}
      {filtered.length > 0 ? (
        <div className="mr-list">
          {filtered.map((req, i) => (
            <div
              className="mr-card"
              key={req.id}
              style={{ animationDelay: `${i * 0.06}s` }}
            >
              {/* Left: image */}
              <div className="mr-card-img-wrap">
                {req.food.imageUrl ? (
                  <img
                    src={req.food.imageUrl}
                    alt={req.food.title}
                    className="mr-card-img"
                  />
                ) : (
                  <div className="mr-card-img mr-card-img--placeholder">🍱</div>
                )}
              </div>

              {/* Middle: info */}
              <div className="mr-card-info">
                <p className="mr-card-food">{req.food.title}</p>
                <p className="mr-card-servings">
                  <span className="mr-dot" /> {req.food.quantity} servings
                </p>
                <p className="mr-card-ngo">
                  <span className="mr-ngo-icon">🏢</span> {req.ngo.name}
                </p>
              </div>

              {/* Right: actions */}
              <div className="mr-card-actions">
                <span
                  className={`mr-badge mr-badge--${req.status.toLowerCase()}`}
                >
                  {req.status.charAt(0) + req.status.slice(1).toLowerCase()}
                </span>
                {req.status === "PENDING" ? (
                  <button
                    className="mr-approve-btn"
                    onClick={() => handleApprove(req.id)}
                    disabled={approvingId === req.id}
                  >
                    {approvingId === req.id ? (
                      <>
                        <span className="mr-spinner" /> Approving…
                      </>
                    ) : (
                      "✓ Approve"
                    )}
                  </button>
                ) : (
                  <span className="mr-done">Completed ✦</span>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="mr-empty">
          <div className="mr-empty-icon">📭</div>
          <p className="mr-empty-title">No requests yet</p>
          <p className="mr-empty-sub">
            Once NGOs request your food, they'll appear here.
          </p>
        </div>
      )}
    </div>
  );
};

export default ManageRequests;
