import { ApiClient } from "../client";

export type SchoolSearchParams = {
  q?: string;
  district?: string;
  limit?: number;
};

export class SchoolsApi {
  constructor(private readonly client: ApiClient) {}

  list<T = unknown>(params: SchoolSearchParams = {}) {
    const qs = new URLSearchParams();
    if (params.q) qs.set("q", params.q);
    if (params.district) qs.set("district", params.district);
    if (params.limit !== undefined) qs.set("limit", String(params.limit));
    const query = qs.toString();
    return this.client.get<T>(`/api/v1/schools${query ? `?${query}` : ""}`);
  }

  get<T = unknown>(id: string) {
    return this.client.get<T>(`/api/v1/schools/${encodeURIComponent(id)}`);
  }
}
