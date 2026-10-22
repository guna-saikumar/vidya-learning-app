import type {
  AdminAuthResponse,
  AdminForgotPasswordInput,
  AdminLoginInput,
  AdminRegisterInput,
  AdminResetPasswordInput,
  AdminUser,
  AdminVerifyEmailInput,
  MessageResponse,
} from "@vidya/auth";
import { ApiClient } from "../client";

/**
 * Admin auth client — register / OTP verify / login / forgot / reset / me
 * under `/api/admin/auth/*` (separate from student login-only `/api/auth/*`).
 */
export class AdminAuthApi {
  constructor(private readonly client: ApiClient) {}

  login(body: AdminLoginInput) {
    return this.client
      .post<AdminAuthResponse>("/api/admin/auth/login", body)
      .then((result) => {
        if (result.accessToken) {
          this.client.setAccessToken(result.accessToken);
        }
        return result;
      });
  }

  register(body: AdminRegisterInput) {
    return this.client.post<MessageResponse>("/api/admin/auth/register", body);
  }

  verifyEmail(body: AdminVerifyEmailInput) {
    return this.client.post<MessageResponse>(
      "/api/admin/auth/verify-email",
      body
    );
  }

  forgotPassword(body: AdminForgotPasswordInput) {
    return this.client.post<MessageResponse>(
      "/api/admin/auth/forgot-password",
      body
    );
  }

  resetPassword(body: AdminResetPasswordInput) {
    return this.client.post<MessageResponse>(
      "/api/admin/auth/reset-password",
      body
    );
  }

  me() {
    return this.client.get<AdminUser>("/api/admin/auth/me");
  }

  changePassword(body: { currentPassword: string; newPassword: string }) {
    return this.client.post("/api/admin/auth/change-password", body);
  }

  patchMe(body: { name?: string; department?: string }) {
    return this.client.patch("/api/admin/auth/me", body);
  }
}

/** Admin student provisioning under `/api/admin/students`. */
export class AdminStudentsApi {
  constructor(private readonly client: ApiClient) {}

  create(body: {
    email: string;
    name: string;
    password: string;
    activeClassId?: string;
  }) {
    return this.client.post("/api/admin/students", body);
  }
}
