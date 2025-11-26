// src/pages/Properties.jsx
import { useEffect, useState } from "react";
import { getMyProperties, createProperty, deleteProperty } from "../api/properties";
import { useAuth } from "../context/AuthContext";

export default function Properties() {
  const { user } = useAuth();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    title: "",
    address: "",
    city: "",
    province: "",
    postalCode: "",
    description: "",
  });

  const loadProps = async () => {
    setLoading(true);
    try {
      const data = await getMyProperties();
      setProperties(data);
    } catch (err) {
      setError("Failed to load properties.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProps();
  }, []);

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      await createProperty(form);
      setForm({
        title: "",
        address: "",
        city: "",
        province: "",
        postalCode: "",
        description: "",
      });
      await loadProps();
    } catch (err) {
      setError("Failed to create property.");
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this property?")) return;
    try {
      await deleteProperty(id);
      setProperties((props) => props.filter((p) => p.id !== id));
    } catch (err) {
      alert("Failed to delete property.");
    }
  };

  return (
    <div className="page">
      <main className="page-inner">
        <h1 className="page-title">Properties</h1>
        <p className="muted">Manage all your rental properties.</p>

        {error && <div className="alert error">{error}</div>}

        <section className="layout-grid">
          <div className="card">
            <h2>Add Property</h2>
            <form className="form-grid" onSubmit={handleCreate}>
              <input className="input" name="title" placeholder="Title" value={form.title} onChange={handleChange} required />
              <input className="input" name="address" placeholder="Address" value={form.address} onChange={handleChange} required />
              <input className="input" name="city" placeholder="City" value={form.city} onChange={handleChange} required />
              <input className="input" name="province" placeholder="Province" value={form.province} onChange={handleChange} required />
              <input className="input" name="postalCode" placeholder="Postal Code" value={form.postalCode} onChange={handleChange} required />
              <textarea className="input" name="description" placeholder="Description (optional)" value={form.description} onChange={handleChange} />
              <button className="btn-primary" disabled={creating}>{creating ? "Creating..." : "Create Property"}</button>
            </form>
          </div>

          <div className="card">
            <h2>Your Properties</h2>
            {loading ? (
              <p>Loading...</p>
            ) : properties.length === 0 ? (
              <p className="muted">No properties yet.</p>
            ) : (
              <div className="table-wrapper">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Address</th>
                      <th>City</th>
                      <th>Province</th>
                      <th>Postal</th>
                      <th />
                    </tr>
                  </thead>
                  <tbody>
                    {properties.map((p) => (
                      <tr key={p.id}>
                        <td>{p.title}</td>
                        <td>{p.address}</td>
                        <td>{p.city}</td>
                        <td>{p.province}</td>
                        <td>{p.postalCode}</td>
                        <td>
                          <button className="btn-link danger" onClick={() => handleDelete(p.id)}>Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
