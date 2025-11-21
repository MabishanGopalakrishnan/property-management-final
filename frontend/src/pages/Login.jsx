// src/pages/Login.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginRequest } from "../api/auth";

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await loginRequest(form);

      // backend returns { token, user }
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      // later we’ll route based on role (LANDLORD vs TENANT)
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.error || "Login failed. Please check your details."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#111",
        color: "#fff",
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          background: "#1e1e1e",
          padding: "2rem 2.5rem",
          borderRadius: "12px",
          width: "100%",
          maxWidth: "380px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
        }}
      >
        <h1 style={{ marginBottom: "1.5rem" }}>Login</h1>

        <label style={{ display: "block", marginBottom: ".5rem" }}>
          Email
        </label>
        <input
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          required
          style={{
            width: "100%",
            padding: ".6rem .8rem",
            marginBottom: "1rem",
            borderRadius: "8px",
            border: "1px solid #444",
            background: "#111",
            color: "#fff",
          }}
        />

        <label style={{ display: "block", marginBottom: ".5rem" }}>
          Password
        </label>
        <input
          type="password"
          name="password"
          value={form.password}
          onChange={handleChange}
          required
          style={{
            width: "100%",
            padding: ".6rem .8rem",
            marginBottom: "1.2rem",
            borderRadius: "8px",
            border: "1px solid #444",
            background: "#111",
            color: "#fff",
          }}
        />

        {error && (
          <div
            style={{
              marginBottom: "1rem",
              color: "#ff6b6b",
              fontSize: ".9rem",
            }}
          >
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            padding: ".7rem",
            borderRadius: "8px",
            border: "none",
            background:
              "linear-gradient(135deg, #6366f1 0%, #22d3ee 50%, #4ade80 100%)",
            color: "#000",
            fontWeight: "600",
            cursor: loading ? "default" : "pointer",
          }}
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        <p style={{ marginTop: "1rem", fontSize: ".85rem" }}>
          Don’t have an account?{" "}
          <a href="/register" style={{ color: "#22d3ee" }}>
            Register
          </a>
        </p>
      </form>
    </div>
  );
}
