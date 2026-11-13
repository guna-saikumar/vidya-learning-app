import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { notificationsApi } from '../../services/apiClient';
import { logoutUserThunk, forceLogout } from './authSlice';

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  body: string;
  detailedBody?: string;
  type: 'announcement' | 'reminder' | 'achievement' | 'update' | 'system';
  isRead: boolean;
  read: boolean;
  createdAt: number;
  icon: string;
  actionRoute?: string;
  actionLabel?: string;
}

export interface NotificationsState {
  items: NotificationItem[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
}

const initialState: NotificationsState = {
  items: [],
  unreadCount: 0,
  loading: false,
  error: null,
};

export const fetchNotificationsThunk = createAsyncThunk<NotificationItem[]>(
  'notifications/fetchNotifications',
  async () => {
    try {
      const data = await notificationsApi.getNotifications();
      if (Array.isArray(data) && data.length > 0) {
        return data.map((n: any): NotificationItem => {
          const isRead = Boolean(n.isRead ?? n.read);
          return {
            id: String(n.id),
            title: n.title || '',
            message: n.body || n.message || '',
            body: n.body || n.message || '',
            detailedBody: n.detailedBody || n.detail || n.body || n.message || '',
            type: n.type || 'update',
            isRead,
            read: isRead,
            createdAt:
              typeof n.createdAt === 'string'
                ? new Date(n.createdAt).getTime()
                : (n.createdAt || Date.now()),
            icon:
              n.icon ||
              (n.type === 'reminder'
                ? 'alarm'
                : n.type === 'achievement'
                ? 'emoji-events'
                : n.type === 'system'
                ? 'school'
                : 'campaign'),
            actionRoute: n.actionRoute,
            actionLabel: n.actionLabel,
          };
        });
      }
      return [];
    } catch {
      return [];
    }
  }
);

export const markNotificationReadThunk = createAsyncThunk<string, string>(
  'notifications/markRead',
  async (id: string) => {
    try {
      await notificationsApi.markRead(id);
    } catch {
      // offline / optimistic fallback
    }
    return id;
  }
);

export const markAllNotificationsReadThunk = createAsyncThunk<void, void>(
  'notifications/markAllRead',
  async () => {
    try {
      await notificationsApi.markAllRead();
    } catch {
      // offline / optimistic fallback
    }
  }
);

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    clearNotifications: () => initialState,
    receiveNotification: (state, action: PayloadAction<NotificationItem>) => {
      // Avoid duplicate notification items
      if (!state.items.some((n) => n.id === action.payload.id)) {
        state.items.unshift(action.payload);
        if (!action.payload.isRead && !action.payload.read) {
          state.unreadCount += 1;
        }
      }
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchNotificationsThunk.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(fetchNotificationsThunk.fulfilled, (state, action) => {
      state.loading = false;
      state.items = action.payload;
      state.unreadCount = action.payload.filter((n) => !n.isRead).length;
    });
    builder.addCase(fetchNotificationsThunk.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || 'Failed to fetch notifications';
    });

    // Mark single notification read (instant optimistic update)
    builder.addCase(markNotificationReadThunk.pending, (state, action) => {
      const item = state.items.find((n) => n.id === action.meta.arg);
      if (item && !item.isRead) {
        item.isRead = true;
        item.read = true;
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
    });
    builder.addCase(markNotificationReadThunk.fulfilled, (state, action) => {
      const item = state.items.find((n) => n.id === action.payload);
      if (item && !item.isRead) {
        item.isRead = true;
        item.read = true;
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
    });

    // Mark all notifications read (instant optimistic update)
    builder.addCase(markAllNotificationsReadThunk.pending, (state) => {
      state.items.forEach((n) => {
        n.isRead = true;
        n.read = true;
      });
      state.unreadCount = 0;
    });
    builder.addCase(markAllNotificationsReadThunk.fulfilled, (state) => {
      state.items.forEach((n) => {
        n.isRead = true;
        n.read = true;
      });
      state.unreadCount = 0;
    });
    builder.addCase(logoutUserThunk.fulfilled, () => initialState);
    builder.addCase(forceLogout, () => initialState);
  },
});

export const { clearNotifications, receiveNotification } = notificationsSlice.actions;
export default notificationsSlice.reducer;
