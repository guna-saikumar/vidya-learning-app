import {
  Body,
  Controller,
  Delete,
  HttpCode,
  Inject,
  Param,
  Patch,
  Post,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { AdminRoleGuard } from "../../auth/admin-role.guard";
import { JwtAuthGuard } from "../../auth/jwt.guard";
import { ZodValidationPipe } from "../../common/zod-validation.pipe";
import {
  createChapterSchema,
  createClassSchema,
  createSectionSchema,
  createSubjectSchema,
  updateChapterSchema,
  updateClassSchema,
  updateSectionSchema,
  updateSubjectSchema,
  type CreateChapterInput,
  type CreateClassInput,
  type CreateSectionInput,
  type CreateSubjectInput,
  type UpdateChapterInput,
  type UpdateClassInput,
  type UpdateSectionInput,
  type UpdateSubjectInput,
} from "./curriculum.schemas";
import { CurriculumService } from "./curriculum.service";

@ApiTags("admin-curriculum")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, AdminRoleGuard)
@Controller("api/admin")
export class AdminCurriculumController {
  constructor(
    @Inject(CurriculumService) private readonly curriculum: CurriculumService
  ) {}

  @Post("classes")
  @ApiOperation({ summary: "Create a class" })
  createClass(
    @Body(new ZodValidationPipe(createClassSchema)) body: CreateClassInput
  ) {
    return this.curriculum.createClass(body);
  }

  @Patch("classes/:id")
  @ApiOperation({ summary: "Update a class" })
  updateClass(
    @Param("id") id: string,
    @Body(new ZodValidationPipe(updateClassSchema)) body: UpdateClassInput
  ) {
    return this.curriculum.updateClass(id, body);
  }

  @Delete("classes/:id")
  @HttpCode(200)
  @ApiOperation({ summary: "Delete a class (cascades)" })
  deleteClass(@Param("id") id: string) {
    return this.curriculum.deleteClass(id);
  }

  @Post("subjects")
  @ApiOperation({ summary: "Create a subject" })
  createSubject(
    @Body(new ZodValidationPipe(createSubjectSchema)) body: CreateSubjectInput
  ) {
    return this.curriculum.createSubject(body);
  }

  @Patch("subjects/:id")
  @ApiOperation({ summary: "Update a subject" })
  updateSubject(
    @Param("id") id: string,
    @Body(new ZodValidationPipe(updateSubjectSchema)) body: UpdateSubjectInput
  ) {
    return this.curriculum.updateSubject(id, body);
  }

  @Delete("subjects/:id")
  @HttpCode(200)
  @ApiOperation({ summary: "Delete a subject (cascades)" })
  deleteSubject(@Param("id") id: string) {
    return this.curriculum.deleteSubject(id);
  }

  @Post("chapters")
  @ApiOperation({ summary: "Create a chapter" })
  createChapter(
    @Body(new ZodValidationPipe(createChapterSchema)) body: CreateChapterInput
  ) {
    return this.curriculum.createChapter(body);
  }

  @Patch("chapters/:id")
  @ApiOperation({ summary: "Update a chapter" })
  updateChapter(
    @Param("id") id: string,
    @Body(new ZodValidationPipe(updateChapterSchema)) body: UpdateChapterInput
  ) {
    return this.curriculum.updateChapter(id, body);
  }

  @Delete("chapters/:id")
  @HttpCode(200)
  @ApiOperation({ summary: "Delete a chapter (cascades)" })
  deleteChapter(@Param("id") id: string) {
    return this.curriculum.deleteChapter(id);
  }

  @Post("sections")
  @ApiOperation({ summary: "Create a section" })
  createSection(
    @Body(new ZodValidationPipe(createSectionSchema)) body: CreateSectionInput
  ) {
    return this.curriculum.createSection(body);
  }

  @Patch("sections/:id")
  @ApiOperation({ summary: "Update a section" })
  updateSection(
    @Param("id") id: string,
    @Body(new ZodValidationPipe(updateSectionSchema)) body: UpdateSectionInput
  ) {
    return this.curriculum.updateSection(id, body);
  }

  @Delete("sections/:id")
  @HttpCode(200)
  @ApiOperation({ summary: "Delete a section" })
  deleteSection(@Param("id") id: string) {
    return this.curriculum.deleteSection(id);
  }
}
