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

export const getAllNotifications = async (): Promise<Notification[]> => {
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
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(mapped));
      return mapped.sort((a, b) => b.createdAt - a.createdAt);
    }
  } catch {
    // Offline fallback
  }

  try {
    const data = await AsyncStorage.getItem(STORAGE_KEY);
    if (data) {
      const notifications: Notification[] = JSON.parse(data);
      return notifications.sort((a, b) => b.createdAt - a.createdAt);
    }
    return MOCK_NOTIFICATIONS;
  } catch {
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
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('Failed to mark all notifications as read:', error);
  }
};

