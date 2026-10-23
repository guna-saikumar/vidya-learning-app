import {
  Controller,
  Get,
  NotFoundException,
  Param,
  Query,
  UseGuards,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
} from "@nestjs/swagger";
import { AdminRoleGuard } from "../../auth/admin-role.guard";
import { JwtAuthGuard } from "../../auth/jwt.guard";
import { ApiZodQueries } from "../../common/zod-openapi";
import { ZodValidationPipe } from "../../common/zod-validation.pipe";
import { STATIC_MATERIALS } from "../admin/static/fixtures";
import {
  adminMaterialFiltersSchema,
  type AdminMaterialFilters,
} from "./materials.schemas";

@ApiTags("admin-materials")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, AdminRoleGuard)
@Controller("api/admin/materials")
export class AdminMaterialsController {
  @Get()
  @ApiOperation({ summary: "List materials (static fixture)" })
  @ApiZodQueries(adminMaterialFiltersSchema)
  list(
    @Query(new ZodValidationPipe(adminMaterialFiltersSchema))
    query: AdminMaterialFilters
  ) {
    let rows = STATIC_MATERIALS;
    if (query.status) {
      rows = rows.filter((m) => m.status === query.status);
    }
    if (query.classId) {
      rows = rows.filter((m) => m.classId === query.classId);
    }
    if (query.subjectId) {
      rows = rows.filter((m) => m.subjectId === query.subjectId);
    }
    if (query.chapterId) {
      rows = rows.filter((m) => m.chapterId === query.chapterId);
    }
    return rows;
  }

  @Get(":id")
  @ApiOperation({ summary: "Get a material by id (static fixture)" })
  get(@Param("id") id: string) {
    const material = STATIC_MATERIALS.find((m) => m.id === id);
    if (!material) {
      throw new NotFoundException({ error: "Material not found" });
    }
    return material;
  }
}