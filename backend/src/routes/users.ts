import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { authMiddleware, AuthRequest, adminMiddleware } from "../middleware.js";
import { CreateUserSchema, UpdateUserSchema } from "../validators.js";
import { authService } from "../services/authService.js";
import { emailService } from "../services/emailService.js";

const router = Router();
const prisma = new PrismaClient();

// Get all users (admin only)
router.get("/", authMiddleware, adminMiddleware, async (req: AuthRequest, res, next) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });
    res.json(users);
  } catch (error) {
    next(error);
  }
});

// Create user (admin only)
router.post("/", authMiddleware, adminMiddleware, async (req: AuthRequest, res, next) => {
  try {
    const { email, password, name, role } = CreateUserSchema.parse(req.body);

    const hashedPassword = await authService.hashPassword(password);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: role || "AGENT",
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });

    // Send welcome email
    await emailService.sendWelcomeEmail(email, name, password);

    res.status(201).json(user);
  } catch (error) {
    next(error);
  }
});

// Update user (admin only)
router.patch(
  "/:id",
  authMiddleware,
  adminMiddleware,
  async (req: AuthRequest, res, next) => {
    try {
      const updateData = UpdateUserSchema.parse(req.body);

      const data: any = { ...updateData };
      if (updateData.password) {
        data.password = await authService.hashPassword(updateData.password);
      }

      const user = await prisma.user.update({
        where: { id: req.params.id },
        data,
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          createdAt: true,
        },
      });

      res.json(user);
    } catch (error) {
      next(error);
    }
  },
);

// Delete user (admin only)
router.delete(
  "/:id",
  authMiddleware,
  adminMiddleware,
  async (req: AuthRequest, res, next) => {
    try {
      await prisma.user.delete({ where: { id: req.params.id } });
      res.json({ message: "User deleted" });
    } catch (error) {
      next(error);
    }
  },
);

export default router;
