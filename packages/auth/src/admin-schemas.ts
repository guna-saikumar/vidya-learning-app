import { z } from "zod";

/**
 * Shared Zod schemas for the frozen admin auth contract.
 *
 * These must stay in sync with the API implementation in
 * `apps/api/src/auth/schemas.ts` and the routes under `/api/admin/auth/*`:
 *
 *   POST /api/admin/auth/register
 *   POST /api/admin/auth/verify-email
 *   POST /api/admin/auth/login
 *   POST /api/admin/auth/forgot-password
 *   POST /api/admin/auth/reset-password
 *   GET  /api/admin/auth/me
 */

/** All roles the auth API can issue today (mirrors the DB `UserRole` enum). */
export const USER_ROLE_VALUES = ["STUDENT", "ADMIN", "SUPER_ADMIN"] as const;

/** Roles allowed to use the admin auth surface. */
export const ADMIN_ROLE_VALUES = ["ADMIN", "SUPER_ADMIN"] as const;

export const userRoleSchema = z.enum(USER_ROLE_VALUES);
export const adminRoleSchema = z.enum(ADMIN_ROLE_VALUES);

export const adminEmailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .max(255)
  .pipe(z.email());

/** 6-digit numeric OTP sent by email (verify-email / reset-password). */
export const otpSchema = z.string().trim().regex(/^\d{6}$/);

export const authPasswordSchema = z.string().min(8).max(128);

/** POST /api/admin/auth/register */
export const adminRegisterSchema = z.object({
  name: z.string().trim().min(1).max(120),
  email: adminEmailSchema,
  password: authPasswordSchema,
  department: z.string().trim().max(180).optional(),
});

/** POST /api/admin/auth/verify-email */
export const adminVerifyEmailSchema = z.object({
  email: adminEmailSchema,
  otp: otpSchema,
});

/** POST /api/admin/auth/login */
export const adminLoginSchema = z.object({
  email: adminEmailSchema,
  password: z.string().min(1).max(128),
});

/** POST /api/admin/auth/forgot-password */
export const adminForgotPasswordSchema = z.object({
  email: adminEmailSchema,
});

/** POST /api/admin/auth/reset-password */
export const adminResetPasswordSchema = z.object({
  email: adminEmailSchema,
  otp: otpSchema,
  newPassword: authPasswordSchema,
});

export type UserRole = (typeof USER_ROLE_VALUES)[number];
export type AdminRole = (typeof ADMIN_ROLE_VALUES)[number];

/** Admin profile from GET /api/admin/auth/me */
export const adminUserSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  email: adminEmailSchema,
  role: adminRoleSchema,
  department: z.string().nullable().optional(),
  emailVerifiedAt: z.string().nullable().optional(),
});

/** POST /api/admin/auth/login response */
export const adminAuthResponseSchema = z.object({
  accessToken: z.string().min(1),
  user: adminUserSchema,
});

/** Plain `{ message }` responses (register / verify-email / forgot / reset). */
export const messageResponseSchema = z.object({
  message: z.string(),
});
