import Stripe from "stripe";
import prisma from "../prisma/client.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// -------------------------
// 1. CREATE PAYMENT INTENT
// -------------------------
export const createPaymentIntent = async (req, res) => {
  try {
    const { leaseId, amount } = req.body;

    // Ensure lease exists
    const lease = await prisma.lease.findUnique({ where: { id: leaseId } });
    if (!lease) return res.status(404).json({ error: "Lease not found" });

    // Create PENDING payment entry in DB
    const payment = await prisma.payment.create({
      data: {
        leaseId,
        amount,
        status: "PENDING",
      },
    });

    // Create Stripe payment intent (metadata VERY IMPORTANT)
    const intent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // cents
      currency: "cad",
      metadata: {
        leaseId: leaseId.toString(),
        paymentId: payment.id.toString(),
      },
    });

    res.json({
      clientSecret: intent.client_secret,
      paymentId: payment.id,
    });

  } catch (err) {
    console.error("Error creating payment intent:", err.message);
    res.status(500).json({ error: err.message });
  }
};

// -------------------------
// 2. GET PAYMENTS BY LEASE
// -------------------------
export const getPaymentsByLease = async (req, res) => {
  try {
    const leaseId = Number(req.params.leaseId);

    const payments = await prisma.payment.findMany({
      where: { leaseId },
      orderBy: { createdAt: "desc" },
    });

    res.json(payments);
  } catch (err) {
    console.error("Get Payments Error:", err.message);
    res.status(500).json({ error: err.message });
  }
};

// -------------------------
// 3. UPDATE PAYMENT STATUS (Optional Admin Tool)
// -------------------------
export const updatePaymentStatus = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { status } = req.body;

    const updated = await prisma.payment.update({
      where: { id },
      data: { status },
    });

    res.json(updated);
  } catch (err) {
    console.error("Payment Update Error:", err.message);
    res.status(500).json({ error: err.message });
  }
};

// -------------------------
// 4. STRIPE WEBHOOK HANDLER
// -------------------------
export const stripeWebhook = async (req, res) => {
  try {
    const sig = req.headers["stripe-signature"];

    const event = stripe.webhooks.constructEvent(
      req.body, // RAW BODY REQUIRED
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );

    console.log("🔔 Stripe Event Received:", event.type);

    // -------------------------
    // SUCCESSFUL PAYMENT
    // -------------------------
    if (event.type === "payment_intent.succeeded") {
      const pi = event.data.object;

      // Some test Stripe events DO NOT include metadata
      if (!pi.metadata || !pi.metadata.paymentId) {
        console.log("⚠️ Skipping test event (no metadata)");
        return res.json({ received: true });
      }

      const paymentId = Number(pi.metadata.paymentId);

      await prisma.payment.update({
        where: { id: paymentId },
        data: {
          status: "PAID",
          datePaid: new Date(),
        },
      });

      console.log(`💰 Payment ${paymentId} marked as PAID`);
    }

    // -------------------------
    // FAILED PAYMENT
    // -------------------------
    if (event.type === "payment_intent.payment_failed") {
      const pi = event.data.object;

      if (!pi.metadata || !pi.metadata.paymentId) {
        console.log("⚠️ Skipping test event (no metadata)");
        return res.json({ received: true });
      }

      const paymentId = Number(pi.metadata.paymentId);

      await prisma.payment.update({
        where: { id: paymentId },
        data: {
          status: "FAILED",
        },
      });

      console.log(`❌ Payment ${paymentId} marked FAILED`);
    }

    // ACKNOWLEDGE RECEIPT
    res.json({ received: true });

  } catch (err) {
    console.error("❌ Webhook Error:", err.message);
    res.status(400).send(`Webhook Error: ${err.message}`);
  }
};
