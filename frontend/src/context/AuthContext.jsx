// src/context/AuthContext.jsx
import {
  createContext,
  useContext,
  useState,
  useEffect,
} from "react";
import { useNavigate } from "react-router-dom";
import { loginRequest, registerRequest, getMe } from "../api/auth";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Restore session on first load
  useEffect(() => {
    const restore = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const me = await getMe();
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
  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    navigate("/login");
  };

  return (
    <AuthContext.Provider
      value={{ user, setUser, loading, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
