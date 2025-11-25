// src/pages/tenant/TenantPayments.jsx
import { useEffect, useState } from "react";
import { tenantPayments } from "../../api/tenants";

export default function TenantPayments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    tenantPayments()
      .then((res) => setPayments(res.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading...</p>;
  if (!payments.length) return <p>No payments found.</p>;

  return (
    <div className="page-inner text-white">
      <h1>Payments</h1>

      {payments.map((payment) => (
        <div key={payment.id} className="card">
          <p><strong>Amount:</strong> ${payment.amount}</p>
          <p><strong>Due:</strong> {payment.dueDate}</p>
          <p><strong>Status:</strong> {payment.status}</p>
        </div>
      ))}
    </div>
  );
}

