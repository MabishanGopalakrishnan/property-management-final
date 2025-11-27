// src/pages/Payments.jsx
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
  getMyPayments,
  getLandlordPayments,
  payPayment,
  syncPayments,
} from "../api/payments";

function formatDate(val) {
  if (!val) return "-";
  const d = new Date(val);
  return isNaN(d.getTime()) ? "-" : d.toLocaleDateString();
}

function formatMoney(val) {
  return val == null ? "-" : `$${Number(val).toFixed(2)}`;
}

function computeStatus(payment) {
  if (payment.status === "PAID") return "PAID";
  if (payment.status === "FAILED") return "FAILED";

  const now = new Date();
  const due = payment.dueDate ? new Date(payment.dueDate) : null;

  if (due && due < now) return "LATE";
  return "PENDING";
}

export default function Payments() {
  const { user } = useAuth();
  const isTenant = user?.role === "TENANT";
  const isLandlord = user?.role === "LANDLORD";

  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [syncMessage, setSyncMessage] = useState("");

  const load = async () => {
    if (!user) return;

    setLoading(true);
    setError("");

    try {
      const data = isTenant ? await getMyPayments()
                            : await getLandlordPayments();
      setPayments(data);
    } catch (err) {
      console.error(err);
      setError("Failed to load payments.");
    }

    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [user?.role]);

  const handlePay = async (id) => {
    if (!confirm("Mark this payment as paid?")) return;

    try {
      setSubmitting(true);
      await payPayment(id);
      await load();
    } catch (err) {
      console.error(err);
      alert("Failed to mark as paid.");
    }

    setSubmitting(false);
  };

  return (
    <div className="page">
      <main className="page-inner">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <h1 className="page-title">Payments</h1>
          {isLandlord && (
            <div>
              <button
                className="btn-outline btn-sync"
                onClick={async () => {
                  try {
                    setLoading(true);
                    setError("");
                    const resp = await syncPayments();
                    await load();
                    const updated = resp?.result?.updated ?? 0;
                    setSyncMessage(`${updated} payment(s) updated`);
                    setTimeout(() => setSyncMessage(""), 4000);
                  } catch (err) {
                    console.error(err);
                    setError("Failed to sync payments with Stripe.");
                  } finally {
                    setLoading(false);
                  }
                }}
              >
                Sync payments
              </button>
            </div>
          )}
        </div>
        <p className="muted">
          {isTenant && "View your rent payments."}
          {isLandlord && "View all payments across your properties."}
          {!isTenant && !isLandlord && "View payments linked to your account."}
        </p>

        {error && <div className="alert error">{error}</div>}
        {syncMessage && <div className="alert success">{syncMessage}</div>}

        <section className="card">
          {loading ? (
            <p>Loading...</p>
          ) : payments.length === 0 ? (
            <p>No payments found.</p>
          ) : (
            <div className="table-wrapper">
              <table className="table">
                <thead>
                  <tr>
                    {isLandlord && <th>Property</th>}
                    <th>Unit</th>
                    {isLandlord && <th>Tenant</th>}
                    <th>Due</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Paid At</th>
                    {isTenant && <th>Action</th>}
                  </tr>
                </thead>

                <tbody>
                  {payments.map((p) => {
                    const lease = p.lease;
                    const unit = lease?.unit;
                    const property = unit?.property;

                    const tenant = lease?.tenant?.user;
                    const status = computeStatus(p);

                    return (
                      <tr key={p.id}>
                        {isLandlord && (
                          <td>
                            {property
                              ? `${property.title} — ${property.city}`
                              : "-"}
                          </td>
                        )}

                        <td>{unit ? unit.unitNumber : "-"}</td>

                        {isLandlord && (
                          <td>
                            {tenant
                              ? `${tenant.name} (${tenant.email})`
                              : "-"}
                          </td>
                        )}

                        <td>{formatDate(p.dueDate || p.createdAt)}</td>
                        <td>{formatMoney(p.amount)}</td>
                        <td>{status}</td>
                        <td>{formatDate(p.paidAt)}</td>

                        {isTenant && (
                          <td>
                            {status !== "PAID" &&
                            status !== "FAILED" &&
                            !submitting ? (
                              <button
                                className="btn btn-small"
                                onClick={() => handlePay(p.id)}
                              >
                                Pay
                              </button>
                            ) : (
                              "-"
                            )}
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
