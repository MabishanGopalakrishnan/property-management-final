import express from "express";
import { authRequired } from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/roleMiddleware.js";
import {
  getAllMaintenanceRequests,
  getMaintenanceRequestById,
  updateMaintenanceRequest,
  uploadMaintenancePhoto,
} from "../controllers/maintenanceController.js";
import { maintenanceUpload } from "../middleware/upload.js";

const router = express.Router();

// Property Manager (LANDLORD in your roles)
router.use(authRequired);
router.use(requireRole("LANDLORD"));

// List all requests
router.get("/", getAllMaintenanceRequests);

// Get one
router.get("/:id", getMaintenanceRequestById);

// Update
router.put("/:id", updateMaintenanceRequest);

// Upload photos
router.post(
  "/:id/photo",
  maintenanceUpload.single("photo"),
  uploadMaintenancePhoto
);

export default router;
