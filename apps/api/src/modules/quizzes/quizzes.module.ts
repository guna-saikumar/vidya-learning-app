import { Module } from "@nestjs/common";
import { AdminQuizzesController, QuizzesController } from "./quizzes.controller";
import { QuizzesService } from "./quizzes.service";

@Module({
  controllers: [QuizzesController, AdminQuizzesController],
  providers: [QuizzesService],
  exports: [QuizzesService],
})
export class QuizzesModule {}
