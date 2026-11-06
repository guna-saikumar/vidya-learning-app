import { z } from "zod";

export const CATEGORIES = [
  "technical_issue",
  "textbook_access",
  "recorded_classes",
  "attendance",
  "login_account",
  "content_issue",
  "billing_fees",
  "feedback",
  "other",
] as const;
export type ComplaintCategory = (typeof CATEGORIES)[number];

export const COMPLAINT_STATUSES = [
  "open",
  "in_progress",
  "resolved",
  "closed",
  "escalated",
] as const;
export type ComplaintStatus = (typeof COMPLAINT_STATUSES)[number];

export const createComplaintSchema = z
  .object({
    full_name: z.string().trim().min(2, "Full name must have at least 2 characters").max(120),
    class_grade: z.coerce.number().int().min(6, "Class must be between 6 and 10").max(10, "Class must be between 6 and 10"),
    section: z.string().trim().max(10).optional().or(z.literal("")),
    roll_number: z.string().trim().max(30).optional().or(z.literal("")),
    email: z.string().trim().email("Invalid email format").max(160).optional().or(z.literal("")),
    phone: z
      .string()
      .trim()
      .regex(/^[+]?[0-9\s()-]{7,20}$/, "Enter a valid phone number")
      .optional()
      .or(z.literal("")),
    category: z.enum(CATEGORIES, { message: "Choose a valid category" }),
    subject: z.string().trim().min(4, "Subject must have at least 4 characters").max(200),
    message: z.string().trim().min(10, "Message must have at least 10 characters").max(5000),
    source: z.enum(["web", "mobile"]).optional().default("mobile"),
  })
  .refine((d) => Boolean(d.email || d.phone || d.roll_number), {
    message: "Provide at least one contact detail: email, phone, or roll number",
    path: ["email"],
  });

export type CreateComplaintInput = z.infer<typeof createComplaintSchema>;

export const updateComplaintStatusSchema = z.object({
  status: z.enum(COMPLAINT_STATUSES),
});
export type UpdateComplaintStatusInput = z.infer<typeof updateComplaintStatusSchema>;
