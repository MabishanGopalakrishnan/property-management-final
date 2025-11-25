// backend/src/routes/unitRoutes.js
import express from "express";
import {
  createUnit,
  listUnits,
  updateUnit,
  deleteUnit,
} from "../controllers/unitController.js";
import { authRequired, requireRole } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(authRequired, requireRole("LANDLORD"));

router.get("/property/:propertyId", listUnits);
router.post("/property/:propertyId", createUnit);
router.put("/:unitId", updateUnit);
router.delete("/:unitId", deleteUnit);

export default router;
