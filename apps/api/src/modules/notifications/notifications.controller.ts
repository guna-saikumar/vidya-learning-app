import {
  Body,
  Controller,
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
import { StudentRoleGuard } from "../../auth/student-role.guard";
import { ApiZodBody, ApiZodQueries } from "../../common/zod-openapi";
import { ZodValidationPipe } from "../../common/zod-validation.pipe";
import {
  createNotificationSchema,
  notificationListQuerySchema,
  type CreateNotificationInput,
  type NotificationListQuery,
} from "./notifications.schemas";
import { NotificationsService } from "./notifications.service";

@ApiTags("notifications")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, StudentRoleGuard)
@Controller("api/me/notifications")
export class NotificationsController {
  constructor(
    @Inject(NotificationsService)
    private readonly notifications: NotificationsService
  ) {}

  @Get()
  @ApiOperation({ summary: "List my notifications" })
  @ApiZodQueries(notificationListQuerySchema)
  list(
    @Req() req: AuthedRequest,
    @Query(new ZodValidationPipe(notificationListQuerySchema))
    query: NotificationListQuery
  ) {
    return this.notifications.listMine(req.user!.sub, query);
  }

  // Declared before ":id/read" so the static segment is matched first.
  @Post("read-all")
  @HttpCode(200)
  @ApiOperation({ summary: "Mark all my notifications as read" })
  readAll(@Req() req: AuthedRequest) {
    return this.notifications.markAllRead(req.user!.sub);
  }

  @Patch(":id/read")
  @ApiOperation({ summary: "Mark a notification as read" })
  markRead(@Req() req: AuthedRequest, @Param("id") id: string) {
    return this.notifications.markRead(req.user!.sub, id);
  }
}

@ApiTags("admin-notifications")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, AdminRoleGuard)
@Controller("api/admin/notifications")
export class AdminNotificationsController {
  constructor(
    @Inject(NotificationsService)
    private readonly notifications: NotificationsService
  ) {}

  @Post()
  @ApiOperation({
    summary:
      "Send a notification to one user (userId), a class (classId), or all students",
  })
  @ApiZodBody(createNotificationSchema)
  create(
    @Body(new ZodValidationPipe(createNotificationSchema))
    body: CreateNotificationInput
  ) {
    return this.notifications.createAdmin(body);
  }
}
