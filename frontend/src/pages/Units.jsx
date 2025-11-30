// src/pages/Units.jsx
import { useEffect, useState } from "react";
import { getMyProperties } from "../api/properties";
import { getUnitsByProperty, createUnit, updateUnit, deleteUnit } from "../api/units";
import { useAuth } from "../context/AuthContext";
import { Home, Bed, Bath, Plus, Edit2, Trash2, ChevronDown, Users } from 'lucide-react';

export default function Units() {
  const { user } = useAuth();
  const [properties, setProperties] = useState([]);
  const [selectedProperty, setSelectedProperty] = useState("");
  const [units, setUnits] = useState([]);
  const [loadingUnits, setLoadingUnits] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);

  const [form, setForm] = useState({
    unitNumber: "",
    bedrooms: "",
    bathrooms: "",
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
      if (editingId) {
        // Update existing unit
        await updateUnit(editingId, {
          unitNumber: form.unitNumber,
          bedrooms: form.bedrooms ? Number(form.bedrooms) : null,
          bathrooms: form.bathrooms ? Number(form.bathrooms) : null,
        });
        alert("Unit updated successfully!");
        setEditingId(null);
      } else {
        // Create new unit
        await createUnit(Number(selectedProperty), {
          unitNumber: form.unitNumber,
          bedrooms: form.bedrooms ? Number(form.bedrooms) : null,
          bathrooms: form.bathrooms ? Number(form.bathrooms) : null,
        });
        alert("Unit created successfully!");
      }

      setForm({ unitNumber: "", bedrooms: "", bathrooms: "" });
      await loadUnits(selectedProperty);
    } catch (err) {
      console.error("Failed to save unit:", err);
      alert(editingId ? "Failed to update unit." : "Failed to create unit.");
    }
  };

  const handleEdit = (unit) => {
    setForm({
      unitNumber: unit.unitNumber,
      bedrooms: unit.bedrooms || "",
      bathrooms: unit.bathrooms || "",
    });
    setEditingId(unit.id);
    setShowAddForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setForm({ unitNumber: "", bedrooms: "", bathrooms: "" });
    setShowAddForm(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this unit? This action cannot be undone.")) return;

    try {
      await deleteUnit(id);
      setUnits((prev) => prev.filter((u) => u.id !== id));
      alert("Unit deleted successfully!");
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || "Failed to delete unit. It may have associated leases.");
    }
  };

  return (
    <div style={{
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
      minHeight: '100vh',
      padding: '2rem'
    }}>
      <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideDown {
          from { max-height: 0; opacity: 0; }
          to { max-height: 500px; opacity: 1; }
        }
        .unit-row {
          animation: slideIn 0.3s ease-out forwards;
          transition: all 0.3s ease;
        }
        .unit-row:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 16px rgba(6, 182, 212, 0.2);
        }
      `}</style>

      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{
            fontSize: '2.5rem',
            fontWeight: '800',
            background: 'linear-gradient(135deg, #ffffff 0%, #06b6d4 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            marginBottom: '0.5rem'
          }}>
            Units Management
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '1rem' }}>
            Manage units across your properties
          </p>
        </div>

        {/* Property Selector Card */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.03)',
          backdropFilter: 'blur(20px)',
          borderRadius: '1.25rem',
          padding: '1.5rem',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          marginBottom: '1.5rem'
        }}>
          <label style={{
            display: 'block',
            color: '#e2e8f0',
            fontSize: '0.95rem',
            fontWeight: '600',
            marginBottom: '0.75rem'
          }}>
            Select Property
          </label>
          <div style={{ position: 'relative' }}>
            <select
              value={selectedProperty}
              onChange={handlePropertyChange}
              style={{
                width: '100%',
                padding: '0.875rem 3rem 0.875rem 1rem',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '0.75rem',
                color: '#ffffff',
                fontSize: '1rem',
                fontWeight: '500',
                cursor: 'pointer',
                appearance: 'none'
              }}
            >
              <option value="">Choose a property...</option>
              {properties.map((p) => (
                <option key={p.id} value={p.id} style={{ background: '#1e293b' }}>
                  {p.title} — {p.city}
                </option>
              ))}
            </select>
            <ChevronDown 
              size={20} 
              style={{
                position: 'absolute',
                right: '1rem',
                top: '50%',
                transform: 'translateY(-50%)',
                pointerEvents: 'none',
                color: '#94a3b8'
              }}
            />
          </div>
        </div>

        {/* Add Unit Button & Form */}
        {selectedProperty && user?.role === "LANDLORD" && (
          <div style={{ marginBottom: '1.5rem' }}>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              style={{
                width: '100%',
                padding: '1rem',
                background: showAddForm ? 'rgba(6, 182, 212, 0.1)' : 'linear-gradient(135deg, rgba(6, 182, 212, 0.1) 0%, rgba(6, 182, 212, 0.05) 100%)',
                border: showAddForm ? '2px solid rgba(6, 182, 212, 0.5)' : '2px dashed rgba(6, 182, 212, 0.3)',
                borderRadius: '1rem',
                color: '#06b6d4',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                transition: 'all 0.2s'
              }}
            >
              <Plus size={20} />
              {showAddForm ? (editingId ? 'Cancel Edit' : 'Cancel') : (editingId ? 'Edit Unit' : 'Add New Unit')}
            </button>

            {showAddForm && (
              <div style={{
                marginTop: '1rem',
                background: 'rgba(255, 255, 255, 0.03)',
                backdropFilter: 'blur(20px)',
                borderRadius: '1.25rem',
                padding: '2rem',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                animation: 'slideDown 0.3s ease-out'
              }}>
                <h3 style={{
                  fontSize: '1.25rem',
                  fontWeight: '700',
                  color: '#ffffff',
                  marginBottom: '1.5rem'
                }}>
                  {editingId ? 'Edit Unit' : 'Add New Unit'}
                </h3>

                <form onSubmit={submitNewUnit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', color: '#cbd5e1', fontSize: '0.875rem', marginBottom: '0.5rem', fontWeight: '500' }}>
                        Unit Number *
                      </label>
                      <input
                        name="unitNumber"
                        value={form.unitNumber}
                        onChange={handleForm}
                        required
                        placeholder="e.g., 101"
                        style={{
                          width: '100%',
                          padding: '0.75rem 1rem',
                          background: 'rgba(255, 255, 255, 0.05)',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          borderRadius: '0.5rem',
                          color: '#ffffff',
                          fontSize: '1rem'
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', color: '#cbd5e1', fontSize: '0.875rem', marginBottom: '0.5rem', fontWeight: '500' }}>
                        Bedrooms
                      </label>
                      <input
                        type="number"
                        name="bedrooms"
                        min="0"
                        value={form.bedrooms}
                        onChange={handleForm}
                        placeholder="0"
                        style={{
                          width: '100%',
                          padding: '0.75rem 1rem',
                          background: 'rgba(255, 255, 255, 0.05)',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          borderRadius: '0.5rem',
                          color: '#ffffff',
                          fontSize: '1rem'
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', color: '#cbd5e1', fontSize: '0.875rem', marginBottom: '0.5rem', fontWeight: '500' }}>
                        Bathrooms
                      </label>
                      <input
                        type="number"
                        name="bathrooms"
                        min="0"
                        value={form.bathrooms}
                        onChange={handleForm}
                        placeholder="0"
                        style={{
                          width: '100%',
                          padding: '0.75rem 1rem',
                          background: 'rgba(255, 255, 255, 0.05)',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          borderRadius: '0.5rem',
                          color: '#ffffff',
                          fontSize: '1rem'
                        }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                    <button
                      type="submit"
                      style={{
                        flex: 1,
                        padding: '0.875rem 1.5rem',
                        background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
                        border: 'none',
                        borderRadius: '0.75rem',
                        color: '#ffffff',
                        fontSize: '1rem',
                        fontWeight: '600',
                        cursor: 'pointer'
                      }}
                    >
                      {editingId ? 'Update Unit' : 'Create Unit'}
                    </button>
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      style={{
                        padding: '0.875rem 1.5rem',
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '0.75rem',
                        color: '#94a3b8',
                        fontSize: '1rem',
                        fontWeight: '600',
                        cursor: 'pointer'
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        )}

        {/* Units Table */}
        {selectedProperty && (
          <div style={{
            background: 'rgba(255, 255, 255, 0.03)',
            backdropFilter: 'blur(20px)',
            borderRadius: '1.25rem',
            padding: '2rem',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: '700',
              color: '#ffffff',
              marginBottom: '1.5rem'
            }}>
              Units
            </h2>

            {loadingUnits ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                <div className="loader" style={{ margin: '0 auto 1rem' }} />
                <p>Loading units...</p>
              </div>
            ) : units.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '3rem',
                background: 'rgba(255, 255, 255, 0.02)',
                borderRadius: '1rem',
                border: '1px dashed rgba(255, 255, 255, 0.1)'
              }}>
                <Home size={48} color="#94a3b8" style={{ margin: '0 auto 1rem' }} />
                <p style={{ color: '#94a3b8', fontSize: '1.1rem' }}>
                  No units for this property yet. Add your first unit!
                </p>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 0.5rem' }}>
                  <thead>
                    <tr>
                      <th style={{ textAlign: 'left', padding: '0.75rem 1rem', color: '#94a3b8', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Unit
                      </th>
                      <th style={{ textAlign: 'left', padding: '0.75rem 1rem', color: '#94a3b8', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Bedrooms
                      </th>
                      <th style={{ textAlign: 'left', padding: '0.75rem 1rem', color: '#94a3b8', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Bathrooms
                      </th>
                      <th style={{ textAlign: 'left', padding: '0.75rem 1rem', color: '#94a3b8', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Occupancy
                      </th>
                      {user?.role === "LANDLORD" && (
                        <th style={{ textAlign: 'right', padding: '0.75rem 1rem', color: '#94a3b8', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          Actions
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {units.map((unit, idx) => (
                      <tr
                        key={unit.id}
                        className="unit-row"
                        style={{
                          background: editingId === unit.id ? 'rgba(6, 182, 212, 0.1)' : 'rgba(255, 255, 255, 0.03)',
                          borderRadius: '0.75rem',
                          animationDelay: `${idx * 0.05}s`
                        }}
                      >
                        <td style={{ padding: '1rem', borderRadius: '0.75rem 0 0 0.75rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div style={{
                              width: '2.5rem',
                              height: '2.5rem',
                              borderRadius: '0.5rem',
                              background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}>
                              <Home size={18} color="white" />
                            </div>
                            <span style={{ color: '#e2e8f0', fontWeight: '600', fontSize: '1rem' }}>
                              Unit {unit.unitNumber}
                            </span>
                          </div>
                        </td>
                        <td style={{ padding: '1rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#cbd5e1' }}>
                            <Bed size={16} color="#94a3b8" />
                            <span>{unit.bedrooms || "0"}</span>
                          </div>
                        </td>
                        <td style={{ padding: '1rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#cbd5e1' }}>
                            <Bath size={16} color="#94a3b8" />
                            <span>{unit.bathrooms || "0"}</span>
                          </div>
                        </td>
                        <td style={{ padding: '1rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <div style={{
                              width: '10px',
                              height: '10px',
                              borderRadius: '50%',
                              background: unit.status === 'AVAILABLE' ? '#10b981' : '#f59e0b',
                              boxShadow: unit.status === 'AVAILABLE' ? '0 0 8px rgba(16, 185, 129, 0.6)' : '0 0 8px rgba(245, 158, 11, 0.6)'
                            }}></div>
                            <span style={{
                              color: unit.status === 'AVAILABLE' ? '#6ee7b7' : '#fdba74',
                              fontSize: '0.875rem',
                              fontWeight: '600'
                            }}>
                              {unit.status === 'AVAILABLE' ? 'Available' : 'Occupied'}
                            </span>
                          </div>
                        </td>
                        {user?.role === "LANDLORD" && (
                          <td style={{ padding: '1rem', borderRadius: '0 0.75rem 0.75rem 0', textAlign: 'right' }}>
                            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                              <button
                                onClick={() => handleEdit(unit)}
                                style={{
                                  padding: '0.5rem 1rem',
                                  background: 'rgba(6, 182, 212, 0.1)',
                                  border: '1px solid rgba(6, 182, 212, 0.3)',
                                  borderRadius: '0.5rem',
                                  color: '#06b6d4',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '0.5rem',
                                  cursor: 'pointer',
                                  fontSize: '0.875rem',
                                  fontWeight: '600'
                                }}
                              >
                                <Edit2 size={14} />
                                Edit
                              </button>
                              <button
                                onClick={() => handleDelete(unit.id)}
                                style={{
                                  padding: '0.5rem 1rem',
                                  background: 'rgba(239, 68, 68, 0.1)',
                                  border: '1px solid rgba(239, 68, 68, 0.3)',
                                  borderRadius: '0.5rem',
                                  color: '#ef4444',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '0.5rem',
                                  cursor: 'pointer',
                                  fontSize: '0.875rem',
                                  fontWeight: '600'
                                }}
                              >
                                <Trash2 size={14} />
                                Delete
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
