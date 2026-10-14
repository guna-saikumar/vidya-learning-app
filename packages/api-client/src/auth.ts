import { AuthUser, LoginRequest, LoginResponse } from "@vidya/auth";
import { ApiClient } from "./client";

/**
 * Student auth client — login + /me only.
 * No register / OTP / forgot-password (accounts are provisioned; resets via admin).
 */
export class AuthApi {
  constructor(private readonly client: ApiClient) {}

  login(body: LoginRequest) {
    return this.client.post<LoginResponse>("/api/auth/login", body);
  }

  me() {
    return this.client.get<AuthUser>("/api/auth/me");
  }
}
