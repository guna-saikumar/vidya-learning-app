import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";
import type {
  CreateTaskInput,
  TaskListQuery,
  UpdateTaskInput,
} from "./tasks.schemas";

type TaskRow = Prisma.TaskGetPayload<object>;

/** DB `in_progress` → mobile `in-progress`. */
const statusOut = (s: TaskRow["status"]) =>
  s === "in_progress" ? "in-progress" : s;

export const toTaskDto = (t: TaskRow) => ({
  id: t.id,
  title: t.title,
  description: t.description,
  type: t.type,
  status: statusOut(t.status),
  priority: t.priority,
  subjectId: t.subjectId,
  subjectName: t.subjectName,
  classId: t.classId,
  chapterId: t.chapterId,
  chapterTitle: t.chapterTitle,
  assigneeUserId: t.assigneeUserId,
  dueDate: t.dueDate?.toISOString() ?? null,
  estimatedMinutes: t.estimatedMinutes,
  totalQuestions: t.totalQuestions,
  completedQuestions: t.completedQuestions,
  score: t.score,
  maxScore: t.maxScore,
  icon: t.icon,
  createdAt: t.createdAt.toISOString(),
  completedAt: t.completedAt?.toISOString() ?? null,
  updatedAt: t.updatedAt.toISOString(),
});

@Injectable()
export class TasksService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async listMine(userId: string, query: TaskListQuery) {
    const rows = await this.prisma.task.findMany({
      where: {
        assigneeUserId: userId,
        ...(query.status ? { status: query.status } : {}),
      },
      orderBy: [{ dueDate: { sort: "asc", nulls: "last" } }, { createdAt: "desc" }],
    });
    return { items: rows.map(toTaskDto) };
  }

  async updateMine(userId: string, id: string, input: UpdateTaskInput) {
    const task = await this.prisma.task.findFirst({
      where: { id, assigneeUserId: userId },
    });
    if (!task) throw new NotFoundException({ error: "Task not found" });

    const data: Prisma.TaskUpdateInput = {};
    if (input.status !== undefined) {
      data.status = input.status;
      data.completedAt = input.status === "completed" ? new Date() : null;
    }
    if (input.completedQuestions !== undefined) {
      data.completedQuestions = input.completedQuestions;
    }
    if (input.score !== undefined) data.score = input.score;
    if (input.maxScore !== undefined) data.maxScore = input.maxScore;

    const row = await this.prisma.task.update({ where: { id }, data });
    return toTaskDto(row);
  }

  async createAdmin(input: CreateTaskInput) {
    const [subject, chapter, cls, assignee] = await Promise.all([
      input.subjectId
        ? this.prisma.subject.findUnique({ where: { id: input.subjectId } })
        : null,
      input.chapterId
        ? this.prisma.chapter.findUnique({ where: { id: input.chapterId } })
        : null,
      input.classId
        ? this.prisma.schoolClass.findUnique({ where: { id: input.classId } })
        : null,
      input.assigneeUserId
        ? this.prisma.user.findUnique({ where: { id: input.assigneeUserId } })
        : null,
    ]);
    if (input.subjectId && !subject) {
      throw new NotFoundException({ error: "Subject not found" });
    }
    if (input.chapterId && !chapter) {
      throw new NotFoundException({ error: "Chapter not found" });
    }
    if (input.classId && !cls) {
      throw new NotFoundException({ error: "Class not found" });
    }
    if (input.assigneeUserId && (!assignee || assignee.role !== "STUDENT")) {
      throw new NotFoundException({ error: "Student not found" });
    }

    let assigneeIds: string[];
    if (input.assigneeUserId) {
      assigneeIds = [input.assigneeUserId];
    } else {
      const students = await this.prisma.user.findMany({
        where: {
          role: "STUDENT",
          ...(input.classId
            ? { studentProfile: { activeClassId: input.classId } }
            : {}),
        },
        select: { id: true },
      });
      assigneeIds = students.map((s) => s.id);
    }

    const base = {
      title: input.title,
      description: input.description,
      type: input.type,
      priority: input.priority,
      subjectId: input.subjectId ?? null,
      subjectName: subject?.name ?? "",
      classId: input.classId ?? subject?.classId ?? null,
      chapterId: input.chapterId ?? null,
      chapterTitle: chapter?.title ?? null,
      dueDate: input.dueDate ?? null,
      estimatedMinutes: input.estimatedMinutes,
      totalQuestions: input.totalQuestions,
      icon: input.icon,
    };

    const created = await this.prisma.$transaction(
      assigneeIds.map((assigneeUserId) =>
        this.prisma.task.create({ data: { ...base, assigneeUserId } })
      )
    );
    return { created: created.length, items: created.map(toTaskDto) };
  }
}
