import { Module } from "@nestjs/common";
import { AdminTasksController, TasksController } from "./tasks.controller";
import { TasksService } from "./tasks.service";

@Module({
  controllers: [TasksController, AdminTasksController],
  providers: [TasksService],
  exports: [TasksService],
})
export class TasksModule {}
