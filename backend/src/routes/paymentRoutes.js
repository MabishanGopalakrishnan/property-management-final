import express from "express";
import {
  createPaymentIntent,
  getPaymentsByLease,
  updatePaymentStatus,
  stripeWebhook
} from "../controllers/paymentController.js";

const router = express.Router();

// Create Stripe payment intent
router.post("/create-intent", createPaymentIntent);

// Get payments for lease
router.get("/lease/:leaseId", getPaymentsByLease);

// Update payment status manually
router.put("/:id", updatePaymentStatus);

// Stripe webhook
router.post("/webhook", express.raw({ type: "application/json" }), stripeWebhook);

export default router;
