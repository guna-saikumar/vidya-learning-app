import { useEffect, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../store';
import {
  fetchProfileThunk,
  updateProfileThunk,
} from '../store/slices/studentSlice';
import {
  fetchProgressThunk,
  saveChapterProgressThunk,
  fetchBookmarksThunk,
  addBookmarkThunk,
  deleteBookmarkThunk,
} from '../store/slices/progressSlice';
import { BookmarkItem, UserProfile } from '../types/curriculum';

let lastFetchedAt = 0;
const CACHE_TTL_MS = 60000; // 1 minute in-memory cache TTL

export const useLearningProgress = () => {
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const profile = useAppSelector((state) => state.student.profile);
  const studentLoading = useAppSelector((state) => state.student.loading);
  const progressMap = useAppSelector((state) => state.progress.progressMap);
  const bookmarks = useAppSelector((state) => state.progress.bookmarks);
  const progressLoading = useAppSelector((state) => state.progress.loading);

  const loading = isAuthenticated && studentLoading && !profile;

  const refreshData = useCallback(
    async (force = false) => {
      if (!isAuthenticated) return;
      const now = Date.now();
      const isStale = now - lastFetchedAt > CACHE_TTL_MS;
      const hasData = !!profile && Object.keys(progressMap).length > 0;

      if (!force && hasData && !isStale) {
        return;
      }

      lastFetchedAt = now;
      await Promise.all([
        dispatch(fetchProfileThunk()),
        dispatch(fetchProgressThunk()),
        dispatch(fetchBookmarksThunk()),
      ]);
    },
    [dispatch, isAuthenticated, profile, progressMap]
  );

  useEffect(() => {
    const hasData = !!profile && Object.keys(progressMap).length > 0;
    const isStale = Date.now() - lastFetchedAt > CACHE_TTL_MS;
    if (!hasData || isStale) {
      refreshData();
    }
  }, [refreshData, profile, progressMap]);

  const selectActiveGrade = async (gradeId: string) => {
    await dispatch(updateProfileThunk({ activeClassId: gradeId }));
  };

  const saveProfile = async (updates: Partial<UserProfile>): Promise<UserProfile> => {
    const res = await dispatch(updateProfileThunk(updates));
    return (res.payload as UserProfile) || profile!;
  };

  const handleToggleChapterCompletion = async (
    classId: string,
    subjectId: string,
    chapterId: string
  ) => {
    const current = progressMap[chapterId];
    const isCompleted = !current?.completed;
    const progressPercent = isCompleted ? 100 : 0;

    await dispatch(
      saveChapterProgressThunk({
        chapterId,
        progressPercent,
        completed: isCompleted,
      })
    );
    return isCompleted;
  };

  const handleToggleBookmark = async (item: Omit<BookmarkItem, 'id' | 'dateAdded'>) => {
    const existing = bookmarks.find((b) => {
      if (item.sectionId) {
        return b.chapterId === item.chapterId && b.sectionId === item.sectionId;
      }
      // Chapter-level toggle must not match section bookmarks on the same chapter.
      return (
        b.chapterId === item.chapterId &&
        !b.sectionId &&
        (b.type === 'chapter' || !item.type || item.type === 'chapter')
      );
    });

    if (existing) {
      await dispatch(deleteBookmarkThunk(existing.id));
      return false;
    } else {
      await dispatch(
        addBookmarkThunk({
          chapterId: item.chapterId,
          sectionId: item.sectionId,
          previewText: item.previewText,
          title: item.title,
          subtitle: item.subtitle,
          classId: item.classId,
          subjectId: item.subjectId,
          type: item.type || (item.sectionId ? 'section' : 'chapter'),
        })
      );
      return true;
    }
  };

  return {
    loading,
    profile,
    progressMap,
    bookmarks,
    refreshData,
    selectActiveGrade,
    saveProfile,
    handleToggleChapterCompletion,
    handleToggleBookmark,
  };
};
