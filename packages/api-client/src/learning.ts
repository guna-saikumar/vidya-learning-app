import { ApiClient } from "./client";

/** Quizzes, tasks, notifications, exams. */
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

export class TasksApi {
  constructor(private readonly client: ApiClient) {}

  list(status?: string) {
    const q = status ? `?status=${encodeURIComponent(status)}` : "";
    return this.client.get(`/api/me/tasks${q}`);
  }

  patch(id: string, body: unknown) {
    return this.client.patch(`/api/me/tasks/${encodeURIComponent(id)}`, body);
  }

  adminCreate(body: unknown) {
    return this.client.post("/api/admin/tasks", body);
  }
}

export class NotificationsApi {
  constructor(private readonly client: ApiClient) {}

  list() {
    return this.client.get("/api/me/notifications");
  }

  markRead(id: string) {
    return this.client.patch(
      `/api/me/notifications/${encodeURIComponent(id)}/read`
    );
  }

  readAll() {
    return this.client.post("/api/me/notifications/read-all");
  }

  adminBroadcast(body: unknown) {
    return this.client.post("/api/admin/notifications", body);
  }
}

export class ExamsApi {
  constructor(private readonly client: ApiClient) {}

  schedule() {
    return this.client.get("/api/me/exams/schedule");
  }

  results() {
    return this.client.get("/api/me/exams/results");
  }

  adminCreateSchedule(body: unknown) {
    return this.client.post("/api/admin/exams/schedule", body);
  }

  adminCreateResult(body: unknown) {
    return this.client.post("/api/admin/exams/results", body);
  }
}

export class DashboardApi {
  constructor(private readonly client: ApiClient) {}

  student() {
    return this.client.get("/api/dashboard");
  }

  admin() {
    return this.client.get("/api/admin/dashboard");
  }

  adminUsers(params?: { role?: string; limit?: number; offset?: number }) {
    const sp = new URLSearchParams();
    if (params?.role) sp.set("role", params.role);
    if (params?.limit != null) sp.set("limit", String(params.limit));
    if (params?.offset != null) sp.set("offset", String(params.offset));
    const q = sp.toString();
    return this.client.get(`/api/admin/dashboard/users${q ? `?${q}` : ""}`);
  }
}

export class AdminStudentsApi {
  constructor(private readonly client: ApiClient) {}

  create(body: {
    email: string;
    name: string;
    password: string;
    activeClassId?: string;
  }) {
    return this.client.post("/api/admin/students", body);
  }

  changePassword(body: { currentPassword: string; newPassword: string }) {
    return this.client.post("/api/admin/auth/change-password", body);
  }

  patchMe(body: { name?: string; department?: string }) {
    return this.client.patch("/api/admin/auth/me", body);
  }
}
