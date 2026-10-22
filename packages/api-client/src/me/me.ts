import { ApiClient } from "../client";

/** Student profile / progress / bookmarks / study-stats. */
export class MeApi {
  constructor(private readonly client: ApiClient) {}

  getProfile() {
    return this.client.get("/api/me/profile");
  }

  patchProfile(body: unknown) {
    return this.client.patch("/api/me/profile", body);
  }

  getProgress() {
    return this.client.get("/api/me/progress");
  }

  putChapterProgress(chapterId: string, body: unknown) {
    return this.client.put(
      `/api/me/progress/chapters/${encodeURIComponent(chapterId)}`,
      body
    );
  }

  completeSection(sectionId: string, body?: unknown) {
    return this.client.post(
      `/api/me/progress/sections/${encodeURIComponent(sectionId)}/complete`,
      body ?? {}
    );
  }

  listBookmarks() {
    return this.client.get("/api/me/bookmarks");
  }

  addBookmark(body: unknown) {
    return this.client.post("/api/me/bookmarks", body);
  }

  deleteBookmark(id: string) {
    return this.client.delete(`/api/me/bookmarks/${encodeURIComponent(id)}`);
  }

  studyStats(range = "7d") {
    return this.client.get(`/api/me/study-stats?range=${encodeURIComponent(range)}`);
  }
}
