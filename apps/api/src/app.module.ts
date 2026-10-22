import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AdminController } from "./admin/admin.controller";
import { AuthModule } from "./auth/auth.module";
import { CurriculumController } from "./curriculum/curriculum.controller";
import {
  applyDatabaseEnvAliases,
  loadRootEnv,
  rootEnvFilePaths,
} from "./env";
import { HealthController } from "./health/health.controller";
import { MailerModule } from "./mailer/mailer.module";
import { PrismaModule } from "./prisma/prisma.module";

loadRootEnv();
applyDatabaseEnvAliases();

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: rootEnvFilePaths(),
    }),
    PrismaModule,
    MailerModule,
    AuthModule,
  ],
  controllers: [HealthController, CurriculumController, AdminController],
})
export class AppModule {}
