import "reflect-metadata";
import { randomBytes } from "node:crypto";
import { describe, expect, it, beforeAll, afterAll } from "vitest";
import { Test, type TestingModule } from "@nestjs/testing";
import { ConfigModule } from "@nestjs/config";
import type { NestFastifyApplication } from "@nestjs/platform-fastify";
import { FastifyAdapter } from "@nestjs/platform-fastify";
import { AdminController } from "../modules/admin/admin.controller";
import { STATIC_ADMIN } from "../modules/admin/static/fixtures";
import { DbModule } from "../db/db.module";
import { DbService } from "../db/db.service";
import { AuthModule } from "./auth.module";
import { AdminRoleGuard } from "./admin-role.guard";
import { JwtAuthGuard } from "./jwt.guard";
import { MailerModule } from "../mailer/mailer.module";
import { signAccessToken } from "./jwt";

const dbStub = {
  query: async () => ({ rows: [], rowCount: 0 }),
  queryOne: async () => null,
  tx: async <T>(fn: (c: unknown) => Promise<T>) => fn({}),
  onModuleDestroy: async () => undefined,
};

type Role = "STUDENT" | "ADMIN" | "SUPER_ADMIN";

/** Config stub matching the JWT secret generated in `beforeAll`. */
const config = {
  get: <T = string>(key: string): T | undefined =>
    (key === "JWT_SECRET" ? process.env.JWT_SECRET : undefined) as T,
};

const tokenFor = (role: Role) => {
  const payload = {
    STUDENT: {
      sub: "user_student",
      email: "student@vidya.test",
      role: "STUDENT" as const,
      name: "Student",
    },
    ADMIN: {
      sub: STATIC_ADMIN.id,
      email: STATIC_ADMIN.email,
      role: "ADMIN" as const,
      name: STATIC_ADMIN.name,
    },
    SUPER_ADMIN: {
      sub: "super-static-1",
      email: "superadmin@vidya.edu.in",
      role: "SUPER_ADMIN" as const,
      name: "Super Admin",
    },
  }[role];
  return signAccessToken(payload, config as never);
};

describe("admin RBAC (e2e)", () => {
  let app: NestFastifyApplication | undefined;
  let studentToken = "";
  let adminToken = "";
  let superAdminToken = "";

  beforeAll(async () => {
    process.env.JWT_SECRET = randomBytes(32).toString("hex");
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        DbModule,
        MailerModule,
        AuthModule,
      ],
      controllers: [AdminController],
      providers: [JwtAuthGuard, AdminRoleGuard],
    })
      .overrideProvider(DbService)
      .useValue(dbStub)
      .compile();

    app = moduleRef.createNestApplication<NestFastifyApplication>(
      new FastifyAdapter()
    );
    await app.init();
    await app.getHttpAdapter().getInstance().ready();
    studentToken = tokenFor("STUDENT");
    adminToken = tokenFor("ADMIN");
    superAdminToken = tokenFor("SUPER_ADMIN");
  });

  afterAll(async () => {
    await app?.close();
  });

  const get = async (path: string, token?: string) =>
    app!.inject({
      method: "GET",
      url: path,
      headers: token ? { authorization: `Bearer ${token}` } : {},
    });

  it("rejects a student JWT on /api/admin/auth/me with 403", async () => {
    const res = await get("/api/admin/auth/me", studentToken);
    expect(res.statusCode).toBe(403);
    expect(JSON.parse(res.body)).toEqual({
      error: "Forbidden: Admin access required",
    });
  });

  it("rejects a request without a token with 401", async () => {
    const res = await get("/api/admin/auth/me");
    expect(res.statusCode).toBe(401);
  });

  it("allows an ADMIN JWT on /api/admin/auth/me", async () => {
    const res = await get("/api/admin/auth/me", adminToken);
    expect(res.statusCode).toBe(200);
    expect(JSON.parse(res.body).role).toBe("ADMIN");
  });

  it("allows a SUPER_ADMIN JWT on /api/admin/auth/me", async () => {
    const res = await get("/api/admin/auth/me", superAdminToken);
    expect(res.statusCode).toBe(200);
    expect(JSON.parse(res.body).role).toBe("SUPER_ADMIN");
  });

  it("blocks a student JWT on /api/admin/ping with 403", async () => {
    const res = await get("/api/admin/ping", studentToken);
    expect(res.statusCode).toBe(403);
  });

  it("allows ADMIN and SUPER_ADMIN JWTs on /api/admin/ping", async () => {
    for (const token of [adminToken, superAdminToken]) {
      const res = await get("/api/admin/ping", token);
      expect(res.statusCode).toBe(200);
      expect(JSON.parse(res.body)).toEqual({ ok: true });
    }
  });

  it("static admin login succeeds", async () => {
    const res = await app!.inject({
      method: "POST",
      url: "/api/admin/auth/login",
      headers: { "content-type": "application/json" },
      payload: {
        email: STATIC_ADMIN.email,
        password: STATIC_ADMIN.password,
      },
    });
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.accessToken).toBeTruthy();
    expect(body.user.role).toBe("ADMIN");
  });
});
