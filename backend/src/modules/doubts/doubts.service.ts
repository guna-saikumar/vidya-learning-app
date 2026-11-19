import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { newId } from "../../common/ids";
import { DbService, clientQuery } from "../../db/db.service";
import type {
  CreateDoubtInput,
  DoubtAnswerDto,
  DoubtSummaryDto,
  DoubtThreadDto,
  ListDoubtsQuery,
  PostAnswerInput,
  ResolveDoubtInput,
} from "./doubts.schemas";

type DoubtSummaryRow = {
  id: string;
  chapterId: string;
  sectionId: string | null;
  title: string;
  body: string;
  isResolved: boolean;
  createdAt: Date;
  authorId: string;
  authorName: string;
  authorRole: "student" | "teacher";
  upvoteCount: number;
  upvotedByMe: boolean;
  answerCount: number;
  hasTeacherAnswer: boolean;
};

type DoubtDetailRow = {
  id: string;
  chapterId: string;
  sectionId: string | null;
  title: string;
  body: string;
  isResolved: boolean;
  createdAt: Date;
  authorId: string;
  authorName: string;
  authorRole: "student" | "teacher";
  upvoteCount: number;
  upvotedByMe: boolean;
};

type DoubtAnswerRow = {
  id: string;
  doubtId: string;
  body: string;
  isAccepted: boolean;
  createdAt: Date;
  authorId: string;
  authorName: string;
  authorRole: "student" | "teacher";
  helpfulCount: number;
  markedHelpfulByMe: boolean;
};

@Injectable()
export class DoubtsService {
  constructor(@Inject(DbService) private readonly db: DbService) {}

  /**
   * List doubts for a chapter with SQL-computed aggregated counts (no N+1).
   */
  async listDoubts(
    userId: string,
    chapterId: string,
    query: ListDoubtsQuery
  ): Promise<DoubtSummaryDto[]> {
    const chapter = await this.db.queryOne<{ id: string }>(
      `SELECT "id" FROM "Chapter" WHERE "id" = $1`,
      [chapterId]
    );
    if (!chapter) {
      throw new NotFoundException({ error: "Chapter not found" });
    }

    const filter = query.filter || "all";
    const q = query.q?.trim().toLowerCase() || "";

    const params: unknown[] = [userId, chapterId];
    const whereClauses: string[] = ['d."chapterId" = $2'];

    if (filter === "mine") {
      params.push(userId);
      whereClauses.push(`d."userId" = $${params.length}`);
    }

    if (q) {
      params.push(`%${q}%`);
      whereClauses.push(
        `(LOWER(d."title") LIKE $${params.length} OR LOWER(d."body") LIKE $${params.length})`
      );
    }

    let havingClause = "";
    if (filter === "unanswered") {
      havingClause = 'HAVING COUNT(DISTINCT da."id") = 0';
    }

    const sql = `
      SELECT
        d."id",
        d."chapterId",
        d."sectionId",
        d."title",
        d."body",
        d."isResolved",
        d."createdAt",
        d."userId" AS "authorId",
        COALESCE(NULLIF(TRIM(CONCAT(sp."firstName", ' ', sp."lastName")), ''), u."name", 'Student') AS "authorName",
        CASE WHEN u."role" = 'TEACHER' THEN 'teacher' ELSE 'student' END AS "authorRole",
        COUNT(DISTINCT du."userId")::int AS "upvoteCount",
        COALESCE(BOOL_OR(du."userId" = $1), false) AS "upvotedByMe",
        COUNT(DISTINCT da."id")::int AS "answerCount",
        COALESCE(BOOL_OR(u_ans."role" = 'TEACHER'), false) AS "hasTeacherAnswer"
      FROM "Doubt" d
      JOIN "User" u ON u."id" = d."userId"
      LEFT JOIN "StudentProfile" sp ON sp."userId" = d."userId"
      LEFT JOIN "DoubtUpvote" du ON du."doubtId" = d."id"
      LEFT JOIN "DoubtAnswer" da ON da."doubtId" = d."id"
      LEFT JOIN "User" u_ans ON u_ans."id" = da."userId"
      WHERE ${whereClauses.join(" AND ")}
      GROUP BY d."id", d."chapterId", d."sectionId", d."title", d."body", d."isResolved", d."createdAt", d."userId", sp."firstName", sp."lastName", u."name", u."role"
      ${havingClause}
      ORDER BY d."createdAt" DESC
    `;

    const { rows } = await this.db.query<DoubtSummaryRow>(sql, params);

    return rows.map((r) => ({
      id: r.id,
      chapterId: r.chapterId,
      sectionId: r.sectionId || undefined,
      title: r.title,
      preview: r.body.length > 160 ? `${r.body.slice(0, 160)}...` : r.body,
      author: {
        id: r.authorId,
        name: r.authorName,
        role: r.authorRole,
      },
      createdAt: r.createdAt instanceof Date ? r.createdAt.toISOString() : new Date(r.createdAt).toISOString(),
      upvoteCount: r.upvoteCount,
      upvotedByMe: Boolean(r.upvotedByMe),
      answerCount: r.answerCount,
      hasTeacherAnswer: Boolean(r.hasTeacherAnswer),
      isResolved: Boolean(r.isResolved),
    }));
  }

