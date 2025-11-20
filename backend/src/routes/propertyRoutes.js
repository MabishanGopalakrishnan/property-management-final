import express from "express";
import {
  createProperty,
  getAllProperties,
  getPropertyById,
  updateProperty,
  deleteProperty
} from "../controllers/propertyController.js";

const router = express.Router();

// ROUTES
router.post("/", createProperty);
router.get("/", getAllProperties);
router.get("/:id", getPropertyById);
router.put("/:id", updateProperty);
router.delete("/:id", deleteProperty);

export default router;
