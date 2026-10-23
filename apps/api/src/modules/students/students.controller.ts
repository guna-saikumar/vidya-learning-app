import "@fastify/multipart";
import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Patch,
  Post,
  Put,
  Req,
  UseGuards,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiTags,
} from "@nestjs/swagger";
import { JwtAuthGuard, type AuthedRequest } from "../../auth/jwt.guard";
import { StudentRoleGuard } from "../../auth/student-role.guard";
import { ApiPathParam, ApiZodBody } from "../../common/zod-openapi";
import { ZodValidationPipe } from "../../common/zod-validation.pipe";
import {
  createBookmarkSchema,
  updateOnboardingSchema,
  updateProfileSchema,
  updateSettingsSchema,
  upsertProgressSchema,
  type CreateBookmarkInput,
  type UpdateOnboardingInput,
  type UpdateProfileInput,
  type UpdateSettingsInput,
  type UpsertProgressInput,
} from "./students.schemas";
import { StudentsService } from "./students.service";

@ApiTags("students")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, StudentRoleGuard)
@Controller("api/v1/students")
export class StudentsController {
  constructor(
    @Inject(StudentsService) private readonly students: StudentsService
  ) {}

  // -------------------------------------------------------------- profile --

  @Get("me/profile")
  @ApiOperation({ summary: "Full student details & academic data" })
  getProfile(@Req() req: AuthedRequest) {
    return this.students.getProfile(req.user!.sub);
  }

  @Put("me/onboarding")
  @ApiOperation({
    summary: "Submit the 4-step onboarding wizard",
    description:
      "Returns `{ success: true, profile, isOnboarded: true }`. Omitted optional fields are cleared (PUT semantics).",
  })
  @ApiZodBody(updateOnboardingSchema)
  onboarding(
    @Req() req: AuthedRequest,
    @Body(new ZodValidationPipe(updateOnboardingSchema))
    body: UpdateOnboardingInput
  ) {
    return this.students.submitOnboarding(req.user!.sub, body);
  }

  @Patch("me/profile")
  @ApiOperation({ summary: "Edit student details (partial)" })
  @ApiZodBody(updateProfileSchema)
  updateProfile(
    @Req() req: AuthedRequest,
    @Body(new ZodValidationPipe(updateProfileSchema)) body: UpdateProfileInput
  ) {
    return this.students.updateProfile(req.user!.sub, body);
  }

  @Patch("me/settings")
  @ApiOperation({ summary: "Update preferences (language, notifications)" })
  @ApiZodBody(updateSettingsSchema)
  updateSettings(
    @Req() req: AuthedRequest,
    @Body(new ZodValidationPipe(updateSettingsSchema))
    body: UpdateSettingsInput
  ) {
    return this.students.updateSettings(req.user!.sub, body);
  }

  // --------------------------------------------------------------- avatar --

  @Post("me/avatar")
  @ApiOperation({ summary: "Upload profile photo (multipart `file` field, max 5 MB)" })
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    schema: {
      type: "object",
      required: ["file"],
      properties: { file: { type: "string", format: "binary" } },
    },
  })
  async uploadAvatar(@Req() req: AuthedRequest) {
    if (!req.isMultipart || !req.isMultipart()) {
      throw new BadRequestException({
        error: "Expected multipart/form-data with an image file",
      });
    }
    const upload = await req.file();
    if (!upload) {
      throw new BadRequestException({ error: "Image file is required" });
    }
    return this.students.setAvatar(req.user!.sub, {
      mimetype: upload.mimetype,
      file: upload.file,
    });
  }

  @Delete("me/avatar")
  @ApiOperation({ summary: "Remove profile photo (revert to default icon)" })
  deleteAvatar(@Req() req: AuthedRequest) {
    return this.students.deleteAvatar(req.user!.sub);
  }

  // ------------------------------------------------------------- progress --

  @Get("me/progress")
  @ApiOperation({ summary: "Reading progress for all chapters" })
  getProgress(@Req() req: AuthedRequest) {
    return this.students.getProgress(req.user!.sub);
  }

  @Put("me/progress/:chapterId")
  @ApiOperation({ summary: "Update chapter reading % or mark completed" })
  @ApiPathParam("chapterId", { description: "Chapter id" })
  @ApiZodBody(upsertProgressSchema)
  upsertProgress(
    @Req() req: AuthedRequest,
    @Param("chapterId") chapterId: string,
    @Body(new ZodValidationPipe(upsertProgressSchema)) body: UpsertProgressInput
  ) {
    return this.students.upsertProgress(req.user!.sub, chapterId, body);
  }

  // ------------------------------------------------------------ bookmarks --

  @Get("me/bookmarks")
  @ApiOperation({ summary: "List saved bookmarks" })
  listBookmarks(@Req() req: AuthedRequest) {
    return this.students.listBookmarks(req.user!.sub);
  }

  @Post("me/bookmarks")
  @ApiOperation({ summary: "Bookmark a chapter or section (idempotent)" })
  @ApiZodBody(createBookmarkSchema)
  createBookmark(
    @Req() req: AuthedRequest,
    @Body(new ZodValidationPipe(createBookmarkSchema)) body: CreateBookmarkInput
  ) {
    return this.students.createBookmark(req.user!.sub, body);
  }

  // Declared before `:bookmarkId` for readability; paths differ in depth anyway.
  @Delete("me/bookmarks/by-section/:sectionId")
  @ApiOperation({ summary: "Remove bookmark(s) by section id" })
  @ApiPathParam("sectionId", { description: "Section id" })
  deleteBySection(
    @Req() req: AuthedRequest,
    @Param("sectionId") sectionId: string
  ) {
    return this.students.deleteBookmarksBySection(req.user!.sub, sectionId);
  }

  @Delete("me/bookmarks/:bookmarkId")
  @ApiOperation({ summary: "Remove bookmark by id" })
  @ApiPathParam("bookmarkId", { description: "Bookmark id" })
  deleteBookmark(
    @Req() req: AuthedRequest,
    @Param("bookmarkId") bookmarkId: string
  ) {
    return this.students.deleteBookmark(req.user!.sub, bookmarkId);
  }
}
