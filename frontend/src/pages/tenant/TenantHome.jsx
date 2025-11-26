// src/pages/tenant/TenantHome.jsx
import { useEffect, useState } from "react";
import { getTenantOverview } from "../../api/tenantPortal";

export default function TenantHome() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [overview, setOverview] = useState(null);

  useEffect(() => {
    getTenantOverview()
      .then((data) => setOverview(data))
      .catch((err) => {
        console.error("Tenant overview error:", err);
        setError("Failed to load tenant overview.");
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="tenant-page">
        <div className="tenant-card center">
          <div className="loader" />
          <p>Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  const lease = overview?.lease;
  const payments = overview?.payments;
  const maint = overview?.maintenance;
  const tenantName =
    overview?.tenant?.name ||
    overview?.tenant?.email?.split("@")[0] ||
    "Tenant";

  return (
    <div className="tenant-page">
      {error && <div className="tenant-alert error">{error}</div>}

      <section className="tenant-hero">
        <h1>
          Welcome back, <span>{tenantName}</span>
        </h1>
        <p className="subtitle">
          Here’s a snapshot of your home, payments, and maintenance.
        </p>
      </section>

      <section className="tenant-grid-3">
        {/* Lease card */}
        <div className="tenant-card">
          <h2>Your Lease</h2>
          {!lease ? (
            <p className="muted">You don’t have any active leases.</p>
          ) : (
            <>
              <p className="highlight">
                {lease.property?.title} — Unit {lease.unitNumber}
              </p>
              <p>
                <span className="label">Rent:</span> ${lease.rent}
              </p>
              <p>
                <span className="label">Dates:</span>{" "}
                {new Date(lease.startDate).toLocaleDateString()} –{" "}
                {new Date(lease.endDate).toLocaleDateString()}
              </p>
              <p>
                <span className="label">Status:</span>{" "}
                <span className={`status-badge ${lease.status.toLowerCase()}`}>
                  {lease.status}
                </span>
              </p>
            </>
          )}
        </div>

        {/* Payments summary */}
        <div className="tenant-card">
          <h2>Payments Summary</h2>
          <div className="metric-row">
            <span>💰 Unpaid total</span>
            <span className="metric-value">
              ${payments?.totalUnpaid?.toFixed(2) ?? "0.00"}
            </span>
          </div>
          <div className="metric-row">
            <span>⚠ Late payments</span>
            <span className="metric-value">
              {payments?.lateCount ?? 0}
            </span>
          </div>
          {payments?.upcoming ? (
            <div className="upcoming-box">
              <p className="label">Next payment</p>
              <p className="highlight">
                ${payments.upcoming.amount} on{" "}
                {new Date(payments.upcoming.dueDate).toLocaleDateString()}
              </p>
              <p className="muted small">Status: {payments.upcoming.status}</p>
            </div>
          ) : (
            <p className="muted small">No upcoming payments.</p>
          )}
        </div>

        {/* Maintenance summary */}
        <div className="tenant-card">
          <h2>Maintenance</h2>
          <p className="metric-large">
            {maint?.openRequestsCount ?? 0}
          </p>
          <p className="muted small">Open requests</p>
          <p className="muted">
            Need something fixed? Create a new request from the Maintenance page.
          </p>
        </div>
      </section>
    </div>
  );
}
