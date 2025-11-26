// backend/src/controllers/tenantPortalController.js
import {
  getTenantOverviewService,
  getTenantPropertiesService,
  getTenantUnitsService,
  getTenantLeaseService,
  getTenantPaymentsService,
  getTenantMaintenanceService,
  createTenantMaintenanceRequestService
} from "../services/tenantPortalService.js";

// Overview
export async function getTenantOverview(req, res) {
  try {
    const data = await getTenantOverviewService(req.user.id);
    res.json(data);
  } catch (err) {
    console.error("getTenantOverview error:", err);
    res.status(500).json({ error: "Failed to load tenant overview." });
  }
}

// Properties
export async function getTenantProperties(req, res) {
  try {
    const data = await getTenantPropertiesService(req.user.id);
    res.json(data);
  } catch (err) {
    console.error("getTenantProperties error:", err);
    res.status(500).json({ error: "Failed to load tenant properties." });
  }
}

// Units
export async function getTenantUnits(req, res) {
  try {
    const data = await getTenantUnitsService(req.user.id);
    res.json(data);
  } catch (err) {
    console.error("getTenantUnits error:", err);
    res.status(500).json({ error: "Failed to load tenant units." });
  }
}

// Lease
export async function getTenantLease(req, res) {
  try {
    const data = await getTenantLeaseService(req.user.id);
    res.json(data);
  } catch (err) {
    console.error("getTenantLease error:", err);
    res.status(500).json({ error: "Failed to load tenant lease." });
  }
}

// Payments
export async function getTenantPayments(req, res) {
  try {
    const data = await getTenantPaymentsService(req.user.id);
    res.json(data);
  } catch (err) {
    console.error("getTenantPayments error:", err);
    res.status(500).json({ error: "Failed to load tenant payments." });
  }
}

// Maintenance list
export async function getTenantMaintenance(req, res) {
  try {
    const data = await getTenantMaintenanceService(req.user.id);
    res.json(data);
  } catch (err) {
    console.error("getTenantMaintenance error:", err);
    res.status(500).json({ error: "Failed to load maintenance requests." });
  }
}

// Create new maintenance request
export async function createTenantMaintenance(req, res) {
  try {
    const data = await createTenantMaintenanceRequestService(
      req.user.id,
      req.body
    );
    res.status(201).json(data);
  } catch (err) {
    console.error("createTenantMaintenance error:", err);
    res.status(400).json({ error: err.message });
  }
}
