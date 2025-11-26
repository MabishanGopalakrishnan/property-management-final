// backend/src/routes/leaseRoutes.js
import express from "express";
import {
  createLease,
  getLeasesByProperty,
  getLeasesByUnit,
  getLeaseById,
  updateLease,
  deleteLease,
} from "../controllers/leaseController.js";
import { authRequired } from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/roleMiddleware.js";

const router = express.Router();

// Only landlords manage leases (for now)
router.use(authRequired, requireRole("LANDLORD"));

// Create lease
router.post("/", createLease);

// Get all leases for a property (via its units)
router.get("/property/:propertyId", getLeasesByProperty);

// Get all leases for a unit
router.get("/unit/:unitId", getLeasesByUnit);

// Single lease
router.get("/:id", getLeaseById);
router.put("/:id", updateLease);
router.delete("/:id", deleteLease);

export default router;
