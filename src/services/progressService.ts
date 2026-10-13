import AsyncStorage from '@react-native-async-storage/async-storage';
import { BookmarkItem, ChapterProgress, UserProfile } from '../types/curriculum';

const STORAGE_KEYS = {
  BOOKMARKS: '@vidya_bookmarks',
  PROGRESS: '@vidya_chapter_progress',
  USER_PROFILE: '@vidya_user_profile',
  INITIALIZED: '@vidya_seeded_v1',
};

const DEFAULT_PROFILE: UserProfile = {
  displayName: 'Aarav Sharma',
  activeClassId: 'class-8',
  streakDays: 5,
  avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDwylJurXETzm0O1bhmUGXVZdrY4NZVe9bRVUKtWzV1pB3NMIS5iXL8yOYRJmYNOqbnFDfG9V0rOQVa0dhBzEIffjXwwNVgcTerM-rX9HvUfPs9WQ1Q_s81-mctf8krdw9dTXms5dUDGlQ_8o4Nj1Mr7mMG6mTSXA0jFoTw-bVtaKfHTWGdXQLFgHKt5TwMawFgBjZ-MozBABBOpECp8ro6P4lQCv-5YrbgDcLvz353lW4IGnhlqR9t',
  studyGoalMinutes: 45,
};

// Seed initial demo data matching the Stitch design if empty
export const seedInitialDataIfNeeded = async (): Promise<void> => {
  try {
    const isSeeded = await AsyncStorage.getItem(STORAGE_KEYS.INITIALIZED);
    if (!isSeeded) {
      const initialProgress: Record<string, ChapterProgress> = {
        'c8-m-ch1': {
          chapterId: 'c8-m-ch1',
          subjectId: 'c8-maths',
          classId: 'class-8',
          completed: false,
          completedSections: ['c8-m-ch1-s1', 'c8-m-ch1-s2'],
          progressPercent: 75,
          lastAccessed: Date.now() - 3600 * 1000 * 2, // 2 hours ago
        },
        'c8-sci-ch2': {
          chapterId: 'c8-sci-ch2',
          subjectId: 'c8-science',
          classId: 'class-8',
          completed: false,
          completedSections: ['c8-sci-ch2-s1'],
          progressPercent: 40,
          lastAccessed: Date.now() - 3600 * 1000 * 5, // 5 hours ago
        },
        'c8-m-ch2': {
          chapterId: 'c8-m-ch2',
          subjectId: 'c8-maths',
          classId: 'class-8',
          completed: false,
          completedSections: ['c8-m-ch2-s1'],
          progressPercent: 60,
          lastAccessed: Date.now() - 3600 * 1000 * 24, // 1 day ago
        },
        'c8-soc-ch1': {
          chapterId: 'c8-soc-ch1',
          subjectId: 'c8-social',
          classId: 'class-8',
          completed: true,
          completedSections: ['c8-soc-ch1-s1'],
          progressPercent: 100,
          lastAccessed: Date.now() - 3600 * 1000 * 48,
        },
      };

      const initialBookmarks: BookmarkItem[] = [
        {
          id: 'bm-math-closure',
          classId: 'class-8',
          subjectId: 'c8-maths',
          chapterId: 'c8-m-ch1',
          sectionId: 'c8-m-ch1-s2',
          title: 'Distributive & Closure Formula',
          subtitle: 'Class 8 • Mathematics • Ch 1',
          type: 'formula',
          dateAdded: Date.now() - 3600 * 1000 * 12,
          previewText: 'a(b + c) = ab + ac (Applicable for Addition & Multiplication in ℚ)',
        },
        {
          id: 'bm-sci-pasteur',
          classId: 'class-8',
          subjectId: 'c8-science',
          chapterId: 'c8-sci-ch2',
          sectionId: 'c8-sci-ch2-s1',
          title: 'Fermentation & Pasteurization Process',
          subtitle: 'Class 8 • Science • Ch 2',
          type: 'section',
          dateAdded: Date.now() - 3600 * 1000 * 72,
          previewText: 'Louis Pasteur (1857) - Conversion of sugar into alcohol by yeast',
        },
        {
          id: 'bm-math-ch1',
          classId: 'class-8',
          subjectId: 'c8-maths',
          chapterId: 'c8-m-ch1',
          title: 'Rational Numbers Master Chapter',
          subtitle: 'Class 8 • Mathematics',
          type: 'chapter',
          dateAdded: Date.now() - 3600 * 1000 * 24,
          previewText: 'Complete notes and practice problems for Rational Numbers',
        },
      ];

      await AsyncStorage.setItem(STORAGE_KEYS.PROGRESS, JSON.stringify(initialProgress));
      await AsyncStorage.setItem(STORAGE_KEYS.BOOKMARKS, JSON.stringify(initialBookmarks));
      await AsyncStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(DEFAULT_PROFILE));
      await AsyncStorage.setItem(STORAGE_KEYS.INITIALIZED, 'true');
    }
  } catch (error) {
    console.error('Failed to seed initial demo data:', error);
  }
};

// ========================
// USER PROFILE & CLASS
// ========================
export const getUserProfile = async (): Promise<UserProfile> => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.USER_PROFILE);
    return data ? JSON.parse(data) : DEFAULT_PROFILE;
  } catch {
    return DEFAULT_PROFILE;
  }
};

