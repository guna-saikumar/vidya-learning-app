import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Inject,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from "@nestjs/swagger";
import { JwtAuthGuard, type AuthedRequest } from "../../auth/jwt.guard";
import { StudentRoleGuard } from "../../auth/student-role.guard";
import { ZodValidationPipe } from "../../common/zod-validation.pipe";
import {
  completeSectionSchema,
  createBookmarkSchema,
  studyStatsQuerySchema,
  updateChapterProgressSchema,
  updateProfileSchema,
  type CompleteSectionInput,
  type CreateBookmarkInput,
  type UpdateChapterProgressInput,
  type UpdateProfileInput,
} from "./me.schemas";
import { MeService } from "./me.service";

@ApiTags("me")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, StudentRoleGuard)
@Controller("api/me")
export class MeController {
  constructor(@Inject(MeService) private readonly me: MeService) {}

  @Get("profile")
  @ApiOperation({ summary: "Current student profile" })
  getProfile(@Req() req: AuthedRequest) {
    return this.me.getProfile(req.user!.sub);
  }

  @Patch("profile")
  @ApiOperation({ summary: "Update current student profile" })
  updateProfile(
    @Req() req: AuthedRequest,
    @Body(new ZodValidationPipe(updateProfileSchema)) body: UpdateProfileInput
  ) {
    return this.me.updateProfile(req.user!.sub, body);
  }

  @Get("progress")
  @ApiOperation({ summary: "List chapter progress for the student" })
  listProgress(@Req() req: AuthedRequest) {
    return this.me.listProgress(req.user!.sub);
  }

  @Put("progress/chapters/:chapterId")
  @ApiOperation({ summary: "Upsert progress for a chapter" })
  upsertChapterProgress(
    @Req() req: AuthedRequest,
    @Param("chapterId") chapterId: string,
    @Body(new ZodValidationPipe(updateChapterProgressSchema))
    body: UpdateChapterProgressInput
  ) {
    return this.me.upsertChapterProgress(req.user!.sub, chapterId, body);
  }

  @Post("progress/sections/:sectionId/complete")
  @HttpCode(200)
  @ApiOperation({ summary: "Mark a section as completed" })
  completeSection(
    @Req() req: AuthedRequest,
    @Param("sectionId") sectionId: string,
    @Body(new ZodValidationPipe(completeSectionSchema))
    body: CompleteSectionInput
  ) {
    return this.me.completeSection(req.user!.sub, sectionId, body?.minutes);
  }

  @Get("bookmarks")
  @ApiOperation({ summary: "List bookmarks" })
  listBookmarks(@Req() req: AuthedRequest) {
    return this.me.listBookmarks(req.user!.sub);
  }

  @Post("bookmarks")
  @ApiOperation({ summary: "Create a bookmark (idempotent per chapter/section/type)" })
  createBookmark(
    @Req() req: AuthedRequest,
    @Body(new ZodValidationPipe(createBookmarkSchema)) body: CreateBookmarkInput
  ) {
    return this.me.createBookmark(req.user!.sub, body);
  }

  @Delete("bookmarks/:id")
  @HttpCode(200)
  @ApiOperation({ summary: "Delete a bookmark" })
  deleteBookmark(@Req() req: AuthedRequest, @Param("id") id: string) {
    return this.me.deleteBookmark(req.user!.sub, id);
  }

  @Get("study-stats")
  @ApiOperation({ summary: "Daily study minutes and streak" })
  @ApiQuery({ name: "range", required: false, example: "7d" })
  studyStats(
    @Req() req: AuthedRequest,
    @Query(new ZodValidationPipe(studyStatsQuerySchema))
    query: { range: string }
  ) {
    return this.me.studyStats(req.user!.sub, query.range);
  }
}
