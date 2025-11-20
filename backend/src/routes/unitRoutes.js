import express from "express";
import {
  createUnit,
  getUnitsByProperty,
  updateUnit,
  deleteUnit
} from "../controllers/unitController.js";

const router = express.Router();

// CREATE a unit under a property
router.post("/:propertyId", createUnit);

// GET all units for one property
router.get("/property/:propertyId", getUnitsByProperty);

// UPDATE unit
router.put("/:id", updateUnit);

// DELETE unit
router.delete("/:id", deleteUnit);

export default router;
