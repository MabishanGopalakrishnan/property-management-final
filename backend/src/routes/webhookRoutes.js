import express from "express";
import { stripeWebhook } from "../controllers/paymentController.js";

const router = express.Router();

// RAW BODY REQUIRED BY STRIPE
router.post(
  "/stripe",
  express.raw({ type: "application/json" }),
  stripeWebhook
);

export default router;
