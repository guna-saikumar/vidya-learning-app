import {
  Controller,
  Get,
  Inject,
  Query,
  UseGuards,
} from "@nestjs/common";
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
import { DashboardService } from "./dashboard.service";

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
  constructor(
    @Inject(DashboardService) private readonly dashboard: DashboardService
  ) {}

  @Get()
  @ApiOperation({
    summary: "Admin home dashboard",
    description:
      "Curriculum hierarchy stats, user role counts, persisted material counts, and recent users.",
  })
  @ApiQuery({ name: "recentLimit", required: false, type: Number })
  getDashboard(
    @Query(new ZodValidationPipe(recentQuerySchema))
    query: z.infer<typeof recentQuerySchema>
  ) {
    return this.dashboard.getAdminDashboard(query.recentLimit);
  }

  @Get("users")
  @ApiOperation({
    summary: "Paginated users for admin dashboard tables",
  })
  @ApiQuery({ name: "role", required: false, enum: ["STUDENT", "ADMIN", "SUPER_ADMIN"] })
  @ApiQuery({ name: "limit", required: false, type: Number })
  @ApiQuery({ name: "offset", required: false, type: Number })
  listUsers(
    @Query(new ZodValidationPipe(usersQuerySchema))
    query: z.infer<typeof usersQuerySchema>
  ) {
    return this.dashboard.listUsers(query);
  }
}
