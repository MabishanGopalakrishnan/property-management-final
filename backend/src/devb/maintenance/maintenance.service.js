const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function tenantCreateRequest(userId, leaseId, data) {
  // verify lease belongs to this tenant
  const lease = await prisma.lease.findFirst({
    where: { id: Number(leaseId), tenant: { userId } }
  });
  if (!lease) throw new Error("Lease not found or not yours.");

  return prisma.maintenanceRequest.create({
    data: {
      leaseId: Number(leaseId),
      title: data.title,
      description: data.description,
      status: "OPEN",
      priority: data.priority || "LOW",
    }
  });
}

async function landlordListRequests(ownerId) {
  return prisma.maintenanceRequest.findMany({
    where: { lease: { unit: { property: { ownerId } } } },
    include: { lease: { include: { unit: { include: { property: true } }, tenant: { include: { user: true } } } } }
  });
}

async function landlordUpdateRequest(ownerId, requestId, data) {
  const reqRow = await prisma.maintenanceRequest.findFirst({
    where: { id: Number(requestId), lease: { unit: { property: { ownerId } } } }
  });
  if (!reqRow) throw new Error("Request not found or not yours.");

  return prisma.maintenanceRequest.update({
    where: { id: Number(requestId) },
    data
  });
}

module.exports = { tenantCreateRequest, landlordListRequests, landlordUpdateRequest };
