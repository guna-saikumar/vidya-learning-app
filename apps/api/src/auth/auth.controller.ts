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
import { AuthService } from "./auth.service";
import { JwtAuthGuard, type AuthedRequest } from "./jwt.guard";
import {
  forgotPasswordBodySchema,
  loginBodySchema,
  registerBodySchema,
  resetPasswordBodySchema,
  verifyEmailBodySchema,
} from "./schemas";

@ApiTags("auth")
@Controller("api/auth")
export class AuthController {
  constructor(@Inject(AuthService) private readonly auth: AuthService) {}

  @Post("register")
  @ApiOperation({ summary: "Register student (sends email OTP)" })
  async register(
    @Body(new ZodValidationPipe(registerBodySchema))
    body: { name: string; email: string; password: string }
  ) {
    return this.auth.register(body);
  }

  @Post("verify-email")
  @HttpCode(200)
  @ApiOperation({ summary: "Verify email with OTP" })
  async verifyEmail(
    @Body(new ZodValidationPipe(verifyEmailBodySchema))
    body: { email: string; otp: string }
  ) {
    return this.auth.verifyEmail(body);
  }

  @Post("login")
  @HttpCode(200)
  @ApiOperation({ summary: "Login with email and password" })
  async login(
    @Body(new ZodValidationPipe(loginBodySchema))
    body: { email: string; password: string }
  ) {
    return this.auth.login(body);
  }

  @Post("forgot-password")
  @HttpCode(200)
  @ApiOperation({ summary: "Request password reset OTP" })
  async forgotPassword(
    @Body(new ZodValidationPipe(forgotPasswordBodySchema))
    body: { email: string }
  ) {
    return this.auth.forgotPassword(body);
  }

  @Post("reset-password")
  @HttpCode(200)
  @ApiOperation({ summary: "Reset password with OTP" })
  async resetPassword(
    @Body(new ZodValidationPipe(resetPasswordBodySchema))
    body: { email: string; otp: string; newPassword: string }
  ) {
    return this.auth.resetPassword(body);
  }

  @Get("me")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Current authenticated user" })
  async me(@Req() req: AuthedRequest) {
    return this.auth.me(req.user!.sub);
  }
}
