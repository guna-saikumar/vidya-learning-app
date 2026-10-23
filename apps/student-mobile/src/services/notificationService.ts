import AsyncStorage from '@react-native-async-storage/async-storage';
import { Notification } from '../types/curriculum';
import { MOCK_NOTIFICATIONS } from '../data/notifications';

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
  const all = await getAllNotifications();
  return all.find((n) => n.id === id);
};

export const markAsRead = async (notificationId: string): Promise<void> => {
  try {
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
    const all = await getAllNotifications();
    const updated = all.map((n) => ({ ...n, read: true }));
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('Failed to mark all notifications as read:', error);
  }
};
