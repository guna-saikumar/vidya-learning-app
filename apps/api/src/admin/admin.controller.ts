import {
  Controller,
  Get,
  Headers,
  UnauthorizedException,
  ForbiddenException,
} from "@nestjs/common";
import { ApiHeader, ApiOperation, ApiTags } from "@nestjs/swagger";
import { z } from "zod";
import { hasRole, type UserRole } from "../../../../packages/auth/src";

const adminHeadersSchema = z.object({
  "x-user-id": z.string().min(1),
  "x-user-role": z.enum(["STUDENT", "ADMIN"] as [UserRole, UserRole]),
});

@ApiTags("admin")
@Controller("api/admin")
export class AdminController {
  @Get("ping")
  @ApiOperation({ summary: "Admin auth ping (header-based)" })
  @ApiHeader({ name: "x-user-id", required: true })
  @ApiHeader({ name: "x-user-role", required: true, enum: ["STUDENT", "ADMIN"] })
  ping(
    @Headers()
    headers: Record<string, string | string[] | undefined>
  ) {
    const parseResult = adminHeadersSchema.safeParse(headers);
    if (!parseResult.success) {
      throw new UnauthorizedException({ error: "Unauthorized" });
    }
    const role = parseResult.data["x-user-role"];
    if (
      !hasRole(
        { id: parseResult.data["x-user-id"], name: "unknown", role },
        "ADMIN"
      )
    ) {
      throw new ForbiddenException({ error: "Forbidden" });
    }
    return { ok: true };
  }
}
