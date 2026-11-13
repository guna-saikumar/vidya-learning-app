import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { studentsApi } from '../../services/apiClient';

export const OFFLINE_QUEUE_STORAGE_KEY = '@vidya_offline_sync_queue';

export type OfflineActionType =
  | 'SAVE_PROGRESS'
  | 'TOGGLE_SECTION'
  | 'ADD_BOOKMARK'
  | 'DELETE_BOOKMARK';

export interface OfflineAction {
  id: string;
  type: OfflineActionType;
  payload: any;
  timestamp: number;
  retryCount: number;
}

export interface OfflineQueueState {
  isOnline: boolean;
  queue: OfflineAction[];
  isSyncing: boolean;
  lastSyncedAt: number | null;
  error: string | null;
}

const initialState: OfflineQueueState = {
  isOnline: true,
  queue: [],
  isSyncing: false,
  lastSyncedAt: null,
  error: null,
};

export const loadOfflineQueueThunk = createAsyncThunk(
  'offlineQueue/loadQueue',
  async () => {
    try {
      const raw = await AsyncStorage.getItem(OFFLINE_QUEUE_STORAGE_KEY);
      if (raw) {
        return (JSON.parse(raw) as OfflineAction[]) || [];
      }
    } catch {
      // ignore
    }
    return [];
  }
);

const persistQueue = async (queue: OfflineAction[]) => {
  try {
    await AsyncStorage.setItem(OFFLINE_QUEUE_STORAGE_KEY, JSON.stringify(queue));
  } catch {
    // ignore
  }
};

export const flushOfflineQueueThunk = createAsyncThunk(
  'offlineQueue/flushQueue',
  async (_, { getState, rejectWithValue }) => {
    const state = getState() as { offlineQueue: OfflineQueueState };
    const queue = [...state.offlineQueue.queue];

    if (queue.length === 0) return { processedIds: [] };

    const processedIds: string[] = [];

    for (const action of queue) {
      try {
        switch (action.type) {
          case 'SAVE_PROGRESS': {
            const { chapterId, progressPercent, completed, sectionId } = action.payload;
            await studentsApi.updateProgress(chapterId, {
              progressPercent,
              completed,
              sectionId,
            });
            processedIds.push(action.id);
            break;
          }
          case 'TOGGLE_SECTION': {
            const { chapterId, sectionId, progressPercent, completed } = action.payload;
            await studentsApi.updateProgress(chapterId, {
              progressPercent,
              completed,
              sectionId,
            });
            processedIds.push(action.id);
            break;
          }
          case 'ADD_BOOKMARK': {
            const body = action.payload;
            await studentsApi.addBookmark(body);
            processedIds.push(action.id);
            break;
          }
          case 'DELETE_BOOKMARK': {
            const { bookmarkId } = action.payload;
            await studentsApi.deleteBookmark(bookmarkId);
            processedIds.push(action.id);
            break;
          }
        }
      } catch (err: any) {
        // If offline again or network down, stop and keep remaining items in queue
        if (!err.response) {
          break;
        }
        // If 404 or contract failure, drop the stale action so it doesn't block the queue
        if (err.response?.status === 404 || err.response?.status === 400) {
          processedIds.push(action.id);
        }
      }
    }

    const remaining = queue.filter((item) => !processedIds.includes(item.id));
    await persistQueue(remaining);

    return { processedIds, remaining };
  }
);

const offlineQueueSlice = createSlice({
  name: 'offlineQueue',
  initialState,
  reducers: {
    setOnlineStatus: (state, action: PayloadAction<boolean>) => {
      state.isOnline = action.payload;
    },
    enqueueOfflineAction: (
      state,
      action: PayloadAction<Omit<OfflineAction, 'id' | 'timestamp' | 'retryCount'>>
    ) => {
      const newAction: OfflineAction = {
        id: `offline-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        timestamp: Date.now(),
        retryCount: 0,
        ...action.payload,
      };
      state.queue.push(newAction);
      void persistQueue(state.queue);
    },
    dequeueOfflineAction: (state, action: PayloadAction<string>) => {
      state.queue = state.queue.filter((item) => item.id !== action.payload);
      void persistQueue(state.queue);
    },
    clearOfflineQueue: (state) => {
      state.queue = [];
      void AsyncStorage.removeItem(OFFLINE_QUEUE_STORAGE_KEY);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadOfflineQueueThunk.fulfilled, (state, action) => {
        state.queue = action.payload;
      })
      .addCase(flushOfflineQueueThunk.pending, (state) => {
        state.isSyncing = true;
        state.error = null;
      })
      .addCase(flushOfflineQueueThunk.fulfilled, (state, action) => {
        state.isSyncing = false;
        if (action.payload.remaining) {
          state.queue = action.payload.remaining;
        }
        state.lastSyncedAt = Date.now();
      })
      .addCase(flushOfflineQueueThunk.rejected, (state, action) => {
        state.isSyncing = false;
        state.error = action.error.message || 'Sync failed';
      });
  },
});

export const {
  setOnlineStatus,
  enqueueOfflineAction,
  dequeueOfflineAction,
  clearOfflineQueue,
} = offlineQueueSlice.actions;

export default offlineQueueSlice.reducer;

