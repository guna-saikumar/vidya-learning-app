import { ApiClient } from "../client";

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
