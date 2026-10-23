import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { DbService } from "../../db/db.service";

type ClassRow = {
  id: string;
  grade: number;
  title: string;
  subtitle: string;
  badge: string;
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
};

type QuizPreviewRow = {
  chapterId: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
};

const nullToUndef = <T>(v: T | null): T | undefined => v ?? undefined;

export const toSectionDto = (s: SectionRow) => ({
  id: s.id,
  title: s.title,
  content: s.content,
  order: s.order,
  durationMinutes: nullToUndef(s.durationMinutes),
  summaryPoint: nullToUndef(s.summaryPoint),
  keyAxiom: nullToUndef(s.keyAxiom),
});

export const toChapterDto = (
  c: ChapterRow,
  sections: SectionRow[],
  quiz: QuizPreviewRow | undefined
) => ({
  id: c.id,
  title: c.title,
  description: nullToUndef(c.description),
  order: c.order,
  unitName: nullToUndef(c.unitName),
  durationMinutes: nullToUndef(c.durationMinutes),
  learningGoals: c.learningGoals ?? [],
  bannerUrl: nullToUndef(c.bannerUrl),
  sections: sections.map(toSectionDto),
  quiz: quiz
    ? {
        question: quiz.question,
        options: quiz.options,
        correctIndex: quiz.correctIndex,
        explanation: quiz.explanation,
      }
    : undefined,
});

type ChapterDto = ReturnType<typeof toChapterDto>;

type SubjectDto = {
  id: string;
  name: string;
  description: string | undefined;
  category: string;
  icon: string;
  bannerUrl: string | undefined;
  chapters: ChapterDto[];
};

const groupBy = <T>(items: T[], key: (item: T) => string): Map<string, T[]> => {
  const map = new Map<string, T[]>();
  for (const item of items) {
    const k = key(item);
    const bucket = map.get(k);
    if (bucket) bucket.push(item);
    else map.set(k, [item]);
  }
  return map;
};

@Injectable()
export class CurriculumService {
  constructor(@Inject(DbService) private readonly db: DbService) {}

  // ------------------------------------------------------------- loaders --

  private async loadChapters(chapterRows: ChapterRow[]) {
    if (chapterRows.length === 0) {
      return new Map<string, ChapterDto>();
    }
    const chapterIds = chapterRows.map((c) => c.id);

    const [sections, previews] = await Promise.all([
      this.db.query<SectionRow>(
        `SELECT "id", "chapterId", "title", "content", "order", "durationMinutes",
                "summaryPoint", "keyAxiom"
           FROM "Section"
          WHERE "chapterId" = ANY($1::text[])
          ORDER BY "order" ASC`,
        [chapterIds]
      ),
      // First quiz (by createdAt) per chapter, and that quiz's first question.
      this.db.query<QuizPreviewRow>(
        `SELECT q."chapterId", qq."question", qq."options", qq."correctIndex", qq."explanation"
           FROM (
             SELECT DISTINCT ON ("chapterId") "id", "chapterId"
               FROM "Quiz"
              WHERE "chapterId" = ANY($1::text[])
              ORDER BY "chapterId", "createdAt" ASC
           ) q
           JOIN LATERAL (
             SELECT "question", "options", "correctIndex", "explanation"
               FROM "QuizQuestion"
              WHERE "quizId" = q."id"
              ORDER BY "order" ASC
              LIMIT 1
           ) qq ON true`,
        [chapterIds]
      ),
    ]);

    const sectionsByChapter = groupBy(sections.rows, (s) => s.chapterId);
    const previewByChapter = new Map(
      previews.rows.map((p) => [p.chapterId, p])
    );

    return new Map(
      chapterRows.map((c) => [
        c.id,
        toChapterDto(
          c,
          sectionsByChapter.get(c.id) ?? [],
          previewByChapter.get(c.id)
        ),
      ])
    );
  }

  private async loadSubjectDtos(subjectRows: SubjectRow[]) {
    if (subjectRows.length === 0) {
      return new Map<string, SubjectDto>();
    }
    const { rows: chapterRows } = await this.db.query<ChapterRow>(
      `SELECT "id", "subjectId", "title", "description", "order", "unitName",
              "durationMinutes", "learningGoals", "bannerUrl"
         FROM "Chapter"
        WHERE "subjectId" = ANY($1::text[])
        ORDER BY "order" ASC`,
      [subjectRows.map((s) => s.id)]
    );
    const chapterDtos = await this.loadChapters(chapterRows);
    const chaptersBySubject = groupBy(chapterRows, (c) => c.subjectId);

    return new Map(
      subjectRows.map((s) => [
        s.id,
        this.toSubjectDto(
          s,
          (chaptersBySubject.get(s.id) ?? []).map(
            (c) => chapterDtos.get(c.id)!
          )
        ),
      ])
    );
  }

