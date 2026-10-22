import { Module } from "@nestjs/common";
import { AdminExamsController, ExamsController } from "./exams.controller";
import { ExamsService } from "./exams.service";

@Module({
  controllers: [ExamsController, AdminExamsController],
  providers: [ExamsService],
  exports: [ExamsService],
})
export class ExamsModule {}
