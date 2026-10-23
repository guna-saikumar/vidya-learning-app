import { ApiClient } from "../client";

/** Read-only curriculum client (`/api/v1/curriculum`). */
export class CurriculumApi {
  constructor(private readonly client: ApiClient) {}

  listClasses<T = unknown>() {
    return this.client.get<T>("/api/v1/curriculum/classes");
  }

  listSubjects<T = unknown>(classId: string) {
    return this.client.get<T>(
      `/api/v1/curriculum/classes/${encodeURIComponent(classId)}/subjects`
    );
  }

  getSubject<T = unknown>(subjectId: string) {
    return this.client.get<T>(
      `/api/v1/curriculum/subjects/${encodeURIComponent(subjectId)}`
    );
  }

  getChapter<T = unknown>(chapterId: string) {
    return this.client.get<T>(
      `/api/v1/curriculum/chapters/${encodeURIComponent(chapterId)}`
    );
  }

  getSection<T = unknown>(sectionId: string) {
    return this.client.get<T>(
      `/api/v1/curriculum/sections/${encodeURIComponent(sectionId)}`
    );
  }
}
