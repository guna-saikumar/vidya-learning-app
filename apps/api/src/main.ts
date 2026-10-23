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

  app.enableCors();

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
