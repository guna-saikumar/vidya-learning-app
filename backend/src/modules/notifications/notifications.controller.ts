import {
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
import { JwtAuthGuard, type AuthedRequest } from "../../auth/jwt.guard";
import { StudentRoleGuard } from "../../auth/student-role.guard";
import { ApiPathParam, ApiZodQueries } from "../../common/zod-openapi";
import { ZodValidationPipe } from "../../common/zod-validation.pipe";
import {
  notificationListQuerySchema,
  type NotificationListQuery,
} from "./notifications.schemas";
import { NotificationsService } from "./notifications.service";

@ApiTags("notifications")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, StudentRoleGuard)
@Controller("api/v1/notifications")
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

  // Static path before `:id` so it is never captured as a notification id.
  @Post("read-all")
  @HttpCode(200)
  @ApiOperation({ summary: "Mark all my notifications as read" })
  readAll(@Req() req: AuthedRequest) {
    return this.notifications.markAllRead(req.user!.sub);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get one of my notifications" })
  @ApiPathParam("id", { description: "Notification id" })
  getOne(@Req() req: AuthedRequest, @Param("id") id: string) {
    return this.notifications.getMine(req.user!.sub, id);
  }

  @Patch(":id/read")
  @ApiOperation({ summary: "Mark a notification as read" })
  @ApiPathParam("id", { description: "Notification id" })
  markRead(@Req() req: AuthedRequest, @Param("id") id: string) {
    return this.notifications.markRead(req.user!.sub, id);
  }
}
