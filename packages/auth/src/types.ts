import { type AdminRole, type UserRole } from "./admin-schemas";

export type { AdminRole, UserRole };

/** Authenticated user from GET /api/auth/me (student). */
export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  emailVerifiedAt: string | null;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: UserRole;
  };
}

export interface ErrorResponse {
  error: string;
}

/** Admin profile from GET /api/admin/auth/me */
export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  department?: string | null;
  emailVerifiedAt?: string | null;
}

export interface AdminLoginInput {
  email: string;
  password: string;
}

export interface AdminRegisterInput {
  name: string;
  email: string;
  password: string;
  department?: string;
}

export interface AdminVerifyEmailInput {
  email: string;
  otp: string;
}

export interface AdminForgotPasswordInput {
  email: string;
}

export interface AdminResetPasswordInput {
  email: string;
  otp: string;
  newPassword: string;
}

export interface AdminAuthResponse {
  accessToken: string;
  user: AdminUser;
}

export interface MessageResponse {
  message: string;
}
