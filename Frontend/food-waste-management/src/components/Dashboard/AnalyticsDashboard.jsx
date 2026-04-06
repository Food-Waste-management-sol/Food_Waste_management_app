import React, { useMemo, useState, useEffect } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  LineChart,
  Line,
} from "recharts";
import axios from "axios";
import API from "../../services/api";
import "./Dashboard.css";

const COLORS = ["#1a3d2b", "#3d8a5e", "#f5b05a", "#e85d26"];
const AI_SERVER = "http://localhost:5000";

const AnalyticsDashboard = ({ foodData: propFoodData }) => {
  const [foodData, setFoodData] = useState(propFoodData || []);
  const [prediction, setPrediction] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch foodData
  useEffect(() => {
    if (propFoodData && propFoodData.length > 0) {
      setFoodData(propFoodData);
      setLoading(false);
      return;
    }
    const fetchFoodData = async () => {
      try {
        const { data } = await API.get("/food/my-listings");
        setFoodData(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Food data fetch failed", err);
        setFoodData([]);
      } finally {
        setLoading(false);
      }
    };
    fetchFoodData();
  }, [propFoodData]);

  // ✅ Feature 2 — Waste Prediction (fixed URL)
  useEffect(() => {
    const fetchPrediction = async () => {
      try {
        const res = await axios.get(`${AI_SERVER}/predict-waste`);
        setPrediction(res.data);
      } catch (err) {
        console.error("Prediction fetch failed", err);
      }
    };
    fetchPrediction();
  }, []);

  // ✅ Feature 5 — Demand Forecast
  useEffect(() => {
    const fetchForecast = async () => {
      try {
        // Past requests fetch karo
        const { data } = await API.get("/request/restaurant");
        const requests = Array.isArray(data) ? data : data?.data || [];

        // Location + quantity map karo
        const mapped = requests.map((r) => ({
          location: r.food?.location || "Unknown",
          quantity: r.food?.quantity || 0,
        }));

        const res = await axios.post(`${AI_SERVER}/demand-forecast`, {
          requests: mapped,
        });
        setForecast(res.data);
      } catch (err) {
        console.error("Forecast fetch failed", err);
      }
    };
    fetchForecast();
  }, []);

  const statusData = useMemo(() => {
    if (!foodData || foodData.length === 0) return [];
    const counts = foodData.reduce((acc, item) => {
      const key = item.status || "UNKNOWN";
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
    return Object.keys(counts).map((key) => ({
      name: key,
      value: counts[key],
    }));
  }, [foodData]);

  const trendData = [
    { day: "Mon", waste: 10 },
    { day: "Tue", waste: 14 },
    { day: "Wed", waste: 12 },
    { day: "Thu", waste: 19 },
    { day: "Fri", waste: 25 },
    { day: "Today", waste: prediction?.predictedWaste ?? 20 },
  ];

  const barData = Array.isArray(foodData) ? foodData.slice(0, 5) : [];

  const demandColors = { HIGH: "#e85d26", MEDIUM: "#f5b05a", LOW: "#3d8a5e" };

  if (loading) return <div className="loader">Loading analytics</div>;

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <h2>Analytics Dashboard</h2>
        <p>AI-powered insights on your food donations and waste patterns.</p>
      </div>

      <div className="dashboard-grid">
        {/* AI Forecast Card */}
        <div className="stat-card ai-highlight">
          <div className="stat-icon">🤖</div>
          <h3>AI Waste Forecast</h3>
          <p className="stat-number">
            {prediction ? `${prediction.predictedWaste} kg` : "Analyzing..."}
          </p>
          <small>Expected waste for {prediction?.day || "today"}</small>
          {prediction?.trend && (
            <div className={`trend-tag ${prediction.trend}`}>
              Trend: {prediction.trend}
            </div>
          )}
        </div>

        {/* Total Donations */}
        <div className="stat-card">
          <div className="stat-icon">🍱</div>
          <h3>Total Donations</h3>
          <p className="stat-number">{foodData.length}</p>
          <small>Food items listed overall</small>
        </div>

        {/* Approved count */}
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <h3>Approved</h3>
          <p className="stat-number">
            {foodData.filter((f) => f.status === "APPROVED").length}
          </p>
          <small>Requests fulfilled</small>
        </div>

        {/* Pie Chart */}
        <div className="chart-container">
          <h4>Distribution by Status</h4>
          {statusData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={statusData}
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {statusData.map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty-chart">No data yet</div>
          )}
        </div>

        {/* Line Chart */}
        <div className="chart-container wide">
          <h4>Waste Prediction Trend</h4>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0ede6" />
              <XAxis dataKey="day" tick={{ fontSize: 12, fill: "#8a8a7a" }} />
              <YAxis tick={{ fontSize: 12, fill: "#8a8a7a" }} />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="waste"
                stroke="#f5b05a"
                strokeWidth={3}
                activeDot={{ r: 8 }}
                name="Waste (kg)"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Bar Chart — Freshness */}
        <div className="chart-container wide">
          <h4>AI Freshness Score Overview</h4>
          {barData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0ede6" />
                <XAxis
                  dataKey="title"
                  tick={{ fontSize: 12, fill: "#8a8a7a" }}
                />
                <YAxis tick={{ fontSize: 12, fill: "#8a8a7a" }} />
                <Tooltip />
                <Legend />
                <Bar
                  dataKey="freshnessScore"
                  fill="#1a3d2b"
                  name="Freshness %"
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty-chart">No freshness data yet</div>
          )}
        </div>

        {/* ✅ Feature 5 — Demand Forecast */}
        <div className="chart-container wide">
          <h4>📍 Location-wise Demand Forecast</h4>
          {forecast?.forecast?.length > 0 ? (
            <>
              <p
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: "13px",
                  color: "#8a8a7a",
                  marginBottom: "16px",
                }}
              >
                {forecast.message}
              </p>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                }}
              >
                {forecast.forecast.map((item, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "12px 16px",
                      background: "#fdf8f0",
                      borderRadius: "10px",
                      border: "1px solid #f0ede6",
                    }}
                  >
                    <div>
                      <p
                        style={{
                          fontFamily: "'DM Sans', sans-serif",
                          fontSize: "14px",
                          fontWeight: 500,
                          color: "#1a1a18",
                          margin: 0,
                        }}
                      >
                        📍 {item.location}
                      </p>
                      <p
                        style={{
                          fontFamily: "'DM Sans', sans-serif",
                          fontSize: "12px",
                          color: "#8a8a7a",
                          margin: "2px 0 0",
                        }}
                      >
                        Expected: {item.expectedDemand} servings
                      </p>
                    </div>
                    <span
                      style={{
                        padding: "4px 12px",
                        borderRadius: "20px",
                        fontSize: "12px",
                        fontWeight: 500,
                        fontFamily: "'DM Sans', sans-serif",
                        background:
                          item.demandLevel === "HIGH"
                            ? "#feeaea"
                            : item.demandLevel === "MEDIUM"
                              ? "#fff8ec"
                              : "#e8f5ed",
                        color: demandColors[item.demandLevel],
                        border: `1px solid ${demandColors[item.demandLevel]}40`,
                      }}
                    >
                      {item.demandLevel}
                    </span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="empty-chart">No demand data yet</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
