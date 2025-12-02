import { useState, useEffect, useCallback, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, useMotionValue, useTransform } from "framer-motion";
import { Mail, Lock, Building2, Shield, Wrench, CreditCard, Clock, CheckCircle2 } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import api from "../api/axiosConfig";
import Logo from "../components/Logo";

export default function Login() {
  const navigate = useNavigate();
  const { login: authLogin } = useAuth();

  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  // Card tilt effect
  const cardRef = useRef(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotateX = useTransform(mouseY, [-300, 300], [5, -5]);
  const rotateY = useTransform(mouseX, [-300, 300], [-5, 5]);
  
  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    mouseX.set(e.clientX - centerX);
    mouseY.set(e.clientY - centerY);
  };
  
  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const user = await authLogin(form);
      if (user.role === "LANDLORD") {
        navigate("/dashboard");
      } else {
        navigate("/tenant");
      }
    } catch (err) {
      console.error("LOGIN ERROR:", err.response?.data || err.message);
      setError(err.response?.data?.error || err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  // ---------- GOOGLE LOGIN ----------

  const handleGoogleLogin = useCallback(
    async (response) => {
      try {
        setError("");
        setLoading(true);

        const credential = response?.credential;
        if (!credential) {
          throw new Error("Missing Google credential");
        }

        // Send Google token to backend
        const res = await api.post("/auth/google", {
          credential,
          mode: "login",
        });

        const data = res.data;

        // Save token/user (adjust to match what your backend returns)
        if (data.access_token) {
          localStorage.setItem("token", data.access_token);
        }
        if (data.user) {
          localStorage.setItem("user", JSON.stringify(data.user));
        }

        const role = data.user?.role || "TENANT";
        const redirect = role === "LANDLORD" ? "/dashboard" : "/tenant";

        // Full reload so AuthContext picks up the new token/user everywhere
        window.location.href = redirect;
      } catch (err) {
        console.error("Google login error:", err.response?.data || err.message);
        setError(
          err.response?.data?.message ||
            err.message ||
            "Google login failed. Please try again."
        );
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    // Load Google Sign-In script
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    script.onload = () => {
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
          callback: handleGoogleLogin,
        });

        window.google.accounts.id.renderButton(
          document.getElementById("google-login-btn"),
          {
            theme: "filled_blue",
            size: "large",
            width: 400, // Fixed pixel value instead of percentage
            text: "continue_with",
          }
        );
      }
    };

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, [handleGoogleLogin]);

  // ---------- UI ----------

  return (
    <div 
      className="login-grid"
      style={{
        minHeight: '100vh',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Left Hero Section */}
      <motion.div
        className="login-hero"
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '3rem',
          position: 'relative',
          background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.05) 0%, rgba(59, 130, 246, 0.05) 100%)',
          borderRight: '1px solid rgba(255, 255, 255, 0.1)'
        }}
      >
        {/* Floating orb for left side */}
        <motion.div
          animate={{
            x: [0, 30, -30, 0],
            y: [0, -40, 40, 0],
            scale: [1, 1.1, 0.95, 1]
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          style={{
            position: 'absolute',
            top: '20%',
            left: '15%',
            width: '400px',
            height: '400px',
            background: 'radial-gradient(circle, rgba(6, 182, 212, 0.12) 0%, transparent 70%)',
            pointerEvents: 'none',
            filter: 'blur(60px)'
          }}
        />

        <div style={{ position: 'relative', zIndex: 1, maxWidth: '520px' }}>
          {/* Logo with animated glow */}
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ 
              opacity: 1, 
              y: 0, 
              scale: 1
            }}
            transition={{ delay: 0.2, duration: 0.6, type: 'spring', stiffness: 100 }}
            style={{ 
              marginBottom: '2rem',
              position: 'relative',
              display: 'inline-block'
            }}
          >
            <motion.div
              animate={{
                boxShadow: [
                  '0 0 20px rgba(6, 182, 212, 0.3)',
                  '0 0 40px rgba(6, 182, 212, 0.5)',
                  '0 0 20px rgba(6, 182, 212, 0.3)'
                ]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: 'easeInOut'
              }}
              style={{
                padding: '1rem 1.5rem',
                background: 'rgba(6, 182, 212, 0.05)',
                borderRadius: '1rem',
                border: '1px solid rgba(6, 182, 212, 0.2)'
              }}
            >
              <Logo size="hero" variant="full" />
            </motion.div>
          </motion.div>

          {/* Main Heading with gradient shimmer */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.02 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            style={{
              fontSize: '2.5rem',
              fontWeight: '700',
              background: 'linear-gradient(135deg, #ffffff 0%, #06b6d4 50%, #ffffff 100%)',
              backgroundSize: '200% auto',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              animation: 'shimmer 3s linear infinite',
              marginBottom: '1rem',
              lineHeight: '1.2',
              cursor: 'default'
            }}
          >
            Simplify Your Property Management
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            style={{
              fontSize: '1.125rem',
              color: '#94a3b8',
              marginBottom: '2.5rem',
              lineHeight: '1.6'
            }}
          >
            Streamline rent collection, maintenance requests, and lease management—all in one secure platform.
          </motion.p>

          {/* Feature Grid */}
          <div 
            className="feature-grid-2col"
            style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}
          >
            {[
              { icon: Shield, title: 'Secure Payments', desc: 'Bank-grade encryption' },
              { icon: Wrench, title: 'Easy Maintenance', desc: 'Track all requests' },
              { icon: CreditCard, title: 'Auto Billing', desc: 'Never miss rent day' },
              { icon: Clock, title: '24/7 Access', desc: 'Manage anytime' }
            ].map((feature, idx) => {
              const IconComponent = feature.icon;
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + idx * 0.1, duration: 0.5 }}
                  whileHover={{ 
                    y: -8, 
                    scale: 1.03,
                    boxShadow: '0 12px 24px rgba(6, 182, 212, 0.2)',
                    borderColor: 'rgba(6, 182, 212, 0.3)',
                    transition: { duration: 0.3, type: 'spring', stiffness: 300 } 
                  }}
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    backdropFilter: 'blur(10px)',
                    padding: '1.25rem',
                    borderRadius: '0.75rem',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    cursor: 'default',
                    transition: 'border-color 0.3s ease'
                  }}
                >
                  <motion.div 
                    whileHover={{ 
                      rotate: [0, -10, 10, -10, 0],
                      scale: [1, 1.1, 1.1, 1.1, 1]
                    }}
                    transition={{ duration: 0.5 }}
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '0.5rem',
                      background: 'linear-gradient(135deg, #06b6d4, #3b82f6)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '0.75rem',
                      boxShadow: '0 4px 12px rgba(6, 182, 212, 0.4)'
                    }}
                  >
                    <IconComponent size={24} color="#ffffff" />
                  </motion.div>
                  <h3 style={{
                    fontSize: '1rem',
                    fontWeight: '600',
                    color: '#ffffff',
                    marginBottom: '0.25rem'
                  }}>
                    {feature.title}
                  </h3>
                  <p style={{
                    fontSize: '0.875rem',
                    color: '#94a3b8'
                  }}>
                    {feature.desc}
                  </p>
                </motion.div>
              );
            })}
          </div>

          {/* Trust Badge with bouncing icon */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.6 }}
            style={{
              marginTop: '2.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: '#94a3b8',
              fontSize: '0.875rem'
            }}
          >
            <motion.div
              animate={{ 
                y: [0, -3, 0],
                rotate: [0, 5, -5, 0]
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut'
              }}
            >
              <CheckCircle2 size={18} color="#06b6d4" />
            </motion.div>
            <motion.span
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.2, duration: 0.5 }}
            >
              Trusted by property managers and tenants nationwide
            </motion.span>
          </motion.div>
        </div>
      </motion.div>

      {/* Right Login Section */}
      <div 
        className="login-form-section"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
          position: 'relative'
        }}
      >
        {/* Floating orbs for right side */}
        <motion.div
          animate={{
            x: [0, 40, -40, 0],
            y: [0, -30, 30, 0],
            scale: [1, 1.08, 0.96, 1]
          }}
          transition={{
            duration: 22,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          style={{
            position: 'absolute',
            top: '15%',
            right: '10%',
            width: '350px',
            height: '350px',
            background: 'radial-gradient(circle, rgba(59, 130, 246, 0.1) 0%, transparent 70%)',
            pointerEvents: 'none',
            filter: 'blur(60px)'
          }}
        />

        <motion.div
          animate={{
            x: [0, -35, 35, 0],
            y: [0, 35, -35, 0],
            scale: [1, 0.94, 1.1, 1]
          }}
          transition={{
            duration: 28,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 7
          }}
          style={{
            position: 'absolute',
            bottom: '20%',
            left: '15%',
            width: '320px',
            height: '320px',
            background: 'radial-gradient(circle, rgba(139, 92, 246, 0.08) 0%, transparent 70%)',
            pointerEvents: 'none',
            filter: 'blur(55px)'
          }}
        />

        <div style={{ width: '100%', maxWidth: '440px', position: 'relative', zIndex: 1 }}>
          {/* Compact Logo with pulse */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ 
              opacity: 1, 
              scale: 1
            }}
            transition={{ delay: 0.2, duration: 0.5, type: 'spring', bounce: 0.4 }}
            style={{ marginBottom: '1.5rem', textAlign: 'center' }}
          >
            <motion.div
              animate={{
                scale: [1, 1.05, 1],
                rotate: [0, 2, -2, 0]
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: 'easeInOut'
              }}
              style={{
                display: 'inline-block',
                filter: 'drop-shadow(0 0 20px rgba(6, 182, 212, 0.4))'
              }}
            >
              <Logo size="normal" variant="icon" />
            </motion.div>
          </motion.div>

          {/* Login Card with hover lift */}
          <motion.div
            ref={cardRef}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ 
              y: -4,
              boxShadow: '0 12px 40px 0 rgba(0, 0, 0, 0.45)' 
            }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            style={{
              rotateX,
              rotateY,
              transformStyle: 'preserve-3d',
              perspective: 1000,
              background: 'rgba(255, 255, 255, 0.05)',
              backdropFilter: 'blur(10px)',
              borderRadius: '1rem',
              padding: '2rem',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)'
            }}
            onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          <motion.h2 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            style={{ 
              fontSize: '1.75rem', 
              fontWeight: '600',
              marginBottom: '0.5rem',
              color: '#ffffff'
            }}
          >
            Welcome Back
          </motion.h2>
          
          {/* Animated divider line */}
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: '60px' }}
            transition={{ delay: 0.4, duration: 0.6, ease: 'easeOut' }}
            style={{
              height: '3px',
              background: 'linear-gradient(90deg, #06b6d4, #3b82f6)',
              borderRadius: '2px',
              marginBottom: '0.75rem'
            }}
          />
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.4 }}
            style={{ color: '#94a3b8', marginBottom: '2rem', fontSize: '0.9rem' }}
          >
            Access your property management portal
          </motion.p>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              style={{
                padding: '0.75rem 1rem',
                background: 'rgba(254, 226, 226, 0.1)',
                border: '1px solid rgba(254, 202, 202, 0.3)',
                borderRadius: '0.5rem',
                color: '#fca5a5',
                marginBottom: '1.5rem',
                fontSize: '0.875rem'
              }}
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6, duration: 0.4 }}
            >
              <motion.label 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.65, duration: 0.4 }}
                style={{ 
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontSize: '0.875rem', 
                  fontWeight: '500',
                  color: '#e2e8f0',
                  marginBottom: '0.5rem'
                }}
              >
                <motion.span
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  transition={{ delay: 0.65, duration: 0.5, type: 'spring', stiffness: 200 }}
                >
                  <Mail size={16} />
                </motion.span>
                Email
              </motion.label>
              <motion.input
                whileFocus={{
                  scale: 1.01,
                  boxShadow: '0 0 0 3px rgba(6, 182, 212, 0.2), 0 4px 12px rgba(0, 0, 0, 0.3)'
                }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className="input"
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                required
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  fontSize: '1rem',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '0.5rem',
                  outline: 'none',
                  color: '#ffffff',
                  transition: 'all 0.2s'
                }}
                onFocus={(e) => e.target.style.borderColor = 'rgba(6, 182, 212, 0.5)'}
                onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7, duration: 0.4 }}
            >
              <motion.label 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7, duration: 0.4 }}
                style={{ 
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontSize: '0.875rem', 
                  fontWeight: '500',
                  color: '#e2e8f0',
                  marginBottom: '0.5rem'
                }}
              >
                <motion.span
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  transition={{ delay: 0.75, duration: 0.5, type: 'spring', stiffness: 200 }}
                >
                  <Lock size={16} />
                </motion.span>
                Password
              </motion.label>
              <motion.input
                whileFocus={{
                  scale: 1.01,
                  boxShadow: '0 0 0 3px rgba(6, 182, 212, 0.2), 0 4px 12px rgba(0, 0, 0, 0.3)'
                }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className="input"
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••"
                required
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  fontSize: '1rem',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '0.5rem',
                  outline: 'none',
                  color: '#ffffff',
                  transition: 'all 0.2s'
                }}
                onFocus={(e) => e.target.style.borderColor = 'rgba(6, 182, 212, 0.5)'}
                onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'}
              />
            </motion.div>

            <motion.button 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.4 }}
              whileHover={{ 
                scale: 1.02,
                boxShadow: '0 6px 20px 0 rgba(6, 182, 212, 0.5)',
                y: -2
              }}
              whileTap={{ 
                scale: 0.97
              }}
              style={{
                width: '100%',
                padding: '0.875rem 1.5rem',
                fontSize: '1rem',
                fontWeight: '600',
                color: 'white',
                background: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)',
                border: 'none',
                borderRadius: '0.5rem',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
                opacity: loading ? 0.7 : 1,
                boxShadow: '0 4px 14px 0 rgba(6, 182, 212, 0.39)'
              }}
              type="submit" 
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign In"}
            </motion.button>
          </form>

          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            margin: '1.5rem 0',
            color: '#94a3b8',
            fontSize: '0.875rem'
          }}>
            <div style={{ flex: 1, height: '1px', background: 'rgba(255, 255, 255, 0.1)' }}></div>
            <span style={{ padding: '0 1rem' }}>or continue with</span>
            <div style={{ flex: 1, height: '1px', background: 'rgba(255, 255, 255, 0.1)' }}></div>
          </div>

          {/* Google login button mounts here */}
          <div id="google-login-btn" style={{ width: "100%" }}></div>

          <p style={{ 
            textAlign: 'center', 
            marginTop: '1.5rem',
            color: '#94a3b8',
            fontSize: '0.875rem'
          }}>
            Don&apos;t have an account?{" "}
            <Link 
              to="/register" 
              style={{ 
                color: '#06b6d4', 
                fontWeight: '600',
                textDecoration: 'none'
              }}
            >
              Create Account
            </Link>
          </p>
        </motion.div>
        </div>
      </div>
    </div>
  );
}
