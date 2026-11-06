import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Patch,
  Post,
  UseGuards,
} from "@nestjs/common";
import {
  ApiOperation,
  ApiTags,
  ApiBody,
  ApiSecurity,
} from "@nestjs/swagger";
import { AdminTokenGuard } from "../common/admin-token.guard";
import { ZodValidationPipe } from "../common/zod-validation.pipe";
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
  constructor(@Inject(SupportService) private readonly support: SupportService) {}

  @Post("complaints")
  @ApiOperation({ summary: "File a complaint (classes 6–10)" })
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
        subject: { type: "string", example: "Attendance not marked on 3 Nov" },
        message: {
          type: "string",
          example: "Attendance is missing for maths classes on 3 Nov.",
        },
      },
    },
  })
  create(
    @Body(new ZodValidationPipe(createComplaintSchema))
    body: CreateComplaintInput
  ) {
    return this.support.create(body);
  }

  @Get("config")
  @ApiOperation({ summary: "Public support details shown in the app" })
  config() {
    return {
      supportEmail: process.env.SUPPORT_EMAIL ?? "support@vidya.school",
      supportPhone: process.env.SUPPORT_PHONE ?? "+91 98765 43210",
      supportHours: process.env.SUPPORT_HOURS ?? "Mon-Sat, 8:00 AM - 5:00 PM",
    };
  }

  @Get("complaints")
  @UseGuards(AdminTokenGuard)
  @ApiOperation({ summary: "List latest complaints (staff demo endpoint)" })
  @ApiSecurity("x-admin-token")
  list() {
    return this.support.listLatest();
  }

  @Patch("complaints/:ticketRef/status")
  @UseGuards(AdminTokenGuard)
  @ApiOperation({ summary: "Update complaint status (staff demo endpoint)" })
  @ApiSecurity("x-admin-token")
  updateStatus(
    @Param("ticketRef") ticketRef: string,
    @Body(new ZodValidationPipe(updateComplaintStatusSchema))
    body: UpdateComplaintStatusInput
  ) {
    return this.support.updateStatus(ticketRef, body.status);
  }
}
