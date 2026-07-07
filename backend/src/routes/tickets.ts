import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { authMiddleware, AuthRequest } from "../middleware.js";
import {
  CreateTicketSchema,
  UpdateTicketSchema,
  CreateReplySchema,
} from "../validators.js";
import { aiService } from "../services/aiService.js";
import { emailService } from "../services/emailService.js";
import { z } from "zod";

const router = Router();
const prisma = new PrismaClient();

// Get all tickets (with filters)
router.get("/", authMiddleware, async (req: AuthRequest, res, next) => {
  try {
    const {
      status,
      category,
      search,
      dateFrom,
      dateTo,
      page = "1",
      limit = "20",
    } = req.query;

    const where: any = {};

    if (status) where.status = status;
    if (category) where.category = category;

    if (search) {
      where.OR = [
        { subject: { contains: search as string, mode: "insensitive" } },
        { body: { contains: search as string, mode: "insensitive" } },
        { fromEmail: { contains: search as string, mode: "insensitive" } },
      ];
    }

    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) where.createdAt.gte = new Date(dateFrom as string);
      if (dateTo) where.createdAt.lte = new Date(dateTo as string);
    }

    // If user is AGENT, only show assigned tickets
    if (req.user?.role === "AGENT") {
      where.assignedToId = req.user.id;
    }

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    const [tickets, total] = await Promise.all([
      prisma.ticket.findMany({
        where,
        include: { assignedTo: true, replies: true },
        skip,
        take: parseInt(limit as string),
        orderBy: { createdAt: "desc" },
      }),
      prisma.ticket.count({ where }),
    ]);

    res.json({
      tickets,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total,
      },
    });
  } catch (error) {
    next(error);
  }
});

// Create ticket
router.post("/", authMiddleware, async (req: AuthRequest, res, next) => {
  try {
    const data = CreateTicketSchema.parse(req.body);
    const ticket = await prisma.ticket.create({
      data: {
        subject: data.subject,
        body: data.body,
        fromEmail: data.fromEmail,
        fromName: data.fromName,
        category: data.category || "GENERAL_QUESTION",
      },
      include: { replies: true },
    });
    res.status(201).json(ticket);
  } catch (error) {
    next(error);
  }
});

// Get ticket by ID
router.get("/:id", authMiddleware, async (req: AuthRequest, res, next) => {
  try {
    const ticket = await prisma.ticket.findUnique({
      where: { id: req.params.id },
      include: { assignedTo: true, replies: { include: { author: true } } },
    });

    if (!ticket) {
      return res.status(404).json({ error: "Ticket not found" });
    }

    // Check access
    if (req.user?.role === "AGENT" && ticket.assignedToId !== req.user.id) {
      return res.status(403).json({ error: "Access denied" });
    }

    res.json(ticket);
  } catch (error) {
    next(error);
  }
});

// Update ticket
router.patch("/:id", authMiddleware, async (req: AuthRequest, res, next) => {
  try {
    const data = UpdateTicketSchema.parse(req.body);
    const ticket = await prisma.ticket.update({
      where: { id: req.params.id },
      data,
      include: { assignedTo: true, replies: true },
    });
    res.json(ticket);
  } catch (error) {
    next(error);
  }
});

// Delete ticket
router.delete("/:id", authMiddleware, async (req: AuthRequest, res, next) => {
  try {
    await prisma.ticket.delete({ where: { id: req.params.id } });
    res.json({ message: "Ticket deleted" });
  } catch (error) {
    next(error);
  }
});

// Add reply
router.post(
  "/:id/replies",
  authMiddleware,
  async (req: AuthRequest, res, next) => {
    try {
      const { body, sentViaEmail } = CreateReplySchema.parse(req.body);

      const ticket = await prisma.ticket.findUnique({
        where: { id: req.params.id },
      });
      if (!ticket) {
        return res.status(404).json({ error: "Ticket not found" });
      }

      const reply = await prisma.reply.create({
        data: {
          body,
          sentViaEmail: sentViaEmail || false,
          ticketId: req.params.id,
          authorId: req.user!.id,
        },
        include: { author: true },
      });

      // Send email if needed
      if (sentViaEmail) {
        await emailService.sendTicketReply(
          ticket.fromEmail,
          ticket.subject,
          body,
          ticket.id,
        );
      }

      res.status(201).json(reply);
    } catch (error) {
      next(error);
    }
  },
);

// Classify ticket
router.post(
  "/:id/classify",
  authMiddleware,
  async (req: AuthRequest, res, next) => {
    try {
      const ticket = await prisma.ticket.findUnique({
        where: { id: req.params.id },
      });
      if (!ticket) {
        return res.status(404).json({ error: "Ticket not found" });
      }

      const category = await aiService.classifyTicket(
        ticket.subject,
        ticket.body,
      );
      const updated = await prisma.ticket.update({
        where: { id: req.params.id },
        data: { category: category as any, aiClassified: true },
        include: { replies: true },
      });

      res.json(updated);
    } catch (error) {
      next(error);
    }
  },
);

// Summarize ticket
router.post(
  "/:id/summarize",
  authMiddleware,
  async (req: AuthRequest, res, next) => {
    try {
      const ticket = await prisma.ticket.findUnique({
        where: { id: req.params.id },
      });
      if (!ticket) {
        return res.status(404).json({ error: "Ticket not found" });
      }

      const summary = await aiService.summarizeTicket(
        ticket.subject,
        ticket.body,
      );
      const updated = await prisma.ticket.update({
        where: { id: req.params.id },
        data: { summary },
        include: { replies: true },
      });

      res.json(updated);
    } catch (error) {
      next(error);
    }
  },
);

// Suggest reply
router.post(
  "/:id/suggest-reply",
  authMiddleware,
  async (req: AuthRequest, res, next) => {
    try {
      const ticket = await prisma.ticket.findUnique({
        where: { id: req.params.id },
      });
      if (!ticket) {
        return res.status(404).json({ error: "Ticket not found" });
      }

      // Get all knowledge base articles
      const kbArticles = await prisma.knowledgeBase.findMany();
      const kbContext = kbArticles
        .map((kb) => `# ${kb.title}\n${kb.content}`)
        .join("\n\n");

      const suggestedReply = await aiService.suggestReply(
        ticket.subject,
        ticket.body,
        kbContext,
      );
      const updated = await prisma.ticket.update({
        where: { id: req.params.id },
        data: { suggestedReply },
        include: { replies: true },
      });

      res.json(updated);
    } catch (error) {
      next(error);
    }
  },
);

export default router;
