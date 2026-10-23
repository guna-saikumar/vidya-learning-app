import {
  Controller,
  Get,
  Inject,
  ServiceUnavailableException,
} from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { DbService } from "../../db/db.service";

@ApiTags("health")
@Controller()
export class HealthController {
  constructor(
    @Inject(DbService) private readonly db: DbService
  ) {}

  @Get("health")
  @ApiOperation({ summary: "Health check" })
  health() {
    return { status: "ok" };
  }

  @Get("health/db")
  @ApiOperation({ summary: "Database connectivity check" })
  async healthDb() {
    try {
      await this.db.query("SELECT 1");
      return {
        status: "ok",
        database: "up",
        branch: process.env.NEON_BRANCH ?? null,
      };
    } catch (err) {
      throw new ServiceUnavailableException({
        status: "error",
        database: "down",
        message: err instanceof Error ? err.message : "database unreachable",
      });
    }
  }
}
