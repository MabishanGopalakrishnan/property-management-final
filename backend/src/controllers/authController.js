// backend/src/controllers/authController.js
import {
  registerService,
  loginService,
  getMeService,
} from "../services/authService.js";

// POST /api/auth/register
export const register = async (req, res) => {
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
