// backend/src/routes/tenantRoutes.js
import express from "express";
import { authRequired, requireRole } from "../middleware/authMiddleware.js";
import {
  listTenants,
  getTenantPortalProfile,
  getTenantLeases,
  getTenantPayments,
  createTenantMaintenanceRequest,
  getTenantMaintenanceRequests,
} from "../controllers/tenantController.js";

const router = express.Router();

// LANDLORD — list all tenants
router.get("/", authRequired, requireRole("LANDLORD"), listTenants);

// TENANT PORTAL ROUTES
router.get("/me", authRequired, requireRole("TENANT"), getTenantPortalProfile);
router.get("/leases", authRequired, requireRole("TENANT"), getTenantLeases);
router.get("/payments", authRequired, requireRole("TENANT"), getTenantPayments);
router.get(
  "/maintenance",
  authRequired,
  requireRole("TENANT"),
  getTenantMaintenanceRequests
);
router.post(
  "/maintenance",
  authRequired,
  requireRole("TENANT"),
  createTenantMaintenanceRequest
);

export default router;
