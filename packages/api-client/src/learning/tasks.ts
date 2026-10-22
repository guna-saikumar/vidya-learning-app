import { ApiClient } from "../client";

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
