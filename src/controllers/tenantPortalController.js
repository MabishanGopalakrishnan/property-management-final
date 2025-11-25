// backend/src/controllers/tenantPortalController.js
import {
  getTenantOverviewService,
  getTenantPropertiesService,
  getTenantUnitsService,
  getTenantLeaseService,
  getTenantPaymentsService,
  getTenantMaintenanceService,
} from "../services/tenantPortalService.js";

export async function getTenantOverview(req, res) {
  try {
    const userId = req.user.id;
    const overview = await getTenantOverviewService(userId);
    return res.json(overview);
  } catch (err) {
    console.error("getTenantOverview error:", err);
    return res
      .status(500)
      .json({ error: "Failed to load tenant overview." });
  }
}

export async function getTenantProperties(req, res) {
  try {
    const userId = req.user.id;
    const properties = await getTenantPropertiesService(userId);
    return res.json(properties);
  } catch (err) {
    console.error("getTenantProperties error:", err);
    return res
      .status(500)
      .json({ error: "Failed to load tenant properties." });
  }
}

export async function getTenantUnits(req, res) {
  try {
    const userId = req.user.id;
    const units = await getTenantUnitsService(userId);
    return res.json(units);
  } catch (err) {
    console.error("getTenantUnits error:", err);
    return res
      .status(500)
      .json({ error: "Failed to load tenant units." });
  }
}

export async function getTenantLease(req, res) {
  try {
    const userId = req.user.id;
    const leases = await getTenantLeaseService(userId);
    return res.json(leases);
  } catch (err) {
    console.error("getTenantLease error:", err);
    return res
      .status(500)
      .json({ error: "Failed to load tenant lease." });
  }
}

export async function getTenantPayments(req, res) {
  try {
    const userId = req.user.id;
    const payments = await getTenantPaymentsService(userId);
    return res.json(payments);
  } catch (err) {
    console.error("getTenantPayments error:", err);
    return res
      .status(500)
      .json({ error: "Failed to load tenant payments." });
  }
}

export async function getTenantMaintenance(req, res) {
  try {
    const userId = req.user.id;
    const maintenance = await getTenantMaintenanceService(userId);
    return res.json(maintenance);
  } catch (err) {
    console.error("getTenantMaintenance error:", err);
    return res
      .status(500)
      .json({ error: "Failed to load tenant maintenance." });
  }
}
