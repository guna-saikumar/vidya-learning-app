import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AuthModule } from "./auth/auth.module";
import { DbModule } from "./db/db.module";
import { loadRootEnv, rootEnvFilePaths } from "./env";
import { MailerModule } from "./mailer/mailer.module";
import { AdminModule } from "./modules/admin/admin.module";
import { CurriculumModule } from "./modules/curriculum/curriculum.module";
import { DashboardModule } from "./modules/dashboard/dashboard.module";
import { ExamsModule } from "./modules/exams/exams.module";
import { HealthModule } from "./modules/health/health.module";
import { MaterialsModule } from "./modules/materials/materials.module";
import { MeModule } from "./modules/me/me.module";
import { NotificationsModule } from "./modules/notifications/notifications.module";
import { QuizzesModule } from "./modules/quizzes/quizzes.module";
import { TasksModule } from "./modules/tasks/tasks.module";

loadRootEnv();

/**
 * Root Nest module — feature modules live under `src/modules/*`.
 * Cross-cutting auth/db/mailer stay at `src/{auth,db,mailer}`.
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
    CurriculumModule,
    AdminModule,
    DashboardModule,
    MaterialsModule,
    MeModule,
    QuizzesModule,
    TasksModule,
    NotificationsModule,
    ExamsModule,
  ],
})
export class AppModule {}
