import { ApiError } from "./errors";

export type ApiClientOptions = {
  baseUrl: string;
  authToken?: string | null;
};

/**
 * Thin fetch wrapper. Construct with a base URL string or `{ baseUrl, authToken }`.
 */
export class ApiClient {
  private readonly baseUrl: string;
  private accessToken?: string;

  constructor(
    baseUrlOrOptions: string | ApiClientOptions,
    accessToken?: string
  ) {
    if (typeof baseUrlOrOptions === "string") {
      this.baseUrl = baseUrlOrOptions;
      this.accessToken = accessToken;
    } else {
      this.baseUrl = baseUrlOrOptions.baseUrl;
      this.accessToken = baseUrlOrOptions.authToken ?? undefined;
    }
  }

  setAccessToken(token: string | undefined | null) {
    this.accessToken = token ?? undefined;
  }

  /** Alias used by admin-mobile. */
  setAuthToken(token: string | undefined | null) {
    this.setAccessToken(token);
  }

  getAuthToken(): string | null {
    return this.accessToken ?? null;
  }

  private async request<T>(path: string, init: RequestInit = {}): Promise<T> {
    const headers = new Headers(init.headers);
    headers.set("Content-Type", "application/json");
    headers.set("Accept", "application/json");

    if (this.accessToken) {
      headers.set("Authorization", `Bearer ${this.accessToken}`);
    }

    const controller = new AbortController();
    const timeoutMs = 15000;
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(`${this.baseUrl}${path}`, {
        ...init,
        headers,
        signal: controller.signal,
      });

      if (!response.ok) {
        const body = await response.json().catch(() => ({
          error: "Request failed",
        }));

        throw new ApiError(
          response.status,
          (body as { error?: string }).error ?? "Request failed"
        );
      }

      return response.json() as Promise<T>;
    } catch (err) {
      if (err instanceof ApiError) throw err;
      if (err instanceof Error && err.name === "AbortError") {
        throw new Error(
          `Request timed out after ${timeoutMs / 1000}s — is the API reachable at ${this.baseUrl}?`
        );
      }
      throw err;
    } finally {
      clearTimeout(timeout);
    }
  }

  get<T>(path: string) {
    return this.request<T>(path);
  }

  post<T>(path: string, body?: unknown) {
    return this.request<T>(path, {
      method: "POST",
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  }
}
