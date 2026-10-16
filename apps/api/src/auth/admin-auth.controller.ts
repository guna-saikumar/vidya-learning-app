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
import { ZodValidationPipe } from "../common/zod-validation.pipe";
import { AdminAuthService } from "./admin-auth.service";
import { AdminRoleGuard } from "./admin-role.guard";
import { JwtAuthGuard, type AuthedRequest } from "./jwt.guard";
import {
  adminForgotPasswordSchema,
  adminLoginBodySchema,
  adminRegisterSchema,
  adminResetPasswordSchema,
  adminVerifyEmailSchema,
} from "./schemas";

@ApiTags("admin-auth")
@Controller("api/admin/auth")
export class AdminAuthController {
  constructor(
    @Inject(AdminAuthService) private readonly adminAuth: AdminAuthService
  ) {}

  @Post("register")
  @HttpCode(201)
  @ApiOperation({ summary: "Register administrator (sends email OTP)" })
  async register(
    @Body(new ZodValidationPipe(adminRegisterSchema))
    body: { name: string; email: string; password: string; department?: string }
  ) {
    return this.adminAuth.register(body);
  }

  @Post("verify-email")
  @HttpCode(200)
  @ApiOperation({ summary: "Verify admin email with OTP" })
  async verifyEmail(
    @Body(new ZodValidationPipe(adminVerifyEmailSchema))
    body: { email: string; otp: string }
  ) {
    return this.adminAuth.verifyEmail(body);
  }

  @Post("login")
  @HttpCode(200)
  @ApiOperation({ summary: "Admin login with email and password" })
  async login(
    @Body(new ZodValidationPipe(adminLoginBodySchema))
    body: { email: string; password: string }
  ) {
    return this.adminAuth.login(body);
  }

  @Post("forgot-password")
  @HttpCode(200)
  @ApiOperation({ summary: "Request admin password reset OTP" })
  async forgotPassword(
    @Body(new ZodValidationPipe(adminForgotPasswordSchema))
    body: { email: string }
  ) {
    return this.adminAuth.forgotPassword(body);
  }

  @Post("reset-password")
  @HttpCode(200)
  @ApiOperation({ summary: "Reset admin password with OTP" })
  async resetPassword(
    @Body(new ZodValidationPipe(adminResetPasswordSchema))
    body: { email: string; otp: string; newPassword: string }
  ) {
    return this.adminAuth.resetPassword(body);
  }

  @Get("me")
  @UseGuards(JwtAuthGuard, AdminRoleGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Current authenticated admin profile" })
  async me(@Req() req: AuthedRequest) {
    return this.adminAuth.me(req.user!.sub);
  }
}
