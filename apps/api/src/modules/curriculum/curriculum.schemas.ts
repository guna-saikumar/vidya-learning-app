import { z } from "zod";

const idSchema = z.string().trim().min(1).max(120);
const title = z.string().trim().min(1).max(200);
const optionalText = z.string().trim().max(2000);

export const subjectCategorySchema = z.enum([
  "all",
  "stem",
  "languages",
  "social",
]);

export const createClassSchema = z.object({
  id: idSchema.optional(),
  grade: z.number().int().min(1).max(12),
  title,
  subtitle: z.string().trim().max(200).default(""),
  badge: z.string().trim().max(60).default(""),
});
export const updateClassSchema = createClassSchema
  .omit({ id: true })
  .partial();

export const createSubjectSchema = z.object({
  id: idSchema.optional(),
  classId: idSchema,
  name: title,
  description: optionalText.nullish(),
  category: subjectCategorySchema.optional(),
  icon: z.string().trim().min(1).max(60).optional(),
  bannerUrl: z.string().trim().max(2000).nullish(),
  order: z.number().int().min(0).optional(),
});
export const updateSubjectSchema = createSubjectSchema
  .omit({ id: true, classId: true })
  .partial();

export const createChapterSchema = z.object({
  id: idSchema.optional(),
  subjectId: idSchema,
  title,
  description: optionalText.nullish(),
  order: z.number().int().min(0).optional(),
  unitName: z.string().trim().max(200).nullish(),
  durationMinutes: z.number().int().min(0).max(100000).nullish(),
  learningGoals: z.array(z.string().trim().max(500)).max(50).optional(),
  bannerUrl: z.string().trim().max(2000).nullish(),
});
export const updateChapterSchema = createChapterSchema
  .omit({ id: true, subjectId: true })
  .partial();

export const createSectionSchema = z.object({
  id: idSchema.optional(),
  chapterId: idSchema,
  title,
  content: z.string().max(200000).optional(),
  order: z.number().int().min(0).optional(),
  durationMinutes: z.number().int().min(0).max(100000).nullish(),
  summaryPoint: z.string().trim().max(2000).nullish(),
  keyAxiom: z.string().trim().max(2000).nullish(),
});
export const updateSectionSchema = createSectionSchema
  .omit({ id: true, chapterId: true })
  .partial();

export type CreateClassInput = z.infer<typeof createClassSchema>;
export type UpdateClassInput = z.infer<typeof updateClassSchema>;
export type CreateSubjectInput = z.infer<typeof createSubjectSchema>;
export type UpdateSubjectInput = z.infer<typeof updateSubjectSchema>;
export type CreateChapterInput = z.infer<typeof createChapterSchema>;
export type UpdateChapterInput = z.infer<typeof updateChapterSchema>;
export type CreateSectionInput = z.infer<typeof createSectionSchema>;
export type UpdateSectionInput = z.infer<typeof updateSectionSchema>;
