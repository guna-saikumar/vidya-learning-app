import { ConfigService } from "@nestjs/config";
import jwt from "jsonwebtoken";
import { USER_ROLE_VALUES, type UserRole } from "../../../../packages/auth/src";

export type JwtPayload = {
  sub: string;
  email: string;
  role: UserRole;
};

/** Short-lived access token lifetime (override with ACCESS_TOKEN_TTL, e.g. "15m"). */
export const DEFAULT_ACCESS_TOKEN_TTL = "15m";
/** Refresh token lifetime in days (override with REFRESH_TOKEN_TTL_DAYS). */
export const DEFAULT_REFRESH_TOKEN_TTL_DAYS = 30;

const resolveSecret = (config?: ConfigService): string => {
  const secret = config?.get<string>("JWT_SECRET") ?? process.env.JWT_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("JWT_SECRET is required in production");
    }
    return "dev-only-jwt-secret-change-me";
  }
  return secret;
};

export const accessTokenTtl = (config?: ConfigService): string =>
  config?.get<string>("ACCESS_TOKEN_TTL") ??
  process.env.ACCESS_TOKEN_TTL ??
  DEFAULT_ACCESS_TOKEN_TTL;

export const refreshTokenTtlMs = (config?: ConfigService): number => {
  const raw =
    config?.get<string>("REFRESH_TOKEN_TTL_DAYS") ??
    process.env.REFRESH_TOKEN_TTL_DAYS;
  const days = Number(raw);
  const effective =
    Number.isFinite(days) && days > 0 ? days : DEFAULT_REFRESH_TOKEN_TTL_DAYS;
  return effective * 24 * 60 * 60 * 1000;
};

export const signAccessToken = (
  payload: JwtPayload,
  config?: ConfigService
): string =>
  jwt.sign(payload, resolveSecret(config), {
    expiresIn: accessTokenTtl(config) as jwt.SignOptions["expiresIn"],
  });

export const verifyAccessToken = (
  token: string,
  config?: ConfigService
): JwtPayload => {
  const decoded = jwt.verify(token, resolveSecret(config));
  if (typeof decoded === "string" || !decoded || typeof decoded !== "object") {
    throw new Error("Invalid token");
  }
  const { sub, email, role } = decoded as JwtPayload;
  if (!sub || !email || !USER_ROLE_VALUES.includes(role)) {
    throw new Error("Invalid token payload");
  }
  return { sub, email, role };
};
