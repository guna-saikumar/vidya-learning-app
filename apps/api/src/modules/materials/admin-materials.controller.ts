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
import { ApiZodBody, ApiZodQueries } from "../../common/zod-openapi";
import { ZodValidationPipe } from "../../common/zod-validation.pipe";
import {
  adminMaterialFiltersSchema,
  createMaterialSchema,
  updateMaterialSchema,
  updateMaterialStatusSchema,
  type AdminMaterialFilters,
  type CreateMaterialInput,
  type UpdateMaterialInput,
} from "./materials.schemas";
import { MaterialsService } from "./materials.service";

@ApiTags("admin-materials")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, AdminRoleGuard)
@Controller("api/admin/materials")
export class AdminMaterialsController {
  constructor(
    @Inject(MaterialsService) private readonly materials: MaterialsService
  ) {}

  @Get()
  @ApiOperation({ summary: "List all materials (any status)" })
  @ApiZodQueries(adminMaterialFiltersSchema)
  list(
    @Query(new ZodValidationPipe(adminMaterialFiltersSchema))
    query: AdminMaterialFilters
  ) {
    return this.materials.listAdmin(query);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get a material by id" })
  get(@Param("id") id: string) {
    return this.materials.getAdmin(id);
  }

  @Post()
  @ApiOperation({
    summary: "Create a material (JSON; fileUrl/videoUrl/notesContent/quizData)",
  })
  @ApiZodBody(createMaterialSchema)
  create(
    @Req() req: AuthedRequest,
    @Body(new ZodValidationPipe(createMaterialSchema)) body: CreateMaterialInput
  ) {
    return this.materials.create(body, {
      id: req.user!.sub,
      name: req.user!.name,
    });
  }

  @Patch(":id/status")
  @ApiOperation({ summary: "Change material publication status" })
  @ApiZodBody(updateMaterialStatusSchema)
  updateStatus(
    @Param("id") id: string,
    @Body(new ZodValidationPipe(updateMaterialStatusSchema))
    body: { status: "draft" | "published" | "archived" }
  ) {
    return this.materials.updateStatus(id, body.status);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update a material" })
  @ApiZodBody(updateMaterialSchema)
  update(
    @Param("id") id: string,
    @Body(new ZodValidationPipe(updateMaterialSchema)) body: UpdateMaterialInput
  ) {
    return this.materials.update(id, body);
  }

  @Delete(":id")
  @HttpCode(200)
  @ApiOperation({ summary: "Delete a material" })
  remove(@Param("id") id: string) {
    return this.materials.remove(id);
  }
}
