// src/pages/Units.jsx
import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { getMyProperties } from "../api/properties";
import {
  getUnitsByProperty,
  createUnit,
  deleteUnit,
} from "../api/units";
import { useAuth } from "../context/AuthContext";

export default function Units() {
  const { user } = useAuth();
  const [properties, setProperties] = useState([]);
  const [selectedProperty, setSelectedProperty] = useState("");
  const [units, setUnits] = useState([]);
  const [loadingUnits, setLoadingUnits] = useState(false);
  const [form, setForm] = useState({
    unitNumber: "",
    bedrooms: 1,
    bathrooms: 1,
    rentAmount: 0,
  });

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getMyProperties();
        setProperties(data);
      } catch (e) {
        console.error("Failed to load properties", e);
      }
    };
    load();
  }, []);

  const loadUnits = async (propertyId) => {
    if (!propertyId) return;
    setLoadingUnits(true);
    try {
      const data = await getUnitsByProperty(propertyId);
      setUnits(data);
    } catch (e) {
      console.error("Failed to load units", e);
    } finally {
      setLoadingUnits(false);
    }
  };

  const handlePropertyChange = (e) => {
    const id = e.target.value;
    setSelectedProperty(id);
    loadUnits(id);
  };

  const handleFormChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleCreateUnit = async (e) => {
    e.preventDefault();
    if (!selectedProperty) {
      alert("Select a property first.");
      return;
    }
    try {
      await createUnit(Number(selectedProperty), {
        unitNumber: form.unitNumber,
        bedrooms: Number(form.bedrooms),
        bathrooms: Number(form.bathrooms),
        rentAmount: Number(form.rentAmount),
      });
      setForm({ unitNumber: "", bedrooms: 1, bathrooms: 1, rentAmount: 0 });
      await loadUnits(selectedProperty);
    } catch (e) {
      console.error(e);
      alert("Failed to create unit.");
    }
  };

  const handleDeleteUnit = async (id) => {
    if (!confirm("Delete this unit?")) return;
    try {
      await deleteUnit(id);
      setUnits((u) => u.filter((x) => x.id !== id));
    } catch (e) {
      console.error(e);
      alert("Failed to delete unit.");
    }
  };

  return (
    <div className="page">
      <Navbar />
      <main className="page-inner">
        <h1 className="page-title">Units</h1>
        <p className="muted">
          {user?.role === "LANDLORD"
            ? "View and manage units within your properties."
            : "View units linked to your lease(s)."}
        </p>

        <section className="card">
          <label className="field-label">Select Property</label>
          <select
            className="input"
            value={selectedProperty}
            onChange={handlePropertyChange}
          >
            <option value="">-- Choose a property --</option>
            {properties.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title} - {p.city}
              </option>
            ))}
          </select>
        </section>

        {selectedProperty && user?.role === "LANDLORD" && (
          <section className="card">
            <h2>Add Unit</h2>
            <form className="form-grid" onSubmit={handleCreateUnit}>
              <input
                className="input"
                placeholder="Unit Number"
                name="unitNumber"
                value={form.unitNumber}
                onChange={handleFormChange}
                required
              />
              <input
                className="input"
                type="number"
                min={0}
                name="bedrooms"
                value={form.bedrooms}
                onChange={handleFormChange}
                placeholder="Bedrooms"
              />
              <input
                className="input"
                type="number"
                min={0}
                name="bathrooms"
                value={form.bathrooms}
                onChange={handleFormChange}
                placeholder="Bathrooms"
              />
              <input
                className="input"
                type="number"
                min={0}
                name="rentAmount"
                value={form.rentAmount}
                onChange={handleFormChange}
                placeholder="Rent Amount"
              />
              <button className="btn-primary">Create Unit</button>
            </form>
          </section>
        )}

        <section className="card">
          <h2>Units</h2>
          {loadingUnits ? (
            <p>Loading units...</p>
          ) : units.length === 0 ? (
            <p className="muted">No units for this property yet.</p>
          ) : (
            <div className="table-wrapper">
              <table className="table">
                <thead>
                  <tr>
                    <th>Unit</th>
                    <th>Bedrooms</th>
                    <th>Bathrooms</th>
                    <th>Rent</th>
                    {user?.role === "LANDLORD" && <th />}
                  </tr>
                </thead>
                <tbody>
                  {units.map((u) => (
                    <tr key={u.id}>
                      <td>{u.unitNumber}</td>
                      <td>{u.bedrooms}</td>
                      <td>{u.bathrooms}</td>
                      <td>${u.rentAmount}</td>
                      {user?.role === "LANDLORD" && (
                        <td>
                          <button
                            className="btn-link danger"
                            onClick={() => handleDeleteUnit(u.id)}
                          >
                            Delete
                          </button>
                        </td>
                      )}
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
