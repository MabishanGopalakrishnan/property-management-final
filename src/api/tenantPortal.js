import API from "./axiosConfig";

export const getTenantOverview = () => API.get("/api/tenant/overview");
export const getTenantProperties = () => API.get("/api/tenant/properties");
export const getTenantUnits = () => API.get("/api/tenant/units");
export const getTenantLease = () => API.get("/api/tenant/lease");
export const getTenantPayments = () => API.get("/api/tenant/payments");
export const getTenantMaintenance = () => API.get("/api/tenant/maintenance");
