import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import type { FastifyReply } from "fastify";

@Catch()
export class HttpErrorFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<FastifyReply>();

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const body = exception.getResponse();
      if (typeof body === "object" && body !== null && "error" in body) {
        res.status(status).send(body);
        return;
      }
      const message =
        typeof body === "string"
          ? body
          : typeof body === "object" &&
              body !== null &&
              "message" in body &&
              typeof (body as { message: unknown }).message === "string"
            ? (body as { message: string }).message
            : "Request failed";
      res.status(status).send({ error: message });
      return;
    }

    // Fastify plugin errors (e.g. multipart limits) carry a 4xx `statusCode`.
    const statusCode = (exception as { statusCode?: unknown } | null)
      ?.statusCode;
    if (
      typeof statusCode === "number" &&
      statusCode >= 400 &&
      statusCode < 500
    ) {
      res.status(statusCode).send({
        error:
          exception instanceof Error ? exception.message : "Request failed",
      });
      return;
    }

    res.status(HttpStatus.INTERNAL_SERVER_ERROR).send({ error: "Internal server error" });
  }
}
