import prisma from "../prisma/client.js";

export const getPaymentsByLease = async (req, res) => {
  try {
    const leaseId = Number(req.params.leaseId);

    const payments = await prisma.payment.findMany({
      where: { leaseId },
      orderBy: { createdAt: "desc" },
    });

    res.json(payments);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
