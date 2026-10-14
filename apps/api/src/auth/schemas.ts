import { z } from "zod";

/** Student login body. `email` is the provisioned login id (not self-registered). */
export const loginBodySchema = z.object({
  email: z.string().trim().email().max(255),
  password: z.string().min(1).max(128),
});

/** Admin self-register (OTP verify required before login). */
export const adminRegisterBodySchema = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().email().max(255),
  password: z.string().min(8).max(128),
  department: z.string().trim().max(180).optional(),
});

export const verifyEmailBodySchema = z.object({
  email: z.string().trim().email().max(255),
  otp: z.string().regex(/^\d{6}$/),
});

export const forgotPasswordBodySchema = z.object({
  email: z.string().trim().email().max(255),
});

export const resetPasswordBodySchema = z.object({
  email: z.string().trim().email().max(255),
  otp: z.string().regex(/^\d{6}$/),
  newPassword: z.string().min(8).max(128),
});
