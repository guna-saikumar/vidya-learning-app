import {
  configureStore,
  createListenerMiddleware,
  isAnyOf,
} from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';

import { setOnAuthCleared } from '../services/apiClient';
import {
  clearBookmarkCaches,
  writeBookmarkCache,
} from '../services/bookmarkCache';
import { BookmarkItem } from '../types/curriculum';

import authReducer, { forceLogout } from './slices/authSlice';
import studentReducer from './slices/studentSlice';
import curriculumReducer from './slices/curriculumSlice';
import progressReducer, {
  addBookmarkThunk,
  deleteBookmarkThunk,
  fetchBookmarksThunk,
} from './slices/progressSlice';
import notificationsReducer from './slices/notificationsSlice';
import preferencesReducer from './slices/preferencesSlice';
import offlineQueueReducer from './slices/offlineQueueSlice';

type BookmarkCacheState = {
  auth: { user: { id: string } | null };
  progress: { bookmarks: BookmarkItem[] };
};

/**
 * Persists the bookmark list after every successful bookmark operation, using
 * the state *after* the reducer has applied it. This keeps AsyncStorage in
 * sync with Redux without letting an in-flight fetch write a stale snapshot.
 */
const bookmarkCacheListener = createListenerMiddleware();

bookmarkCacheListener.startListening({
  matcher: isAnyOf(
    fetchBookmarksThunk.fulfilled,
    addBookmarkThunk.fulfilled,
    deleteBookmarkThunk.fulfilled
  ),
  effect: async (_action, listenerApi) => {
    const state = listenerApi.getState() as BookmarkCacheState;
    const userId = state.auth.user?.id;
    if (!userId) return;

    await writeBookmarkCache(userId, state.progress.bookmarks);
  },
});

export const store = configureStore({
  reducer: {
    auth: authReducer,
    student: studentReducer,
    curriculum: curriculumReducer,
    progress: progressReducer,
    notifications: notificationsReducer,
    preferences: preferencesReducer,
    offlineQueue: offlineQueueReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }).prepend(bookmarkCacheListener.middleware),
});

setOnAuthCleared(() => {
  void clearBookmarkCaches();
  store.dispatch(forceLogout());
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export * from './slices/authSlice';
export * from './slices/studentSlice';
export * from './slices/curriculumSlice';
export * from './slices/progressSlice';
export * from './slices/notificationsSlice';
export * from './slices/preferencesSlice';
export * from './slices/offlineQueueSlice';
export * from './selectors';

export default store;
