import {
  Controller,
  Get,
  Inject,
  Param,
  Query,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "../../auth/jwt.guard";
import { StudentRoleGuard } from "../../auth/student-role.guard";
import { ApiPathParam, ApiZodQueries } from "../../common/zod-openapi";
import { ZodValidationPipe } from "../../common/zod-validation.pipe";
import {
  schoolListQuerySchema,
  type SchoolListQuery,
} from "./schools.schemas";
import { SchoolsService } from "./schools.service";

@ApiTags("schools")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, StudentRoleGuard)
@Controller("api/v1/schools")
export class SchoolsController {
  constructor(@Inject(SchoolsService) private readonly schools: SchoolsService) {}

  @Get()
  @ApiOperation({ summary: "Search schools (name/UDISE code, district)" })
  @ApiZodQueries(schoolListQuerySchema)
  list(
    @Query(new ZodValidationPipe(schoolListQuerySchema)) query: SchoolListQuery
  ) {
    return this.schools.list(query);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get a school" })
  @ApiPathParam("id", { description: "School id" })
  get(@Param("id") id: string) {
    return this.schools.getById(id);
  }
}
