// src/pages/Tenants.jsx
import { useEffect, useState } from "react";
import { getTenants, deleteTenant } from "../api/tenants";
import { Users, Trash2, Mail, Phone, AlertCircle } from 'lucide-react';

export default function Tenants() {
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadTenants = async () => {
    setLoading(true);
    try {
      const data = await getTenants();
      setTenants(data);
    } catch (err) {
      setError("Failed to load tenants.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTenants();
  }, []);

  const handleDelete = async (tenantId, tenantName) => {
    if (!window.confirm(`Are you sure you want to delete ${tenantName}? This action cannot be undone.`)) {
      return;
    }

    try {
      await deleteTenant(tenantId);
      alert("Tenant deleted successfully!");
      await loadTenants();
    } catch (err) {
      const errorMsg = err.response?.data?.detail || "Failed to delete tenant.";
      alert(errorMsg);
    }
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '60vh',
        flexDirection: 'column',
        gap: '1rem'
      }}>
        <div className="loader" />
        <p style={{ color: '#94a3b8' }}>Loading tenants...</p>
      </div>
    );
  }

  return (
    <div style={{ 
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)', 
      minHeight: '100vh', 
      padding: '2rem'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
            <Users size={32} style={{ color: '#06b6d4' }} />
            <h1 style={{ 
              fontSize: '2rem', 
              fontWeight: '800', 
              color: '#ffffff',
              margin: 0
            }}>
              Tenant Management
            </h1>
          </div>
          <p style={{ color: '#94a3b8', fontSize: '0.95rem' }}>
            Manage your tenant list and remove inactive tenants
          </p>
        </div>

        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '12px',
            padding: '1rem',
            marginBottom: '1.5rem',
            color: '#fca5a5',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem'
          }}>
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}

        {/* Tenants Grid */}
        {tenants.length === 0 ? (
          <div style={{
            background: 'rgba(255, 255, 255, 0.03)',
            backdropFilter: 'blur(20px)',
            borderRadius: '1.25rem',
            padding: '3rem',
            textAlign: 'center',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            <Users size={48} style={{ color: '#475569', margin: '0 auto 1rem' }} />
            <p style={{ color: '#94a3b8', fontSize: '1.1rem' }}>
              No tenants found
            </p>
          </div>
        ) : (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', 
            gap: '1.5rem'
          }}>
            {tenants.map((tenant) => (
              <div
                key={tenant.id}
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  backdropFilter: 'blur(20px)',
                  borderRadius: '1.25rem',
                  padding: '1.5rem',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  transition: 'all 0.3s ease',
                  position: 'relative'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(6, 182, 212, 0.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                {/* Tenant Info */}
                <div style={{ marginBottom: '1rem' }}>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '0.75rem',
                    marginBottom: '0.75rem'
                  }}>
                    <div style={{
                      width: '3rem',
                      height: '3rem',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.25rem',
                      fontWeight: '700',
                      color: '#ffffff'
                    }}>
                      {tenant.user?.name?.charAt(0).toUpperCase() || 'T'}
                    </div>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ 
                        fontSize: '1.1rem', 
                        fontWeight: '700', 
                        color: '#ffffff',
                        margin: 0,
                        marginBottom: '0.25rem'
                      }}>
                        {tenant.user?.name || 'Unknown'}
                      </h3>
                      <span style={{
                        fontSize: '0.75rem',
                        color: '#06b6d4',
                        fontWeight: '600',
                        padding: '0.25rem 0.5rem',
                        background: 'rgba(6, 182, 212, 0.1)',
                        borderRadius: '6px'
                      }}>
                        ID: {tenant.id}
                      </span>
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div style={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    gap: '0.5rem',
                    marginTop: '1rem'
                  }}>
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '0.5rem',
                      color: '#94a3b8',
                      fontSize: '0.875rem'
                    }}>
                      <Mail size={16} style={{ color: '#06b6d4' }} />
                      <span>{tenant.user?.email || 'No email'}</span>
                    </div>
                    {tenant.phone && (
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '0.5rem',
                        color: '#94a3b8',
                        fontSize: '0.875rem'
                      }}>
                        <Phone size={16} style={{ color: '#06b6d4' }} />
                        <span>{tenant.phone}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Delete Button */}
                <button
                  onClick={() => handleDelete(tenant.id, tenant.user?.name)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    borderRadius: '8px',
                    color: '#fca5a5',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)';
                    e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.5)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
                    e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.3)';
                  }}
                >
                  <Trash2 size={16} />
                  Delete Tenant
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
