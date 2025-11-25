import prisma from "../prisma/client.js";

export const createMaintenanceRequestService = async (leaseId, data) => {
  // Verify lease exists
  const lease = await prisma.lease.findUnique({ where: { id: leaseId } });
  if (!lease) throw new Error("Lease not found.");

  return prisma.maintenanceRequest.create({
    data: {
      title: data.title,
      description: data.description,
      leaseId
    }
  });
};

export const getMaintenanceRequestsService = () => {
  return prisma.maintenanceRequest.findMany({
    include: {
      lease: {
        include: {
          tenant: true,
          unit: true
        }
      }
    }
  });
};

export const updateMaintenanceStatusService = (id, status) => {
  return prisma.maintenanceRequest.update({
    where: { id },
    data: { status },
    include: {
      lease: true
    }
  });
};
