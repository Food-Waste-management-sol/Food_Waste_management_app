import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { register } from "../../services/api";
import "./Auth.css";

const EyeOpen = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);
const EyeOff = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);

const ROLES = [
  {
    value: "NGO",
    emoji: "🏘️",
    label: "NGO",
    desc: "Request & collect surplus food donations",
  },
  {
    value: "RESTAURANT",
    emoji: "🍽️",
    label: "Restaurant",
    desc: "List and donate your surplus meals",
  },
];

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    role: "NGO",
  });
  const [showPassword, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const update = (field) => (e) =>
    setFormData((p) => ({ ...p, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const { data } = await register(formData);
      if (data.success) {
        navigate("/login", { state: { registered: true } });
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "Registration failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-split">
        {/* Left panel */}
        <div className="auth-panel">
          <div className="auth-panel__logo">🥗</div>
          <h2 className="auth-panel__title">
            Join the
            <br />
            food rescue mission.
          </h2>
          <p className="auth-panel__sub">
            Whether you're a restaurant with surplus food or an NGO serving
            communities — you belong here.
          </p>
          <div className="auth-panel__roles">
            <div className="panel-role">
              <span>🍽️</span> Restaurants donate meals
            </div>
            <div className="panel-role">
              <span>🏘️</span> NGOs collect & distribute
            </div>
            <div className="panel-role">
              <span>🤖</span> AI optimises every route
            </div>
          </div>
        </div>

        {/* Right panel — form */}
        <div className="auth-form-side">
          <div className="auth-card">
            <h1 className="auth-title">Create account</h1>
            <p className="auth-sub">Join us to reduce food waste</p>

            {error && <div className="auth-error">{error}</div>}

            <form onSubmit={handleSubmit} noValidate>
              {/* Role selector — first so users pick identity early */}
              <div className="form-group">
                <label className="form-label">I am a</label>
                <div className="role-grid">
                  {ROLES.map(({ value, emoji, label, desc }) => (
                    <div
                      key={value}
                      className={`role-card ${formData.role === value ? "selected" : ""}`}
                      onClick={() =>
                        setFormData((p) => ({ ...p, role: value }))
                      }
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) =>
                        e.key === "Enter" &&
                        setFormData((p) => ({ ...p, role: value }))
                      }
                    >
                      <span className="role-emoji">{emoji}</span>
                      <p className="role-label">{label}</p>
                      <p className="role-desc">{desc}</p>
                      {formData.role === value && (
                        <span className="role-check">✓</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label className="form-label">Full name</label>
                  <input
                    className="form-input"
                    type="text"
                    placeholder="Your name"
                    onChange={update("name")}
                    required
                    autoComplete="name"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone</label>
                  <input
                    className="form-input"
                    type="tel"
                    placeholder="10-digit number"
                    onChange={update("phone")}
                    required
                    autoComplete="tel"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Email address</label>
                <input
                  className="form-input"
                  type="email"
                  placeholder="you@example.com"
                  onChange={update("email")}
                  required
                  autoComplete="email"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Password</label>
                <div className="input-wrap">
                  <input
                    className="form-input"
                    type={showPassword ? "text" : "password"}
                    placeholder="Min 6 characters"
                    onChange={update("password")}
                    required
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className="eye-btn"
                    onClick={() => setShowPass((v) => !v)}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? <EyeOff /> : <EyeOpen />}
                  </button>
                </div>
              </div>

              <button type="submit" className="auth-btn" disabled={loading}>
                {loading ? <span className="spinner" /> : "Create account →"}
              </button>
            </form>

            <p className="auth-footer">
              Already have an account? <Link to="/login">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
