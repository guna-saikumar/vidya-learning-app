import { ApiClient } from "../client";

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
