import { createContext, useContext, useEffect, useState } from "react";
import { loginRequest, registerRequest, getMe } from "../api/auth";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore session on first load
  useEffect(() => {
    const restore = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const me = await getMe(); // ✅ goes through /api/auth/me
        setUser(me);
      } catch {
        localStorage.removeItem("token");
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    restore();
  }, []);

// LOGIN
const login = async (form) => {
  const res = await loginRequest(form);

  if (!res?.token || !res?.user) {
    throw new Error("Invalid response from server");
  }

  localStorage.setItem("token", res.token);
  setUser(res.user);

  return res.user;
};

  // REGISTER
  const register = async (form) => {
    const res = await registerRequest(form);
    return res; // no need to set user on register
  };

  // LOGOUT
  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  const value = { user, setUser, loading, login, register, logout };

  if (loading) return <p className="text-center mt-10">Loading...</p>;

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
