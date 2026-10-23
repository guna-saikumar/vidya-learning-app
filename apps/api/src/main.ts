import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import {
  FastifyAdapter,
  NestFastifyApplication,
} from "@nestjs/platform-fastify";
import { AppModule } from "./app.module";
import { HttpErrorFilter } from "./common/http-exception.filter";
import { setupApiDocs } from "./docs";
import { loadRootEnv } from "./env";

loadRootEnv();

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({ logger: true })
  );

  app.enableCors();
  app.useGlobalFilters(new HttpErrorFilter());
  setupApiDocs(app);

  const port = Number(process.env.PORT ?? 4000);
  await app.listen(port, "0.0.0.0");
}

bootstrap().catch((err) => {
  console.error(err);
  process.exit(1);
});
