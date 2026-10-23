/** Roles that may use the API. Only students are issued tokens. */
export const USER_ROLE_VALUES = ["STUDENT"] as const;
export type UserRole = (typeof USER_ROLE_VALUES)[number];

/** Minimal authenticated user (`{ id, email }`) as returned by the API. */
export interface AuthUser {
  id: string;
  email: string;
  /** Optional display name — not returned by the auth API; may be hydrated client-side. */
  name?: string;
}

/** POST /api/v1/auth/login */
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
}

/** POST /api/v1/auth/refresh */
export interface RefreshRequest {
  refreshToken: string;
}

export interface RefreshResponse {
  accessToken: string;
  refreshToken: string;
}

/** POST /api/v1/auth/logout */
export interface LogoutRequest {
  refreshToken: string;
}

export interface LogoutResponse {
  success: boolean;
}

/** GET /api/v1/auth/me */
export interface MeResponse {
  user: AuthUser;
  isOnboarded: boolean;
}

export interface ErrorResponse {
  error: string;
}
