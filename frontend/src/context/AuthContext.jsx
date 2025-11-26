// frontend/src/context/AuthContext.jsx
import { createContext, useContext, useEffect, useState } from "react";
import API from "../api/axiosConfig.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

<<<<<<< HEAD
  // Restore session on first load
=======
  // Load user on app start if token exists
>>>>>>> 1b23df24c03b6decf4a406c79c06e32b2dcd0df2
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      return;
    }

    const fetchMe = async () => {
      try {
        const res = await API.get("/auth/me");
        setUser(res.data);
      } catch (err) {
        console.log("AUTH ME ERROR:", err.response?.data || err.message);
        localStorage.removeItem("token");
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchMe();
  }, []);

<<<<<<< HEAD
  // LOGIN
  const login = async (email, password) => {
    const { token, user } = await loginRequest({ email, password });
    localStorage.setItem("token", token);
    setUser(user);

    if (user.role === "LANDLORD") {
      navigate("/dashboard");
    } else {
      // tenant
      navigate("/tenant");
    }

    return user;
  };

  // REGISTER
  const register = async ({ name, email, password, role, phone }) => {
    return await registerRequest({
      name,
      email,
      password,
      role,
      phone,
    });
  };

  // LOGOUT
=======
  // Call this after ANY successful login (google or normal)
  const login = (token, userData) => {
    localStorage.setItem("token", token);
    setUser(userData);
  };

  // App logout: clears token + user
>>>>>>> 1b23df24c03b6decf4a406c79c06e32b2dcd0df2
  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  const value = { user, loading, login, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
