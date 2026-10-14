import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MaterialIcons } from '@expo/vector-icons';
import Colors from '../constants/colors';
import { HeaderBar, BottomNav } from '../components/navigation';
import { HoverCard, PageIntro } from '../components/common';
import {
  getAllNotifications,
  markAsRead,
  markAllAsRead,
  initializeNotificationsIfNeeded,
} from '../services/notificationService';
import { RootStackParamList } from '../types/navigation';
import { Notification } from '../types/quiz';

type Props = NativeStackScreenProps<RootStackParamList, 'Notifications'>;

const typeConfig = {
  announcement: { color: Colors.primary, bg: Colors.palePeach },
  reminder: { color: Colors.accentGold, bg: Colors.accentGoldBg },
  achievement: { color: Colors.success, bg: Colors.successBg },
  update: { color: Colors.textSecondary, bg: Colors.surfaceSoft },
};

const formatTime = (timestamp: number): string => {
  const now = Date.now();
  const diff = now - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days === 1) return 'Yesterday';
  return `${days}d ago`;
};

export const NotificationsScreen: React.FC<Props> = ({ navigation }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const unreadCount = notifications.filter((n) => !n.read).length;

  const loadNotifications = useCallback(async () => {
    await initializeNotificationsIfNeeded();
    const data = await getAllNotifications();
    setNotifications(data);
  }, []);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const handleNotificationPress = async (notif: Notification) => {
    if (!notif.read) {
      await markAsRead(notif.id);
      await loadNotifications();
    }
    // Navigate to open the notification in full view
    navigation.navigate('NotificationDetail', { notificationId: notif.id });
  };

  const handleMarkAllRead = async () => {
    await markAllAsRead();
    await loadNotifications();
  };

  return (
    <View className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      {/* Clean Top Navbar without Back Section */}
      <HeaderBar activeRoute="Notifications" />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 22, paddingTop: 18, paddingBottom: 48, gap: 14 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Page Heading & Mark All Read Action */}
        <View className="flex-row items-center justify-between pb-1">
          <View className="flex-1 pr-2">
            <PageIntro
              eyebrow="CIRCULARS & NOTICES"
              badge={unreadCount > 0 ? `${unreadCount} unread` : 'All read'}
              title="Notifications"
            />
          </View>
          {unreadCount > 0 && (
            <TouchableOpacity
              className="px-3 py-1.5 rounded-full border border-primary/30 bg-palePeach shadow-xs"
              onPress={handleMarkAllRead}
              activeOpacity={0.8}
            >
              <Text className="font-manrope-bold text-[11px] text-primary">Mark all read</Text>
            </TouchableOpacity>
          )}
        </View>
        {notifications.length > 0 ? (
          notifications.map((notif) => {
            const config = typeConfig[notif.type];
            return (
              <TouchableOpacity
                key={notif.id}
                className={`rounded-[18px] p-4 border shadow-sm ${
                  notif.read ? 'bg-white border-border' : 'bg-softWarm border-borderAccent'
                }`}
                onPress={() => handleNotificationPress(notif)}
                activeOpacity={0.85}
              >
                <View className="flex-row items-start gap-3">
                  {/* Icon */}
                  <View
                    className="w-10 h-10 rounded-xl items-center justify-center mt-0.5"
                    style={{ backgroundColor: config.bg }}
                  >
                    <MaterialIcons
                      name={(notif.icon as keyof typeof MaterialIcons.glyphMap) || 'notifications'}
                      size={20}
                      color={config.color}
                    />
                  </View>

                  {/* Content */}
                  <View className="flex-1 gap-1">
                    <View className="flex-row items-center justify-between">
                      <Text
                        className={`font-manrope-extrabold text-[13px] text-textPrimary flex-1 ${
                          !notif.read ? '' : 'opacity-70'
                        }`}
                        numberOfLines={1}
                      >
                        {notif.title}
                      </Text>
                      {!notif.read && (
                        <View className="w-2 h-2 rounded-full bg-primary ml-2" />
                      )}
                    </View>

                    <Text
                      className="font-manrope-medium text-xs text-textSecondary leading-4"
                      numberOfLines={2}
                    >
                      {notif.message}
                    </Text>

                    <Text className="font-manrope-medium text-[11px] text-textMuted mt-1">
                      {formatTime(notif.createdAt)}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })
        ) : (
          <View className="items-center justify-center py-20 gap-2.5">
            <View className="w-14 h-14 rounded-[17px] bg-palePeach items-center justify-center mb-1.5">
              <MaterialIcons name="notifications-none" size={28} color={Colors.primary} />
            </View>
            <Text className="font-manrope-extrabold text-[17px] text-textPrimary">All caught up!</Text>
            <Text className="font-manrope-medium text-[13px] text-textMuted text-center px-8 leading-[18px]">
              No new notifications. Check back later for updates.
            </Text>
          </View>
        )}
      </ScrollView>
      <BottomNav activeTab="Home" navigation={navigation} />
    </View>
  );
};
