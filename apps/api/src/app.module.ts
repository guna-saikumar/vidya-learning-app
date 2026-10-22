import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AuthModule } from "./auth/auth.module";
import {
  applyDatabaseEnvAliases,
  loadRootEnv,
  rootEnvFilePaths,
} from "./env";
import { MailerModule } from "./mailer/mailer.module";
import { AdminModule } from "./modules/admin/admin.module";
import { CurriculumModule } from "./modules/curriculum/curriculum.module";
import { DashboardModule } from "./modules/dashboard/dashboard.module";
import { HealthModule } from "./modules/health/health.module";
import { PrismaModule } from "./prisma/prisma.module";

loadRootEnv();
applyDatabaseEnvAliases();

/**
 * Root Nest module — feature modules live under `src/modules/*`.
 * Cross-cutting auth/prisma/mailer stay at `src/{auth,prisma,mailer}`.
 */
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: rootEnvFilePaths(),
    }),
    PrismaModule,
    MailerModule,
    AuthModule,
    HealthModule,
    CurriculumModule,
    AdminModule,
    DashboardModule,
  ],
})
export class AppModule {}
