import AsyncStorage from '@react-native-async-storage/async-storage';
import { SchoolClass, Subject, Chapter, Section } from '../types/curriculum';
import { LectureMaterial } from '../types/materials';

export interface PostgresConfig {
  host: string;
  port: number;
  database: string;
  apiUrl: string;
  isConnected: boolean;
}

export const POSTGRES_CONFIG: PostgresConfig = {
  host: process.env.EXPO_PUBLIC_POSTGRES_HOST || 'localhost',
  port: Number(process.env.EXPO_PUBLIC_POSTGRES_PORT || 5432),
  database: process.env.EXPO_PUBLIC_POSTGRES_DB || 'vidya_learning_db',
  apiUrl: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:4000/api',
  isConnected: false,
};

const SYNC_TIMESTAMP_KEY = '@vidya_postgres_last_sync_timestamp';

/**
 * Checks PostgreSQL API connectivity
 */
export const checkPostgresHealth = async (): Promise<{ ok: boolean; message: string }> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    const res = await fetch(`${POSTGRES_CONFIG.apiUrl.replace('/api', '')}/health`, {
      method: 'GET',
      signal: controller.signal,
    }).catch(() => null);

    clearTimeout(timeoutId);

    if (res && res.ok) {
      POSTGRES_CONFIG.isConnected = true;
      return { ok: true, message: 'Connected to Cloud Sync' };
    }
    return { ok: false, message: 'Cloud Sync offline · Using local cache' };
  } catch {
    return { ok: false, message: 'Offline mode active · Local storage enabled' };
  }
};

/**
 * Syncs local curriculum to PostgreSQL backend if online
 */
export const syncCurriculumToPostgres = async (classes: SchoolClass[]): Promise<boolean> => {
  try {
    const health = await checkPostgresHealth();
    if (!health.ok) return false;

    const res = await fetch(`${POSTGRES_CONFIG.apiUrl}/admin/curriculum/sync`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-role': 'ADMIN',
      },
      body: JSON.stringify({ classes }),
    });

    if (res.ok) {
      await AsyncStorage.setItem(SYNC_TIMESTAMP_KEY, new Date().toISOString());
      return true;
    }
    return false;
  } catch (err) {
    console.warn('PostgreSQL sync failed, kept in local store:', err);
    return false;
  }
};

/**
 * Fetches last sync timestamp
 */
export const getLastSyncTimestamp = async (): Promise<string | null> => {
  return AsyncStorage.getItem(SYNC_TIMESTAMP_KEY);
};
