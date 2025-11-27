import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "LANDLORD",
    phone: "", // ✅ keep as phone
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      await register(form); // ✅ passing full form object correctly
      setSuccess("Account created! Redirecting to login...");
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      console.log("REGISTER ERROR:", err.response?.data || err.message);
      setError(err?.response?.data?.error || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1 className="auth-title">Create Account</h1>
        <p className="auth-subtitle">
          Landlords manage properties; tenants receive access to their unit,
          payments, and maintenance requests.
        </p>

        {error && <div className="alert error">{error}</div>}
        {success && <div className="alert success">{success}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          {/* NAME */}
          <label className="field-label">Full Name</label>
          <input
            className="input"
            type="text"
            name="name"
            placeholder="John Doe"
            value={form.name}
            onChange={handleChange}
            required
          />

          {/* EMAIL */}
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

          {/* PASSWORD */}
          <label className="field-label">Password</label>
          <input
            className="input"
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            required
          />

          {/* ROLE */}
          <label className="field-label">Role</label>
          <select
            className="input"
            name="role"
            value={form.role}
            onChange={handleChange}
            required
          >
            <option value="LANDLORD">Landlord</option>
            <option value="TENANT">Tenant</option> 
          </select>

          {/* PHONE (only show if TENANT) */}
          {form.role === "TENANT" && (
            <>
              <label className="field-label">Phone (optional)</label>
              <input
                className="input"
                type="tel"
                name="phone"
                placeholder="647-123-4567"
                value={form.phone}
                onChange={handleChange}
              />
            </>
          )}

          <button className="btn-primary" type="submit" disabled={loading}>
            {loading ? "Creating account..." : "Register"}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account?{" "}
          <Link to="/login" className="link">Login</Link>
        </p>
      </div>
    </div>
  );
}
