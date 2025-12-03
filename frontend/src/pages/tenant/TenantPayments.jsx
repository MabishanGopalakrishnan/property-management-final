// src/pages/tenant/TenantPayments.jsx
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getTenantPayments } from "../../api/tenantPortal";
import { createPaymentCheckout, verifyPayment } from "../../api/payments";

export default function TenantPayments() {
  const { user } = useAuth();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [payingId, setPayingId] = useState(null);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    const verified = searchParams.get("verified");
    const canceled = searchParams.get("canceled");
    const success = searchParams.get("success");
    const paymentId = searchParams.get("payment_id");
    const sessionId = searchParams.get("session_id");
    
    // Handle new callback flow
    if (verified === "true") {
      setSuccessMessage("Payment completed successfully! 🎉");
      setSearchParams({});
    } 
    // Handle old direct Stripe redirects (for backwards compatibility)
    else if (success === "true" && paymentId && sessionId) {
      verifyPayment(paymentId, sessionId)
        .then(() => {
          setSuccessMessage("Payment completed successfully! 🎉");
          setSearchParams({});
          // Reload payments after successful verification
          if (user && user.role === "TENANT") {
            return getTenantPayments();
          }
        })
        .then((data) => {
          if (data) {
            setPayments(Array.isArray(data) ? data : []);
          }
        })
        .catch((err) => {
          setError("Payment verification failed. Please contact support.");
          setSearchParams({});
        })
        .finally(() => {
          setLoading(false);
        });
      return; // Exit early, don't load payments again below
    } 
    else if (canceled === "true") {
      setError("Payment was canceled. You can try again.");
      setSearchParams({});
    }

    // Only load payments if user is authenticated as tenant
    if (user && user.role === "TENANT") {
      getTenantPayments()
        .then((data) => setPayments(Array.isArray(data) ? data : []))
        .catch((err) => setError("Failed to load payments"))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [user]);

  const handlePayWithStripe = async (paymentId) => {
    setPayingId(paymentId);
    setError(null);
    try {
      const response = await createPaymentCheckout(paymentId);
      if (response.url) {
        // Redirect to Stripe checkout
        window.location.href = response.url;
      }
    } catch (err) {
      setError("Failed to create checkout session. Please try again.");
      setPayingId(null);
    }
  };

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

      {successMessage && (
        <div className="tenant-card" style={{ padding: "1rem", color: "#2e7d32", backgroundColor: "#e8f5e9", borderLeft: "4px solid #2e7d32", marginBottom: "1rem" }}>
          <p>{successMessage}</p>
          {(!user || user.role !== "TENANT") && (
            <p style={{ marginTop: "0.5rem" }}>
              Please <a href="/login" style={{ color: "#1976d2", textDecoration: "underline" }}>log in as a tenant</a> to view your payments.
            </p>
          )}
        </div>
      )}

      {error && (
        <div className="tenant-card" style={{ padding: "1rem", color: "#d32f2f", backgroundColor: "#ffebee", borderLeft: "4px solid #d32f2f", marginBottom: "1rem" }}>
          {error}
        </div>
      )}

      {(!user || user.role !== "TENANT") && !successMessage && !error && (
        <div className="tenant-card" style={{ padding: "2rem", textAlign: "center" }}>
          <p>Please log in as a tenant to view payments.</p>
          <a href="/login" style={{ color: "#1976d2", textDecoration: "underline" }}>Go to Login</a>
        </div>
      )}

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
                <th>Action</th>
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
                  <td>{p.lease?.unit?.property?.title || 'N/A'}</td>
                  <td>{p.lease?.unit?.unitNumber || 'N/A'}</td>
                  <td>
                    {p.status === "PENDING" ? (
                      <button
                        onClick={() => handlePayWithStripe(p.id)}
                        disabled={payingId === p.id}
                        style={{
                          padding: "0.5rem 1rem",
                          backgroundColor: "#6366f1",
                          color: "white",
                          border: "none",
                          borderRadius: "4px",
                          cursor: payingId === p.id ? "wait" : "pointer",
                          opacity: payingId === p.id ? 0.7 : 1,
                        }}
                      >
                        {payingId === p.id ? "Processing..." : "Pay with Stripe"}
                      </button>
                    ) : (
                      <span className="muted">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
