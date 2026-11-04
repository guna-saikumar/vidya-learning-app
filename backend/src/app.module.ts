import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AuthModule } from "./auth/auth.module";
import { DbModule } from "./db/db.module";
import { loadRootEnv, rootEnvFilePaths } from "./env";
import { MailerModule } from "./mailer/mailer.module";
import { CurriculumModule } from "./modules/curriculum/curriculum.module";
import { HealthModule } from "./modules/health/health.module";
import { NotificationsModule } from "./modules/notifications/notifications.module";
import { SchoolsModule } from "./modules/schools/schools.module";
import { StudentsModule } from "./modules/students/students.module";

loadRootEnv();

/**
 * Root Nest module — feature modules live under `src/modules/*`.
 * Cross-cutting auth/db/mailer stay at `src/{auth,db,mailer}`.
 *
 * API surface (all under `/api/v1`, plus `/health`):
 * auth · students · schools · curriculum · notifications.
 */
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: rootEnvFilePaths(),
    }),
    DbModule,
    MailerModule,
    AuthModule,
    HealthModule,
    StudentsModule,
    SchoolsModule,
    CurriculumModule,
    NotificationsModule,
  ],
})
export class AppModule {}
