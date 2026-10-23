import {
  Body,
  Controller,
  Get,
  HttpCode,
  Inject,
  Post,
  Req,
  UseGuards,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
} from "@nestjs/swagger";
import { ApiZodBody } from "../common/zod-openapi";
import { ZodValidationPipe } from "../common/zod-validation.pipe";
import { AdminAuthService } from "./admin-auth.service";
import { AdminRoleGuard } from "./admin-role.guard";
import { JwtAuthGuard, type AuthedRequest } from "./jwt.guard";
import { adminLoginBodySchema } from "./schemas";

@ApiTags("admin-auth")
@Controller("api/admin/auth")
export class AdminAuthController {
  constructor(
    @Inject(AdminAuthService) private readonly adminAuth: AdminAuthService
  ) {}

  @Post("login")
  @HttpCode(200)
  @ApiOperation({
    summary: "Admin login (static demo credentials — local only)",
  })
  @ApiZodBody(adminLoginBodySchema)
  async login(
    @Body(new ZodValidationPipe(adminLoginBodySchema))
    body: { email: string; password: string }
  ) {
    return this.adminAuth.login(body);
  }

  @Get("me")
  @UseGuards(JwtAuthGuard, AdminRoleGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Current authenticated admin profile (static)" })
  async me(@Req() req: AuthedRequest) {
    return this.adminAuth.me(req.user!);
  }
}
