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

export const useLearningProgress = () => {
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const profile = useAppSelector((state) => state.student.profile);
  const studentLoading = useAppSelector((state) => state.student.loading);
  const progressMap = useAppSelector((state) => state.progress.progressMap);
  const bookmarks = useAppSelector((state) => state.progress.bookmarks);
  const progressLoading = useAppSelector((state) => state.progress.loading);

  const loading = isAuthenticated && studentLoading && !profile;

  const refreshData = useCallback(async () => {
    if (!isAuthenticated) return;
    await Promise.all([
      dispatch(fetchProfileThunk()),
      dispatch(fetchProgressThunk()),
      dispatch(fetchBookmarksThunk()),
    ]);
  }, [dispatch, isAuthenticated]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

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
    const existing = bookmarks.find(
      (b) => b.chapterId === item.chapterId && (!item.sectionId || b.sectionId === item.sectionId)
    );

    if (existing) {
      await dispatch(deleteBookmarkThunk(existing.id));
      return false;
    } else {
      await dispatch(
        addBookmarkThunk({
          chapterId: item.chapterId,
          sectionId: item.sectionId,
          previewText: item.previewText,
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
