// src/api/axiosConfig.js
import axios from "axios";

// 🔥 Use Render backend for live environment
const API_BASE_URL = "https://tenant-property-management-system.onrender.com/api";

// If you ever want to test locally again:
// const API_BASE_URL = "http://localhost:5000/api";

const API = axios.create({
  baseURL: API_BASE_URL,
});

// 🔐 Attach JWT automatically
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;
