import { Inject, Injectable } from "@nestjs/common";
import { DbService } from "../../db/db.service";
import type {
  CurriculumOverview,
  StudentDashboardResponse,
} from "./dashboard.types";

type ClassOverviewRow = {
  id: string;
  grade: number;
  title: string;
  subtitle: string;
  badge: string;
  subjectCount: number;
  chapterCount: number;
  sectionCount: number;
};

@Injectable()
export class DashboardService {
  constructor(@Inject(DbService) private readonly db: DbService) {}

  private async curriculumOverview(): Promise<CurriculumOverview> {
    const { rows } = await this.db.query<ClassOverviewRow>(
      `SELECT
         c."id", c."grade", c."title", c."subtitle", c."badge",
         (SELECT COUNT(*)::int FROM "Subject" s WHERE s."classId" = c."id") AS "subjectCount",
         (SELECT COUNT(*)::int FROM "Chapter" ch
            JOIN "Subject" s ON s."id" = ch."subjectId"
           WHERE s."classId" = c."id") AS "chapterCount",
         (SELECT COUNT(*)::int FROM "Section" se
            JOIN "Chapter" ch ON ch."id" = se."chapterId"
            JOIN "Subject" s ON s."id" = ch."subjectId"
           WHERE s."classId" = c."id") AS "sectionCount"
       FROM "SchoolClass" c
       ORDER BY c."grade" ASC, c."id" ASC`
    );

    const classes = rows.map((c) => ({
      id: c.id,
      grade: c.grade,
      title: c.title,
      subtitle: c.subtitle,
      badge: c.badge,
      subjectCount: c.subjectCount,
      chapterCount: c.chapterCount,
      sectionCount: c.sectionCount,
    }));

    return {
      totalClasses: classes.length,
      totalSubjects: classes.reduce((n, c) => n + c.subjectCount, 0),
      totalChapters: classes.reduce((n, c) => n + c.chapterCount, 0),
      totalSections: classes.reduce((n, c) => n + c.sectionCount, 0),
      classes,
    };
  }

  async getStudentDashboard(userId: string): Promise<StudentDashboardResponse> {
    const user = await this.db.queryOne<{
      id: string;
      name: string;
      email: string;
      role: string;
    }>(`SELECT "id", "name", "email", "role" FROM "User" WHERE "id" = $1`, [
      userId,
    ]);

    return {
      generatedAt: new Date().toISOString(),
      user: {
        id: user?.id ?? userId,
        name: user?.name ?? "Student",
        email: user?.email ?? "",
        role: user?.role ?? "STUDENT",
      },
      curriculum: await this.curriculumOverview(),
    };
  }
}
