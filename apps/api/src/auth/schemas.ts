import { z } from "zod";

/** Student login body. `email` is the provisioned login id (not self-registered). */
export const loginBodySchema = z.object({
  email: z.string().trim().email().max(255),
  password: z.string().min(1).max(128),
});
