import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";
import type {
  CreateQuizInput,
  QuizListQuery,
  SubmitAttemptInput,
} from "./quizzes.schemas";

type QuizWithQuestions = Prisma.QuizGetPayload<{
  include: { questions: true };
}>;

const toQuizDto = (q: QuizWithQuestions) => ({
  id: q.id,
  chapterId: q.chapterId,
  title: q.title,
  description: q.description,
  timeLimitMinutes: q.timeLimitMinutes,
  questionCount: q.questions.length,
  createdAt: q.createdAt.toISOString(),
  // `correctIndex` is included for practice mode (matches the mobile mock).
  questions: [...q.questions]
    .sort((a, b) => a.order - b.order)
    .map((qq) => ({
      id: qq.id,
      question: qq.question,
      options: qq.options,
      correctIndex: qq.correctIndex,
      explanation: qq.explanation,
      order: qq.order,
    })),
});

const toAttemptDto = (a: Prisma.QuizAttemptGetPayload<object>) => ({
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
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async list(query: QuizListQuery) {
    const rows = await this.prisma.quiz.findMany({
      where: query.chapterId ? { chapterId: query.chapterId } : {},
      orderBy: { createdAt: "asc" },
      include: { questions: true },
    });
    return {
      items: rows.map((q) => {
        const { questions: _questions, ...summary } = toQuizDto(q);
        return summary;
      }),
    };
  }

  async get(id: string) {
    const quiz = await this.prisma.quiz.findUnique({
      where: { id },
      include: { questions: true },
    });
    if (!quiz) throw new NotFoundException({ error: "Quiz not found" });
    return toQuizDto(quiz);
  }

  async submitAttempt(userId: string, quizId: string, input: SubmitAttemptInput) {
    const quiz = await this.prisma.quiz.findUnique({
      where: { id: quizId },
      include: { questions: true },
    });
    if (!quiz) throw new NotFoundException({ error: "Quiz not found" });

    const questions = [...quiz.questions].sort((a, b) => a.order - b.order);
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

    const attempt = await this.prisma.quizAttempt.create({
      data: {
        quizId,
        userId,
        answers: questions.map((_, i) => input.answers[i] ?? -1),
        score,
        maxScore: questions.length,
      },
    });
    return { ...toAttemptDto(attempt), results };
  }

  async listAttempts(userId: string) {
    const rows = await this.prisma.quizAttempt.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: { quiz: { select: { title: true, chapterId: true } } },
    });
    return {
      items: rows.map((a) => ({
        ...toAttemptDto(a),
        quizTitle: a.quiz.title,
        chapterId: a.quiz.chapterId,
      })),
    };
  }

  async create(input: CreateQuizInput) {
    if (input.chapterId) {
      const chapter = await this.prisma.chapter.findUnique({
        where: { id: input.chapterId },
      });
      if (!chapter) throw new NotFoundException({ error: "Chapter not found" });
    }
    const quiz = await this.prisma.quiz.create({
      data: {
        chapterId: input.chapterId ?? null,
        title: input.title,
        description: input.description,
        timeLimitMinutes: input.timeLimitMinutes,
        questions: {
          create: input.questions.map((q, order) => ({
            question: q.question,
            options: q.options,
            correctIndex: q.correctIndex,
            explanation: q.explanation ?? "",
            order,
          })),
        },
      },
      include: { questions: true },
    });
    return toQuizDto(quiz);
  }
}