  /**
   * Ask a doubt on a chapter (optionally tied to a section).
   */
  async createDoubt(
    userId: string,
    chapterId: string,
    input: CreateDoubtInput
  ): Promise<DoubtThreadDto> {
    // Rate limit: 10 doubts per hour per user
    const rateCheck = await this.db.queryOne<{ count: number }>(
      `SELECT COUNT(*)::int AS count FROM "Doubt" WHERE "userId" = $1 AND "createdAt" >= NOW() - INTERVAL '1 hour'`,
      [userId]
    );
    if (rateCheck && rateCheck.count >= 10) {
      throw new HttpException(
        { error: "Rate limit exceeded: max 10 doubts per hour" },
        HttpStatus.TOO_MANY_REQUESTS
      );
    }

    const chapter = await this.db.queryOne<{ id: string }>(
      `SELECT "id" FROM "Chapter" WHERE "id" = $1`,
      [chapterId]
    );
    if (!chapter) {
      throw new NotFoundException({ error: "Chapter not found" });
    }

    if (input.sectionId) {
      const section = await this.db.queryOne<{ id: string; chapterId: string }>(
        `SELECT "id", "chapterId" FROM "Section" WHERE "id" = $1`,
        [input.sectionId]
      );
      if (!section || section.chapterId !== chapterId) {
        throw new BadRequestException({
          error: "sectionId does not belong to this chapter",
        });
      }
    }

    const id = newId();
    await this.db.query(
      `INSERT INTO "Doubt" ("id", "userId", "chapterId", "sectionId", "title", "body", "isResolved", "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, $5, $6, false, NOW(), NOW())`,
      [
        id,
        userId,
        chapterId,
        input.sectionId || null,
        input.title.trim(),
        input.body.trim(),
      ]
    );

    return this.getDoubtThread(userId, id);
  }

