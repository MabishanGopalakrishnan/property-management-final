// src/pages/tenant/TenantLease.jsx
import { useEffect, useState } from "react";
import { getTenantLease } from "../../api/tenantPortal";
import { getMyPayments } from "../../api/payments";

export default function TenantLease() {
  const [leases, setLeases] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getTenantLease(),
      getMyPayments()
    ])
      .then(([leaseData, paymentData]) => {
        setLeases(Array.isArray(leaseData) ? leaseData : []);
        setPayments(Array.isArray(paymentData) ? paymentData : []);
      })
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

  return (
    <div className="tenant-page">
      <h1 className="tenant-page-title">Lease Details</h1>

      {leases.map((lease, index) => {
        // Find next upcoming payment for this lease
        const nextPayment = payments
          .filter(p => p.leaseId === lease.id && p.status === 'PENDING')
          .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))[0];

        return (
          <div key={lease.id || index} className="tenant-card" style={{ marginBottom: '1.5rem' }}>
            <h2>
              {lease.unit?.property?.title || 'Property'} — Unit {lease.unit?.unitNumber || 'N/A'}
            </h2>
            <p className="muted">
              {lease.unit?.property?.address || ''}, {lease.unit?.property?.city || ''}
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
                <p>{lease.endDate ? new Date(lease.endDate).toLocaleDateString() : 'Ongoing'}</p>
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

            {nextPayment && (
              <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid #e5e7eb' }}>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>Next Payment Due</h3>
                <div className="tenant-grid-2 compact">
                  <div>
                    <p className="label">Amount</p>
                    <p style={{ fontSize: '1.2rem', fontWeight: '600', color: '#ef4444' }}>
                      ${nextPayment.amount}
                    </p>
                  </div>
                  <div>
                    <p className="label">Due Date</p>
                    <p style={{ fontSize: '1.1rem', fontWeight: '500' }}>
                      {new Date(nextPayment.dueDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <p className="muted" style={{ marginTop: '0.5rem', fontSize: '0.875rem' }}>
                  View all payments in the Payments section
                </p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
