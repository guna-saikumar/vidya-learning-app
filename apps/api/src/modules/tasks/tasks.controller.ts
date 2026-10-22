import {
  Body,
  Controller,
  Get,
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
import { StudentRoleGuard } from "../../auth/student-role.guard";
import { ApiZodBody, ApiZodQueries } from "../../common/zod-openapi";
import { ZodValidationPipe } from "../../common/zod-validation.pipe";
import {
  createTaskSchema,
  taskListQuerySchema,
  updateTaskSchema,
  type CreateTaskInput,
  type TaskListQuery,
  type UpdateTaskInput,
} from "./tasks.schemas";
import { TasksService } from "./tasks.service";

@ApiTags("tasks")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, StudentRoleGuard)
@Controller("api/me/tasks")
export class TasksController {
  constructor(@Inject(TasksService) private readonly tasks: TasksService) {}

  @Get()
  @ApiOperation({ summary: "List my tasks (status uses 'in-progress')" })
  @ApiZodQueries(taskListQuerySchema)
  list(
    @Req() req: AuthedRequest,
    @Query(new ZodValidationPipe(taskListQuerySchema)) query: TaskListQuery
  ) {
    return this.tasks.listMine(req.user!.sub, query);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update my task status/progress" })
  @ApiZodBody(updateTaskSchema)
  update(
    @Req() req: AuthedRequest,
    @Param("id") id: string,
    @Body(new ZodValidationPipe(updateTaskSchema)) body: UpdateTaskInput
  ) {
    return this.tasks.updateMine(req.user!.sub, id, body);
  }
}

@ApiTags("admin-tasks")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, AdminRoleGuard)
@Controller("api/admin/tasks")
export class AdminTasksController {
  constructor(@Inject(TasksService) private readonly tasks: TasksService) {}

  @Post()
  @ApiOperation({
    summary:
      "Create a task for one student, a class (fan-out), or all students",
  })
  @ApiZodBody(createTaskSchema)
  create(@Body(new ZodValidationPipe(createTaskSchema)) body: CreateTaskInput) {
    return this.tasks.createAdmin(body);
  }
}
