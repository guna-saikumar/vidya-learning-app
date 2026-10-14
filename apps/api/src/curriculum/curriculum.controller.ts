import { Controller, Get } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import {
  getClasses,
  getCurriculumStats,
} from "../../../../packages/curriculum/src/curriculum.service";

@ApiTags("curriculum")
@Controller("api")
export class CurriculumController {
  @Get("classes")
  @ApiOperation({ summary: "List classes and curriculum stats" })
  classes() {
    const classes = getClasses();
    const stats = getCurriculumStats();
    return { classes, stats };
  }
}
