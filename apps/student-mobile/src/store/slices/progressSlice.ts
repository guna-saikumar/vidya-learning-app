import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { studentsApi } from '../../services/apiClient';
import { normalizeBookmark } from '../../services/profileMapper';
import { BookmarkItem, ChapterProgress } from '../../types/curriculum';

const STORAGE_KEYS = {
  BOOKMARKS: '@vidya_bookmarks',
  PROGRESS: '@vidya_chapter_progress',
};

export interface ProgressState {
  progressMap: Record<string, ChapterProgress>;
  overallPercent: number;
  bookmarks: BookmarkItem[];
  loading: boolean;
  error: string | null;
}

const initialState: ProgressState = {
  progressMap: {},
  overallPercent: 0,
  bookmarks: [],
  loading: false,
  error: null,
};

export const fetchProgressThunk = createAsyncThunk(
  'progress/fetchProgress',
  async (_, { rejectWithValue }) => {
    try {
      const res = await studentsApi.getProgress();
      const progress = res.chapters || res;
      await AsyncStorage.setItem(STORAGE_KEYS.PROGRESS, JSON.stringify(progress));
      return {
        progressMap: progress,
        overallPercent: res.overallPercent || 0,
      };
    } catch {
      try {
        const cached = await AsyncStorage.getItem(STORAGE_KEYS.PROGRESS);
        if (cached) {
          return { progressMap: JSON.parse(cached), overallPercent: 0 };
        }
      } catch {}
      return { progressMap: {}, overallPercent: 0 };
    }
  }
);

export const saveChapterProgressThunk = createAsyncThunk(
  'progress/saveChapterProgress',
  async (
    {
      chapterId,
      progressPercent,
      completed,
      sectionId,
      subjectId = '',
      classId = '',
    }: {
      chapterId: string;
      progressPercent: number;
      completed: boolean;
      sectionId?: string;
      subjectId?: string;
      classId?: string;
    },
    { getState }
  ) => {
    try {
      // Send to PostgreSQL
      await studentsApi.updateProgress(chapterId, { progressPercent, completed, sectionId });
    } catch (e) {
      console.warn('API progress save failed, updating locally:', e);
    }

    const state = getState() as any;
    const current = { ...(state.progress?.progressMap || {}) };
    const prev = current[chapterId] || {};
    const updated: ChapterProgress = {
      chapterId,
      subjectId: subjectId || prev.subjectId || '',
      classId: classId || prev.classId || '',
      progressPercent,
      completed,
      lastAccessed: Date.now(),
      completedSections: prev.completedSections || [],
    };
    current[chapterId] = updated;
    await AsyncStorage.setItem(STORAGE_KEYS.PROGRESS, JSON.stringify(current));

    return updated;
  }
);

export const fetchBookmarksThunk = createAsyncThunk(
  'progress/fetchBookmarks',
  async (_, { rejectWithValue }) => {
    try {
      const res = await studentsApi.getBookmarks();
      if (Array.isArray(res)) {
        const bookmarks = res.map((row) =>
          normalizeBookmark(row as Record<string, unknown>)
        );
        await AsyncStorage.setItem(
          STORAGE_KEYS.BOOKMARKS,
          JSON.stringify(bookmarks)
        );
        return bookmarks;
      }
      return [];
    } catch {
      try {
        const cached = await AsyncStorage.getItem(STORAGE_KEYS.BOOKMARKS);
        if (cached) {
          const parsed = JSON.parse(cached) as unknown[];
          return Array.isArray(parsed)
            ? parsed.map((row) =>
                normalizeBookmark(row as Record<string, unknown>)
              )
            : [];
        }
      } catch {}
      return [];
    }
  }
);

export const addBookmarkThunk = createAsyncThunk(
  'progress/addBookmark',
  async (
    bookmarkData: {
      chapterId: string;
      sectionId?: string;
      previewText?: string;
      title?: string;
      subtitle?: string;
      classId?: string;
      subjectId?: string;
      type?: 'chapter' | 'section' | 'formula';
    },
    { getState }
  ) => {
    try {
      const created = await studentsApi.addBookmark({
        chapterId: bookmarkData.chapterId,
        sectionId: bookmarkData.sectionId,
        previewText: bookmarkData.previewText,
      });
      const apiBookmark = (created?.bookmark || created) as Record<string, unknown>;
      return normalizeBookmark({
        ...apiBookmark,
        title: bookmarkData.title || apiBookmark.title || apiBookmark.chapterTitle,
        subtitle:
          bookmarkData.subtitle ||
          apiBookmark.subtitle ||
          apiBookmark.sectionTitle ||
          apiBookmark.subjectName,
        classId: bookmarkData.classId || apiBookmark.classId,
        subjectId: bookmarkData.subjectId || apiBookmark.subjectId,
        type: bookmarkData.type || (bookmarkData.sectionId ? 'section' : 'chapter'),
        previewText: bookmarkData.previewText || apiBookmark.previewText,
        chapterId: bookmarkData.chapterId,
        sectionId: bookmarkData.sectionId,
      });
    } catch (e) {
      // Fallback local bookmark
      const fallback: BookmarkItem = {
        id: `bm-${Date.now()}`,
        chapterId: bookmarkData.chapterId,
        sectionId: bookmarkData.sectionId,
        title: bookmarkData.title || bookmarkData.previewText || 'Bookmark',
        subtitle: bookmarkData.subtitle || '',
        classId: bookmarkData.classId || '',
        subjectId: bookmarkData.subjectId || '',
        type: bookmarkData.type || (bookmarkData.sectionId ? 'section' : 'chapter'),
        previewText: bookmarkData.previewText || '',
        dateAdded: Date.now(),
      };
      return fallback;
    }
  }
);

export const deleteBookmarkThunk = createAsyncThunk(
  'progress/deleteBookmark',
  async (bookmarkId: string) => {
    try {
      await studentsApi.deleteBookmark(bookmarkId);
    } catch (e) {
      console.warn('API bookmark delete failed, updating local state:', e);
    }
    return bookmarkId;
  }
);

const progressSlice = createSlice({
  name: 'progress',
  initialState,
  reducers: {
    setProgressLocal: (state, action: PayloadAction<Record<string, ChapterProgress>>) => {
      state.progressMap = action.payload;
    },
  },
  extraReducers: (builder) => {
    // fetch progress
    builder.addCase(fetchProgressThunk.fulfilled, (state, action) => {
      state.progressMap = action.payload.progressMap;
      state.overallPercent = action.payload.overallPercent;
    });

    // save chapter progress
    builder.addCase(saveChapterProgressThunk.fulfilled, (state, action) => {
      state.progressMap[action.payload.chapterId] = action.payload;
    });

    // fetch bookmarks
    builder.addCase(fetchBookmarksThunk.fulfilled, (state, action) => {
      state.bookmarks = action.payload;
    });

    // add bookmark
    builder.addCase(addBookmarkThunk.fulfilled, (state, action) => {
      state.bookmarks.unshift(action.payload);
    });

    // delete bookmark
    builder.addCase(deleteBookmarkThunk.fulfilled, (state, action) => {
      state.bookmarks = state.bookmarks.filter((b) => b.id !== action.payload);
    });
  },
});

export const { setProgressLocal } = progressSlice.actions;
export default progressSlice.reducer;
