// src/api/units.js
import API from "./axiosConfig";

// propertyId -> list units
export const getUnitsByProperty = async (propertyId) => {
  const res = await API.get(`/units/${propertyId}`);
  return res.data;
};

// propertyId -> create unit under property
export const createUnit = async (propertyId, data) => {
  const res = await API.post(`/units/${propertyId}`, data);
  return res.data;
};

// unitId -> update
export const updateUnit = async (unitId, data) => {
  const res = await API.put(`/units/${unitId}`, data);
  return res.data;
};

// unitId -> delete
export const deleteUnit = async (unitId) => {
  const res = await API.delete(`/units/${unitId}`);
  return res.data;
};
