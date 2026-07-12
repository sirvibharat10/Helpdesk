import nodemailer from "nodemailer";

// Create Gmail SMTP transporter
function createTransporter() {
  const user = process.env.SMTP_USER || process.env.GMAIL_USER;
  const pass = process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD;

  if (!user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: parseInt(process.env.SMTP_PORT || "587"),
    secure: process.env.SMTP_SECURE === "true", // false = STARTTLS on port 587
    auth: { user, pass },
    tls: {
      rejectUnauthorized: false, // allow self-signed certs in dev
    },
    family: 4, // Force IPv4 to prevent Railway IPv6 connection timeouts
  } as any);
}

const fromName = process.env.SMTP_FROM_NAME || process.env.EMAIL_FROM_NAME || "My HelpDesk Support";
const fromEmail = process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER || process.env.GMAIL_USER || "admin@helpdesk.ai";
const fromAddress = `"${fromName}" <${fromEmail}>`;

export const emailService = {
  async sendTicketReply(
    toEmail: string,
    ticketSubject: string,
    replyBody: string,
    ticketId: string,
  ): Promise<boolean> {
    try {
      const transporter = createTransporter();
      if (!transporter) {
        console.log("SMTP not configured (SMTP_USER / SMTP_PASS missing) — skipping email");
        return true;
      }

      const htmlBody = replyBody.replace(/\n/g, "<br>");

      await transporter.sendMail({
        from: fromAddress,
        to: toEmail,
        subject: `Re: ${ticketSubject}`,
        text: replyBody,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: #f8f9fa; border-left: 4px solid #6366f1; padding: 16px 20px; margin-bottom: 20px;">
              <h2 style="margin: 0; color: #1e293b; font-size: 18px;">Response to your support ticket</h2>
            </div>
            <div style="padding: 0 4px; color: #334155; line-height: 1.7;">
              ${htmlBody}
            </div>
            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
            <p style="color: #94a3b8; font-size: 12px;">
              Ticket ID: <code>${ticketId}</code><br/>
              Reply to this email to add more information to your ticket.
            </p>
          </div>
        `,
      });

      console.log(`Reply email sent to ${toEmail} for ticket ${ticketId}`);
      return true;
    } catch (error) {
      console.error("Error sending reply email:", error);
      return false;
    }
  },

  async sendDemoInquiryNotification(inquiry: {
    name: string;
    email: string;
    contactNumber: string;
    organization: string;
    interestedIn: string;
  }): Promise<boolean> {
    try {
      const transporter = createTransporter();
      if (!transporter) {
        console.log("SMTP not configured — skipping demo inquiry email");
        return true;
      }

      const adminEmail =
        process.env.NOTIFICATION_EMAIL ||
        process.env.ADMIN_EMAIL ||
        fromEmail;

      await transporter.sendMail({
        from: fromAddress,
        to: adminEmail,
        subject: "New Demo Inquiry - My HelpDesk",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px;">
            <h2 style="color: #1e293b;">New Demo Inquiry Received</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <tr><td style="padding: 8px; font-weight: bold;">Name:</td><td style="padding: 8px;">${inquiry.name}</td></tr>
              <tr><td style="padding: 8px; font-weight: bold;">Email:</td><td style="padding: 8px;">${inquiry.email}</td></tr>
              <tr><td style="padding: 8px; font-weight: bold;">Contact:</td><td style="padding: 8px;">${inquiry.contactNumber}</td></tr>
              <tr><td style="padding: 8px; font-weight: bold;">Organization:</td><td style="padding: 8px;">${inquiry.organization}</td></tr>
              <tr><td style="padding: 8px; font-weight: bold;">Interested In:</td><td style="padding: 8px;">${inquiry.interestedIn}</td></tr>
            </table>
            <p style="color: #64748b;">Please follow up with this lead as soon as possible.</p>
          </div>
        `,
      });

      return true;
    } catch (error) {
      console.error("Error sending demo inquiry email:", error);
      return false;
    }
  },

  async sendWelcomeEmail(
    email: string,
    name: string,
    password: string,
  ): Promise<boolean> {
    try {
      const transporter = createTransporter();
      if (!transporter) {
        console.log("SMTP not configured — skipping welcome email");
        return true;
      }

      await transporter.sendMail({
        from: fromAddress,
        to: email,
        subject: "Welcome to My HelpDesk",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px;">
            <h2 style="color: #6366f1;">Welcome to My HelpDesk 🎉</h2>
            <p>Hi <strong>${name}</strong>,</p>
            <p>Your agent account has been created. Here are your login credentials:</p>
            <div style="background: #f8f9fa; border-radius: 8px; padding: 16px; margin: 16px 0;">
              <p style="margin: 4px 0;"><strong>Email:</strong> ${email}</p>
              <p style="margin: 4px 0;"><strong>Password:</strong> ${password}</p>
            </div>
            <p style="color: #ef4444;">Please log in and change your password immediately.</p>
          </div>
        `,
      });

      return true;
    } catch (error) {
      console.error("Error sending welcome email:", error);
      return false;
    }
  },

  async sendAutoReplyAcknowledgement(
    toEmail: string,
    fromName: string,
    ticketSubject: string,
    ticketId: string,
  ): Promise<boolean> {
    try {
      const transporter = createTransporter();
      if (!transporter) return true;

      const firstName = fromName.trim().split(/\s+/)[0];

      await transporter.sendMail({
        from: fromAddress,
        to: toEmail,
        subject: `Re: ${ticketSubject} [Ticket #${ticketId.slice(-8).toUpperCase()}]`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px;">
            <p>Hi ${firstName},</p>
            <p>Thank you for reaching out to us. We have received your message and created a support ticket.</p>
            <div style="background: #f0f4ff; border-radius: 8px; padding: 12px 16px; margin: 16px 0;">
              <strong>Ticket Subject:</strong> ${ticketSubject}<br/>
              <strong>Ticket ID:</strong> ${ticketId.slice(-8).toUpperCase()}
            </div>
            <p>Our team (or AI assistant) will respond shortly. You can reply to this email to add more details.</p>
            <p style="color: #64748b; font-size: 13px;">— My HelpDesk Support Team</p>
          </div>
        `,
      });

      return true;
    } catch (error) {
      console.error("Error sending acknowledgement email:", error);
      return false;
    }
  },
};
