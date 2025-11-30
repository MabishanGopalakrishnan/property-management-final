// src/pages/tenant/TenantHome.jsx
import { useEffect, useState, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { 
  Home, 
  DollarSign, 
  Wrench, 
  FileText, 
  Mail, 
  Phone, 
  Clock,
  AlertCircle,
  CheckCircle,
  Download,
  Calendar,
  ChevronRight
} from "lucide-react";
import { getTenantOverview } from "../../api/tenantPortal";
import { getTenantAlerts } from "../../api/alerts";
import { getTenantMaintenance } from "../../api/tenantPortal";
import Logo from "../../components/Logo";

// Scroll reveal component for maintenance items
function ScrollRevealItem({ children, index }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{
        duration: 0.5,
        delay: index * 0.1,
        ease: [0.22, 1, 0.36, 1]
      }}
    >
      {children}
    </motion.div>
  );
}

export default function TenantHome() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [overview, setOverview] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [loadingAlerts, setLoadingAlerts] = useState(true);
  const [maintenanceRequests, setMaintenanceRequests] = useState([]);

  useEffect(() => {
    // Load overview
    getTenantOverview()
      .then((data) => setOverview(data))
      .catch((err) => {
        console.error("Tenant overview error:", err);
        setError("Failed to load tenant overview.");
      })
      .finally(() => setLoading(false));

    // Load alerts
    getTenantAlerts()
      .then((data) => setAlerts(data || []))
      .catch((err) => {
        console.error("Failed to load alerts:", err);
        setAlerts([]);
      })
      .finally(() => setLoadingAlerts(false));

    // Load maintenance requests
    getTenantMaintenance()
      .then((data) => setMaintenanceRequests(Array.isArray(data) ? data.slice(0, 5) : []))
      .catch((err) => {
        console.error("Failed to load maintenance:", err);
        setMaintenanceRequests([]);
      });
  }, []);

  if (loading) {
    return (
      <div className="tenant-page" style={{ position: 'relative', overflow: 'hidden' }}>
        <motion.div
          animate={{
            x: [0, 100, 0],
            y: [0, 50, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          style={{
            position: 'absolute',
            top: '10%',
            right: '20%',
            width: '600px',
            height: '600px',
            background: 'radial-gradient(circle, rgba(6, 182, 212, 0.15) 0%, transparent 70%)',
            borderRadius: '50%',
            pointerEvents: 'none',
            zIndex: 0,
            filter: 'blur(60px)'
          }}
        />
        <div className="tenant-card center" style={{ position: 'relative', zIndex: 1 }}>
          <div className="loader" />
          <p>Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  const lease = overview?.lease;
  const payments = overview?.payments;
  const tenantName =
    overview?.tenant?.name ||
    overview?.tenant?.email?.split("@")[0] ||
    "Tenant";

  // Sample documents
  const documents = lease ? [
    { id: 1, name: "Lease Agreement.pdf", date: lease.startDate, size: "245 KB" },
    { id: 2, name: "Move-in Checklist.pdf", date: lease.startDate, size: "128 KB" },
    { id: 3, name: "Property Rules & Guidelines.pdf", date: lease.startDate, size: "92 KB" },
  ] : [];

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: [0.22, 1, 0.36, 1]
      }
    }
  };

  const cardHover = {
    scale: 1.02,
    y: -4,
    transition: {
      duration: 0.2,
      ease: "easeOut"
    }
  };

  const tapEffect = {
    scale: 0.98,
    transition: {
      duration: 0.1
    }
  };

  const getPriorityColor = (priority) => {
    switch(priority?.toUpperCase()) {
      case 'URGENT': return { bg: 'rgba(239, 68, 68, 0.15)', border: 'rgba(239, 68, 68, 0.4)', text: '#fca5a5' };
      case 'HIGH': return { bg: 'rgba(251, 146, 60, 0.15)', border: 'rgba(251, 146, 60, 0.4)', text: '#fdba74' };
      case 'MEDIUM': return { bg: 'rgba(234, 179, 8, 0.15)', border: 'rgba(234, 179, 8, 0.4)', text: '#fde047' };
      default: return { bg: 'rgba(59, 130, 246, 0.15)', border: 'rgba(59, 130, 246, 0.4)', text: '#93c5fd' };
    }
  };

  const getStatusColor = (status) => {
    switch(status?.toUpperCase()) {
      case 'COMPLETED': return { bg: 'rgba(34, 197, 94, 0.15)', border: 'rgba(34, 197, 94, 0.4)', text: '#86efac' };
      case 'IN_PROGRESS': return { bg: 'rgba(59, 130, 246, 0.15)', border: 'rgba(59, 130, 246, 0.4)', text: '#93c5fd' };
      case 'PENDING': return { bg: 'rgba(234, 179, 8, 0.15)', border: 'rgba(234, 179, 8, 0.4)', text: '#fde047' };
      default: return { bg: 'rgba(148, 163, 184, 0.15)', border: 'rgba(148, 163, 184, 0.4)', text: '#cbd5e1' };
    }
  };

  return (
    <div className="tenant-page" style={{ padding: '2rem', position: 'relative', overflow: 'hidden' }}>
      {/* Ambient background glow animations */}
      <motion.div
        animate={{
          x: [0, 150, -50, 0],
          y: [0, -80, 100, 0],
          scale: [1, 1.3, 0.9, 1],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        style={{
          position: 'absolute',
          top: '15%',
          right: '10%',
          width: '700px',
          height: '700px',
          background: 'radial-gradient(circle, rgba(6, 182, 212, 0.12) 0%, transparent 70%)',
          borderRadius: '50%',
          pointerEvents: 'none',
          zIndex: 0,
          filter: 'blur(80px)'
        }}
      />
      
      <motion.div
        animate={{
          x: [0, -100, 50, 0],
          y: [0, 120, -60, 0],
          scale: [1, 0.8, 1.2, 1],
        }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 5
        }}
        style={{
          position: 'absolute',
          bottom: '20%',
          left: '5%',
          width: '500px',
          height: '500px',
          background: 'radial-gradient(circle, rgba(59, 130, 246, 0.1) 0%, transparent 70%)',
          borderRadius: '50%',
          pointerEvents: 'none',
          zIndex: 0,
          filter: 'blur(70px)'
        }}
      />

      <div style={{ position: 'relative', zIndex: 1 }}>
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="tenant-alert error"
          >
            {error}
          </motion.div>
        )}

        {/* Header Section */}
        <motion.section 
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          style={{ marginBottom: '2.5rem' }}
        >
          <motion.div 
            variants={itemVariants}
            style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}
          >
            <Logo size="normal" variant="icon" />
            <div>
              <h1 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: '800', margin: 0, color: '#f8fafc', lineHeight: '1.2' }}>
                Welcome back, <span style={{ background: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{tenantName}</span>! 👋
              </h1>
              <p style={{ margin: '0.5rem 0 0 0', color: '#cbd5e1', fontSize: 'clamp(0.95rem, 2vw, 1.05rem)', fontWeight: '500' }}>
                Everything you need to manage your home in one place.
              </p>
            </div>
          </motion.div>
        </motion.section>

        {/* Alerts Section */}
        <motion.section 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          style={{ marginBottom: '2.5rem' }}
        >
          <motion.h2 
            variants={itemVariants}
            style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1rem', color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}
          >
            <AlertCircle size={24} /> Important Alerts
          </motion.h2>
          
          {loadingAlerts ? (
            <motion.div 
              variants={itemVariants}
              style={{ 
                padding: '2rem', 
                textAlign: 'center',
                background: 'rgba(248, 250, 252, 0.05)',
                borderRadius: '1rem',
                border: '1px solid rgba(226, 232, 240, 0.1)'
              }}
            >
              <div className="loader" style={{ margin: '0 auto 1rem' }} />
              <p style={{ color: '#94a3b8' }}>Loading alerts...</p>
            </motion.div>
          ) : alerts.length === 0 ? (
            <motion.div 
              variants={itemVariants}
              whileHover={cardHover}
              style={{
                padding: '2rem',
                textAlign: 'center',
                background: 'rgba(34, 197, 94, 0.1)',
                border: '1px solid rgba(34, 197, 94, 0.3)',
                borderRadius: '1rem',
                boxShadow: '0 0 20px rgba(34, 197, 94, 0.1)'
              }}
            >
              <CheckCircle size={48} style={{ color: '#22c55e', margin: '0 auto 0.75rem', display: 'block' }} />
              <strong style={{ color: '#22c55e', fontSize: '1.1rem' }}>All Good!</strong>
              <p style={{ color: '#86efac', marginTop: '0.5rem' }}>No urgent alerts at the moment.</p>
            </motion.div>
          ) : (
            <motion.div variants={containerVariants} style={{ display: 'grid', gap: '1rem' }}>
              {alerts.map((alert, idx) => (
                <motion.div
                  key={idx}
                  variants={itemVariants}
                  whileHover={cardHover}
                  whileTap={tapEffect}
                  style={{
                    padding: '1.25rem 1.5rem',
                    borderRadius: '1rem',
                    border: '1px solid',
                    borderColor: alert.type === 'urgent' ? 'rgba(239, 68, 68, 0.4)' : alert.type === 'warning' ? 'rgba(234, 179, 8, 0.4)' : 'rgba(59, 130, 246, 0.4)',
                    background: alert.type === 'urgent' ? 'rgba(239, 68, 68, 0.1)' : alert.type === 'warning' ? 'rgba(234, 179, 8, 0.1)' : 'rgba(59, 130, 246, 0.1)',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '1rem',
                    boxShadow: alert.type === 'urgent' ? '0 0 20px rgba(239, 68, 68, 0.2)' : '0 4px 12px rgba(0, 0, 0, 0.1)',
                    cursor: alert.link ? 'pointer' : 'default'
                  }}
                  onClick={() => alert.link && (window.location.href = alert.link)}
                >
                  <span style={{ fontSize: '1.5rem', flexShrink: 0 }}>
                    {alert.type === 'urgent' ? '🚨' : alert.type === 'warning' ? '⚠️' : 'ℹ️'}
                  </span>
                  <div style={{ flex: 1 }}>
                    <div style={{ 
                      fontWeight: '700', 
                      fontSize: '1.1rem',
                      color: '#f1f5f9',
                      marginBottom: '0.5rem'
                    }}>
                      {alert.title}
                    </div>
                    <div style={{ 
                      fontSize: '0.95rem',
                      color: '#cbd5e1',
                      lineHeight: '1.6',
                      fontWeight: '500'
                    }}>
                      {alert.message}
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </motion.section>

        {/* Main Content Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}
        >
          {/* Active Lease Card */}
          <motion.div 
            variants={itemVariants}
            whileHover={cardHover}
            className="tenant-card"
            style={{ 
              border: '1px solid rgba(6, 182, 212, 0.3)',
              boxShadow: '0 0 30px rgba(6, 182, 212, 0.1)'
            }}
          >
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
              <Home size={20} /> Your Lease
            </h2>
            {!lease ? (
              <p className="muted">You don't have any active leases.</p>
            ) : (
              <>
                <p className="highlight" style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>
                  {lease.property?.title} — Unit {lease.unitNumber}
                </p>
                <div style={{ display: 'grid', gap: '0.75rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <span className="label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <DollarSign size={16} /> Monthly Rent:
                    </span>
                    <span className="metric-value">${lease.rent}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <span className="label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Calendar size={16} /> Lease Period:
                    </span>
                  </div>
                  <div style={{ fontSize: '0.9rem', color: '#94a3b8', paddingLeft: '1.5rem' }}>
                    {new Date(lease.startDate).toLocaleDateString()} – {new Date(lease.endDate).toLocaleDateString()}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <span className="label">Status:</span>
                    <span className={`status-badge ${lease.status.toLowerCase()}`}>
                      {lease.status}
                    </span>
                  </div>
                </div>
              </>
            )}
          </motion.div>

          {/* Your Rent Status Card */}
          <motion.div 
            variants={itemVariants}
            whileHover={cardHover}
            className="tenant-card"
            style={{ 
              border: payments?.totalUnpaid > 0 ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid rgba(34, 197, 94, 0.3)',
              boxShadow: payments?.totalUnpaid > 0 ? '0 0 30px rgba(239, 68, 68, 0.1)' : '0 0 30px rgba(34, 197, 94, 0.1)'
            }}
          >
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
              <DollarSign size={20} /> Your Rent Status
            </h2>
            <div style={{ display: 'grid', gap: '1rem' }}>
              <div>
                <p className="label" style={{ marginBottom: '0.5rem' }}>Outstanding Balance</p>
                <p className="metric-value" style={{ fontSize: '2rem', color: payments?.totalUnpaid > 0 ? '#f87171' : '#4ade80' }}>
                  ${payments?.totalUnpaid?.toFixed(2) ?? "0.00"}
                </p>
              </div>
              
              {payments?.totalUnpaid > 0 && payments?.lateCount > 0 && (
                <div style={{ 
                  padding: '1rem', 
                  background: 'rgba(239, 68, 68, 0.1)', 
                  borderRadius: '0.75rem',
                  border: '1px solid rgba(239, 68, 68, 0.3)'
                }}>
                  <p className="label" style={{ color: '#fca5a5', marginBottom: '0.25rem' }}>
                    ⚠️ {payments.lateCount} Late Payment{payments.lateCount !== 1 ? 's' : ''}
                  </p>
                </div>
              )}

              {payments?.upcoming ? (
                <div style={{ 
                  padding: '1rem', 
                  background: 'rgba(6, 182, 212, 0.1)', 
                  borderRadius: '0.75rem',
                  border: '1px solid rgba(6, 182, 212, 0.3)'
                }}>
                  <p className="label" style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Clock size={14} /> Next Payment Due
                  </p>
                  <p className="highlight" style={{ fontSize: '1.1rem' }}>
                    ${payments.upcoming.amount}
                  </p>
                  <p className="muted small" style={{ marginTop: '0.25rem' }}>
                    {new Date(payments.upcoming.dueDate).toLocaleDateString()}
                  </p>
                </div>
              ) : (
                <p className="muted small">No upcoming payments.</p>
              )}
            </div>
          </motion.div>
        </motion.div>

        {/* Maintenance Requests Section */}
        {maintenanceRequests.length > 0 && (
          <motion.section
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            style={{ marginBottom: '2.5rem' }}
          >
            <motion.h2 
              variants={itemVariants}
              style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1rem', color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}
            >
              <Wrench size={24} /> Your Maintenance Requests
            </motion.h2>
            
            <div style={{ display: 'grid', gap: '1rem' }}>
              {maintenanceRequests.map((request, index) => {
                const priorityColors = getPriorityColor(request.priority);
                const statusColors = getStatusColor(request.status);
                
                return (
                  <ScrollRevealItem key={request.id} index={index}>
                    <motion.div
                      whileHover={cardHover}
                      whileTap={tapEffect}
                      className="tenant-card"
                      style={{
                        borderLeft: `4px solid ${priorityColors.border}`,
                        cursor: 'pointer'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap' }}>
                        <div style={{ flex: 1, minWidth: '200px' }}>
                          <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#f1f5f9', marginBottom: '0.5rem' }}>
                            {request.title}
                          </h3>
                          <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '0.75rem', lineHeight: '1.5' }}>
                            {request.description}
                          </p>
                          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                            <span 
                              style={{ 
                                padding: '0.25rem 0.75rem', 
                                borderRadius: '999px', 
                                fontSize: '0.75rem',
                                fontWeight: '700',
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em',
                                background: priorityColors.bg,
                                border: `1px solid ${priorityColors.border}`,
                                color: priorityColors.text
                              }}
                            >
                              {request.priority}
                            </span>
                            <span 
                              style={{ 
                                padding: '0.25rem 0.75rem', 
                                borderRadius: '999px', 
                                fontSize: '0.75rem',
                                fontWeight: '700',
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em',
                                background: statusColors.bg,
                                border: `1px solid ${statusColors.border}`,
                                color: statusColors.text
                              }}
                            >
                              {request.status.replace('_', ' ')}
                            </span>
                          </div>
                        </div>
                        <div style={{ textAlign: 'right', minWidth: '120px' }}>
                          <p className="label" style={{ marginBottom: '0.25rem' }}>Submitted</p>
                          <p style={{ color: '#cbd5e1', fontSize: '0.9rem' }}>
                            {new Date(request.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  </ScrollRevealItem>
                );
              })}
            </div>
            
            <motion.a
              variants={itemVariants}
              href="/tenant/maintenance"
              whileHover={{ x: 5 }}
              whileTap={{ scale: 0.98 }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginTop: '1rem',
                color: '#06b6d4',
                fontWeight: '700',
                fontSize: '0.95rem',
                textDecoration: 'none'
              }}
            >
              View All Requests <ChevronRight size={18} />
            </motion.a>
          </motion.section>
        )}

        {/* Documents & Support Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))', gap: '1.5rem' }}
        >
          {/* Documents Card */}
          {documents.length > 0 && (
            <motion.div 
              variants={itemVariants}
              whileHover={cardHover}
              className="tenant-card"
              style={{ 
                border: '1px solid rgba(148, 163, 184, 0.3)',
                boxShadow: '0 0 30px rgba(148, 163, 184, 0.05)'
              }}
            >
              <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
                <FileText size={20} /> Your Documents
              </h2>
              <div style={{ display: 'grid', gap: '0.75rem' }}>
                {documents.map(doc => (
                  <motion.div
                    key={doc.id}
                    whileHover={{ x: 5 }}
                    whileTap={tapEffect}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '0.75rem',
                      background: 'rgba(148, 163, 184, 0.05)',
                      borderRadius: '0.5rem',
                      border: '1px solid rgba(148, 163, 184, 0.1)',
                      cursor: 'pointer',
                      gap: '0.75rem'
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ color: '#f1f5f9', fontWeight: '600', fontSize: '0.9rem', marginBottom: '0.25rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {doc.name}
                      </p>
                      <p style={{ color: '#94a3b8', fontSize: '0.75rem' }}>
                        {doc.size} • {new Date(doc.date).toLocaleDateString()}
                      </p>
                    </div>
                    <Download size={18} style={{ color: '#06b6d4', flexShrink: 0 }} />
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Support & Contact Card */}
          <motion.div 
            variants={itemVariants}
            whileHover={cardHover}
            className="tenant-card"
            style={{ 
              border: '1px solid rgba(59, 130, 246, 0.3)',
              boxShadow: '0 0 30px rgba(59, 130, 246, 0.1)',
              background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.05) 0%, rgba(59, 130, 246, 0.05) 100%)'
            }}
          >
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
              <Phone size={20} /> Need Help?
            </h2>
            <p style={{ color: '#cbd5e1', marginBottom: '1.5rem', lineHeight: '1.6' }}>
              Our support team is here to assist you with any questions or concerns.
            </p>
            <div style={{ display: 'grid', gap: '0.75rem' }}>
              <motion.a
                href="mailto:support@property.com"
                whileHover={cardHover}
                whileTap={tapEffect}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.875rem 1.25rem',
                  background: 'rgba(6, 182, 212, 0.15)',
                  border: '1px solid rgba(6, 182, 212, 0.3)',
                  borderRadius: '0.75rem',
                  color: '#06b6d4',
                  fontWeight: '700',
                  textDecoration: 'none',
                  fontSize: '0.95rem'
                }}
              >
                <Mail size={18} />
                Email Support
              </motion.a>
              <motion.a
                href="tel:+1234567890"
                whileHover={cardHover}
                whileTap={tapEffect}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.875rem 1.25rem',
                  background: 'rgba(59, 130, 246, 0.15)',
                  border: '1px solid rgba(59, 130, 246, 0.3)',
                  borderRadius: '0.75rem',
                  color: '#3b82f6',
                  fontWeight: '700',
                  textDecoration: 'none',
                  fontSize: '0.95rem'
                }}
              >
                <Phone size={18} />
                Call: (123) 456-7890
              </motion.a>
            </div>
            <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: '1rem', textAlign: 'center' }}>
              Available Monday-Friday, 9am-6pm EST
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
