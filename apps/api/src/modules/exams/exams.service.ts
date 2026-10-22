import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";
import type {
  CreateExamResultInput,
  CreateExamScheduleInput,
} from "./exams.schemas";

const toScheduleDto = (e: Prisma.ExamScheduleItemGetPayload<object>) => ({
  id: e.id,
  classId: e.classId,
  subjectName: e.subjectName,
  title: e.title,
  examDate: e.examDate.toISOString(),
  startTime: e.startTime,
  endTime: e.endTime,
  venue: e.venue,
  notes: e.notes,
  createdAt: e.createdAt.toISOString(),
  updatedAt: e.updatedAt.toISOString(),
});

const toResultDto = (r: Prisma.ExamResultGetPayload<object>) => ({
  id: r.id,
  userId: r.userId,
  subjectName: r.subjectName,
  examTitle: r.examTitle,
  marksObtained: r.marksObtained,
  marksMax: r.marksMax,
  percentage: r.marksMax > 0 ? Math.round((r.marksObtained / r.marksMax) * 1000) / 10 : 0,
  grade: r.grade,
  remarks: r.remarks,
  publishedAt: r.publishedAt.toISOString(),
  createdAt: r.createdAt.toISOString(),
});

@Injectable()
export class ExamsService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  /** Exams for the student's active class plus school-wide (classId null) exams. */
  async scheduleForStudent(userId: string) {
    const profile = await this.prisma.studentProfile.findUnique({
      where: { userId },
      select: { activeClassId: true },
    });
    const rows = await this.prisma.examScheduleItem.findMany({
      where: {
        OR: [
          { classId: null },
          ...(profile?.activeClassId ? [{ classId: profile.activeClassId }] : []),
        ],
      },
      orderBy: { examDate: "asc" },
    });
    return { items: rows.map(toScheduleDto) };
  }

  async resultsForStudent(userId: string) {
    const rows = await this.prisma.examResult.findMany({
      where: { userId },
      orderBy: { publishedAt: "desc" },
    });
    return { items: rows.map(toResultDto) };
  }

  async createSchedule(input: CreateExamScheduleInput) {
    if (input.classId) {
      const cls = await this.prisma.schoolClass.findUnique({
        where: { id: input.classId },
      });
      if (!cls) throw new NotFoundException({ error: "Class not found" });
    }
    const row = await this.prisma.examScheduleItem.create({
      data: { ...input, classId: input.classId ?? null },
    });
    return toScheduleDto(row);
  }

  async createResult(input: CreateExamResultInput) {
    const user = await this.prisma.user.findUnique({
      where: { id: input.userId },
    });
    if (!user || user.role !== "STUDENT") {
      throw new NotFoundException({ error: "Student not found" });
    }
    const row = await this.prisma.examResult.create({ data: input });
    return toResultDto(row);
  }
}
