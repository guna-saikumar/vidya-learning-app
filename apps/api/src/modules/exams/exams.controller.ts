import { Controller, Get, Inject, Req, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard, type AuthedRequest } from "../../auth/jwt.guard";
import { StudentRoleGuard } from "../../auth/student-role.guard";
import { ExamsService } from "./exams.service";

@ApiTags("exams")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, StudentRoleGuard)
@Controller("api/me/exams")
export class ExamsController {
  constructor(@Inject(ExamsService) private readonly exams: ExamsService) {}

  @Get("schedule")
  @ApiOperation({ summary: "Exam schedule for my class" })
  schedule(@Req() req: AuthedRequest) {
    return this.exams.scheduleForStudent(req.user!.sub);
  }

  @Get("results")
  @ApiOperation({ summary: "My published exam results" })
  results(@Req() req: AuthedRequest) {
    return this.exams.resultsForStudent(req.user!.sub);
  }
}
