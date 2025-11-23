// import prisma from "../prisma/client.js";

// export const createUnitService = (propertyId, data) => {
//   return prisma.unit.create({
//     data: {
//       ...data,
//       propertyId,
//     },
//   });
// };

// export const getUnitsByPropertyService = (propertyId) => {
//   return prisma.unit.findMany({
//     where: { propertyId },
//   });
// };

// export const updateUnitService = (id, data) => {
//   return prisma.unit.update({
//     where: { id },
//     data,
//   });
// };

// export const deleteUnitService = (id) => {
//   return prisma.unit.delete({
//     where: { id },
//   });
// };


import prisma from "../prisma/client.js";

export const createUnitService = async (ownerId, propertyId, data) => {
  const prop = await prisma.property.findFirst({
    where: { id: Number(propertyId), ownerId }
  });
  if (!prop) throw new Error("Property not found or not yours.");

  return prisma.unit.create({
    data: { ...data, propertyId: Number(propertyId) }
  });
};

export const listUnitsService = async (ownerId, propertyId) => {
  return prisma.unit.findMany({
    where: { propertyId: Number(propertyId), property: { ownerId } },
    include: { leases: true }
  });
};

export const updateUnitService = async (ownerId, unitId, data) => {
  const unit = await prisma.unit.findFirst({
    where: { id: Number(unitId), property: { ownerId } }
  });
  if (!unit) throw new Error("Unit not found or not yours.");

  return prisma.unit.update({
    where: { id: Number(unitId) },
    data
  });
};

export const deleteUnitService = async (ownerId, unitId) => {
  const unit = await prisma.unit.findFirst({
    where: { id: Number(unitId), property: { ownerId } }
  });
  if (!unit) throw new Error("Unit not found or not yours.");

  return prisma.unit.delete({ where: { id: Number(unitId) } });
};
