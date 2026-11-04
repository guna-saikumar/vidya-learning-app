import { mkdirSync } from "node:fs";
import { resolve } from "node:path";

/** Public URL prefix under which uploaded files are served statically. */
export const UPLOADS_URL_PREFIX = "/uploads";

/**
 * Root directory for user uploads. Defaults to `apps/api/uploads` (the API is
 * always started with `apps/api` as cwd); override with `UPLOADS_DIR`.
 */
export const uploadsRoot = (): string =>
  resolve(process.env.UPLOADS_DIR ?? resolve(process.cwd(), "uploads"));

export const avatarsDir = (): string => resolve(uploadsRoot(), "avatars");

/** Creates the uploads tree (idempotent) and returns the root. */
export const ensureUploadsDirs = (): string => {
  mkdirSync(avatarsDir(), { recursive: true });
  return uploadsRoot();
};
