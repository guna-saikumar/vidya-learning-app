import { Controller, Get, Inject, Param, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "../../auth/jwt.guard";
import { CurriculumService } from "./curriculum.service";

@ApiTags("curriculum")
@Controller("api")
export class CurriculumController {
  constructor(
    @Inject(CurriculumService) private readonly curriculum: CurriculumService
  ) {}

  @Get("classes")
  @ApiOperation({
    summary: "List classes with nested subjects/chapters/sections and stats",
  })
  classes() {
    return this.curriculum.listClasses();
  }

  @Get("classes/:classId")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get a class with its nested curriculum tree" })
  getClass(@Param("classId") classId: string) {
    return this.curriculum.getClass(classId);
  }

  @Get("subjects/:subjectId")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get a subject with chapters and sections" })
  getSubject(@Param("subjectId") subjectId: string) {
    return this.curriculum.getSubject(subjectId);
  }

  @Get("chapters/:chapterId")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get a chapter with sections" })
  getChapter(@Param("chapterId") chapterId: string) {
    return this.curriculum.getChapter(chapterId);
  }

  @Get("sections/:sectionId")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get a section" })
  getSection(@Param("sectionId") sectionId: string) {
    return this.curriculum.getSection(sectionId);
  }
}
