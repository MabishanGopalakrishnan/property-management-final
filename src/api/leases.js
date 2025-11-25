// src/api/leases.js
import API from "./axiosConfig";

// Create a lease
export const createLease = async (data) => {
  const res = await API.post("/leases", data);
  return res.data;
};

// Get leases for a property
export const getLeasesByProperty = async (propertyId) => {
  const res = await API.get(`/leases/property/${propertyId}`);
  return res.data;
};

// Get leases for a unit (optional, but handy)
export const getLeasesByUnit = async (unitId) => {
  const res = await API.get(`/leases/unit/${unitId}`);
  return res.data;
};

// Delete lease
export const deleteLease = async (leaseId) => {
  const res = await API.delete(`/leases/${leaseId}`);
  return res.data;
};
