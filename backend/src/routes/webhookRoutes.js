// backend/src/routes/webhookRoutes.js
import express from "express";
import Stripe from "stripe";
import prisma from "../prisma/client.js";

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Stripe requires the raw body for signature verification
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

      await prisma.payment.updateMany({
        where: { stripePaymentIntentId: intent.id },
        data: { status: "PAID", paidAt: new Date() },
      });
    }

    res.json({ received: true });
  }
);

export default router;
