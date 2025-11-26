// src/layouts/TenantLayout.jsx
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function TenantLayout({ children }) {
  const { user, logout } = useAuth();
  const location = useLocation();

  const navItems = [
    { label: "Overview", to: "/tenant" },
    { label: "My Properties", to: "/tenant/properties" },
    { label: "Lease", to: "/tenant/leases" },
    { label: "Payments", to: "/tenant/payments" },
    { label: "Maintenance", to: "/tenant/maintenance" }
  ];

  return (
    <div className="tenant-shell">
      <header className="tenant-header">
        <div className="tenant-header-left">
          <span className="tenant-brand">My Home Portal</span>
          <nav className="tenant-nav">
            {navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={
                  location.pathname === item.to
                    ? "tenant-nav-link active"
                    : "tenant-nav-link"
                }
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="tenant-header-right">
          <span className="tenant-user-email">
            {user?.email ?? "Tenant"}
          </span>
          <button className="btn-outline" onClick={logout}>
            Logout
          </button>
        </div>
      </header>

      <main className="tenant-main">{children}</main>
    </div>
  );
}
