// src/pages/Properties.jsx
import { useEffect, useState } from "react";
import { getMyProperties, createProperty, updateProperty, deleteProperty } from "../api/properties";
import { getUnitsByProperty, createUnit, updateUnit, deleteUnit } from "../api/units";
import { useAuth } from "../context/AuthContext";
import AddressAutocomplete from "../components/AddressAutocomplete";
import { ChevronDown, ChevronUp, Home, MapPin, Edit2, Trash2, Plus, Building2, DollarSign } from 'lucide-react';

export default function Properties() {
  const { user } = useAuth();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [useAddressSearch, setUseAddressSearch] = useState(true);
  const [expandedProperty, setExpandedProperty] = useState(null);
  const [propertyUnits, setPropertyUnits] = useState({});
  const [loadingUnits, setLoadingUnits] = useState({});
  const [showAddProperty, setShowAddProperty] = useState(false);
  const [recentActivity] = useState([
    { action: 'Property Added', property: '555 apartment', time: '2 hours ago' },
    { action: 'Unit Created', property: 'Ontario Tech University', time: '5 hours ago' },
    { action: 'Property Updated', property: 'Downtown towers', time: '1 day ago' },
  ]);

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

  const loadUnitsForProperty = async (propertyId) => {
    setLoadingUnits(prev => ({ ...prev, [propertyId]: true }));
    try {
      const units = await getUnitsByProperty(propertyId);
      setPropertyUnits(prev => ({ ...prev, [propertyId]: units }));
    } catch (err) {
      console.error("Failed to load units:", err);
    } finally {
      setLoadingUnits(prev => ({ ...prev, [propertyId]: false }));
    }
  };

  const togglePropertyExpand = async (propertyId) => {
    if (expandedProperty === propertyId) {
      setExpandedProperty(null);
    } else {
      setExpandedProperty(propertyId);
      if (!propertyUnits[propertyId]) {
        await loadUnitsForProperty(propertyId);
      }
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
    <div style={{
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
      minHeight: '100vh',
      padding: '2rem'
    }}>
      <div style={{ maxWidth: '1600px', margin: '0 auto' }}>
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
            Properties
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '1rem' }}>Manage your rental properties and their units</p>
        </div>

        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '0.75rem',
            padding: '1rem',
            color: '#fca5a5',
            marginBottom: '1.5rem'
          }}>
            {error}
          </div>
        )}

        {/* Main Layout: Properties + Sidebar */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '1.5rem' }}>
          {/* Properties Section */}
          <div>
            {/* Add Property Button */}
            <button
              onClick={() => setShowAddProperty(!showAddProperty)}
              style={{
                width: '100%',
                padding: '1rem',
                background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.1) 0%, rgba(6, 182, 212, 0.05) 100%)',
                border: '2px dashed rgba(6, 182, 212, 0.3)',
                borderRadius: '1rem',
                color: '#06b6d4',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: 'pointer',
                marginBottom: '1.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                transition: 'all 0.2s'
              }}
            >
              <Plus size={20} />
              {showAddProperty ? 'Cancel' : 'Add New Property'}
            </button>

            {/* Add Property Form */}
            {showAddProperty && (
              <div style={{
                background: 'rgba(255, 255, 255, 0.03)',
                backdropFilter: 'blur(20px)',
                borderRadius: '1.25rem',
                padding: '2rem',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                marginBottom: '1.5rem'
              }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#ffffff', marginBottom: '1rem' }}>
                  {editingId ? 'Edit Property' : 'Add New Property'}
                </h2>
                {editingId && <p style={{ color: '#06b6d4', fontSize: '0.9rem', marginBottom: '1rem' }}>Update the fields below and click Save Changes</p>}
                
                <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <input
                    className="input"
                    name="title"
                    placeholder="Property Title"
                    value={form.title}
                    onChange={handleChange}
                    required
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
                  
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <label style={{ color: '#e2e8f0', fontWeight: '500', fontSize: '0.9rem' }}>
                        {useAddressSearch ? 'Property Address' : 'Property Address (Manual Entry)'}
                      </label>
                      <button
                        type="button"
                        onClick={() => setUseAddressSearch(!useAddressSearch)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#06b6d4',
                          fontSize: '0.85rem',
                          cursor: 'pointer',
                          textDecoration: 'underline'
                        }}
                      >
                        {useAddressSearch ? 'Enter Manually' : 'Use Address Search'}
                      </button>
                    </div>
                    
                    {useAddressSearch ? (
                      <div>
                        <AddressAutocomplete
                          onAddressSelect={handleAddressSelect}
                          defaultValue={form.address}
                        />
                        {form.address && (
                          <div style={{
                            marginTop: '0.5rem',
                            padding: '0.75rem',
                            background: 'rgba(6, 182, 212, 0.1)',
                            border: '1px solid rgba(6, 182, 212, 0.3)',
                            borderRadius: '0.5rem',
                            fontSize: '0.85rem',
                            color: '#67e8f9'
                          }}>
                            <div><strong>Selected:</strong> {form.address}</div>
                            <div style={{ color: '#94a3b8' }}>{form.city}, {form.province} {form.postalCode}</div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        <input
                          className="input"
                          name="address"
                          placeholder="Street Address"
                          value={form.address}
                          onChange={handleChange}
                          required
                          style={{
                            width: '100%',
                            padding: '0.75rem 1rem',
                            background: 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: '0.5rem',
                            color: '#ffffff'
                          }}
                        />
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                          <input
                            className="input"
                            name="city"
                            placeholder="City"
                            value={form.city}
                            onChange={handleChange}
                            required
                            style={{
                              padding: '0.75rem 1rem',
                              background: 'rgba(255, 255, 255, 0.05)',
                              border: '1px solid rgba(255, 255, 255, 0.1)',
                              borderRadius: '0.5rem',
                              color: '#ffffff'
                            }}
                          />
                          <input
                            className="input"
                            name="province"
                            placeholder="Province"
                            value={form.province}
                            onChange={handleChange}
                            required
                            style={{
                              padding: '0.75rem 1rem',
                              background: 'rgba(255, 255, 255, 0.05)',
                              border: '1px solid rgba(255, 255, 255, 0.1)',
                              borderRadius: '0.5rem',
                              color: '#ffffff'
                            }}
                          />
                        </div>
                        <input
                          className="input"
                          name="postalCode"
                          placeholder="Postal Code"
                          value={form.postalCode}
                          onChange={handleChange}
                          required
                          style={{
                            width: '100%',
                            padding: '0.75rem 1rem',
                            background: 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: '0.5rem',
                            color: '#ffffff'
                          }}
                        />
                      </div>
                    )}
                  </div>

                  <textarea
                    className="input"
                    name="description"
                    placeholder="Description (optional)"
                    value={form.description}
                    onChange={handleChange}
                    rows={3}
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '0.5rem',
                      color: '#ffffff',
                      resize: 'vertical'
                    }}
                  />
                  
                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button
                      type="submit"
                      disabled={creating}
                      style={{
                        flex: 1,
                        padding: '0.75rem 1.5rem',
                        background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
                        border: 'none',
                        borderRadius: '0.5rem',
                        color: '#ffffff',
                        fontSize: '1rem',
                        fontWeight: '600',
                        cursor: creating ? 'not-allowed' : 'pointer',
                        opacity: creating ? 0.6 : 1
                      }}
                    >
                      {creating ? (editingId ? 'Updating...' : 'Creating...') : (editingId ? 'Save Changes' : 'Create Property')}
                    </button>
                    {editingId && (
                      <button
                        type="button"
                        onClick={handleCancelEdit}
                        style={{
                          padding: '0.75rem 1.5rem',
                          background: 'rgba(255, 255, 255, 0.05)',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          borderRadius: '0.5rem',
                          color: '#94a3b8',
                          fontSize: '1rem',
                          fontWeight: '600',
                          cursor: 'pointer'
                        }}
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </form>
              </div>
            )}

            {/* Properties List */}
            {loading ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                <div className="loader" style={{ margin: '0 auto 1rem' }} />
                <p>Loading properties...</p>
              </div>
            ) : properties.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '3rem',
                background: 'rgba(255, 255, 255, 0.03)',
                borderRadius: '1rem',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}>
                <Building2 size={48} color="#94a3b8" style={{ margin: '0 auto 1rem' }} />
                <p style={{ color: '#94a3b8', fontSize: '1.1rem' }}>No properties yet. Add your first property to get started!</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {properties.map((property) => (
                  <div
                    key={property.id}
                    style={{
                      background: 'rgba(255, 255, 255, 0.03)',
                      backdropFilter: 'blur(20px)',
                      borderRadius: '1.25rem',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      overflow: 'hidden',
                      transition: 'all 0.3s'
                    }}
                  >
                    {/* Property Header */}
                    <div style={{
                      padding: '1.5rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      borderBottom: expandedProperty === property.id ? '1px solid rgba(255, 255, 255, 0.1)' : 'none'
                    }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                          <div style={{
                            width: '3rem',
                            height: '3rem',
                            borderRadius: '0.75rem',
                            background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}>
                            <Home size={24} color="white" />
                          </div>
                          <div>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#ffffff', margin: 0 }}>
                              {property.title}
                            </h3>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#94a3b8', fontSize: '0.9rem', marginTop: '0.25rem' }}>
                              <MapPin size={14} />
                              <span>{property.address}, {property.city}</span>
                            </div>
                          </div>
                        </div>
                        {property.description && (
                          <p style={{ color: '#cbd5e1', fontSize: '0.9rem', margin: '0.5rem 0 0 0', paddingLeft: '4rem' }}>
                            {property.description}
                          </p>
                        )}
                      </div>
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <button
                          onClick={() => {
                            handleEdit(property);
                            setShowAddProperty(true);
                          }}
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
                            fontSize: '0.9rem',
                            fontWeight: '600'
                          }}
                        >
                          <Edit2 size={16} />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(property.id)}
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
                            fontSize: '0.9rem',
                            fontWeight: '600'
                          }}
                        >
                          <Trash2 size={16} />
                          Delete
                        </button>
                        <button
                          onClick={() => togglePropertyExpand(property.id)}
                          style={{
                            padding: '0.5rem',
                            background: 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: '0.5rem',
                            color: '#e2e8f0',
                            display: 'flex',
                            alignItems: 'center',
                            cursor: 'pointer'
                          }}
                        >
                          {expandedProperty === property.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                        </button>
                      </div>
                    </div>

                    {/* Units Section (Expandable) */}
                    {expandedProperty === property.id && (
                      <div style={{ padding: '1.5rem', background: 'rgba(0, 0, 0, 0.2)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                          <h4 style={{ fontSize: '1.1rem', fontWeight: '600', color: '#e2e8f0', margin: 0 }}>
                            Units in this Property
                          </h4>
                          <button
                            onClick={() => alert('Add unit functionality - Coming soon!')}
                            style={{
                              padding: '0.5rem 1rem',
                              background: 'rgba(16, 185, 129, 0.1)',
                              border: '1px solid rgba(16, 185, 129, 0.3)',
                              borderRadius: '0.5rem',
                              color: '#10b981',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.5rem',
                              cursor: 'pointer',
                              fontSize: '0.875rem',
                              fontWeight: '600'
                            }}
                          >
                            <Plus size={16} />
                            Add Unit
                          </button>
                        </div>

                        {loadingUnits[property.id] ? (
                          <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
                            <div className="loader" style={{ margin: '0 auto 0.5rem' }} />
                            <p>Loading units...</p>
                          </div>
                        ) : !propertyUnits[property.id] || propertyUnits[property.id].length === 0 ? (
                          <div style={{
                            textAlign: 'center',
                            padding: '2rem',
                            background: 'rgba(255, 255, 255, 0.02)',
                            borderRadius: '0.75rem',
                            border: '1px dashed rgba(255, 255, 255, 0.1)'
                          }}>
                            <p style={{ color: '#94a3b8' }}>No units yet. Add your first unit to this property.</p>
                          </div>
                        ) : (
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem' }}>
                            {propertyUnits[property.id].map((unit) => (
                              <div
                                key={unit.id}
                                style={{
                                  padding: '1rem',
                                  background: 'rgba(255, 255, 255, 0.05)',
                                  border: '1px solid rgba(255, 255, 255, 0.1)',
                                  borderRadius: '0.75rem'
                                }}
                              >
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                                  <span style={{
                                    padding: '0.25rem 0.75rem',
                                    background: unit.status === 'AVAILABLE' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                                    color: unit.status === 'AVAILABLE' ? '#6ee7b7' : '#fdba74',
                                    borderRadius: '9999px',
                                    fontSize: '0.75rem',
                                    fontWeight: '700'
                                  }}>
                                    {unit.status}
                                  </span>
                                </div>
                                <h5 style={{ fontSize: '1rem', fontWeight: '600', color: '#ffffff', marginBottom: '0.5rem' }}>
                                  Unit {unit.unitNumber}
                                </h5>
                                <div style={{ color: '#94a3b8', fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                                  {unit.bedrooms} bed • {unit.bathrooms} bath
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#06b6d4', fontWeight: '700', fontSize: '1rem' }}>
                                  <DollarSign size={16} />
                                  {unit.rent ? `${parseFloat(unit.rent).toLocaleString()}/mo` : 'N/A'}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar - Recent Activity */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.03)',
            backdropFilter: 'blur(20px)',
            borderRadius: '1.25rem',
            padding: '1.5rem',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            height: 'fit-content',
            position: 'sticky',
            top: '2rem'
          }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#ffffff', marginBottom: '1rem' }}>
              Recent Activity
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {recentActivity.map((activity, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: '0.75rem',
                    background: 'rgba(255, 255, 255, 0.03)',
                    borderRadius: '0.5rem',
                    borderLeft: '3px solid #06b6d4'
                  }}
                >
                  <div style={{ fontSize: '0.9rem', fontWeight: '600', color: '#e2e8f0', marginBottom: '0.25rem' }}>
                    {activity.action}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
                    {activity.property}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>
                    {activity.time}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
