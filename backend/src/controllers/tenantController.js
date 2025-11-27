// backend/src/controllers/tenantController.js
import {
  listTenantsService,
  getTenantPortalProfileService,
  getTenantLeasesService,
  getTenantPaymentsService,
  createTenantMaintenanceRequestService,
  getTenantMaintenanceRequestsService,
} from "../services/tenantService.js";

export const listTenants = async (req, res) => {
  try {
    const tenants = await listTenantsService();
    // Transform to match frontend expectations: { id, name, email }
    const formatted = tenants.map((t) => ({
      id: t.id,
      name: t.user.name,
      email: t.user.email,
    }));
    res.json(formatted);
  } catch (err) {
    console.error("List tenants error:", err);
    res.status(500).json({ error: "Something went wrong." });
  }
};

// TENANT PORTAL: Profile
export const getTenantPortalProfile = async (req, res) => {
  try {
    const profile = await getTenantPortalProfileService(req.user.id);
    res.json(profile);
  } catch (err) {
    console.error("Tenant profile error:", err);
    res.status(500).json({ error: "Something went wrong." });
  }
};

// TENANT PORTAL: Leases
export const getTenantLeases = async (req, res) => {
  try {
    const leases = await getTenantLeasesService(req.user.id);
    res.json(leases);
  } catch (err) {
    console.error("Tenant leases error:", err);
    res.status(500).json({ error: "Something went wrong." });
  }
};

// TENANT PORTAL: Payments
export const getTenantPayments = async (req, res) => {
  try {
    const payments = await getTenantPaymentsService(req.user.id);
    res.json(payments);
  } catch (err) {
    console.error("Tenant payments error:", err);
    res.status(500).json({ error: "Something went wrong." });
  }
};

// TENANT PORTAL: Create maintenance request
export const createTenantMaintenanceRequest = async (req, res) => {
  try {
    const request = await createTenantMaintenanceRequestService(
      req.user.id,
      req.body
    );
    res.status(201).json(request);
  } catch (err) {
    console.error("Tenant maintenance create error:", err);
    res.status(400).json({ error: err.message });
  }
};

// TENANT PORTAL: Get maintenance requests
export const getTenantMaintenanceRequests = async (req, res) => {
  try {
    const requests = await getTenantMaintenanceRequestsService(req.user.id);
    res.json(requests);
  } catch (err) {
    console.error("Tenant maintenance list error:", err);
    res.status(500).json({ error: "Something went wrong." });
  }
};
