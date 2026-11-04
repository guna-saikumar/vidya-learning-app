import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { DbService } from "../../db/db.service";

type ClassRow = {
  id: string;
  grade: number;
  title: string;
  subtitle: string;
  badge: string;
  subjectsCount: number;
  chaptersCount: number;
};

type SubjectRow = {
  id: string;
  classId: string;
  name: string;
  description: string | null;
  category: string;
  icon: string;
  bannerUrl: string | null;
  order: number;
  chapterCount: number;
  durationMinutes: number;
};

type ChapterRow = {
  id: string;
  subjectId: string;
  title: string;
  description: string | null;
  order: number;
  unitName: string | null;
  durationMinutes: number | null;
  learningGoals: string[] | null;
  bannerUrl: string | null;
  pdfUrl: string | null;
  sectionCount: number;
};

type SectionRow = {
  id: string;
  chapterId: string;
  title: string;
  content: string;
  order: number;
  durationMinutes: number | null;
  summaryPoint: string | null;
  keyAxiom: string | null;
  keyPoints: string[] | null;
  diagrams: unknown;
};

const nullToUndef = <T>(v: T | null): T | undefined => v ?? undefined;

export const toSectionDto = (s: SectionRow) => ({
  id: s.id,
  chapterId: s.chapterId,
  title: s.title,
  contentMarkdown: s.content,
  order: s.order,
  durationMinutes: nullToUndef(s.durationMinutes),
  summaryPoint: nullToUndef(s.summaryPoint),
  keyAxiom: nullToUndef(s.keyAxiom),
  keyPoints: s.keyPoints ?? [],
  diagrams: Array.isArray(s.diagrams) ? s.diagrams : [],
});

const toChapterSummaryDto = (c: ChapterRow) => ({
  id: c.id,
  subjectId: c.subjectId,
  title: c.title,
  description: nullToUndef(c.description),
  order: c.order,
  unitName: nullToUndef(c.unitName),
  durationMinutes: nullToUndef(c.durationMinutes),
  bannerUrl: nullToUndef(c.bannerUrl),
  pdfUrl: nullToUndef(c.pdfUrl),
  sectionCount: c.sectionCount,
});

/** Stable display code derived from the id, e.g. `c8-maths` → `C8-MATHS`. */
const subjectCode = (id: string) => id.toUpperCase();

const toSubjectSummaryDto = (s: SubjectRow) => ({
  id: s.id,
  classId: s.classId,
  title: s.name,
  code: subjectCode(s.id),
  description: nullToUndef(s.description),
  category: s.category,
  icon: s.icon,
  bannerUrl: nullToUndef(s.bannerUrl),
  order: s.order,
  totalChapters: s.chapterCount,
  estimatedHours: Math.round((s.durationMinutes / 60) * 10) / 10,
});

const SUBJECT_SELECT = `
  SELECT s."id", s."classId", s."name", s."description", s."category", s."icon",
         s."bannerUrl", s."order",
         (SELECT COUNT(*)::int FROM "Chapter" c WHERE c."subjectId" = s."id") AS "chapterCount",
         (SELECT COALESCE(SUM(c."durationMinutes"), 0)::int FROM "Chapter" c WHERE c."subjectId" = s."id") AS "durationMinutes"
    FROM "Subject" s`;

const CHAPTER_SELECT = `
  SELECT c."id", c."subjectId", c."title", c."description", c."order", c."unitName",
         c."durationMinutes", c."learningGoals", c."bannerUrl", c."pdfUrl",
         (SELECT COUNT(*)::int FROM "Section" se WHERE se."chapterId" = c."id") AS "sectionCount"
    FROM "Chapter" c`;

@Injectable()
export class CurriculumService {
  constructor(@Inject(DbService) private readonly db: DbService) {}

