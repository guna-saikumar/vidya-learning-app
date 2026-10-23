import { ApiClient } from "../client";

export class NotificationsApi {
  constructor(private readonly client: ApiClient) {}

  list<T = unknown>() {
    return this.client.get<T>("/api/v1/notifications");
  }

  get<T = unknown>(id: string) {
    return this.client.get<T>(
      `/api/v1/notifications/${encodeURIComponent(id)}`
    );
  }

  markRead<T = unknown>(id: string) {
    return this.client.patch<T>(
      `/api/v1/notifications/${encodeURIComponent(id)}/read`
    );
  }

  readAll<T = unknown>() {
    return this.client.post<T>("/api/v1/notifications/read-all");
  }
}
