import React, { useContext, useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import "./Navbar.css";

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close drawer on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [location]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path;

  const restaurantLinks = [
    { to: "/add-food", label: "Add Food", icon: "➕", isAI: false },
    { to: "/manage-requests", label: "Requests", icon: "📥", isAI: false },
    { to: "/restaurant-stats", label: "AI Analytics", icon: "📊", isAI: true },
  ];

  const ngoLinks = [
    { to: "/available-food", label: "Browse Food", icon: "🍱", isAI: false },
    { to: "/my-requests", label: "My History", icon: "📜", isAI: false },
    { to: "/smart-route", label: "Smart Route", icon: "📍", isAI: true },
  ];

  const links =
    user?.role?.toUpperCase() === "RESTAURANT" ? restaurantLinks : ngoLinks;

  return (
    <>
      <header className={`navbar-wrapper ${scrolled ? "scrolled" : ""}`}>
        <nav className="navbar">
          {/* Brand */}
          <Link to="/" className="nav-logo">
            <div className="logo-icon">🥗</div>
            <span className="logo-text">
              FoodWaste <strong>AI</strong>
            </span>
          </Link>

          {/* Desktop links */}
          {user && (
            <div className="nav-links desktop-only">
              {links.map(({ to, label, isAI }) => (
                <Link
                  key={to}
                  to={to}
                  className={`nav-link ${isActive(to) ? "active" : ""} ${isAI ? "ai-pill" : ""}`}
                >
                  {label}
                  {isAI && <span className="ai-badge">AI</span>}
                </Link>
              ))}
            </div>
          )}

          {/* Right side */}
          <div className="nav-right desktop-only">
            {user ? (
              <div className="user-area">
                <div className="avatar" title={user.name}>
                  {user.name?.charAt(0).toUpperCase()}
                </div>
                <div className="user-info">
                  <span className="user-name">{user.name}</span>
                  <span className="user-role">{user.role}</span>
                </div>
                <button className="logout-btn" onClick={handleLogout}>
                  Sign out
                </button>
              </div>
            ) : (
              <div className="auth-btns">
                <Link to="/login" className="nav-link">
                  Sign in
                </Link>
                <Link to="/register" className="register-btn">
                  Get started
                </Link>
              </div>
            )}
          </div>

          {/* Hamburger */}
          <button
            className={`hamburger ${menuOpen ? "open" : ""}`}
            onClick={() => setMenuOpen((o) => !o)}
            aria-label="Toggle menu"
          >
            <span />
            <span />
            <span />
          </button>
        </nav>
      </header>

      {/* Mobile Overlay */}
      <div
        className={`drawer-overlay ${menuOpen ? "open" : ""}`}
        onClick={() => setMenuOpen(false)}
      />

      {/* Mobile Drawer */}
      <aside className={`mobile-drawer ${menuOpen ? "open" : ""}`}>
        {user ? (
          <>
            <div className="drawer-user">
              <div className="avatar-large">
                {user.name?.charAt(0).toUpperCase()}
              </div>
              <p className="drawer-user-name">{user.name}</p>
              <span className="drawer-user-role">{user.role}</span>
            </div>

            <nav className="drawer-links">
              {links.map(({ to, label, icon, isAI }) => (
                <Link
                  key={to}
                  to={to}
                  className={`drawer-link ${isActive(to) ? "active" : ""}`}
                >
                  <span className="drawer-link-icon">{icon}</span>
                  {label}
                  {isAI && <span className="ai-badge">AI</span>}
                </Link>
              ))}
            </nav>

            <button className="logout-btn-mobile" onClick={handleLogout}>
              Sign out
            </button>
          </>
        ) : (
          <nav className="drawer-links">
            <Link to="/login" className="drawer-link">
              Sign in
            </Link>
            <Link to="/register" className="drawer-link drawer-link--accent">
              Get started
            </Link>
          </nav>
        )}
      </aside>
    </>
  );
};

export default Navbar;
