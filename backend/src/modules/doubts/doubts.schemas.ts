import { z } from "zod";

const id = z.string().trim().min(1).max(120);

export const doubtFilterSchema = z.enum(["all", "unanswered", "mine"]).default("all");
export type DoubtFilter = z.infer<typeof doubtFilterSchema>;

export const listDoubtsQuerySchema = z.object({
  filter: doubtFilterSchema.optional().default("all"),
  q: z.string().trim().max(200).optional(),
});
export type ListDoubtsQuery = z.infer<typeof listDoubtsQuerySchema>;

export const createDoubtSchema = z.object({
  title: z
    .string()
    .trim()
    .min(8, "Title must be at least 8 characters")
    .max(120, "Title cannot exceed 120 characters"),
  body: z
    .string()
    .trim()
    .min(10, "Body must be at least 10 characters")
    .max(4000, "Body cannot exceed 4000 characters"),
  sectionId: id.optional(),
});
export type CreateDoubtInput = z.infer<typeof createDoubtSchema>;

export const postAnswerSchema = z.object({
  body: z
    .string()
    .trim()
    .min(1, "Answer body cannot be empty")
    .max(4000, "Answer body cannot exceed 4000 characters"),
});
export type PostAnswerInput = z.infer<typeof postAnswerSchema>;

export const resolveDoubtSchema = z.object({
  acceptedAnswerId: id.optional(),
});
export type ResolveDoubtInput = z.infer<typeof resolveDoubtSchema>;

export type DoubtAuthorRole = "student" | "teacher";

export type DoubtAuthor = {
  id: string;
  name: string;
  role: DoubtAuthorRole;
};

export type DoubtAnswerDto = {
  id: string;
  doubtId: string;
  author: DoubtAuthor;
  body: string;
  helpfulCount: number;
  markedHelpfulByMe: boolean;
  isAccepted: boolean;
  createdAt: string;
};

export type DoubtSummaryDto = {
  id: string;
  chapterId: string;
  sectionId?: string;
  title: string;
  preview: string;
  author: DoubtAuthor;
  createdAt: string;
  upvoteCount: number;
  upvotedByMe: boolean;
  answerCount: number;
  hasTeacherAnswer: boolean;
  isResolved: boolean;
};

export type DoubtThreadDto = {
  id: string;
  chapterId: string;
  sectionId?: string;
  title: string;
  body: string;
  author: DoubtAuthor;
  createdAt: string;
  upvoteCount: number;
  upvotedByMe: boolean;
  isResolved: boolean;
  answers: DoubtAnswerDto[];
};
