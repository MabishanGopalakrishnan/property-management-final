import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import api from "../api/axiosConfig";

export default function Login() {
  const navigate = useNavigate();
  const { login: authLogin } = useAuth();

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
        if (data.token) {
          localStorage.setItem("token", data.token);
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
            "Google registration/login failed"
        );
      } finally {
        setLoading(false);
      }
    },
    []
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
        callback: handleGoogleLogin,
      });

      const btn = document.getElementById("google-login-btn");
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

    // Poll until the Google script is ready and the element exists
    interval = setInterval(() => {
      const ok = initGoogle();
      if (ok) clearInterval(interval);
    }, 500);

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [handleGoogleLogin]);

  // ---------- UI ----------

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

        <p className="auth-or">or</p>

        {/* Google login button mounts here */}
        <div id="google-login-btn" style={{ width: "100%" }}></div>

        <p className="auth-footer">
          Don&apos;t have an account?{" "}
          <Link to="/register" className="link">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}
