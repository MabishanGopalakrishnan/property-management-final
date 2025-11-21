const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createProperty(ownerId, data) {
  return prisma.property.create({
    data: {
      ...data,
      ownerId,
    },
  });
}

async function getProperties(ownerId) {
  return prisma.property.findMany({
    where: { ownerId },
    include: { units: true },
  });
}

async function getPropertyById(ownerId, id) {
  return prisma.property.findFirst({
    where: { id: Number(id), ownerId },
    include: { units: true },
  });
}

async function updateProperty(ownerId, id, data) {
  // ensure owner owns it
  const prop = await prisma.property.findFirst({
    where: { id: Number(id), ownerId },
  });
  if (!prop) throw new Error("Property not found or not yours.");

  return prisma.property.update({
    where: { id: Number(id) },
    data,
  });
}

async function deleteProperty(ownerId, id) {
  const prop = await prisma.property.findFirst({
    where: { id: Number(id), ownerId },
  });
  if (!prop) throw new Error("Property not found or not yours.");

  return prisma.property.delete({ where: { id: Number(id) } });
}

module.exports = {
  createProperty,
  getProperties,
  getPropertyById,
  updateProperty,
  deleteProperty,
};
