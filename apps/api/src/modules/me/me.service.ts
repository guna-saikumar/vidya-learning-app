import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { newId } from "../../common/ids";
import { clientQuery, DbService, SQL_NOW_UTC } from "../../db/db.service";
import type {
  CreateBookmarkInput,
  UpdateChapterProgressInput,
  UpdateProfileInput,
} from "./me.schemas";

type ProgressRow = {
  chapterId: string;
  subjectId: string;
  classId: string;
  completed: boolean;
  completedSections: string[] | null;
  progressPercent: number;
  lastAccessed: Date;
};

type BookmarkRow = {
  id: string;
  classId: string;
  subjectId: string;
  chapterId: string;
  sectionId: string | null;
  title: string;
  subtitle: string;
  type: string;
  previewText: string | null;
  dateAdded: Date;
};

type UserRow = { id: string; name: string; email: string };

type ProfileRow = {
  activeClassId: string | null;
  streakDays: number;
  avatarUrl: string;
  studyGoalMinutes: number;
};

type ChapterContext = {
  id: string;
  subjectId: string;
  classId: string;
  sectionIds: string[];
};

const PROGRESS_COLUMNS = `"chapterId", "subjectId", "classId", "completed", "completedSections", "progressPercent", "lastAccessed"`;
const BOOKMARK_COLUMNS = `"id", "classId", "subjectId", "chapterId", "sectionId", "title", "subtitle", "type", "previewText", "dateAdded"`;
const PROFILE_COLUMNS = `"activeClassId", "streakDays", "avatarUrl", "studyGoalMinutes"`;
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
  completedSections: p.completedSections ?? [],
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
  constructor(@Inject(DbService) private readonly db: DbService) {}

  // -------------------------------------------------------------- profile --

  private async loadProfile(userId: string) {
    const user = await this.db.queryOne<UserRow>(
      `SELECT "id", "name", "email" FROM "User" WHERE "id" = $1`,
      [userId]
    );
    if (!user) throw new NotFoundException({ error: "User not found" });

    let profile = await this.db.queryOne<ProfileRow>(
      `SELECT ${PROFILE_COLUMNS} FROM "StudentProfile" WHERE "userId" = $1`,
      [userId]
    );
    if (!profile) {
      // ON CONFLICT covers a concurrent first-load creating the row.
      await this.db.query(
        `INSERT INTO "StudentProfile" ("id", "userId", "updatedAt")
         VALUES ($1, $2, ${SQL_NOW_UTC})
         ON CONFLICT ("userId") DO NOTHING`,
        [newId(), userId]
      );
      profile = (await this.db.queryOne<ProfileRow>(
        `SELECT ${PROFILE_COLUMNS} FROM "StudentProfile" WHERE "userId" = $1`,
        [userId]
      ))!;
    }
    return { user, profile };
  }

  private profileDto(user: UserRow, profile: ProfileRow) {
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
      const cls = await this.db.queryOne(
        `SELECT "id" FROM "SchoolClass" WHERE "id" = $1`,
        [input.activeClassId]
      );
      if (!cls) throw new NotFoundException({ error: "Class not found" });
    }

    const sets: string[] = [`"updatedAt" = ${SQL_NOW_UTC}`];
    const params: unknown[] = [];
    const add = (column: string, value: unknown) => {
      params.push(value);
      sets.push(`"${column}" = $${params.length}`);
    };
    if (input.activeClassId !== undefined) {
      add("activeClassId", input.activeClassId || null);
    }
    if (input.avatarUrl !== undefined) add("avatarUrl", input.avatarUrl);
    if (input.studyGoalMinutes !== undefined) {
      add("studyGoalMinutes", input.studyGoalMinutes);
    }
    params.push(userId);

    const { user, profile } = await this.db.tx(async (client) => {
      const userRes = input.displayName
        ? await clientQuery<UserRow>(
            client,
            `UPDATE "User" SET "name" = $1 WHERE "id" = $2
             RETURNING "id", "name", "email"`,
            [input.displayName, userId]
          )
        : await clientQuery<UserRow>(
            client,
            `SELECT "id", "name", "email" FROM "User" WHERE "id" = $1`,
            [userId]
          );
      const profileRes = await clientQuery<ProfileRow>(
        client,
        `UPDATE "StudentProfile" SET ${sets.join(", ")}
          WHERE "userId" = $${params.length}
        RETURNING ${PROFILE_COLUMNS}`,
        params
      );
      return { user: userRes.rows[0]!, profile: profileRes.rows[0]! };
    });
    return this.profileDto(user, profile);
  }

  // ------------------------------------------------------------- progress --

  async listProgress(userId: string) {
    const { rows } = await this.db.query<ProgressRow>(
      `SELECT ${PROGRESS_COLUMNS} FROM "ChapterProgress"
        WHERE "userId" = $1
        ORDER BY "lastAccessed" DESC`,
      [userId]
    );
    return { items: rows.map(toProgressDto) };
  }

  private async chapterContext(chapterId: string): Promise<ChapterContext> {
    const chapter = await this.db.queryOne<{
      id: string;
      subjectId: string;
      classId: string;
    }>(
      `SELECT c."id", c."subjectId", s."classId"
         FROM "Chapter" c
         JOIN "Subject" s ON s."id" = c."subjectId"
        WHERE c."id" = $1`,
      [chapterId]
    );
    if (!chapter) throw new NotFoundException({ error: "Chapter not found" });
    const { rows } = await this.db.query<{ id: string }>(
      `SELECT "id" FROM "Section" WHERE "chapterId" = $1`,
      [chapterId]
    );
    return { ...chapter, sectionIds: rows.map((r) => r.id) };
  }

  private getProgress(userId: string, chapterId: string) {
    return this.db.queryOne<ProgressRow>(
      `SELECT ${PROGRESS_COLUMNS} FROM "ChapterProgress"
        WHERE "userId" = $1 AND "chapterId" = $2`,
      [userId, chapterId]
    );
  }

  private async saveProgress(
    userId: string,
    chapter: ChapterContext,
    state: {
      completed: boolean;
      completedSections: string[];
      progressPercent: number;
    }
  ) {
    const { rows } = await this.db.query<ProgressRow>(
      `INSERT INTO "ChapterProgress"
         ("id", "userId", "chapterId", "subjectId", "classId", "completed",
          "completedSections", "progressPercent", "lastAccessed", "updatedAt")
       VALUES ($1, $2, $3, $4, $5, $6, $7::text[], $8, ${SQL_NOW_UTC}, ${SQL_NOW_UTC})
       ON CONFLICT ("userId", "chapterId") DO UPDATE SET
         "completed" = EXCLUDED."completed",
         "completedSections" = EXCLUDED."completedSections",
         "progressPercent" = EXCLUDED."progressPercent",
         "lastAccessed" = EXCLUDED."lastAccessed",
         "updatedAt" = EXCLUDED."updatedAt"
       RETURNING ${PROGRESS_COLUMNS}`,
      [
        newId(),
        userId,
        chapter.id,
        chapter.subjectId,
        chapter.classId,
        state.completed,
        state.completedSections,
        state.progressPercent,
      ]
    );
    return rows[0]!;
  }

  async upsertChapterProgress(
    userId: string,
    chapterId: string,
    input: UpdateChapterProgressInput
  ) {
    await this.loadProfile(userId);
    const chapter = await this.chapterContext(chapterId);
    const validSectionIds = new Set(chapter.sectionIds);

    const existing = await this.getProgress(userId, chapterId);

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

    const row = await this.saveProgress(userId, chapter, {
      completed,
      completedSections,
      progressPercent,
    });

    if (input.studyMinutes) await this.addStudyMinutes(userId, input.studyMinutes);
    return toProgressDto(row);
  }

  async completeSection(userId: string, sectionId: string, minutes?: number) {
    await this.loadProfile(userId);
    const section = await this.db.queryOne<{ id: string; chapterId: string }>(
      `SELECT "id", "chapterId" FROM "Section" WHERE "id" = $1`,
      [sectionId]
    );
    if (!section) throw new NotFoundException({ error: "Section not found" });

    const chapter = await this.chapterContext(section.chapterId);
    const existing = await this.getProgress(userId, chapter.id);
    const completedSections = [
      ...new Set([...(existing?.completedSections ?? []), sectionId]),
    ];
    const total = chapter.sectionIds.length || 1;
    const progressPercent = Math.min(
      100,
      Math.round((completedSections.length / total) * 100)
    );
    const completed = progressPercent >= 100;

    const row = await this.saveProgress(userId, chapter, {
      completed,
      completedSections,
      progressPercent,
    });

    if (minutes) await this.addStudyMinutes(userId, minutes);
    return toProgressDto(row);
  }

  // ------------------------------------------------------------ bookmarks --

  async listBookmarks(userId: string) {
    const { rows } = await this.db.query<BookmarkRow>(
      `SELECT ${BOOKMARK_COLUMNS} FROM "Bookmark"
        WHERE "userId" = $1
        ORDER BY "dateAdded" DESC`,
      [userId]
    );
    return { items: rows.map(toBookmarkDto) };
  }

  async createBookmark(userId: string, input: CreateBookmarkInput) {
    await this.loadProfile(userId);
    const chapter = await this.chapterContext(input.chapterId);
    if (input.sectionId) {
      const section = await this.db.queryOne<{ id: string; chapterId: string }>(
        `SELECT "id", "chapterId" FROM "Section" WHERE "id" = $1`,
        [input.sectionId]
      );
      if (!section || section.chapterId !== chapter.id) {
        throw new NotFoundException({ error: "Section not found" });
      }
    }

    const type = input.type ?? (input.sectionId ? "section" : "chapter");
    const existing = await this.db.queryOne<BookmarkRow>(
      `SELECT ${BOOKMARK_COLUMNS} FROM "Bookmark"
        WHERE "userId" = $1 AND "chapterId" = $2
          AND "sectionId" IS NOT DISTINCT FROM $3
          AND "type" = $4
        LIMIT 1`,
      [userId, chapter.id, input.sectionId ?? null, type]
    );
    if (existing) return toBookmarkDto(existing);

    const row = await this.db.queryOne<BookmarkRow>(
      `INSERT INTO "Bookmark"
         ("id", "userId", "classId", "subjectId", "chapterId", "sectionId",
          "title", "subtitle", "type", "previewText")
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING ${BOOKMARK_COLUMNS}`,
      [
        newId(),
        userId,
        chapter.classId,
        chapter.subjectId,
        chapter.id,
        input.sectionId ?? null,
        input.title,
        input.subtitle ?? "",
        type,
        input.previewText ?? null,
      ]
    );
    return toBookmarkDto(row!);
  }

  async deleteBookmark(userId: string, id: string) {
    const { rowCount } = await this.db.query(
      `DELETE FROM "Bookmark" WHERE "id" = $1 AND "userId" = $2`,
      [id, userId]
    );
    if (rowCount === 0) {
      throw new NotFoundException({ error: "Bookmark not found" });
    }
    return { deleted: true, id };
  }

  // ---------------------------------------------------------- study stats --

  private async addStudyMinutes(userId: string, minutes: number) {
    const day = isoDay(startOfUtcDay(new Date()));
    await this.db.query(
      `INSERT INTO "StudySession" ("id", "userId", "day", "minutes")
       VALUES ($1, $2, $3::date, $4)
       ON CONFLICT ("userId", "day") DO UPDATE SET
         "minutes" = "StudySession"."minutes" + EXCLUDED."minutes"`,
      [newId(), userId, day, minutes]
    );
    const streakDays = await this.computeStreak(userId);
    await this.db.query(
      `UPDATE "StudentProfile"
          SET "streakDays" = $1, "updatedAt" = ${SQL_NOW_UTC}
        WHERE "userId" = $2`,
      [streakDays, userId]
    );
  }

  /** Consecutive days with study minutes, ending today (or yesterday). */
  private async computeStreak(userId: string): Promise<number> {
    const { rows } = await this.db.query<{ day: string }>(
      `SELECT "day"::text AS "day" FROM "StudySession"
        WHERE "userId" = $1 AND "minutes" > 0
        ORDER BY "day" DESC
        LIMIT 400`,
      [userId]
    );
    const days = new Set(rows.map((r) => r.day));
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

    const { rows: sessions } = await this.db.query<{
      day: string;
      minutes: number;
    }>(
      `SELECT "day"::text AS "day", "minutes" FROM "StudySession"
        WHERE "userId" = $1 AND "day" >= $2::date AND "day" <= $3::date`,
      [userId, isoDay(from), isoDay(today)]
    );
    const byDay = new Map(sessions.map((s) => [s.day, s.minutes]));

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
