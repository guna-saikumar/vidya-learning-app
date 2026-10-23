import {
  ApiClient,
  AuthApi,
  ApiError,
  hostFromExpoUri,
  resolveApiBaseUrl,
} from '@vidya/api-client';
import { AuthUser } from '@vidya/auth';

export const AUTH_TOKEN_KEY = '@vidya_student_auth_token';
export const AUTH_REFRESH_TOKEN_KEY = '@vidya_student_refresh_token';
export const AUTH_USER_KEY = '@vidya_student_user';

export interface StorageProvider {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
  multiRemove(keys: string[]): Promise<void>;
}

// In-memory fallback for test and server environments
const memoryMap = new Map<string, string>();
export const memoryStorage: StorageProvider = {
  getItem: async (key: string) => memoryMap.get(key) ?? null,
  setItem: async (key: string, val: string) => {
    memoryMap.set(key, val);
  },
  removeItem: async (key: string) => {
    memoryMap.delete(key);
  },
  multiRemove: async (keys: string[]) => {
    for (const k of keys) {
      memoryMap.delete(k);
    }
  },
};

let activeStorage: StorageProvider | null = null;

export const setStorageProvider = (provider: StorageProvider | null) => {
  activeStorage = provider;
};

export const getStorage = (): StorageProvider => {
  if (activeStorage) return activeStorage;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const asyncStorage = require('@react-native-async-storage/async-storage');
    activeStorage = asyncStorage.default || asyncStorage;
    return activeStorage!;
  } catch {
    return memoryStorage;
  }
};

const getPlatformOS = (): string => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const rn = require('react-native');
    return rn?.Platform?.OS || 'web';
  } catch {
    return 'web';
  }
};

const getExpoDevHost = (): string | null => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const Constants = require('expo-constants').default;
    return (
      hostFromExpoUri(Constants?.expoConfig?.hostUri) ??
      hostFromExpoUri(Constants?.manifest2?.extra?.expoClient?.hostUri) ??
      hostFromExpoUri(Constants?.linkingUri) ??
      hostFromExpoUri(Constants?.experienceUrl)
    );
  } catch {
    return null;
  }
};

/**
 * Resolves the Nest/Fastify API base URL for web, emulator, and Expo Go on device.
 * Physical devices use the Expo bundler host (LAN IP) — never phone-local localhost.
 */
export const getApiBaseUrl = (): string => {
  return resolveApiBaseUrl({
    envUrl: process.env.EXPO_PUBLIC_API_URL,
    platformOS: getPlatformOS(),
    expoDevHost: getExpoDevHost(),
  });
};

let clientInstance: ApiClient | null = null;
let authApiInstance: AuthApi | null = null;

export const getApiClient = (): ApiClient => {
  if (!clientInstance) {
    clientInstance = new ApiClient({
      baseUrl: getApiBaseUrl(),
    });
  }
  return clientInstance;
};

export const getAuthApi = (): AuthApi => {
  if (!authApiInstance) {
    authApiInstance = new AuthApi(getApiClient());
  }
  return authApiInstance;
};

/**
 * Reset instances (used for testing or environment changes).
 */
export const resetClientInstances = () => {
  clientInstance = null;
  authApiInstance = null;
  memoryMap.clear();
};

export const getStoredToken = async (): Promise<string | null> => {
  try {
    return await getStorage().getItem(AUTH_TOKEN_KEY);
  } catch (err) {
    console.warn('Failed to load student token from storage:', err);
    return null;
  }
};

export const getStoredRefreshToken = async (): Promise<string | null> => {
  try {
    return await getStorage().getItem(AUTH_REFRESH_TOKEN_KEY);
  } catch (err) {
    console.warn('Failed to load student refresh token from storage:', err);
    return null;
  }
};

export const getStoredUser = async (): Promise<AuthUser | null> => {
  try {
    const raw = await getStorage().getItem(AUTH_USER_KEY);
    if (raw) {
      return JSON.parse(raw) as AuthUser;
    }
  } catch (err) {
    console.warn('Failed to load student user from storage:', err);
  }
  return null;
};

