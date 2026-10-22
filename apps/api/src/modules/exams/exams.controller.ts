import {
  Body,
  Controller,
  Get,
  Inject,
  Post,
  Req,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { AdminRoleGuard } from "../../auth/admin-role.guard";
import { JwtAuthGuard, type AuthedRequest } from "../../auth/jwt.guard";
import { StudentRoleGuard } from "../../auth/student-role.guard";
import { ApiZodBody } from "../../common/zod-openapi";
import { ZodValidationPipe } from "../../common/zod-validation.pipe";
import {
  createExamResultSchema,
  createExamScheduleSchema,
  type CreateExamResultInput,
  type CreateExamScheduleInput,
} from "./exams.schemas";
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

@ApiTags("admin-exams")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, AdminRoleGuard)
@Controller("api/admin/exams")
export class AdminExamsController {
  constructor(@Inject(ExamsService) private readonly exams: ExamsService) {}

  @Post("schedule")
  @ApiOperation({ summary: "Add an exam schedule entry" })
  @ApiZodBody(createExamScheduleSchema)
  createSchedule(
    @Body(new ZodValidationPipe(createExamScheduleSchema))
    body: CreateExamScheduleInput
  ) {
    return this.exams.createSchedule(body);
  }

  @Post("results")
  @ApiOperation({ summary: "Publish an exam result for a student" })
  @ApiZodBody(createExamResultSchema)
  createResult(
    @Body(new ZodValidationPipe(createExamResultSchema))
    body: CreateExamResultInput
  ) {
    return this.exams.createResult(body);
  }
}
