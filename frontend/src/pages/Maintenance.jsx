// src/pages/Maintenance.jsx
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { Wrench, User, Home, Calendar, X, Search, ChevronDown, AlertCircle, CheckCircle2, Clock } from "lucide-react";

import {
  getMaintenanceRequests,
  updateMaintenanceRequest,
  uploadMaintenancePhoto,
  getMaintenanceRequest,
} from "../api/maintenance";

export default function Maintenance() {
  const { user } = useAuth();
  const isManager = user?.role === "LANDLORD";

  const [requests, setRequests] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [propertyFilter, setPropertyFilter] = useState("ALL");

  const [selected, setSelected] = useState(null);
  const [detailData, setDetailData] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [contractorInput, setContractorInput] = useState("");
  const [completingRequest, setCompletingRequest] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  const loadRequests = async () => {
    setLoading(true);
    try {
      const data = await getMaintenanceRequests();
      setRequests(data);
      setFiltered(data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const applyFilters = () => {
    let res = [...requests];

    if (search.trim() !== "")
      res = res.filter((r) =>
        r.title.toLowerCase().includes(search.toLowerCase())
      );

    if (priorityFilter !== "ALL")
      res = res.filter((r) => r.priority === priorityFilter);

    if (statusFilter !== "ALL")
      res = res.filter((r) => r.status === statusFilter);

    if (propertyFilter !== "ALL")
      res = res.filter(
        (r) => r.lease.unit.property.id === Number(propertyFilter)
      );

    setFiltered(res);
  };

  useEffect(() => {
    applyFilters();
  }, [search, priorityFilter, statusFilter, propertyFilter]);

  const handleUpdate = async (id, fields) => {
    try {
      const updated = await updateMaintenanceRequest(id, fields);
      await loadRequests();
      setDetailData(updated);
    } catch (err) {
      console.error("Failed update:", err);
    }
  };

  const handleSelect = async (req) => {
    setSelected(req);
    setShowSuccessMessage(false);
    const full = await getMaintenanceRequest(req.id);
    setDetailData(full);
    setContractorInput(full.contractor || "");
  };

  const handleMarkAsDone = async () => {
    if (!detailData) return;
    
    try {
      setCompletingRequest(true);
      await handleUpdate(detailData.id, { 
        status: "COMPLETED",
        completedAt: new Date().toISOString()
      });
      setShowSuccessMessage(true);
      
      // Auto close drawer and refresh after 2 seconds
      setTimeout(() => {
        setSelected(null);
        setShowSuccessMessage(false);
        loadRequests();
      }, 2000);
    } catch (err) {
      console.error("Failed to mark as done:", err);
      alert("Failed to complete request. Please try again.");
    } finally {
      setCompletingRequest(false);
    }
  };

  const handleUpload = async (e) => {
    if (!selected) return;
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      await uploadMaintenancePhoto(selected.id, file);
      const full = await getMaintenanceRequest(selected.id);
      setDetailData(full);
      await loadRequests();
    } catch (err) {
      console.error("Upload failed:", err);
    }
    setUploading(false);
  };

  if (!isManager)
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
        padding: '2rem',
        color: '#e2e8f0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          background: 'rgba(239,68,68,0.15)',
          border: '1px solid rgba(239,68,68,0.3)',
          borderRadius: '16px',
          padding: '2rem',
          textAlign: 'center'
        }}>
          <AlertCircle size={48} style={{ color: '#ef4444', marginBottom: '1rem' }} />
          <h1 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Access Denied</h1>
          <p style={{ color: '#94a3b8' }}>You do not have access to this dashboard.</p>
        </div>
      </div>
    );

  const priorityColors = {
    LOW: { bg: 'rgba(34,197,94,0.15)', border: 'rgba(34,197,94,0.3)', text: '#22c55e' },
    MEDIUM: { bg: 'rgba(251,191,36,0.15)', border: 'rgba(251,191,36,0.3)', text: '#fbbf24' },
    HIGH: { bg: 'rgba(239,68,68,0.15)', border: 'rgba(239,68,68,0.3)', text: '#ef4444' }
  };

  const statusColors = {
    PENDING: { bg: 'rgba(148,163,184,0.15)', border: 'rgba(148,163,184,0.3)', text: '#94a3b8', icon: Clock },
    IN_PROGRESS: { bg: 'rgba(59,130,246,0.15)', border: 'rgba(59,130,246,0.3)', text: '#3b82f6', icon: Wrench },
    COMPLETED: { bg: 'rgba(16,185,129,0.15)', border: 'rgba(16,185,129,0.3)', text: '#10b981', icon: CheckCircle2 },
    CANCELED: { bg: 'rgba(239,68,68,0.15)', border: 'rgba(239,68,68,0.3)', text: '#ef4444', icon: X }
  };

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
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideInDrawer {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
      `}</style>

      <h1 style={{
        fontSize: '2.5rem',
        fontWeight: '700',
        marginBottom: '0.5rem',
        background: 'linear-gradient(135deg, #06b6d4, #3b82f6)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        animation: 'slideIn 0.6s ease-out'
      }}>
        Maintenance Dashboard
      </h1>
      <p style={{
        color: '#94a3b8',
        marginBottom: '2rem',
        fontSize: '1rem',
        animation: 'slideIn 0.6s ease-out 0.1s backwards'
      }}>
        Manage all tenant maintenance requests
      </p>

      {/* Filters */}
      <div style={{
        background: 'rgba(255,255,255,0.03)',
        backdropFilter: 'blur(20px)',
        borderRadius: '16px',
        padding: '1.5rem',
        marginBottom: '2rem',
        border: '1px solid rgba(255,255,255,0.1)',
        animation: 'slideIn 0.6s ease-out 0.2s backwards'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1rem'
        }}>
          <div style={{ position: 'relative' }}>
            <input
              placeholder="Search requests..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: '100%',
                padding: '0.875rem 0.875rem 0.875rem 2.75rem',
                background: 'rgba(15,23,42,0.6)',
                border: '1px solid rgba(148,163,184,0.2)',
                borderRadius: '12px',
                color: '#e2e8f0',
                fontSize: '0.95rem',
                transition: 'all 0.3s ease'
              }}
            />
            <Search style={{
              position: 'absolute',
              left: '0.875rem',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#94a3b8'
            }} size={18} />
          </div>

          <div style={{ position: 'relative' }}>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              style={{
                width: '100%',
                padding: '0.875rem 2.5rem 0.875rem 1rem',
                background: 'rgba(15,23,42,0.6)',
                border: '1px solid rgba(148,163,184,0.2)',
                borderRadius: '12px',
                color: '#e2e8f0',
                fontSize: '0.95rem',
                appearance: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="ALL">All Priorities</option>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
            </select>
            <ChevronDown style={{
              position: 'absolute',
              right: '1rem',
              top: '50%',
              transform: 'translateY(-50%)',
              pointerEvents: 'none',
              color: '#94a3b8'
            }} size={18} />
          </div>

          <div style={{ position: 'relative' }}>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{
                width: '100%',
                padding: '0.875rem 2.5rem 0.875rem 1rem',
                background: 'rgba(15,23,42,0.6)',
                border: '1px solid rgba(148,163,184,0.2)',
                borderRadius: '12px',
                color: '#e2e8f0',
                fontSize: '0.95rem',
                appearance: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="ALL">All Status</option>
              <option value="PENDING">Pending</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELED">Canceled</option>
            </select>
            <ChevronDown style={{
              position: 'absolute',
              right: '1rem',
              top: '50%',
              transform: 'translateY(-50%)',
              pointerEvents: 'none',
              color: '#94a3b8'
            }} size={18} />
          </div>

          <div style={{ position: 'relative' }}>
            <select
              value={propertyFilter}
              onChange={(e) => setPropertyFilter(e.target.value)}
              style={{
                width: '100%',
                padding: '0.875rem 2.5rem 0.875rem 1rem',
                background: 'rgba(15,23,42,0.6)',
                border: '1px solid rgba(148,163,184,0.2)',
                borderRadius: '12px',
                color: '#e2e8f0',
                fontSize: '0.95rem',
                appearance: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="ALL">All Properties</option>
              {[...new Map(
                requests.map((r) => [
                  r.lease.unit.property.id,
                  r.lease.unit.property,
                ])
              ).values()].map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title} — {p.city}
                </option>
              ))}
            </select>
            <ChevronDown style={{
              position: 'absolute',
              right: '1rem',
              top: '50%',
              transform: 'translateY(-50%)',
              pointerEvents: 'none',
              color: '#94a3b8'
            }} size={18} />
          </div>
        </div>
      </div>

      {/* Maintenance List */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        animation: 'fadeIn 0.6s ease-out 0.3s backwards'
      }}>
        {loading ? (
          <div style={{
            padding: '3rem',
            textAlign: 'center',
            color: '#94a3b8'
          }}>
            Loading maintenance requests...
          </div>
        ) : filtered.length === 0 ? (
          <div style={{
            padding: '3rem',
            textAlign: 'center',
            color: '#94a3b8',
            fontStyle: 'italic'
          }}>
            No requests found.
          </div>
        ) : (
          filtered.map((r, idx) => {
            const StatusIcon = statusColors[r.status]?.icon || Clock;
            return (
              <div
                key={r.id}
                onClick={() => handleSelect(r)}
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  backdropFilter: 'blur(20px)',
                  borderRadius: '16px',
                  padding: '1.5rem',
                  border: '1px solid rgba(255,255,255,0.1)',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  animation: `slideIn 0.5s ease-out ${idx * 0.05}s backwards`
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateX(4px)';
                  e.currentTarget.style.boxShadow = '0 8px 25px rgba(6,182,212,0.2)';
                  e.currentTarget.style.borderColor = 'rgba(6,182,212,0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateX(0)';
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                }}
              >
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '1rem'
                }}>
                  <h3 style={{
                    fontSize: '1.25rem',
                    fontWeight: '600',
                    color: '#e2e8f0',
                    margin: 0,
                    flex: 1
                  }}>
                    {r.title}
                  </h3>
                  <div style={{
                    display: 'flex',
                    gap: '0.5rem',
                    flexShrink: 0,
                    marginLeft: '1rem'
                  }}>
                    {/* Priority Pill */}
                    <div style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.375rem',
                      padding: '0.375rem 0.75rem',
                      borderRadius: '20px',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      background: priorityColors[r.priority]?.bg,
                      color: priorityColors[r.priority]?.text,
                      border: `1px solid ${priorityColors[r.priority]?.border}`
                    }}>
                      {r.priority}
                    </div>
                    {/* Status Pill */}
                    <div style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.375rem',
                      padding: '0.375rem 0.75rem',
                      borderRadius: '20px',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      textTransform: 'capitalize',
                      background: statusColors[r.status]?.bg,
                      color: statusColors[r.status]?.text,
                      border: `1px solid ${statusColors[r.status]?.border}`
                    }}>
                      <StatusIcon size={14} />
                      {r.status.replace('_', ' ')}
                    </div>
                  </div>
                </div>

                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '1rem',
                  marginBottom: '0.75rem'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    color: '#94a3b8',
                    fontSize: '0.9rem'
                  }}>
                    <Home size={16} style={{ color: '#06b6d4' }} />
                    <span>Unit {r.lease.unit.unitNumber} — {r.lease.unit.property.title}</span>
                  </div>

                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    color: '#94a3b8',
                    fontSize: '0.9rem'
                  }}>
                    <User size={16} style={{ color: '#10b981' }} />
                    <span>{r.lease.tenant.user.name}</span>
                  </div>

                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    color: '#94a3b8',
                    fontSize: '0.875rem'
                  }}>
                    <Calendar size={16} style={{ color: '#fbbf24' }} />
                    <span>{new Date(r.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Drawer */}
      {selected && detailData && (
        <>
          <div
            onClick={() => setSelected(null)}
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
            width: '550px',
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
              onClick={() => setSelected(null)}
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
              marginBottom: '0.5rem',
              color: '#e2e8f0',
              paddingRight: '3rem'
            }}>
              {detailData.title}
            </h2>
            <p style={{
              color: '#94a3b8',
              marginBottom: '1.5rem',
              fontSize: '0.95rem'
            }}>
              Unit {detailData.lease.unit.unitNumber} — {detailData.lease.unit.property.title}
            </p>

            <div style={{
              background: 'rgba(255,255,255,0.05)',
              borderRadius: '12px',
              padding: '1rem',
              marginBottom: '1.5rem',
              border: '1px solid rgba(255,255,255,0.1)'
            }}>
              <p style={{ color: '#e2e8f0', margin: 0, lineHeight: '1.6' }}>
                {detailData.description}
              </p>
            </div>

            {/* Status */}
            <div style={{ marginBottom: '1.5rem' }}>
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
              <div style={{ position: 'relative' }}>
                <select
                  value={detailData.status}
                  onChange={(e) =>
                    handleUpdate(detailData.id, { status: e.target.value })
                  }
                  style={{
                    width: '100%',
                    padding: '0.875rem 2.5rem 0.875rem 1rem',
                    background: 'rgba(15,23,42,0.6)',
                    border: '1px solid rgba(148,163,184,0.2)',
                    borderRadius: '12px',
                    color: '#e2e8f0',
                    fontSize: '0.95rem',
                    appearance: 'none',
                    cursor: 'pointer'
                  }}
                >
                  <option value="PENDING">Pending</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="CANCELED">Canceled</option>
                </select>
                <ChevronDown style={{
                  position: 'absolute',
                  right: '1rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  pointerEvents: 'none',
                  color: '#94a3b8'
                }} size={18} />
              </div>
            </div>

            {/* Priority */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{
                fontSize: '0.75rem',
                textTransform: 'uppercase',
                color: '#94a3b8',
                marginBottom: '0.5rem',
                display: 'block',
                letterSpacing: '0.05em'
              }}>
                Priority
              </label>
              <div style={{ position: 'relative' }}>
                <select
                  value={detailData.priority}
                  onChange={(e) =>
                    handleUpdate(detailData.id, { priority: e.target.value })
                  }
                  style={{
                    width: '100%',
                    padding: '0.875rem 2.5rem 0.875rem 1rem',
                    background: 'rgba(15,23,42,0.6)',
                    border: '1px solid rgba(148,163,184,0.2)',
                    borderRadius: '12px',
                    color: '#e2e8f0',
                    fontSize: '0.95rem',
                    appearance: 'none',
                    cursor: 'pointer'
                  }}
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                </select>
                <ChevronDown style={{
                  position: 'absolute',
                  right: '1rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  pointerEvents: 'none',
                  color: '#94a3b8'
                }} size={18} />
              </div>
            </div>

            {/* Contractor */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{
                fontSize: '0.75rem',
                textTransform: 'uppercase',
                color: '#94a3b8',
                marginBottom: '0.5rem',
                display: 'block',
                letterSpacing: '0.05em'
              }}>
                Assign Contractor
              </label>
              <input
                placeholder="Contractor name"
                value={contractorInput}
                onChange={(e) => setContractorInput(e.target.value)}
                onBlur={() => {
                  if (contractorInput !== detailData.contractor) {
                    handleUpdate(detailData.id, { contractor: contractorInput });
                  }
                }}
                style={{
                  width: '100%',
                  padding: '0.875rem 1rem',
                  background: 'rgba(15,23,42,0.6)',
                  border: '1px solid rgba(148,163,184,0.2)',
                  borderRadius: '12px',
                  color: '#e2e8f0',
                  fontSize: '0.95rem'
                }}
              />
            </div>

            {/* Photos */}
            <div style={{ marginBottom: '2rem' }}>
              <label style={{
                fontSize: '0.75rem',
                textTransform: 'uppercase',
                color: '#94a3b8',
                marginBottom: '0.75rem',
                display: 'block',
                letterSpacing: '0.05em'
              }}>
                Photos from Tenant
              </label>
              {detailData.photos?.length > 0 ? (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
                  gap: '0.75rem'
                }}>
                  {detailData.photos.map((url, i) => {
                    // Construct full URL with proper encoding
                    const fullUrl = `http://localhost:5000${encodeURI(url)}`;
                    return (
                      <div key={i} style={{
                        position: 'relative',
                        borderRadius: '12px',
                        overflow: 'hidden',
                        border: '1px solid rgba(255,255,255,0.1)',
                        transition: 'all 0.3s ease',
                        cursor: 'pointer'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'scale(1.05)';
                        e.currentTarget.style.boxShadow = '0 8px 20px rgba(6,182,212,0.3)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'scale(1)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                      onClick={() => window.open(fullUrl, '_blank')}>
                        <img 
                          src={fullUrl} 
                          alt={`Maintenance ${i + 1}`} 
                          style={{
                            width: '100%',
                            height: '140px',
                            objectFit: 'cover',
                            display: 'block'
                          }}
                        />
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p style={{
                  color: '#94a3b8',
                  fontStyle: 'italic',
                  fontSize: '0.875rem',
                  margin: 0
                }}>
                  No photos uploaded by tenant yet.
                </p>
              )}
            </div>

            {/* Mark as Done Button */}
            {showSuccessMessage ? (
              <div style={{
                padding: '2rem',
                background: 'rgba(16,185,129,0.15)',
                border: '2px solid rgba(16,185,129,0.3)',
                borderRadius: '16px',
                textAlign: 'center',
                animation: 'slideIn 0.3s ease-out'
              }}>
                <CheckCircle2 size={56} style={{ color: '#10b981', marginBottom: '0.75rem' }} />
                <div style={{
                  fontSize: '1.25rem',
                  fontWeight: '700',
                  color: '#10b981',
                  marginBottom: '0.5rem'
                }}>
                  Request Completed Successfully!
                </div>
                <p style={{
                  color: '#94a3b8',
                  fontSize: '0.875rem',
                  margin: 0
                }}>
                  This request has been marked as done.
                </p>
              </div>
            ) : (
              <button
                onClick={handleMarkAsDone}
                disabled={completingRequest || detailData.status === "COMPLETED"}
                style={{
                  width: '100%',
                  padding: '1rem',
                  fontSize: '1rem',
                  fontWeight: '700',
                  background: detailData.status === "COMPLETED" 
                    ? 'rgba(16,185,129,0.2)'
                    : 'linear-gradient(135deg, #10b981, #059669)',
                  border: detailData.status === "COMPLETED" ? '2px solid rgba(16,185,129,0.3)' : 'none',
                  borderRadius: '12px',
                  color: detailData.status === "COMPLETED" ? '#10b981' : 'white',
                  cursor: detailData.status === "COMPLETED" ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s ease',
                  opacity: completingRequest ? 0.7 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem'
                }}
                onMouseEnter={(e) => {
                  if (detailData.status !== "COMPLETED" && !completingRequest) {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 6px 20px rgba(16,185,129,0.4)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = 'none';
                }}
              >
                <CheckCircle2 size={20} />
                {completingRequest ? "Completing..." : detailData.status === "COMPLETED" ? "Already Completed" : "Mark as Done"}
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
