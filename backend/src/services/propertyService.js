import prisma from "../prisma/client.js";

export const createPropertyService = (data) => {
  return prisma.property.create({ data });
};

export const getAllPropertiesService = () => {
  return prisma.property.findMany({
    include: { units: true },
  });
};

export const getPropertyByIdService = (id) => {
  return prisma.property.findUnique({
    where: { id },
    include: { units: true },
  });
};

export const updatePropertyService = (id, data) => {
  return prisma.property.update({
    where: { id },
    data,
  });
};

export const deletePropertyService = (id) => {
  return prisma.property.delete({
    where: { id },
  });
};
