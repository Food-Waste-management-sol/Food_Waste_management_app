import React from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css";

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="home-page">
      {/* ── HERO ── */}
      <section className="hero">
        <div className="hero-left">
          <div className="hero-tag">🌱 AI-Powered Food Rescue Platform</div>

          <h1 className="hero-h1">
            Zero Waste,
            <br />
            <em>Zero Hunger</em>
          </h1>

          <p className="hero-sub">
            Connecting restaurants with surplus food to NGOs that need it most —
            powered by AI to verify freshness and optimize every delivery route.
          </p>

          <div className="hero-btns">
            <button
              className="btn-primary"
              onClick={() => navigate("/register")}
            >
              🍴 I'm a Restaurant
            </button>
            <button
              className="btn-outline"
              onClick={() => navigate("/register")}
            >
              🤝 I'm an NGO
            </button>
          </div>

          <div className="hero-trust">
            <div className="trust-avatars">
              <span>🍽️</span>
              <span>🏠</span>
              <span>🌿</span>
              <span>❤️</span>
            </div>
            <div className="trust-text">
              <strong>2,400+</strong> meals rescued this month
            </div>
          </div>
        </div>

        <div className="hero-right">
          <div className="hero-illustration">
            <div className="hero-card-float">
              <div className="float-icon">🍛</div>
              <div className="float-title">50 Biryani Servings Listed</div>
              <div className="float-sub">Annapurna Restaurant · Just now</div>
              <span className="float-pill">✦ AI Verified Fresh</span>
            </div>
            <div className="hero-card-float">
              <div className="float-icon">📍</div>
              <div className="float-title">Route Optimized</div>
              <div className="float-sub">3 NGOs · 2.4 km away</div>
              <span className="float-pill">⚡ 12 min ETA</span>
            </div>
            <div className="hero-card-float">
              <div className="float-icon">✅</div>
              <div className="float-title">Delivered to Seva Foundation</div>
              <div className="float-sub">50 people fed · CO₂ saved: 4.2 kg</div>
              <span className="float-pill">🌱 Impact Logged</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <div className="stats-section">
        {[
          { num: "48K+", label: "Meals Rescued" },
          { num: "320+", label: "Partner Restaurants" },
          { num: "180+", label: "NGOs Served" },
          { num: "12T", label: "CO₂ Saved (kg)" },
        ].map((s) => (
          <div className="stat-item" key={s.label}>
            <div className="stat-num">{s.num}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* ── HOW IT WORKS ── */}
      <section className="home-section">
        <div className="section-tag">How it works</div>
        <h2 className="section-title">
          From surplus to smiles
          <br />
          in three steps
        </h2>
        <p className="section-sub">
          Our AI handles verification, matching, and routing — you just cook and
          care.
        </p>

        <div className="steps-grid">
          {[
            {
              n: "01",
              icon: "📸",
              role: "restaurant",
              roleLabel: "Restaurant",
              title: "List Surplus Food",
              desc: "Upload a photo, set quantity and expiry. Our AI instantly analyzes freshness and lists it for nearby NGOs.",
            },
            {
              n: "02",
              icon: "🔍",
              role: "ngo",
              roleLabel: "NGO",
              title: "Browse & Request",
              desc: "NGOs see available food in real time, filter by location, and send pickup requests with one tap.",
            },
            {
              n: "03",
              icon: "🤖",
              role: "ai",
              roleLabel: "AI Engine",
              title: "Smart Route & Deliver",
              desc: "Our AI picks the optimal route, notifies both parties, and logs the impact — meals, CO₂, and more.",
            },
          ].map((step) => (
            <div className="step-card" key={step.n} data-n={step.n}>
              <div className="step-icon">{step.icon}</div>
              <span className={`step-role ${step.role}`}>{step.roleLabel}</span>
              <div className="step-title">{step.title}</div>
              <div className="step-desc">{step.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="features-section">
        <div className="section-tag amber">Why us</div>
        <h2 className="section-title light">
          Built different,
          <br />
          built to last
        </h2>
        <p className="section-sub light">
          Every feature is designed to reduce friction and maximize impact.
        </p>

        <div className="feat-grid">
          {[
            {
              icon: "✦",
              title: "AI Freshness Verification",
              desc: "Computer vision scans every food photo before listing — bad food never reaches an NGO.",
            },
            {
              icon: "📍",
              title: "Smart Route Optimization",
              desc: "Finds the closest NGOs, calculates the fastest route, and minimizes delivery time automatically.",
            },
            {
              icon: "📊",
              title: "Analytics Dashboard",
              desc: "Restaurants get detailed stats — meals donated, waste reduced, and your environmental footprint.",
            },
            {
              icon: "⚡",
              title: "Real-Time Notifications",
              desc: "Instant alerts when a request comes in, gets approved, or food is on the way.",
            },
          ].map((f) => (
            <div className="feat-card" key={f.title}>
              <div className="feat-icon">{f.icon}</div>
              <div className="feat-title">{f.title}</div>
              <div className="feat-desc">{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="cta-section">
        <div className="cta-inner">
          <h2 className="cta-title">Ready to make a difference?</h2>
          <p className="cta-sub">
            Join 500+ restaurants and NGOs already fighting food waste together.
            It takes less than 2 minutes to get started.
          </p>
          <div className="cta-btns">
            <button
              className="cta-btn-rest"
              onClick={() => navigate("/register")}
            >
              Join as Restaurant 🍴
            </button>
            <button
              className="cta-btn-ngo"
              onClick={() => navigate("/register")}
            >
              Join as NGO 🤝
            </button>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="home-footer">
        <div className="footer-logo">Zero Waste Hero 🥗</div>
        <div className="footer-copy">
          © 2025 · Built with ❤️ to fight hunger
        </div>
      </footer>
    </div>
  );
};

export default Home;
