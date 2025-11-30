// src/pages/Dashboard.jsx
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { getMe } from "../api/auth";
import { getManagerAlerts, getManagerStats } from "../api/alerts";

export default function Dashboard() {
  const { user, setUser } = useAuth();
  const [alerts, setAlerts] = useState([]);
  const [loadingAlerts, setLoadingAlerts] = useState(true);
  const [stats, setStats] = useState({
    totalProperties: 0,
    totalUnits: 0,
    occupiedUnits: 0,
    vacantUnits: 0,
    occupancyRate: 0,
    pendingMaintenance: 0,
    overduePayments: 0,
    totalRevenue: 0,
    pendingRevenue: 0,
    activeLeases: 0
  });
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    const refresh = async () => {
      try {
        const me = await getMe();
        if (setUser) setUser(me);
        
        // Fetch alerts and stats for managers
        if (me.role === "LANDLORD") {
          try {
            const [alertsData, statsData] = await Promise.all([
              getManagerAlerts(),
              getManagerStats()
            ]);
            setAlerts(alertsData || []);
            setStats(statsData || stats);
          } catch (err) {
            console.error("Failed to fetch dashboard data:", err);
            setAlerts([]);
          } finally {
            setLoadingAlerts(false);
            setLoadingStats(false);
          }
        } else {
          setLoadingAlerts(false);
          setLoadingStats(false);
        }
      } catch (e) {
        console.error("Failed to refresh /me:", e);
        setLoadingAlerts(false);
        setLoadingStats(false);
      }
    };
    refresh();
  }, []);

  if (!user) {
    return (
      <div className="center-page">
        <div className="loader" />
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div style={{ 
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)', 
      minHeight: '100vh', 
      padding: '2rem',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Animated background elements */}
      <div style={{
        position: 'absolute',
        top: '10%',
        right: '10%',
        width: '400px',
        height: '400px',
        background: 'radial-gradient(circle, rgba(6, 182, 212, 0.15) 0%, transparent 70%)',
        borderRadius: '50%',
        filter: 'blur(60px)',
        animation: 'float 8s ease-in-out infinite',
        pointerEvents: 'none'
      }} />
      <div style={{
        position: 'absolute',
        bottom: '10%',
        left: '5%',
        width: '300px',
        height: '300px',
        background: 'radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, transparent 70%)',
        borderRadius: '50%',
        filter: 'blur(60px)',
        animation: 'float 10s ease-in-out infinite reverse',
        pointerEvents: 'none'
      }} />
      
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          50% { transform: translateY(-20px) translateX(20px); }
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        .stat-card {
          animation: slideIn 0.5s ease-out forwards;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .stat-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.2);
        }
        .alert-card {
          animation: slideIn 0.4s ease-out forwards;
          transition: all 0.2s ease;
        }
        .alert-card:hover {
          transform: translateX(4px);
        }
      `}</style>
      
      <div style={{ maxWidth: '1400px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
        {/* Header with gradient text */}
        <div style={{ marginBottom: '3rem', textAlign: 'center' }}>
          <h1 style={{ 
            fontSize: '2.5rem', 
            fontWeight: '800', 
            background: 'linear-gradient(135deg, #ffffff 0%, #06b6d4 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            marginBottom: '0.75rem',
            letterSpacing: '-0.02em'
          }}>
            Dashboard Overview
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '1rem', fontWeight: '500' }}>
            Welcome back, <span style={{ color: '#e2e8f0' }}>{user?.email}</span> • 
            <span style={{ 
              color: '#06b6d4', 
              fontWeight: '600',
              marginLeft: '0.5rem',
              padding: '0.25rem 0.75rem',
              background: 'rgba(6, 182, 212, 0.1)',
              borderRadius: '9999px',
              border: '1px solid rgba(6, 182, 212, 0.3)'
            }}>Manager</span>
          </p>
        </div>

        {/* Stats Grid */}
        {user?.role === "LANDLORD" && (
          <>
            {loadingStats ? (
              <div style={{ 
                display: 'flex', 
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '4rem',
                gap: '1rem'
              }}>
                <div className="loader" style={{ margin: '0 auto' }} />
                <p style={{ color: '#94a3b8', fontSize: '0.95rem' }}>Loading dashboard data...</p>
              </div>
            ) : (
              <>
                {/* Main Stats Cards */}
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
                  gap: '1.5rem',
                  marginBottom: '2rem'
                }}>
                  {/* Properties Card */}
                  <div className="stat-card" style={{
                    background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(59, 130, 246, 0.05) 100%)',
                    backdropFilter: 'blur(20px)',
                    borderRadius: '1.25rem',
                    padding: '2rem',
                    border: '1px solid rgba(59, 130, 246, 0.2)',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.2)',
                    position: 'relative',
                    overflow: 'hidden'
                  }}>
                    <div style={{ position: 'absolute', top: '-20px', right: '-20px', fontSize: '8rem', opacity: '0.05' }}>🏢</div>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                      <div>
                        <div style={{ color: '#94a3b8', fontSize: '0.875rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
                          Total Properties
                        </div>
                        <div style={{ fontSize: '3rem', fontWeight: '800', color: '#ffffff', lineHeight: '1' }}>
                          {stats.totalProperties}
                        </div>
                      </div>
                      <div style={{ 
                        width: '4rem', 
                        height: '4rem', 
                        borderRadius: '1rem',
                        background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '2rem',
                        boxShadow: '0 10px 15px -3px rgba(59, 130, 246, 0.4)'
                      }}>
                        🏢
                      </div>
                    </div>
                    <div style={{ 
                      padding: '0.75rem 1rem',
                      background: 'rgba(59, 130, 246, 0.1)',
                      borderRadius: '0.75rem',
                      border: '1px solid rgba(59, 130, 246, 0.2)'
                    }}>
                      <span style={{ color: '#93c5fd', fontSize: '0.875rem', fontWeight: '600' }}>
                        Active Listings
                      </span>
                    </div>
                  </div>

                  {/* Occupancy Card */}
                  <div className="stat-card" style={{
                    background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(16, 185, 129, 0.05) 100%)',
                    backdropFilter: 'blur(20px)',
                    borderRadius: '1.25rem',
                    padding: '2rem',
                    border: '1px solid rgba(16, 185, 129, 0.2)',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.2)',
                    position: 'relative',
                    overflow: 'hidden'
                  }}>
                    <div style={{ position: 'absolute', top: '-20px', right: '-20px', fontSize: '8rem', opacity: '0.05' }}>🏠</div>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                      <div>
                        <div style={{ color: '#94a3b8', fontSize: '0.875rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
                          Occupancy Rate
                        </div>
                        <div style={{ fontSize: '3rem', fontWeight: '800', color: '#ffffff', lineHeight: '1' }}>
                          {stats.occupancyRate}%
                        </div>
                      </div>
                      <div style={{ 
                        width: '4rem', 
                        height: '4rem', 
                        borderRadius: '1rem',
                        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '2rem',
                        boxShadow: '0 10px 15px -3px rgba(16, 185, 129, 0.4)'
                      }}>
                        🏠
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <div style={{ 
                        flex: 1,
                        padding: '0.75rem',
                        background: 'rgba(16, 185, 129, 0.1)',
                        borderRadius: '0.75rem',
                        textAlign: 'center',
                        border: '1px solid rgba(16, 185, 129, 0.2)'
                      }}>
                        <div style={{ color: '#6ee7b7', fontSize: '1.25rem', fontWeight: '700' }}>{stats.occupiedUnits}</div>
                        <div style={{ color: '#94a3b8', fontSize: '0.75rem', fontWeight: '600' }}>Occupied</div>
                      </div>
                      <div style={{ 
                        flex: 1,
                        padding: '0.75rem',
                        background: 'rgba(249, 115, 22, 0.1)',
                        borderRadius: '0.75rem',
                        textAlign: 'center',
                        border: '1px solid rgba(249, 115, 22, 0.2)'
                      }}>
                        <div style={{ color: '#fdba74', fontSize: '1.25rem', fontWeight: '700' }}>{stats.vacantUnits}</div>
                        <div style={{ color: '#94a3b8', fontSize: '0.75rem', fontWeight: '600' }}>Vacant</div>
                      </div>
                    </div>
                  </div>

                  {/* Revenue Card */}
                  <div className="stat-card" style={{
                    background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.1) 0%, rgba(6, 182, 212, 0.05) 100%)',
                    backdropFilter: 'blur(20px)',
                    borderRadius: '1.25rem',
                    padding: '2rem',
                    border: '1px solid rgba(6, 182, 212, 0.2)',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.2)',
                    position: 'relative',
                    overflow: 'hidden'
                  }}>
                    <div style={{ position: 'absolute', top: '-20px', right: '-20px', fontSize: '8rem', opacity: '0.05' }}>💰</div>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                      <div>
                        <div style={{ color: '#94a3b8', fontSize: '0.875rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
                          Total Revenue
                        </div>
                        <div style={{ fontSize: '2.5rem', fontWeight: '800', color: '#ffffff', lineHeight: '1' }}>
                          ${parseFloat(stats.totalRevenue || 0).toLocaleString()}
                        </div>
                      </div>
                      <div style={{ 
                        width: '4rem', 
                        height: '4rem', 
                        borderRadius: '1rem',
                        background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '2rem',
                        boxShadow: '0 10px 15px -3px rgba(6, 182, 212, 0.4)'
                      }}>
                        💰
                      </div>
                    </div>
                    <div style={{ 
                      padding: '0.75rem 1rem',
                      background: 'rgba(6, 182, 212, 0.1)',
                      borderRadius: '0.75rem',
                      border: '1px solid rgba(6, 182, 212, 0.2)'
                    }}>
                      <span style={{ color: '#67e8f9', fontSize: '0.875rem', fontWeight: '600' }}>
                        💵 ${parseFloat(stats.pendingRevenue || 0).toLocaleString()} Pending
                      </span>
                    </div>
                  </div>

                  {/* Active Leases Card */}
                  <div className="stat-card" style={{
                    background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.1) 0%, rgba(168, 85, 247, 0.05) 100%)',
                    backdropFilter: 'blur(20px)',
                    borderRadius: '1.25rem',
                    padding: '2rem',
                    border: '1px solid rgba(168, 85, 247, 0.2)',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.2)',
                    position: 'relative',
                    overflow: 'hidden'
                  }}>
                    <div style={{ position: 'absolute', top: '-20px', right: '-20px', fontSize: '8rem', opacity: '0.05' }}>📋</div>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                      <div>
                        <div style={{ color: '#94a3b8', fontSize: '0.875rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
                          Active Leases
                        </div>
                        <div style={{ fontSize: '3rem', fontWeight: '800', color: '#ffffff', lineHeight: '1' }}>
                          {stats.activeLeases}
                        </div>
                      </div>
                      <div style={{ 
                        width: '4rem', 
                        height: '4rem', 
                        borderRadius: '1rem',
                        background: 'linear-gradient(135deg, #a855f7 0%, #9333ea 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '2rem',
                        boxShadow: '0 10px 15px -3px rgba(168, 85, 247, 0.4)'
                      }}>
                        📋
                      </div>
                    </div>
                    <div style={{ 
                      padding: '0.75rem 1rem',
                      background: 'rgba(168, 85, 247, 0.1)',
                      borderRadius: '0.75rem',
                      border: '1px solid rgba(168, 85, 247, 0.2)'
                    }}>
                      <span style={{ color: '#c4b5fd', fontSize: '0.875rem', fontWeight: '600' }}>
                        Current Agreements
                      </span>
                    </div>
                  </div>
                </div>

                {/* Action Items - Compact Row */}
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', 
                  gap: '1rem',
                  marginBottom: '2rem'
                }}>
                  <div className="stat-card" style={{
                    background: stats.overduePayments > 0 ? 'rgba(239, 68, 68, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: '1rem',
                    padding: '1.5rem',
                    border: `2px solid ${stats.overduePayments > 0 ? 'rgba(239, 68, 68, 0.4)' : 'rgba(255, 255, 255, 0.1)'}`,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1.25rem'
                  }}>
                    <div style={{ 
                      fontSize: '2.5rem',
                      filter: stats.overduePayments > 0 ? 'none' : 'grayscale(1)',
                      animation: stats.overduePayments > 0 ? 'pulse 2s ease-in-out infinite' : 'none'
                    }}>
                      {stats.overduePayments > 0 ? '⚠️' : '✅'}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '2rem', fontWeight: '800', color: stats.overduePayments > 0 ? '#fca5a5' : '#6ee7b7' }}>
                        {stats.overduePayments}
                      </div>
                      <div style={{ fontSize: '0.875rem', color: '#cbd5e1', fontWeight: '600' }}>
                        Overdue Payments
                      </div>
                    </div>
                  </div>

                  <div className="stat-card" style={{
                    background: stats.pendingMaintenance > 0 ? 'rgba(249, 115, 22, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: '1rem',
                    padding: '1.5rem',
                    border: `2px solid ${stats.pendingMaintenance > 0 ? 'rgba(249, 115, 22, 0.4)' : 'rgba(255, 255, 255, 0.1)'}`,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1.25rem'
                  }}>
                    <div style={{ 
                      fontSize: '2.5rem',
                      filter: stats.pendingMaintenance > 0 ? 'none' : 'grayscale(1)'
                    }}>
                      {stats.pendingMaintenance > 0 ? '🔧' : '✅'}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '2rem', fontWeight: '800', color: stats.pendingMaintenance > 0 ? '#fdba74' : '#6ee7b7' }}>
                        {stats.pendingMaintenance}
                      </div>
                      <div style={{ fontSize: '0.875rem', color: '#cbd5e1', fontWeight: '600' }}>
                        Pending Maintenance
                      </div>
                    </div>
                  </div>
                </div>

                {/* Alerts Section - Premium Design */}
                <div style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  backdropFilter: 'blur(20px)',
                  borderRadius: '1.25rem',
                  padding: '2rem',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  boxShadow: '0 8px 16px -4px rgba(0, 0, 0, 0.3)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                    <div style={{
                      width: '3rem',
                      height: '3rem',
                      borderRadius: '0.75rem',
                      background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.5rem',
                      boxShadow: '0 4px 6px -1px rgba(245, 158, 11, 0.4)'
                    }}>
                      🔔
                    </div>
                    <div>
                      <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#ffffff', margin: 0 }}>
                        Important Alerts
                      </h2>
                      <p style={{ fontSize: '0.875rem', color: '#94a3b8', margin: 0 }}>
                        Real-time notifications and action items
                      </p>
                    </div>
                  </div>
                  
                  {loadingAlerts ? (
                    <div style={{ padding: '3rem', textAlign: 'center' }}>
                      <div className="loader" style={{ margin: '0 auto 1rem' }} />
                      <p style={{ color: '#94a3b8', fontSize: '0.95rem' }}>Loading alerts...</p>
                    </div>
                  ) : alerts.length === 0 ? (
                    <div style={{
                      padding: '3rem',
                      textAlign: 'center',
                      background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(16, 185, 129, 0.05) 100%)',
                      border: '2px solid rgba(16, 185, 129, 0.3)',
                      borderRadius: '1rem'
                    }}>
                      <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>✓</div>
                      <div style={{ fontSize: '1.25rem', fontWeight: '700', color: '#6ee7b7', marginBottom: '0.5rem' }}>
                        All Clear!
                      </div>
                      <p style={{ color: '#94a3b8', fontSize: '0.95rem' }}>
                        No urgent alerts at the moment. Everything is running smoothly.
                      </p>
                    </div>
                  ) : (
                    <div style={{ display: 'grid', gap: '1rem' }}>
                      {alerts.map((alert, idx) => (
                        <div
                          key={idx}
                          className="alert-card"
                          style={{
                            padding: '1.25rem',
                            borderRadius: '1rem',
                            border: '2px solid',
                            borderColor: alert.type === 'urgent' ? 'rgba(239, 68, 68, 0.4)' : alert.type === 'warning' ? 'rgba(249, 115, 22, 0.4)' : 'rgba(59, 130, 246, 0.4)',
                            background: alert.type === 'urgent' ? 'rgba(239, 68, 68, 0.15)' : alert.type === 'warning' ? 'rgba(249, 115, 22, 0.15)' : 'rgba(59, 130, 246, 0.15)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '1.25rem',
                            animationDelay: `${idx * 0.1}s`
                          }}
                        >
                          <span style={{ fontSize: '2rem', flexShrink: 0 }}>
                            {alert.type === 'urgent' ? '🚨' : alert.type === 'warning' ? '⚠️' : 'ℹ️'}
                          </span>
                          <div style={{ flex: 1 }}>
                            <div style={{ 
                              fontWeight: '700', 
                              color: alert.type === 'urgent' ? '#fca5a5' : alert.type === 'warning' ? '#fdba74' : '#93c5fd',
                              marginBottom: '0.375rem',
                              fontSize: '1.05rem'
                            }}>
                              {alert.title}
                            </div>
                            <div style={{ 
                              fontSize: '0.9rem',
                              color: '#e2e8f0',
                              lineHeight: '1.5'
                            }}>
                              {alert.message}
                            </div>
                          </div>
                          {alert.link && (
                            <a 
                              href={alert.link} 
                              style={{ 
                                fontSize: '0.875rem', 
                                color: '#06b6d4', 
                                fontWeight: '700',
                                textDecoration: 'none',
                                whiteSpace: 'nowrap',
                                padding: '0.5rem 1rem',
                                background: 'rgba(6, 182, 212, 0.1)',
                                borderRadius: '0.5rem',
                                border: '1px solid rgba(6, 182, 212, 0.3)',
                                transition: 'all 0.2s'
                              }}
                            >
                              View →
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
