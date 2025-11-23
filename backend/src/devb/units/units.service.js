const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createUnit(ownerId, propertyId, data) {
  // ensure property belongs to landlord
  const prop = await prisma.property.findFirst({
    where: { id: Number(propertyId), ownerId },
  });
  if (!prop) throw new Error("Property not found or not yours.");

  return prisma.unit.create({
    data: {
      ...data,
      propertyId: Number(propertyId),
    },
  });
}

async function updateUnit(ownerId, unitId, data) {
  const unit = await prisma.unit.findFirst({
    where: { id: Number(unitId), property: { ownerId } },
    include: { property: true }
  });
  if (!unit) throw new Error("Unit not found or not yours.");

  return prisma.unit.update({
    where: { id: Number(unitId) },
    data
  });
}

async function deleteUnit(ownerId, unitId) {
  const unit = await prisma.unit.findFirst({
    where: { id: Number(unitId), property: { ownerId } }
  });
  if (!unit) throw new Error("Unit not found or not yours.");

  return prisma.unit.delete({ where: { id: Number(unitId) } });
}

async function listUnits(ownerId, propertyId) {
  return prisma.unit.findMany({
    where: { propertyId: Number(propertyId), property: { ownerId } },
    include: { leases: true }
  });
}

module.exports = { createUnit, updateUnit, deleteUnit, listUnits };
