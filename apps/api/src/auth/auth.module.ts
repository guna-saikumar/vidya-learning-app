import { Module } from "@nestjs/common";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { AdminAuthController } from "./admin-auth.controller";
import { AdminAuthService } from "./admin-auth.service";
import { JwtAuthGuard } from "./jwt.guard";

@Module({
  controllers: [AuthController, AdminAuthController],
  providers: [AuthService, AdminAuthService, JwtAuthGuard],
  exports: [AuthService, AdminAuthService],
})
export class AuthModule {}
