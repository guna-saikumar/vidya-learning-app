import {
  Body,
  Controller,
  Get,
  HttpCode,
  Inject,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
} from "@nestjs/swagger";
import { AdminRoleGuard } from "../../auth/admin-role.guard";
import { JwtAuthGuard, type AuthedRequest } from "../../auth/jwt.guard";
import { StudentRoleGuard } from "../../auth/student-role.guard";
import { ApiZodBody, ApiZodQueries } from "../../common/zod-openapi";
import { ZodValidationPipe } from "../../common/zod-validation.pipe";
import {
  createQuizSchema,
  quizListQuerySchema,
  submitAttemptSchema,
  type CreateQuizInput,
  type QuizListQuery,
  type SubmitAttemptInput,
} from "./quizzes.schemas";
import { QuizzesService } from "./quizzes.service";

@ApiTags("quizzes")
@ApiBearerAuth()
@Controller("api")
export class QuizzesController {
  constructor(@Inject(QuizzesService) private readonly quizzes: QuizzesService) {}

  @Get("quizzes")
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: "List quizzes (optionally by chapter)" })
  @ApiZodQueries(quizListQuerySchema)
  list(
    @Query(new ZodValidationPipe(quizListQuerySchema)) query: QuizListQuery
  ) {
    return this.quizzes.list(query);
  }

  @Get("quizzes/:id")
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: "Get a quiz with questions (includes correctIndex for practice)",
  })
  get(@Param("id") id: string) {
    return this.quizzes.get(id);
  }

  @Post("quizzes/:id/attempts")
  @HttpCode(201)
  @UseGuards(JwtAuthGuard, StudentRoleGuard)
  @ApiOperation({ summary: "Submit a quiz attempt (student)" })
  @ApiZodBody(submitAttemptSchema)
  submitAttempt(
    @Req() req: AuthedRequest,
    @Param("id") id: string,
    @Body(new ZodValidationPipe(submitAttemptSchema)) body: SubmitAttemptInput
  ) {
    return this.quizzes.submitAttempt(req.user!.sub, id, body);
  }

  @Get("me/quiz-attempts")
  @UseGuards(JwtAuthGuard, StudentRoleGuard)
  @ApiOperation({ summary: "List my quiz attempts" })
  listAttempts(@Req() req: AuthedRequest) {
    return this.quizzes.listAttempts(req.user!.sub);
  }
}

@ApiTags("admin-quizzes")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, AdminRoleGuard)
@Controller("api/admin/quizzes")
export class AdminQuizzesController {
  constructor(@Inject(QuizzesService) private readonly quizzes: QuizzesService) {}

  @Post()
  @ApiOperation({ summary: "Create a quiz with questions" })
  @ApiZodBody(createQuizSchema)
  create(
    @Body(new ZodValidationPipe(createQuizSchema)) body: CreateQuizInput
  ) {
    return this.quizzes.create(body);
  }
}
