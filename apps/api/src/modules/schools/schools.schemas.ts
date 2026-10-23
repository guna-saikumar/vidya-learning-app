import { z } from "zod";

export const schoolListQuerySchema = z.object({
  q: z.string().trim().max(120).optional(),
  district: z.string().trim().max(120).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type SchoolListQuery = z.infer<typeof schoolListQuerySchema>;
