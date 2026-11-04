import { type NestFastifyApplication } from "@nestjs/platform-fastify";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

/**
 * OpenAPI + Swagger UI without @fastify/static.
 * Nest's default SwaggerModule.setup() needs @fastify/static; we serve the UI
 * from a CDN and the OpenAPI JSON from /docs-json instead.
 */
export function setupApiDocs(app: NestFastifyApplication): void {
  const swaggerConfig = new DocumentBuilder()
    .setTitle("Vidya API")
    .setDescription(
      "Vidya student learning API (`/api/v1`). Student-only: login with provisioned " +
        "credentials (no self-registration), JWT access + rotating refresh tokens. " +
        "Modules: auth, students (onboarding, profile, avatar, settings, reading progress, " +
        "bookmarks), schools directory, curriculum (classes → subjects → chapters → sections), " +
        "and notifications. Health checks at /health and /health/db."
    )
    .setVersion("0.1.0")
    .addBearerAuth()
    .addServer("/", "Current host")
    .addServer("http://localhost:4000", "Local")
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  const fastify = app.getHttpAdapter().getInstance();

  fastify.get("/docs-json", async (_request, reply) => {
    return reply.type("application/json").send(document);
  });

  fastify.get("/docs", async (_request, reply) => {
    return reply.type("text/html").send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Vidya API Docs</title>
  <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5.17.14/swagger-ui.css" />
  <style>body { margin: 0; background: #fafafa; }</style>
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://unpkg.com/swagger-ui-dist@5.17.14/swagger-ui-bundle.js" crossorigin></script>
  <script>
    window.ui = SwaggerUIBundle({
      url: '/docs-json',
      dom_id: '#swagger-ui',
      deepLinking: true,
      persistAuthorization: true,
      tryItOutEnabled: true,
      displayRequestDuration: true,
      presets: [SwaggerUIBundle.presets.apis],
      layout: 'BaseLayout',
    });
  </script>
</body>
</html>`);
  });
}
