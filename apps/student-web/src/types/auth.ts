export interface AuthUser {
  id: string;
  email: string;
  name?: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
}

export interface MeResponse {
  user: AuthUser;
  isOnboarded: boolean;
}

export interface RefreshResponse {
  accessToken: string;
  refreshToken: string;
}