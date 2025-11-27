// backend/src/routes/authRoutes.js
import express from "express";
import { authRequired } from "../middleware/authMiddleware.js";
import { register, login, getMe } from "../controllers/authController.js";
import { googleLoginOrRegister } from "../controllers/googleAuthController.js";

const router = express.Router();

// Existing email/password routes (unchanged)
router.post("/register", register);
router.post("/login", login);
router.get("/me", authRequired, getMe);

// New: Google login/register
router.post("/google", googleLoginOrRegister);

export default router;
