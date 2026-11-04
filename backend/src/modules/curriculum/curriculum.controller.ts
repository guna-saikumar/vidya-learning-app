import { Controller, Get, Inject, Param, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "../../auth/jwt.guard";
import { StudentRoleGuard } from "../../auth/student-role.guard";
import { ApiPathParam } from "../../common/zod-openapi";
import { CurriculumService } from "./curriculum.service";

@ApiTags("curriculum")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, StudentRoleGuard)
@Controller("api/v1/curriculum")
export class CurriculumController {
  constructor(
    @Inject(CurriculumService) private readonly curriculum: CurriculumService
  ) {}

  @Get("classes")
  @ApiOperation({ summary: "List classes" })
  classes() {
    return this.curriculum.listClasses();
  }

  @Get("classes/:classId/subjects")
  @ApiOperation({ summary: "List subjects for a class" })
  @ApiPathParam("classId", { description: "Class id" })
  subjectsForClass(@Param("classId") classId: string) {
    return this.curriculum.listSubjectsForClass(classId);
  }

  @Get("subjects/:subjectId")
  @ApiOperation({ summary: "Get a subject with its chapters" })
  @ApiPathParam("subjectId", { description: "Subject id" })
  getSubject(@Param("subjectId") subjectId: string) {
    return this.curriculum.getSubject(subjectId);
  }

  @Get("chapters/:chapterId")
  @ApiOperation({ summary: "Get a chapter with its sections" })
  @ApiPathParam("chapterId", { description: "Chapter id" })
  getChapter(@Param("chapterId") chapterId: string) {
    return this.curriculum.getChapter(chapterId);
  }

  @Get("sections/:sectionId")
  @ApiOperation({ summary: "Get a section" })
  @ApiPathParam("sectionId", { description: "Section id" })
  getSection(@Param("sectionId") sectionId: string) {
    return this.curriculum.getSection(sectionId);
  }
}
