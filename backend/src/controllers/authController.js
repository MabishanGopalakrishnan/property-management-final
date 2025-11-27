// backend/src/controllers/authController.js
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();  // 👈 initialize Prisma

import {
  registerService,
  loginService,
  getMeService,
} from "../services/authService.js";

// POST /api/auth/register
export const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const result = await registerService({ name, email, password, role });
    res.status(201).json({ message: "User created", ...result });
  } catch (err) {
    console.error("Registration error:", err);
    res.status(400).json({ error: err.message || "Registration failed." });
  }
};

// POST /api/auth/login
export const login = async (req, res) => {
  try {
    const result = await loginService(req.body);
    res.json(result);
  } catch (err) {
    console.error("Login error:", err);
    res.status(400).json({ error: err.message });
  }
};

// GET /api/auth/me
export const getMe = async (req, res) => {
  try {
    const user = await getMeService(req.user.id);
    res.json(user);
  } catch (err) {
    console.error("GetMe error:", err);
    res.status(400).json({ error: err.message });
  }
};

// ❗ ignoring google Login for now
