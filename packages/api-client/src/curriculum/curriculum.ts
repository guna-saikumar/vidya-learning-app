import { ApiClient } from "../client";

/** Curriculum read + admin CMS client (unused by apps until integrate PR). */
export class CurriculumApi {
  constructor(private readonly client: ApiClient) {}

  listClasses() {
    return this.client.get<{ classes: unknown[]; stats: unknown }>(
      "/api/classes"
    );
  }

  getClass(classId: string) {
    return this.client.get(`/api/classes/${encodeURIComponent(classId)}`);
  }

  getSubject(subjectId: string) {
    return this.client.get(`/api/subjects/${encodeURIComponent(subjectId)}`);
  }

  getChapter(chapterId: string) {
    return this.client.get(`/api/chapters/${encodeURIComponent(chapterId)}`);
  }

  getSection(sectionId: string) {
    return this.client.get(`/api/sections/${encodeURIComponent(sectionId)}`);
  }

  adminCreateClass(body: unknown) {
    return this.client.post("/api/admin/classes", body);
  }

  adminPatchClass(id: string, body: unknown) {
    return this.client.patch(`/api/admin/classes/${encodeURIComponent(id)}`, body);
  }

  adminDeleteClass(id: string) {
    return this.client.delete(`/api/admin/classes/${encodeURIComponent(id)}`);
  }

  adminCreateSubject(body: unknown) {
    return this.client.post("/api/admin/subjects", body);
  }

  adminPatchSubject(id: string, body: unknown) {
    return this.client.patch(
      `/api/admin/subjects/${encodeURIComponent(id)}`,
      body
    );
  }

  adminDeleteSubject(id: string) {
    return this.client.delete(`/api/admin/subjects/${encodeURIComponent(id)}`);
  }

  adminCreateChapter(body: unknown) {
    return this.client.post("/api/admin/chapters", body);
  }

  adminPatchChapter(id: string, body: unknown) {
    return this.client.patch(
      `/api/admin/chapters/${encodeURIComponent(id)}`,
      body
    );
  }

  adminDeleteChapter(id: string) {
    return this.client.delete(`/api/admin/chapters/${encodeURIComponent(id)}`);
  }

  adminCreateSection(body: unknown) {
    return this.client.post("/api/admin/sections", body);
  }

  adminPatchSection(id: string, body: unknown) {
    return this.client.patch(
      `/api/admin/sections/${encodeURIComponent(id)}`,
      body
    );
  }

  adminDeleteSection(id: string) {
    return this.client.delete(`/api/admin/sections/${encodeURIComponent(id)}`);
  }
}
