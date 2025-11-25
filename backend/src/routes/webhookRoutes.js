import express from "express";
import Stripe from "stripe";
import prisma from "../prisma/client.js";

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// raw body required
router.post(
  "/stripe",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    const sig = req.headers["stripe-signature"];

    let event;
    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.error("Webhook error:", err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === "payment_intent.succeeded") {
      const intent = event.data.object;
      const leaseId = intent.metadata.leaseId;

      await prisma.payment.updateMany({
        where: { stripePaymentIntentId: intent.id },
        data: { status: "PAID", paidAt: new Date() }
      });
    }

    res.json({ received: true });
  }
);

export default router;
