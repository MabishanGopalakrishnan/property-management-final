const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

function overlaps(aStart, aEnd, bStart, bEnd) {
  return (aStart <= bEnd) && (bStart <= aEnd);
}

async function createLease(ownerId, data) {
  const { unitId, tenantId, rent, startDate, endDate } = data;

  // confirm unit belongs to landlord
  const unit = await prisma.unit.findFirst({
    where: { id: Number(unitId), property: { ownerId } },
    include: { leases: true }
  });
  if (!unit) throw new Error("Unit not found or not yours.");

  const s = new Date(startDate);
  const e = new Date(endDate);
  if (s >= e) throw new Error("startDate must be before endDate.");

  // prevent overlap with existing leases
  for (const lease of unit.leases) {
    const ls = new Date(lease.startDate);
    const le = new Date(lease.endDate);
    if (overlaps(s, e, ls, le)) {
      throw new Error("Lease overlaps an existing lease for this unit.");
    }
  }

  return prisma.lease.create({
    data: {
      unitId: Number(unitId),
      tenantId: Number(tenantId),
      rent: Number(rent),
      startDate: s,
      endDate: e,
    }
  });
}

async function listLeasesForLandlord(ownerId) {
  return prisma.lease.findMany({
    where: { unit: { property: { ownerId } } },
    include: { unit: { include: { property: true } }, tenant: { include: { user: true } }, payments: true }
  });
}

async function listLeasesForTenant(userId) {
  return prisma.lease.findMany({
    where: { tenant: { userId } },
    include: { unit: { include: { property: true } }, payments: true, requests: true }
  });
}

module.exports = { createLease, listLeasesForLandlord, listLeasesForTenant };
