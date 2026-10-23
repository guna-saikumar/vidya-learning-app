import type {
  LoginRequest,
  LoginResponse,
  LogoutResponse,
  MeResponse,
  RefreshResponse,
} from "@vidya/auth";
import { ApiClient } from "../client";

/**
 * Student auth client (`/api/v1/auth`).
 * No register / OTP / forgot-password: accounts are provisioned by the school.
 */
export class AuthApi {
  constructor(private readonly client: ApiClient) {}

  login(body: LoginRequest) {
    return this.client.post<LoginResponse>("/api/v1/auth/login", body);
  }

  refresh(refreshToken: string) {
    return this.client.post<RefreshResponse>("/api/v1/auth/refresh", {
      refreshToken,
    });
  }

  logout(refreshToken: string) {
    return this.client.post<LogoutResponse>("/api/v1/auth/logout", {
      refreshToken,
    });
  }

  me() {
    return this.client.get<MeResponse>("/api/v1/auth/me");
  }
}
