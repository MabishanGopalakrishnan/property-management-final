import prisma from "../prisma/client.js";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const createPaymentIntentService = async ({ leaseId, amount }) => {
  const lease = await prisma.lease.findUnique({ where: { id: Number(leaseId) } });
  if (!lease) throw new Error("Lease not found");

  const intent = await stripe.paymentIntents.create({
    amount: Math.round(Number(amount) * 100),
    currency: "cad",
    metadata: { leaseId: String(leaseId) }
  });

  await prisma.payment.create({
    data: {
      leaseId: Number(leaseId),
      amount: Number(amount),
      status: "PENDING",
      stripePaymentIntentId: intent.id
    }
  });

  return { clientSecret: intent.client_secret, intentId: intent.id };
};
