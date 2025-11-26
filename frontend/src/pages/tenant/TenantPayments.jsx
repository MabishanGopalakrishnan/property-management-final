// src/pages/tenant/TenantPayments.jsx
import { useEffect, useState } from "react";
import { getTenantPayments } from "../../api/tenantPortal";

export default function TenantPayments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTenantPayments()
      .then((data) => setPayments(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="tenant-page">
        <div className="tenant-card center">
          <div className="loader" />
          <p>Loading payments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="tenant-page">
      <h1 className="tenant-page-title">Payments</h1>

      {!payments.length ? (
        <div className="tenant-card center">
          <p className="muted">No payments found.</p>
        </div>
      ) : (
        <div className="tenant-table-card tenant-card">
          <table className="tenant-table">
            <thead>
              <tr>
                <th>Due date</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Property</th>
                <th>Unit</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p) => (
                <tr key={p.id}>
                  <td>{new Date(p.dueDate).toLocaleDateString()}</td>
                  <td>${p.amount}</td>
                  <td>
                    <span
                      className={`status-badge ${p.status.toLowerCase()}`}
                    >
                      {p.status}
                    </span>
                  </td>
                  <td>{p.propertyTitle}</td>
                  <td>{p.unitNumber}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
