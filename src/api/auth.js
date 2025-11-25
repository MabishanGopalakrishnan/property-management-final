// src/api/auth.js
import API from "./axiosConfig";

export const loginRequest = async (credentials) => {
  const res = await API.post("/auth/login", credentials);
  return res.data; // { token, user }
};

export const registerRequest = async (data) => {
  const res = await API.post("/auth/register", data);
  return res.data; // user
};

export const getMe = async () => {
  const res = await API.get("/auth/me");
  return res.data; // user with tenant/properties
};
