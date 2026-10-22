import { z } from "zod";

const id = z.string().trim().min(1).max(120);

export const notificationListQuerySchema = z.object({
  unread: z
    .enum(["true", "false"])
    .transform((v) => v === "true")
    .optional(),
});

export const createNotificationSchema = z.object({
  userId: id.optional(),
  classId: id.optional(),
  title: z.string().trim().min(1).max(200),
  message: z.string().trim().min(1).max(2000),
  detailedBody: z.string().trim().max(20000).optional(),
  type: z
    .enum(["reminder", "achievement", "announcement", "grade", "system"])
    .optional(),
  icon: z.string().trim().min(1).max(60).optional(),
  actionRoute: z.string().trim().max(500).nullish(),
  actionLabel: z.string().trim().max(100).nullish(),
});

export type NotificationListQuery = z.infer<typeof notificationListQuerySchema>;
export type CreateNotificationInput = z.infer<typeof createNotificationSchema>;
