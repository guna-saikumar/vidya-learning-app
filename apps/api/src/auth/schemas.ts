import { z } from "zod";
import {
  adminForgotPasswordSchema,
  adminRegisterSchema,
  adminResetPasswordSchema,
  adminVerifyEmailSchema,
} from "../../../../packages/auth/src";

/**
 * Admin request-body schemas now live in `@vidya/auth` (shared with the
 * mobile/client packages) so runtime validation cannot drift from the
 * frozen `/api/admin/auth/*` contract. Re-exported here so existing API
 * imports keep working.
 */
export {
  adminForgotPasswordSchema,
  adminRegisterSchema,
  adminResetPasswordSchema,
  adminVerifyEmailSchema,
};

/** POST /api/admin/auth/login — same shape as the shared admin login body. */
export const adminLoginBodySchema = z.object({
  email: z.string().trim().toLowerCase().max(255).pipe(z.email()),
  password: z.string().min(1).max(128),
});

/** Student login body. `email` is the provisioned login id (not self-registered). */
export const loginBodySchema = z.object({
  email: z.string().trim().email().max(255),
  password: z.string().min(1).max(128),
});
