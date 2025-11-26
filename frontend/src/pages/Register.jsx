import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../api/axiosConfig.js"; 
// ⚠️ If your Register file is deeper (auth/ folder), change to "../../api/axiosConfig.js"

export default function Register() {
  const navigate = useNavigate();

<<<<<<< HEAD
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "LANDLORD",
    phone: "",
  });

  const [loading, setLoading] = useState(false);
=======
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("LANDLORD");
  const [phone, setPhone] = useState("");
>>>>>>> 1b23df24c03b6decf4a406c79c06e32b2dcd0df2
  const [error, setError] = useState("");

<<<<<<< HEAD
  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      await register(form);
      setSuccess("Account created! Redirecting to login...");
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.error || "Registration failed.");
    } finally {
      setLoading(false);
=======
  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const payload = {
        name,
        email,
        password,
        role: role.toUpperCase(), // makes sure LANDLORD / TENANT
        phone,
      };

      await API.post("/auth/register", payload);

      // after successful register, go to login
      navigate("/login");
    } catch (err) {
      console.log("REGISTER ERROR:", err.response?.data || err.message);
      setError(err.response?.data?.message || "Registration failed. Try again.");
>>>>>>> 1b23df24c03b6decf4a406c79c06e32b2dcd0df2
    }
  };

  return (
<<<<<<< HEAD
    <div className="auth-page">
      <div className="auth-card">
        <h1 className="auth-title">Create Account</h1>
        <p className="auth-subtitle">
          Landlords manage properties; tenants receive access to their unit,
          payments, and maintenance requests.
        </p>
=======
    <div style={{ maxWidth: 420, margin: "60px auto" }}>
      <h1>Create account</h1>
      <p>Landlords can manage properties; tenants can submit maintenance and view payments.</p>
>>>>>>> 1b23df24c03b6decf4a406c79c06e32b2dcd0df2

      {error && (
        <div style={{ color: "red", marginBottom: 12 }}>
          {error}
        </div>
      )}

<<<<<<< HEAD
        <form onSubmit={handleSubmit} className="auth-form">

          {/* NAME FIELD */}
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
          >
            <option value="LANDLORD">Landlord</option>
            <option value="TENANT">Tenant</option>
          </select>

          {/* TENANT PHONE */}
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
=======
      <form onSubmit={handleRegister}>
        <label>Name</label>
        <input
          type="text"
          placeholder="Your full name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          style={{ width: "100%", marginBottom: 10 }}
        />

        <label>Email</label>
        <input
          type="email"
          placeholder="you@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ width: "100%", marginBottom: 10 }}
        />

        <label>Password</label>
        <input
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{ width: "100%", marginBottom: 10 }}
        />

        <label>Phone (optional)</label>
        <input
          type="text"
          placeholder="647-000-0000"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          style={{ width: "100%", marginBottom: 10 }}
        />
>>>>>>> 1b23df24c03b6decf4a406c79c06e32b2dcd0df2

        <label>Role</label>
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          required
          style={{ width: "100%", marginBottom: 16 }}
        >
          <option value="LANDLORD">Landlord</option>
          <option value="TENANT">Tenant</option>
        </select>

        <button type="submit" style={{ width: "100%" }}>
          Register
        </button>
      </form>

      <p style={{ marginTop: 10 }}>
        Already have an account? <Link to="/login">Login</Link>
      </p>
    </div>
  );
}
