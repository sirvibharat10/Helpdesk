import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { authMiddleware, AuthRequest, adminMiddleware } from "../middleware.js";
import { authService } from "../services/authService.js";
import { LoginSchema } from "../validators.js";

const router = Router();
const prisma = new PrismaClient();

// Login
router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = LoginSchema.parse(req.body);
    const result = await authService.login(email, password);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// Get current user
router.get("/me", authMiddleware, async (req: AuthRequest, res, next) => {
  try {
    const user = await authService.getCurrentUser(req.user!.id);
    res.json(user);
  } catch (error) {
    next(error);
  }
});

export default router;
