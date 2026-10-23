import { z } from "zod";

export const notificationListQuerySchema = z.object({
  unread: z
    .enum(["true", "false"])
    .transform((v) => v === "true")
    .optional(),
});

export type NotificationListQuery = z.infer<typeof notificationListQuerySchema>;
