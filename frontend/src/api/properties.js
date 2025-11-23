// src/api/properties.js
import API from "./axiosConfig";

export const getMyProperties = async () => {
  const res = await API.get("/properties");
  return res.data;
};

export const createProperty = async (data) => {
  const res = await API.post("/properties", data);
  return res.data;
};

export const updateProperty = async (id, data) => {
  const res = await API.put(`/properties/${id}`, data);
  return res.data;
};

export const deleteProperty = async (id) => {
  const res = await API.delete(`/properties/${id}`);
  return res.data;
};
