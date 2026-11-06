import { apiClient, extractErrorMessage } from '../lib/apiClient';
import { storage } from '../lib/storage';
import type { AuthUser, LoginResponse, MeResponse, RefreshResponse } from '../types/auth';

export async function loginStudent(email: string, password: string): Promise<{
  user: AuthUser;
  isOnboarded: boolean;
}> {
  const res = await apiClient.post<LoginResponse>('/api/v1/auth/login', {
    email,
    password,
  });
  const { accessToken, refreshToken, user } = res.data;
  storage.setAccessToken(accessToken);
  storage.setRefreshToken(refreshToken);

  // hydrate user + onboarding status
  const meRes = await apiClient.get<MeResponse>('/api/v1/auth/me');
  storage.setUser(meRes.data.user);
  return { user: meRes.data.user, isOnboarded: meRes.data.isOnboarded };
}

export async function validateSession(): Promise<AuthUser | null> {
  const token = storage.getAccessToken();
  if (!token) return null;
  try {
    const meRes = await apiClient.get<MeResponse>('/api/v1/auth/me');
    storage.setUser(meRes.data.user);
    return meRes.data.user;
  } catch (err) {
    // try refresh once
    const refreshToken = storage.getRefreshToken();
    if (refreshToken) {
      try {
        const r = await apiClient.post<RefreshResponse>('/api/v1/auth/refresh', {
          refreshToken,
        });
        storage.setAccessToken(r.data.accessToken);
        storage.setRefreshToken(r.data.refreshToken);
        const meRes = await apiClient.get<MeResponse>('/api/v1/auth/me');
        storage.setUser(meRes.data.user);
        return meRes.data.user;
      } catch {
        storage.clearAuth();
        return null;
      }
    }
    storage.clearAuth();
    return null;
  }
}

export async function logoutStudent(): Promise<void> {
  const refreshToken = storage.getRefreshToken();
  if (refreshToken) {
    try {
      await apiClient.post('/api/v1/auth/logout', { refreshToken });
    } catch {
      // best effort
    }
  }
  storage.clearAuth();
}

export { extractErrorMessage };