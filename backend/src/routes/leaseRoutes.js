import express from "express";
import {
  createLease,
  getLeasesByProperty,
  getLeasesByUnit,
  getLeaseById,
  updateLease,
  deleteLease
} from "../controllers/leaseController.js";

const router = express.Router();

// Create lease (tenant → unit)
router.post("/", createLease);

// Get all leases for a property (via units)
router.get("/property/:propertyId", getLeasesByProperty);

// Get all leases for a unit
router.get("/unit/:unitId", getLeasesByUnit);

// Get lease by ID
router.get("/:id", getLeaseById);

// Update lease
router.put("/:id", updateLease);

// Delete lease
router.delete("/:id", deleteLease);

export default router;
