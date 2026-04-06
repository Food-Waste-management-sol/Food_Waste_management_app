import React, { useState, useContext } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { login } from "../../services/api";
import { AuthContext } from "../../context/AuthContext";
import { jwtDecode } from "jwt-decode";
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

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { setUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  // Show success toast if coming from Register
  const justRegistered = location.state?.registered;

  const update = (field) => (e) =>
    setFormData((p) => ({ ...p, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const { data } = await login(formData);
      if (data.success) {
        const token = data.data.accessToken;
        const decoded = jwtDecode(token);
        const role = decoded.role;
        localStorage.setItem("token", token);
        localStorage.setItem("role", role);
        setUser({ token, role, name: decoded.name });
        navigate("/");
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "Login failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-split">
        {/* Left panel — branding */}
        <div className="auth-panel">
          <div className="auth-panel__logo">🥗</div>
          <h2 className="auth-panel__title">
            Fight food waste.
            <br />
            Feed communities.
          </h2>
          <p className="auth-panel__sub">
            Connecting restaurants with NGOs to ensure every meal finds a
            purpose.
          </p>
          <div className="auth-panel__stats">
            <div className="panel-stat">
              <strong>2,400+</strong>
              <span>Meals rescued</span>
            </div>
            <div className="panel-stat">
              <strong>180+</strong>
              <span>Restaurants</span>
            </div>
            <div className="panel-stat">
              <strong>94%</strong>
              <span>On-time rate</span>
            </div>
          </div>
        </div>

        {/* Right panel — form */}
        <div className="auth-form-side">
          <div className="auth-card">
            {justRegistered && (
              <div className="auth-success">
                🎉 Account created! Please sign in.
              </div>
            )}

            <h1 className="auth-title">Welcome back</h1>
            <p className="auth-sub">Sign in to your account to continue</p>

            {error && <div className="auth-error">{error}</div>}

            <form onSubmit={handleSubmit} noValidate>
              <div className="form-group">
                <label className="form-label">Email address</label>
                <input
                  className="form-input"
                  type="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={update("email")}
                  required
                  autoComplete="email"
                />
              </div>

              <div className="form-group">
                <div className="label-row">
                  <label className="form-label">Password</label>
                  <a className="forgot-link" tabIndex={0}>
                    Forgot password?
                  </a>
                </div>
                <div className="input-wrap">
                  <input
                    className="form-input"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={update("password")}
                    required
                    autoComplete="current-password"
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
                {loading ? <span className="spinner" /> : "Sign in →"}
              </button>
            </form>

            <p className="auth-footer">
              Don't have an account? <Link to="/register">Register here</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
