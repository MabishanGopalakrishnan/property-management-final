// src/pages/tenant/TenantLease.jsx
import { useEffect, useState } from "react";
import { getTenantLease } from "../../api/tenantPortal";

export default function TenantLease() {
  const [leases, setLeases] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTenantLease()
      .then((data) => setLeases(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="tenant-page">
        <div className="tenant-card center">
          <div className="loader" />
          <p>Loading lease details...</p>
        </div>
      </div>
    );
  }

  if (!leases.length) {
    return (
      <div className="tenant-page">
        <div className="tenant-card center">
          <p className="muted">No leases found.</p>
        </div>
      </div>
    );
  }

  const lease = leases[0];

  return (
    <div className="tenant-page">
      <h1 className="tenant-page-title">Lease Details</h1>

      <div className="tenant-card">
        <h2>
          {lease.property?.title} — Unit {lease.unitNumber}
        </h2>
        <p className="muted">
          {lease.property?.address}, {lease.property?.city}
        </p>

        <div className="tenant-grid-2 compact">
          <div>
            <p className="label">Start date</p>
            <p>
              {new Date(lease.startDate).toLocaleDateString()}
            </p>
          </div>
          <div>
            <p className="label">End date</p>
            <p>{new Date(lease.endDate).toLocaleDateString()}</p>
          </div>
          <div>
            <p className="label">Rent</p>
            <p>${lease.rent}</p>
          </div>
          <div>
            <p className="label">Status</p>
            <p>
              <span
                className={`status-badge ${lease.status.toLowerCase()}`}
              >
                {lease.status}
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
