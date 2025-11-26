// backend/src/controllers/authController.js
import {
  registerService,
  loginService,
  getMeService,
} from "../services/authService.js";

<<<<<<< HEAD
// POST /api/auth/register
export const register = async (req, res) => {
=======
// export const register = async (req, res) => {
//   try {
//     const user = await registerService(req.body);
//     res.json(user);
//   } catch (err) {
//     res.status(400).json({ error: err.message });
//   }s
// };

// export const login = async (req, res) => {
//   try {
//     const result = await loginService(req.body);
//     res.json(result);
//   } catch (err) {
//     res.status(400).json({ error: err.message });
//   }
// };

// export const getMe = async (req, res) => {
//   try {
//     const user = await getMeService(req.user.id);
//     res.json(user);
//   } catch (err) {
//     res.status(400).json({ error: err.message });
//   }
// };


import { registerService, loginService } from "../services/authService.js";
import prisma from "../prisma/client.js";
import { googleLoginService } from "../services/googleAuthService.js";


export const register = async (req, res, next) => {
>>>>>>> 1b23df24c03b6decf4a406c79c06e32b2dcd0df2
  try {
    const user = await registerService(req.body);
    res.json(user);
  } catch (err) {
    console.error("Register error:", err);
    res.status(400).json({ error: err.message });
  }
};

// POST /api/auth/login
export const login = async (req, res) => {
  try {
    const result = await loginService(req.body);
    // result = { token, user }
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

export const googleLogin = async (req, res, next) => {
  try {
    const { idToken, role } = req.body;

    if (!idToken || !role) {
      return res.status(400).json({ message: "idToken and role required" });
    }

    const result = await googleLoginService({ idToken, role });
    res.json(result);
  } catch (err) {
    next(err);
  }
};

