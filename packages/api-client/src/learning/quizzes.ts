import { ApiClient } from "../client";

export class QuizzesApi {
  constructor(private readonly client: ApiClient) {}

  list(chapterId?: string) {
    const q = chapterId
      ? `?chapterId=${encodeURIComponent(chapterId)}`
      : "";
    return this.client.get(`/api/quizzes${q}`);
  }

  get(id: string) {
    return this.client.get(`/api/quizzes/${encodeURIComponent(id)}`);
  }

  submitAttempt(id: string, answers: number[]) {
    return this.client.post(`/api/quizzes/${encodeURIComponent(id)}/attempts`, {
      answers,
    });
  }

  myAttempts() {
    return this.client.get("/api/me/quiz-attempts");
  }

  adminCreate(body: unknown) {
    return this.client.post("/api/admin/quizzes", body);
  }
}
