import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { newId } from "../../common/ids";
import { DbService } from "../../db/db.service";
import type { QuizListQuery, SubmitAttemptInput } from "./quizzes.schemas";

type QuizRow = {
  id: string;
  chapterId: string | null;
  title: string;
  description: string | null;
  timeLimitMinutes: number | null;
  createdAt: Date;
};

type QuestionRow = {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  order: number;
};

type AttemptRow = {
  id: string;
  quizId: string;
  userId: string;
  answers: unknown;
  score: number;
  maxScore: number;
  createdAt: Date;
};

const QUIZ_COLUMNS = `"id", "chapterId", "title", "description", "timeLimitMinutes", "createdAt"`;
const QUESTION_COLUMNS = `"id", "question", "options", "correctIndex", "explanation", "order"`;
const ATTEMPT_COLUMNS = `"id", "quizId", "userId", "answers", "score", "maxScore", "createdAt"`;

const toQuizSummaryDto = (q: QuizRow, questionCount: number) => ({
  id: q.id,
  chapterId: q.chapterId,
  title: q.title,
  description: q.description,
  timeLimitMinutes: q.timeLimitMinutes,
  questionCount,
  createdAt: q.createdAt.toISOString(),
});

const toQuizDto = (q: QuizRow, questions: QuestionRow[]) => ({
  ...toQuizSummaryDto(q, questions.length),
  // `correctIndex` is included for practice mode (matches the mobile mock).
  questions: questions.map((qq) => ({
    id: qq.id,
    question: qq.question,
    options: qq.options,
    correctIndex: qq.correctIndex,
    explanation: qq.explanation,
    order: qq.order,
  })),
});

const toAttemptDto = (a: AttemptRow) => ({
  id: a.id,
  quizId: a.quizId,
  userId: a.userId,
  answers: a.answers,
  score: a.score,
  maxScore: a.maxScore,
  createdAt: a.createdAt.toISOString(),
});

@Injectable()
export class QuizzesService {
  constructor(@Inject(DbService) private readonly db: DbService) {}

  private async loadQuestions(quizId: string) {
    const { rows } = await this.db.query<QuestionRow>(
      `SELECT ${QUESTION_COLUMNS} FROM "QuizQuestion"
        WHERE "quizId" = $1
        ORDER BY "order" ASC`,
      [quizId]
    );
    return rows;
  }

  async list(query: QuizListQuery) {
    const params: unknown[] = [];
    let where = "";
    if (query.chapterId) {
      params.push(query.chapterId);
      where = `WHERE q."chapterId" = $1`;
    }
    const { rows } = await this.db.query<QuizRow & { questionCount: number }>(
      `SELECT ${QUIZ_COLUMNS.replace(/"(\w+)"/g, 'q."$1"')},
              (SELECT COUNT(*)::int FROM "QuizQuestion" qq WHERE qq."quizId" = q."id") AS "questionCount"
         FROM "Quiz" q
         ${where}
        ORDER BY q."createdAt" ASC`,
      params
    );
    return {
      items: rows.map((q) => toQuizSummaryDto(q, q.questionCount)),
    };
  }

  async get(id: string) {
    const quiz = await this.db.queryOne<QuizRow>(
      `SELECT ${QUIZ_COLUMNS} FROM "Quiz" WHERE "id" = $1`,
      [id]
    );
    if (!quiz) throw new NotFoundException({ error: "Quiz not found" });
    return toQuizDto(quiz, await this.loadQuestions(id));
  }

  async submitAttempt(userId: string, quizId: string, input: SubmitAttemptInput) {
    const quiz = await this.db.queryOne<{ id: string }>(
      `SELECT "id" FROM "Quiz" WHERE "id" = $1`,
      [quizId]
    );
    if (!quiz) throw new NotFoundException({ error: "Quiz not found" });

    const questions = await this.loadQuestions(quizId);
    if (input.answers.length > questions.length) {
      throw new BadRequestException({
        error: "More answers than questions",
      });
    }

    const results = questions.map((q, i) => {
      const selectedIndex = input.answers[i] ?? -1;
      return {
        questionId: q.id,
        selectedIndex,
        correctIndex: q.correctIndex,
        correct: selectedIndex === q.correctIndex,
        explanation: q.explanation,
      };
    });
    const score = results.filter((r) => r.correct).length;
    const answers = questions.map((_, i) => input.answers[i] ?? -1);

    const attempt = await this.db.queryOne<AttemptRow>(
      `INSERT INTO "QuizAttempt" ("id", "quizId", "userId", "answers", "score", "maxScore")
       VALUES ($1, $2, $3, $4::jsonb, $5, $6)
       RETURNING ${ATTEMPT_COLUMNS}`,
      [newId(), quizId, userId, JSON.stringify(answers), score, questions.length]
    );
    return { ...toAttemptDto(attempt!), results };
  }

  async listAttempts(userId: string) {
    const { rows } = await this.db.query<
      AttemptRow & { quizTitle: string; quizChapterId: string | null }
    >(
      `SELECT ${ATTEMPT_COLUMNS.replace(/"(\w+)"/g, 'a."$1"')},
              q."title" AS "quizTitle", q."chapterId" AS "quizChapterId"
         FROM "QuizAttempt" a
         JOIN "Quiz" q ON q."id" = a."quizId"
        WHERE a."userId" = $1
        ORDER BY a."createdAt" DESC`,
      [userId]
    );
    return {
      items: rows.map((a) => ({
        ...toAttemptDto(a),
        quizTitle: a.quizTitle,
        chapterId: a.quizChapterId,
      })),
    };
  }
}
