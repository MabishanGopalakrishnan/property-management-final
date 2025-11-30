// backend/src/services/propertyService.js
import prisma from "../prisma/client.js";

// CREATE PROPERTY
export const createPropertyService = async (data) => {
  return prisma.property.create({
    data: {
      title: data.title,
      address: data.address,
      city: data.city,
      province: data.province,
      postalCode: data.postalCode,
      description: data.description || "",
      landlordId: data.landlordId, // comes from controller (req.user.id)
    },
  });
};

// GET ALL PROPERTIES FOR A LANDLORD
export const getAllPropertiesService = async (landlordId) => {
  return prisma.property.findMany({
    where: { landlordId },
    orderBy: { createdAt: "desc" },
    include: { units: true },
  });
};

// GET ONE PROPERTY (scoped to landlord)
export const getPropertyByIdService = async (landlordId, id) => {
  return prisma.property.findFirst({
    where: { id, landlordId },
    include: { units: true },
  });
};

// UPDATE PROPERTY (scoped to landlord)
export const updatePropertyService = async (landlordId, id, data) => {
  const existing = await prisma.property.findFirst({
    where: { id, landlordId },
  });

  if (!existing) {
    throw new Error("Property not found or not yours.");
  }

  if ("landlordId" in data) {
    delete data.landlordId;
  }

  return prisma.property.update({
    where: { id },
    data,
  });
};

// DELETE PROPERTY (scoped to landlord)
export const deletePropertyService = async (landlordId, id) => {
  const existing = await prisma.property.findFirst({
    where: { id, landlordId },
    include: { units: true },
  });

  if (!existing) {
    throw new Error("Property not found or not yours.");
  }

  // Check if property has any units
  if (existing.units && existing.units.length > 0) {
    throw new Error("Cannot delete property with existing units. Please delete all units first.");
  }

  return prisma.property.delete({
    where: { id },
  });
};
