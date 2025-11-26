// src/pages/Leases.jsx
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";

import { getMyProperties } from "../api/properties";
import { getUnitsByProperty } from "../api/units";
import { getTenants } from "../api/tenants";
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
  const [leases, setLeases] = useState([]);

  const [selectedUnit, setSelectedUnit] = useState("");
  const [selectedTenant, setSelectedTenant] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [rentAmount, setRentAmount] = useState("");

  useEffect(() => {
    getMyProperties().then(setProperties).catch(console.error);
  }, []);

  useEffect(() => {
    if (!selectedProperty) return;

    getUnitsByProperty(selectedProperty).then(setUnits).catch(console.error);
    getTenants().then(setTenants).catch(console.error);
    getLeasesByProperty(selectedProperty).then(setLeases).catch(console.error);
  }, [selectedProperty]);

  const handleCreateLease = async () => {
    if (!selectedUnit || !selectedTenant || !startDate || !rentAmount)
      return alert("Fill all fields!");

    await createLease({
      unitId: selectedUnit,
      tenantId: selectedTenant,
      startDate,
      endDate,
      rentAmount: Number(rentAmount),
    });

    const newList = await getLeasesByProperty(selectedProperty);
    setLeases(newList);
  };

  const handleDeleteLease = async (id) => {
    if (!confirm("Delete this lease?")) return;
    await deleteLease(id);
    setLeases((l) => l.filter((x) => x.id !== id));
  };

  return (
    <div className="page">
      <main className="page-inner">
        <h1 className="page-title">Leases</h1>

        {/* Property Selection */}
        <div className="card">
          <h2>Select Property</h2>
          <select
            className="input"
            value={selectedProperty}
            onChange={(e) => setSelectedProperty(e.target.value)}
          >
            <option value="">Select property...</option>
            {properties.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title}
              </option>
            ))}
          </select>
        </div>

        {/* Create Lease */}
        {selectedProperty && (
          <div className="card">
            <h2>Create Lease</h2>

            <select
              className="input"
              value={selectedUnit}
              onChange={(e) => setSelectedUnit(e.target.value)}
            >
              <option value="">Select unit...</option>
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
            >
              <option value="">Select tenant...</option>
              {tenants.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.email})
                </option>
              ))}
            </select>

            <input
              type="date"
              className="input"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />

            <input
              type="date"
              className="input"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />

            <input
              className="input"
              type="number"
              placeholder="Rent Amount"
              value={rentAmount}
              onChange={(e) => setRentAmount(e.target.value)}
            />

            <button className="btn-primary" onClick={handleCreateLease}>
              Create Lease
            </button>
          </div>
        )}

        {/* Lease List */}
        {leases.length > 0 && (
          <div className="card">
            <h2>Existing Leases</h2>

            <ul>
              {leases.map((l) => (
                <li key={l.id} className="lease-row">
                  Unit {l.unit.unitNumber} — {l.tenant.name}
                  <button
                    className="btn-link danger"
                    onClick={() => handleDeleteLease(l.id)}
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </main>
    </div>
  );
}
