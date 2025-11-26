// frontend/src/pages/Login.jsx
import { useState } from "react";
<<<<<<< HEAD
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
=======
import { useNavigate, Link } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import API from "../api/axiosConfig.js";
import { useAuth } from "../context/AuthContext.jsx";
>>>>>>> 1b23df24c03b6decf4a406c79c06e32b2dcd0df2

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
<<<<<<< HEAD
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(form.email, form.password);
      // login() already navigates, no need to do it again
=======

  const [role, setRole] = useState("LANDLORD");
  const [error, setError] = useState("");

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      setError("");

      const idToken = credentialResponse.credential;

      const res = await API.post("/auth/google", {
        idToken,
        role, // LANDLORD or TENANT
      });

      // res.data should be { user, token }
      login(res.data.token, res.data.user);

      navigate("/dashboard");
>>>>>>> 1b23df24c03b6decf4a406c79c06e32b2dcd0df2
    } catch (err) {
      console.log("GOOGLE LOGIN ERROR:", err.response?.data || err.message);
      setError(err.response?.data?.message || "Google login failed.");
    }
  };

  const handleGoogleError = () => {
    setError("Google login failed.");
  };

  return (
    <div style={{ maxWidth: 420, margin: "60px auto" }}>
      <h1>Login</h1>

      {error && (
        <div style={{ color: "red", marginBottom: 12 }}>
          {error}
        </div>
      )}

      <label>Login as</label>
      <select
        value={role}
        onChange={(e) => setRole(e.target.value)}
        style={{ width: "100%", marginBottom: 20 }}
      >
        <option value="LANDLORD">Landlord</option>
        <option value="TENANT">Tenant</option>
      </select>

      <GoogleLogin
        onSuccess={handleGoogleSuccess}
        onError={handleGoogleError}
        useOneTap
      />

      <p style={{ marginTop: 16 }}>
        Need an account? <Link to="/register">Register</Link>
      </p>
    </div>
  );
}
