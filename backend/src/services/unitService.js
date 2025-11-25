// backend/src/services/unitService.js
import prisma from "../prisma/client.js";

export const createUnitService = async (landlordId, propertyId, data) => {
  const prop = await prisma.property.findFirst({
    where: { id: Number(propertyId), landlordId },
  });
  if (!prop) throw new Error("Property not found or not yours.");

  return prisma.unit.create({
    data: {
      unitNumber: data.unitNumber,
      propertyId: Number(propertyId),
      bedrooms:
        data.bedrooms !== undefined ? Number(data.bedrooms) : null,
      bathrooms:
        data.bathrooms !== undefined ? Number(data.bathrooms) : null,
      rentAmount:
        data.rentAmount !== undefined ? Number(data.rentAmount) : null,
    },
  });
};

export const listUnitsService = async (landlordId, propertyId) => {
  return prisma.unit.findMany({
    where: {
      propertyId: Number(propertyId),
      property: { landlordId },
    },
    include: { leases: true },
  });
};

export const updateUnitService = async (landlordId, unitId, data) => {
  const unit = await prisma.unit.findFirst({
    where: {
      id: Number(unitId),
      property: { landlordId },
    },
  });
  if (!unit) throw new Error("Unit not found or not yours.");

  const updateData = { ...data };

  if (updateData.bedrooms !== undefined) {
    updateData.bedrooms = Number(updateData.bedrooms);
  }
  if (updateData.bathrooms !== undefined) {
    updateData.bathrooms = Number(updateData.bathrooms);
  }
  if (updateData.rentAmount !== undefined) {
    updateData.rentAmount = Number(updateData.rentAmount);
  }

  return prisma.unit.update({
    where: { id: Number(unitId) },
    data: updateData,
  });
};

export const deleteUnitService = async (landlordId, unitId) => {
  const unit = await prisma.unit.findFirst({
    where: {
      id: Number(unitId),
      property: { landlordId },
    },
    include: { leases: true },
  });

  if (!unit) throw new Error("Unit not found or not yours.");
  if (unit.leases.length > 0) {
    throw new Error("Cannot delete a unit that has leases. End/delete the leases first.");
  }

  return prisma.unit.delete({
    where: { id: Number(unitId) },
  });
};
