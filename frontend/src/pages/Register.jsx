import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../api/axiosConfig.js"; 
// ⚠️ If your Register file is deeper (auth/ folder), change to "../../api/axiosConfig.js"

export default function Register() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("LANDLORD");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");

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
    }
  };

  return (
    <div style={{ maxWidth: 420, margin: "60px auto" }}>
      <h1>Create account</h1>
      <p>Landlords can manage properties; tenants can submit maintenance and view payments.</p>

      {error && (
        <div style={{ color: "red", marginBottom: 12 }}>
          {error}
        </div>
      )}

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
