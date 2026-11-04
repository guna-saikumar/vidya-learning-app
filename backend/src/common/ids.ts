import { randomBytes } from "node:crypto";

export const slugify = (value: string): string =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);

/** Human-friendly unique id for curriculum rows whose PK is a string (no DB default). */
export const makeId = (prefix: string, label: string): string => {
  const slug = slugify(label) || "item";
  return `${prefix}-${slug}-${randomBytes(3).toString("hex")}`;
};

/** Opaque unique id for rows whose PK has no DB default (Prisma's cuid default was client-side). */
export const newId = (): string =>
  `c${Date.now().toString(36)}${randomBytes(8).toString("hex")}`;
