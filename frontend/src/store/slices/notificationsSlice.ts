import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { notificationsApi } from '../../services/apiClient';
import { MOCK_NOTIFICATIONS } from '../../data/notifications';

export interface NotificationItem {
  id: string;
  title: string;
  body: string;
  detailedBody?: string;
  type?: string;
  isRead?: boolean;
  createdAt?: string;
  timestamp?: number;
}

export interface NotificationsState {
  items: NotificationItem[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
}

const initialState: NotificationsState = {
  items: MOCK_NOTIFICATIONS as any,
  unreadCount: (MOCK_NOTIFICATIONS as any).filter((n: any) => !n.read && !n.isRead).length,
  loading: false,
  error: null,
};

export const fetchNotificationsThunk = createAsyncThunk(
  'notifications/fetchNotifications',
  async (_, { rejectWithValue }) => {
    try {
      const data = await notificationsApi.getNotifications();
      if (Array.isArray(data) && data.length > 0) {
        return data;
      }
      return MOCK_NOTIFICATIONS as any;
    } catch {
      return MOCK_NOTIFICATIONS as any;
    }
  }
);

export const markNotificationReadThunk = createAsyncThunk(
  'notifications/markRead',
  async (id: string) => {
    try {
      await notificationsApi.markRead(id);
    } catch (e) {
      // ignore
    }
    return id;
  }
);

export const markAllNotificationsReadThunk = createAsyncThunk(
  'notifications/markAllRead',
  async () => {
    try {
      await notificationsApi.markAllRead();
    } catch (e) {
      // ignore
    }
  }
);

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchNotificationsThunk.fulfilled, (state, action) => {
      state.items = action.payload;
      state.unreadCount = action.payload.filter((n: any) => !n.isRead).length;
    });
    builder.addCase(markNotificationReadThunk.fulfilled, (state, action) => {
      const item = state.items.find((n) => n.id === action.payload);
      if (item && !item.isRead) {
        item.isRead = true;
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
    });
    builder.addCase(markAllNotificationsReadThunk.fulfilled, (state) => {
      state.items.forEach((n) => {
        n.isRead = true;
      });
      state.unreadCount = 0;
    });
  },
});

export default notificationsSlice.reducer;
