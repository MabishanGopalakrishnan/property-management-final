import prisma from "../prisma/client.js";

// Business rule: A unit cannot have two active leases at the same time
async function checkActiveLease(unitId) {
  const existing = await prisma.lease.findFirst({
    where: {
      unitId,
      status: "ACTIVE"
    }
  });

  return existing ? true : false;
}

export const createLeaseService = async (data) => {
  const { unitId, tenantId, startDate, endDate } = data;

  // Business rule check
  const alreadyLeased = await checkActiveLease(unitId);
  if (alreadyLeased) {
    throw new Error("This unit already has an active lease.");
  }

  return prisma.lease.create({
    data: {
      unitId,
      tenantId,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
    }
  });
};

export const getLeasesByPropertyService = (propertyId) => {
  return prisma.lease.findMany({
    where: {
      unit: {
        propertyId
      }
    },
    include: {
      tenant: true,
      unit: true
    }
  });
};

export const getLeasesByUnitService = (unitId) => {
  return prisma.lease.findMany({
    where: { unitId },
    include: {
      tenant: true,
      unit: true
    }
  });
};

export const getLeaseByIdService = (id) => {
  return prisma.lease.findUnique({
    where: { id },
    include: {
      tenant: true,
      unit: true
    }
  });
};

export const updateLeaseService = (id, data) => {
  return prisma.lease.update({
    where: { id },
    data,
    include: {
      tenant: true,
      unit: true
    }
  });
};

export const deleteLeaseService = (id) => {
  return prisma.lease.delete({
    where: { id }
  });
};
