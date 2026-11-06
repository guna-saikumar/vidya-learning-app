import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import {
  ApiOperation,
  ApiTags,
  ApiBody,
  ApiSecurity,
  ApiBearerAuth,
} from "@nestjs/swagger";
import type { FastifyRequest } from "fastify";
import { ZodValidationPipe } from "../../common/zod-validation.pipe";
import { JwtAuthGuard, type AuthedRequest } from "../../auth/jwt.guard";
import { verifyAccessToken } from "../../auth/jwt";
import { AdminTokenGuard } from "./admin-token.guard";
import {
  createComplaintSchema,
  updateComplaintStatusSchema,
  type CreateComplaintInput,
  type UpdateComplaintStatusInput,
} from "./support.schemas";
import { SupportService } from "./support.service";

@ApiTags("support")
@Controller("api/v1/support")
export class SupportController {
  constructor(
    @Inject(SupportService) private readonly support: SupportService,
    @Inject(ConfigService) private readonly config: ConfigService
  ) {}

  @Post("complaints")
  @ApiOperation({ summary: "File a complaint or support ticket (classes 6–10)" })
  @ApiBody({
    schema: {
      type: "object",
      required: [
        "full_name",
        "class_grade",
        "category",
        "subject",
        "message",
      ],
      properties: {
        full_name: { type: "string", example: "Aarav Sharma" },
        class_grade: { type: "integer", minimum: 6, maximum: 10, example: 9 },
        section: { type: "string", example: "A" },
        roll_number: { type: "string", example: "15" },
        email: { type: "string", example: "aarav@vidya.school" },
        phone: { type: "string", example: "+91 90000 00000" },
        category: {
          type: "string",
          enum: [
            "technical_issue",
            "textbook_access",
            "recorded_classes",
            "attendance",
            "login_account",
            "content_issue",
            "billing_fees",
            "feedback",
            "other",
          ],
        },
        subject: { type: "string", example: "Textbook download not working" },
        message: {
          type: "string",
          example: "I am unable to download chapter notes for Mathematics.",
        },
        source: { type: "string", example: "mobile" },
      },
    },
  })
  create(
    @Req() req: FastifyRequest,
    @Body(new ZodValidationPipe(createComplaintSchema))
    body: CreateComplaintInput
  ) {
    const authHeader = req.headers.authorization;
    let userId: string | undefined;
    if (authHeader?.startsWith("Bearer ")) {
      try {
        const token = authHeader.slice("Bearer ".length).trim();
        const payload = verifyAccessToken(token, this.config);
        userId = payload.sub;
      } catch {
        // Unauthenticated or invalid token, continue without userId
      }
    }
    return this.support.create(body, userId);
  }

  @Get("config")
  @ApiOperation({ summary: "Support desk contact details & operating hours" })
  getConfig() {
    return {
      supportEmail: process.env.SUPPORT_EMAIL ?? "support@vidya.school",
      supportPhone: process.env.SUPPORT_PHONE ?? "+91 98765 43210",
      supportHours: process.env.SUPPORT_HOURS ?? "Mon-Sat, 8:00 AM - 5:00 PM",
    };
  }

  @Get("my-complaints")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "List tickets filed by the logged-in student" })
  myComplaints(@Req() req: AuthedRequest) {
    return this.support.listMine(req.user!.sub);
  }

  @Get("complaints/:ticketRef")
  @ApiOperation({ summary: "Lookup complaint by ticket reference" })
  getByRef(@Param("ticketRef") ticketRef: string) {
    return this.support.getByRef(ticketRef);
  }

  @Get("complaints")
  @UseGuards(AdminTokenGuard)
  @ApiOperation({ summary: "List latest complaints (support admin endpoint)" })
  @ApiSecurity("x-admin-token")
  list() {
    return this.support.listLatest();
  }

  @Patch("complaints/:ticketRef/status")
  @UseGuards(AdminTokenGuard)
  @ApiOperation({ summary: "Update complaint status (support admin endpoint)" })
  @ApiSecurity("x-admin-token")
  updateStatus(
    @Param("ticketRef") ticketRef: string,
    @Body(new ZodValidationPipe(updateComplaintStatusSchema))
    body: UpdateComplaintStatusInput
  ) {
    return this.support.updateStatus(ticketRef, body.status);
  }
}
