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
import { loginBodySchema } from "./schemas";

/**
 * Student-facing auth.
 *
 * Students do NOT self-register. Accounts are provisioned (admin later).
 * Only login + session (`/me`) are exposed here.
 * Password resets: student contacts admin — no self-serve forgot/reset OTP.
 */
@ApiTags("auth")
@Controller("api/auth")
export class AuthController {
  constructor(@Inject(AuthService) private readonly auth: AuthService) {}

  @Post("login")
  @HttpCode(200)
  @ApiOperation({
    summary: "Student login (email/password)",
    description:
      "No public registration. Credentials are issued by the school/admin. " +
      "Forgot password → contact admin (not handled by this API).",
  })
  async login(
    @Body(new ZodValidationPipe(loginBodySchema))
    body: { email: string; password: string }
  ) {
    return this.auth.login(body);
  }

  @Get("me")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Current authenticated student" })
  async me(@Req() req: AuthedRequest) {
    return this.auth.me(req.user!.sub);
  }
}
