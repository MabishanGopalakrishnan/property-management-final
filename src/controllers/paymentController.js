// backend/src/controllers/paymentController.js
import {
  getTenantPayments,
  getLandlordPaymentsService,
  getLeasePaymentsService,
  markPaymentPaidService,
  getLandlordPaymentSummaryService,
  getLandlordPaymentChartService,
} from "../services/paymentService.js";

// GET /api/payments/mine
export const getMyPayments = async (req, res) => {
  try {
    const userId = req.user.id;
    const payments = await getTenantPayments(userId);
    res.json(payments);
  } catch (err) {
    console.error("getMyPayments error:", err);
    res.status(500).json({ message: "Failed to fetch payments" });
  }
};

// GET /api/payments/landlord
export const getLandlordPayments = async (req, res) => {
  try {
    const landlordId = req.user.id;
    const payments = await getLandlordPaymentsService(landlordId);
    res.json(payments);
  } catch (err) {
    console.error("getLandlordPayments error:", err);
    res.status(500).json({ message: "Failed to fetch landlord payments" });
  }
};

// GET /api/payments/lease/:leaseId
export const getLeasePayments = async (req, res) => {
  try {
    const leaseId = req.params.leaseId;
    const payments = await getLeasePaymentsService(leaseId);
    res.json(payments);
  } catch (err) {
    console.error("getLeasePayments error:", err);
    res.status(500).json({ message: "Failed to fetch lease payments" });
  }
};

// POST /api/payments/:paymentId/pay
export const payPayment = async (req, res) => {
  try {
    const paymentId = req.params.paymentId;
    const updated = await markPaymentPaidService(paymentId);
    res.json(updated);
  } catch (err) {
    console.error("payPayment error:", err);
    res.status(500).json({ message: "Failed to mark payment as paid" });
  }
};

// GET /api/payments/landlord/summary
export const getLandlordPaymentSummary = async (req, res) => {
  try {
    const landlordId = req.user.id;
    const summary = await getLandlordPaymentSummaryService(landlordId);
    res.json(summary);
  } catch (err) {
    console.error("getLandlordPaymentSummary error:", err);
    res.status(500).json({ message: "Failed to fetch payment summary" });
  }
};

// GET /api/payments/landlord/chart
export const getLandlordPaymentChart = async (req, res) => {
  try {
    const landlordId = req.user.id;
    const chartData = await getLandlordPaymentChartService(landlordId);
    res.json(chartData);
  } catch (err) {
    console.error("getLandlordPaymentChart error:", err);
    res.status(500).json({ message: "Failed to fetch chart data" });
  }
};
