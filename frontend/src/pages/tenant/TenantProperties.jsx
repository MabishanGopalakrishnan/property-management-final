// src/pages/tenant/TenantProperties.jsx
import { useEffect, useState } from "react";
import { getTenantProperties } from "../../api/tenantPortal";

export default function TenantProperties() {
  const [loading, setLoading] = useState(true);
  const [properties, setProperties] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    getTenantProperties()
      .then((data) => setProperties(data || []))
      .catch((err) => {
        console.error("Failed to load tenant properties:", err);
        setError("Failed to load your properties.");
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="tenant-page">
        <div className="tenant-card center">
          <div className="loader" />
          <p>Loading your properties...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="tenant-page">
      {error && <div className="tenant-alert error">{error}</div>}

      <h1 className="tenant-page-title">My Properties</h1>

      {!properties.length ? (
        <div className="tenant-card center">
          <p className="muted">No properties assigned yet.</p>
        </div>
      ) : (
        <div className="tenant-grid-2">
          {properties.map((p) => (
            <div key={p.id} className="tenant-card">
              <h2>{p.title}</h2>
              <p className="muted">
                {p.address}, {p.city}, {p.province} {p.postalCode}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
