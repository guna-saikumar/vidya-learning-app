import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import {
  getStoredProgress,
  fetchProgress,
  saveChapterProgress,
  recordChapterVisit,
  getStoredBookmarks,
  fetchBookmarks,
  addBookmark,
  removeBookmark,
  removeBookmarkBySection,
} from '../services/progressService';

const LearningContext = createContext(undefined);

export const LearningProvider = ({ children }) => {
  const { user } = useAuth();
  const [progressMap, setProgressMap] = useState(() => getStoredProgress());
  const [overallPercent, setOverallPercent] = useState(0);
  const [bookmarks, setBookmarks] = useState(() => getStoredBookmarks());
  const [loading, setLoading] = useState(false);

  const refreshAll = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [progRes, bmRes] = await Promise.allSettled([
        fetchProgress(),
        fetchBookmarks(),
      ]);

      if (progRes.status === 'fulfilled' && progRes.value) {
        setProgressMap(progRes.value.progressMap);
        setOverallPercent(progRes.value.overallPercent || 0);
      }
      if (bmRes.status === 'fulfilled' && Array.isArray(bmRes.value)) {
        setBookmarks(bmRes.value);
      }
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Sync from PostgreSQL database whenever auth session is valid
  useEffect(() => {
    if (user) {
      void refreshAll();
    } else {
      // Clear or keep local cache
      setProgressMap(getStoredProgress());
      setBookmarks(getStoredBookmarks());
    }
  }, [user, refreshAll]);

  const saveProgress = useCallback(async (progress) => {
    // Instant optimistic update
    setProgressMap((prev) => ({
      ...prev,
      [progress.chapterId]: {
        ...(prev[progress.chapterId] || {}),
        ...progress,
        lastAccessed: Date.now(),
      },
    }));

    const updated = await saveChapterProgress(progress);
    setProgressMap({ ...updated });
    return updated;
  }, []);

  const toggleChapterComplete = useCallback(async (classId, subjectId, chapterId, allSectionIds = []) => {
    const current = progressMap[chapterId];
    const willBeCompleted = !current?.completed;
    const progressPercent = willBeCompleted ? 100 : 0;
    const nextSections = willBeCompleted ? allSectionIds : [];

    const updated = await saveProgress({
      chapterId,
      subjectId,
      classId,
      progressPercent,
      completed: willBeCompleted,
      completedSections: nextSections,
      lastAccessed: Date.now(),
    });
    return updated;
  }, [progressMap, saveProgress]);

  const toggleSectionComplete = useCallback(async (classId, subjectId, chapterId, sectionId, totalSectionsCount = 1) => {
    const current = progressMap[chapterId];
    const completedSections = current?.completedSections || [];
    const isDone = completedSections.includes(sectionId);
    const nextSections = isDone
      ? completedSections.filter((id) => id !== sectionId)
      : [...completedSections, sectionId];

    const percent = Math.min(
      100,
      Math.round((nextSections.length / Math.max(1, totalSectionsCount)) * 100)
    );

    const updated = await saveProgress({
      chapterId,
      subjectId,
      classId,
      progressPercent: percent,
      completed: percent === 100,
      completedSections: nextSections,
      sectionId,
      lastAccessed: Date.now(),
    });
    return updated;
  }, [progressMap, saveProgress]);

  const recordVisit = useCallback(async (classId, subjectId, chapterId) => {
    const updated = await recordChapterVisit(classId, subjectId, chapterId);
    setProgressMap({ ...updated });
  }, []);

  const handleAddBookmark = useCallback(async (item) => {
    const updated = await addBookmark(item);
    setBookmarks([...updated]);
    return updated;
  }, []);

  const handleRemoveBookmark = useCallback(async (bookmarkId) => {
    const updated = await removeBookmark(bookmarkId);
    setBookmarks([...updated]);
    return updated;
  }, []);

  const handleRemoveBookmarkBySection = useCallback(async (sectionId) => {
    const updated = await removeBookmarkBySection(sectionId);
    setBookmarks([...updated]);
    return updated;
  }, []);

  /**
   * Determine the most relevant "Continue Learning" chapter.
   * Mirrors mobile's selectEnrolledCurriculumStats logic:
   * 1. Filters in-progress chapters (!completed && (progressPercent > 0 || lastAccessed > 0))
   * 2. Sorts by lastAccessed descending (most recently studied chapter first)
   * 3. Falls back to first uncompleted chapter in enrolled curriculum
   */
  const getRecentContinueItem = useCallback((subjects) => {
    if (!subjects || !subjects.length) return null;

    const inProgress = [];
    for (const sub of subjects) {
      for (const ch of sub.chapters || []) {
        const p = progressMap[ch.id];
        if (
          p &&
          !p.completed &&
          ((p.progressPercent && p.progressPercent > 0) ||
            (p.completedSections && p.completedSections.length > 0) ||
            (p.lastAccessed && p.lastAccessed > 0))
        ) {
          inProgress.push({
            subject: sub,
            chapter: ch,
            progress: p.progressPercent || 0,
            completedSections: p.completedSections?.length || 0,
            totalSections: ch.sections?.length || 1,
            lastAccessed: p.lastAccessed || 0,
          });
        }
      }
    }

    if (inProgress.length > 0) {
      // Sort most recent visit first
      inProgress.sort((a, b) => (b.lastAccessed || 0) - (a.lastAccessed || 0));
      return inProgress[0];
    }

    // Default to the first uncompleted chapter in the syllabus
    for (const sub of subjects) {
      for (const ch of sub.chapters || []) {
        const p = progressMap[ch.id];
        if (!p || !p.completed) {
          return {
            subject: sub,
            chapter: ch,
            progress: p?.progressPercent || 0,
            completedSections: p?.completedSections?.length || 0,
            totalSections: ch.sections?.length || 1,
          };
        }
      }
    }

    // All chapters complete: return first chapter
    const firstSub = subjects[0];
    const firstCh = firstSub?.chapters?.[0];
    if (firstCh) {
      return {
        subject: firstSub,
        chapter: firstCh,
        progress: 100,
        completedSections: firstCh.sections?.length || 1,
        totalSections: firstCh.sections?.length || 1,
      };
    }

    return null;
  }, [progressMap]);

  return (
    <LearningContext.Provider
      value={{
        progressMap,
        overallPercent,
        bookmarks,
        loading,
        refreshAll,
        saveProgress,
        toggleChapterComplete,
        toggleSectionComplete,
        recordVisit,
        addBookmark: handleAddBookmark,
        removeBookmark: handleRemoveBookmark,
        removeBookmarkBySection: handleRemoveBookmarkBySection,
        getRecentContinueItem,
      }}
    >
      {children}
    </LearningContext.Provider>
  );
};

export const useLearningProgress = () => {
  const context = useContext(LearningContext);
  if (!context) {
    throw new Error('useLearningProgress must be used within a LearningProvider');
  }
  return context;
};
