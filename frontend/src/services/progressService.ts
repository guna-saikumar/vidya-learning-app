import AsyncStorage from '@react-native-async-storage/async-storage';

import { ChapterProgress, UserProfile } from '../types/curriculum';

import { studentsApi } from './apiClient';

import {
  DEFAULT_USER_PROFILE,
  normalizeProfile,
  toApiProfilePatch,
} from './profileMapper';

const STORAGE_KEYS = {
  PROGRESS: '@vidya_chapter_progress',
  USER_PROFILE: '@vidya_user_profile',
};

const DEFAULT_PROFILE = DEFAULT_USER_PROFILE;

// ==================================================
// USER PROFILE & CLASS
// ==================================================

export const getUserProfile = async (): Promise<UserProfile> => {
  try {
    const apiProfile = await studentsApi.getProfile();

    if (apiProfile) {
      const profile = normalizeProfile(apiProfile);

      await AsyncStorage.setItem(
        STORAGE_KEYS.USER_PROFILE,
        JSON.stringify(profile)
      );

      return profile;
    }
  } catch {
    // Offline fallback
  }

  try {
    const data = await AsyncStorage.getItem(
      STORAGE_KEYS.USER_PROFILE
    );

    if (!data) {
      return DEFAULT_PROFILE;
    }

    return normalizeProfile(JSON.parse(data));
  } catch {
    return DEFAULT_PROFILE;
  }
};

export const updateActiveGrade = async (
  classId: string
): Promise<void> => {
  try {
    const profile = await getUserProfile();

    const updated = {
      ...profile,
      activeClassId: classId,
    };

    await AsyncStorage.setItem(
      STORAGE_KEYS.USER_PROFILE,
      JSON.stringify(updated)
    );

    await studentsApi.updateProfile(
      toApiProfilePatch({ activeClassId: classId })
    );
  } catch (error) {
    console.error('Failed to update active grade:', error);
    throw error;
  }
};

export const updateUserProfile = async (
  updates: Partial<UserProfile>
): Promise<UserProfile> => {
  const current = await getUserProfile();

  const merged = {
    ...current,
    ...updates,
  };

  await studentsApi.updateProfile(
    toApiProfilePatch(updates)
  );

  await AsyncStorage.setItem(
    STORAGE_KEYS.USER_PROFILE,
    JSON.stringify(merged)
  );

  return merged;
};

// ==================================================
// LEARNING PROGRESS
// ==================================================

export const getAllProgress = async (): Promise<
  Record<string, ChapterProgress>
> => {
  try {
    const res = await studentsApi.getProgress();

    const progress = res?.chapters ?? res ?? {};

    await AsyncStorage.setItem(
      STORAGE_KEYS.PROGRESS,
      JSON.stringify(progress)
    );

    return progress;
  } catch {
    // Offline fallback
  }

  try {
    const data = await AsyncStorage.getItem(
      STORAGE_KEYS.PROGRESS
    );

    return data ? JSON.parse(data) : {};
  } catch {
    return {};
  }
};

export const getChapterProgress = async (
  chapterId: string
): Promise<ChapterProgress | null> => {
  const all = await getAllProgress();

  return all[chapterId] || null;
};

export const recordChapterVisit = async (
  classId: string,
  subjectId: string,
  chapterId: string
): Promise<void> => {
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

  const newPercent = Math.max(
    existing.progressPercent,
    20
  );

  all[chapterId] = {
    ...existing,
    lastAccessed: Date.now(),
    progressPercent: newPercent,
  };

  await AsyncStorage.setItem(
    STORAGE_KEYS.PROGRESS,
    JSON.stringify(all)
  );

  await studentsApi.updateProgress(chapterId, {
    progressPercent: newPercent,
    completed: existing.completed,
  });
};

export const toggleChapterCompletion = async (
  classId: string,
  subjectId: string,
  chapterId: string
): Promise<boolean> => {
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

  const newPercent = newCompleted ? 100 : 50;

  all[chapterId] = {
    ...existing,
    completed: newCompleted,
    progressPercent: newPercent,
    lastAccessed: Date.now(),
  };

  await studentsApi.updateProgress(chapterId, {
    progressPercent: newPercent,
    completed: newCompleted,
  });

  await AsyncStorage.setItem(
    STORAGE_KEYS.PROGRESS,
    JSON.stringify(all)
  );

  return newCompleted;
};

export const markSectionCompleted = async (
  classId: string,
  subjectId: string,
  chapterId: string,
  sectionId: string,
  totalSectionsCount: number
): Promise<void> => {
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

  const sections = new Set(
    existing.completedSections || []
  );

  sections.add(sectionId);

  const updatedSections = Array.from(sections);

  const percent = Math.min(
    100,
    Math.round(
      (updatedSections.length /
        Math.max(1, totalSectionsCount)) *
        100
    )
  );

  const completed = percent === 100;

  all[chapterId] = {
    ...existing,
    completedSections: updatedSections,
    progressPercent: percent,
    completed,
    lastAccessed: Date.now(),
  };

  await studentsApi.updateProgress(chapterId, {
    progressPercent: percent,
    completed,
    sectionId,
  });

  await AsyncStorage.setItem(
    STORAGE_KEYS.PROGRESS,
    JSON.stringify(all)
  );
};
