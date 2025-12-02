// src/pages/Properties.jsx
import { useEffect, useState } from "react";
import { getMyProperties, createProperty, updateProperty, deleteProperty } from "../api/properties";
import { useAuth } from "../context/AuthContext";
import AddressAutocomplete from "../components/AddressAutocomplete";

export default function Properties() {
  const { user } = useAuth();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [useAddressSearch, setUseAddressSearch] = useState(true); // Default to address search

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

  const handleAddressSelect = (addressData) => {
    setForm((f) => ({
      ...f,
      address: addressData.address,
      city: addressData.city,
      province: addressData.province,
      postalCode: addressData.postalCode,
    }));
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    
    // Validation: Check all required fields
    if (!form.title || !form.address || !form.city || !form.province || !form.postalCode) {
      setError("Please fill in all required fields: Title, Address, City, Province, and Postal Code.");
      return;
    }
    
    setCreating(true);
    setError("");
    try {
      if (editingId) {
        // Update existing property
        await updateProperty(editingId, form);
        alert("Property updated successfully!");
        setEditingId(null);
      } else {
        // Create new property
        await createProperty(form);
        alert("Property created successfully!");
      }
      
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
      console.error("Property operation error:", err);
      setError(editingId ? "Failed to update property." : "Failed to create property.");
    } finally {
      setCreating(false);
    }
  };

  const handleEdit = (property) => {
    setForm({
      title: property.title,
      address: property.address,
      city: property.city,
      province: property.province,
      postalCode: property.postalCode,
      description: property.description || "",
    });
    setEditingId(property.id);
    setError("");
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setForm({
      title: "",
      address: "",
      city: "",
      province: "",
      postalCode: "",
      description: "",
    });
    setError("");
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this property? This action cannot be undone.")) return;
    try {
      await deleteProperty(id);
      setProperties((props) => props.filter((p) => p.id !== id));
      alert("Property deleted successfully!");
    } catch (err) {
      console.error("Delete error:", err);
      alert(err.response?.data?.error || "Failed to delete property. It may have associated units or leases.");
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
            <h2>{editingId ? "Edit Property" : "Add Property"}</h2>
            {editingId && <p className="muted" style={{ color: '#06b6d4' }}>Editing property - Update the fields below and click Update Property</p>}
            <form className="form-grid" onSubmit={handleCreate}>
              <input className="input" name="title" placeholder="Title" value={form.title} onChange={handleChange} required />
              
              {/* Address Search Toggle */}
              <div style={{ gridColumn: '1 / -1' }}>
                {useAddressSearch ? (
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <label style={{ fontWeight: '500', fontSize: '0.9rem' }}>Property Address</label>
                      <button
                        type="button"
                        className="btn-link"
                        onClick={() => setUseAddressSearch(false)}
                        style={{ fontSize: '0.85rem' }}
                      >
                        ✏️ Enter Manually Instead
                      </button>
                    </div>
                    <AddressAutocomplete
                      onAddressSelect={handleAddressSelect}
                      defaultValue={form.address}
                    />
                    {(form.address || form.city) && (
                      <div style={{ marginTop: '0.5rem', padding: '0.75rem', background: 'rgba(6, 182, 212, 0.1)', border: '1px solid rgba(6, 182, 212, 0.3)', borderRadius: '0.5rem', fontSize: '0.85rem' }}>
                        <strong style={{ color: '#06b6d4' }}>✓ Selected Address:</strong>
                        <div style={{ marginTop: '0.25rem' }}>{form.address}</div>
                        <div style={{ color: '#64748b' }}>{form.city}, {form.province} {form.postalCode}</div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <label style={{ fontWeight: '500', fontSize: '0.9rem' }}>Property Address (Manual Entry)</label>
                      <button
                        type="button"
                        className="btn-link"
                        onClick={() => setUseAddressSearch(true)}
                        style={{ fontSize: '0.85rem' }}
                      >
                        📍 Use Address Search Instead
                      </button>
                    </div>
                    <div style={{ display: 'grid', gap: '0.75rem' }}>
                      <input className="input" name="address" placeholder="Street Address" value={form.address} onChange={handleChange} required />
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                        <input className="input" name="city" placeholder="City" value={form.city} onChange={handleChange} required />
                        <input className="input" name="province" placeholder="Province" value={form.province} onChange={handleChange} required />
                      </div>
                      <input className="input" name="postalCode" placeholder="Postal Code" value={form.postalCode} onChange={handleChange} required />
                    </div>
                  </div>
                )}
              </div>

              {/* Hidden fields for autocomplete - only show in manual mode */}
              {useAddressSearch && form.address && (
                <>
                  <input type="hidden" name="city" value={form.city} />
                  <input type="hidden" name="province" value={form.province} />
                  <input type="hidden" name="postalCode" value={form.postalCode} />
                </>
              )}
              
              <textarea className="input" name="description" placeholder="Description (optional)" value={form.description} onChange={handleChange} style={{ gridColumn: '1 / -1' }} />
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button className="btn-primary" disabled={creating}>
                  {creating ? (editingId ? "Updating..." : "Creating...") : (editingId ? "Update Property" : "Create Property")}
                </button>
                {editingId && (
                  <button type="button" className="btn-secondary" onClick={handleCancelEdit}>
                    Cancel Edit
                  </button>
                )}
              </div>
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
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {properties.map((p) => (
                      <tr key={p.id} className={editingId === p.id ? 'editing-row' : ''}>
                        <td>{p.title}</td>
                        <td>{p.address}</td>
                        <td>{p.city}</td>
                        <td>{p.province}</td>
                        <td>{p.postalCode}</td>
                        <td>
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button className="btn-link" onClick={() => handleEdit(p)} style={{ color: '#06b6d4' }}>
                              Edit
                            </button>
                            <button className="btn-link danger" onClick={() => handleDelete(p.id)}>
                              Delete
                            </button>
                          </div>
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
