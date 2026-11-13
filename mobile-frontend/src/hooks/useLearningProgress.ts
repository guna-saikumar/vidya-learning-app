import { useEffect, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../store';

import {
  fetchProfileThunk,
  updateProfileThunk,
  setStudentActiveClassId,
} from '../store/slices/studentSlice';
import { setActiveClassId } from '../store/slices/curriculumSlice';

import {
  fetchProgressThunk,
  saveChapterProgressThunk,
  toggleSectionCompletionThunk,
  recordChapterVisit,
  fetchBookmarksThunk,
  addBookmarkThunk,
  deleteBookmarkThunk,
} from '../store/slices/progressSlice';
import { fetchNotificationsThunk } from '../store/slices/notificationsSlice';

import { BookmarkItem, UserProfile } from '../types/curriculum';

const CACHE_TTL_MS = 60000;

// Module-level so every screen using this hook shares one refresh cycle and
// one set of API calls instead of firing duplicates on mount.
let lastFetchedAt = 0;
let lastFetchedUserId: string | null = null;
let inFlightRefresh: Promise<void> | null = null;

export const resetLearningProgressCache = () => {
  lastFetchedAt = 0;
  lastFetchedUserId = null;
  inFlightRefresh = null;
};

export const useLearningProgress = () => {
  const dispatch = useAppDispatch();

  const isAuthenticated = useAppSelector(
    (state) => state.auth.isAuthenticated
  );
  const userId = useAppSelector((state) => state.auth.user?.id ?? null);

  const profile = useAppSelector((state) => state.student.profile);
  const studentLoading = useAppSelector((state) => state.student.loading);

  const progressMap = useAppSelector(
    (state) => state.progress.progressMap
  );

  const bookmarks = useAppSelector(
    (state) => state.progress.bookmarks
  );
  const bookmarksLoading = useAppSelector(
    (state) => state.progress.bookmarksLoading
  );
  const bookmarksError = useAppSelector(
    (state) => state.progress.bookmarksError
  );
  const bookmarksSource = useAppSelector(
    (state) => state.progress.bookmarksSource
  );
  const deletingBookmarkIds = useAppSelector(
    (state) => state.progress.deletingBookmarkIds
  );

  const loading = isAuthenticated && studentLoading && !profile;

  // Fetch profile, progress and bookmarks.
  const refreshData = useCallback(
    async (force = false) => {
      if (!isAuthenticated || !userId) {
        lastFetchedAt = 0;
        lastFetchedUserId = null;
        return;
      }

      const now = Date.now();
      const userChanged = lastFetchedUserId !== userId;
      const isStale =
        force || userChanged || !profile || now - lastFetchedAt > CACHE_TTL_MS;

      if (!isStale) {
        return;
      }

      if (inFlightRefresh) {
        await inFlightRefresh;

        // If the account changed while the previous refresh was running, fall
        // through and start a fresh cycle for the new user.
        if (lastFetchedUserId === userId) {
          return;
        }
      }

      lastFetchedAt = now;
      lastFetchedUserId = userId;

      const task = (async () => {
        const results = await Promise.allSettled([
          dispatch(fetchProfileThunk()).unwrap(),
          dispatch(fetchProgressThunk()).unwrap(),
          dispatch(fetchBookmarksThunk()).unwrap(),
          dispatch(fetchNotificationsThunk()).unwrap(),
        ]);

        // Allow another fetch if one of the requests failed.
        if (results.some((result) => result.status === 'rejected')) {
          lastFetchedAt = 0;
        }
      })();

      inFlightRefresh = task;
      try {
        await task;
      } finally {
        if (inFlightRefresh === task) {
          inFlightRefresh = null;
        }
      }
    },
    [dispatch, isAuthenticated, userId]
  );

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Update active grade.
  const selectActiveGrade = async (gradeId: string) => {
    dispatch(setStudentActiveClassId(gradeId));
    dispatch(setActiveClassId(gradeId));
    await dispatch(
      updateProfileThunk({ activeClassId: gradeId })
    ).unwrap();
  };

  // Update profile.
  const saveProfile = async (
    updates: Partial<UserProfile>
  ): Promise<UserProfile> => {
    const result = await dispatch(
      updateProfileThunk(updates)
    ).unwrap();

    return (result as UserProfile) || profile!;
  };

  // Toggle chapter completion.
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
        subjectId,
        classId,
        progressPercent,
        completed: isCompleted,
      })
    ).unwrap();

    return isCompleted;
  };

  // Toggle topic/section completion. Optimistic & instant response.
  const handleToggleSectionCompletion = async (
    classId: string,
    subjectId: string,
    chapterId: string,
    sectionId: string,
    totalSectionsCount: number,
    completed?: boolean
  ) => {
    return await dispatch(
      toggleSectionCompletionThunk({
        classId,
        subjectId,
        chapterId,
        sectionId,
        totalSectionsCount,
        completed,
      })
    ).unwrap();
  };

  // Record visit to chapter/topic to accurately power Continue Learning.
  const recordVisit = useCallback((classId: string, subjectId: string, chapterId: string) => {
    dispatch(recordChapterVisit({ classId, subjectId, chapterId }));
  }, [dispatch]);

  // Add or remove a bookmark. Redux is the only source of truth for the list;
  // the server call must succeed before local state changes.
  const handleToggleBookmark = async (
    item: Omit<BookmarkItem, 'id' | 'dateAdded'>
  ) => {
    const sectionId = item.sectionId || undefined;

    // Match on the full target (chapter + section + type). Without the type,
    // a chapter bookmark could be mistaken for a section bookmark.
    const existing = bookmarks.find(
      (bookmark) =>
        bookmark.chapterId === item.chapterId &&
        (bookmark.sectionId || undefined) === sectionId &&
        bookmark.type === item.type
    );

    if (existing) {
      if (deletingBookmarkIds.includes(existing.id)) {
        return false;
      }

      await dispatch(deleteBookmarkThunk(existing.id)).unwrap();
      return false;
    }

    await dispatch(
      addBookmarkThunk({
        classId: item.classId,
        subjectId: item.subjectId,
        chapterId: item.chapterId,
        sectionId,
        title: item.title,
        subtitle: item.subtitle,
        type: item.type,
        previewText: item.previewText,
      })
    ).unwrap();

    return true;
  };

  // Remove bookmark only after the server confirms. Optimistic removal makes
  // deleteBookmarkThunk think the bookmark is already gone and skip the API call.
  const removeBookmark = async (id: string) => {
    if (deletingBookmarkIds.includes(id)) {
      return;
    }

    await dispatch(deleteBookmarkThunk(id)).unwrap();
  };

  return {
    loading,
    profile,
    progressMap,
    bookmarks,
    bookmarksLoading,
    bookmarksError,
    bookmarksSource,
    deletingBookmarkIds,
    refreshData,
    selectActiveGrade,
    saveProfile,
    handleToggleChapterCompletion,
    handleToggleSectionCompletion,
    recordVisit,
    handleToggleBookmark,
    removeBookmark,
  };
};
