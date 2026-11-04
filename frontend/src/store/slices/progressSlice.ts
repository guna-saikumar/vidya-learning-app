import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  AddBookmarkBody,
  getApiErrorMessage,
  isApiStatusError,
  isOfflineError,
  studentsApi,
} from '../../services/apiClient';
import { readBookmarkCache } from '../../services/bookmarkCache';
import { normalizeBookmark } from '../../services/profileMapper';

import { BookmarkItem, BookmarkType, ChapterProgress } from '../../types/curriculum';

import { logoutUserThunk, forceLogout } from './authSlice';

import type { RootState } from '../index';

const STORAGE_KEYS = {
  PROGRESS: '@vidya_chapter_progress',
};

export type BookmarkSource = 'server' | 'cache';

export interface ProgressState {
  progressMap: Record<string, ChapterProgress>;
  overallPercent: number;
  bookmarks: BookmarkItem[];
  /**
   * Incremented whenever the bookmark list is mutated locally (add/delete) or
   * the session changes. A fetch that started before the mutation must not
   * overwrite the newer result, so it compares its captured revision.
   */
  bookmarksRevision: number;
  bookmarksLoading: boolean;
  bookmarksError: string | null;
  bookmarksSource: BookmarkSource | null;
  deletingBookmarkIds: string[];
  loading: boolean;
  error: string | null;
}

const initialState: ProgressState = {
  progressMap: {},
  overallPercent: 0,
  bookmarks: [],
  bookmarksRevision: 0,
  bookmarksLoading: false,
  bookmarksError: null,
  bookmarksSource: null,
  deletingBookmarkIds: [],
  loading: false,
  error: null,
};

export interface AddBookmarkInput {
  classId: string;
  subjectId: string;
  chapterId: string;
  sectionId?: string;
  title: string;
  subtitle: string;
  type: BookmarkType;
  previewText?: string;
}

// --------------------------------------------------
// FETCH PROGRESS
// --------------------------------------------------

export const fetchProgressThunk = createAsyncThunk(
  'progress/fetchProgress',
  async () => {
    try {
      const res = await studentsApi.getProgress();

      const progress = res?.chapters ?? res ?? {};

      await AsyncStorage.setItem(
        STORAGE_KEYS.PROGRESS,
        JSON.stringify(progress)
      );

      return {
        progressMap: progress,
        overallPercent: res?.overallPercent ?? 0,
      };
    } catch {
      const cached = await AsyncStorage.getItem(STORAGE_KEYS.PROGRESS);

      return {
        progressMap: cached ? JSON.parse(cached) : {},
        overallPercent: 0,
      };
    }
  }
);

// --------------------------------------------------
// SAVE CHAPTER PROGRESS
// --------------------------------------------------

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
      await studentsApi.updateProgress(chapterId, {
        progressPercent,
        completed,
        sectionId,
      });
    } catch (error) {
      console.warn('API progress save failed:', error);
    }

    const state = getState() as { progress: ProgressState };

    const current = { ...state.progress.progressMap };
    const previous = current[chapterId];

    const updated: ChapterProgress = {
      chapterId,
      subjectId: subjectId || previous?.subjectId || '',
      classId: classId || previous?.classId || '',
      progressPercent,
      completed,
      lastAccessed: Date.now(),
      completedSections: previous?.completedSections || [],
    };

    current[chapterId] = updated;

    await AsyncStorage.setItem(
      STORAGE_KEYS.PROGRESS,
      JSON.stringify(current)
    );

    return updated;
  }
);

// --------------------------------------------------
// FETCH BOOKMARKS
// --------------------------------------------------

type FetchBookmarksResult = {
  bookmarks: BookmarkItem[];
  source: BookmarkSource;
  startRevision: number;
};

export const fetchBookmarksThunk = createAsyncThunk<
  FetchBookmarksResult,
  void,
  { state: RootState; rejectValue: string }
