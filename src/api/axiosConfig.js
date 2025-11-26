// src/api/axiosConfig.js
import axios from "axios";

// LOCAL dev backend:
const API_BASE_URL = "http://localhost:5000/api";
// If you want to switch to Render later, change this to:
// const API_BASE_URL = "https://property-management-final.onrender.com/api";

const API = axios.create({
  baseURL: API_BASE_URL,
});

// Attach JWT automatically
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;
