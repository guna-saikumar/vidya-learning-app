import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import type { FastifyRequest } from "fastify";

/**
 * Shared-secret guard for the staff demo endpoints.
 * Reads `x-admin-token` (or `?token=`) and compares it with ADMIN_TOKEN from env.
 */
@Injectable()
export class AdminTokenGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<FastifyRequest>();
    const query = req.query as Record<string, unknown> | undefined;
    const token =
      (req.headers["x-admin-token"] as string | undefined) ??
      (typeof query?.token === "string" ? query.token : undefined);
    const expected = process.env.ADMIN_TOKEN?.trim();
    if (!expected || !token || token !== expected) {
      throw new UnauthorizedException({ error: "Invalid admin token" });
    }
    return true;
  }
}
