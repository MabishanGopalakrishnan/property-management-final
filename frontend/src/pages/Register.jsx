import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axiosConfig";

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (!form.role) {
        throw new Error("Please select a role (Landlord or Tenant).");
      }

      const res = await api.post("/auth/register", {
        name: form.name,
        email: form.email,
        password: form.password,
        role: form.role.toUpperCase(), // LANDLORD / TENANT
      });

      const data = res.data;

      if (data.access_token) {
        localStorage.setItem("token", data.access_token);
      }
      if (data.user) {
        localStorage.setItem("user", JSON.stringify(data.user));
      }

      const role = data.user?.role || form.role.toUpperCase();
      const redirect = role === "LANDLORD" ? "/dashboard" : "/tenant";

      window.location.href = redirect;
    } catch (err) {
      console.error("REGISTER ERROR:", err.response?.data || err.message);
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          err.message ||
          "Registration failed"
      );
    } finally {
      setLoading(false);
    }
  };

  // ---------- GOOGLE REGISTER ----------

  const handleGoogleRegister = useCallback(
    async (response) => {
      try {
        setError("");
        setLoading(true);

        if (!form.role) {
          throw new Error(
            "Please select a role (Landlord or Tenant) before using Google."
          );
        }

        const credential = response?.credential;
        if (!credential) {
          throw new Error("Missing Google credential");
        }

        const res = await api.post("/auth/google", {
          credential,
          mode: "register",
          role: form.role.toUpperCase(),
        });

        const data = res.data;

        if (data.token) {
          localStorage.setItem("token", data.token);
        }
        if (data.user) {
          localStorage.setItem("user", JSON.stringify(data.user));
        }

        const role = data.user?.role || form.role.toUpperCase();
        const redirect = role === "LANDLORD" ? "/dashboard" : "/tenant";

        window.location.href = redirect;
      } catch (err) {
        console.error("Google register error:", err.response?.data || err.message);
        setError(
          err.response?.data?.message ||
            err.message ||
            "Google registration/login failed"
        );
      } finally {
        setLoading(false);
      }
    },
    [form.role]
  );

  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId) {
      console.warn("VITE_GOOGLE_CLIENT_ID is not set");
      return;
    }

    let interval;

    const initGoogle = () => {
      if (!window.google?.accounts?.id) return false;

      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: handleGoogleRegister,
      });

      const btn = document.getElementById("google-register-btn");
      if (!btn) return false;

      window.google.accounts.id.renderButton(btn, {
        type: "standard",
        shape: "rectangular",
        theme: "outline",
        text: "continue_with",
        width: "100%",
      });

      return true;
    };

    interval = setInterval(() => {
      const ok = initGoogle();
      if (ok) clearInterval(interval);
    }, 500);

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [handleGoogleRegister]);

  // ---------- UI ----------

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
            required
          >
            <option value="">Select role...</option>
            <option value="LANDLORD">Landlord</option>
            <option value="TENANT">Tenant</option>
          </select>

          <button className="btn-primary" type="submit" disabled={loading}>
            {loading ? "Creating account..." : "Register"}
          </button>
        </form>

        <p className="auth-or">or</p>

        {/* Google register button mounts here */}
        <div id="google-register-btn" style={{ width: "100%" }}></div>

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
