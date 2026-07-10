import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { authMiddleware, AuthRequest } from "../middleware.js";
import jwt from "jsonwebtoken";
import {
  CreateTicketSchema,
  UpdateTicketSchema,
  CreateReplySchema,
  IncomingEmailSchema,
  PolishReplySchema,
} from "../validators.js";
import { aiService } from "../services/aiService.js";
import { emailService } from "../services/emailService.js";
import { queueService } from "../services/queueService.js";
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
      sortBy = "createdAt",
      sortOrder = "desc",
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

    const allowedSortFields = ["subject", "fromEmail", "status", "category", "createdAt"];
    const resolvedSortBy = allowedSortFields.includes(sortBy as string) ? (sortBy as string) : "createdAt";
    const resolvedSortOrder = (sortOrder as string).toLowerCase() === "asc" ? "asc" : "desc";

    const [tickets, total] = await Promise.all([
      prisma.ticket.findMany({
        where,
        include: { assignedTo: true, replies: true },
        skip,
        take: parseInt(limit as string),
        orderBy: { [resolvedSortBy]: resolvedSortOrder },
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
    const aiAgent = await prisma.user.findFirst({ where: { name: "AI", role: "AGENT" } });

    const ticket = await prisma.ticket.create({
      data: {
        subject: data.subject,
        body: data.body,
        fromEmail: data.fromEmail,
        fromName: data.fromName,
        category: data.category || "GENERAL_QUESTION",
        assignedToId: aiAgent?.id || null,
      },
      include: { replies: true },
    });

    if (!data.category) {
      await queueService.enqueueClassification(ticket.id, ticket.subject, ticket.body);
    }

    res.status(201).json(ticket);
  } catch (error) {
    next(error);
  }
});

// Get dashboard stats
router.get("/stats", authMiddleware, async (req: AuthRequest, res, next) => {
  try {
    const where: any = {};
    if (req.user?.role === "AGENT") {
      where.assignedToId = req.user.id;
    }

    const [total, open, resolved, aiResolvedCount, resolvedTickets] = await Promise.all([
      prisma.ticket.count({ where }),
      prisma.ticket.count({
        where: {
          ...where,
          status: { in: ["NEW", "OPEN", "PROCESSING"] },
        },
      }),
      prisma.ticket.count({
        where: {
          ...where,
          status: "RESOLVED",
        },
      }),
      prisma.ticket.count({
        where: {
          ...where,
          aiResolved: true,
        },
      }),
      prisma.ticket.findMany({
        where: {
          ...where,
          status: "RESOLVED",
        },
        select: {
          createdAt: true,
          updatedAt: true,
        },
      }),
    ]);

    // Calculate percentage
    const aiResolvedPercentage = total > 0 ? parseFloat(((aiResolvedCount / total) * 100).toFixed(1)) : 0;

    // Calculate average resolution time
    let avgResolutionTimeText = "N/A";
    if (resolvedTickets.length > 0) {
      const totalMs = resolvedTickets.reduce((sum, t) => {
        return sum + (t.updatedAt.getTime() - t.createdAt.getTime());
      }, 0);
      const avgMs = totalMs / resolvedTickets.length;
      
      const avgMinutes = avgMs / (1000 * 60);
      if (avgMinutes < 60) {
        avgResolutionTimeText = `${Math.round(avgMinutes)}m`;
      } else {
        const avgHours = avgMinutes / 60;
        if (avgHours < 24) {
          avgResolutionTimeText = `${avgHours.toFixed(1)}h`;
        } else {
          const avgDays = avgHours / 24;
          avgResolutionTimeText = `${avgDays.toFixed(1)}d`;
        }
      }
    }

    res.json({
      total,
      open,
      resolved,
      aiResolvedCount,
      aiResolvedPercentage,
      avgResolutionTime: avgResolutionTimeText,
    });
  } catch (error) {
    next(error);
  }
});

// Get daily ticket counts for the past 30 days
router.get("/daily-stats", authMiddleware, async (req: AuthRequest, res, next) => {
  try {
    const now = new Date();
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29);
    thirtyDaysAgo.setHours(0, 0, 0, 0);

    const where: any = {
      createdAt: { gte: thirtyDaysAgo },
    };
    if (req.user?.role === "AGENT") {
      where.assignedToId = req.user.id;
    }

    const tickets = await prisma.ticket.findMany({
      where,
      select: { createdAt: true },
    });

    // Build a map of date → count
    const countMap: Record<string, number> = {};
    for (const ticket of tickets) {
      const dateKey = ticket.createdAt.toISOString().slice(0, 10); // "YYYY-MM-DD"
      countMap[dateKey] = (countMap[dateKey] ?? 0) + 1;
    }

    // Fill every day in the 30-day window, even those with 0 tickets
    const result: { date: string; count: number }[] = [];
    for (let i = 0; i < 30; i++) {
      const d = new Date(thirtyDaysAgo);
      d.setDate(d.getDate() + i);
      const dateKey = d.toISOString().slice(0, 10);
      result.push({ date: dateKey, count: countMap[dateKey] ?? 0 });
    }

    res.json(result);
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

    if (data.assignedToId !== undefined && data.assignedToId !== null) {
      const user = await prisma.user.findFirst({
        where: { id: data.assignedToId, deleted: false },
      });
      if (!user) {
        return res.status(400).json({ error: "Invalid assignedToId: User does not exist or is deleted." });
      }
    }

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
      const { body, bodyHtml, sentViaEmail } = CreateReplySchema.parse(req.body);

      const ticket = await prisma.ticket.findUnique({
        where: { id: req.params.id },
      });
      if (!ticket) {
        return res.status(404).json({ error: "Ticket not found" });
      }

      const reply = await prisma.reply.create({
        data: {
          body,
          bodyHtml: bodyHtml || null,
          sentViaEmail: sentViaEmail || false,
          ticketId: req.params.id,
          authorId: req.user!.id,
          senderType: "AGENT",
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
        include: {
          replies: {
            include: { author: true },
            orderBy: { createdAt: "asc" },
          },
        },
      });
      if (!ticket) {
        return res.status(404).json({ error: "Ticket not found" });
      }

      const conversationHistory = ticket.replies
        .map((r: any) => {
          const sender = r.senderType === "AI" ? "AI Bot" : r.author?.name || "Customer";
          return `[${sender}]: ${r.body}`;
        })
        .join("\n");

      const summary = await aiService.summarizeTicket(
        ticket.subject,
        ticket.body,
        conversationHistory,
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

// Webhook for incoming email (unauthenticated but optionally secured with a secret key)
router.post("/incoming-email", async (req, res, next) => {
  try {
    const webhookSecret = process.env.WEBHOOK_SECRET;
    if (webhookSecret) {
      const requestSecret = req.headers["x-webhook-secret"] || req.query.secret;
      if (requestSecret !== webhookSecret) {
        // Fallback: check if valid authenticated admin/agent session
        const authHeader = req.headers.authorization;
        let isAuthenticated = false;
        if (authHeader && authHeader.startsWith("Bearer ")) {
          const token = authHeader.split(" ")[1];
          try {
            jwt.verify(token, process.env.JWT_SECRET || "dev-secret-key-sahayak-2026");
            isAuthenticated = true;
          } catch (e) {
            // Invalid token
          }
        }
        if (!isAuthenticated) {
          return res.status(401).json({ error: "Unauthorized: Invalid webhook secret" });
        }
      }
    }

    const aiAgent = await prisma.user.findFirst({ where: { name: "AI", role: "AGENT" } });

    const data = IncomingEmailSchema.parse(req.body);

    const ticket = await prisma.ticket.create({
      data: {
        subject: data.subject,
        body: data.body,
        fromEmail: data.fromEmail,
        fromName: data.fromName || data.fromEmail.split("@")[0],
        source: "EMAIL",
        status: "NEW",
        category: "GENERAL_QUESTION",
        aiClassified: false,
        assignedToId: aiAgent?.id || null,
      },
      include: { replies: true },
    });

    await queueService.enqueueClassification(ticket.id, ticket.subject, ticket.body);

    res.status(201).json(ticket);
  } catch (error) {
    next(error);
  }
});

// Polish reply
router.post(
  "/:id/polish-reply",
  authMiddleware,
  async (req: AuthRequest, res, next) => {
    try {
      const ticket = await prisma.ticket.findUnique({
        where: { id: req.params.id },
      });
      if (!ticket) {
        return res.status(404).json({ error: "Ticket not found" });
      }

      const { replyBody } = PolishReplySchema.parse(req.body);

      const user = await prisma.user.findUnique({
        where: { id: req.user!.id },
      });
      const agentName = user?.name || "Support Agent";

      const customerFirstName = ticket.fromName
        ? ticket.fromName.trim().split(/\s+/)[0]
        : "";

      const polished = await aiService.polishReply(
        replyBody,
        ticket.subject,
        ticket.body,
        agentName,
        customerFirstName,
      );

      res.json({ polishedBody: polished });
    } catch (error) {
      next(error);
    }
  },
);

export default router;
