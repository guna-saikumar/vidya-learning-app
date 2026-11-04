import { z } from "zod";

/** Student login body. `email` is the provisioned login id (not self-registered). */
export const loginBodySchema = z.object({
  email: z.string().trim().email().max(255),
  password: z.string().min(1).max(128),
});

/** Body shared by POST /auth/refresh and POST /auth/logout. */
export const refreshBodySchema = z.object({
  refreshToken: z.string().trim().min(1).max(512),
});

export type LoginBody = z.infer<typeof loginBodySchema>;
export type RefreshBody = z.infer<typeof refreshBodySchema>;