  private toSubjectDto(s: SubjectRow, chapters: ChapterDto[]): SubjectDto {
    return {
      id: s.id,
      name: s.name,
      description: nullToUndef(s.description),
      category: s.category,
      icon: s.icon,
      bannerUrl: nullToUndef(s.bannerUrl),
      chapters,
    };
  }

  private async subjectsForClasses(classIds: string[]) {
    if (classIds.length === 0) return new Map<string, SubjectRow[]>();
    const { rows } = await this.db.query<SubjectRow>(
      `SELECT "id", "classId", "name", "description", "category", "icon", "bannerUrl", "order"
         FROM "Subject"
        WHERE "classId" = ANY($1::text[])
        ORDER BY "order" ASC`,
      [classIds]
    );
    return groupBy(rows, (s) => s.classId);
  }

  private async classTree(classRows: ClassRow[]) {
    const subjectsByClass = await this.subjectsForClasses(
      classRows.map((c) => c.id)
    );
    const allSubjects = [...subjectsByClass.values()].flat();
    const subjectDtos = await this.loadSubjectDtos(allSubjects);

    return classRows.map((c) => ({
      id: c.id,
      grade: c.grade,
      title: c.title,
      subtitle: c.subtitle,
      badge: c.badge,
      subjects: (subjectsByClass.get(c.id) ?? []).map(
        (s) => subjectDtos.get(s.id)!
      ),
    }));
  }

  // ---------------------------------------------------------------- reads --

  async listClasses() {
    const { rows } = await this.db.query<ClassRow>(
      `SELECT "id", "grade", "title", "subtitle", "badge"
         FROM "SchoolClass"
        ORDER BY "grade" ASC, "id" ASC`
    );
    const classes = await this.classTree(rows);

    const stats = {
      totalClasses: classes.length,
      totalSubjects: 0,
      totalChapters: 0,
      totalSections: 0,
    };
    for (const c of classes) {
      stats.totalSubjects += c.subjects.length;
      for (const s of c.subjects) {
        stats.totalChapters += s.chapters.length;
        for (const ch of s.chapters) stats.totalSections += ch.sections.length;
      }
    }
    return { classes, stats };
  }

  async getClass(classId: string) {
    const row = await this.db.queryOne<ClassRow>(
      `SELECT "id", "grade", "title", "subtitle", "badge"
         FROM "SchoolClass" WHERE "id" = $1`,
      [classId]
    );
    if (!row) throw new NotFoundException({ error: "Class not found" });
    const [tree] = await this.classTree([row]);
    return tree!;
  }

  async getSubject(subjectId: string) {
    const row = await this.db.queryOne<SubjectRow>(
      `SELECT "id", "classId", "name", "description", "category", "icon", "bannerUrl", "order"
         FROM "Subject" WHERE "id" = $1`,
      [subjectId]
    );
    if (!row) throw new NotFoundException({ error: "Subject not found" });
    const dtos = await this.loadSubjectDtos([row]);
    return { ...dtos.get(row.id)!, classId: row.classId };
  }

  async getChapter(chapterId: string) {
    const row = await this.db.queryOne<ChapterRow & { classId: string }>(
      `SELECT c."id", c."subjectId", c."title", c."description", c."order", c."unitName",
              c."durationMinutes", c."learningGoals", c."bannerUrl", s."classId"
         FROM "Chapter" c
         JOIN "Subject" s ON s."id" = c."subjectId"
        WHERE c."id" = $1`,
      [chapterId]
    );
    if (!row) throw new NotFoundException({ error: "Chapter not found" });
    const dtos = await this.loadChapters([row]);
    return {
      ...dtos.get(row.id)!,
      subjectId: row.subjectId,
      classId: row.classId,
    };
  }

  async getSection(sectionId: string) {
    const row = await this.db.queryOne<
      SectionRow & { subjectId: string; classId: string }
    >(
      `SELECT se."id", se."chapterId", se."title", se."content", se."order",
              se."durationMinutes", se."summaryPoint", se."keyAxiom",
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
      chapterId: row.chapterId,
      subjectId: row.subjectId,
      classId: row.classId,
    };
  }
}
