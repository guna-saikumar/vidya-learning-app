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
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { ApiZodBody } from "../common/zod-openapi";
import { ZodValidationPipe } from "../common/zod-validation.pipe";
import { AuthService } from "./auth.service";
import { JwtAuthGuard, type AuthedRequest } from "./jwt.guard";
import {
  loginBodySchema,
  refreshBodySchema,
  type LoginBody,
  type RefreshBody,
} from "./schemas";

/**
 * Student-facing auth under `/api/v1/auth`.
 *
 * Students do NOT self-register. Accounts are provisioned by the school.
 * Access tokens are short-lived (15m); refresh tokens (30d) rotate on use.
 */
@ApiTags("auth")
@Controller("api/v1/auth")
export class AuthController {
  constructor(@Inject(AuthService) private readonly auth: AuthService) {}

  @Post("login")
  @HttpCode(200)
  @ApiOperation({
    summary: "Student login (email/password)",
    description:
      "Returns `{ accessToken, refreshToken, user: { id, email } }`. " +
      "No public registration; credentials are issued by the school.",
  })
  @ApiZodBody(loginBodySchema)
  login(
    @Body(new ZodValidationPipe(loginBodySchema)) body: LoginBody
  ) {
    return this.auth.login(body);
  }

  @Post("refresh")
  @HttpCode(200)
  @ApiOperation({
    summary: "Rotate refresh token",
    description:
      "Exchanges a valid refresh token for a new `{ accessToken, refreshToken }`. " +
      "The presented refresh token is revoked.",
  })
  @ApiZodBody(refreshBodySchema)
  refresh(
    @Body(new ZodValidationPipe(refreshBodySchema)) body: RefreshBody
  ) {
    return this.auth.refresh(body.refreshToken);
  }

  @Post("logout")
  @HttpCode(200)
  @ApiOperation({ summary: "Revoke a refresh token" })
  @ApiZodBody(refreshBodySchema)
  logout(
    @Body(new ZodValidationPipe(refreshBodySchema)) body: RefreshBody
  ) {
    return this.auth.logout(body.refreshToken);
  }

  @Get("me")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: "Current authenticated student",
    description: "Returns `{ user: { id, email }, isOnboarded }`.",
  })
  me(@Req() req: AuthedRequest) {
    return this.auth.me(req.user!.sub);
  }
}