>(
  'progress/fetchBookmarks',
  async (_arg, { getState, rejectWithValue }) => {
    const state = getState();
    const userId = state.auth.user?.id;

    if (!userId) {
      return rejectWithValue('You need to sign in to load bookmarks.');
    }

    // Capture the revision before the request so a mutation that lands while
    // it is in flight wins over this (now stale) snapshot.
    const startRevision = state.progress.bookmarksRevision;

    try {
      const response = await studentsApi.getBookmarks();

      if (!Array.isArray(response)) {
        throw new Error('The server returned an invalid bookmarks response.');
      }

      // Throws on missing ids/target fields or an unknown bookmark type, so a
      // broken payload can never be turned into a fake local bookmark.
      const bookmarks = response.map((row) => normalizeBookmark(row));

      return { bookmarks, source: 'server', startRevision };
    } catch (error) {
      // Cache is an intentional offline fallback only. HTTP and contract
      // errors must surface to the UI instead of silently showing stale data.
      if (isOfflineError(error)) {
        const cached = await readBookmarkCache(userId);
        if (cached) {
          return { bookmarks: cached, source: 'cache', startRevision };
        }
      }

      return rejectWithValue(
        getApiErrorMessage(error, 'Failed to load bookmarks.')
      );
    }
  }
);

// --------------------------------------------------
// ADD BOOKMARK
// --------------------------------------------------

export const addBookmarkThunk = createAsyncThunk<
  BookmarkItem,
  AddBookmarkInput,
  { state: RootState; rejectValue: string }
>(
  'progress/addBookmark',
  async (input, { getState, rejectWithValue }) => {
    if (!getState().auth.user?.id) {
      return rejectWithValue('You need to sign in to save bookmarks.');
    }

    try {
      // Trim/limit to the server contract so long section content cannot turn
      // a valid bookmark into a 400 validation error.
      const title = input.title.trim();
      const subtitle = input.subtitle.trim();
      const previewText = input.previewText?.trim();

      const body: AddBookmarkBody = {
        chapterId: input.chapterId,
        type: input.type,
        ...(title ? { title: title.slice(0, 200) } : {}),
        ...(subtitle ? { subtitle: subtitle.slice(0, 200) } : {}),
        ...(previewText
          ? { previewText: previewText.slice(0, 2000) }
          : {}),
      };
      if (input.sectionId) {
        body.sectionId = input.sectionId;
      }

      // The server is the source of truth: no local bookmark is created unless
      // this call succeeds and returns the persisted row.
      const response = await studentsApi.addBookmark(body);
      const bookmark = normalizeBookmark(response.bookmark);

      const expectedSectionId = input.sectionId || undefined;
      const returnedSectionId = bookmark.sectionId || undefined;

      if (
        bookmark.chapterId !== input.chapterId ||
        returnedSectionId !== expectedSectionId ||
        bookmark.type !== input.type
      ) {
        throw new Error(
          'The server returned a bookmark for a different target.'
        );
      }

      return bookmark;
    } catch (error) {
      return rejectWithValue(
        getApiErrorMessage(error, 'Failed to save bookmark.')
      );
    }
  }
);

// --------------------------------------------------
// DELETE BOOKMARK
// --------------------------------------------------

type DeleteBookmarkResult = {
  id: string;
  /** `skipped` means another delete for this id is already in flight. */
  status: 'deleted' | 'skipped';
};

/**
 * Guards against duplicate DELETE requests when the UI dispatches twice before
 * Redux has re-rendered the disabled state.
 */
const inFlightDeletes = new Set<string>();

export const deleteBookmarkThunk = createAsyncThunk<
  DeleteBookmarkResult,
  string,
  { state: RootState; rejectValue: string }
>(
  'progress/deleteBookmark',
  async (bookmarkId, { getState, rejectWithValue }) => {
    const state = getState();

    if (!state.auth.user?.id) {
      return rejectWithValue('You need to sign in to remove bookmarks.');
    }

    // Already removed locally (e.g. two lists rendered the same bookmark).
    const existing = state.progress.bookmarks.find(
      (bookmark) => bookmark.id === bookmarkId
    );
    if (!existing) {
      return { id: bookmarkId, status: 'deleted' };
    }

    if (inFlightDeletes.has(bookmarkId)) {
      return { id: bookmarkId, status: 'skipped' };
    }

    inFlightDeletes.add(bookmarkId);
    try {
      await studentsApi.deleteBookmark(bookmarkId);
      return { id: bookmarkId, status: 'deleted' };
    } catch (error) {
      // A 404 means the desired server state is already true.
      if (isApiStatusError(error, 404)) {
        return { id: bookmarkId, status: 'deleted' };
      }

      // Never drop the bookmark from Redux/cache when the server failed.
      return rejectWithValue(
        getApiErrorMessage(error, 'Failed to remove bookmark.')
      );
    } finally {
      inFlightDeletes.delete(bookmarkId);
    }
  }
);

// --------------------------------------------------
// SLICE
// --------------------------------------------------

