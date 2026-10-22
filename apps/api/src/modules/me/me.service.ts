import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";
import type {
  CreateBookmarkInput,
  UpdateChapterProgressInput,
  UpdateProfileInput,
} from "./me.schemas";

type ProgressRow = Prisma.ChapterProgressGetPayload<object>;
type BookmarkRow = Prisma.BookmarkGetPayload<object>;

const DAY_MS = 24 * 60 * 60 * 1000;

/** UTC midnight for the given instant. */
const startOfUtcDay = (d: Date) =>
  new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
const isoDay = (d: Date) => d.toISOString().slice(0, 10);

const toProgressDto = (p: ProgressRow) => ({
  chapterId: p.chapterId,
  subjectId: p.subjectId,
  classId: p.classId,
  completed: p.completed,
  completedSections: p.completedSections,
  progressPercent: p.progressPercent,
  lastAccessed: p.lastAccessed.getTime(),
});

const toBookmarkDto = (b: BookmarkRow) => ({
  id: b.id,
  classId: b.classId,
  subjectId: b.subjectId,
  chapterId: b.chapterId,
  sectionId: b.sectionId ?? undefined,
  title: b.title,
  subtitle: b.subtitle,
  type: b.type,
  dateAdded: b.dateAdded.getTime(),
  previewText: b.previewText ?? undefined,
});

