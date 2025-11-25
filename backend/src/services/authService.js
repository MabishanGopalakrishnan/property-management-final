// import prisma from "../prisma/client.js";
// import bcrypt from "bcryptjs";
// import jwt from "jsonwebtoken";

// export const registerService = async ({ email, password, role, phone }) => {
//   // Check if user exists
//   const existing = await prisma.user.findUnique({ where: { email } });
//   if (existing) throw new Error("User already exists");

//   // Hash password
//   const hashed = await bcrypt.hash(password, 10);

//   // Create user
//   const user = await prisma.user.create({
//     data: {
//       email,
//       password: hashed,
//       role
//     }
//   });

//   // If tenant, create tenant profile
//   if (role === "TENANT") {
//     await prisma.tenant.create({
//       data: {
//         phone: phone || "",
//         userId: user.id
//       }
//     });
//   }

//   return user;
// };

// export const loginService = async ({ email, password }) => {
//   const user = await prisma.user.findUnique({ where: { email } });
//   if (!user) throw new Error("Invalid email or password");

//   const match = await bcrypt.compare(password, user.password);
//   if (!match) throw new Error("Invalid email or password");

//   // Create JWT
//   const token = jwt.sign(
//     {
//       id: user.id,
//       role: user.role
//     },
//     process.env.JWT_SECRET,
//     { expiresIn: "7d" }
//   );

//   return { token, user };
// };

// export const getMeService = async (userId) => {
//   return prisma.user.findUnique({
//     where: { id: userId },
//     include: {
//       tenant: true,
//       properties: true
//     }
//   });
// };


import prisma from "../prisma/client.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const registerService = async ({ name, email, password, role, phone }) => {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw new Error("User already exists");

  const hashed = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: { name, email, password: hashed, role }
  });

  if (role === "TENANT") {
    await prisma.tenant.create({
      data: { userId: user.id, phone: phone || null }
    });
  }

  return { id: user.id, email: user.email, role: user.role };
};

export const loginService = async ({ email, password }) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error("Invalid email or password");

  const match = await bcrypt.compare(password, user.password);
  if (!match) throw new Error("Invalid email or password");

  const token = jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  return {
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
    token
  };
};
