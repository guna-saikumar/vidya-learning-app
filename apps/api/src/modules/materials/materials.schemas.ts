import { z } from "zod";

export const materialTypeSchema = z.enum([
  "pdf",
  "video",
  "presentation",
  "notes",
  "image",
  "quiz",
  "external",
]);
export const publicationStatusSchema = z.enum([
  "draft",
  "published",
  "archived",
]);

const id = z.string().trim().min(1).max(120);
const url = z.string().trim().min(1).max(4000);

export const materialFiltersSchema = z.object({
  classId: id.optional(),
  subjectId: id.optional(),
  chapterId: id.optional(),
});

export const adminMaterialFiltersSchema = materialFiltersSchema.extend({
  status: publicationStatusSchema.optional(),
  materialType: materialTypeSchema.optional(),
  q: z.string().trim().max(200).optional(),
  limit: z.coerce.number().int().min(1).max(200).optional(),
  offset: z.coerce.number().int().min(0).optional(),
});

export const createMaterialSchema = z.object({
  title: z.string().trim().min(1).max(200),
  description: z.string().trim().max(4000).nullish(),
  materialType: materialTypeSchema,
  classId: id,
  subjectId: id,
  chapterId: id,
  sectionId: id.nullish(),
  language: z.string().trim().min(1).max(60).optional(),
  displayOrder: z.number().int().min(0).optional(),
  status: publicationStatusSchema.optional(),
  fileUrl: url.nullish(),
  fileName: z.string().trim().max(300).nullish(),
  fileSizeBytes: z.number().int().min(0).nullish(),
  videoUrl: url.nullish(),
  thumbnailUrl: url.nullish(),
  notesContent: z.string().max(500000).nullish(),
  quizData: z.json().nullish(),
});

export const updateMaterialSchema = createMaterialSchema.partial();

export const updateMaterialStatusSchema = z.object({
  status: publicationStatusSchema,
});

export type MaterialFilters = z.infer<typeof materialFiltersSchema>;
export type AdminMaterialFilters = z.infer<typeof adminMaterialFiltersSchema>;
export type CreateMaterialInput = z.infer<typeof createMaterialSchema>;
export type UpdateMaterialInput = z.infer<typeof updateMaterialSchema>;
