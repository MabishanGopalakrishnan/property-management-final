// backend/src/services/tenantService.js
import prisma from "../prisma/client.js";

// Get list of ALL tenants (landlord view)
export const listTenantsService = async () => {
  return prisma.tenant.findMany({
    include: {
      user: {
        select: { id: true, name: true, email: true },
      },
    },
    orderBy: { id: "asc" },
  });
};

// Get logged-in tenant profile + lease + unit + property
export const getTenantPortalProfileService = async (userId) => {
  return prisma.tenant.findUnique({
    where: { userId },
    include: {
      user: true,
      leases: {
        where: { status: "ACTIVE" },
        include: {
          unit: {
            include: { property: true },
          },
        },
      },
    },
  });
};

// Tenant leases
export const getTenantLeasesService = async (userId) => {
  const tenant = await prisma.tenant.findUnique({
    where: { userId },
  });
  if (!tenant) return [];

  return prisma.lease.findMany({
    where: { tenantId: tenant.id },
    include: {
      unit: { include: { property: true } },
      tenant: { include: { user: true } },
    },
  });
};

// Tenant payments
export const getTenantPaymentsService = async (userId) => {
  const tenant = await prisma.tenant.findUnique({ where: { userId } });
  if (!tenant) return [];

  return prisma.payment.findMany({
    where: {
      lease: {
        tenantId: tenant.id,
      },
    },
    include: {
      lease: {
        include: {
          unit: { include: { property: true } },
        },
      },
    },
    orderBy: { dueDate: "asc" },
  });
};

// Create maintenance request by tenant
export const createTenantMaintenanceRequestService = async (
  userId,
  data
) => {
  const tenant = await prisma.tenant.findUnique({ where: { userId } });
  if (!tenant) throw new Error("Tenant not found");

  return prisma.maintenanceRequest.create({
    data: {
      title: data.title,
      description: data.description || "",
      priority: data.priority || "MEDIUM",
      leaseId: Number(data.leaseId),
    },
  });
};

// Get tenant maintenance requests
export const getTenantMaintenanceRequestsService = async (userId) => {
  const tenant = await prisma.tenant.findUnique({ where: { userId } });
  if (!tenant) return [];

  return prisma.maintenanceRequest.findMany({
    where: {
      lease: {
        tenantId: tenant.id,
      },
    },
    include: {
      lease: {
        include: {
          unit: { include: { property: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
};
