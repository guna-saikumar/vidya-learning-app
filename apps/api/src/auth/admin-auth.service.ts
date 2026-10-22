import {
  HttpException,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import bcrypt from "bcrypt";
import { ADMIN_ROLE_VALUES } from "../../../../packages/auth/src";
import { MailerService } from "../mailer/mailer.service";
import { PrismaService } from "../prisma/prisma.service";
import { signAccessToken } from "./jwt";
import { generateOtp, hashOtp, OTP_TTL_MS, verifyOtp } from "./otp.util";

type EmailOtpPurpose = "VERIFY_EMAIL" | "RESET_PASSWORD";

const normalizeEmail = (email: string) => email.trim().toLowerCase();

/** `ADMIN` and `SUPER_ADMIN` can both use the admin auth surface. */
const isAdminRole = (role: string) =>
  (ADMIN_ROLE_VALUES as readonly string[]).includes(role);

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
    // Public self-registration always creates a plain ADMIN; SUPER_ADMIN is
    // provisioned seed/admin-only.
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
    if (!user || !isAdminRole(user.role)) {
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

    // Role verification: ADMIN and SUPER_ADMIN only
    if (!isAdminRole(user.role)) {
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

    if (user && isAdminRole(user.role)) {
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
    if (!user || !isAdminRole(user.role)) {
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
    if (!user || !isAdminRole(user.role)) {
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
  async changePassword(
    userId: string,
    input: { currentPassword: string; newPassword: string }
  ) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || !isAdminRole(user.role)) {
      this.fail("Forbidden: Admin access required", 403);
    }
    const ok = await bcrypt.compare(input.currentPassword, user.passwordHash);
    if (!ok) {
      this.fail("Current password is incorrect", 400);
    }
    if (input.currentPassword === input.newPassword) {
      this.fail("New password must be different from the current password", 400);
    }
    const passwordHash = await bcrypt.hash(input.newPassword, 10);
    await this.prisma.user.update({
      where: { id: user.id },
      data: { passwordHash },
    });
    return { message: "Password changed successfully." };
  }

  async updateMe(
    userId: string,
    input: { name?: string; department?: string }
  ) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || !isAdminRole(user.role)) {
      this.fail("Forbidden: Admin access required", 403);
    }
    const updated = await this.prisma.user.update({
      where: { id: user.id },
      data: {
        ...(input.name === undefined ? {} : { name: input.name }),
        ...(input.department === undefined
          ? {}
          : { department: input.department || null }),
      },
    });
    return {
      id: updated.id,
      name: updated.name,
      email: updated.email,
      role: updated.role,
      department:
        updated.department || "Academic Director · AP SCERT Division",
      emailVerifiedAt: updated.emailVerifiedAt,
    };
  }

  /** Admin-provisioned student account (students cannot self-register). */
  async createStudent(input: {
    email: string;
    name: string;
    password: string;
    activeClassId?: string;
  }) {
    const email = normalizeEmail(input.email);
    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) {
      this.fail("Email already registered", 409);
    }
    if (input.activeClassId) {
      const cls = await this.prisma.schoolClass.findUnique({
        where: { id: input.activeClassId },
      });
      if (!cls) {
        throw new NotFoundException({ error: "Class not found" });
      }
    }

    const passwordHash = await bcrypt.hash(input.password, 10);
    const user = await this.prisma.user.create({
      data: {
        email,
        name: input.name.trim(),
        passwordHash,
        role: "STUDENT",
        // Provisioned by an admin, so the account is active immediately.
        emailVerifiedAt: new Date(),
        studentProfile: {
          create: { activeClassId: input.activeClassId ?? null },
        },
      },
      include: { studentProfile: true },
    });

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      activeClassId: user.studentProfile?.activeClassId ?? null,
      createdAt: user.createdAt.toISOString(),
    };
  }
}
