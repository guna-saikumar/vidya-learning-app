import "reflect-metadata";
import fastifyMultipart from "@fastify/multipart";
import fastifyStatic from "@fastify/static";
import { NestFactory } from "@nestjs/core";
import {
  FastifyAdapter,
  NestFastifyApplication,
} from "@nestjs/platform-fastify";
import { AppModule } from "./app.module";
import { HttpErrorFilter } from "./common/http-exception.filter";
import { ensureUploadsDirs, UPLOADS_URL_PREFIX } from "./common/uploads";
import { setupApiDocs } from "./docs";
import { loadRootEnv } from "./env";

loadRootEnv();

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({ logger: true })
  );

  // Fastify's CORS defaults only allow GET/HEAD/POST. The mobile web build
  // needs DELETE (bookmark removal) and PUT/PATCH (progress/profile updates),
  // otherwise the browser blocks the request during preflight and Axios
  // reports it as a network failure.
  app.enableCors({
    origin: true,
    methods: ["GET", "HEAD", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Accept"],
  });

  // Profile photos: multipart uploads (single image, <= 5 MB) + static /uploads/*.
  // (Plugin typings resolve a second fastify copy, hence the casts.)
  await app.register(fastifyMultipart as never, {
    limits: { fileSize: 5 * 1024 * 1024, files: 1 },
  });
  await app.register(fastifyStatic as never, {
    root: ensureUploadsDirs(),
    prefix: `${UPLOADS_URL_PREFIX}/`,
    decorateReply: false,
  });

  app.useGlobalFilters(new HttpErrorFilter());
  setupApiDocs(app);

  const port = Number(process.env.PORT ?? 4000);
  await app.listen(port, "0.0.0.0");
}

bootstrap().catch((err) => {
  console.error(err);
  process.exit(1);
});
