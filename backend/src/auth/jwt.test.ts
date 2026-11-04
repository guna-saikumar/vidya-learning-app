import { describe, expect, it } from "vitest";
import jwt from "jsonwebtoken";
import {
  DEFAULT_ACCESS_TOKEN_TTL,
  refreshTokenTtlMs,
  signAccessToken,
  verifyAccessToken,
} from "./jwt";

describe("access tokens", () => {
  it("round-trips a student payload", () => {
    const token = signAccessToken({ sub: "u1", email: "a@b.co", role: "STUDENT" });
    expect(verifyAccessToken(token)).toEqual({
      sub: "u1",
      email: "a@b.co",
      role: "STUDENT",
    });
  });

  it("is short-lived (15m by default)", () => {
    expect(DEFAULT_ACCESS_TOKEN_TTL).toBe("15m");
    const token = signAccessToken({ sub: "u1", email: "a@b.co", role: "STUDENT" });
    const { iat, exp } = jwt.decode(token) as { iat: number; exp: number };
    expect(exp - iat).toBe(15 * 60);
  });

  it("rejects non-student roles", () => {
    const forged = jwt.sign(
      { sub: "u1", email: "a@b.co", role: "ADMIN" },
      "dev-only-jwt-secret-change-me"
    );
    expect(() => verifyAccessToken(forged)).toThrow();
  });

  it("rejects tokens signed with another secret", () => {
    const forged = jwt.sign({ sub: "u1", email: "a@b.co", role: "STUDENT" }, "nope");
    expect(() => verifyAccessToken(forged)).toThrow();
  });
});

describe("refresh token ttl", () => {
  it("defaults to 30 days", () => {
    expect(refreshTokenTtlMs()).toBe(30 * 24 * 60 * 60 * 1000);
  });
});
