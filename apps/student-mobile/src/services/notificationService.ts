import AsyncStorage from '@react-native-async-storage/async-storage';
import { Notification } from '../types/curriculum';
import { MOCK_NOTIFICATIONS } from '../data/notifications';
import { notificationsApi } from './apiClient';

const STORAGE_KEY = '@vidya_notifications';

export const initializeNotificationsIfNeeded = async (): Promise<void> => {
  try {
    const existing = await AsyncStorage.getItem(STORAGE_KEY);
    if (!existing) {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(MOCK_NOTIFICATIONS));
    }
  } catch (error) {
    console.error('Failed to initialize notifications:', error);
  }
};

let memoryNotifications: Notification[] | null = null;
let lastNotificationsFetch = 0;
const NOTIFICATIONS_CACHE_TTL = 60000; // 1 minute in-memory cache TTL

export const getAllNotifications = async (force = false): Promise<Notification[]> => {
  const now = Date.now();
  if (!force && memoryNotifications && now - lastNotificationsFetch < NOTIFICATIONS_CACHE_TTL) {
    return memoryNotifications;
  }

  try {
    const apiNotifications = await notificationsApi.getNotifications();
    if (Array.isArray(apiNotifications) && apiNotifications.length > 0) {
      const mapped: Notification[] = apiNotifications.map((n: any) => ({
        id: String(n.id),
        title: n.title,
        message: n.body || n.message || '',
        detailedBody: n.detailedBody || n.detail || n.body || n.message || '',
        type: (['announcement', 'reminder', 'achievement', 'update'].includes(n.type) ? n.type : 'update') as Notification['type'],
        icon: n.icon || (n.type === 'reminder' ? 'alarm' : n.type === 'achievement' ? 'emoji-events' : 'campaign'),
        read: Boolean(n.isRead ?? n.read),
        createdAt: typeof n.createdAt === 'string' ? new Date(n.createdAt).getTime() : (n.createdAt || Date.now()),
      }));
      const sorted = mapped.sort((a, b) => b.createdAt - a.createdAt);
      memoryNotifications = sorted;
      lastNotificationsFetch = now;
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(sorted));
      return sorted;
    }
  } catch {
    // Offline fallback
  }

  try {
    const data = await AsyncStorage.getItem(STORAGE_KEY);
    if (data) {
      const notifications: Notification[] = JSON.parse(data);
      const sorted = notifications.sort((a, b) => b.createdAt - a.createdAt);
      memoryNotifications = sorted;
      lastNotificationsFetch = now;
      return sorted;
    }
    memoryNotifications = MOCK_NOTIFICATIONS;
    lastNotificationsFetch = now;
    return MOCK_NOTIFICATIONS;
  } catch {
    memoryNotifications = MOCK_NOTIFICATIONS;
    lastNotificationsFetch = now;
    return MOCK_NOTIFICATIONS;
  }
};

export const getUnreadCount = async (): Promise<number> => {
  const all = await getAllNotifications();
  return all.filter((n) => !n.read).length;
};

export const getNotificationById = async (id: string): Promise<Notification | undefined> => {
  try {
    const n = await notificationsApi.getNotificationById(id);
    if (n) {
      return {
        id: String(n.id),
        title: n.title,
        message: n.body || n.message || '',
        detailedBody: n.detailedBody || n.detail || n.body || n.message || '',
        type: (['announcement', 'reminder', 'achievement', 'update'].includes(n.type) ? n.type : 'update') as Notification['type'],
        icon: n.icon || (n.type === 'reminder' ? 'alarm' : n.type === 'achievement' ? 'emoji-events' : 'campaign'),
        read: Boolean(n.isRead ?? n.read),
        createdAt: typeof n.createdAt === 'string' ? new Date(n.createdAt).getTime() : (n.createdAt || Date.now()),
      };
    }
  } catch {
    // Offline fallback
  }

  const all = await getAllNotifications();
  return all.find((n) => n.id === id);
};

export const markAsRead = async (notificationId: string): Promise<void> => {
  try {
    notificationsApi.markRead(notificationId).catch(() => {});
    const all = await getAllNotifications();
    const updated = all.map((n) => {
      if (n.id === notificationId) {
        return { ...n, read: true };
      }
      return n;
    });
    memoryNotifications = updated;
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('Failed to mark notification as read:', error);
  }
};

export const markAllAsRead = async (): Promise<void> => {
  try {
    notificationsApi.markAllRead().catch(() => {});
    const all = await getAllNotifications();
    const updated = all.map((n) => ({ ...n, read: true }));
    memoryNotifications = updated;
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('Failed to mark all notifications as read:', error);
  }
};

