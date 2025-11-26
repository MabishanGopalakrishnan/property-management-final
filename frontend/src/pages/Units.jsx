// src/pages/Units.jsx
import { useEffect, useState } from "react";
import { getMyProperties } from "../api/properties";
import { getUnitsByProperty, createUnit, deleteUnit } from "../api/units";
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
      } catch (err) {
        console.error("Failed to load properties", err);
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
    } catch (err) {
      console.error("Failed to load units", err);
    }
    setLoadingUnits(false);
  };

  const handlePropertyChange = (e) => {
    const id = e.target.value;
    setSelectedProperty(id);
    loadUnits(id);
  };

  const handleForm = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const submitNewUnit = async (e) => {
    e.preventDefault();
    if (!selectedProperty) return alert("Select a property first.");

    try {
      await createUnit(Number(selectedProperty), {
        unitNumber: form.unitNumber,
        bedrooms: Number(form.bedrooms),
        bathrooms: Number(form.bathrooms),
        rentAmount: Number(form.rentAmount),
      });

      setForm({ unitNumber: "", bedrooms: 1, bathrooms: 1, rentAmount: 0 });
      await loadUnits(selectedProperty);
    } catch (err) {
      console.error("Failed to create unit:", err);
      alert("Failed to create unit.");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this unit?")) return;

    try {
      await deleteUnit(id);
      setUnits((prev) => prev.filter((u) => u.id !== id));
    } catch (err) {
      console.error(err);
      alert("Failed to delete unit.");
    }
  };

  return (
    <div className="page">
      <main className="page-inner">
        <h1 className="page-title">Units</h1>
        <p className="muted">
          {user?.role === "LANDLORD"
            ? "Manage units inside each property."
            : "Units linked to your leases."}
        </p>

        {/* Select Property */}
        <section className="card">
          <label className="field-label">Select Property</label>

          <select
            className="input"
            value={selectedProperty}
            onChange={handlePropertyChange}
          >
            <option value="">Choose a property...</option>
            {properties.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title} — {p.city}
              </option>
            ))}
          </select>
        </section>

        {/* Create Unit */}
        {selectedProperty && user?.role === "LANDLORD" && (
          <section className="card">
            <h2>Add Unit</h2>

            <form className="form-grid" onSubmit={submitNewUnit}>
              <input
                className="input"
                placeholder="Unit Number"
                name="unitNumber"
                value={form.unitNumber}
                onChange={handleForm}
                required
              />

              <input
                className="input"
                type="number"
                name="bedrooms"
                min="0"
                value={form.bedrooms}
                onChange={handleForm}
                placeholder="Bedrooms"
              />

              <input
                className="input"
                type="number"
                name="bathrooms"
                min="0"
                value={form.bathrooms}
                onChange={handleForm}
                placeholder="Bathrooms"
              />

              <input
                className="input"
                type="number"
                name="rentAmount"
                min="0"
                value={form.rentAmount}
                onChange={handleForm}
                placeholder="Rent Amount"
              />

              <button className="btn-primary">Create Unit</button>
            </form>
          </section>
        )}

        {/* Units Table */}
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
                            onClick={() => handleDelete(u.id)}
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
