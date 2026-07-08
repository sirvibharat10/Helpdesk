import { z } from "zod";

export const createUserSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(["ADMIN", "AGENT"], { required_error: "Role is required" }),
});

export const incomingEmailSchema = z.object({
  fromEmail: z.string().email("Invalid sender email address"),
  fromName: z.string().optional(),
  subject: z.string().min(1, "Subject is required"),
  body: z.string().min(1, "Email body is required"),
});
