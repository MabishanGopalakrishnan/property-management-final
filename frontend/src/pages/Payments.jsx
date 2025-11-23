// src/pages/Payments.jsx
import { useState } from "react";
import Navbar from "../components/Navbar";
import { getPaymentsByLease } from "../api/payments";
import { useAuth } from "../context/AuthContext";

export default function Payments() {
  const { user } = useAuth();
  const [leaseId, setLeaseId] = useState("");
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleLoad = async (e) => {
    e.preventDefault();
    if (!leaseId) return;
    setLoading(true);
    try {
      const data = await getPaymentsByLease(Number(leaseId));
      setPayments(data);
    } catch (e) {
      console.error(e);
      alert("Failed to load payments. Check leaseId or backend route.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <Navbar />
      <main className="page-inner">
        <h1 className="page-title">Payments</h1>
        <p className="muted">
          {user?.role === "LANDLORD"
            ? "View Stripe-backed rent payments for a lease."
            : "See your rent payments for a lease."}
        </p>

        <section className="card">
          <form className="inline-form" onSubmit={handleLoad}>
            <label className="field-label">Lease ID</label>
            <input
              className="input"
              value={leaseId}
              onChange={(e) => setLeaseId(e.target.value)}
              placeholder="Enter lease ID"
            />
            <button className="btn-primary" disabled={loading}>
              {loading ? "Loading..." : "Load Payments"}
            </button>
          </form>
        </section>

        <section className="card">
          <h2>Payment History</h2>
          {payments.length === 0 ? (
            <p className="muted">No payments loaded.</p>
          ) : (
            <div className="table-wrapper">
              <table className="table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Paid At</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((p) => (
                    <tr key={p.id}>
                      <td>{p.id}</td>
                      <td>${p.amount}</td>
                      <td>{p.status}</td>
                      <td>{p.datePaid ? new Date(p.datePaid).toLocaleString() : "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
