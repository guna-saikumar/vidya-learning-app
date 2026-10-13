import Fastify, { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { getClasses, getCurriculumStats } from "../../../packages/curriculum/src/curriculum.service";
import { hasRole, UserRole } from "../../../packages/auth/src";

const port = Number(process.env.PORT ?? 4000);

const createServer = (): FastifyInstance => {
  const app = Fastify({ logger: true });

  app.get("/health", async () => {
    return { status: "ok" };
  });

  app.get(
    "/api/classes",
    async (_req: FastifyRequest, _res: FastifyReply) => {
      const classes = getClasses();
      const stats = getCurriculumStats();
      return { classes, stats };
    }
  );

  const adminHeadersSchema = z.object({
    "x-user-id": z.string().min(1),
    "x-user-role": z.enum(["STUDENT", "ADMIN"] as [UserRole, UserRole])
  });

  app.get(
    "/api/admin/ping",
    async (req: FastifyRequest, res: FastifyReply) => {
      const parseResult = adminHeadersSchema.safeParse(req.headers);
      if (!parseResult.success) {
        return res.status(401).send({ error: "Unauthorized" });
      }
      const role = parseResult.data["x-user-role"];
      if (!hasRole({ id: parseResult.data["x-user-id"], name: "unknown", role }, "ADMIN")) {
        return res.status(403).send({ error: "Forbidden" });
      }
      return { ok: true };
    }
  );

  return app;
};

if (require.main === module) {
  const app = createServer();
  app
    .listen({ port, host: "0.0.0.0" })
    .then(() => {
      app.log.info(`API listening on port ${port}`);
    })
    .catch((err) => {
      app.log.error(err);
      process.exit(1);
    });
}

export { createServer };