export const saveStoredAuth = async (
  token: string,
  user: AuthUser,
  refreshToken?: string
): Promise<void> => {
  try {
    const storage = getStorage();
    await storage.setItem(AUTH_TOKEN_KEY, token);
    await storage.setItem(AUTH_USER_KEY, JSON.stringify(user));
    if (refreshToken) {
      await storage.setItem(AUTH_REFRESH_TOKEN_KEY, refreshToken);
    }
    getApiClient().setAccessToken(token);
  } catch (err) {
    console.warn('Failed to save student auth session:', err);
  }
};

export const clearStoredAuth = async (): Promise<void> => {
  try {
    const storage = getStorage();
    await storage.multiRemove([AUTH_TOKEN_KEY, AUTH_REFRESH_TOKEN_KEY, AUTH_USER_KEY]);
    getApiClient().setAccessToken(null);
  } catch (err) {
    console.warn('Failed to clear student auth session:', err);
  }
};

/**
 * Performs student login via POST /api/v1/auth/login, then hydrates
 * `isOnboarded` from GET /api/v1/auth/me.
 */
export const loginStudent = async (
  email: string,
  pass: string
): Promise<{
  token: string;
  refreshToken: string;
  user: AuthUser;
  isOnboarded: boolean;
}> => {
  const authApi = getAuthApi();
  const res = await authApi.login({
    email,
    password: pass,
  });

  getApiClient().setAccessToken(res.accessToken);
  const me = await authApi.me();

  await saveStoredAuth(res.accessToken, me.user, res.refreshToken);
  return {
    token: res.accessToken,
    refreshToken: res.refreshToken,
    user: me.user,
    isOnboarded: me.isOnboarded,
  };
};

/**
 * Exchanges the stored refresh token for a new access/refresh pair
 * (POST /api/v1/auth/refresh). Refresh tokens rotate, so both are persisted.
 * Returns the new access token, or null if the refresh token is missing/invalid.
 */
export const refreshAccessToken = async (): Promise<string | null> => {
  const refreshToken = await getStoredRefreshToken();
  if (!refreshToken) return null;

  try {
    const res = await getAuthApi().refresh(refreshToken);
    const storage = getStorage();
    await storage.setItem(AUTH_TOKEN_KEY, res.accessToken);
    await storage.setItem(AUTH_REFRESH_TOKEN_KEY, res.refreshToken);
    getApiClient().setAccessToken(res.accessToken);
    return res.accessToken;
  } catch (err) {
    if (err instanceof ApiError && (err.status === 401 || err.status === 403)) {
      return null;
    }
    throw err;
  }
};

/**
 * Validates session against GET /api/v1/auth/me on app launch or reload.
 * An expired access token is transparently renewed via the refresh token.
 * Returns the fresh AuthUser if session is valid, or null if expired/unauthenticated.
 */
export const validateSession = async (): Promise<AuthUser | null> => {
  const token = await getStoredToken();
  if (!token) {
    getApiClient().setAccessToken(null);
    return null;
  }

  getApiClient().setAccessToken(token);

  try {
    const authApi = getAuthApi();
    let me;
    try {
      me = await authApi.me();
    } catch (err) {
      if (!(err instanceof ApiError && err.status === 401)) throw err;
      // Access token expired — try the refresh token once.
      const renewed = await refreshAccessToken();
      if (!renewed) throw err;
      me = await authApi.me();
    }
    // Refresh cached user in storage
    await getStorage().setItem(AUTH_USER_KEY, JSON.stringify(me.user));
    return me.user;
  } catch (err) {
    if (err instanceof ApiError && (err.status === 401 || err.status === 403)) {
      // Session expired or invalid
      await clearStoredAuth();
      return null;
    }

    // Network error during reload: if cached user exists, return it to prevent harsh logout loop
    const cachedUser = await getStoredUser();
    if (cachedUser) {
      return cachedUser;
    }

    await clearStoredAuth();
    return null;
  }
};

/** Revokes the refresh token server-side (best effort) and clears local session. */
export const logoutStudent = async (): Promise<void> => {
  const refreshToken = await getStoredRefreshToken();
  if (refreshToken) {
    try {
      await getAuthApi().logout(refreshToken);
    } catch (err) {
      console.warn('Server logout failed (clearing local session anyway):', err);
    }
  }
  await clearStoredAuth();
};
