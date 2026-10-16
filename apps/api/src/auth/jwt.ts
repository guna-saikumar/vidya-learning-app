import { ConfigService } from "@nestjs/config";
import jwt from "jsonwebtoken";
import type { UserRole } from "../../../../packages/auth/src";

export type JwtPayload = {
  sub: string;
  email: string;
  role: UserRole;
  name: string;
};

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

export const signAccessToken = (
  payload: JwtPayload,
  config?: ConfigService
): string => jwt.sign(payload, resolveSecret(config), { expiresIn: "7d" });

export const verifyAccessToken = (
  token: string,
  config?: ConfigService
): JwtPayload => {
  const decoded = jwt.verify(token, resolveSecret(config));
  if (typeof decoded === "string" || !decoded || typeof decoded !== "object") {
    throw new Error("Invalid token");
  }
  const { sub, email, role, name } = decoded as JwtPayload;
  if (!sub || !email || !role || !name) {
    throw new Error("Invalid token payload");
  }
  return { sub, email, role, name };
};
