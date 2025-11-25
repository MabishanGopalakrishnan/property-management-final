// src/pages/Properties.jsx
import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { getMyProperties, createProperty, deleteProperty } from "../api/properties";
import { useAuth } from "../context/AuthContext";

export default function Properties() {
  const { user } = useAuth();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    title: "",
    address: "",
    city: "",
    province: "",
    postalCode: "",
    description: "",
  });
  const [error, setError] = useState("");

  const loadProps = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getMyProperties();
      setProperties(data);
    } catch (err) {
      console.error(err);
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
    setError("");
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
      console.error(err);
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
      console.error(err);
      alert("Failed to delete property.");
    }
  };

  return (
    <div className="page">
      <Navbar />
      <main className="page-inner">
        <h1 className="page-title">Properties</h1>
        <p className="muted">
          {user?.role === "LANDLORD"
            ? "Create and manage your rental properties."
            : "View properties associated with your leases."}
        </p>

        {error && <div className="alert error">{error}</div>}

        <section className="layout-grid">
          {user?.role === "LANDLORD" && (
            <div className="card">
              <h2>Add Property</h2>
              <form className="form-grid" onSubmit={handleCreate}>
                <input
                  className="input"
                  placeholder="Title"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  required
                />
                <input
                  className="input"
                  placeholder="Address"
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  required
                />
                <input
                  className="input"
                  placeholder="City"
                  name="city"
                  value={form.city}
                  onChange={handleChange}
                  required
                />
                <input
                  className="input"
                  placeholder="Province"
                  name="province"
                  value={form.province}
                  onChange={handleChange}
                  required
                />
                <input
                  className="input"
                  placeholder="Postal Code"
                  name="postalCode"
                  value={form.postalCode}
                  onChange={handleChange}
                  required
                />
                <textarea
                  className="input"
                  placeholder="Description (optional)"
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows={3}
                />
                <button className="btn-primary" disabled={creating}>
                  {creating ? "Creating..." : "Create Property"}
                </button>
              </form>
            </div>
          )}

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
                      {user?.role === "LANDLORD" && <th />}
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
                        {user?.role === "LANDLORD" && (
                          <td>
                            <button
                              className="btn-link danger"
                              onClick={() => handleDelete(p.id)}
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
          </div>
        </section>
      </main>
    </div>
  );
}
