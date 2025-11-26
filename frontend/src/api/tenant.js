// src/api/tenant.js
import API from "./axiosConfig";

// TENANT OVERVIEW
export const tenantOverview = () => API.get("/api/tenants/overview");

// TENANT PROPERTIES
export const tenantProperties = () => API.get("/api/tenants/properties");

// TENANT LEASE
export const tenantLease = () => API.get("/api/tenants/lease");

// TENANT PAYMENTS
export const tenantPayments = () => API.get("/api/tenants/payments");

// TENANT MAINTENANCE (LIST)
export const tenantMaintenance = () => API.get("/api/tenants/maintenance");

// CREATE MAINTENANCE REQUEST
export const createTenantMaintenance = (data) =>
  API.post("/api/tenants/maintenance", data);