  /**
   * Retrieve a single doubt thread with answers and vote flags for calling user.
   */
  async getDoubtThread(userId: string, doubtId: string): Promise<DoubtThreadDto> {
    const thread = await this.db.queryOne<DoubtDetailRow>(
      `SELECT
         d."id",
         d."chapterId",
         d."sectionId",
         d."title",
         d."body",
         d."isResolved",
         d."createdAt",
         d."userId" AS "authorId",
         COALESCE(NULLIF(TRIM(CONCAT(sp."firstName", ' ', sp."lastName")), ''), u."name", 'Student') AS "authorName",
         CASE WHEN u."role" = 'TEACHER' THEN 'teacher' ELSE 'student' END AS "authorRole",
         COUNT(DISTINCT du."userId")::int AS "upvoteCount",
         COALESCE(BOOL_OR(du."userId" = $1), false) AS "upvotedByMe"
       FROM "Doubt" d
       JOIN "User" u ON u."id" = d."userId"
       LEFT JOIN "StudentProfile" sp ON sp."userId" = d."userId"
       LEFT JOIN "DoubtUpvote" du ON du."doubtId" = d."id"
       WHERE d."id" = $2
       GROUP BY d."id", d."chapterId", d."sectionId", d."title", d."body", d."isResolved", d."createdAt", d."userId", sp."firstName", sp."lastName", u."name", u."role"`,
      [userId, doubtId]
    );

    if (!thread) {
      throw new NotFoundException({ error: "Doubt not found" });
    }

    const { rows: answers } = await this.db.query<DoubtAnswerRow>(
      `SELECT
         da."id",
         da."doubtId",
         da."body",
         da."isAccepted",
         da."createdAt",
         da."userId" AS "authorId",
         COALESCE(NULLIF(TRIM(CONCAT(sp."firstName", ' ', sp."lastName")), ''), u."name", 'Student') AS "authorName",
         CASE WHEN u."role" = 'TEACHER' THEN 'teacher' ELSE 'student' END AS "authorRole",
         COUNT(DISTINCT dah."userId")::int AS "helpfulCount",
         COALESCE(BOOL_OR(dah."userId" = $1), false) AS "markedHelpfulByMe"
       FROM "DoubtAnswer" da
       JOIN "User" u ON u."id" = da."userId"
       LEFT JOIN "StudentProfile" sp ON sp."userId" = da."userId"
       LEFT JOIN "DoubtAnswerHelpful" dah ON dah."answerId" = da."id"
       WHERE da."doubtId" = $2
       GROUP BY da."id", da."doubtId", da."body", da."isAccepted", da."createdAt", da."userId", sp."firstName", sp."lastName", u."name", u."role"
       ORDER BY
         da."isAccepted" DESC,
         (CASE WHEN u."role" = 'TEACHER' THEN 1 ELSE 0 END) DESC,
         COUNT(DISTINCT dah."userId") DESC,
         da."createdAt" ASC`,
      [userId, doubtId]
    );

    return {
      id: thread.id,
      chapterId: thread.chapterId,
      sectionId: thread.sectionId || undefined,
      title: thread.title,
      body: thread.body,
      author: {
        id: thread.authorId,
        name: thread.authorName,
        role: thread.authorRole,
      },
      createdAt:
        thread.createdAt instanceof Date
          ? thread.createdAt.toISOString()
          : new Date(thread.createdAt).toISOString(),
      upvoteCount: thread.upvoteCount,
      upvotedByMe: Boolean(thread.upvotedByMe),
      isResolved: Boolean(thread.isResolved),
      answers: answers.map((a) => ({
        id: a.id,
        doubtId: a.doubtId,
        author: {
          id: a.authorId,
          name: a.authorName,
          role: a.authorRole,
        },
        body: a.body,
        helpfulCount: a.helpfulCount,
        markedHelpfulByMe: Boolean(a.markedHelpfulByMe),
        isAccepted: Boolean(a.isAccepted),
        createdAt:
          a.createdAt instanceof Date
            ? a.createdAt.toISOString()
            : new Date(a.createdAt).toISOString(),
      })),
    };
  }

