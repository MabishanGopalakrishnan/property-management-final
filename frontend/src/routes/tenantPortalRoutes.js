import express from "express";
import { requireAuth } from "../middleware/authMiddleware.js";
import {
  getTenantOverview,
  getTenantProperties,
  getTenantLeases,
  getTenantPayments,
  createMaintenanceRequest,
  getTenantMaintenance
} from "../controllers/tenantPortalController.js";

const router = express.Router();

// ALL tenant routes must require auth
router.use(requireAuth);

// Tenant overview
router.get("/overview", getTenantOverview);

// Tenant properties
router.get("/properties", getTenantProperties);

// Tenant leases
router.get("/leases", getTenantLeases);

// Tenant payments
router.get("/payments", getTenantPayments);

// Tenant maintenance
router.get("/maintenance", getTenantMaintenance);
router.post("/maintenance", createMaintenanceRequest);

export default router;
