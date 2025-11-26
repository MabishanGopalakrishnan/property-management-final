// src/pages/Leases.jsx
import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";

import { getMyProperties } from "../api/properties";
import { getUnitsByProperty } from "../api/units";
import { getAllTenants } from "../api/tenant";    // ✅ FIXED

import {
  createLease,
  getLeasesByProperty,
  deleteLease,
} from "../api/leases";

export default function Leases() {
  const { user } = useAuth();

  const [properties, setProperties] = useState([]);
  const [selectedProperty, setSelectedProperty] = useState("");

  const [units, setUnits] = useState([]);
  const [tenants, setTenants] = useState([]);

  const [selectedUnit, setSelectedUnit] = useState("");
  const [selectedTenant, setSelectedTenant] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [leases, setLeases] = useState([]);
  const [loading, setLoading] = useState(false);

  // Load landlord properties + all tenants
  useEffect(() => {
    const load = async () => {
      try {
        const [propsData, tenantsData] = await Promise.all([
          getMyProperties(),
          getAllTenants(),   // ✅ FIXED
        ]);

        setProperties(propsData);
        setTenants(tenantsData);
      } catch (err) {
        console.error("Failed to load properties/tenants:", err);
      }
    };
    load();
  }, []);

  const handlePropertySelect = async (e) => {
    const propertyId = e.target.value;
    setSelectedProperty(propertyId);
    setSelectedUnit("");
    setLeases([]);
    setUnits([]);

    if (!propertyId) return;

    try {
      setLoading(true);

      const [unitsData, leasesData] = await Promise.all([
        getUnitsByProperty(propertyId),
        getLeasesByProperty(propertyId),
      ]);

      setUnits(unitsData);
      setLeases(leasesData);
    } catch (err) {
      console.error("Failed to load units/leases:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateLease = async (e) => {
    e.preventDefault();

    try {
      await createLease({
        unitId: Number(selectedUnit),
        tenantId: Number(selectedTenant),
        startDate,
        endDate,
      });

      const updated = await getLeasesByProperty(selectedProperty);
      setLeases(updated);

      setSelectedTenant("");
      setStartDate("");
      setEndDate("");
    } catch (err) {
      console.error("Failed to create lease:", err);
      alert(err.response?.data?.error || "Could not create lease.");
    }
  };

  const handleDeleteLease = async (id) => {
    if (!window.confirm("Delete this lease?")) return;
    try {
      await deleteLease(id);
      setLeases((prev) => prev.filter((l) => l.id !== id));
    } catch (err) {
      alert("Could not delete lease.");
    }
  };

  return (
    <div className="page">
      <Navbar />
      <main className="page-inner">
        <h1 className="page-title">Leases</h1>
        <p className="muted">Create and manage leases between your units and tenants.</p>

        <section className="card">
          <label className="field-label">Select Property</label>
          <select
            className="input"
            value={selectedProperty}
            onChange={handlePropertySelect}
          >
            <option value="">-- Choose a property --</option>
            {properties.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title} — {p.city}
              </option>
            ))}
          </select>
        </section>

        {user?.role === "LANDLORD" && selectedProperty && (
          <section className="card">
            <h2>Create Lease</h2>
            <form className="form-grid" onSubmit={handleCreateLease}>
              <select
                className="input"
                value={selectedUnit}
                onChange={(e) => setSelectedUnit(e.target.value)}
                disabled={units.length === 0}
              >
                <option value="">-- Select Unit --</option>
                {units.map((u) => (
                  <option key={u.id} value={u.id}>
                    Unit {u.unitNumber}
                  </option>
                ))}
              </select>

              <select
                className="input"
                value={selectedTenant}
                onChange={(e) => setSelectedTenant(e.target.value)}
                disabled={tenants.length === 0}
              >
                <option value="">-- Select Tenant --</option>
                {tenants.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.user?.name || t.user?.email} ({t.user?.email})
                  </option>
                ))}
              </select>

              <input type="date" className="input" value={startDate} onChange={e => setStartDate(e.target.value)} />
              <input type="date" className="input" value={endDate} onChange={e => setEndDate(e.target.value)} />

              <button className="btn-primary">Create Lease</button>
            </form>
          </section>
        )}

        <section className="card">
          <h2>Leases</h2>
          {!selectedProperty ? (
            <p className="muted">Select a property to see its leases.</p>
          ) : loading ? (
            <p>Loading…</p>
          ) : leases.length === 0 ? (
            <p className="muted">No leases yet.</p>
          ) : (
            <div className="table-wrapper">
              <table className="table">
                <thead>
                  <tr>
                    <th>Unit</th>
                    <th>Tenant</th>
                    <th>Start</th>
                    <th>End</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {leases.map((l) => (
                    <tr key={l.id}>
                      <td>{l.unit?.unitNumber}</td>
                      <td>{l.tenant?.user?.email}</td>
                      <td>{new Date(l.startDate).toLocaleDateString()}</td>
                      <td>{new Date(l.endDate).toLocaleDateString()}</td>
                      <td>
                        <button className="btn-link danger" onClick={() => handleDeleteLease(l.id)}>
                          Delete
                        </button>
                      </td>
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
