import { HttpException, Inject, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import {
  STATIC_ADMIN,
  STATIC_ADMIN_EMAIL_ALIASES,
} from "../modules/admin/static/fixtures";
import { signAccessToken, type JwtPayload } from "./jwt";

const normalizeEmail = (email: string) => email.trim().toLowerCase();

const STATIC_SUPER_ADMIN = {
  id: "super-static-1",
  email: "superadmin@vidya.edu.in",
  name: "Super Admin",
  role: "SUPER_ADMIN" as const,
  department: "Platform",
  emailVerifiedAt: new Date("2026-09-01T08:00:00.000Z"),
};

/**
 * Static admin auth — demo login + me only. No DB, no OTP, no mutations.
 */
@Injectable()
export class AdminAuthService {
  constructor(@Inject(ConfigService) private readonly config: ConfigService) {}

  private fail(message: string, statusCode: number): never {
    throw new HttpException({ error: message }, statusCode);
  }

  private isStaticAdminEmail(email: string): boolean {
    return (STATIC_ADMIN_EMAIL_ALIASES as readonly string[]).includes(email);
  }

  async login(input: { email: string; password: string }) {
    const email = normalizeEmail(input.email);
    if (
      !this.isStaticAdminEmail(email) ||
      input.password !== STATIC_ADMIN.password
    ) {
      this.fail("Invalid email or password", 401);
    }

    const accessToken = signAccessToken(
      {
        sub: STATIC_ADMIN.id,
        email: STATIC_ADMIN.email,
        role: STATIC_ADMIN.role,
        name: STATIC_ADMIN.name,
      },
      this.config
    );

    return {
      accessToken,
      user: {
        id: STATIC_ADMIN.id,
        name: STATIC_ADMIN.name,
        email: STATIC_ADMIN.email,
        role: STATIC_ADMIN.role,
        department: STATIC_ADMIN.department,
      },
    };
  }

  /** Profile from JWT — static fixture, no DB. */
  async me(user: JwtPayload) {
    if (user.role === "SUPER_ADMIN") {
      return {
        id: user.sub,
        name: user.name || STATIC_SUPER_ADMIN.name,
        email: user.email || STATIC_SUPER_ADMIN.email,
        role: "SUPER_ADMIN" as const,
        department: STATIC_SUPER_ADMIN.department,
        emailVerifiedAt: STATIC_SUPER_ADMIN.emailVerifiedAt,
      };
    }
    return {
      id: user.sub,
      name: user.name || STATIC_ADMIN.name,
      email: user.email || STATIC_ADMIN.email,
      role: "ADMIN" as const,
      department: STATIC_ADMIN.department,
      emailVerifiedAt: new Date(STATIC_ADMIN.emailVerifiedAt),
    };
  }
}
