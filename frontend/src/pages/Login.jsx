import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import api from "../api/axiosConfig.js";

export default function Login() {
  const navigate = useNavigate();
  const { login: authLogin } = useAuth();

  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const googleDivRef = useRef(null);

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  // Manual login – original behaviour
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
      setError(err.response?.data?.error || err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  // Google login (existing accounts only)
  const handleGoogleCredential = async (response) => {
    try {
      setError("");

      const res = await api.post("/auth/google", {
        credential: response.credential,
      });

      const { token, user } = res.data;
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      // Hard reload so AuthContext re-reads token from localStorage
      if (user.role === "LANDLORD") {
        window.location.href = "/dashboard";
      } else {
        window.location.href = "/tenant";
      }
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Google sign-in failed";
      setError(msg);
    }
  };

  useEffect(() => {
    try {
      const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

      // If Google isn't set up, just don't render the button
      if (!clientId || typeof window === "undefined") return;
      if (!window.google || !googleDivRef.current) return;

      googleDivRef.current.innerHTML = "";

      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: handleGoogleCredential,
      });

      window.google.accounts.id.renderButton(googleDivRef.current, {
        theme: "outline",
        size: "large",
        shape: "rectangular",
        text: "continue_with",
        width: 240, // number to avoid the "invalid width" warning
      });
    } catch (e) {
      console.error("Google login init error:", e);
    }
  }, []);

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1 className="auth-title">Login</h1>
        <p className="auth-subtitle">
          Sign in to manage properties, tenants, and payments.
        </p>

        {error && <div className="alert error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <label className="field-label">Email</label>
          <input
            className="input"
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="you@example.com"
            required
          />

          <label className="field-label">Password</label>
          <input
            className="input"
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="••••••••"
            required
          />

          <button className="btn-primary" type="submit" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <div style={{ textAlign: "center", margin: "1rem 0" }}>
          <span style={{ color: "#777" }}>or</span>
        </div>

        {/* Google login button – only appears if Google is configured */}
        <div
          ref={googleDivRef}
          style={{ display: "flex", justifyContent: "center" }}
        ></div>

        <p className="auth-footer">
          Don't have an account?{" "}
          <Link to="/register" className="link">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}
