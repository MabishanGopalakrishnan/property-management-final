import axios from "axios";

const API = axios.create({
<<<<<<< HEAD
  baseURL: "/api",   // <--- FIXED ROUTE PREFIX
=======
  baseURL: "http://localhost:5000/api",
>>>>>>> 1b23df24c03b6decf4a406c79c06e32b2dcd0df2
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default API;
