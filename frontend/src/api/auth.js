// src/api/auth.js
import axios from "axios";

// Create axios instance
const API = axios.create({
  baseURL: "https://tenant-property-management-system.onrender.com/api",
});

// Attach token automatically if present
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// -------- AUTH CALLS --------

// Register user
export const registerRequest = (data) => API.post("/auth/register", data);

// Login user
export const loginRequest = (data) => API.post("/auth/login", data);

// Get logged-in user
export const getMeRequest = () => API.get("/auth/me");
