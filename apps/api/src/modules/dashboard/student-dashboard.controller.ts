import { Controller, Get, Inject, Req, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard, type AuthedRequest } from "../../auth/jwt.guard";
import { DashboardService } from "./dashboard.service";

@ApiTags("student-dashboard")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("api/dashboard")
export class StudentDashboardController {
  constructor(
    @Inject(DashboardService) private readonly dashboard: DashboardService
  ) {}

  @Get()
  @ApiOperation({
    summary: "Student home dashboard",
    description:
      "Authenticated student summary: identity + curriculum overview. Progress/tasks remain client-local until persisted.",
  })
  getDashboard(@Req() req: AuthedRequest) {
    return this.dashboard.getStudentDashboard(req.user!.sub);
  }
}