  /** GET /curriculum/classes */
  async listClasses() {
    const { rows } = await this.db.query<ClassRow>(
      `SELECT sc."id", sc."grade", sc."title", sc."subtitle", sc."badge",
              (SELECT COUNT(*)::int FROM "Subject" s WHERE s."classId" = sc."id") AS "subjectsCount",
              (SELECT COUNT(*)::int FROM "Chapter" c
                 JOIN "Subject" s ON s."id" = c."subjectId"
                WHERE s."classId" = sc."id") AS "chaptersCount"
         FROM "SchoolClass" sc
        ORDER BY sc."grade" ASC, sc."id" ASC`
    );
    return rows.map((c) => ({
      id: c.id,
      grade: c.grade,
      title: c.title,
      subtitle: c.subtitle,
      badge: c.badge,
      subjectsCount: c.subjectsCount,
      chaptersCount: c.chaptersCount,
    }));
  }

  /** GET /curriculum/classes/:classId/subjects */
  async listSubjectsForClass(classId: string) {
    const cls = await this.db.queryOne<{ id: string }>(
      `SELECT "id" FROM "SchoolClass" WHERE "id" = $1`,
      [classId]
    );
    if (!cls) throw new NotFoundException({ error: "Class not found" });

    const { rows } = await this.db.query<SubjectRow>(
      `${SUBJECT_SELECT} WHERE s."classId" = $1 ORDER BY s."order" ASC, s."id" ASC`,
      [classId]
    );
    return rows.map(toSubjectSummaryDto);
  }

  /** GET /curriculum/subjects/:subjectId */
  async getSubject(subjectId: string) {
    const subject = await this.db.queryOne<SubjectRow>(
      `${SUBJECT_SELECT} WHERE s."id" = $1`,
      [subjectId]
    );
    if (!subject) throw new NotFoundException({ error: "Subject not found" });

    const { rows: chapters } = await this.db.query<ChapterRow>(
      `${CHAPTER_SELECT} WHERE c."subjectId" = $1 ORDER BY c."order" ASC, c."id" ASC`,
      [subjectId]
    );
    return {
      ...toSubjectSummaryDto(subject),
      chapters: chapters.map(toChapterSummaryDto),
    };
  }

  /** GET /curriculum/chapters/:chapterId */
  async getChapter(chapterId: string) {
    const chapter = await this.db.queryOne<ChapterRow & { classId: string }>(
      `SELECT c."id", c."subjectId", c."title", c."description", c."order", c."unitName",
              c."durationMinutes", c."learningGoals", c."bannerUrl", c."pdfUrl",
              0 AS "sectionCount", s."classId"
         FROM "Chapter" c
         JOIN "Subject" s ON s."id" = c."subjectId"
        WHERE c."id" = $1`,
      [chapterId]
    );
    if (!chapter) throw new NotFoundException({ error: "Chapter not found" });

    const { rows: sections } = await this.db.query<SectionRow>(
      `SELECT "id", "chapterId", "title", "content", "order", "durationMinutes",
              "summaryPoint", "keyAxiom", "keyPoints", "diagrams"
         FROM "Section"
        WHERE "chapterId" = $1
        ORDER BY "order" ASC, "id" ASC`,
      [chapterId]
    );

    return {
      id: chapter.id,
      subjectId: chapter.subjectId,
      classId: chapter.classId,
      title: chapter.title,
      description: nullToUndef(chapter.description),
      order: chapter.order,
      unitName: nullToUndef(chapter.unitName),
      durationMinutes: nullToUndef(chapter.durationMinutes),
      learningGoals: chapter.learningGoals ?? [],
      bannerUrl: nullToUndef(chapter.bannerUrl),
      pdfUrl: nullToUndef(chapter.pdfUrl),
      sections: sections.map(toSectionDto),
    };
  }

  /** GET /curriculum/sections/:sectionId */
  async getSection(sectionId: string) {
    const row = await this.db.queryOne<
      SectionRow & { subjectId: string; classId: string }
    >(
      `SELECT se."id", se."chapterId", se."title", se."content", se."order",
              se."durationMinutes", se."summaryPoint", se."keyAxiom",
              se."keyPoints", se."diagrams",
              ch."subjectId", s."classId"
         FROM "Section" se
         JOIN "Chapter" ch ON ch."id" = se."chapterId"
         JOIN "Subject" s ON s."id" = ch."subjectId"
        WHERE se."id" = $1`,
      [sectionId]
    );
    if (!row) throw new NotFoundException({ error: "Section not found" });
    return {
      ...toSectionDto(row),
      subjectId: row.subjectId,
      classId: row.classId,
    };
  }
}
