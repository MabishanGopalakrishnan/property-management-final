// backend/src/services/tenantPortalService.js
import prisma from "../prisma/client.js";

// Helper: find tenant by userId or throw
async function getTenantOrThrow(userId) {
  const tenant = await prisma.tenant.findUnique({
    where: { userId },
    include: {
      user: true,
    },
  });

  if (!tenant) {
    // If tenant profile doesn't exist, create one
    console.warn(`Tenant profile not found for userId ${userId}. Creating one.`);
    const newTenant = await prisma.tenant.create({
      data: { userId },
      include: { user: true }
    });
    return newTenant;
  }

  return tenant;
}

// ---------- OVERVIEW ----------

export async function getTenantOverviewService(userId) {
  const tenant = await getTenantOrThrow(userId);

  // Active lease (if any)
  const activeLease = await prisma.lease.findFirst({
    where: {
      tenantId: tenant.id,
      status: "ACTIVE",
    },
    include: {
      unit: {
        include: {
          property: true,
        },
      },
      payments: true,
      maintenanceRequests: true,
    },
  });

  // All payments for this tenant (across leases)
  const payments = await prisma.payment.findMany({
    where: {
      lease: {
        tenantId: tenant.id,
      },
    },
    orderBy: { dueDate: "asc" },
  });

  const now = new Date();

  let totalUnpaid = 0;
  let lateCount = 0;
  let upcomingPayment = null;

  for (const p of payments) {
    const isPaid = p.status === "PAID";
    if (!isPaid) {
      totalUnpaid += Number(p.amount || 0);
      if (p.dueDate < now) {
        lateCount += 1;
      } else if (!upcomingPayment) {
        upcomingPayment = p;
      }
    }
  }

  // Open maintenance tickets
  const openRequestsCount = await prisma.maintenanceRequest.count({
    where: {
      lease: {
        tenantId: tenant.id,
      },
      status: {
        in: ["PENDING", "IN_PROGRESS"],
      },
    },
  });

  return {
    tenant: {
      id: tenant.id,
      name: tenant.user.name,
      email: tenant.user.email,
      phone: tenant.phone || null,
    },
    lease: activeLease
      ? {
          id: activeLease.id,
          startDate: activeLease.startDate,
          endDate: activeLease.endDate,
          status: activeLease.status,
          rent: activeLease.rent,
          unitNumber: activeLease.unit.unitNumber,
          property: {
            id: activeLease.unit.property.id,
            title: activeLease.unit.property.title,
            address: activeLease.unit.property.address,
            city: activeLease.unit.property.city,
            province: activeLease.unit.property.province,
            postalCode: activeLease.unit.property.postalCode,
          },
        }
      : null,
    payments: {
      totalUnpaid,
      lateCount,
      upcoming: upcomingPayment,
    },
    maintenance: {
      openRequestsCount,
    },
  };
}

// ---------- PROPERTIES ----------

export async function getTenantPropertiesService(userId) {
  const tenant = await getTenantOrThrow(userId);

  const leases = await prisma.lease.findMany({
    where: {
      tenantId: tenant.id,
    },
    include: {
      unit: {
        include: {
          property: true,
        },
      },
    },
  });

  // Unique properties
  const map = new Map();
  for (const lease of leases) {
    const prop = lease.unit.property;
    if (!map.has(prop.id)) {
      map.set(prop.id, {
        id: prop.id,
        title: prop.title,
        address: prop.address,
        city: prop.city,
        province: prop.province,
        postalCode: prop.postalCode,
      });
    }
  }

  return Array.from(map.values());
}

// ---------- UNITS ----------

export async function getTenantUnitsService(userId) {
  const tenant = await getTenantOrThrow(userId);

  const leases = await prisma.lease.findMany({
    where: {
      tenantId: tenant.id,
    },
    include: {
      unit: {
        include: {
          property: true,
        },
      },
    },
  });

  return leases.map((lease) => ({
    leaseId: lease.id,
    status: lease.status,
    startDate: lease.startDate,
    endDate: lease.endDate,
    rent: lease.rent,
    unit: {
      id: lease.unit.id,
      unitNumber: lease.unit.unitNumber,
      bedrooms: lease.unit.bedrooms,
      bathrooms: lease.unit.bathrooms,
      rentAmount: lease.unit.rentAmount,
    },
    property: {
      id: lease.unit.property.id,
      title: lease.unit.property.title,
      address: lease.unit.property.address,
      city: lease.unit.property.city,
      province: lease.unit.property.province,
      postalCode: lease.unit.property.postalCode,
    },
  }));
}

// ---------- LEASE (current / all) ----------

export async function getTenantLeaseService(userId) {
  const tenant = await getTenantOrThrow(userId);

  const leases = await prisma.lease.findMany({
    where: {
      tenantId: tenant.id,
    },
    orderBy: { startDate: "desc" },
    include: {
      unit: {
        include: {
          property: true,
        },
      },
    },
  });

  return leases.map((lease) => ({
    id: lease.id,
    startDate: lease.startDate,
    endDate: lease.endDate,
    status: lease.status,
    rent: lease.rent,
    unitNumber: lease.unit.unitNumber,
    property: {
      id: lease.unit.property.id,
      title: lease.unit.property.title,
      address: lease.unit.property.address,
      city: lease.unit.property.city,
      province: lease.unit.property.province,
      postalCode: lease.unit.property.postalCode,
    },
  }));
}

// ---------- PAYMENTS ----------

export async function getTenantPaymentsService(userId) {
  const tenant = await getTenantOrThrow(userId);

  const payments = await prisma.payment.findMany({
    where: {
      lease: {
        tenantId: tenant.id,
      },
    },
    orderBy: { dueDate: "asc" },
    include: {
      lease: {
        include: {
          unit: {
            include: {
              property: true,
            },
          },
        },
      },
    },
  });

  return payments.map((p) => ({
    id: p.id,
    amount: p.amount,
    dueDate: p.dueDate,
    status: p.status,
    paidAt: p.paidAt,
    leaseId: p.leaseId,
    unitNumber: p.lease.unit.unitNumber,
    propertyTitle: p.lease.unit.property.title,
  }));
}

// ---------- MAINTENANCE ----------

export async function getTenantMaintenanceService(userId) {
  const tenant = await getTenantOrThrow(userId);

  const requests = await prisma.maintenanceRequest.findMany({
    where: {
      lease: {
        tenantId: tenant.id,
      },
    },
    orderBy: { createdAt: "desc" },
    include: {
      lease: {
        include: {
          unit: {
            include: {
              property: true,
            },
          },
        },
      },
    },
  });

  return requests.map((r) => ({
    id: r.id,
    title: r.title,
    description: r.description,
    status: r.status,
    priority: r.priority,
    createdAt: r.createdAt,
    completedAt: r.completedAt,
    leaseId: r.leaseId,
    unitNumber: r.lease.unit.unitNumber,
    propertyTitle: r.lease.unit.property.title,
  }));
}
// ---------- CREATE MAINTENANCE REQUEST ----------
export async function createTenantMaintenanceRequestService(userId, data) {
  const tenant = await getTenantOrThrow(userId);

  // A tenant must have an active lease to create a maintenance request
  const lease = await prisma.lease.findFirst({
    where: {
      tenantId: tenant.id,
      status: "ACTIVE",
    },
  });

  if (!lease) {
    throw new Error("You do not have an active lease.");
  }

  // Create maintenance request
  const request = await prisma.maintenanceRequest.create({
    data: {
      title: data.title,
      description: data.description,
      priority: data.priority || "MEDIUM",
      leaseId: lease.id,
    },
  });

  return request;
}
