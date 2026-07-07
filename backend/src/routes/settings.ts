import { Router } from "express";
import { authMiddleware, adminMiddleware } from "../middleware.js";
import { DemoInquirySchema } from "../validators.js";
import { emailService } from "../services/emailService.js";

const router = Router();

// Get settings (admin only)
router.get("/", authMiddleware, adminMiddleware, async (req, res) => {
  res.json({
    gemini_api_key: process.env.GEMINI_API_KEY ? "****" : "Not set",
    gmail_user: process.env.GMAIL_USER || "Not set",
    support_email: process.env.SUPPORT_EMAIL || "Not set",
    resend_api_key: process.env.RESEND_API_KEY ? "****" : "Not set",
    database_url: process.env.DATABASE_URL ? "****" : "Not set",
  });
});

// Send demo inquiry
router.post("/demo-inquiry", async (req, res, next) => {
  try {
    const inquiry = DemoInquirySchema.parse(req.body);
    const sent = await emailService.sendDemoInquiryNotification(inquiry as any);

    if (!sent) {
      return res.status(500).json({ error: "Failed to send inquiry" });
    }

    res.json({ message: "Demo inquiry sent successfully" });
  } catch (error) {
    next(error);
  }
});

export default router;