function resetBookmarks(state: ProgressState) {
  state.bookmarks = [];
  // Invalidate any fetch/delete that started before the session changed.
  state.bookmarksRevision += 1;
  state.bookmarksLoading = false;
  state.bookmarksError = null;
  state.bookmarksSource = null;
  state.deletingBookmarkIds = [];
}

const progressSlice = createSlice({
  name: 'progress',
  initialState,

  reducers: {
    setProgressLocal: (
      state,
      action: PayloadAction<Record<string, ChapterProgress>>
    ) => {
      state.progressMap = action.payload;
    },
  },

  extraReducers: (builder) => {
    // Fetch progress
    builder
      .addCase(fetchProgressThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProgressThunk.fulfilled, (state, action) => {
        state.progressMap = action.payload.progressMap;
        state.overallPercent = action.payload.overallPercent;
        state.loading = false;
      })
      .addCase(fetchProgressThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch progress';
      });

    // Save progress
    builder.addCase(saveChapterProgressThunk.fulfilled, (state, action) => {
      state.progressMap[action.payload.chapterId] = action.payload;
    });

    // Fetch bookmarks
    builder
      .addCase(fetchBookmarksThunk.pending, (state) => {
        state.bookmarksLoading = true;
        state.bookmarksError = null;
      })
      .addCase(fetchBookmarksThunk.fulfilled, (state, action) => {
        state.bookmarksLoading = false;

        // An add/delete or logout happened while this request was in flight;
        // keep the newer local state instead of overwriting it.
        if (state.bookmarksRevision !== action.payload.startRevision) {
          return;
        }

        state.bookmarks = action.payload.bookmarks;
        state.bookmarksSource = action.payload.source;
        state.bookmarksError = null;
      })
      .addCase(fetchBookmarksThunk.rejected, (state, action) => {
        state.bookmarksLoading = false;
        state.bookmarksError =
          action.payload ??
          action.error.message ??
          'Failed to load bookmarks.';
      });

    // Add bookmark
    builder
      .addCase(addBookmarkThunk.pending, (state) => {
        state.bookmarksError = null;
      })
      .addCase(addBookmarkThunk.fulfilled, (state, action) => {
        state.bookmarksRevision += 1;
        state.bookmarks = [
          action.payload,
          ...state.bookmarks.filter(
            (bookmark) => bookmark.id !== action.payload.id
          ),
        ];
        state.bookmarksSource = 'server';
        state.bookmarksError = null;
      })
      .addCase(addBookmarkThunk.rejected, (state, action) => {
        state.bookmarksError =
          action.payload ??
          action.error.message ??
          'Failed to save bookmark.';
      });

    // Delete bookmark
    builder
      .addCase(deleteBookmarkThunk.pending, (state, action) => {
        state.bookmarksError = null;
        if (!state.deletingBookmarkIds.includes(action.meta.arg)) {
          state.deletingBookmarkIds.push(action.meta.arg);
        }
      })
      .addCase(deleteBookmarkThunk.fulfilled, (state, action) => {
        state.deletingBookmarkIds = state.deletingBookmarkIds.filter(
          (id) => id !== action.payload.id
        );

        if (action.payload.status === 'deleted') {
          state.bookmarksRevision += 1;
          state.bookmarks = state.bookmarks.filter(
            (bookmark) => bookmark.id !== action.payload.id
          );
          state.bookmarksSource = 'server';
        }

        state.bookmarksError = null;
      })
      .addCase(deleteBookmarkThunk.rejected, (state, action) => {
        // Keep the bookmark: the server still has it.
        state.deletingBookmarkIds = state.deletingBookmarkIds.filter(
          (id) => id !== action.meta.arg
        );
        state.bookmarksError =
          action.payload ??
          action.error.message ??
          'Failed to remove bookmark.';
      });

    // Logout cleanup
    builder.addCase(logoutUserThunk.pending, (state) => {
      state.progressMap = {};
      state.overallPercent = 0;
      state.loading = false;
      state.error = null;
      resetBookmarks(state);
    });

    builder.addCase(logoutUserThunk.fulfilled, (state) => {
      state.progressMap = {};
      state.overallPercent = 0;
      state.loading = false;
      state.error = null;
      resetBookmarks(state);
    });

    builder.addCase(forceLogout, (state) => {
      state.progressMap = {};
      state.overallPercent = 0;
      state.loading = false;
      state.error = null;
      resetBookmarks(state);
    });
  },
});

export const { setProgressLocal } = progressSlice.actions;

export default progressSlice.reducer;
