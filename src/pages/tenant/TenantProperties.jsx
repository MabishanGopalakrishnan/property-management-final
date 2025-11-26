// src/pages/tenant/TenantProperties.jsx
import { useEffect, useState } from "react";
import { tenantProfile } from "../../api/tenants";

export default function TenantProperties() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    tenantProfile()
      .then((res) => setProfile(res.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading...</p>;
  if (!profile?.leases?.length) return <p>No properties assigned yet.</p>;

  const lease = profile.leases[0];
  const unit = lease.unit;
  const property = unit.property;

  return (
    <div className="page-inner text-white">
      <h1>Your Property</h1>

      <h2>{property.title}</h2>

      <p><strong>Address:</strong> {property.address}</p>
      <p><strong>City:</strong> {property.city}</p>

      <p><strong>Unit:</strong> {unit.unitNumber}</p>
      <p><strong>Bedrooms:</strong> {unit.bedrooms}</p>
      <p><strong>Bathrooms:</strong> {unit.bathrooms}</p>
    </div>
  );
}
