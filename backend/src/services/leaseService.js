// backend/src/services/leaseService.js
import prisma from "../prisma/client.js";
import { generateMonthlyPaymentsForLease } from "./paymentService.js";

// Check if a unit already has an ACTIVE lease
async function hasActiveLease(unitId) {
  const existing = await prisma.lease.findFirst({
    where: {
      unitId,
      status: "ACTIVE",
    },
  });
  return !!existing;
}

// Create a new lease
export const createLeaseService = async (landlordId, data) => {
  const unitId = Number(data.unitId);
  const tenantId = Number(data.tenantId);
  const startDate = new Date(data.startDate);
  const endDate = new Date(data.endDate);

  if (!unitId || !tenantId || Number.isNaN(unitId) || Number.isNaN(tenantId)) {
    throw new Error("Invalid unit or tenant.");
  }

  if (await hasActiveLease(unitId)) {
    throw new Error("This unit already has an active lease.");
  }

  // Ensure the unit belongs to this landlord
  const unit = await prisma.unit.findFirst({
    where: {
      id: unitId,
      property: {
        landlordId: Number(landlordId),
      },
    },
    include: { property: true },
  });

  if (!unit) {
    throw new Error("Unit not found or not owned by this landlord.");
  }

  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
  });

  if (!tenant) {
    throw new Error("Tenant not found.");
  }

  // Rent: prefer explicit rent, fallback to unit.rentAmount
  const rent =
    data.rent !== undefined && data.rent !== null && data.rent !== ""
      ? Number(data.rent)
      : unit.rentAmount;

  if (!rent || Number.isNaN(rent) || rent <= 0) {
    throw new Error("A valid rent amount is required.");
  }

  // Create lease
  const lease = await prisma.lease.create({
    data: {
      unitId,
      tenantId,
      rent,
      startDate,
      endDate,
    },
    include: {
      tenant: { include: { user: true } },
      unit: true,
    },
  });

  // Generate monthly scheduled payments
  await generateMonthlyPaymentsForLease(
    lease.id,
    lease.startDate,
    lease.endDate,
    lease.rent
  );

  return lease;
};

// Get leases for a property
export const getLeasesByPropertyService = async (landlordId, propertyId) => {
  return prisma.lease.findMany({
    where: {
      unit: {
        propertyId: Number(propertyId),
        property: { landlordId: Number(landlordId) },
      },
    },
    include: {
      tenant: { include: { user: true } },
      unit: true,
    },
  });
};

// Get leases for a unit
export const getLeasesByUnitService = async (landlordId, unitId) => {
  return prisma.lease.findMany({
    where: {
      unitId: Number(unitId),
      unit: { property: { landlordId: Number(landlordId) } },
    },
    include: {
      tenant: { include: { user: true } },
      unit: true,
    },
  });
};

// Get a single lease
export const getLeaseByIdService = async (landlordId, id) => {
  return prisma.lease.findFirst({
    where: {
      id: Number(id),
      unit: {
        property: { landlordId: Number(landlordId) },
      },
    },
    include: {
      tenant: { include: { user: true } },
      unit: true,
    },
  });
};

// Update lease
export const updateLeaseService = async (landlordId, id, data) => {
  const existing = await prisma.lease.findFirst({
    where: {
      id: Number(id),
      unit: { property: { landlordId: Number(landlordId) } },
    },
  });

  if (!existing) {
    throw new Error("Lease not found or not owned by this landlord.");
  }

  const updated = await prisma.lease.update({
    where: { id: Number(id) },
    data: {
      rent: data.rent !== undefined ? Number(data.rent) : undefined,
      startDate: data.startDate ? new Date(data.startDate) : undefined,
      endDate: data.endDate ? new Date(data.endDate) : undefined,
      status: data.status,
    },
    include: {
      tenant: { include: { user: true } },
      unit: true,
    },
  });

  // Regenerate scheduled payments if date/rent changed
  if (data.rent || data.startDate || data.endDate) {
    await generateMonthlyPaymentsForLease(
      updated.id,
      updated.startDate,
      updated.endDate,
      updated.rent
    );
  }

  return updated;
};

// Delete a lease
export const deleteLeaseService = async (landlordId, id) => {
  const existing = await prisma.lease.findFirst({
    where: {
      id: Number(id),
      unit: {
        property: { landlordId: Number(landlordId) },
      },
    },
  });

  if (!existing) throw new Error("Lease not found or not owned by this landlord.");

  await prisma.payment.deleteMany({ where: { leaseId: existing.id } });

  return prisma.lease.delete({ where: { id: existing.id } });
};
