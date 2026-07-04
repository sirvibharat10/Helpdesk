import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

export const emailService = {
  async sendTicketReply(
    toEmail: string,
    ticketSubject: string,
    replyBody: string,
    ticketId: string,
  ): Promise<boolean> {
    try {
      if (!resend) {
        console.log("Resend API key not configured, skipping email");
        return true;
      }

      const result = await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL || "noreply@sahayak.ai",
        to: toEmail,
        subject: `Re: ${ticketSubject}`,
        html: `
          <h2>Response to your ticket</h2>
          <p>${replyBody}</p>
          <hr />
          <p>Ticket ID: ${ticketId}</p>
          <p>Please reply to this email to add more information to your ticket.</p>
        `,
      });

      return !!result.id;
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
      if (!resend) {
        console.log("Resend API key not configured, skipping email");
        return true;
      }

      const adminEmail =
        process.env.NOTIFICATION_EMAIL ||
        process.env.ADMIN_EMAIL ||
        "admin@sahayak.ai";

      const result = await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL || "noreply@sahayak.ai",
        to: adminEmail,
        subject: "New Demo Inquiry - SahaYak AI",
        html: `
          <h2>New Demo Inquiry Received</h2>
          <p><strong>Name:</strong> ${inquiry.name}</p>
          <p><strong>Email:</strong> ${inquiry.email}</p>
          <p><strong>Contact Number:</strong> ${inquiry.contactNumber}</p>
          <p><strong>Organization:</strong> ${inquiry.organization}</p>
          <p><strong>Interested In:</strong> ${inquiry.interestedIn}</p>
          <hr />
          <p>Please follow up with this lead as soon as possible.</p>
        `,
      });

      return !!result;
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
      if (!resend) {
        console.log("Resend API key not configured, skipping email");
        return true;
      }
      const result = await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL || "noreply@sahayak.ai",
        to: email,
        subject: "Welcome to SahaYak AI",
        html: `
          <h2>Welcome to SahaYak AI</h2>
          <p>Hi ${name},</p>
          <p>Your account has been created. Here are your login credentials:</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Password:</strong> ${password}</p>
          <p>Please log in and change your password immediately.</p>
        `,
      });

      return !!result;
    } catch (error) {
      console.error("Error sending welcome email:", error);
      return false;
    }
  },
};
