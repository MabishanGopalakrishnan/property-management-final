// src/api/auth.js
import API from "./axiosConfig";

// LOGIN
export const loginRequest = async (credentials) => {
  const res = await API.post("/auth/login", credentials); // 👈 FIXED
  return res.data;
};

// REGISTER
export const registerRequest = async (data) => {
  const res = await API.post("/auth/register", data); // 👈 FIXED
  return res.data;
};

// GET AUTH USER DATA
export const getMe = async () => {
  const res = await API.get("/auth/me"); // 👈 FIXED
  return res.data;
};
