import { useState, useEffect, useCallback } from 'react';
import {
  getAllProgress,
  getAllBookmarks,
  getUserProfile,
  seedInitialDataIfNeeded,
  updateActiveGrade,
  toggleChapterCompletion,
  toggleBookmark,
} from '../services/progressService';
import { BookmarkItem, ChapterProgress, UserProfile } from '../../../../packages/curriculum/src/curriculum.types';

export const useLearningProgress = () => {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [progressMap, setProgressMap] = useState<Record<string, ChapterProgress>>({});
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([]);

  const refreshData = useCallback(async () => {
    try {
      await seedInitialDataIfNeeded();
      const [uProfile, uProgress, uBookmarks] = await Promise.all([
        getUserProfile(),
        getAllProgress(),
        getAllBookmarks(),
      ]);
      setProfile(uProfile);
      setProgressMap(uProgress);
      setBookmarks(uBookmarks);
    } catch (err) {
      console.error('Error loading learning data in hook:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const selectActiveGrade = async (gradeId: string) => {
    await updateActiveGrade(gradeId);
    await refreshData();
  };

  const handleToggleChapterCompletion = async (classId: string, subjectId: string, chapterId: string) => {
    const newState = await toggleChapterCompletion(classId, subjectId, chapterId);
    await refreshData();
    return newState;
  };

  const handleToggleBookmark = async (item: Omit<BookmarkItem, 'id' | 'dateAdded'>) => {
    const newState = await toggleBookmark(item);
    await refreshData();
    return newState;
  };

  return {
    loading,
    profile,
    progressMap,
    bookmarks,
    refreshData,
    selectActiveGrade,
    handleToggleChapterCompletion,
    handleToggleBookmark,
  };
};
