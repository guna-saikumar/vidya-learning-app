import { ApiClient } from "../client";

export class DoubtsApi {
  constructor(private readonly client: ApiClient) {}

  listDoubts<T = unknown>(chapterId: string, query?: { filter?: string; q?: string }) {
    const params = new URLSearchParams();
    if (query?.filter) params.set("filter", query.filter);
    if (query?.q) params.set("q", query.q);
    const qs = params.toString();
    return this.client.get<T>(
      `/api/v1/chapters/${encodeURIComponent(chapterId)}/doubts${qs ? `?${qs}` : ""}`
    );
  }

  createDoubt<T = unknown>(
    chapterId: string,
    body: { title: string; body: string; sectionId?: string }
  ) {
    return this.client.post<T>(
      `/api/v1/chapters/${encodeURIComponent(chapterId)}/doubts`,
      body
    );
  }

  getDoubtThread<T = unknown>(doubtId: string) {
    return this.client.get<T>(
      `/api/v1/doubts/${encodeURIComponent(doubtId)}`
    );
  }

  postAnswer<T = unknown>(doubtId: string, body: { body: string }) {
    return this.client.post<T>(
      `/api/v1/doubts/${encodeURIComponent(doubtId)}/answers`,
      body
    );
  }

  toggleUpvote<T = unknown>(doubtId: string) {
    return this.client.post<T>(
      `/api/v1/doubts/${encodeURIComponent(doubtId)}/upvote`
    );
  }

  toggleHelpful<T = unknown>(doubtId: string, answerId: string) {
    return this.client.post<T>(
      `/api/v1/doubts/${encodeURIComponent(doubtId)}/answers/${encodeURIComponent(answerId)}/helpful`
    );
  }

  resolveDoubt<T = unknown>(doubtId: string, body?: { acceptedAnswerId?: string }) {
    return this.client.post<T>(
      `/api/v1/doubts/${encodeURIComponent(doubtId)}/resolve`,
      body || {}
    );
  }
}
