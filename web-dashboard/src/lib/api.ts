import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const API_URL = process.env.API_URL ?? "http://127.0.0.1:4000";
export const ACCESS_COOKIE = "vidya_access";
export const REFRESH_COOKIE = "vidya_refresh";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public body: unknown = null,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export type ApiInit = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  headers?: Record<string, string>;
};

const readError = async (res: Response): Promise<unknown> => {
  const text = await res.text().catch(() => "");
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
};

const errorMessage = (body: unknown, status: number): string => {
  if (typeof body === "string" && body.trim()) return body;
  if (body && typeof body === "object") {
    const record = body as Record<string, unknown>;
    const message = record.message ?? record.error;
    if (typeof message === "string") return message;
    if (Array.isArray(message)) return message.join(", ");
  }
  return `Request failed: ${status}`;
};

async function send<T>(
  path: string,
  init: ApiInit,
  token: string | null,
): Promise<T> {
  const headers: Record<string, string> = {
    Accept: "application/json",
    ...(init.headers ?? {}),
  };

  let body: BodyInit | undefined;
  if (init.body !== undefined) {
    headers["Content-Type"] = "application/json";
    body = JSON.stringify(init.body);
  }
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, {
    method: init.method ?? "GET",
    headers,
    body,
    cache: "no-store",
  });

  if (!res.ok) {
    const parsed = await readError(res);
    throw new ApiError(res.status, errorMessage(parsed, res.status), parsed);
  }

  if (res.status === 204) return undefined as T;
  const text = await res.text();
  if (!text) return undefined as T;
  return JSON.parse(text) as T;
}

export async function getAccessToken() {
  return (await cookies()).get(ACCESS_COOKIE)?.value ?? null;
}

export async function getRefreshToken() {
  return (await cookies()).get(REFRESH_COOKIE)?.value ?? null;
}

export async function requireAccessToken() {
  const token = await getAccessToken();
  if (!token) redirect("/login");
  return token;
}

/** Authenticated request. Redirects to /login when the session is gone. */
export async function api<T = unknown>(
  path: string,
  init: ApiInit = {},
): Promise<T> {
  const token = await requireAccessToken();
  try {
    return await send<T>(path, init, token);
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) redirect("/login");
    throw error;
  }
}

/** Multipart upload with the current access token. */
export async function apiForm<T = unknown>(
  path: string,
  form: FormData,
): Promise<T> {
  const token = await requireAccessToken();
  const res = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: form,
    cache: "no-store",
  });
  if (!res.ok) {
    if (res.status === 401) redirect("/login");
    const parsed = await readError(res);
    throw new ApiError(res.status, errorMessage(parsed, res.status), parsed);
  }
  const text = await res.text();
  return (text ? JSON.parse(text) : undefined) as T;
}

/** Public API calls that do not need auth (e.g. login, refresh). */
export async function publicApi<T = unknown>(
  path: string,
  init: RequestInit,
): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(init.headers ?? {}),
    },
    cache: "no-store",
  });
  if (!res.ok) {
    const parsed = await readError(res);
    throw new ApiError(res.status, errorMessage(parsed, res.status), parsed);
  }
  const text = await res.text();
  return (text ? JSON.parse(text) : undefined) as T;
}
