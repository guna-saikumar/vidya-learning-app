import { applyDecorators } from "@nestjs/common";
import { ApiBody, ApiParam, ApiQuery } from "@nestjs/swagger";
import { z } from "zod";

type JsonSchema = Record<string, unknown>;

/**
 * Convert a Zod schema to an OpenAPI 3.0 Schema Object suitable for
 * `@ApiBody` / Swagger UI. Zod validates at runtime; Nest Swagger cannot
 * infer shapes from `ZodValidationPipe`, so controllers must decorate
 * bodies/queries explicitly.
 */
export function zodToOpenApiSchema(schema: z.ZodType): JsonSchema {
  // Prefer the *input* shape so transforms/coercion (e.g. "in-progress" →
  // "in_progress", string→date) still document what clients should send.
  const json = z.toJSONSchema(schema, {
    target: "openapi-3.0",
    io: "input",
    unrepresentable: "any",
    override: ({ jsonSchema, zodSchema }) => {
      if (isDateLikeZod(zodSchema)) {
        Object.assign(jsonSchema, { type: "string", format: "date-time" });
      }
    },
  }) as JsonSchema;
  return inlineRefs(json);
}

/** Zod 4 internal def walk — used only to document coerce.date as ISO strings. */
function isDateLikeZod(schema: unknown): boolean {
  const def = (schema as { _zod?: { def?: { type?: string; out?: unknown } } })
    ?._zod?.def;
  if (!def) return false;
  if (def.type === "date") return true;
  if (def.type === "pipe") return isDateLikeZod(def.out);
  return false;
}

function inlineRefs(schema: JsonSchema): JsonSchema {
  const defs = (schema.definitions ?? schema.$defs ?? {}) as Record<
    string,
    JsonSchema
  >;
  const root = structuredClone(schema);
  delete root.$schema;
  delete root.definitions;
  delete root.$defs;

  const resolve = (node: unknown, stack: Set<string>): unknown => {
    if (!node || typeof node !== "object") return node;
    if (Array.isArray(node)) return node.map((item) => resolve(item, stack));

    const obj = node as JsonSchema;
    if (typeof obj.$ref === "string") {
      const match = /^#\/(?:definitions|\$defs)\/(.+)$/.exec(obj.$ref);
      const refName = match?.[1];
      if (refName && defs[refName]) {
        // Recursive JSON Schema (e.g. z.json()) — collapse to a free-form value.
        if (stack.has(refName)) {
          return { nullable: true };
        }
        const next = new Set(stack);
        next.add(refName);
        const { $ref: _ref, ...rest } = obj;
        return resolve({ ...structuredClone(defs[refName]), ...rest }, next);
      }
    }

    const out: JsonSchema = {};
    for (const [key, value] of Object.entries(obj)) {
      out[key] = resolve(value, stack);
    }
    return out;
  };

  return resolve(root, new Set()) as JsonSchema;
}

/** Document a JSON request body from a Zod schema. */
export function ApiZodBody(
  schema: z.ZodType,
  options?: { required?: boolean }
): MethodDecorator {
  return applyDecorators(
    ApiBody({
      required: options?.required ?? true,
      schema: zodToOpenApiSchema(schema),
    })
  );
}

/**
 * Document a path parameter. Nest Swagger does not infer `@Param()` names
 * without the CLI plugin, so every `:param` route must declare this or
 * Swagger UI shows "No parameters" / broken Try it out.
 */
export function ApiPathParam(
  name: string,
  options?: { description?: string; example?: string }
): MethodDecorator {
  return ApiParam({
    name,
    required: true,
    description: options?.description,
    example: options?.example,
    schema: { type: "string", minLength: 1, maxLength: 120 },
  });
}

/**
 * Expand a Zod object schema into individual `@ApiQuery` parameters
 * (for endpoints that bind `@Query()` as a whole object).
 */
export function ApiZodQueries(schema: z.ZodType): MethodDecorator {
  const openApi = zodToOpenApiSchema(schema);
  const properties = (openApi.properties ?? {}) as Record<string, JsonSchema>;
  const required = new Set(
    Array.isArray(openApi.required) ? (openApi.required as string[]) : []
  );

  const decorators = Object.entries(properties).map(([name, prop]) => {
    const schemaProp = { ...prop };
    // Query params are always strings on the wire; keep enum/type hints for UI.
    return ApiQuery({
      name,
      required: required.has(name),
      schema: schemaProp,
    });
  });

  return applyDecorators(...decorators);
}
