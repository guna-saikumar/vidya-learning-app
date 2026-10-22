import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { makeId } from "../../common/ids";
import { PrismaService } from "../../prisma/prisma.service";
import type {
  CreateChapterInput,
  CreateClassInput,
  CreateSectionInput,
  CreateSubjectInput,
  UpdateChapterInput,
  UpdateClassInput,
  UpdateSectionInput,
  UpdateSubjectInput,
} from "./curriculum.schemas";

type SectionRow = Prisma.SectionGetPayload<object>;
type ChapterRow = Prisma.ChapterGetPayload<{
  include: {
    sections: true;
    quizzes: { include: { questions: true } };
  };
}>;
type SubjectRow = Prisma.SubjectGetPayload<{
  include: {
    chapters: {
      include: { sections: true; quizzes: { include: { questions: true } } };
    };
  };
}>;

const byOrder = <T extends { order: number }>(a: T, b: T) => a.order - b.order;

const chapterInclude = {
  sections: { orderBy: { order: "asc" } },
  quizzes: {
    orderBy: { createdAt: "asc" },
    take: 1,
    include: { questions: { orderBy: { order: "asc" }, take: 1 } },
  },
} satisfies Prisma.ChapterInclude;

const subjectInclude = {
  chapters: {
    orderBy: { order: "asc" },
    include: chapterInclude,
  },
} satisfies Prisma.SubjectInclude;

const classInclude = {
  subjects: { orderBy: { order: "asc" }, include: subjectInclude },
} satisfies Prisma.SchoolClassInclude;

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

export const toChapterDto = (c: ChapterRow) => {
  const q = c.quizzes[0]?.questions[0];
  return {
    id: c.id,
    title: c.title,
    description: nullToUndef(c.description),
    order: c.order,
    unitName: nullToUndef(c.unitName),
    durationMinutes: nullToUndef(c.durationMinutes),
    learningGoals: c.learningGoals,
    bannerUrl: nullToUndef(c.bannerUrl),
    sections: [...c.sections].sort(byOrder).map(toSectionDto),
    quiz: q
      ? {
          question: q.question,
          options: q.options,
          correctIndex: q.correctIndex,
          explanation: q.explanation,
        }
      : undefined,
  };
};

export const toSubjectDto = (s: SubjectRow) => ({
  id: s.id,
  name: s.name,
  description: nullToUndef(s.description),
  category: s.category,
  icon: s.icon,
  bannerUrl: nullToUndef(s.bannerUrl),
  chapters: [...s.chapters].sort(byOrder).map(toChapterDto),
});

