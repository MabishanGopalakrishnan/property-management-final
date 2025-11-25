// import express from "express";
// import {
//   createUnit,
//   getUnitsByProperty,
//   updateUnit,
//   deleteUnit
// } from "../controllers/unitController.js";

// const router = express.Router();

// // CREATE a unit under a property
// router.post("/:propertyId", createUnit);

// // GET all units for one property
// router.get("/property/:propertyId", getUnitsByProperty);

// // UPDATE unit
// router.put("/:id", updateUnit);

// // DELETE unit
// router.delete("/:id", deleteUnit);

// export default router;


import express from "express";
import {
  createUnit,
  listUnits,
  updateUnit,
  deleteUnit
} from "../controllers/unitController.js";
import { authRequired } from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.use(authRequired, requireRole("LANDLORD"));

router.get("/property/:propertyId", listUnits);
router.post("/property/:propertyId", createUnit);
router.put("/:unitId", updateUnit);
router.delete("/:unitId", deleteUnit);

export default router;
