// frontend/src/pages/Payments.jsx
import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";
import { getMyPayments, getLandlordPayments, payPayment } from "../api/payments";

function formatDate(value) {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleDateString();
}

function formatCurrency(value) {
  if (value == null) return "-";
  return `$${Number(value).toFixed(2)}`;
}

function computeStatus(payment) {
  if (!payment) return "-";
  if (payment.status === "PAID") return "PAID";
  if (payment.status === "FAILED") return "FAILED";

  const now = new Date();
  const due = payment.dueDate ? new Date(payment.dueDate) : null;
  if (due && due < now) return "LATE";
  return "PENDING";
}

export default function Payments() {
  const { user } = useAuth();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const isTenant = user?.role === "TENANT";
  const isLandlord = user?.role === "LANDLORD";

  const loadPayments = async () => {
    if (!user) return;
    setLoading(true);
    setError("");

    try {
      const data = isTenant
        ? await getMyPayments()
        : await getLandlordPayments();
      setPayments(data);
    } catch (err) {
      console.error("Failed to load payments", err);
      setError("Failed to load payments.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPayments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.role]);

  const handlePay = async (paymentId) => {
    if (!window.confirm("Mark this payment as paid?")) return;
    try {
      setSubmitting(true);
      await payPayment(paymentId);
      await loadPayments();
    } catch (err) {
      console.error("Failed to pay", err);
      alert("Could not mark payment as paid.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page">
      <Navbar />
      <main className="page-inner">
        <h1 className="page-title">Payments</h1>
        <p className="muted">
          {isTenant &&
            "View your rent payments and see what is pending or late."}
          {isLandlord &&
            "View all payments across your properties and leases."}
          {!isTenant && !isLandlord &&
            "View payments linked to your account."}
        </p>

        {error && <div className="alert error">{error}</div>}

        <section className="card">
          {loading ? (
            <p>Loading payments...</p>
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
                    const tenantUser = lease?.tenant?.user;
                    const status = computeStatus(p);

                    const canPay =
                      isTenant &&
                      status !== "PAID" &&
                      status !== "FAILED" &&
                      !submitting;

                    return (
                      <tr key={p.id}>
                        {isLandlord && (
                          <td>
                            {property
                              ? `${property.title || ""} ${
                                  property.city ? `— ${property.city}` : ""
                                }`
                              : "-"}
                          </td>
                        )}
                        <td>{unit ? unit.unitNumber : "-"}</td>
                        {isLandlord && (
                          <td>
                            {tenantUser
                              ? `${tenantUser.name} (${tenantUser.email})`
                              : "-"}
                          </td>
                        )}
                        <td>{formatDate(p.dueDate || p.createdAt)}</td>
                        <td>{formatCurrency(p.amount)}</td>
                        <td>{status}</td>
                        <td>{formatDate(p.paidAt)}</td>
                        {isTenant && (
                          <td>
                            {canPay ? (
                              <button
                                className="btn btn-small"
                                onClick={() => handlePay(p.id)}
                                disabled={submitting}
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