  /**
   * Post an answer to a doubt thread.
   */
  async postAnswer(
    userId: string,
    doubtId: string,
    input: PostAnswerInput
  ): Promise<DoubtAnswerDto> {
    const doubt = await this.db.queryOne<{ id: string }>(
      `SELECT "id" FROM "Doubt" WHERE "id" = $1`,
      [doubtId]
    );
    if (!doubt) {
      throw new NotFoundException({ error: "Doubt not found" });
    }

    // Rate limit: 30 answers per hour per user
    const rateCheck = await this.db.queryOne<{ count: number }>(
      `SELECT COUNT(*)::int AS count FROM "DoubtAnswer" WHERE "userId" = $1 AND "createdAt" >= NOW() - INTERVAL '1 hour'`,
      [userId]
    );
    if (rateCheck && rateCheck.count >= 30) {
      throw new HttpException(
        { error: "Rate limit exceeded: max 30 answers per hour" },
        HttpStatus.TOO_MANY_REQUESTS
      );
    }

    const id = newId();
    await this.db.query(
      `INSERT INTO "DoubtAnswer" ("id", "doubtId", "userId", "body", "isAccepted", "createdAt")
       VALUES ($1, $2, $3, $4, false, NOW())`,
      [id, doubtId, userId, input.body.trim()]
    );

    const answer = await this.db.queryOne<{
      id: string;
      doubtId: string;
      body: string;
      isAccepted: boolean;
      createdAt: Date;
      authorId: string;
      authorName: string;
      authorRole: "student" | "teacher";
    }>(
      `SELECT
         da."id",
         da."doubtId",
         da."body",
         da."isAccepted",
         da."createdAt",
         da."userId" AS "authorId",
         COALESCE(NULLIF(TRIM(CONCAT(sp."firstName", ' ', sp."lastName")), ''), u."name", 'Student') AS "authorName",
         CASE WHEN u."role" = 'TEACHER' THEN 'teacher' ELSE 'student' END AS "authorRole"
       FROM "DoubtAnswer" da
       JOIN "User" u ON u."id" = da."userId"
       LEFT JOIN "StudentProfile" sp ON sp."userId" = da."userId"
       WHERE da."id" = $1`,
      [id]
    );

    if (!answer) {
      throw new NotFoundException({ error: "Created answer not found" });
    }

    return {
      id: answer.id,
      doubtId: answer.doubtId,
      author: {
        id: answer.authorId,
        name: answer.authorName,
        role: answer.authorRole,
      },
      body: answer.body,
      helpfulCount: 0,
      markedHelpfulByMe: false,
      isAccepted: Boolean(answer.isAccepted),
      createdAt:
        answer.createdAt instanceof Date
          ? answer.createdAt.toISOString()
          : new Date(answer.createdAt).toISOString(),
    };
  }

  /**
   * Toggle caller upvote on a doubt. Asker cannot upvote their own doubt.
   */
  async toggleUpvote(
    userId: string,
    doubtId: string
  ): Promise<{ upvoted: boolean; upvoteCount: number }> {
    const doubt = await this.db.queryOne<{ id: string; userId: string }>(
      `SELECT "id", "userId" FROM "Doubt" WHERE "id" = $1`,
      [doubtId]
    );
    if (!doubt) {
      throw new NotFoundException({ error: "Doubt not found" });
    }

    if (doubt.userId === userId) {
      throw new BadRequestException({
        error: "You cannot upvote your own doubt",
      });
    }

    const existing = await this.db.queryOne<{ doubtId: string }>(
      `SELECT "doubtId" FROM "DoubtUpvote" WHERE "doubtId" = $1 AND "userId" = $2`,
      [doubtId, userId]
    );

    let upvoted = false;
    if (existing) {
      await this.db.query(
        `DELETE FROM "DoubtUpvote" WHERE "doubtId" = $1 AND "userId" = $2`,
        [doubtId, userId]
      );
      upvoted = false;
    } else {
      await this.db.query(
        `INSERT INTO "DoubtUpvote" ("doubtId", "userId", "createdAt")
         VALUES ($1, $2, NOW())
         ON CONFLICT ("doubtId", "userId") DO NOTHING`,
        [doubtId, userId]
      );
      upvoted = true;
    }

    const countRes = await this.db.queryOne<{ count: number }>(
      `SELECT COUNT(*)::int AS count FROM "DoubtUpvote" WHERE "doubtId" = $1`,
      [doubtId]
    );

    return {
      upvoted,
      upvoteCount: countRes?.count ?? 0,
    };
  }

