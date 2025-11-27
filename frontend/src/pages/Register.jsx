import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import api from "../api/axiosConfig.js";

export default function Register() {
  const navigate = useNavigate();
  const { register: authRegister } = useAuth();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "", // user must pick
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const googleDivRef = useRef(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  // Manual registration – original behaviour
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.role) {
      setError("Please select a role (Landlord or Tenant).");
      return;
    }

    setLoading(true);

    try {
      const user = await authRegister(form);
      if (user.role === "LANDLORD") {
        navigate("/dashboard");
      } else {
        navigate("/tenant");
      }
    } catch (err) {
      setError(
        err.response?.data?.error || err.message || "Registration failed"
      );
    } finally {
      setLoading(false);
    }
  };

  // Google register/login – uses latest role
  const handleGoogleCredential = async (response, roleFromUI) => {
    try {
      setError("");

      const role = (roleFromUI || "").trim();
      if (!role) {
        setError("Please select a role above before using Google.");
        return;
      }

      const res = await api.post("/auth/google", {
        credential: response.credential,
        role,
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
        "Google registration/login failed";
      setError(msg);
    }
  };

  // Init Google button; re-run when role changes so callback uses latest role
  useEffect(() => {
    try {
      const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

      if (!clientId || typeof window === "undefined") return;
      if (!window.google || !googleDivRef.current) return;

      googleDivRef.current.innerHTML = "";

      const callback = (response) =>
        handleGoogleCredential(response, form.role);

      window.google.accounts.id.initialize({
        client_id: clientId,
        callback,
      });

      window.google.accounts.id.renderButton(googleDivRef.current, {
        theme: "outline",
        size: "large",
        shape: "rectangular",
        text: "continue_with",
        width: 240, // number to avoid warning
      });
    } catch (e) {
      console.error("Google register init error:", e);
    }
  }, [form.role]);

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1 className="auth-title">Create Account</h1>
        <p className="auth-subtitle">
          Landlords manage properties; tenants receive access to their unit,
          payments, and maintenance requests.
        </p>

        {error && <div className="alert error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <label className="field-label">Full Name</label>
          <input
            className="input"
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="John Doe"
            required
          />

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

          <label className="field-label">Role</label>
          <select
            className="input"
            name="role"
            value={form.role}
            onChange={handleChange}
          >
            <option value="">Select role...</option>
            <option value="LANDLORD">Landlord</option>
            <option value="TENANT">Tenant</option>
          </select>

          <button className="btn-primary" type="submit" disabled={loading}>
            {loading ? "Creating account..." : "Register"}
          </button>
        </form>

        <div style={{ textAlign: "center", margin: "1rem 0" }}>
          <span style={{ color: "#777" }}>or</span>
        </div>

        {/* Google register/login button (only works if Google configured) */}
        <div
          ref={googleDivRef}
          style={{ display: "flex", justifyContent: "center" }}
        ></div>

        <p className="auth-footer">
          Already have an account?{" "}
          <Link to="/login" className="link">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
