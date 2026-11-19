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
import { JwtAuthGuard, type AuthedRequest } from "../../auth/jwt.guard";
import { StudentRoleGuard } from "../../auth/student-role.guard";
import {
  ApiPathParam,
  ApiZodBody,
  ApiZodQueries,
} from "../../common/zod-openapi";
import { ZodValidationPipe } from "../../common/zod-validation.pipe";
import {
  createDoubtSchema,
  listDoubtsQuerySchema,
  postAnswerSchema,
  resolveDoubtSchema,
  type CreateDoubtInput,
  type ListDoubtsQuery,
  type PostAnswerInput,
  type ResolveDoubtInput,
} from "./doubts.schemas";
import { DoubtsService } from "./doubts.service";

@ApiTags("doubts")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, StudentRoleGuard)
@Controller("api/v1")
export class DoubtsController {
  constructor(
    @Inject(DoubtsService)
    private readonly doubts: DoubtsService
  ) {}

  @Get("chapters/:chapterId/doubts")
  @ApiOperation({ summary: "List doubts for a chapter, newest first" })
  @ApiPathParam("chapterId", { description: "Chapter id" })
  @ApiZodQueries(listDoubtsQuerySchema)
  listDoubts(
    @Req() req: AuthedRequest,
    @Param("chapterId") chapterId: string,
    @Query(new ZodValidationPipe(listDoubtsQuerySchema)) query: ListDoubtsQuery
  ) {
    return this.doubts.listDoubts(req.user!.sub, chapterId, query);
  }

  @Post("chapters/:chapterId/doubts")
  @HttpCode(201)
  @ApiOperation({ summary: "Create a doubt for a chapter" })
  @ApiPathParam("chapterId", { description: "Chapter id" })
  @ApiZodBody(createDoubtSchema)
  createDoubt(
    @Req() req: AuthedRequest,
    @Param("chapterId") chapterId: string,
    @Body(new ZodValidationPipe(createDoubtSchema)) body: CreateDoubtInput
  ) {
    return this.doubts.createDoubt(req.user!.sub, chapterId, body);
  }

  @Get("doubts/:doubtId")
  @ApiOperation({ summary: "Get one doubt thread with answers" })
  @ApiPathParam("doubtId", { description: "Doubt id" })
  getDoubtThread(@Req() req: AuthedRequest, @Param("doubtId") doubtId: string) {
    return this.doubts.getDoubtThread(req.user!.sub, doubtId);
  }

  @Post("doubts/:doubtId/answers")
  @HttpCode(201)
  @ApiOperation({ summary: "Post an answer to a doubt thread" })
  @ApiPathParam("doubtId", { description: "Doubt id" })
  @ApiZodBody(postAnswerSchema)
  postAnswer(
    @Req() req: AuthedRequest,
    @Param("doubtId") doubtId: string,
    @Body(new ZodValidationPipe(postAnswerSchema)) body: PostAnswerInput
  ) {
    return this.doubts.postAnswer(req.user!.sub, doubtId, body);
  }

  @Post("doubts/:doubtId/upvote")
  @HttpCode(200)
  @ApiOperation({ summary: "Toggle upvote on a doubt thread" })
  @ApiPathParam("doubtId", { description: "Doubt id" })
  toggleUpvote(@Req() req: AuthedRequest, @Param("doubtId") doubtId: string) {
    return this.doubts.toggleUpvote(req.user!.sub, doubtId);
  }

  @Post("doubts/:doubtId/answers/:answerId/helpful")
  @HttpCode(200)
  @ApiOperation({ summary: "Toggle helpful vote on an answer" })
  @ApiPathParam("doubtId", { description: "Doubt id" })
  @ApiPathParam("answerId", { description: "Answer id" })
  toggleHelpful(
    @Req() req: AuthedRequest,
    @Param("doubtId") doubtId: string,
    @Param("answerId") answerId: string
  ) {
    return this.doubts.toggleHelpful(req.user!.sub, doubtId, answerId);
  }

  @Post("doubts/:doubtId/resolve")
  @HttpCode(200)
  @ApiOperation({ summary: "Mark doubt resolved (asker only)" })
  @ApiPathParam("doubtId", { description: "Doubt id" })
  @ApiZodBody(resolveDoubtSchema)
  resolveDoubt(
    @Req() req: AuthedRequest,
    @Param("doubtId") doubtId: string,
    @Body(new ZodValidationPipe(resolveDoubtSchema)) body: ResolveDoubtInput
  ) {
    return this.doubts.resolveDoubt(req.user!.sub, doubtId, body);
  }
}
