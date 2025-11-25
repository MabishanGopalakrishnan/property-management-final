// src/api/maintenance.js
import API from "./axiosConfig";

// Tenant creates request for a lease
export const createMaintenanceRequest = async (leaseId, data) => {
  const res = await API.post(`/maintenance/lease/${leaseId}`, data);
  return res.data;
};

// Landlord or tenant list requests (your backend currently returns all)
export const getMaintenanceRequests = async () => {
  const res = await API.get("/maintenance");
  return res.data;
};

// Landlord updates status
export const updateMaintenanceStatus = async (requestId, status) => {
  const res = await API.put(`/maintenance/${requestId}`, { status });
  return res.data;
};
