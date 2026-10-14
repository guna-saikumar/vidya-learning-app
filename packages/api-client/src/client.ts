import { ApiError } from "./errors";

export class ApiClient {
  constructor(
    private readonly baseUrl: string,
    private accessToken?: string
  ) {}

  setAccessToken(token: string | undefined) {
    this.accessToken = token;
  }

  private async request<T>(
    path: string,
    init: RequestInit = {}
  ): Promise<T> {
    const headers = new Headers(init.headers);

    headers.set("Content-Type", "application/json");

    if (this.accessToken) {
      headers.set("Authorization", `Bearer ${this.accessToken}`);
    }

    const response = await fetch(
      `${this.baseUrl}${path}`,
      {
        ...init,
        headers,
      }
    );

    if (!response.ok) {
      const body = await response.json().catch(() => ({
        error: "Request failed",
      }));

      throw new ApiError(
        response.status,
        body.error ?? "Request failed"
      );
    }

    return response.json() as Promise<T>;
  }

  get<T>(path: string) {
    return this.request<T>(path);
  }

  post<T>(path: string, body: unknown) {
    return this.request<T>(path, {
      method: "POST",
      body: JSON.stringify(body),
    });
  }
}