import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import type { FastifyRequest } from "fastify";
import { verifyAccessToken, type JwtPayload } from "./jwt";

export type AuthedRequest = FastifyRequest & { user?: JwtPayload };

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(@Inject(ConfigService) private readonly config: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<AuthedRequest>();
    const header = req.headers.authorization;
    if (!header?.startsWith("Bearer ")) {
      throw new UnauthorizedException({ error: "Unauthorized" });
    }
    const token = header.slice("Bearer ".length).trim();
    if (!token) {
      throw new UnauthorizedException({ error: "Unauthorized" });
    }
    try {
      req.user = verifyAccessToken(token, this.config);
      return true;
    } catch {
      throw new UnauthorizedException({ error: "Unauthorized" });
    }
  }
}
