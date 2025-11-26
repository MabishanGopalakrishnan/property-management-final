// backend/src/routes/propertyRoutes.js

import express from "express";
import {
  createProperty,
  deleteProperty,
  listProperties,
  updateProperty,
  getPropertyById,
} from "../controllers/propertyController.js";

import { authRequired, requireRole } from "../middleware/authMiddleware.js";

const router = express.Router();

// Only property managers (LANDLORD role) can manage properties
router.use(authRequired, requireRole("LANDLORD"));

router.get("/", listProperties);
router.post("/", createProperty);
router.get("/:propertyId", getPropertyById);
router.put("/:propertyId", updateProperty);
router.delete("/:propertyId", deleteProperty);

export default router;
