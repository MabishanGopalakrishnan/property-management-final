// src/pages/tenant/TenantHome.jsx
import { useEffect, useState } from "react";
import { tenantOverview } from "../../api/tenantPortal";

export default function TenantHome() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [overview, setOverview] = useState(null);

  useEffect(() => {
    tenantOverview()
      .then(res => setOverview(res.data))
      .catch(err => {
        console.error("Tenant overview error:", err);
        setError("Failed to load tenant overview.");
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading...</p>;

  return (
    <div className="page">
      <div className="page-inner">
        <h1 className="page-title">Welcome back {overview?.tenant?.name}</h1>

        {error && <div className="alert error">{error}</div>}
      </div>
    </div>
  );
}