export const updateActiveGrade = async (classId: string): Promise<void> => {
  try {
    const profile = await getUserProfile();
    const updated = { ...profile, activeClassId: classId };
    await AsyncStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(updated));
  } catch (error) {
    console.error('Failed to update active grade:', error);
  }
};

export const updateUserProfile = async (updates: Partial<UserProfile>): Promise<UserProfile> => {
  try {
    const current = await getUserProfile();
    const merged = { ...current, ...updates };
    await AsyncStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(merged));
    return merged;
  } catch {
    return DEFAULT_PROFILE;
  }
};

// ========================
// LEARNING PROGRESS
// ========================
export const getAllProgress = async (): Promise<Record<string, ChapterProgress>> => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.PROGRESS);
    return data ? JSON.parse(data) : {};
  } catch {
    return {};
  }
};

export const getChapterProgress = async (chapterId: string): Promise<ChapterProgress | null> => {
  const all = await getAllProgress();
  return all[chapterId] || null;
};

export const recordChapterVisit = async (
  classId: string,
  subjectId: string,
  chapterId: string
): Promise<void> => {
  try {
    const all = await getAllProgress();
    const existing = all[chapterId] || {
      chapterId,
      subjectId,
      classId,
      completed: false,
      completedSections: [],
      progressPercent: 20,
      lastAccessed: Date.now(),
    };

    all[chapterId] = {
      ...existing,
      lastAccessed: Date.now(),
      progressPercent: Math.max(existing.progressPercent, 20),
    };
    await AsyncStorage.setItem(STORAGE_KEYS.PROGRESS, JSON.stringify(all));
  } catch (error) {
    console.error('Error recording chapter visit:', error);
  }
};

export const toggleChapterCompletion = async (
  classId: string,
  subjectId: string,
  chapterId: string
): Promise<boolean> => {
  try {
    const all = await getAllProgress();
    const existing = all[chapterId] || {
      chapterId,
      subjectId,
      classId,
      completed: false,
      completedSections: [],
      progressPercent: 0,
      lastAccessed: Date.now(),
    };

    const newCompleted = !existing.completed;
    all[chapterId] = {
      ...existing,
      completed: newCompleted,
      progressPercent: newCompleted ? 100 : 50,
      lastAccessed: Date.now(),
    };

    await AsyncStorage.setItem(STORAGE_KEYS.PROGRESS, JSON.stringify(all));
    return newCompleted;
  } catch (error) {
    console.error('Error toggling chapter completion:', error);
    return false;
  }
};

export const markSectionCompleted = async (
  classId: string,
  subjectId: string,
  chapterId: string,
  sectionId: string,
  totalSectionsCount: number
): Promise<void> => {
  try {
    const all = await getAllProgress();
    const existing = all[chapterId] || {
      chapterId,
      subjectId,
      classId,
      completed: false,
      completedSections: [],
      progressPercent: 0,
      lastAccessed: Date.now(),
    };

    const sections = new Set(existing.completedSections);
    sections.add(sectionId);
    const updatedSections = Array.from(sections);
    const percent = Math.min(100, Math.round((updatedSections.length / Math.max(1, totalSectionsCount)) * 100));

    all[chapterId] = {
      ...existing,
      completedSections: updatedSections,
      progressPercent: percent,
      completed: percent === 100,
      lastAccessed: Date.now(),
    };

    await AsyncStorage.setItem(STORAGE_KEYS.PROGRESS, JSON.stringify(all));
  } catch (error) {
    console.error('Error marking section completed:', error);
  }
};

// ========================
// BOOKMARKS
// ========================
export const getAllBookmarks = async (): Promise<BookmarkItem[]> => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.BOOKMARKS);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

export const isChapterBookmarked = async (chapterId: string): Promise<boolean> => {
  const bookmarks = await getAllBookmarks();
  return bookmarks.some((b) => b.chapterId === chapterId && b.type === 'chapter');
};

export const toggleBookmark = async (item: Omit<BookmarkItem, 'id' | 'dateAdded'>): Promise<boolean> => {
  try {
    const bookmarks = await getAllBookmarks();
    const existingIndex = bookmarks.findIndex(
      (b) => b.chapterId === item.chapterId && b.sectionId === item.sectionId && b.type === item.type
    );

    if (existingIndex >= 0) {
      // Remove bookmark
      bookmarks.splice(existingIndex, 1);
      await AsyncStorage.setItem(STORAGE_KEYS.BOOKMARKS, JSON.stringify(bookmarks));
      return false;
    } else {
      // Add bookmark
      const newItem: BookmarkItem = {
        ...item,
        id: `bm-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        dateAdded: Date.now(),
      };
      bookmarks.unshift(newItem);
      await AsyncStorage.setItem(STORAGE_KEYS.BOOKMARKS, JSON.stringify(bookmarks));
      return true;
    }
  } catch (error) {
    console.error('Error toggling bookmark:', error);
    return false;
  }
};

export const removeBookmark = async (id: string): Promise<void> => {
  try {
    const bookmarks = await getAllBookmarks();
    const filtered = bookmarks.filter((b) => b.id !== id);
    await AsyncStorage.setItem(STORAGE_KEYS.BOOKMARKS, JSON.stringify(filtered));
  } catch (error) {
    console.error('Error removing bookmark:', error);
  }
};