  /**
   * Toggle caller helpful vote on an answer. Answerer cannot vote their own answer.
   */
  async toggleHelpful(
    userId: string,
    doubtId: string,
    answerId: string
  ): Promise<{ markedHelpful: boolean; helpfulCount: number }> {
    const answer = await this.db.queryOne<{
      id: string;
      doubtId: string;
      userId: string;
    }>(
      `SELECT "id", "doubtId", "userId" FROM "DoubtAnswer" WHERE "id" = $1 AND "doubtId" = $2`,
      [answerId, doubtId]
    );
    if (!answer) {
      throw new NotFoundException({ error: "Answer not found" });
    }

    if (answer.userId === userId) {
      throw new BadRequestException({
        error: "You cannot mark your own answer as helpful",
      });
    }

    const existing = await this.db.queryOne<{ answerId: string }>(
      `SELECT "answerId" FROM "DoubtAnswerHelpful" WHERE "answerId" = $1 AND "userId" = $2`,
      [answerId, userId]
    );

    let markedHelpful = false;
    if (existing) {
      await this.db.query(
        `DELETE FROM "DoubtAnswerHelpful" WHERE "answerId" = $1 AND "userId" = $2`,
        [answerId, userId]
      );
      markedHelpful = false;
    } else {
      await this.db.query(
        `INSERT INTO "DoubtAnswerHelpful" ("answerId", "userId", "createdAt")
         VALUES ($1, $2, NOW())
         ON CONFLICT ("answerId", "userId") DO NOTHING`,
        [answerId, userId]
      );
      markedHelpful = true;
    }

    const countRes = await this.db.queryOne<{ count: number }>(
      `SELECT COUNT(*)::int AS count FROM "DoubtAnswerHelpful" WHERE "answerId" = $1`,
      [answerId]
    );

    return {
      markedHelpful,
      helpfulCount: countRes?.count ?? 0,
    };
  }

  /**
   * Mark doubt resolved. Only the asker may resolve. Optionally accept an answer.
   */
  async resolveDoubt(
    userId: string,
    doubtId: string,
    input?: ResolveDoubtInput
  ): Promise<DoubtThreadDto> {
    const doubt = await this.db.queryOne<{
      id: string;
      userId: string;
      isResolved: boolean;
    }>(`SELECT "id", "userId", "isResolved" FROM "Doubt" WHERE "id" = $1`, [
      doubtId,
    ]);

    if (!doubt) {
      throw new NotFoundException({ error: "Doubt not found" });
    }

    if (doubt.userId !== userId) {
      throw new ForbiddenException({
        error: "Only the author can resolve this doubt",
      });
    }

    if (doubt.isResolved) {
      throw new ConflictException({
        error: "Doubt is already resolved",
      });
    }

    if (input?.acceptedAnswerId) {
      const answer = await this.db.queryOne<{ id: string }>(
        `SELECT "id" FROM "DoubtAnswer" WHERE "id" = $1 AND "doubtId" = $2`,
        [input.acceptedAnswerId, doubtId]
      );
      if (!answer) {
        throw new NotFoundException({
          error: "Accepted answer not found in this thread",
        });
      }

      await this.db.tx(async (client) => {
        await clientQuery(
          client,
          `UPDATE "DoubtAnswer" SET "isAccepted" = false WHERE "doubtId" = $1`,
          [doubtId]
        );
        await clientQuery(
          client,
          `UPDATE "DoubtAnswer" SET "isAccepted" = true WHERE "id" = $1 AND "doubtId" = $2`,
          [input.acceptedAnswerId, doubtId]
        );
        await clientQuery(
          client,
          `UPDATE "Doubt" SET "isResolved" = true, "updatedAt" = NOW() WHERE "id" = $1`,
          [doubtId]
        );
      });
    } else {
      await this.db.query(
        `UPDATE "Doubt" SET "isResolved" = true, "updatedAt" = NOW() WHERE "id" = $1`,
        [doubtId]
      );
    }

    return this.getDoubtThread(userId, doubtId);
  }
}
