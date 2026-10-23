import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from "@nestjs/swagger";
import { z } from "zod";
import { AdminRoleGuard } from "../../auth/admin-role.guard";
import { JwtAuthGuard } from "../../auth/jwt.guard";
import { ZodValidationPipe } from "../../common/zod-validation.pipe";
import {
  STATIC_ADMIN_DASHBOARD,
  STATIC_USERS,
} from "../admin/static/fixtures";

const recentQuerySchema = z.object({
  recentLimit: z.coerce.number().int().min(1).max(50).optional(),
});

const usersQuerySchema = z.object({
  role: z.enum(["STUDENT", "ADMIN", "SUPER_ADMIN"]).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  offset: z.coerce.number().int().min(0).optional(),
});

@ApiTags("admin-dashboard")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, AdminRoleGuard)
@Controller("api/admin/dashboard")
export class AdminDashboardController {
  @Get()
  @ApiOperation({
    summary: "Admin home dashboard (static fixture)",
  })
  @ApiQuery({ name: "recentLimit", required: false, type: Number })
  getDashboard(
    @Query(new ZodValidationPipe(recentQuerySchema))
    query: z.infer<typeof recentQuerySchema>
  ) {
    const limit = Math.min(Math.max(query.recentLimit ?? 8, 1), 50);
    return {
      ...STATIC_ADMIN_DASHBOARD,
      generatedAt: new Date().toISOString(),
      recentUsers: STATIC_ADMIN_DASHBOARD.recentUsers.slice(0, limit),
    };
  }

  @Get("users")
  @ApiOperation({
    summary: "Paginated users for admin dashboard (static fixture)",
  })
  @ApiQuery({
    name: "role",
    required: false,
    enum: ["STUDENT", "ADMIN", "SUPER_ADMIN"],
  })
  @ApiQuery({ name: "limit", required: false, type: Number })
  @ApiQuery({ name: "offset", required: false, type: Number })
  listUsers(
    @Query(new ZodValidationPipe(usersQuerySchema))
    query: z.infer<typeof usersQuerySchema>
  ) {
    const limit = Math.min(Math.max(query.limit ?? 20, 1), 100);
    const offset = Math.max(query.offset ?? 0, 0);
    let rows = STATIC_USERS;
    if (query.role) {
      rows = rows.filter((u) => u.role === query.role);
    }
    const slice = rows.slice(offset, offset + limit);
    return {
      total: rows.length,
      limit,
      offset,
      users: slice,
    };
  }
}
