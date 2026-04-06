import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Navbar from "./components/Navbar/Navbar";
import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";
import AddFood from "./pages/Restaurant/AddFood";
import AvailableFood from "./pages/NGO/AvailableFood";
import ManageRequests from "./pages/Restaurant/ManageRequests";
import MyRequests from "./pages/NGO/MyRequests";
import AnalyticsDashboard from "./components/Dashboard/AnalyticsDashboard";
import SmartRoute from "./pages/NGO/SmartRoute";
import Chatbot from "./components/Chatbot/Chatbot";
import Home from "./pages/Home/Home";
import "./App.css";

function App() {
  // Role localStorage se lo — login ke waqt store karo
  const userRole = localStorage.getItem("role") || "NGO";

  // Chatbot sirf logged in users ko dikhao
  const token = localStorage.getItem("token");

  return (
    <Router>
      <Navbar />
      <div className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Restaurant Routes */}
          <Route path="/add-food" element={<AddFood />} />
          <Route path="/manage-requests" element={<ManageRequests />} />
          <Route path="/restaurant-stats" element={<AnalyticsDashboard />} />

          {/* NGO Routes */}
          <Route path="/available-food" element={<AvailableFood />} />
          <Route path="/my-requests" element={<MyRequests />} />
          <Route path="/smart-route" element={<SmartRoute />} />

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>

      {/* ✅ Chatbot — har page pe show hoga, sirf logged in users ko */}
      {token && <Chatbot userRole={userRole} />}
    </Router>
  );
}

export default App;
