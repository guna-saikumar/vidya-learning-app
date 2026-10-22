import { z } from "zod";

const id = z.string().trim().min(1).max(120);

export const updateProfileSchema = z.object({
  displayName: z.string().trim().min(1).max(120).optional(),
  activeClassId: id.nullish(),
  avatarUrl: z.string().trim().max(4000).optional(),
  studyGoalMinutes: z.number().int().min(1).max(1440).optional(),
});

export const updateChapterProgressSchema = z.object({
  completed: z.boolean().optional(),
  completedSections: z.array(id).max(500).optional(),
  progressPercent: z.number().int().min(0).max(100).optional(),
  /** Optional study time (minutes) to add to today's study stats. */
  studyMinutes: z.number().int().min(0).max(1440).optional(),
});

export const completeSectionSchema = z
  .object({
    minutes: z.number().int().min(0).max(1440).optional(),
  })
  .optional();

export const createBookmarkSchema = z.object({
  chapterId: id,
  sectionId: id.nullish(),
  title: z.string().trim().min(1).max(300),
  subtitle: z.string().trim().max(300).optional(),
  type: z.enum(["chapter", "section", "formula"]).optional(),
  previewText: z.string().trim().max(2000).nullish(),
});

export const studyStatsQuerySchema = z.object({
  range: z
    .string()
    .regex(/^\d{1,3}d$/)
    .default("7d"),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type UpdateChapterProgressInput = z.infer<
  typeof updateChapterProgressSchema
>;
export type CompleteSectionInput = z.infer<typeof completeSectionSchema>;
export type CreateBookmarkInput = z.infer<typeof createBookmarkSchema>;
