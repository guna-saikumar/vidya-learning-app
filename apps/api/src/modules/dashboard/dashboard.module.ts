import { Module } from "@nestjs/common";
import { DashboardService } from "./dashboard.service";
import { StudentDashboardController } from "./student-dashboard.controller";

@Module({
  controllers: [StudentDashboardController],
  providers: [DashboardService],
  exports: [DashboardService],
})
export class DashboardModule {}
