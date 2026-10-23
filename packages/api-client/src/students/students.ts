import { ApiClient } from "../client";

export type StudentLanguage = "en" | "te";

export type ChapterProgressEntry = {
  progressPercent: number;
  completed: boolean;
  lastAccessedAt: string;
  lastSectionId: string | null;
};

export type StudentProgress = {
  overallPercent: number;
  chapters: Record<string, ChapterProgressEntry>;
};

/** Student profile, onboarding, settings, avatar, progress, bookmarks (`/api/v1/students/me/*`). */
export class StudentsApi {
  constructor(private readonly client: ApiClient) {}

  getProfile<T = unknown>() {
    return this.client.get<T>("/api/v1/students/me/profile");
  }

  submitOnboarding<T = unknown>(body: unknown) {
    return this.client.put<T>("/api/v1/students/me/onboarding", body);
  }

  patchProfile<T = unknown>(body: unknown) {
    return this.client.patch<T>("/api/v1/students/me/profile", body);
  }

  uploadAvatar<T = { avatarUrl: string }>(form: FormData) {
    return this.client.postForm<T>("/api/v1/students/me/avatar", form);
  }

  deleteAvatar<T = unknown>() {
    return this.client.delete<T>("/api/v1/students/me/avatar");
  }

  patchSettings<T = unknown>(body: {
    language: StudentLanguage;
    notificationsEnabled: boolean;
  }) {
    return this.client.patch<T>("/api/v1/students/me/settings", body);
  }

  getProgress() {
    return this.client.get<StudentProgress>("/api/v1/students/me/progress");
  }

  putChapterProgress<T = unknown>(
    chapterId: string,
    body: { progressPercent: number; completed: boolean; sectionId?: string }
  ) {
    return this.client.put<T>(
      `/api/v1/students/me/progress/${encodeURIComponent(chapterId)}`,
      body
    );
  }

  listBookmarks<T = unknown>() {
    return this.client.get<T>("/api/v1/students/me/bookmarks");
  }

  addBookmark<T = unknown>(body: unknown) {
    return this.client.post<T>("/api/v1/students/me/bookmarks", body);
  }

  deleteBookmark<T = unknown>(bookmarkId: string) {
    return this.client.delete<T>(
      `/api/v1/students/me/bookmarks/${encodeURIComponent(bookmarkId)}`
    );
  }

  deleteBookmarkBySection<T = unknown>(sectionId: string) {
    return this.client.delete<T>(
      `/api/v1/students/me/bookmarks/by-section/${encodeURIComponent(sectionId)}`
    );
  }
}
