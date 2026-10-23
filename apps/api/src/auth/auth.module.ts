import { Module } from "@nestjs/common";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { JwtAuthGuard } from "./jwt.guard";
import { StudentRoleGuard } from "./student-role.guard";

@Module({
  controllers: [AuthController],
  providers: [AuthService, JwtAuthGuard, StudentRoleGuard],
  exports: [AuthService],
})
export class AuthModule {}
