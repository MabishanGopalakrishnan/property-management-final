import API from "./axiosConfig.js";

export const loginRequest = async (form) => {
  const res = await API.post("/auth/login", form);
  return res.data;
};

export const registerRequest = async (form) => {
  const res = await API.post("/auth/register", form);
  return res.data;
};

export const getMe = async () => {
  const res = await API.get("/auth/me");
  return res.data;
};
