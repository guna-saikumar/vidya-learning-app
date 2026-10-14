import { HttpException, Inject, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import bcrypt from "bcrypt";
import { PrismaService } from "../prisma/prisma.service";
import { signAccessToken } from "./jwt";

const normalizeEmail = (email: string) => email.trim().toLowerCase();

/**
 * Student auth service — login only.
 *
 * Registration / email OTP / forgot-password OTP are intentionally NOT
 * implemented for students. Accounts will be created/reset by admin flows later.
 */
@Injectable()
export class AuthService {
  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(ConfigService) private readonly config: ConfigService
  ) {}

  private fail(message: string, statusCode: number): never {
    throw new HttpException({ error: message }, statusCode);
  }

  async login(input: { email: string; password: string }) {
    const email = normalizeEmail(input.email);
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user || user.role !== "STUDENT") {
      // Same message for missing/non-student — avoid account enumeration.
      this.fail("Invalid email or password", 401);
    }

    const passwordOk = await bcrypt.compare(input.password, user.passwordHash);
    if (!passwordOk) {
      this.fail("Invalid email or password", 401);
    }

    // Provisioned accounts should already be marked verified by admin/seed.
    if (!user.emailVerifiedAt) {
      this.fail("Account not active. Contact your admin.", 403);
    }

    const accessToken = signAccessToken(
      {
        sub: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
      },
      this.config
    );

    return {
      accessToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }

  async me(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.role !== "STUDENT") {
      this.fail("Unauthorized", 401);
    }
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      emailVerifiedAt: user.emailVerifiedAt,
    };
  }
}
