// src/pages/Leases.jsx
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { getMyProperties } from "../api/properties";
import { getUnitsByProperty } from "../api/units";
import { getTenants } from "../api/tenants";
import { createLease, getLeasesByProperty, deleteLease } from "../api/leases";
import { FileText, Users, Calendar, DollarSign, Home, X, Plus, Trash2, ChevronDown } from 'lucide-react';

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
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedLease, setSelectedLease] = useState(null);

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

    try {
      // Convert date strings to ISO datetime format
      const startDateTime = startDate ? new Date(startDate).toISOString() : null;
      const endDateTime = endDate ? new Date(endDate).toISOString() : null;

      await createLease({
        unitId: Number(selectedUnit),
        tenantId: Number(selectedTenant),
        startDate: startDateTime,
        endDate: endDateTime,
        rent: Number(rentAmount),
      });

      setSelectedUnit("");
      setSelectedTenant("");
      setStartDate("");
      setEndDate("");
      setRentAmount("");
      setShowAddForm(false);

      const newList = await getLeasesByProperty(selectedProperty);
      setLeases(newList);
      alert("Lease created successfully!");
    } catch (err) {
      console.error("Failed to create lease:", err);
      alert("Failed to create lease.");
    }
  };

  const handleDeleteLease = async (id) => {
    if (!confirm("Delete this lease?")) return;
    await deleteLease(id);
    setLeases((l) => l.filter((x) => x.id !== id));
  };

  const activeLeases = leases.filter((l) => !l.endDate || new Date(l.endDate) >= new Date());
  const allLeases = leases;

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
      padding: '2rem',
      color: '#e2e8f0',
      position: 'relative'
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
        @keyframes slideInDrawer {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .lease-card:hover .underline-motion {
          width: 100%;
        }
      `}</style>

      <h1 style={{
        fontSize: '2.5rem',
        fontWeight: '700',
        marginBottom: '2rem',
        background: 'linear-gradient(135deg, #06b6d4, #3b82f6)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        animation: 'slideIn 0.6s ease-out'
      }}>
        Lease Management
      </h1>

      {/* Property Selector */}
      <div style={{
        background: 'rgba(255,255,255,0.03)',
        backdropFilter: 'blur(20px)',
        borderRadius: '16px',
        padding: '1.5rem',
        marginBottom: '2rem',
        border: '1px solid rgba(255,255,255,0.1)',
        animation: 'slideIn 0.6s ease-out 0.1s backwards'
      }}>
        <label style={{
          fontSize: '0.875rem',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          color: '#94a3b8',
          marginBottom: '0.75rem',
          display: 'block'
        }}>
          Select Property
        </label>
        <div style={{ position: 'relative' }}>
          <select
            value={selectedProperty}
            onChange={(e) => setSelectedProperty(e.target.value)}
            style={{
              width: '100%',
              padding: '0.875rem 2.5rem 0.875rem 1rem',
              background: 'rgba(15,23,42,0.6)',
              border: '1px solid rgba(6,182,212,0.3)',
              borderRadius: '12px',
              color: '#e2e8f0',
              fontSize: '1rem',
              appearance: 'none',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
          >
            <option value="">-- Choose Property --</option>
            {properties.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title}
              </option>
            ))}
          </select>
          <ChevronDown style={{
            position: 'absolute',
            right: '1rem',
            top: '50%',
            transform: 'translateY(-50%)',
            pointerEvents: 'none',
            color: '#06b6d4'
          }} size={20} />
        </div>
      </div>

      {selectedProperty && (
        <>
          {/* Add Lease Button */}
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.875rem 1.5rem',
              background: showAddForm ? 'rgba(239,68,68,0.15)' : 'rgba(6,182,212,0.15)',
              border: showAddForm ? '2px dashed #ef4444' : '2px dashed #06b6d4',
              borderRadius: '12px',
              color: showAddForm ? '#ef4444' : '#06b6d4',
              cursor: 'pointer',
              fontSize: '0.95rem',
              fontWeight: '600',
              marginBottom: '1rem',
              transition: 'all 0.3s ease',
              animation: 'slideIn 0.6s ease-out 0.2s backwards'
            }}
          >
            <Plus size={20} />
            {showAddForm ? 'Cancel' : 'Create New Lease'}
          </button>

          {/* Collapsible Form */}
          {showAddForm && (
            <div style={{
              background: 'rgba(255,255,255,0.03)',
              backdropFilter: 'blur(20px)',
              borderRadius: '16px',
              padding: '1.5rem',
              marginBottom: '2rem',
              border: '1px solid rgba(6,182,212,0.3)',
              animation: 'slideDown 0.4s ease-out',
              overflow: 'hidden'
            }}>
              <h3 style={{
                fontSize: '1.25rem',
                fontWeight: '600',
                marginBottom: '1rem',
                color: '#06b6d4'
              }}>
                New Lease Details
              </h3>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1rem',
                marginBottom: '1rem'
              }}>
                <div>
                  <label style={{
                    fontSize: '0.8rem',
                    textTransform: 'uppercase',
                    color: '#94a3b8',
                    marginBottom: '0.5rem',
                    display: 'block'
                  }}>
                    Unit
                  </label>
                  <select
                    value={selectedUnit}
                    onChange={(e) => setSelectedUnit(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      background: 'rgba(15,23,42,0.6)',
                      border: '1px solid rgba(148,163,184,0.2)',
                      borderRadius: '8px',
                      color: '#e2e8f0',
                      fontSize: '0.95rem'
                    }}
                  >
                    <option value="">-- Select --</option>
                    {units.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.unitNumber}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{
                    fontSize: '0.8rem',
                    textTransform: 'uppercase',
                    color: '#94a3b8',
                    marginBottom: '0.5rem',
                    display: 'block'
                  }}>
                    Tenant
                  </label>
                  <select
                    value={selectedTenant}
                    onChange={(e) => setSelectedTenant(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      background: 'rgba(15,23,42,0.6)',
                      border: '1px solid rgba(148,163,184,0.2)',
                      borderRadius: '8px',
                      color: '#e2e8f0',
                      fontSize: '0.95rem'
                    }}
                  >
                    <option value="">-- Select --</option>
                    {tenants.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.user?.name || t.name} ({t.user?.email || 'No email'})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{
                    fontSize: '0.8rem',
                    textTransform: 'uppercase',
                    color: '#94a3b8',
                    marginBottom: '0.5rem',
                    display: 'block'
                  }}>
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      background: 'rgba(15,23,42,0.6)',
                      border: '1px solid rgba(148,163,184,0.2)',
                      borderRadius: '8px',
                      color: '#e2e8f0',
                      fontSize: '0.95rem'
                    }}
                  />
                </div>
                <div>
                  <label style={{
                    fontSize: '0.8rem',
                    textTransform: 'uppercase',
                    color: '#94a3b8',
                    marginBottom: '0.5rem',
                    display: 'block'
                  }}>
                    End Date
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      background: 'rgba(15,23,42,0.6)',
                      border: '1px solid rgba(148,163,184,0.2)',
                      borderRadius: '8px',
                      color: '#e2e8f0',
                      fontSize: '0.95rem'
                    }}
                  />
                </div>
                <div>
                  <label style={{
                    fontSize: '0.8rem',
                    textTransform: 'uppercase',
                    color: '#94a3b8',
                    marginBottom: '0.5rem',
                    display: 'block'
                  }}>
                    Monthly Rent
                  </label>
                  <input
                    type="number"
                    placeholder="e.g., 1200"
                    value={rentAmount}
                    onChange={(e) => setRentAmount(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      background: 'rgba(15,23,42,0.6)',
                      border: '1px solid rgba(148,163,184,0.2)',
                      borderRadius: '8px',
                      color: '#e2e8f0',
                      fontSize: '0.95rem'
                    }}
                  />
                </div>
              </div>
              <button
                onClick={handleCreateLease}
                style={{
                  padding: '0.875rem 2rem',
                  background: 'linear-gradient(135deg, #06b6d4, #3b82f6)',
                  border: 'none',
                  borderRadius: '10px',
                  color: 'white',
                  fontWeight: '600',
                  cursor: 'pointer',
                  fontSize: '0.95rem',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                  boxShadow: '0 4px 15px rgba(6,182,212,0.4)'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 6px 20px rgba(6,182,212,0.5)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 4px 15px rgba(6,182,212,0.4)';
                }}
              >
                Create Lease
              </button>
            </div>
          )}

          {/* Active Leases - Card Grid */}
          <div style={{
            marginBottom: '3rem',
            animation: 'fadeIn 0.6s ease-out 0.3s backwards'
          }}>
            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: '600',
              marginBottom: '1.5rem',
              color: '#e2e8f0',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <FileText size={24} style={{ color: '#10b981' }} />
              Active Leases
            </h2>
            {activeLeases.length === 0 ? (
              <p style={{ color: '#94a3b8', fontStyle: 'italic' }}>No active leases.</p>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                gap: '1.5rem'
              }}>
                {activeLeases.map((lease, idx) => (
                  <div
                    key={lease.id}
                    className="lease-card"
                    onClick={() => setSelectedLease(lease)}
                    style={{
                      background: 'rgba(255,255,255,0.05)',
                      backdropFilter: 'blur(20px)',
                      borderRadius: '16px',
                      padding: '1.5rem',
                      border: '1px solid rgba(16,185,129,0.3)',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      animation: `slideIn 0.5s ease-out ${idx * 0.1}s backwards`,
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-4px)';
                      e.currentTarget.style.boxShadow = '0 8px 25px rgba(16,185,129,0.3)';
                      e.currentTarget.style.borderColor = 'rgba(16,185,129,0.6)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                      e.currentTarget.style.borderColor = 'rgba(16,185,129,0.3)';
                    }}
                  >
                    <div className="underline-motion" style={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      height: '3px',
                      width: '0',
                      background: 'linear-gradient(90deg, #10b981, #06b6d4)',
                      transition: 'width 0.4s ease'
                    }} />
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      marginBottom: '1rem'
                    }}>
                      <Users size={24} style={{ color: '#10b981' }} />
                      <h3 style={{
                        fontSize: '1.25rem',
                        fontWeight: '600',
                        color: '#e2e8f0',
                        margin: 0
                      }}>
                        {lease.tenant?.user?.name || 'Unknown'}
                      </h3>
                    </div>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      marginBottom: '0.75rem',
                      color: '#94a3b8'
                    }}>
                      <Home size={18} style={{ color: '#06b6d4' }} />
                      <span style={{ fontSize: '0.95rem' }}>
                        Unit {lease.unit?.unitNumber || 'N/A'}
                      </span>
                    </div>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      marginBottom: '0.75rem',
                      color: '#94a3b8'
                    }}>
                      <DollarSign size={18} style={{ color: '#fbbf24' }} />
                      <span style={{ fontSize: '1.1rem', fontWeight: '600', color: '#e2e8f0' }}>
                        ${lease.rent}/mo
                      </span>
                    </div>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      color: '#94a3b8',
                      fontSize: '0.875rem'
                    }}>
                      <Calendar size={16} />
                      <span>
                        {new Date(lease.startDate).toLocaleDateString()} - 
                        {lease.endDate ? new Date(lease.endDate).toLocaleDateString() : 'Ongoing'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Lease History Table */}
          <div style={{
            animation: 'fadeIn 0.8s ease-out 0.5s backwards'
          }}>
            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: '600',
              marginBottom: '1.5rem',
              color: '#e2e8f0'
            }}>
              All Lease History
            </h2>
            {allLeases.length === 0 ? (
              <p style={{ color: '#94a3b8', fontStyle: 'italic' }}>No leases found.</p>
            ) : (
              <div style={{
                background: 'rgba(255,255,255,0.03)',
                backdropFilter: 'blur(20px)',
                borderRadius: '16px',
                overflow: 'hidden',
                border: '1px solid rgba(255,255,255,0.1)'
              }}>
                <table style={{
                  width: '100%',
                  borderCollapse: 'collapse'
                }}>
                  <thead>
                    <tr style={{
                      background: 'rgba(255,255,255,0.05)',
                      borderBottom: '1px solid rgba(255,255,255,0.1)'
                    }}>
                      <th style={{
                        padding: '1rem',
                        textAlign: 'left',
                        fontSize: '0.8rem',
                        textTransform: 'uppercase',
                        color: '#94a3b8',
                        fontWeight: '600',
                        letterSpacing: '0.05em'
                      }}>
                        Status
                      </th>
                      <th style={{
                        padding: '1rem',
                        textAlign: 'left',
                        fontSize: '0.8rem',
                        textTransform: 'uppercase',
                        color: '#94a3b8',
                        fontWeight: '600',
                        letterSpacing: '0.05em'
                      }}>
                        Unit
                      </th>
                      <th style={{
                        padding: '1rem',
                        textAlign: 'left',
                        fontSize: '0.8rem',
                        textTransform: 'uppercase',
                        color: '#94a3b8',
                        fontWeight: '600',
                        letterSpacing: '0.05em'
                      }}>
                        Tenant
                      </th>
                      <th style={{
                        padding: '1rem',
                        textAlign: 'left',
                        fontSize: '0.8rem',
                        textTransform: 'uppercase',
                        color: '#94a3b8',
                        fontWeight: '600',
                        letterSpacing: '0.05em'
                      }}>
                        Start Date
                      </th>
                      <th style={{
                        padding: '1rem',
                        textAlign: 'left',
                        fontSize: '0.8rem',
                        textTransform: 'uppercase',
                        color: '#94a3b8',
                        fontWeight: '600',
                        letterSpacing: '0.05em'
                      }}>
                        End Date
                      </th>
                      <th style={{
                        padding: '1rem',
                        textAlign: 'left',
                        fontSize: '0.8rem',
                        textTransform: 'uppercase',
                        color: '#94a3b8',
                        fontWeight: '600',
                        letterSpacing: '0.05em'
                      }}>
                        Rent
                      </th>
                      <th style={{
                        padding: '1rem',
                        textAlign: 'center',
                        fontSize: '0.8rem',
                        textTransform: 'uppercase',
                        color: '#94a3b8',
                        fontWeight: '600',
                        letterSpacing: '0.05em'
                      }}>
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {allLeases.map((lease, idx) => {
                      const isActive = !lease.endDate || new Date(lease.endDate) >= new Date();
                      return (
                        <tr
                          key={lease.id}
                          style={{
                            borderBottom: '1px solid rgba(255,255,255,0.05)',
                            transition: 'all 0.3s ease',
                            animation: `fadeIn 0.5s ease-out ${idx * 0.05}s backwards`
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = '0 4px 15px rgba(6,182,212,0.15)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'transparent';
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = 'none';
                          }}
                        >
                          <td style={{ padding: '1rem' }}>
                            <div style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.5rem',
                              padding: '0.375rem 0.75rem',
                              borderRadius: '20px',
                              fontSize: '0.8rem',
                              fontWeight: '600',
                              background: isActive ? 'rgba(16,185,129,0.15)' : 'rgba(148,163,184,0.15)',
                              color: isActive ? '#10b981' : '#94a3b8',
                              border: `1px solid ${isActive ? 'rgba(16,185,129,0.3)' : 'rgba(148,163,184,0.3)'}`
                            }}>
                              <div style={{
                                width: '8px',
                                height: '8px',
                                borderRadius: '50%',
                                background: isActive ? '#10b981' : '#94a3b8',
                                boxShadow: isActive ? '0 0 8px rgba(16,185,129,0.6)' : 'none'
                              }} />
                              {isActive ? 'Active' : 'Expired'}
                            </div>
                          </td>
                          <td style={{
                            padding: '1rem',
                            color: '#e2e8f0',
                            fontWeight: '500'
                          }}>
                            {lease.unit?.unitNumber || 'N/A'}
                          </td>
                          <td style={{
                            padding: '1rem',
                            color: '#e2e8f0'
                          }}>
                            {lease.tenant?.user?.name || 'Unknown'}
                          </td>
                          <td style={{
                            padding: '1rem',
                            color: '#94a3b8',
                            fontSize: '0.9rem'
                          }}>
                            {new Date(lease.startDate).toLocaleDateString()}
                          </td>
                          <td style={{
                            padding: '1rem',
                            color: '#94a3b8',
                            fontSize: '0.9rem'
                          }}>
                            {lease.endDate ? new Date(lease.endDate).toLocaleDateString() : 'Ongoing'}
                          </td>
                          <td style={{
                            padding: '1rem',
                            color: '#fbbf24',
                            fontWeight: '600',
                            fontSize: '1rem'
                          }}>
                            ${lease.rent}
                          </td>
                          <td style={{
                            padding: '1rem',
                            textAlign: 'center'
                          }}>
                            <button
                              onClick={() => handleDeleteLease(lease.id)}
                              style={{
                                padding: '0.5rem 1rem',
                                background: 'rgba(239,68,68,0.15)',
                                border: '1px solid rgba(239,68,68,0.3)',
                                borderRadius: '8px',
                                color: '#ef4444',
                                cursor: 'pointer',
                                fontSize: '0.875rem',
                                fontWeight: '600',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.375rem',
                                transition: 'all 0.2s ease'
                              }}
                              onMouseEnter={(e) => {
                                e.target.style.background = 'rgba(239,68,68,0.25)';
                                e.target.style.transform = 'scale(1.05)';
                              }}
                              onMouseLeave={(e) => {
                                e.target.style.background = 'rgba(239,68,68,0.15)';
                                e.target.style.transform = 'scale(1)';
                              }}
                            >
                              <Trash2 size={16} />
                              Delete
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {/* Sidebar Drawer */}
      {selectedLease && (
        <>
          <div
            onClick={() => setSelectedLease(null)}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0,0,0,0.7)',
              backdropFilter: 'blur(4px)',
              zIndex: 999,
              animation: 'fadeIn 0.3s ease-out'
            }}
          />
          <div style={{
            position: 'fixed',
            top: 0,
            right: 0,
            bottom: 0,
            width: '450px',
            maxWidth: '90vw',
            background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
            borderLeft: '1px solid rgba(6,182,212,0.3)',
            boxShadow: '-10px 0 40px rgba(0,0,0,0.5)',
            zIndex: 1000,
            padding: '2rem',
            overflowY: 'auto',
            animation: 'slideInDrawer 0.4s ease-out'
          }}>
            <button
              onClick={() => setSelectedLease(null)}
              style={{
                position: 'absolute',
                top: '1.5rem',
                right: '1.5rem',
                background: 'rgba(239,68,68,0.15)',
                border: '1px solid rgba(239,68,68,0.3)',
                borderRadius: '8px',
                padding: '0.5rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'rgba(239,68,68,0.25)';
                e.target.style.transform = 'rotate(90deg)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'rgba(239,68,68,0.15)';
                e.target.style.transform = 'rotate(0deg)';
              }}
            >
              <X size={20} style={{ color: '#ef4444' }} />
            </button>

            <h2 style={{
              fontSize: '1.75rem',
              fontWeight: '700',
              marginBottom: '2rem',
              color: '#e2e8f0',
              paddingRight: '3rem'
            }}>
              Lease Details
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <label style={{
                  fontSize: '0.75rem',
                  textTransform: 'uppercase',
                  color: '#94a3b8',
                  marginBottom: '0.5rem',
                  display: 'block',
                  letterSpacing: '0.05em'
                }}>
                  Tenant
                </label>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '1rem',
                  background: 'rgba(255,255,255,0.05)',
                  borderRadius: '12px',
                  border: '1px solid rgba(255,255,255,0.1)'
                }}>
                  <Users size={24} style={{ color: '#10b981' }} />
                  <span style={{ fontSize: '1.1rem', fontWeight: '600', color: '#e2e8f0' }}>
                    {selectedLease.tenant?.user?.name || 'Unknown'}
                  </span>
                </div>
              </div>

              <div>
                <label style={{
                  fontSize: '0.75rem',
                  textTransform: 'uppercase',
                  color: '#94a3b8',
                  marginBottom: '0.5rem',
                  display: 'block',
                  letterSpacing: '0.05em'
                }}>
                  Unit
                </label>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '1rem',
                  background: 'rgba(255,255,255,0.05)',
                  borderRadius: '12px',
                  border: '1px solid rgba(255,255,255,0.1)'
                }}>
                  <Home size={24} style={{ color: '#06b6d4' }} />
                  <span style={{ fontSize: '1.1rem', fontWeight: '600', color: '#e2e8f0' }}>
                    Unit {selectedLease.unit?.unitNumber || 'N/A'}
                  </span>
                </div>
              </div>

              <div>
                <label style={{
                  fontSize: '0.75rem',
                  textTransform: 'uppercase',
                  color: '#94a3b8',
                  marginBottom: '0.5rem',
                  display: 'block',
                  letterSpacing: '0.05em'
                }}>
                  Monthly Rent
                </label>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '1rem',
                  background: 'rgba(251,191,36,0.1)',
                  borderRadius: '12px',
                  border: '1px solid rgba(251,191,36,0.3)'
                }}>
                  <DollarSign size={24} style={{ color: '#fbbf24' }} />
                  <span style={{ fontSize: '1.5rem', fontWeight: '700', color: '#fbbf24' }}>
                    ${selectedLease.rent}
                  </span>
                </div>
              </div>

              <div>
                <label style={{
                  fontSize: '0.75rem',
                  textTransform: 'uppercase',
                  color: '#94a3b8',
                  marginBottom: '0.5rem',
                  display: 'block',
                  letterSpacing: '0.05em'
                }}>
                  Lease Term
                </label>
                <div style={{
                  padding: '1rem',
                  background: 'rgba(255,255,255,0.05)',
                  borderRadius: '12px',
                  border: '1px solid rgba(255,255,255,0.1)'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    marginBottom: '0.75rem',
                    color: '#e2e8f0'
                  }}>
                    <Calendar size={18} style={{ color: '#06b6d4' }} />
                    <span style={{ fontSize: '0.875rem', fontWeight: '600' }}>Start:</span>
                    <span style={{ fontSize: '0.95rem' }}>
                      {new Date(selectedLease.startDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    color: '#e2e8f0'
                  }}>
                    <Calendar size={18} style={{ color: '#06b6d4' }} />
                    <span style={{ fontSize: '0.875rem', fontWeight: '600' }}>End:</span>
                    <span style={{ fontSize: '0.95rem' }}>
                      {selectedLease.endDate ? new Date(selectedLease.endDate).toLocaleDateString() : 'Ongoing'}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <label style={{
                  fontSize: '0.75rem',
                  textTransform: 'uppercase',
                  color: '#94a3b8',
                  marginBottom: '0.5rem',
                  display: 'block',
                  letterSpacing: '0.05em'
                }}>
                  Status
                </label>
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.75rem 1.25rem',
                  borderRadius: '20px',
                  fontSize: '0.95rem',
                  fontWeight: '600',
                  background: (!selectedLease.endDate || new Date(selectedLease.endDate) >= new Date()) 
                    ? 'rgba(16,185,129,0.15)' 
                    : 'rgba(148,163,184,0.15)',
                  color: (!selectedLease.endDate || new Date(selectedLease.endDate) >= new Date()) 
                    ? '#10b981' 
                    : '#94a3b8',
                  border: `1px solid ${(!selectedLease.endDate || new Date(selectedLease.endDate) >= new Date()) 
                    ? 'rgba(16,185,129,0.3)' 
                    : 'rgba(148,163,184,0.3)'}`
                }}>
                  <div style={{
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    background: (!selectedLease.endDate || new Date(selectedLease.endDate) >= new Date()) 
                      ? '#10b981' 
                      : '#94a3b8',
                    boxShadow: (!selectedLease.endDate || new Date(selectedLease.endDate) >= new Date()) 
                      ? '0 0 10px rgba(16,185,129,0.6)' 
                      : 'none'
                  }} />
                  {(!selectedLease.endDate || new Date(selectedLease.endDate) >= new Date()) ? 'Active' : 'Expired'}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
