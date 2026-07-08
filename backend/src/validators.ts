import { z } from "zod";
import { createUserSchema } from "core";

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
  sentViaEmail: z.boolean().optional(),
});

export const CreateUserSchema = createUserSchema.extend({
  role: z.enum(["ADMIN", "AGENT"]).optional(),
});

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
