import { z } from "zod";

// Inlined from core workspace package to avoid Railway npm registry resolution issue
const createUserSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(["ADMIN", "AGENT"], { required_error: "Role is required" }),
});

const incomingEmailSchema = z.object({
  fromEmail: z.string().email("Invalid sender email address"),
  fromName: z.string().optional(),
  subject: z.string().min(1, "Subject is required"),
  body: z.string().min(1, "Email body is required"),
});

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const CreateTicketSchema = z.object({
  subject: z.string().min(1),
  body: z.string().min(1),
  fromEmail: z.string().email(),
  fromName: z.string().min(1),
  category: z
    .enum(["GENERAL_QUESTION", "TECHNICAL_QUESTION", "REFUND_REQUEST"])
    .optional(),
});

export const UpdateTicketSchema = z.object({
  status: z
    .enum(["NEW", "OPEN", "PROCESSING", "RESOLVED", "CLOSED"])
    .optional(),
  category: z
    .enum(["GENERAL_QUESTION", "TECHNICAL_QUESTION", "REFUND_REQUEST"])
    .optional(),
  assignedToId: z.string().nullable().optional(),
});

export const CreateReplySchema = z.object({
  body: z.string().min(1),
  bodyHtml: z.string().optional(),
  sentViaEmail: z.boolean().optional(),
});

export const PolishReplySchema = z.object({
  replyBody: z.string().min(1),
});

export const CreateUserSchema = createUserSchema;

export const UpdateUserSchema = z.object({
  email: z.string().email().optional(),
  name: z.string().min(3).optional(),
  role: z.enum(["ADMIN", "AGENT"]).optional(),
  password: z.string().min(8).optional(),
});

export const DemoInquirySchema = z.object({
  name: z.string().min(1),
  contactNumber: z.string().min(1),
  email: z.string().email(),
  organization: z.string().min(1),
  interestedIn: z.enum([
    "FREE_DEMO",
    "MONTHLY_PLAN",
    "YEARLY_PLAN",
    "GENERAL_INQUIRY",
  ]),
});

export const IncomingEmailSchema = incomingEmailSchema;
