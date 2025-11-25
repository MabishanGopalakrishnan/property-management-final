// src/pages/tenant/TenantLease.jsx
import { useEffect, useState } from "react";
import { tenantLeases } from "../../api/tenants";

export default function TenantLease() {
  const [leases, setLeases] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    tenantLeases()
      .then((res) => setLeases(res.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading...</p>;
  if (!leases.length) return <p>No leases found.</p>;

  const lease = leases[0];

  return (
    <div className="page-inner text-white">
      <h1>Lease Details</h1>

      <p><strong>Start:</strong> {lease.startDate}</p>
      <p><strong>End:</strong> {lease.endDate}</p>
      <p><strong>Rent:</strong> ${lease.monthlyRent}</p>
    </div>
  );
}
