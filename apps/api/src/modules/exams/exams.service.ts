import { Inject, Injectable } from "@nestjs/common";
import { DbService } from "../../db/db.service";

type ScheduleRow = {
  id: string;
  classId: string | null;
  subjectName: string;
  title: string;
  examDate: Date;
  startTime: string | null;
  endTime: string | null;
  venue: string | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
};

type ResultRow = {
  id: string;
  userId: string;
  subjectName: string;
  examTitle: string;
  marksObtained: number;
  marksMax: number;
  grade: string | null;
  remarks: string | null;
  publishedAt: Date;
  createdAt: Date;
};

const toScheduleDto = (e: ScheduleRow) => ({
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

const toResultDto = (r: ResultRow) => ({
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
  constructor(@Inject(DbService) private readonly db: DbService) {}

  /** Exams for the student's active class plus school-wide (classId null) exams. */
  async scheduleForStudent(userId: string) {
    const { rows } = await this.db.query<ScheduleRow>(
      `SELECT "id", "classId", "subjectName", "title", "examDate", "startTime", "endTime",
              "venue", "notes", "createdAt", "updatedAt"
         FROM "ExamScheduleItem"
        WHERE "classId" IS NULL
           OR "classId" = (SELECT "activeClassId" FROM "StudentProfile" WHERE "userId" = $1)
        ORDER BY "examDate" ASC`,
      [userId]
    );
    return { items: rows.map(toScheduleDto) };
  }

  async resultsForStudent(userId: string) {
    const { rows } = await this.db.query<ResultRow>(
      `SELECT "id", "userId", "subjectName", "examTitle", "marksObtained", "marksMax",
              "grade", "remarks", "publishedAt", "createdAt"
         FROM "ExamResult"
        WHERE "userId" = $1
        ORDER BY "publishedAt" DESC`,
      [userId]
    );
    return { items: rows.map(toResultDto) };
  }
}