@Injectable()
export class CurriculumService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  private async assertUnused(
    exists: Promise<unknown>,
    label: string,
    id: string
  ) {
    if (await exists) {
      throw new ConflictException({ error: `${label} "${id}" already exists` });
    }
  }

  // ---------------------------------------------------------------- reads --

  async listClasses() {
    const rows = await this.prisma.schoolClass.findMany({
      orderBy: [{ grade: "asc" }, { id: "asc" }],
      include: classInclude,
    });
    const classes = rows.map((c) => ({
      id: c.id,
      grade: c.grade,
      title: c.title,
      subtitle: c.subtitle,
      badge: c.badge,
      subjects: c.subjects.map(toSubjectDto),
    }));

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
    const c = await this.prisma.schoolClass.findUnique({
      where: { id: classId },
      include: classInclude,
    });
    if (!c) throw new NotFoundException({ error: "Class not found" });
    return {
      id: c.id,
      grade: c.grade,
      title: c.title,
      subtitle: c.subtitle,
      badge: c.badge,
      subjects: c.subjects.map(toSubjectDto),
    };
  }

  async getSubject(subjectId: string) {
    const s = await this.prisma.subject.findUnique({
      where: { id: subjectId },
      include: subjectInclude,
    });
    if (!s) throw new NotFoundException({ error: "Subject not found" });
    return { ...toSubjectDto(s), classId: s.classId };
  }

  async getChapter(chapterId: string) {
    const c = await this.prisma.chapter.findUnique({
      where: { id: chapterId },
      include: { ...chapterInclude, subject: { select: { classId: true } } },
    });
    if (!c) throw new NotFoundException({ error: "Chapter not found" });
    return {
      ...toChapterDto(c),
      subjectId: c.subjectId,
      classId: c.subject.classId,
    };
  }

  async getSection(sectionId: string) {
    const s = await this.prisma.section.findUnique({
      where: { id: sectionId },
      include: {
        chapter: { select: { id: true, subjectId: true, subject: { select: { classId: true } } } },
      },
    });
    if (!s) throw new NotFoundException({ error: "Section not found" });
    return {
      ...toSectionDto(s),
      chapterId: s.chapterId,
      subjectId: s.chapter.subjectId,
      classId: s.chapter.subject.classId,
    };
  }

  // ---------------------------------------------------------------- admin --

  async createClass(input: CreateClassInput) {
    const id = input.id ?? makeId("class", `${input.grade}`);
    await this.assertUnused(
      this.prisma.schoolClass.findUnique({ where: { id } }),
      "Class",
      id
    );
    return this.prisma.schoolClass.create({
      data: {
        id,
        grade: input.grade,
        title: input.title,
        subtitle: input.subtitle,
        badge: input.badge,
      },
    });
  }

  async updateClass(id: string, input: UpdateClassInput) {
    await this.requireClass(id);
    return this.prisma.schoolClass.update({ where: { id }, data: input });
  }

  async deleteClass(id: string) {
    await this.requireClass(id);
    await this.prisma.schoolClass.delete({ where: { id } });
    return { deleted: true, id };
  }

  async createSubject(input: CreateSubjectInput) {
    await this.requireClass(input.classId);
    const id = input.id ?? makeId("subject", input.name);
    await this.assertUnused(
      this.prisma.subject.findUnique({ where: { id } }),
      "Subject",
      id
    );
    const { id: _id, ...rest } = input;
    return this.prisma.subject.create({ data: { ...rest, id } });
  }

  async updateSubject(id: string, input: UpdateSubjectInput) {
    await this.requireSubject(id);
    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.subject.update({ where: { id }, data: input });
      if (input.name !== undefined) {
        await tx.material.updateMany({
          where: { subjectId: id },
          data: { subjectName: input.name },
        });
      }
      return updated;
    });
  }

  async deleteSubject(id: string) {
    await this.requireSubject(id);
    await this.prisma.subject.delete({ where: { id } });
    return { deleted: true, id };
  }

  async createChapter(input: CreateChapterInput) {
    await this.requireSubject(input.subjectId);
    const id = input.id ?? makeId("chapter", input.title);
    await this.assertUnused(
      this.prisma.chapter.findUnique({ where: { id } }),
      "Chapter",
      id
    );
    const { id: _id, ...rest } = input;
    return this.prisma.chapter.create({ data: { ...rest, id } });
  }

  async updateChapter(id: string, input: UpdateChapterInput) {
    await this.requireChapter(id);
    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.chapter.update({ where: { id }, data: input });
      if (input.title !== undefined) {
        await tx.material.updateMany({
          where: { chapterId: id },
          data: { chapterTitle: input.title },
        });
      }
      return updated;
    });
  }

  async deleteChapter(id: string) {
    await this.requireChapter(id);
    await this.prisma.chapter.delete({ where: { id } });
    return { deleted: true, id };
  }

  async createSection(input: CreateSectionInput) {
    await this.requireChapter(input.chapterId);
    const id = input.id ?? makeId("section", input.title);
    await this.assertUnused(
      this.prisma.section.findUnique({ where: { id } }),
      "Section",
      id
    );
    const { id: _id, ...rest } = input;
    return this.prisma.section.create({ data: { ...rest, id } });
  }

  async updateSection(id: string, input: UpdateSectionInput) {
    await this.requireSection(id);
    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.section.update({ where: { id }, data: input });
      if (input.title !== undefined) {
        await tx.material.updateMany({
          where: { sectionId: id },
          data: { sectionTitle: input.title },
        });
      }
      return updated;
    });
  }

  async deleteSection(id: string) {
    await this.requireSection(id);
    await this.prisma.section.delete({ where: { id } });
    return { deleted: true, id };
  }

  private async requireClass(id: string) {
    const row = await this.prisma.schoolClass.findUnique({ where: { id } });
    if (!row) throw new NotFoundException({ error: "Class not found" });
    return row;
  }
  private async requireSubject(id: string) {
    const row = await this.prisma.subject.findUnique({ where: { id } });
    if (!row) throw new NotFoundException({ error: "Subject not found" });
    return row;
  }
  private async requireChapter(id: string) {
    const row = await this.prisma.chapter.findUnique({ where: { id } });
    if (!row) throw new NotFoundException({ error: "Chapter not found" });
    return row;
  }
  private async requireSection(id: string) {
    const row = await this.prisma.section.findUnique({ where: { id } });
    if (!row) throw new NotFoundException({ error: "Section not found" });
    return row;
  }
}
