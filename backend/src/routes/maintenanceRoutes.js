import express from "express";
import {
  createMaintenanceRequest,
  getMaintenanceRequests,
  updateMaintenanceStatus
} from "../controllers/maintenanceController.js";

const router = express.Router();

// Tenants create maintenance requests (for a lease)
router.post("/:leaseId", createMaintenanceRequest);

// Landlord gets all maintenance requests
router.get("/", getMaintenanceRequests);

// Landlord updates maintenance status
router.put("/:id", updateMaintenanceStatus);

export default router;
