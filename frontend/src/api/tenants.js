// src/api/tenants.js
import API from "./axiosConfig";

// Get all tenants (for LANDLORD creating leases)
export const getTenants = async () => {
  const res = await API.get("/tenants/");
  return res.data;
};

// Delete a tenant
export const deleteTenant = async (tenantId) => {
  const res = await API.delete(`/tenants/${tenantId}`);
  return res.data;
};

// Tenant Portal endpoints
export const getMyLeases = async () => {
  const res = await API.get("/tenant-portal/my-leases");
  return res.data;
};

export const getMyPayments = async () => {
  const res = await API.get("/tenant-portal/my-payments");
  return res.data;
};

export const getMyMaintenance = async () => {
  const res = await API.get("/tenant-portal/my-maintenance");
  return res.data;
};

export default {
  getTenants,
  deleteTenant,
  getMyLeases,
  getMyPayments,
  getMyMaintenance,
};
