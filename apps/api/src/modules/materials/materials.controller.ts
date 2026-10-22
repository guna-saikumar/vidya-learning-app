import { Controller, Get, Inject, Query, UseGuards } from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from "@nestjs/swagger";
import { JwtAuthGuard } from "../../auth/jwt.guard";
import { ZodValidationPipe } from "../../common/zod-validation.pipe";
import { materialFiltersSchema, type MaterialFilters } from "./materials.schemas";
import { MaterialsService } from "./materials.service";

@ApiTags("materials")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("api/materials")
export class MaterialsController {
  constructor(
    @Inject(MaterialsService) private readonly materials: MaterialsService
  ) {}

  @Get()
  @ApiOperation({ summary: "List published study materials" })
  @ApiQuery({ name: "classId", required: false })
  @ApiQuery({ name: "subjectId", required: false })
  @ApiQuery({ name: "chapterId", required: false })
  list(
    @Query(new ZodValidationPipe(materialFiltersSchema)) query: MaterialFilters
  ) {
    return this.materials.listPublished(query);
  }
}
