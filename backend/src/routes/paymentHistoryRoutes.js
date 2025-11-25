import express from "express";
import { getPaymentsByLease } from "../controllers/paymentHistoryController.js";

const router = express.Router();

router.get("/:leaseId", getPaymentsByLease);

export default router;
