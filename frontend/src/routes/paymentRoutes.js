// backend/src/routes/paymentRoutes.js
import express from "express";
import { authRequired } from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/roleMiddleware.js";
import {
  getMyPayments,
  getLandlordPayments,
  getLeasePayments,
  payPayment,
  getLandlordPaymentSummary,
  getLandlordPaymentChart,
} from "../controllers/paymentController.js";

const router = express.Router();

// All payment routes require authentication
router.use(authRequired);

// Tenant: view their own payments
router.get("/mine", requireRole("TENANT"), getMyPayments);

// Property manager: all payments
router.get("/landlord", requireRole("LANDLORD"), getLandlordPayments);

// Property manager: analytics KPIs
router.get(
  "/landlord/summary",
  requireRole("LANDLORD"),
  getLandlordPaymentSummary
);

// Property manager: monthly chart data
router.get(
  "/landlord/chart",
  requireRole("LANDLORD"),
  getLandlordPaymentChart
);

// Payments for a specific lease
router.get("/lease/:leaseId", getLeasePayments);

// Tenant marks a payment as paid
router.post("/:paymentId/pay", requireRole("TENANT"), payPayment);

export default router;
