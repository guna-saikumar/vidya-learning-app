import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
  PayloadTooLargeException,
  UnsupportedMediaTypeException,
} from "@nestjs/common";
import { createWriteStream } from "node:fs";
import { open, readdir, rename, unlink } from "node:fs/promises";
import { join } from "node:path";
import type { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import { newId } from "../../common/ids";
import {
  avatarsDir,
  ensureUploadsDirs,
  UPLOADS_URL_PREFIX,
} from "../../common/uploads";
import { clientQuery, DbService, SQL_NOW_UTC } from "../../db/db.service";
import type {
  CreateBookmarkInput,
  UpdateOnboardingInput,
  UpdateProfileInput,
  UpdateSettingsInput,
  UpsertProgressInput,
} from "./students.schemas";

/** Allowed avatar mime types → file extension. */
const AVATAR_MIME_EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

/** Magic-byte sniff so a mislabelled non-image can't be stored as an avatar. */
const matchesImageSignature = (head: Buffer, ext: string): boolean => {
  switch (ext) {
    case "jpg":
      return head[0] === 0xff && head[1] === 0xd8 && head[2] === 0xff;
    case "png":
      return head[0] === 0x89 && head.subarray(1, 4).toString("ascii") === "PNG";
    case "gif":
      return head.subarray(0, 4).toString("ascii") === "GIF8";
    case "webp":
      return (
        head.subarray(0, 4).toString("ascii") === "RIFF" &&
        head.subarray(8, 12).toString("ascii") === "WEBP"
      );
    default:
      return false;
  }
};

const fileHasImageSignature = async (path: string, ext: string) => {
  const handle = await open(path, "r");
  try {
    const head = Buffer.alloc(12);
    const { bytesRead } = await handle.read(head, 0, 12, 0);
    return bytesRead >= 4 && matchesImageSignature(head, ext);
  } finally {
    await handle.close();
  }
};

/** Onboarding/profile columns written straight from the request body. */
const FIELD_COLUMNS = [
  "firstName",
  "lastName",
  "gender",
  "dob",
  "villageCity",
  "district",
  "schoolName",
  "grade",
  "section",
  "medium",
  "rollNumber",
  "fatherName",
  "motherName",
  "parentPhone",
] as const;

type ProfileRow = {
  userId: string;
  email: string;
  name: string;
  activeClassId: string | null;
  streakDays: number;
  avatarUrl: string;
  language: string;
  notificationsEnabled: boolean;
  isOnboarded: boolean;
} & Record<(typeof FIELD_COLUMNS)[number], string | null>;

type ProgressRow = {
  chapterId: string;
  completed: boolean;
  progressPercent: number;
  lastAccessed: Date;
  lastSectionId: string | null;
};

type BookmarkRow = {
  id: string;
  chapterId: string;
  chapterTitle: string;
  subjectId: string;
  subjectName: string;
  sectionId: string | null;
  sectionTitle: string | null;
  previewText: string | null;
  dateAdded: Date;
};

type ChapterContext = {
  id: string;
  title: string;
  subjectId: string;
  subjectName: string;
  classId: string;
  sectionIds: string[];
};

const PROFILE_SELECT = `
  SELECT sp."userId", sp."activeClassId", sp."streakDays", sp."avatarUrl",
         sp."firstName", sp."lastName", sp."gender", sp."dob",
         sp."villageCity", sp."district", sp."schoolName",
         sp."grade", sp."section", sp."medium", sp."rollNumber",
         sp."fatherName", sp."motherName", sp."parentPhone",
         sp."language", sp."notificationsEnabled", sp."isOnboarded",
         u."email", u."name"
    FROM "StudentProfile" sp
    JOIN "User" u ON u."id" = sp."userId"
   WHERE sp."userId" = $1`;

const PROGRESS_COLUMNS = `"chapterId", "completed", "progressPercent", "lastAccessed", "lastSectionId"`;

const BOOKMARK_SELECT = `
  SELECT b."id", b."chapterId", ch."title" AS "chapterTitle",
         b."subjectId", s."name" AS "subjectName",
         b."sectionId", se."title" AS "sectionTitle",
         b."previewText", b."dateAdded"
    FROM "Bookmark" b
    JOIN "Chapter" ch ON ch."id" = b."chapterId"
    JOIN "Subject" s ON s."id" = b."subjectId"
    LEFT JOIN "Section" se ON se."id" = b."sectionId"`;

/** Empty strings clear a value; `undefined`/`null` become `null`. */
const clean = (v: unknown): unknown =>
  typeof v === "string" && v.trim() === "" ? null : (v ?? null);

const toIsoDateOnly = (d: unknown): string | null => {
  if (!d) return null;
  if (d instanceof Date) return d.toISOString().slice(0, 10);
  const s = String(d).trim();
  if (s.includes("T")) return s.slice(0, 10);
  return s.length >= 10 ? s.slice(0, 10) : s;
};

const toProfileDto = (p: ProfileRow) => ({
  id: p.userId,
  email: p.email,
  name: p.name,
  firstName: p.firstName,
  lastName: p.lastName,
  gender: p.gender,
  dob: toIsoDateOnly(p.dob),
  dateOfBirth: toIsoDateOnly(p.dob),
  district: p.district,
  location: p.villageCity,
  villageCity: p.villageCity,
  schoolName: p.schoolName,
  classId: p.activeClassId,
  activeClassId: p.activeClassId,
  grade: p.grade,
  section: p.section,
  medium: p.medium,
  rollNumber: p.rollNumber,
  fatherName: p.fatherName,
  motherName: p.motherName,
  parentPhone: p.parentPhone,
  avatarUrl: p.avatarUrl ? p.avatarUrl : null,
  streakDays: p.streakDays,
  language: p.language,
  notificationsEnabled: p.notificationsEnabled,
  isOnboarded: p.isOnboarded,
});

const toProgressDto = (p: ProgressRow) => ({
  progressPercent: p.progressPercent,
  completed: p.completed,
  lastAccessedAt: p.lastAccessed.toISOString(),
  lastSectionId: p.lastSectionId,
});

const toBookmarkDto = (b: BookmarkRow) => ({
  id: b.id,
  chapterId: b.chapterId,
  chapterTitle: b.chapterTitle,
  subjectId: b.subjectId,
  subjectName: b.subjectName,
  sectionId: b.sectionId,
  sectionTitle: b.sectionTitle,
  previewText: b.previewText,
  createdAt: b.dateAdded.toISOString(),
});

@Injectable()
export class StudentsService {
  constructor(@Inject(DbService) private readonly db: DbService) {}

  // -------------------------------------------------------------- profile --

  /** Loads the profile, creating an empty row for provisioned users without one. */
  private async loadProfile(userId: string): Promise<ProfileRow> {
    let row = await this.db.queryOne<ProfileRow>(PROFILE_SELECT, [userId]);
    if (row) return row;

    const user = await this.db.queryOne<{ id: string }>(
      `SELECT "id" FROM "User" WHERE "id" = $1`,
      [userId]
    );
    if (!user) throw new NotFoundException({ error: "User not found" });

    // ON CONFLICT covers a concurrent first-load creating the row.
    await this.db.query(
      `INSERT INTO "StudentProfile" ("id", "userId", "updatedAt")
       VALUES ($1, $2, ${SQL_NOW_UTC})
       ON CONFLICT ("userId") DO NOTHING`,
      [newId(), userId]
    );
    row = await this.db.queryOne<ProfileRow>(PROFILE_SELECT, [userId]);
    return row!;
  }

  async getProfile(userId: string) {
    return toProfileDto(await this.loadProfile(userId));
  }

  /**
   * Turns validated input into `column → value` writes.
   * `replace` (PUT) nulls every omitted field; PATCH only touches provided ones.
   */
  private async resolveWrites(
    input: Partial<UpdateOnboardingInput>,
    replace: boolean
  ): Promise<Record<string, unknown>> {
    const raw = input as Record<string, unknown>;
    const values: Record<string, unknown> = {};

    const rawLocation = raw.location ?? raw.villageCity;
    const rawDob = raw.dob ?? raw.dateOfBirth;

    for (const col of FIELD_COLUMNS) {
      let val = raw[col];
      if (col === "villageCity" && rawLocation !== undefined) val = rawLocation;
      if (col === "dob" && rawDob !== undefined) val = rawDob;

      if (val !== undefined) values[col] = clean(val);
      else if (replace) values[col] = null;
    }

    // Class: explicit classId wins, otherwise derive `class-<grade>` if it exists.
    const classExists = async (classId: string) =>
      !!(await this.db.queryOne(`SELECT 1 FROM "SchoolClass" WHERE "id" = $1`, [
        classId,
      ]));
    if (raw.classId !== undefined && raw.classId !== null) {
      const classId = String(raw.classId);
      if (!(await classExists(classId))) {
        throw new BadRequestException({ error: "Unknown classId" });
      }
      values.activeClassId = classId;
    } else if (raw.classId === null) {
      values.activeClassId = null;
    } else if (typeof values.grade === "string") {
      const derived = `class-${values.grade}`;
      if (await classExists(derived)) values.activeClassId = derived;
    }
    return values;
  }

  private async writeProfile(
    userId: string,
    values: Record<string, unknown>,
    extraSets: string[] = []
  ): Promise<ProfileRow> {
    await this.loadProfile(userId); // ensure row exists

    const sets: string[] = [`"updatedAt" = ${SQL_NOW_UTC}`, ...extraSets];
    const params: unknown[] = [];
    for (const [column, value] of Object.entries(values)) {
      params.push(value);
      const cast = column === "dob" ? "::date" : "";
      sets.push(`"${column}" = $${params.length}${cast}`);
    }
    params.push(userId);

    await this.db.tx(async (client) => {
      await clientQuery(
        client,
        `UPDATE "StudentProfile" SET ${sets.join(", ")} WHERE "userId" = $${params.length}`,
        params
      );
      // Keep User.name in sync with first/last name.
      if ("firstName" in values || "lastName" in values) {
        const { rows } = await clientQuery<{
          firstName: string | null;
          lastName: string | null;
        }>(
          client,
          `SELECT "firstName", "lastName" FROM "StudentProfile" WHERE "userId" = $1`,
          [userId]
        );
        const name = [rows[0]?.firstName, rows[0]?.lastName]
          .filter(Boolean)
          .join(" ")
          .trim();
        if (name) {
          await clientQuery(client, `UPDATE "User" SET "name" = $1 WHERE "id" = $2`, [
            name,
            userId,
          ]);
        }
      }
    });
    return this.loadProfile(userId);
  }

  async submitOnboarding(userId: string, input: UpdateOnboardingInput) {
    const values = await this.resolveWrites(input, true);
    const row = await this.writeProfile(userId, values, [`"isOnboarded" = true`]);
    return { success: true, profile: toProfileDto(row), isOnboarded: true };
  }

  async updateProfile(userId: string, input: UpdateProfileInput) {
    const values = await this.resolveWrites(input, false);
    const row = await this.writeProfile(userId, values);
    return { success: true, profile: toProfileDto(row) };
  }

  async updateSettings(userId: string, input: UpdateSettingsInput) {
    const values: Record<string, unknown> = {};
    if (input.language !== undefined) values.language = input.language;
    if (input.notificationsEnabled !== undefined) {
      values.notificationsEnabled = input.notificationsEnabled;
    }
    const row = await this.writeProfile(userId, values);
    return {
      success: true,
      settings: {
        language: row.language,
        notificationsEnabled: row.notificationsEnabled,
      },
    };
  }

  // --------------------------------------------------------------- avatar --

  private async removeAvatarFiles(userId: string, keep?: string) {
    const dir = avatarsDir();
    const entries = await readdir(dir).catch(() => [] as string[]);
    await Promise.all(
      entries
        .filter((f) => f.startsWith(`${userId}.`) && f !== keep)
        .map((f) => unlink(join(dir, f)).catch(() => undefined))
    );
  }

  async setAvatar(
    userId: string,
    upload: { mimetype: string; file: Readable & { truncated?: boolean } }
  ) {
    const ext = AVATAR_MIME_EXT[upload.mimetype.toLowerCase()];
    if (!ext) {
      // Drain so the request can finish cleanly.
      upload.file.resume();
      throw new UnsupportedMediaTypeException({
        error: "Avatar must be a JPEG, PNG, WebP or GIF image",
      });
    }
    await this.loadProfile(userId);
    ensureUploadsDirs();

    const safeId = userId.replace(/[^a-zA-Z0-9_-]/g, "_");
    const finalName = `${safeId}.${ext}`;
    const tmpPath = join(avatarsDir(), `${safeId}.${Date.now()}.tmp`);
    try {
      await pipeline(upload.file, createWriteStream(tmpPath));
      if (upload.file.truncated) {
        throw new PayloadTooLargeException({
          error: "Avatar image is too large (max 5 MB)",
        });
      }
      if (!(await fileHasImageSignature(tmpPath, ext))) {
        throw new UnsupportedMediaTypeException({
          error: "File content does not match the declared image type",
        });
      }
      await rename(tmpPath, join(avatarsDir(), finalName));
    } catch (err) {
      await unlink(tmpPath).catch(() => undefined);
      throw err;
    }
    await this.removeAvatarFiles(safeId, finalName);

    const avatarUrl = `${UPLOADS_URL_PREFIX}/avatars/${finalName}?v=${Date.now()}`;
    await this.writeProfile(userId, { avatarUrl });
    return { success: true, avatarUrl };
  }

  async deleteAvatar(userId: string) {
    await this.loadProfile(userId);
    await this.removeAvatarFiles(userId.replace(/[^a-zA-Z0-9_-]/g, "_"));
    await this.writeProfile(userId, { avatarUrl: "" });
    return { success: true, avatarUrl: null };
  }

  // ------------------------------------------------------------- progress --

  async getProgress(userId: string) {
    const [{ rows }, profile] = await Promise.all([
      this.db.query<ProgressRow>(
        `SELECT ${PROGRESS_COLUMNS} FROM "ChapterProgress"
          WHERE "userId" = $1
          ORDER BY "lastAccessed" DESC`,
        [userId]
      ),
      this.db.queryOne<{ activeClassId: string | null }>(
        `SELECT "activeClassId" FROM "StudentProfile" WHERE "userId" = $1`,
        [userId]
      ),
    ]);

    const chapters: Record<string, ReturnType<typeof toProgressDto>> = {};
    for (const row of rows) chapters[row.chapterId] = toProgressDto(row);

    // Overall = average over every chapter of the active class (untouched = 0%).
    // Without an active class, fall back to the average of tracked chapters.
    let overallPercent = 0;
    if (profile?.activeClassId) {
      const stats = await this.db.queryOne<{ total: number; done: number }>(
        `SELECT COUNT(c."id")::int AS "total",
                COALESCE(SUM(cp."progressPercent"), 0)::int AS "done"
           FROM "Chapter" c
           JOIN "Subject" s ON s."id" = c."subjectId"
           LEFT JOIN "ChapterProgress" cp
             ON cp."chapterId" = c."id" AND cp."userId" = $1
          WHERE s."classId" = $2`,
        [userId, profile.activeClassId]
      );
      if (stats && stats.total > 0) {
        overallPercent = Math.round(stats.done / stats.total);
      }
    } else if (rows.length > 0) {
      overallPercent = Math.round(
        rows.reduce((sum, r) => sum + r.progressPercent, 0) / rows.length
      );
    }
    return { overallPercent, chapters };
  }

  private async chapterContext(chapterId: string): Promise<ChapterContext> {
    const chapter = await this.db.queryOne<Omit<ChapterContext, "sectionIds">>(
      `SELECT c."id", c."title", c."subjectId", s."name" AS "subjectName", s."classId"
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

  async upsertProgress(
    userId: string,
    chapterId: string,
    input: UpsertProgressInput
  ) {
    const chapter = await this.chapterContext(chapterId);
    if (input.sectionId && !chapter.sectionIds.includes(input.sectionId)) {
      throw new BadRequestException({
        error: "sectionId does not belong to this chapter",
      });
    }

    const progressPercent = input.completed ? 100 : input.progressPercent;
    const { rows } = await this.db.query<ProgressRow>(
      `INSERT INTO "ChapterProgress"
         ("id", "userId", "chapterId", "subjectId", "classId", "completed",
          "completedSections", "progressPercent", "lastSectionId", "lastAccessed", "updatedAt")
       VALUES ($1, $2, $3, $4, $5, $6, $7::text[], $8, $9, ${SQL_NOW_UTC}, ${SQL_NOW_UTC})
       ON CONFLICT ("userId", "chapterId") DO UPDATE SET
         "completed" = EXCLUDED."completed",
         "progressPercent" = EXCLUDED."progressPercent",
         "completedSections" = (
           SELECT COALESCE(array_agg(DISTINCT s), ARRAY[]::text[])
             FROM unnest("ChapterProgress"."completedSections" || EXCLUDED."completedSections") AS s
         ),
         "lastSectionId" = COALESCE(EXCLUDED."lastSectionId", "ChapterProgress"."lastSectionId"),
         "lastAccessed" = EXCLUDED."lastAccessed",
         "updatedAt" = EXCLUDED."updatedAt"
       RETURNING ${PROGRESS_COLUMNS}`,
      [
        newId(),
        userId,
        chapter.id,
        chapter.subjectId,
        chapter.classId,
        input.completed,
        input.sectionId ? [input.sectionId] : [],
        progressPercent,
        input.sectionId ?? null,
      ]
    );
    return {
      success: true,
      updatedProgress: { chapterId: chapter.id, ...toProgressDto(rows[0]!) },
    };
  }

  // ------------------------------------------------------------ bookmarks --

  async listBookmarks(userId: string) {
    const { rows } = await this.db.query<BookmarkRow>(
      `${BOOKMARK_SELECT}
        WHERE b."userId" = $1
        ORDER BY b."dateAdded" DESC`,
      [userId]
    );
    return rows.map(toBookmarkDto);
  }

  private getBookmark(userId: string, id: string) {
    return this.db.queryOne<BookmarkRow>(
      `${BOOKMARK_SELECT} WHERE b."id" = $1 AND b."userId" = $2`,
      [id, userId]
    );
  }

  async createBookmark(userId: string, input: CreateBookmarkInput) {
    const chapter = await this.chapterContext(input.chapterId);

    let sectionTitle: string | null = null;
    if (input.sectionId) {
      const section = await this.db.queryOne<{
        id: string;
        chapterId: string;
        title: string;
      }>(`SELECT "id", "chapterId", "title" FROM "Section" WHERE "id" = $1`, [
        input.sectionId,
      ]);
      if (!section || section.chapterId !== chapter.id) {
        throw new NotFoundException({ error: "Section not found" });
      }
      sectionTitle = section.title;
    }

    const type = input.sectionId ? "section" : "chapter";
    const existing = await this.db.queryOne<{ id: string }>(
      `SELECT "id" FROM "Bookmark"
        WHERE "userId" = $1 AND "chapterId" = $2
          AND "sectionId" IS NOT DISTINCT FROM $3
        LIMIT 1`,
      [userId, chapter.id, input.sectionId ?? null]
    );

    let id = existing?.id;
    if (!id) {
      id = newId();
      await this.db.query(
        `INSERT INTO "Bookmark"
           ("id", "userId", "classId", "subjectId", "chapterId", "sectionId",
            "title", "subtitle", "type", "previewText")
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9::"BookmarkType", $10)`,
        [
          id,
          userId,
          chapter.classId,
          chapter.subjectId,
          chapter.id,
          input.sectionId ?? null,
          sectionTitle ?? chapter.title,
          sectionTitle ? chapter.title : chapter.subjectName,
          type,
          input.previewText ?? null,
        ]
      );
    }
    const bookmark = (await this.getBookmark(userId, id))!;
    return { success: true, bookmark: toBookmarkDto(bookmark) };
  }

  async deleteBookmark(userId: string, id: string) {
    const { rowCount } = await this.db.query(
      `DELETE FROM "Bookmark" WHERE "id" = $1 AND "userId" = $2`,
      [id, userId]
    );
    if (rowCount === 0) {
      throw new NotFoundException({ error: "Bookmark not found" });
    }
    return { success: true };
  }

  /** Idempotent quick-toggle: succeeds even when nothing was bookmarked. */
  async deleteBookmarksBySection(userId: string, sectionId: string) {
    await this.db.query(
      `DELETE FROM "Bookmark" WHERE "userId" = $1 AND "sectionId" = $2`,
      [userId, sectionId]
    );
    return { success: true };
  }
}
