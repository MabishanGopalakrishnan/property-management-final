// frontend/src/context/AuthContext.jsx
import { createContext, useContext, useEffect, useState } from "react";
import API from "../api/axiosConfig.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user on app start if token exists
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

  // Call this after ANY successful login (google or normal)
  const login = (token, userData) => {
    localStorage.setItem("token", token);
    setUser(userData);
  };

  // App logout: clears token + user
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
