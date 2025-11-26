// src/api/tenants.js
import API from "./axiosConfig";

// Get all tenants (for LANDLORD creating leases)
export const getTenants = async () => {
  const res = await API.get("/tenants");
  return res.data;
};

export default {
  getTenants,
};
