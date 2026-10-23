import AsyncStorage from '@react-native-async-storage/async-storage';
import { BookmarkItem, ChapterProgress, UserProfile } from '../types/curriculum';

const STORAGE_KEYS = {
  BOOKMARKS: '@vidya_bookmarks',
  PROGRESS: '@vidya_chapter_progress',
  USER_PROFILE: '@vidya_user_profile',
};

const DEFAULT_PROFILE: UserProfile = {
  displayName: '',
  firstName: '',
  lastName: '',
  dateOfBirth: '',
  gender: '',
  activeClassId: '',
  schoolName: '',
  location: '',
  district: '',
  section: '',
  rollNumber: '',
  medium: '',
  fatherName: '',
  motherName: '',
  guardianName: '',
  guardianPhone: '',
  parentPhone: '',
  academicYear: '',
  isOnboarded: false,
  streakDays: 0,
  avatarUrl: '',
  studyGoalMinutes: 0,
};

// ========================
// USER PROFILE & CLASS
// ========================
export const getUserProfile = async (): Promise<UserProfile> => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.USER_PROFILE);
    if (!data) return DEFAULT_PROFILE;
    return { ...DEFAULT_PROFILE, ...JSON.parse(data) };
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
