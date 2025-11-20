import prisma from "../prisma/client.js";

export const createUnitService = (propertyId, data) => {
  return prisma.unit.create({
    data: {
      ...data,
      propertyId,
    },
  });
};

export const getUnitsByPropertyService = (propertyId) => {
  return prisma.unit.findMany({
    where: { propertyId },
  });
};

export const updateUnitService = (id, data) => {
  return prisma.unit.update({
    where: { id },
    data,
  });
};

export const deleteUnitService = (id) => {
  return prisma.unit.delete({
    where: { id },
  });
};
