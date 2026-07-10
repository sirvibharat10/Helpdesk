import { Router } from "express";
import { authMiddleware, adminMiddleware } from "../middleware.js";
import { DemoInquirySchema } from "../validators.js";
import { emailService } from "../services/emailService.js";
import { emailPollerService } from "../services/emailPollerService.js";

const router = Router();

// Get settings (admin only)
router.get("/", authMiddleware, adminMiddleware, async (req, res) => {
  const smtpConfigured = !!(process.env.SMTP_USER || process.env.GMAIL_USER) &&
    !!(process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD);
  const imapConfigured = !!(process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD);

  res.json({
    gemini_api_key: process.env.GEMINI_API_KEY ? "configured" : "Not set",
    gmail_user: process.env.GMAIL_USER || "Not set",
    support_email: process.env.SUPPORT_EMAIL || "Not set",
    smtp_host: process.env.SMTP_HOST || "smtp.gmail.com",
    smtp_port: process.env.SMTP_PORT || "587",
    smtp_configured: smtpConfigured,
    imap_host: process.env.IMAP_HOST || "imap.gmail.com",
    imap_port: process.env.IMAP_PORT || "993",
    imap_configured: imapConfigured,
    imap_poll_interval_ms: process.env.IMAP_POLL_INTERVAL_MS || "60000",
    database_url: process.env.DATABASE_URL ? "configured" : "Not set",
  });
});

// Manually trigger inbox poll (admin only)
router.post("/poll-email", authMiddleware, adminMiddleware, async (req, res, next) => {
  try {
    await emailPollerService.pollGmail();
    res.json({ message: "Inbox polled successfully" });
  } catch (error) {
    next(error);
  }
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

