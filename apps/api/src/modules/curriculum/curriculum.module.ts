import { Module } from "@nestjs/common";
import { CurriculumController } from "../../curriculum/curriculum.controller";

@Module({
  controllers: [CurriculumController],
})
export class CurriculumModule {}
