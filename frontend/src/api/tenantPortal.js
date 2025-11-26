// import API from "./axiosConfig";

// // ------- Tenant Overview -------
// export const getTenantOverview = () => 
//   API.get("/tenants/overview");

// // ------- Tenant Properties -------
// export const getTenantProperties = () =>
//   API.get("/tenants/properties");

// // ------- Tenant Units -------
// export const getTenantUnits = () =>
//   API.get("/tenants/units");

// // ------- Tenant Lease -------
// export const getTenantLease = () =>
//   API.get("/tenants/lease");

// // ------- Tenant Payments -------
// export const getTenantPayments = () =>
//   API.get("/tenants/payments");

// // ------- Tenant Maintenance List -------
// export const getTenantMaintenance = () =>
//   API.get("/tenants/maintenance");

// // ------- CREATE Maintenance Request -------
// export const createTenantMaintenance = (data) =>
//   API.post("/tenants/maintenance", data);



// src/api/tenantPortal.js
import API from "./axiosConfig";

// ------- Tenant Overview -------
export const getTenantOverview = async () => {
  const res = await API.get("/tenants/overview");
  return res.data; // { tenant, lease, payments, maintenance }
};

// ------- Tenant Properties -------
export const getTenantProperties = async () => {
  const res = await API.get("/tenants/properties");
  return res.data; // array
};

// ------- Tenant Units (if you ever use it) -------
export const getTenantUnits = async () => {
  const res = await API.get("/tenants/units");
  return res.data;
};

// ------- Tenant Lease -------
export const getTenantLease = async () => {
  const res = await API.get("/tenants/lease");
  return res.data; // array of leases
};

// ------- Tenant Payments -------
export const getTenantPayments = async () => {
  const res = await API.get("/tenants/payments");
  return res.data;
};

// ------- Tenant Maintenance List -------
export const getTenantMaintenance = async () => {
  const res = await API.get("/tenants/maintenance");
  return res.data;
};

// ------- CREATE Maintenance Request -------
export const createTenantMaintenance = async (data) => {
  const res = await API.post("/tenants/maintenance", data);
  return res.data;
};
