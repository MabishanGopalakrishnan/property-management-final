// src/components/Sidebar.jsx
import { Link } from "react-router-dom";

export default function Sidebar() {
  return (
    <div className="sidebar bg-gray-900 text-white w-64 min-h-screen p-6">
      <h1 className="sidebar-title text-2xl font-bold mb-6">Landlord Panel</h1>

      <nav className="flex flex-col gap-3">
        <Link className="sidebar-link" to="/dashboard">Dashboard</Link>
        <Link className="sidebar-link" to="/properties">Properties</Link>
        <Link className="sidebar-link" to="/units">Units</Link>
        <Link className="sidebar-link" to="/leases">Leases</Link>
        <Link className="sidebar-link" to="/payments">Payments</Link>
        <Link className="sidebar-link" to="/maintenance">Maintenance</Link>
        <Link className="sidebar-link" to="/analytics">Analytics</Link>
      </nav>
    </div>
  );
}
