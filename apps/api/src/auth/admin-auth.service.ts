import { HttpException, Inject, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import bcrypt from "bcrypt";
import { MailerService } from "../mailer/mailer.service";
import { PrismaService } from "../prisma/prisma.service";
import { signAccessToken } from "./jwt";
import { generateOtp, hashOtp, OTP_TTL_MS, verifyOtp } from "./otp.util";

type EmailOtpPurpose = "VERIFY_EMAIL" | "RESET_PASSWORD";

const normalizeEmail = (email: string) => email.trim().toLowerCase();

const clearOtp = {
  emailOtpHash: null,
  emailOtpExpiresAt: null,
  emailOtpPurpose: null,
} as const;

@Injectable()
export class AdminAuthService {
  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(MailerService) private readonly mailer: MailerService,
    @Inject(ConfigService) private readonly config: ConfigService
  ) {}

  private fail(message: string, statusCode: number): never {
    throw new HttpException({ error: message }, statusCode);
  }

  private async issueOtp(
    userId: string,
    email: string,
    purpose: EmailOtpPurpose
  ): Promise<void> {
    const otp = generateOtp();
    const emailOtpHash = await hashOtp(otp);
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        emailOtpHash,
        emailOtpExpiresAt: new Date(Date.now() + OTP_TTL_MS),
        emailOtpPurpose: purpose,
      },
    });
    await this.mailer.sendOtpEmail({ to: email, otp, purpose });
  }

  async register(input: {
    name: string;
    email: string;
    password: string;
    department?: string;
  }) {
    const email = normalizeEmail(input.email);
    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) {
      this.fail("Email already registered", 409);
    }

    const passwordHash = await bcrypt.hash(input.password, 10);
    const user = await this.prisma.user.create({
      data: {
        name: input.name.trim(),
        email,
        passwordHash,
        role: "ADMIN",
        department: input.department?.trim() || "Academic Director · AP SCERT Division",
      },
    });

    await this.issueOtp(user.id, email, "VERIFY_EMAIL");
    return { message: "Registered as admin. Check your email for a verification code." };
  }

  async verifyEmail(input: { email: string; otp: string }) {
    const email = normalizeEmail(input.email);
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user || user.role !== "ADMIN") {
      this.fail("Invalid verification code", 400);
    }
    if (user.emailVerifiedAt) {
      return { message: "Email already verified." };
    }
    if (
      user.emailOtpPurpose !== "VERIFY_EMAIL" ||
      !user.emailOtpExpiresAt ||
      user.emailOtpExpiresAt.getTime() < Date.now()
    ) {
      this.fail("Verification code expired", 400);
    }
    const ok = await verifyOtp(input.otp, user.emailOtpHash);
    if (!ok) {
      this.fail("Invalid verification code", 400);
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerifiedAt: new Date(),
        ...clearOtp,
      },
    });

    return { message: "Admin email verified. You can log in now." };
  }

  async login(input: { email: string; password: string }) {
    const email = normalizeEmail(input.email);
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      this.fail("Invalid email or password", 401);
    }

    const passwordOk = await bcrypt.compare(input.password, user.passwordHash);
    if (!passwordOk) {
      this.fail("Invalid email or password", 401);
    }

    // Role verification: strictly require ADMIN
    if (user.role !== "ADMIN") {
      this.fail("Forbidden: Admin access required", 403);
    }

    if (!user.emailVerifiedAt) {
      this.fail("Email not verified", 403);
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
        department: user.department || "Academic Director · AP SCERT Division",
      },
    };
  }

  async forgotPassword(input: { email: string }) {
    const email = normalizeEmail(input.email);
    const user = await this.prisma.user.findUnique({ where: { email } });
    const message =
      "If that email is registered as an admin, a reset code has been sent.";

    if (user && user.role === "ADMIN") {
      await this.issueOtp(user.id, email, "RESET_PASSWORD");
    }

    return { message };
  }

  async resetPassword(input: {
    email: string;
    otp: string;
    newPassword: string;
  }) {
    const email = normalizeEmail(input.email);
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user || user.role !== "ADMIN") {
      this.fail("Invalid or expired reset code", 400);
    }
    if (
      user.emailOtpPurpose !== "RESET_PASSWORD" ||
      !user.emailOtpExpiresAt ||
      user.emailOtpExpiresAt.getTime() < Date.now()
    ) {
      this.fail("Invalid or expired reset code", 400);
    }
    const ok = await verifyOtp(input.otp, user.emailOtpHash);
    if (!ok) {
      this.fail("Invalid or expired reset code", 400);
    }

    const passwordHash = await bcrypt.hash(input.newPassword, 10);
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        ...clearOtp,
      },
    });

    return { message: "Password updated successfully. You can log in now." };
  }

  async me(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.role !== "ADMIN") {
      this.fail("Forbidden: Admin access required", 403);
    }
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department || "Academic Director · AP SCERT Division",
      emailVerifiedAt: user.emailVerifiedAt,
    };
  }
}