@Injectable()
export class MeService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  // -------------------------------------------------------------- profile --

  private async loadProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { studentProfile: true },
    });
    if (!user) throw new NotFoundException({ error: "User not found" });
    const profile =
      user.studentProfile ??
      (await this.prisma.studentProfile.create({ data: { userId } }));
    return { user, profile };
  }

  private profileDto(
    user: { id: string; name: string; email: string },
    profile: Prisma.StudentProfileGetPayload<object>
  ) {
    return {
      id: user.id,
      email: user.email,
      displayName: user.name,
      activeClassId: profile.activeClassId ?? "",
      streakDays: profile.streakDays,
      avatarUrl: profile.avatarUrl,
      studyGoalMinutes: profile.studyGoalMinutes,
    };
  }

  async getProfile(userId: string) {
    const { user, profile } = await this.loadProfile(userId);
    return this.profileDto(user, profile);
  }

  async updateProfile(userId: string, input: UpdateProfileInput) {
    await this.loadProfile(userId);
    if (input.activeClassId) {
      const cls = await this.prisma.schoolClass.findUnique({
        where: { id: input.activeClassId },
      });
      if (!cls) throw new NotFoundException({ error: "Class not found" });
    }

    const [updatedUser, profile] = await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: userId },
        data: input.displayName ? { name: input.displayName } : {},
      }),
      this.prisma.studentProfile.update({
        where: { userId },
        data: {
          ...(input.activeClassId === undefined
            ? {}
            : { activeClassId: input.activeClassId || null }),
          ...(input.avatarUrl === undefined ? {} : { avatarUrl: input.avatarUrl }),
          ...(input.studyGoalMinutes === undefined
            ? {}
            : { studyGoalMinutes: input.studyGoalMinutes }),
        },
      }),
    ]);
    return this.profileDto(updatedUser, profile);
  }

  // ------------------------------------------------------------- progress --

  async listProgress(userId: string) {
    const rows = await this.prisma.chapterProgress.findMany({
      where: { userId },
      orderBy: { lastAccessed: "desc" },
    });
    return { items: rows.map(toProgressDto) };
  }

  private async chapterContext(chapterId: string) {
    const chapter = await this.prisma.chapter.findUnique({
      where: { id: chapterId },
      include: {
        subject: { select: { id: true, classId: true } },
        sections: { select: { id: true } },
      },
    });
    if (!chapter) throw new NotFoundException({ error: "Chapter not found" });
    return chapter;
  }

  async upsertChapterProgress(
    userId: string,
    chapterId: string,
    input: UpdateChapterProgressInput
  ) {
    await this.loadProfile(userId);
    const chapter = await this.chapterContext(chapterId);
    const validSectionIds = new Set(chapter.sections.map((s) => s.id));

    const existing = await this.prisma.chapterProgress.findUnique({
      where: { userId_chapterId: { userId, chapterId } },
    });

    const completedSections = input.completedSections
      ? [...new Set(input.completedSections.filter((s) => validSectionIds.has(s)))]
      : (existing?.completedSections ?? []);

    let progressPercent =
      input.progressPercent ??
      (input.completedSections && validSectionIds.size > 0
        ? Math.round((completedSections.length / validSectionIds.size) * 100)
        : (existing?.progressPercent ?? 0));
    let completed = input.completed ?? existing?.completed ?? false;
    if (input.completed === true) progressPercent = 100;
    if (input.completed === undefined && progressPercent >= 100) completed = true;

    const row = await this.prisma.chapterProgress.upsert({
      where: { userId_chapterId: { userId, chapterId } },
      create: {
        userId,
        chapterId,
        subjectId: chapter.subjectId,
        classId: chapter.subject.classId,
        completed,
        completedSections,
        progressPercent,
        lastAccessed: new Date(),
      },
      update: {
        completed,
        completedSections,
        progressPercent,
        lastAccessed: new Date(),
      },
    });

    if (input.studyMinutes) await this.addStudyMinutes(userId, input.studyMinutes);
    return toProgressDto(row);
  }

  async completeSection(userId: string, sectionId: string, minutes?: number) {
    await this.loadProfile(userId);
    const section = await this.prisma.section.findUnique({
      where: { id: sectionId },
      select: { id: true, chapterId: true },
    });
    if (!section) throw new NotFoundException({ error: "Section not found" });

    const chapter = await this.chapterContext(section.chapterId);
    const existing = await this.prisma.chapterProgress.findUnique({
      where: { userId_chapterId: { userId, chapterId: chapter.id } },
    });
    const completedSections = [
      ...new Set([...(existing?.completedSections ?? []), sectionId]),
    ];
    const total = chapter.sections.length || 1;
    const progressPercent = Math.min(
      100,
      Math.round((completedSections.length / total) * 100)
    );
    const completed = progressPercent >= 100;

    const row = await this.prisma.chapterProgress.upsert({
      where: { userId_chapterId: { userId, chapterId: chapter.id } },
      create: {
        userId,
        chapterId: chapter.id,
        subjectId: chapter.subjectId,
        classId: chapter.subject.classId,
        completed,
        completedSections,
        progressPercent,
      },
      update: {
        completed,
        completedSections,
        progressPercent,
        lastAccessed: new Date(),
      },
    });

    if (minutes) await this.addStudyMinutes(userId, minutes);
    return toProgressDto(row);
  }

  // ------------------------------------------------------------ bookmarks --

  async listBookmarks(userId: string) {
    const rows = await this.prisma.bookmark.findMany({
      where: { userId },
      orderBy: { dateAdded: "desc" },
    });
    return { items: rows.map(toBookmarkDto) };
  }

  async createBookmark(userId: string, input: CreateBookmarkInput) {
    await this.loadProfile(userId);
    const chapter = await this.chapterContext(input.chapterId);
    if (input.sectionId) {
      const section = await this.prisma.section.findUnique({
        where: { id: input.sectionId },
      });
      if (!section || section.chapterId !== chapter.id) {
        throw new NotFoundException({ error: "Section not found" });
      }
    }

    const type = input.type ?? (input.sectionId ? "section" : "chapter");
    const existing = await this.prisma.bookmark.findFirst({
      where: {
        userId,
        chapterId: chapter.id,
        sectionId: input.sectionId ?? null,
        type,
      },
    });
    if (existing) return toBookmarkDto(existing);

    const row = await this.prisma.bookmark.create({
      data: {
        userId,
        classId: chapter.subject.classId,
        subjectId: chapter.subjectId,
        chapterId: chapter.id,
        sectionId: input.sectionId ?? null,
        title: input.title,
        subtitle: input.subtitle,
        type,
        previewText: input.previewText,
      },
    });
    return toBookmarkDto(row);
  }

  async deleteBookmark(userId: string, id: string) {
    const row = await this.prisma.bookmark.findFirst({ where: { id, userId } });
    if (!row) throw new NotFoundException({ error: "Bookmark not found" });
    await this.prisma.bookmark.delete({ where: { id } });
    return { deleted: true, id };
  }

  // ---------------------------------------------------------- study stats --

  private async addStudyMinutes(userId: string, minutes: number) {
    const day = startOfUtcDay(new Date());
    await this.prisma.studySession.upsert({
      where: { userId_day: { userId, day } },
      create: { userId, day, minutes },
      update: { minutes: { increment: minutes } },
    });
    const streakDays = await this.computeStreak(userId);
    await this.prisma.studentProfile.update({
      where: { userId },
      data: { streakDays },
    });
  }

  /** Consecutive days with study minutes, ending today (or yesterday). */
  private async computeStreak(userId: string): Promise<number> {
    const sessions = await this.prisma.studySession.findMany({
      where: { userId, minutes: { gt: 0 } },
      orderBy: { day: "desc" },
      take: 400,
      select: { day: true },
    });
    const days = new Set(sessions.map((s) => isoDay(s.day)));
    let cursor = startOfUtcDay(new Date());
    if (!days.has(isoDay(cursor))) cursor = new Date(cursor.getTime() - DAY_MS);
    let streak = 0;
    while (days.has(isoDay(cursor))) {
      streak += 1;
      cursor = new Date(cursor.getTime() - DAY_MS);
    }
    return streak;
  }

  async studyStats(userId: string, range: string) {
    const { profile } = await this.loadProfile(userId);
    const days = Math.min(Math.max(parseInt(range, 10) || 7, 1), 365);
    const today = startOfUtcDay(new Date());
    const from = new Date(today.getTime() - (days - 1) * DAY_MS);

    const sessions = await this.prisma.studySession.findMany({
      where: { userId, day: { gte: from, lte: today } },
    });
    const byDay = new Map(sessions.map((s) => [isoDay(s.day), s.minutes]));

    const daily = Array.from({ length: days }, (_, i) => {
      const date = isoDay(new Date(from.getTime() + i * DAY_MS));
      return { date, minutes: byDay.get(date) ?? 0 };
    });
    const totalMinutes = daily.reduce((sum, d) => sum + d.minutes, 0);

    return {
      range: `${days}d`,
      days,
      totalMinutes,
      averageMinutes: Math.round(totalMinutes / days),
      studyGoalMinutes: profile.studyGoalMinutes,
      goalMetDays: daily.filter((d) => d.minutes >= profile.studyGoalMinutes)
        .length,
      streakDays: await this.computeStreak(userId),
      daily,
    };
  }
}
