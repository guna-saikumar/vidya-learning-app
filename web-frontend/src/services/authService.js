import { apiClient, extractErrorMessage } from '../lib/apiClient';
import { storage } from '../lib/storage';

export async function loginStudent(email, password) {
  const res = await apiClient.post('/api/v1/auth/login', {
    email,
    password,
  });
  const { accessToken, refreshToken, isOnboarded: loginIsOnboarded } = res.data;
  storage.setAccessToken(accessToken);
  storage.setRefreshToken(refreshToken);

  // hydrate user + onboarding status
  let user = res.data.user || { email };
  let isOnboarded = loginIsOnboarded;
  try {
    const meRes = await apiClient.get('/api/v1/auth/me');
    if (meRes.data?.user) {
      user = meRes.data.user;
    }
    if (typeof meRes.data?.isOnboarded === 'boolean') {
      isOnboarded = meRes.data.isOnboarded;
    }
  } catch {
    // fallback to login response
  }

  const fullUser = { ...user, isOnboarded: !!isOnboarded };
  storage.setUser(fullUser);
  return { user: fullUser, isOnboarded: !!isOnboarded };
}

export async function validateSession() {
  const token = storage.getAccessToken();
  if (!token) return null;
  try {
    const meRes = await apiClient.get('/api/v1/auth/me');
    const u = {
      ...meRes.data.user,
      isOnboarded: !!meRes.data.isOnboarded,
    };
    storage.setUser(u);
    return u;
  } catch {
    // try refresh once
    const refreshToken = storage.getRefreshToken();
    if (refreshToken) {
      try {
        const r = await apiClient.post('/api/v1/auth/refresh', {
          refreshToken,
        });
        storage.setAccessToken(r.data.accessToken);
        storage.setRefreshToken(r.data.refreshToken);
        const meRes = await apiClient.get('/api/v1/auth/me');
        const u = {
          ...meRes.data.user,
          isOnboarded: !!meRes.data.isOnboarded,
        };
        storage.setUser(u);
        return u;
      } catch {
        storage.clearAuth();
        return null;
      }
    }
    storage.clearAuth();
    return null;
  }
}

export async function logoutStudent() {
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
