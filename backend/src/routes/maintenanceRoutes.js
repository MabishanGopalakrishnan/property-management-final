// import express from "express";
// import {
//   createMaintenanceRequest,
//   getMaintenanceRequests,
//   updateMaintenanceStatus
// } from "../controllers/maintenanceController.js";

// const router = express.Router();

// // Tenants create maintenance requests (for a lease)
// router.post("/:leaseId", createMaintenanceRequest);

// // Landlord gets all maintenance requests
// router.get("/", getMaintenanceRequests);

// // Landlord updates maintenance status
// router.put("/:id", updateMaintenanceStatus);

// export default router;
import express from "express";
import {
  createMaintenanceRequest,
  getMaintenanceRequests,
  updateMaintenanceStatus
} from "../controllers/maintenanceController.js";

import { authRequired } from "../middleware/authMiddleware.js";

const router = express.Router();
router.use(authRequired);

// TENANT submits maintenance request for their lease
router.post("/lease/:leaseId", (req, res, next) => {
  if (req.user.role !== "TENANT")
    return res.status(403).json({ message: "Tenant only" });
  next();
}, createMaintenanceRequest);

// LANDLORD lists all maintenance requests
router.get("/", (req, res, next) => {
  if (req.user.role !== "LANDLORD")
    return res.status(403).json({ message: "Landlord only" });
  next();
}, getMaintenanceRequests);

// LANDLORD updates maintenance status
router.put("/:id", (req, res, next) => {
  if (req.user.role !== "LANDLORD")
    return res.status(403).json({ message: "Landlord only" });
  next();
}, updateMaintenanceStatus);

export default router;
