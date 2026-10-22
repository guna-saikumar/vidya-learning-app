import { z } from "zod";

const id = z.string().trim().min(1).max(120);
const time = z.string().trim().max(20);

export const createExamScheduleSchema = z.object({
  classId: id.nullish(),
  subjectName: z.string().trim().min(1).max(200),
  title: z.string().trim().min(1).max(200),
  examDate: z.coerce.date(),
  startTime: time.nullish(),
  endTime: time.nullish(),
  venue: z.string().trim().max(200).nullish(),
  notes: z.string().trim().max(2000).nullish(),
});

export const createExamResultSchema = z
  .object({
    userId: id,
    subjectName: z.string().trim().min(1).max(200),
    examTitle: z.string().trim().min(1).max(200),
    marksObtained: z.number().min(0),
    marksMax: z.number().positive(),
    grade: z.string().trim().max(20).nullish(),
    remarks: z.string().trim().max(2000).nullish(),
    publishedAt: z.coerce.date().optional(),
  })
  .refine((r) => r.marksObtained <= r.marksMax, {
    message: "marksObtained cannot exceed marksMax",
    path: ["marksObtained"],
  });

export type CreateExamScheduleInput = z.infer<typeof createExamScheduleSchema>;
export type CreateExamResultInput = z.infer<typeof createExamResultSchema>;
