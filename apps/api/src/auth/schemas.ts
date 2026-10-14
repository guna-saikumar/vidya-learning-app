import { z } from "zod";

export const registerBodySchema = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().email().max(255),
  password: z.string().min(8).max(128),
});

export const verifyEmailBodySchema = z.object({
  email: z.string().trim().email().max(255),
  otp: z.string().regex(/^\d{6}$/),
});

export const loginBodySchema = z.object({
  email: z.string().trim().email().max(255),
  password: z.string().min(1).max(128),
});

export const forgotPasswordBodySchema = z.object({
  email: z.string().trim().email().max(255),
});

export const resetPasswordBodySchema = z.object({
  email: z.string().trim().email().max(255),
  otp: z.string().regex(/^\d{6}$/),
  newPassword: z.string().min(8).max(128),
});
