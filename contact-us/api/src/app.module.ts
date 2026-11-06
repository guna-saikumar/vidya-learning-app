import { ConfigModule } from "@nestjs/config";
import { Module } from "@nestjs/common";
import { envFilePaths, loadEnv } from "./env";
import { DbModule } from "./db/db.module";
import { SupportModule } from "./support/support.module";
import { HealthModule } from "./modules/health/health.module";

loadEnv();

/**
 * Standalone module. Endpoints (all under /api/v1, plus /health):
 *   POST /api/v1/support/complaints        — file a complaint (public)
 *   GET  /api/v1/support/complaints        — list latest complaints (x-admin-token)
 *   PATCH /api/v1/support/complaints/:ref/status — update status (x-admin-token)
 */
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: envFilePaths() }),
    DbModule,
    HealthModule,
    SupportModule,
  ],
})
export class AppModule {}
