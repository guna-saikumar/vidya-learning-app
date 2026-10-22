import { z } from "zod";

const id = z.string().trim().min(1).max(120);

export const quizListQuerySchema = z.object({
  chapterId: id.optional(),
});

export const submitAttemptSchema = z.object({
  /** Selected option index per question (use -1 for unanswered). */
  answers: z.array(z.number().int().min(-1).max(50)).max(200),
});

export const quizQuestionInputSchema = z
  .object({
    question: z.string().trim().min(1).max(2000),
    options: z.array(z.string().trim().min(1).max(500)).min(2).max(10),
    correctIndex: z.number().int().min(0),
    explanation: z.string().trim().max(4000).optional(),
  })
  .refine((q) => q.correctIndex < q.options.length, {
    message: "correctIndex out of range",
    path: ["correctIndex"],
  });

export const createQuizSchema = z.object({
  chapterId: id.nullish(),
  title: z.string().trim().min(1).max(200),
  description: z.string().trim().max(4000).nullish(),
  timeLimitMinutes: z.number().int().min(1).max(1440).nullish(),
  questions: z.array(quizQuestionInputSchema).min(1).max(200),
});

export type QuizListQuery = z.infer<typeof quizListQuerySchema>;
export type SubmitAttemptInput = z.infer<typeof submitAttemptSchema>;
export type CreateQuizInput = z.infer<typeof createQuizSchema>;
