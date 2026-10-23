import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { DbService, SQL_NOW_UTC } from "../../db/db.service";
import type { TaskListQuery, UpdateTaskInput } from "./tasks.schemas";

type TaskRow = {
  id: string;
  title: string;
  description: string;
  type: string;
  status: string;
  priority: string;
  subjectId: string | null;
  subjectName: string;
  classId: string | null;
  chapterId: string | null;
  chapterTitle: string | null;
  assigneeUserId: string | null;
  dueDate: Date | null;
  estimatedMinutes: number;
  totalQuestions: number | null;
  completedQuestions: number | null;
  score: number | null;
  maxScore: number | null;
  icon: string;
  createdAt: Date;
  completedAt: Date | null;
  updatedAt: Date;
};

const TASK_COLUMNS = `"id", "title", "description", "type", "status", "priority", "subjectId",
  "subjectName", "classId", "chapterId", "chapterTitle", "assigneeUserId", "dueDate",
  "estimatedMinutes", "totalQuestions", "completedQuestions", "score", "maxScore", "icon",
  "createdAt", "completedAt", "updatedAt"`;

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
  constructor(@Inject(DbService) private readonly db: DbService) {}

  async listMine(userId: string, query: TaskListQuery) {
    const params: unknown[] = [userId];
    let statusClause = "";
    if (query.status) {
      params.push(query.status);
      statusClause = `AND "status" = $2`;
    }
    const { rows } = await this.db.query<TaskRow>(
      `SELECT ${TASK_COLUMNS} FROM "Task"
        WHERE "assigneeUserId" = $1 ${statusClause}
        ORDER BY "dueDate" ASC NULLS LAST, "createdAt" DESC`,
      params
    );
    return { items: rows.map(toTaskDto) };
  }

  async updateMine(userId: string, id: string, input: UpdateTaskInput) {
    const sets: string[] = [`"updatedAt" = ${SQL_NOW_UTC}`];
    const params: unknown[] = [];
    const add = (column: string, value: unknown) => {
      params.push(value);
      sets.push(`"${column}" = $${params.length}`);
    };
    if (input.status !== undefined) {
      add("status", input.status);
      sets.push(
        input.status === "completed"
          ? `"completedAt" = ${SQL_NOW_UTC}`
          : `"completedAt" = NULL`
      );
    }
    if (input.completedQuestions !== undefined) {
      add("completedQuestions", input.completedQuestions);
    }
    if (input.score !== undefined) add("score", input.score);
    if (input.maxScore !== undefined) add("maxScore", input.maxScore);

    params.push(id, userId);
    const row = await this.db.queryOne<TaskRow>(
      `UPDATE "Task" SET ${sets.join(", ")}
        WHERE "id" = $${params.length - 1} AND "assigneeUserId" = $${params.length}
        RETURNING ${TASK_COLUMNS}`,
      params
    );
    if (!row) throw new NotFoundException({ error: "Task not found" });
    return toTaskDto(row);
  }
}
