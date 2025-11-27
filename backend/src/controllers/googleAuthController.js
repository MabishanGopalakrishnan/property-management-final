// backend/src/controllers/googleAuthController.js
import "dotenv/config";
import { OAuth2Client } from "google-auth-library";
import jwt from "jsonwebtoken";
import prismaClient from "../prisma/client.js";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const VALID_ROLES = ["TENANT", "LANDLORD"];

function normalizeRole(roleFromClient) {
  if (!roleFromClient) return "TENANT";
  const upper = String(roleFromClient).toUpperCase();
  return VALID_ROLES.includes(upper) ? upper : "TENANT";
}

function generateToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
}

export const googleLoginOrRegister = async (req, res) => {
  try {
    const { credential, role } = req.body;

    if (!credential) {
      return res.status(400).json({ message: "Missing Google credential" });
    }

    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const email = payload.email;
    const name = payload.name || payload.given_name || "Google User";

    if (!email) {
      return res.status(400).json({ message: "Google account has no email" });
    }

    let user = await prismaClient.user.findUnique({ where: { email } });

    // If user doesn't exist and no role was provided (login page), don't auto-register
    if (!user && !role) {
      return res.status(404).json({
        message: "No account found for this Google email. Please register first.",
      });
    }

    // If user doesn't exist and role is provided (register page), create them
    if (!user && role) {
      const finalRole = normalizeRole(role);
      user = await prismaClient.user.create({
        data: {
          email,
          name,
          role: finalRole,
          password:
            Math.random().toString(36).slice(-12) +
            Date.now().toString(36),
        },
      });
    }

    const token = generateToken(user);

    return res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("Google auth error:", err);
    return res.status(500).json({ message: "Google authentication failed" });
  }
};
