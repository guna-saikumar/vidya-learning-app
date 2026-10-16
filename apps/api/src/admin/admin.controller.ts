import { Controller, Get, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { AdminRoleGuard } from "../auth/admin-role.guard";
import { JwtAuthGuard } from "../auth/jwt.guard";

@ApiTags("admin")
@Controller("api/admin")
export class AdminController {
  @Get("ping")
  @UseGuards(JwtAuthGuard, AdminRoleGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Admin auth ping (JWT, admin roles only)" })
  ping() {
    return { ok: true };
  }
}
