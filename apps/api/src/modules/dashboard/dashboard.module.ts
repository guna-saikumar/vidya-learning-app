import { Module } from "@nestjs/common";
import { AdminDashboardController } from "./admin-dashboard.controller";
import { DashboardService } from "./dashboard.service";
import { StudentDashboardController } from "./student-dashboard.controller";

@Module({
  controllers: [AdminDashboardController, StudentDashboardController],
  providers: [DashboardService],
  exports: [DashboardService],
})
export class DashboardModule {}
