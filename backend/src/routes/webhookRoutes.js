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

    try {
      // Handle payment_intent.succeeded
      if (event.type === "payment_intent.succeeded") {
        const intent = event.data.object;

        // Update payment by payment intent ID
        await prisma.payment.updateMany({
          where: { stripePaymentIntentId: intent.id },
          data: { status: "PAID", paidAt: new Date() },
        });

        console.log(`Payment marked as PAID for intent: ${intent.id}`);
      }

      // Handle checkout.session.completed (alternative approach)
      if (event.type === "checkout.session.completed") {
        const session = event.data.object;

        // Get the payment ID from metadata
        const paymentId = session.metadata?.paymentId;
        if (paymentId) {
          // Fetch the session to get the payment intent
          const fullSession = await stripe.checkout.sessions.retrieve(session.id);
          
          // Update payment with payment intent ID and mark as paid
          await prisma.payment.update({
            where: { id: parseInt(paymentId) },
            data: {
              status: "PAID",
              paidAt: new Date(),
              stripePaymentIntentId: fullSession.payment_intent,
            },
          });

          console.log(`Payment ${paymentId} marked as PAID via checkout session`);
        }
      }
    } catch (err) {
      console.error("Error processing webhook event:", err.message);
    }

    res.json({ received: true });
  }
);

export default router;
