import { HttpException, Inject, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import bcrypt from "bcrypt";
import { createHash, randomBytes } from "node:crypto";
import { newId } from "../common/ids";
import { DbService, SQL_NOW_UTC } from "../db/db.service";
import { refreshTokenTtlMs, signAccessToken } from "./jwt";

const normalizeEmail = (email: string) => email.trim().toLowerCase();

/** sha256 hex digest — refresh tokens are only ever stored hashed. */
export const hashRefreshToken = (token: string): string =>
  createHash("sha256").update(token).digest("hex");

const generateRefreshToken = (): string => randomBytes(48).toString("base64url");

type UserRow = {
  id: string;
  email: string;
  role: string;
  passwordHash: string;
  emailVerifiedAt: Date | null;
};

const USER_COLUMNS = `"id", "email", "role", "passwordHash", "emailVerifiedAt"`;

/**
 * Student auth service — login, refresh (rotating), logout, session (`me`).
 *
 * Registration / OTP / forgot-password are intentionally NOT implemented:
 * accounts are provisioned by the school.
 */
@Injectable()
export class AuthService {
  constructor(
    @Inject(DbService) private readonly db: DbService,
    @Inject(ConfigService) private readonly config: ConfigService
  ) {}

  private fail(message: string, statusCode: number): never {
    throw new HttpException({ error: message }, statusCode);
  }

  private issueAccessToken(user: { id: string; email: string }): string {
    return signAccessToken(
      { sub: user.id, email: user.email, role: "STUDENT" },
      this.config
    );
  }

  /** Create + persist a new refresh token (hash only) and return the raw value. */
  private async issueRefreshToken(userId: string): Promise<string> {
    const token = generateRefreshToken();
    const expiresAt = new Date(Date.now() + refreshTokenTtlMs(this.config));
    await this.db.query(
      `INSERT INTO "RefreshToken" ("id", "userId", "tokenHash", "expiresAt")
       VALUES ($1, $2, $3, $4::timestamp)`,
      [newId(), userId, hashRefreshToken(token), expiresAt]
    );
    return token;
  }

  async login(input: { email: string; password: string }) {
    const email = normalizeEmail(input.email);
    const user = await this.db.queryOne<UserRow>(
      `SELECT ${USER_COLUMNS} FROM "User" WHERE "email" = $1`,
      [email]
    );
    if (!user || user.role !== "STUDENT") {
      // Same message for missing/non-student — avoid account enumeration.
      this.fail("Invalid email or password", 401);
    }

    const passwordOk = await bcrypt.compare(input.password, user.passwordHash);
    if (!passwordOk) {
      this.fail("Invalid email or password", 401);
    }

    // Provisioned accounts should already be marked verified by the school/seed.
    if (!user.emailVerifiedAt) {
      this.fail("Account not active. Contact your school.", 403);
    }

    const refreshToken = await this.issueRefreshToken(user.id);

    return {
      accessToken: this.issueAccessToken(user),
      refreshToken,
      user: { id: user.id, email: user.email },
    };
  }

  /**
   * Rotate a refresh token: the presented token is revoked atomically and a new
   * access + refresh pair is issued. Revoked/expired/unknown tokens → 401.
   */
  async refresh(refreshToken: string) {
    const tokenHash = hashRefreshToken(refreshToken);

    // Atomic claim: only one concurrent caller can revoke a live token.
    const claimed = await this.db.queryOne<{ userId: string }>(
      `UPDATE "RefreshToken"
          SET "revokedAt" = ${SQL_NOW_UTC}
        WHERE "tokenHash" = $1
          AND "revokedAt" IS NULL
          AND "expiresAt" > ${SQL_NOW_UTC}
        RETURNING "userId"`,
      [tokenHash]
    );
    if (!claimed) this.fail("Invalid or expired refresh token", 401);

    const user = await this.db.queryOne<UserRow>(
      `SELECT ${USER_COLUMNS} FROM "User" WHERE "id" = $1`,
      [claimed.userId]
    );
    if (!user || user.role !== "STUDENT") {
      this.fail("Invalid or expired refresh token", 401);
    }

    const nextRefresh = await this.issueRefreshToken(user.id);
    return {
      accessToken: this.issueAccessToken(user),
      refreshToken: nextRefresh,
    };
  }

  /** Revoke a refresh token. Idempotent: unknown/already-revoked tokens still succeed. */
  async logout(refreshToken: string) {
    await this.db.query(
      `UPDATE "RefreshToken"
          SET "revokedAt" = ${SQL_NOW_UTC}
        WHERE "tokenHash" = $1 AND "revokedAt" IS NULL`,
      [hashRefreshToken(refreshToken)]
    );
    return { success: true };
  }

  async me(userId: string) {
    const user = await this.db.queryOne<UserRow>(
      `SELECT ${USER_COLUMNS} FROM "User" WHERE "id" = $1`,
      [userId]
    );
    if (!user || user.role !== "STUDENT") {
      this.fail("Unauthorized", 401);
    }
    const profile = await this.db.queryOne<{ isOnboarded: boolean }>(
      `SELECT "isOnboarded" FROM "StudentProfile" WHERE "userId" = $1`,
      [userId]
    );
    return {
      user: { id: user.id, email: user.email },
      isOnboarded: profile?.isOnboarded ?? false,
    };
  }
}
