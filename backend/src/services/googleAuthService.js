import { OAuth2Client } from "google-auth-library";
import prisma from "../prisma/client.js";
import jwt from "jsonwebtoken";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const googleLoginService = async ({ idToken, role }) => {
  // 1) Verify Google ID token
  const ticket = await client.verifyIdToken({
    idToken,
    audience: process.env.GOOGLE_CLIENT_ID,
  });
  const payload = ticket.getPayload();
  const email = payload.email;
  const name = payload.name || "Google User";

  if (!email) throw new Error("Google token missing email");

  // 2) Find or create user
  let user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    // first time google login → create user
    user = await prisma.user.create({
      data: {
        name,
        email,
        password: "GOOGLE_AUTH", // dummy, not used
        role, // LANDLORD or TENANT
      },
    });

    if (role === "TENANT") {
      await prisma.tenant.create({ data: { userId: user.id } });
    }
  }

  // 3) Issue your own JWT for app auth
  const appToken = jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  return {
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
    token: appToken,
  };
};
