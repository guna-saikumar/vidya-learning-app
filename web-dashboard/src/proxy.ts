import { NextResponse, type NextRequest } from "next/server";

const ACCESS_COOKIE = "vidya_access";
const REFRESH_COOKIE = "vidya_refresh";
const API_URL = process.env.API_URL ?? "http://127.0.0.1:4000";

const ACCESS_MAX_AGE = 15 * 60;
const REFRESH_MAX_AGE = 30 * 24 * 60 * 60;

const cookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
};

const decodeBase64Url = (value: string) => {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(
    normalized.length + ((4 - (normalized.length % 4)) % 4),
    "=",
  );
  return atob(padded);
};

const jwtExpiry = (token: string): number | null => {
  try {
    const payload = JSON.parse(decodeBase64Url(token.split(".")[1] ?? ""));
    return typeof payload.exp === "number" ? payload.exp : null;
  } catch {
    return null;
  }
};

const refreshSession = async (refreshToken: string) => {
  try {
    const res = await fetch(`${API_URL}/api/v1/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
      cache: "no-store",
    });
    if (!res.ok) return null;
    const data = (await res.json()) as {
      accessToken?: string;
      refreshToken?: string;
    };
    if (!data.accessToken || !data.refreshToken) return null;
    return data as { accessToken: string; refreshToken: string };
  } catch {
    return null;
  }
};

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isLogin = pathname === "/login";
  const accessToken = request.cookies.get(ACCESS_COOKIE)?.value;
  const refreshToken = request.cookies.get(REFRESH_COOKIE)?.value;

  const expiry = accessToken ? jwtExpiry(accessToken) : null;
  const now = Math.floor(Date.now() / 1000);
  const accessValid = Boolean(accessToken) && (expiry === null || expiry - 30 > now);

  if (accessValid) {
    if (isLogin) return NextResponse.redirect(new URL("/", request.url));
    return NextResponse.next();
  }

  if (refreshToken) {
    const refreshed = await refreshSession(refreshToken);
    if (refreshed) {
      request.cookies.set(ACCESS_COOKIE, refreshed.accessToken);
      request.cookies.set(REFRESH_COOKIE, refreshed.refreshToken);

      if (isLogin) {
        const response = NextResponse.redirect(new URL("/", request.url));
        response.cookies.set(ACCESS_COOKIE, refreshed.accessToken, {
          ...cookieOptions,
          maxAge: ACCESS_MAX_AGE,
        });
        response.cookies.set(REFRESH_COOKIE, refreshed.refreshToken, {
          ...cookieOptions,
          maxAge: REFRESH_MAX_AGE,
        });
        return response;
      }

      const response = NextResponse.next({ request });
      response.cookies.set(ACCESS_COOKIE, refreshed.accessToken, {
        ...cookieOptions,
        maxAge: ACCESS_MAX_AGE,
      });
      response.cookies.set(REFRESH_COOKIE, refreshed.refreshToken, {
        ...cookieOptions,
        maxAge: REFRESH_MAX_AGE,
      });
      return response;
    }
  }

  if (isLogin) return NextResponse.next();

  const loginUrl = new URL("/login", request.url);
  if (pathname !== "/") loginUrl.searchParams.set("next", pathname);
  const response = NextResponse.redirect(loginUrl);
  response.cookies.delete(ACCESS_COOKIE);
  response.cookies.delete(REFRESH_COOKIE);
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
