// backend/src/services/maintenanceService.js
import prisma from "../prisma/client.js";

// -------------------------------
// Get all maintenance requests (Property Manager)
// -------------------------------
export const getAllMaintenanceRequestsService = async () => {
  return prisma.maintenanceRequest.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      lease: {
        include: {
          tenant: { include: { user: true } },
          unit: {
            include: {
              property: true,
            },
          },
        },
      },
    },
  });
};

// -------------------------------
// Get a single request
// -------------------------------
export const getMaintenanceRequestByIdService = async (id) => {
  return prisma.maintenanceRequest.findUnique({
    where: { id: Number(id) },
    include: {
      lease: {
        include: {
          tenant: { include: { user: true } },
          unit: { include: { property: true } },
        },
      },
    },
  });
};

// -------------------------------
// Update a request (status, priority, contractor, description, completion)
// -------------------------------
export const updateMaintenanceRequestService = async (id, data) => {
  // If status changed to COMPLETED → add completion date
  if (data.status === "COMPLETED") {
    data.completedAt = new Date();
  }

  return prisma.maintenanceRequest.update({
    where: { id: Number(id) },
    data,
    include: {
      lease: {
        include: {
          tenant: { include: { user: true } },
          unit: { include: { property: true } },
        },
      },
    },
  });
};

// -------------------------------
// Upload photos (local storage for now)
// -------------------------------
export const addPhotoToMaintenanceRequestService = async (id, photoUrl) => {
  const request = await prisma.maintenanceRequest.findUnique({
    where: { id: Number(id) },
  });

  const existingPhotos = request.photos || [];
  const updatedPhotos = [...existingPhotos, photoUrl];

  return prisma.maintenanceRequest.update({
    where: { id: Number(id) },
    data: {
      photos: updatedPhotos,
    },
  });
};
