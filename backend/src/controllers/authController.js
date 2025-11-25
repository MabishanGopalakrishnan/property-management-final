// import { registerService, loginService, getMeService } from "../services/authService.js";

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
  try {
    const { name, email, password, role, phone } = req.body;
    if (!name || !email || !password || !role)
      return res.status(400).json({ message: "Missing required fields" });

    const user = await registerService({ name, email, password, role, phone });
    res.status(201).json(user);
  } catch (err) {
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const result = await loginService(req.body);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const getMe = async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: { id: true, name: true, email: true, role: true }
  });
  res.json(user);
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

