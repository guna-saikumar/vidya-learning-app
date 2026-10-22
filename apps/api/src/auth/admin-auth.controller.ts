import {
  Body,
  Controller,
  Get,
  HttpCode,
  Inject,
  Patch,
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
import {
  adminChangePasswordSchema,
  adminCreateStudentSchema,
  adminForgotPasswordSchema,
  adminLoginBodySchema,
  adminRegisterSchema,
  adminResetPasswordSchema,
  adminUpdateProfileSchema,
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
  @ApiZodBody(adminRegisterSchema)
  async register(
    @Body(new ZodValidationPipe(adminRegisterSchema))
    body: { name: string; email: string; password: string; department?: string }
  ) {
    return this.adminAuth.register(body);
  }

  @Post("verify-email")
  @HttpCode(200)
  @ApiOperation({ summary: "Verify admin email with OTP" })
  @ApiZodBody(adminVerifyEmailSchema)
  async verifyEmail(
    @Body(new ZodValidationPipe(adminVerifyEmailSchema))
    body: { email: string; otp: string }
  ) {
    return this.adminAuth.verifyEmail(body);
  }

  @Post("login")
  @HttpCode(200)
  @ApiOperation({ summary: "Admin login with email and password" })
  @ApiZodBody(adminLoginBodySchema)
  async login(
    @Body(new ZodValidationPipe(adminLoginBodySchema))
    body: { email: string; password: string }
  ) {
    return this.adminAuth.login(body);
  }

  @Post("forgot-password")
  @HttpCode(200)
  @ApiOperation({ summary: "Request admin password reset OTP" })
  @ApiZodBody(adminForgotPasswordSchema)
  async forgotPassword(
    @Body(new ZodValidationPipe(adminForgotPasswordSchema))
    body: { email: string }
  ) {
    return this.adminAuth.forgotPassword(body);
  }

  @Post("reset-password")
  @HttpCode(200)
  @ApiOperation({ summary: "Reset admin password with OTP" })
  @ApiZodBody(adminResetPasswordSchema)
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
  @Patch("me")
  @UseGuards(JwtAuthGuard, AdminRoleGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Update current admin profile (name, department)" })
  @ApiZodBody(adminUpdateProfileSchema)
  async updateMe(
    @Req() req: AuthedRequest,
    @Body(new ZodValidationPipe(adminUpdateProfileSchema))
    body: { name?: string; department?: string }
  ) {
    return this.adminAuth.updateMe(req.user!.sub, body);
  }

  @Post("change-password")
  @HttpCode(200)
  @UseGuards(JwtAuthGuard, AdminRoleGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Change password for the current admin" })
  @ApiZodBody(adminChangePasswordSchema)
  async changePassword(
    @Req() req: AuthedRequest,
    @Body(new ZodValidationPipe(adminChangePasswordSchema))
    body: { currentPassword: string; newPassword: string }
  ) {
    return this.adminAuth.changePassword(req.user!.sub, body);
  }
}

@ApiTags("admin-students")
@Controller("api/admin/students")
export class AdminStudentsController {
  constructor(
    @Inject(AdminAuthService) private readonly adminAuth: AdminAuthService
  ) {}

  @Post()
  @HttpCode(201)
  @UseGuards(JwtAuthGuard, AdminRoleGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Provision a student account (admin only)" })
  @ApiZodBody(adminCreateStudentSchema)
  async createStudent(
    @Body(new ZodValidationPipe(adminCreateStudentSchema))
    body: {
      email: string;
      name: string;
      password: string;
      activeClassId?: string;
    }
  ) {
    return this.adminAuth.createStudent(body);
  }
}
