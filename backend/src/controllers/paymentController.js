// backend/src/controllers/paymentController.js
import stripe from "stripe";
import {
  getTenantPayments,
  getLandlordPaymentsService,
  getLeasePaymentsService,
  markPaymentPaidService,
  getLandlordPaymentSummaryService,
  getLandlordPaymentChartService,
} from "../services/paymentService.js";

const stripeClient = new stripe(process.env.STRIPE_SECRET_KEY);

// Helper: perform the sync logic (callable from controllers or background jobs)
export const performStripeSync = async () => {
  const prisma = (await import("../prisma/client.js")).default;

  // Find payments that are not marked PAID and have a stripe id
  const pending = await prisma.payment.findMany({
    where: {
      status: { not: "PAID" },
      stripePaymentIntentId: { not: null },
    },
  });

  let updatedCount = 0;

  for (const p of pending) {
    const id = p.stripePaymentIntentId;

    try {
      let paymentIntentId = null;

      if (!id) continue;

      if (id.startsWith("pi_")) {
        paymentIntentId = id;
      } else if (id.startsWith("cs_") || id.startsWith("sess_")) {
        const session = await stripeClient.checkout.sessions.retrieve(id);
        paymentIntentId = session.payment_intent;
      } else {
        paymentIntentId = id;
      }

      if (!paymentIntentId) continue;

      const pi = await stripeClient.paymentIntents.retrieve(paymentIntentId);

      if (pi && (pi.status === "succeeded" || pi.status === "requires_capture")) {
        await prisma.payment.update({
          where: { id: p.id },
          data: { status: "PAID", paidAt: new Date(), stripePaymentIntentId: paymentIntentId },
        });
        updatedCount++;
      }
    } catch (err) {
      console.warn(`Failed to sync payment ${p.id}:`, err.message || err);
      continue;
    }
  }

  return { updated: updatedCount };
};

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

// POST /api/payments/:paymentId/checkout
// Create Stripe checkout session for a specific payment
export const createCheckoutSession = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const userId = req.user.id;

    // Get payment details from database
    const prisma = (await import("../prisma/client.js")).default;
    const payment = await prisma.payment.findUnique({
      where: { id: parseInt(paymentId) },
      include: {
        lease: {
          include: {
            tenant: true,
            unit: {
              include: { property: true },
            },
          },
        },
      },
    });

    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    // Verify the payment belongs to the logged-in tenant
    if (payment.lease.tenant.userId !== userId) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    // Create Stripe session
    const session = await stripeClient.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `Rent Payment - ${payment.lease.unit.property.title}`,
              description: `Unit ${payment.lease.unit.unitNumber} - Due ${new Date(payment.dueDate).toLocaleDateString()}`,
            },
            unit_amount: Math.round(payment.amount * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      success_url: `${process.env.FRONTEND_URL || "http://localhost"}/tenant/payments?success=true`,
      cancel_url: `${process.env.FRONTEND_URL || "http://localhost"}/tenant/payments?canceled=true`,
      metadata: {
        paymentId: payment.id.toString(),
        userId: userId.toString(),
      },
    });

    // Store the Stripe payment intent ID (will be populated when payment completes)
    // We'll extract it from the webhook later
    await prisma.payment.update({
      where: { id: parseInt(paymentId) },
      data: { stripePaymentIntentId: session.payment_intent || session.id },
    });

    res.json({ sessionId: session.id, url: session.url });
  } catch (err) {
    console.error("Stripe checkout error:", err);
    res.status(500).json({ message: "Failed to create payment session" });
  }
};

// POST /api/payments/sync
// Scan payments with a Stripe session/intent and update status from Stripe
export const syncPaymentsWithStripe = async (req, res) => {
  try {
    const result = await performStripeSync();
    res.json({ message: "Sync completed", result });
  } catch (err) {
    console.error("syncPaymentsWithStripe error:", err);
    res.status(500).json({ message: "Failed to sync payments" });
  }
};
