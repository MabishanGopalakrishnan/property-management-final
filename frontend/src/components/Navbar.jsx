// src/components/Navbar.jsx
import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const navLinkStyle = ({ isActive }) => ({
  marginRight: "1rem",
  fontSize: "0.95rem",
  textDecoration: "none",
  color: isActive ? "#4fd1c5" : "#e5e7eb",
  borderBottom: isActive ? "2px solid #4fd1c5" : "2px solid transparent",
  paddingBottom: "0.2rem",
});

export default function Navbar() {
  const { user, logout } = useAuth();
  if (!user) return null; // no navbar when logged out

  const isManager = user.role === "LANDLORD";
  const isTenant = user.role === "TENANT";

  return (
    <header className="navbar">
      <div className="navbar-left">
        <span className="brand">
          {isManager ? "Retro Property Manager" : "Tenant Portal"}
        </span>

        {/* MANAGER NAVIGATION */}
        {isManager && (
          <nav>
            <NavLink to="/dashboard" style={navLinkStyle}>
              Dashboard
            </NavLink>

            <NavLink to="/properties" style={navLinkStyle}>
              Properties
            </NavLink>

            <NavLink to="/units" style={navLinkStyle}>
              Units
            </NavLink>

            <NavLink to="/leases" style={navLinkStyle}>
              Leases
            </NavLink>

            <NavLink to="/payments" style={navLinkStyle}>
              Payments
            </NavLink>

            <NavLink to="/analytics" style={navLinkStyle}>
              Analytics
            </NavLink>

            <NavLink to="/maintenance" style={navLinkStyle}>
              Maintenance
            </NavLink>
          </nav>
        )}

        {/* TENANT NAVIGATION */}
        {isTenant && (
          <nav>
            <NavLink to="/tenant" style={navLinkStyle} end>
              Home
            </NavLink>

            <NavLink to="/tenant/properties" style={navLinkStyle}>
              My Property
            </NavLink>

            <NavLink to="/tenant/leases" style={navLinkStyle}>
              My Lease
            </NavLink>

            <NavLink to="/tenant/payments" style={navLinkStyle}>
              Payments
            </NavLink>

            <NavLink to="/tenant/maintenance" style={navLinkStyle}>
              Maintenance
            </NavLink>
          </nav>
        )}
      </div>

      {/* USER INFO + LOGOUT */}
      <div className="navbar-right">
        <span className="navbar-user">{user.email}</span>
        <button className="btn-outline" onClick={logout}>
          Logout
        </button>
      </div>
    </header>
  );
}
