import { Module } from "@nestjs/common";
import { AdminCurriculumController } from "./admin-curriculum.controller";
import { CurriculumController } from "./curriculum.controller";
import { CurriculumService } from "./curriculum.service";

@Module({
  controllers: [CurriculumController, AdminCurriculumController],
  providers: [CurriculumService],
  exports: [CurriculumService],
})
export class CurriculumModule {}
