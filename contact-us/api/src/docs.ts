import type { INestApplication } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

export function setupApiDocs(app: INestApplication) {
  const config = new DocumentBuilder()
    .setTitle("Vidya Contact API")
    .setDescription("Complaints & Help — local demo for classes 6–10")
    .setVersion("1.0")
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("docs", app, document);
}
