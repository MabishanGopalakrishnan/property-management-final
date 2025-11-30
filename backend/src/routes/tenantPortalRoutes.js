// backend/src/routes/tenantPortalRoutes.js
import express from "express";
import { authRequired, requireRole } from "../middleware/authMiddleware.js";
import { maintenanceUpload } from "../middleware/upload.js";

import {
  getTenantOverview,
  getTenantProperties,
  getTenantUnits,
  getTenantLease,
  getTenantPayments,
  getTenantMaintenance,
  createTenantMaintenance,
  uploadTenantMaintenancePhoto
} from "../controllers/tenantPortalController.js";

const router = express.Router();

// All these routes are for TENANTS
router.get("/overview", authRequired, requireRole("TENANT"), getTenantOverview);
router.get("/properties", authRequired, requireRole("TENANT"), getTenantProperties);
router.get("/units", authRequired, requireRole("TENANT"), getTenantUnits);
router.get("/lease", authRequired, requireRole("TENANT"), getTenantLease);
router.get("/payments", authRequired, requireRole("TENANT"), getTenantPayments);
router.get("/maintenance", authRequired, requireRole("TENANT"), getTenantMaintenance);
router.post("/maintenance", authRequired, requireRole("TENANT"), createTenantMaintenance);
router.post("/maintenance/:id/photo", authRequired, requireRole("TENANT"), maintenanceUpload.single("photo"), uploadTenantMaintenancePhoto);

export default router;
