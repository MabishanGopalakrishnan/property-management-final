// src/components/Navbar.jsx
import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { googleLogout } from "@react-oauth/google";

const navLinkStyle = ({ isActive }) => ({
  marginRight: "1rem",
  fontSize: "0.95rem",
  textDecoration: "none",
  color: isActive ? "#4fd1c5" : "#e5e7eb",
  borderBottom: isActive ? "2px solid #4fd1c5" : "2px solid transparent",
  paddingBottom: "0.2rem",
});

export default function Navbar() {
  const { user, logout: appLogout } = useAuth();

  const handleLogout = () => {
    // Clear Google session
    googleLogout();

    // Clear app JWT + context
    appLogout();
  };

  return (
    <header className="navbar">
      <div className="navbar-left">
        <span className="brand">Property Manager</span>

        {user && (
          <nav>
            <NavLink to="/dashboard" style={navLinkStyle}>
              Home
            </NavLink>
            <NavLink to="/properties" style={navLinkStyle}>
              Properties
            </NavLink>
            <NavLink to="/units" style={navLinkStyle}>
              Units
            </NavLink>
            <NavLink to="/payments" style={navLinkStyle}>
              Payments
            </NavLink>
            <NavLink to="/maintenance" style={navLinkStyle}>
              Maintenance
            </NavLink>
          </nav>
        )}
      </div>

      {user && (
        <div className="navbar-right">
          <span className="navbar-user">{user.email}</span>
          <button className="btn-outline" onClick={handleLogout}>
            Logout
          </button>
        </div>
      )}
    </header>
  );
}
