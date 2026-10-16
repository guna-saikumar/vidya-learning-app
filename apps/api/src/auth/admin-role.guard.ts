import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from "@nestjs/common";
import { isAdmin } from "../../../../packages/auth/src";
import type { AuthedRequest } from "./jwt.guard";

/**
 * RBAC gate for admin-only routes. Must be used **after** `JwtAuthGuard`,
 * e.g. `@UseGuards(JwtAuthGuard, AdminRoleGuard)`, so a valid student JWT
 * is rejected with **403** at the guard instead of only inside the service.
 */
@Injectable()
export class AdminRoleGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<AuthedRequest>();
    if (!isAdmin(req.user)) {
      throw new ForbiddenException({
        error: "Forbidden: Admin access required",
      });
    }
    return true;
  }
}
