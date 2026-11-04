import AsyncStorage from '@react-native-async-storage/async-storage';

import { BookmarkItem } from '../types/curriculum';
import { normalizeBookmark } from './profileMapper';

/**
 * Bookmarks are cached per authenticated user. The old global key is never
 * read back, because it cannot be attributed to an account and could leak one
 * student's bookmarks into another student's session.
 */
const LEGACY_BOOKMARKS_KEY = '@vidya_bookmarks';
const BOOKMARKS_KEY_PREFIX = '@vidya_bookmarks:';
const CACHE_VERSION = 1;

type BookmarkCacheEnvelope = {
  version: number;
  userId: string;
  savedAt: number;
  bookmarks: BookmarkItem[];
};

const cacheKey = (userId: string) => `${BOOKMARKS_KEY_PREFIX}${userId}`;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export async function readBookmarkCache(
  userId: string
): Promise<BookmarkItem[] | null> {
  try {
    const raw = await AsyncStorage.getItem(cacheKey(userId));
    if (!raw) return null;

    const parsed: unknown = JSON.parse(raw);
    if (!isRecord(parsed)) return null;
    if (parsed.version !== CACHE_VERSION) return null;
    if (parsed.userId !== userId) return null;
    if (!Array.isArray(parsed.bookmarks)) return null;

    // Drop malformed legacy rows instead of letting one bad entry break the
    // whole offline list.
    const bookmarks: BookmarkItem[] = [];
    for (const row of parsed.bookmarks) {
      try {
        bookmarks.push(normalizeBookmark(row));
      } catch {
        // Ignore invalid cached rows.
      }
    }
    return bookmarks;
  } catch {
    return null;
  }
}

export async function writeBookmarkCache(
  userId: string,
  bookmarks: BookmarkItem[]
): Promise<void> {
  const envelope: BookmarkCacheEnvelope = {
    version: CACHE_VERSION,
    userId,
    savedAt: Date.now(),
    bookmarks,
  };

  try {
    await AsyncStorage.setItem(cacheKey(userId), JSON.stringify(envelope));
    // Remove the unscoped cache written by older app versions.
    await AsyncStorage.removeItem(LEGACY_BOOKMARKS_KEY);
  } catch (error) {
    // The cache is best-effort; Redux already holds the server-confirmed list.
    console.warn('Failed to persist bookmark cache:', error);
  }
}

/** Clears every bookmark cache, regardless of which account wrote it. */
export async function clearBookmarkCaches(): Promise<void> {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const bookmarkKeys = keys.filter(
      (key) =>
        key === LEGACY_BOOKMARKS_KEY || key.startsWith(BOOKMARKS_KEY_PREFIX)
    );
    if (bookmarkKeys.length > 0) {
      await AsyncStorage.multiRemove(bookmarkKeys);
    }
  } catch {
    // Cache cleanup must never block logout.
  }
}
