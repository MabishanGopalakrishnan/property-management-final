// src/pages/Payments.jsx
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
  getMyPayments,
  getLandlordPayments,
  payPayment,
} from "../api/payments";
import { DollarSign, Calendar, TrendingUp, AlertCircle, CheckCircle } from "lucide-react";

function formatDate(val) {
  if (!val) return "-";
  const d = new Date(val);
  return isNaN(d.getTime()) ? "-" : d.toLocaleDateString();
}

function formatMoney(val) {
  return val == null ? "-" : `$${Number(val).toFixed(2)}`;
}

function computeStatus(payment) {
  if (payment.status === "PAID") return "PAID";
  if (payment.status === "FAILED") return "FAILED";

  const now = new Date();
  const due = payment.dueDate ? new Date(payment.dueDate) : null;

  if (due && due < now) return "LATE";
  return "PENDING";
}

export default function Payments() {
  const { user } = useAuth();
  const isTenant = user?.role === "TENANT";
  const isLandlord = user?.role === "LANDLORD";

  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const load = async () => {
    if (!user) return;

    setLoading(true);
    setError("");

    try {
      const data = isTenant ? await getMyPayments()
                            : await getLandlordPayments();
      setPayments(data);
    } catch (err) {
      console.error(err);
      setError("Failed to load payments.");
    }

    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [user?.role]);

  const handlePay = async (id) => {
    if (!confirm("Mark this payment as paid?")) return;

    try {
      setSubmitting(true);
      await payPayment(id);
      await load();
    } catch (err) {
      console.error(err);
      alert("Failed to mark as paid.");
    }

    setSubmitting(false);
  };

  // Calculate KPIs
  const totalPayments = payments.filter(p => p.status === "PAID").reduce((sum, p) => sum + (p.amount || 0), 0);
  const paidPayments = payments.filter(p => p.status === "PAID").reduce((sum, p) => sum + (p.amount || 0), 0);
  const pendingPayments = payments.filter(p => {
    const status = computeStatus(p);
    return status === "PENDING";
  }).reduce((sum, p) => sum + (p.amount || 0), 0);
  const latePayments = payments.filter(p => {
    const status = computeStatus(p);
    return status === "LATE";
  }).reduce((sum, p) => sum + (p.amount || 0), 0);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
      padding: '2rem',
      color: '#e2e8f0'
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
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.8; }
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
        Payment Management
      </h1>

      {error && (
        <div style={{
          padding: '1rem',
          background: 'rgba(239,68,68,0.15)',
          border: '1px solid rgba(239,68,68,0.3)',
          borderRadius: '12px',
          color: '#ef4444',
          marginBottom: '1.5rem',
          animation: 'slideIn 0.5s ease-out'
        }}>
          {error}
        </div>
      )}

      {/* KPI Dashboard */}
      {isLandlord && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '1.5rem',
          marginBottom: '3rem'
        }}>
          {/* Total Revenue */}
          <div style={{
            background: 'rgba(255,255,255,0.03)',
            backdropFilter: 'blur(20px)',
            borderRadius: '16px',
            padding: '1.5rem',
            border: '1px solid rgba(6,182,212,0.3)',
            animation: 'slideIn 0.6s ease-out',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.boxShadow = '0 8px 25px rgba(6,182,212,0.2)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              marginBottom: '1rem'
            }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #06b6d4, #3b82f6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <DollarSign size={28} style={{ color: 'white' }} />
              </div>
              <div>
                <p style={{
                  fontSize: '0.75rem',
                  textTransform: 'uppercase',
                  color: '#94a3b8',
                  marginBottom: '0.25rem',
                  letterSpacing: '0.05em'
                }}>
                  Total Revenue
                </p>
                <h2 style={{
                  fontSize: '1.75rem',
                  fontWeight: '700',
                  color: '#e2e8f0',
                  margin: 0
                }}>
                  ${totalPayments.toFixed(2)}
                </h2>
              </div>
            </div>
          </div>

          {/* Paid */}
          <div style={{
            background: 'rgba(255,255,255,0.03)',
            backdropFilter: 'blur(20px)',
            borderRadius: '16px',
            padding: '1.5rem',
            border: '1px solid rgba(16,185,129,0.3)',
            animation: 'slideIn 0.6s ease-out 0.1s backwards',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.boxShadow = '0 8px 25px rgba(16,185,129,0.2)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              marginBottom: '1rem'
            }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #10b981, #14b8a6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <CheckCircle size={28} style={{ color: 'white' }} />
              </div>
              <div>
                <p style={{
                  fontSize: '0.75rem',
                  textTransform: 'uppercase',
                  color: '#94a3b8',
                  marginBottom: '0.25rem',
                  letterSpacing: '0.05em'
                }}>
                  Paid
                </p>
                <h2 style={{
                  fontSize: '1.75rem',
                  fontWeight: '700',
                  color: '#10b981',
                  margin: 0
                }}>
                  ${paidPayments.toFixed(2)}
                </h2>
              </div>
            </div>
          </div>

          {/* Pending */}
          <div style={{
            background: 'rgba(255,255,255,0.03)',
            backdropFilter: 'blur(20px)',
            borderRadius: '16px',
            padding: '1.5rem',
            border: '1px solid rgba(251,191,36,0.3)',
            animation: 'slideIn 0.6s ease-out 0.2s backwards',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.boxShadow = '0 8px 25px rgba(251,191,36,0.2)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              marginBottom: '1rem'
            }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <TrendingUp size={28} style={{ color: 'white' }} />
              </div>
              <div>
                <p style={{
                  fontSize: '0.75rem',
                  textTransform: 'uppercase',
                  color: '#94a3b8',
                  marginBottom: '0.25rem',
                  letterSpacing: '0.05em'
                }}>
                  Pending
                </p>
                <h2 style={{
                  fontSize: '1.75rem',
                  fontWeight: '700',
                  color: '#fbbf24',
                  margin: 0
                }}>
                  ${pendingPayments.toFixed(2)}
                </h2>
              </div>
            </div>
          </div>

          {/* Late */}
          <div style={{
            background: 'rgba(255,255,255,0.03)',
            backdropFilter: 'blur(20px)',
            borderRadius: '16px',
            padding: '1.5rem',
            border: '1px solid rgba(239,68,68,0.3)',
            animation: 'slideIn 0.6s ease-out 0.3s backwards',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.boxShadow = '0 8px 25px rgba(239,68,68,0.2)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              marginBottom: '1rem'
            }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                animation: 'pulse 2s infinite'
              }}>
                <AlertCircle size={28} style={{ color: 'white' }} />
              </div>
              <div>
                <p style={{
                  fontSize: '0.75rem',
                  textTransform: 'uppercase',
                  color: '#94a3b8',
                  marginBottom: '0.25rem',
                  letterSpacing: '0.05em'
                }}>
                  Late
                </p>
                <h2 style={{
                  fontSize: '1.75rem',
                  fontWeight: '700',
                  color: '#ef4444',
                  margin: 0
                }}>
                  ${latePayments.toFixed(2)}
                </h2>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payments Table */}
      <div style={{
        background: 'rgba(255,255,255,0.03)',
        backdropFilter: 'blur(20px)',
        borderRadius: '16px',
        overflow: 'hidden',
        border: '1px solid rgba(255,255,255,0.1)',
        animation: 'fadeIn 0.8s ease-out 0.4s backwards'
      }}>
        {loading ? (
          <div style={{
            padding: '3rem',
            textAlign: 'center',
            color: '#94a3b8'
          }}>
            Loading payments...
          </div>
        ) : payments.length === 0 ? (
          <div style={{
            padding: '3rem',
            textAlign: 'center',
            color: '#94a3b8',
            fontStyle: 'italic'
          }}>
            No payments found.
          </div>
        ) : (
          <table style={{
            width: '100%',
            borderCollapse: 'collapse'
          }}>
            <thead>
              <tr style={{
                background: 'rgba(255,255,255,0.05)',
                borderBottom: '1px solid rgba(255,255,255,0.1)'
              }}>
                {isLandlord && (
                  <th style={{
                    padding: '1rem',
                    textAlign: 'left',
                    fontSize: '0.8rem',
                    textTransform: 'uppercase',
                    color: '#94a3b8',
                    fontWeight: '600',
                    letterSpacing: '0.05em'
                  }}>
                    Property
                  </th>
                )}
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
                {isLandlord && (
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
                )}
                <th style={{
                  padding: '1rem',
                  textAlign: 'left',
                  fontSize: '0.8rem',
                  textTransform: 'uppercase',
                  color: '#94a3b8',
                  fontWeight: '600',
                  letterSpacing: '0.05em'
                }}>
                  Due Date
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
                  Amount
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
                  Paid At
                </th>
                {isTenant && (
                  <th style={{
                    padding: '1rem',
                    textAlign: 'center',
                    fontSize: '0.8rem',
                    textTransform: 'uppercase',
                    color: '#94a3b8',
                    fontWeight: '600',
                    letterSpacing: '0.05em'
                  }}>
                    Action
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {payments.map((p, idx) => {
                const lease = p.lease;
                const unit = lease?.unit;
                const property = unit?.property;
                const tenant = lease?.tenant?.user;
                const status = computeStatus(p);

                const statusColors = {
                  PAID: { bg: 'rgba(16,185,129,0.15)', border: 'rgba(16,185,129,0.3)', text: '#10b981', dot: '#10b981' },
                  PENDING: { bg: 'rgba(251,191,36,0.15)', border: 'rgba(251,191,36,0.3)', text: '#fbbf24', dot: '#fbbf24' },
                  LATE: { bg: 'rgba(239,68,68,0.15)', border: 'rgba(239,68,68,0.3)', text: '#ef4444', dot: '#ef4444' },
                  FAILED: { bg: 'rgba(148,163,184,0.15)', border: 'rgba(148,163,184,0.3)', text: '#94a3b8', dot: '#94a3b8' }
                };

                const color = statusColors[status] || statusColors.PENDING;

                return (
                  <tr
                    key={p.id}
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
                    {isLandlord && (
                      <td style={{
                        padding: '1rem',
                        color: '#e2e8f0',
                        fontSize: '0.9rem'
                      }}>
                        {property ? `${property.title} — ${property.city}` : "-"}
                      </td>
                    )}
                    <td style={{
                      padding: '1rem',
                      color: '#e2e8f0',
                      fontWeight: '500'
                    }}>
                      {unit ? unit.unitNumber : "-"}
                    </td>
                    {isLandlord && (
                      <td style={{
                        padding: '1rem',
                        color: '#e2e8f0',
                        fontSize: '0.9rem'
                      }}>
                        {tenant ? `${tenant.name}` : "-"}
                      </td>
                    )}
                    <td style={{
                      padding: '1rem',
                      color: '#94a3b8',
                      fontSize: '0.9rem'
                    }}>
                      {formatDate(p.dueDate || p.createdAt)}
                    </td>
                    <td style={{
                      padding: '1rem',
                      color: '#fbbf24',
                      fontWeight: '600',
                      fontSize: '1rem'
                    }}>
                      {formatMoney(p.amount)}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.375rem 0.75rem',
                        borderRadius: '20px',
                        fontSize: '0.8rem',
                        fontWeight: '600',
                        background: color.bg,
                        color: color.text,
                        border: `1px solid ${color.border}`
                      }}>
                        <div style={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          background: color.dot,
                          boxShadow: status === 'LATE' ? `0 0 8px ${color.dot}` : (status === 'PAID' ? `0 0 8px ${color.dot}` : 'none')
                        }} />
                        {status}
                      </div>
                    </td>
                    <td style={{
                      padding: '1rem',
                      color: '#94a3b8',
                      fontSize: '0.9rem'
                    }}>
                      {formatDate(p.paidAt)}
                    </td>
                    {isTenant && (
                      <td style={{
                        padding: '1rem',
                        textAlign: 'center'
                      }}>
                        {status !== "PAID" && status !== "FAILED" && !submitting ? (
                          <button
                            onClick={() => handlePay(p.id)}
                            style={{
                              padding: '0.5rem 1rem',
                              background: 'linear-gradient(135deg, #06b6d4, #3b82f6)',
                              border: 'none',
                              borderRadius: '8px',
                              color: 'white',
                              cursor: 'pointer',
                              fontSize: '0.875rem',
                              fontWeight: '600',
                              transition: 'all 0.2s ease'
                            }}
                            onMouseEnter={(e) => {
                              e.target.style.transform = 'scale(1.05)';
                              e.target.style.boxShadow = '0 4px 15px rgba(6,182,212,0.4)';
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.transform = 'scale(1)';
                              e.target.style.boxShadow = 'none';
                            }}
                          >
                            Pay Now
                          </button>
                        ) : (
                          <span style={{ color: '#94a3b8' }}>-</span>
                        )}
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
