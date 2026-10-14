import { Inject, Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import nodemailer, { type Transporter } from "nodemailer";

export type SendMailOpts = {
  to: string;
  subject: string;
  text: string;
};

/**
 * Nodemailer mailer — kept for future admin/notifications.
 * Student auth does not send OTP emails (no self-register / forgot-password).
 */
@Injectable()
export class MailerService {
  private readonly logger = new Logger(MailerService.name);
  private readonly transporter: Transporter | null;
  private readonly from: string;

  constructor(@Inject(ConfigService) private readonly config: ConfigService) {
    const host = this.config.get<string>("SMTP_HOST");
    const port = Number(this.config.get<string>("SMTP_PORT") ?? 1025);
    const user = this.config.get<string>("SMTP_USER");
    const pass = this.config.get<string>("SMTP_PASS");
    this.from =
      this.config.get<string>("SMTP_FROM") ?? "Vidya <noreply@vidya.local>";

    if (!host) {
      this.transporter = null;
      return;
    }

    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: user && pass ? { user, pass } : undefined,
    });
  }

  async sendMail(opts: SendMailOpts): Promise<void> {
    if (!this.transporter) {
      this.logger.log(`[mailer:console] ${JSON.stringify(opts)}`);
      return;
    }
    await this.transporter.sendMail({
      from: this.from,
      to: opts.to,
      subject: opts.subject,
      text: opts.text,
    });
  }

  async sendOtpEmail(opts: {
    to: string;
    otp: string;
    purpose: "VERIFY_EMAIL" | "RESET_PASSWORD";
  }): Promise<void> {
    const isVerify = opts.purpose === "VERIFY_EMAIL";
    const subject = isVerify
      ? "Verify your Vidya account"
      : "Reset your Vidya password";
    const action = isVerify ? "verify your email" : "reset your password";
    const text = [
      `Your Vidya one-time code is: ${opts.otp}`,
      "",
      `Use this code to ${action}.`,
      "It expires in 10 minutes and can be used only once.",
      "",
      "If you did not request this, you can ignore this email.",
    ].join("\n");

    await this.sendMail({ to: opts.to, subject, text });
  }
}
