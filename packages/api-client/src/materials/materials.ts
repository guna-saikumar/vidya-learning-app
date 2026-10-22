import { ApiClient } from "../client";

function qs(params: Record<string, string | undefined>) {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== "") sp.set(k, v);
  }
  const s = sp.toString();
  return s ? `?${s}` : "";
}

/** Materials client (student published list + admin CMS). */
export class MaterialsApi {
  constructor(private readonly client: ApiClient) {}

  listPublished(filters?: {
    classId?: string;
    subjectId?: string;
    chapterId?: string;
  }) {
    return this.client.get(
      `/api/materials${qs({
        classId: filters?.classId,
        subjectId: filters?.subjectId,
        chapterId: filters?.chapterId,
      })}`
    );
  }

  adminList(filters?: {
    classId?: string;
    subjectId?: string;
    chapterId?: string;
    status?: string;
  }) {
    return this.client.get(
      `/api/admin/materials${qs({
        classId: filters?.classId,
        subjectId: filters?.subjectId,
        chapterId: filters?.chapterId,
        status: filters?.status,
      })}`
    );
  }

  adminGet(id: string) {
    return this.client.get(`/api/admin/materials/${encodeURIComponent(id)}`);
  }

  adminCreate(body: unknown) {
    return this.client.post("/api/admin/materials", body);
  }

  adminPatch(id: string, body: unknown) {
    return this.client.patch(
      `/api/admin/materials/${encodeURIComponent(id)}`,
      body
    );
  }

  adminSetStatus(id: string, status: string) {
    return this.client.patch(
      `/api/admin/materials/${encodeURIComponent(id)}/status`,
      { status }
    );
  }

  adminDelete(id: string) {
    return this.client.delete(`/api/admin/materials/${encodeURIComponent(id)}`);
  }
}
