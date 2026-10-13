import AsyncStorage from '@react-native-async-storage/async-storage';
import { AdminUser } from '../types/auth';

export const AUTH_STORAGE_KEY = '@vidya_admin_profile_data';

export const DEFAULT_ADMIN: AdminUser = {
  id: 'admin-001-vidya',
  fullName: 'Admin Name',
  email: 'admin@vidyalearning.com',
  phone: 'Not configured',
  role: 'Admin',
  department: 'Academic Director · AP SCERT Division',
  lastLogin: 'Active Session',
};

export const DEMO_ADMIN = DEFAULT_ADMIN;

/**
 * Returns the current active administrator profile from storage
 */
export const getStoredSession = async (): Promise<AdminUser> => {
  try {
    const raw = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      const cleanedUser: AdminUser = {
        ...DEFAULT_ADMIN,
        ...parsed,
        role: 'Admin',
      };
      // Overwrite any legacy stored 'Super Admin'
      if (parsed.role !== 'Admin') {
        await saveStoredSession(cleanedUser);
      }
      return cleanedUser;
    }
  } catch (err) {
    console.warn('Failed to load admin session:', err);
  }
  return DEFAULT_ADMIN;
};

/**
 * Saves updated administrator profile to storage
 */
export const saveStoredSession = async (user: AdminUser): Promise<void> => {
  try {
    await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
  } catch (err) {
    console.warn('Failed to save admin session:', err);
  }
};

/**
 * Direct login bypass
 */
export const loginAdmin = async (email?: string, password?: string): Promise<AdminUser> => {
  return getStoredSession();
};

/**
 * Reset local session or cache
 */
export const logoutAdmin = async (): Promise<void> => {
  await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
};

