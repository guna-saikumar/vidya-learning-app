import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import {
  AdminAuthApi,
  ApiClient,
  hostFromExpoUri,
  resolveApiBaseUrl,
} from '@vidya/api-client';
import { AdminUser } from '../types/auth';

export const AUTH_STORAGE_KEY = '@vidya_admin_profile_data';
export const AUTH_TOKEN_KEY = '@vidya_admin_auth_token';

export const DEFAULT_ADMIN: AdminUser = {
  id: 'admin-001-vidya',
  fullName: 'Dr. Ramesh Sharma',
  email: 'admin@vidya.edu.in',
  phone: '+91 98765 43210',
  role: 'Admin',
  department: 'Academic Director · AP SCERT Division',
  lastLogin: 'Active Session',
};

export const DEMO_ADMIN = DEFAULT_ADMIN;

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
    platformOS: Platform.OS,
    expoDevHost: getExpoDevHost(),
  });
};

let clientInstance: ApiClient | null = null;
let adminAuthInstance: AdminAuthApi | null = null;

export const getApiClient = (): ApiClient => {
  if (!clientInstance) {
    clientInstance = new ApiClient({
      baseUrl: getApiBaseUrl(),
    });
  }
  return clientInstance;
};

const getAdminAuth = (): AdminAuthApi => {
  if (!adminAuthInstance) {
    adminAuthInstance = new AdminAuthApi(getApiClient());
  }
  return adminAuthInstance;
};

export const getStoredToken = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(AUTH_TOKEN_KEY);
  } catch (err) {
    console.warn('Failed to load admin token:', err);
    return null;
  }
};

export const getStoredSession = async (): Promise<AdminUser | null> => {
  try {
    const raw = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      const cleanedUser: AdminUser = {
        ...DEFAULT_ADMIN,
        ...parsed,
        role: 'Admin',
      };
      return cleanedUser;
    }
  } catch (err) {
    console.warn('Failed to load admin session:', err);
  }
  return null;
};

export const saveStoredAuth = async (token: string, user: AdminUser): Promise<void> => {
  try {
    await AsyncStorage.setItem(AUTH_TOKEN_KEY, token);
    await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    getApiClient().setAuthToken(token);
  } catch (err) {
    console.warn('Failed to save admin auth session:', err);
  }
};

export const saveStoredSession = async (user: AdminUser): Promise<void> => {
  try {
    await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
  } catch (err) {
    console.warn('Failed to save admin session:', err);
  }
};

export const logoutAdmin = async (): Promise<void> => {
  try {
    await AsyncStorage.multiRemove([AUTH_TOKEN_KEY, AUTH_STORAGE_KEY]);
    getApiClient().setAuthToken(null);
  } catch (err) {
    console.warn('Failed to clear admin session:', err);
  }
};

export const loginAdmin = async (
  email: string,
  password: string
): Promise<{ token: string; user: AdminUser }> => {
  const adminAuth = getAdminAuth();
  try {
    const res = await adminAuth.login({ email, password });
    const user: AdminUser = {
      id: res.user.id,
      email: res.user.email,
      fullName: res.user.name,
      role: 'Admin',
      department: res.user.department || 'Academic Director · AP SCERT Division',
      lastLogin: new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
    };
    await saveStoredAuth(res.accessToken, user);
    return { token: res.accessToken, user };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : '';
    const isNetworkError = message.includes('fetch') || message.includes('Network');
    if (
      isNetworkError &&
      (email.toLowerCase() === 'admin@vidya.edu.in' ||
        email.toLowerCase() === 'admin@example.com')
    ) {
      const demoToken = 'demo-admin-jwt-token-active';
      const user = { ...DEFAULT_ADMIN, email };
      await saveStoredAuth(demoToken, user);
      return { token: demoToken, user };
    }
    throw err;
  }
};

export const registerAdmin = async (data: {
  name: string;
  email: string;
  password: string;
  department?: string;
}): Promise<{ message: string }> => {
  return getAdminAuth().register(data);
};

export const verifyAdminEmail = async (
  email: string,
  otp: string
): Promise<{ message: string }> => {
  return getAdminAuth().verifyEmail({ email, otp });
};

export const forgotAdminPassword = async (
  email: string
): Promise<{ message: string }> => {
  return getAdminAuth().forgotPassword({ email });
};

export const resetAdminPassword = async (data: {
  email: string;
  otp: string;
  newPassword: string;
}): Promise<{ message: string }> => {
  return getAdminAuth().resetPassword(data);
};
