// backend/src/routes/tenantRoutes.js
import express from "express";
import { authRequired, requireRole } from "../middleware/authMiddleware.js";

// Tenant list (for landlords creating leases)
import { listTenants } from "../controllers/tenantController.js";

// NEW tenant portal controllers
import {
  getTenantOverview,
  getTenantProperties,
  getTenantUnits,
  getTenantLease,
  getTenantPayments,
  getTenantMaintenance,
  createTenantMaintenance
} from "../controllers/tenantPortalController.js";

const router = express.Router();

/* ------------------- LANDLORD ROUTES ------------------- */

// Get all tenants (for LANDLORD to select when creating leases)
router.get("/", authRequired, requireRole("LANDLORD"), listTenants);

/* ------------------- TENANT PORTAL ROUTES ------------------- */

// Dashboard overview
router.get("/overview", authRequired, requireRole("TENANT"), getTenantOverview);

// Properties
router.get("/properties", authRequired, requireRole("TENANT"), getTenantProperties);

// Units
router.get("/units", authRequired, requireRole("TENANT"), getTenantUnits);

// Lease info
router.get("/lease", authRequired, requireRole("TENANT"), getTenantLease);

// Payments
router.get("/payments", authRequired, requireRole("TENANT"), getTenantPayments);

// Maintenance (list)
router.get("/maintenance", authRequired, requireRole("TENANT"), getTenantMaintenance);

// Maintenance (create new request)
router.post("/maintenance", authRequired, requireRole("TENANT"), createTenantMaintenance);

export default router;
