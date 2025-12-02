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

// ------- Tenant Leases -------
export const getTenantLease = async () => {
  const res = await API.get("/tenant-portal/my-leases");
  return res.data; // array of leases
};

// ------- Tenant Payments -------
export const getTenantPayments = async () => {
  const res = await API.get("/tenant-portal/my-payments");
  return res.data;
};

// ------- Tenant Maintenance List -------
export const getTenantMaintenance = async () => {
  const res = await API.get("/tenant-portal/my-maintenance");
  return res.data;
};

// ------- Tenant Overview (combine data from multiple endpoints) -------
export const getTenantOverview = async () => {
  try {
    const [leases, payments, maintenance] = await Promise.all([
      getTenantLease(),
      getTenantPayments(),
      getTenantMaintenance()
    ]);
    
    return {
      leases,
      payments,
      maintenance
    };
  } catch (error) {
    console.error('Error fetching tenant overview:', error);
    throw error;
  }
};

// ------- Tenant Properties (from leases) -------
export const getTenantProperties = async () => {
  const leases = await getTenantLease();
  // Extract unique properties from leases
  const properties = leases
    .filter(lease => lease.unit && lease.unit.property)
    .map(lease => lease.unit.property)
    .filter((property, index, self) => 
      index === self.findIndex(p => p.id === property.id)
    );
  return properties;
};

// ------- Tenant Units (from leases) -------
export const getTenantUnits = async () => {
  const leases = await getTenantLease();
  const units = leases
    .filter(lease => lease.unit)
    .map(lease => lease.unit);
  return units;
};

// ------- CREATE Maintenance Request -------
export const createTenantMaintenance = async (data) => {
  const res = await API.post("/maintenance/", data);
  return res.data;
};

// ------- Upload Tenant Maintenance Photo -------
export const uploadTenantMaintenancePhoto = async (id, file) => {
  const form = new FormData();
  form.append("files", file);

  const res = await API.post(`/maintenance/${id}/photos`, form, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return res.data;
};
