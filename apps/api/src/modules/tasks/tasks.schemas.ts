import { z } from "zod";

const id = z.string().trim().min(1).max(120);

/** Mobile uses "in-progress"; DB enum is `in_progress`. Both are accepted on input. */
export const taskStatusInputSchema = z
  .enum(["pending", "in-progress", "in_progress", "completed", "overdue"])
  .transform((s) => (s === "in-progress" ? "in_progress" : s));

export const taskListQuerySchema = z.object({
  status: taskStatusInputSchema.optional(),
});

export const updateTaskSchema = z.object({
  status: taskStatusInputSchema.optional(),
  completedQuestions: z.number().int().min(0).max(10000).nullish(),
  score: z.number().int().min(0).max(100000).nullish(),
  maxScore: z.number().int().min(0).max(100000).nullish(),
});

export const createTaskSchema = z.object({
  title: z.string().trim().min(1).max(200),
  description: z.string().trim().max(4000).optional(),
  type: z.enum(["quiz", "assignment", "practice", "revision"]),
  priority: z.enum(["high", "medium", "low"]).optional(),
  subjectId: id.nullish(),
  classId: id.nullish(),
  chapterId: id.nullish(),
  /** Single student target. Without it, fans out to the class (or all students). */
  assigneeUserId: id.nullish(),
  dueDate: z.coerce.date().nullish(),
  estimatedMinutes: z.number().int().min(1).max(10000).optional(),
  totalQuestions: z.number().int().min(0).max(10000).nullish(),
  icon: z.string().trim().min(1).max(60).optional(),
});

export type TaskListQuery = z.infer<typeof taskListQuerySchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type CreateTaskInput = z.infer<typeof createTaskSchema>;
