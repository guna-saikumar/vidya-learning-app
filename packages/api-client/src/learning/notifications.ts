import { ApiClient } from "../client";

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
