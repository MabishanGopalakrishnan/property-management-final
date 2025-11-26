import prisma from "../prisma/client.js";

export const getPaymentHistoryService = async (user, leaseId) => {
  const lease = await prisma.lease.findUnique({
    where: { id: Number(leaseId) },
    include: { tenant: true, unit: { include: { property: true } } }
  });
  if (!lease) throw new Error("Lease not found");

  // tenant can only view own lease payments
  if (user.role === "TENANT") {
    if (lease.tenant.userId !== user.id)
      throw new Error("Forbidden");
  }

  // landlord can only view own property payments
  if (user.role === "LANDLORD") {
    if (lease.unit.property.ownerId !== user.id)
      throw new Error("Forbidden");
  }

  return prisma.payment.findMany({
    where: { leaseId: Number(leaseId) },
    orderBy: { createdAt: "desc" }
  });
};
