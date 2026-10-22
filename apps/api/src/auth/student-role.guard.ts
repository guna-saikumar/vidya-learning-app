import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from "@nestjs/common";
import { isStudent } from "../../../../packages/auth/src";
import type { AuthedRequest } from "./jwt.guard";

/**
 * RBAC gate for student-only routes. Must be used **after** `JwtAuthGuard`,
 * e.g. `@UseGuards(JwtAuthGuard, StudentRoleGuard)`. Admin tokens get **403**.
 */
@Injectable()
export class StudentRoleGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<AuthedRequest>();
    if (!isStudent(req.user)) {
      throw new ForbiddenException({
        error: "Forbidden: Student access required",
      });
    }
    return true;
  }
}
