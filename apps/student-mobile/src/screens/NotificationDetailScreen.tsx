import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MaterialIcons } from '@expo/vector-icons';
import Colors from '../constants/colors';
import { HeaderBar, BottomNav } from '../components/navigation';
import { HoverCard } from '../components/common';
import { getNotificationById, markAsRead } from '../services/notificationService';
import { RootStackParamList } from '../types/navigation';
import { Notification } from '../types/quiz';

type Props = NativeStackScreenProps<RootStackParamList, 'NotificationDetail'>;

const typeConfig = {
  announcement: { label: 'Official Announcement', color: Colors.primary, bg: Colors.palePeach, icon: 'campaign' },
  reminder: { label: 'Study Reminder', color: Colors.accentGoldDark, bg: Colors.accentGoldBg, icon: 'alarm' },
  achievement: { label: 'Milestone & Badge', color: Colors.success, bg: Colors.successBg, icon: 'emoji-events' },
  update: { label: 'Curriculum Update', color: Colors.primaryDark, bg: Colors.surfaceSoft, icon: 'auto-stories' },
};

export const NotificationDetailScreen: React.FC<Props> = ({ route, navigation }) => {
  const { notificationId } = route.params;
  const [notification, setNotification] = useState<Notification | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const item = await getNotificationById(notificationId);
        if (item) {
          setNotification(item);
          if (!item.read) {
            await markAsRead(item.id);
          }
        }
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [notificationId]);

  if (loading) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (!notification) {
    return (
      <View className="flex-1 bg-white">
        <HeaderBar showBack onBackPress={() => navigation.goBack()} title="Notification" />
        <View className="flex-1 items-center justify-center gap-2 px-6">
          <MaterialIcons name="error-outline" size={48} color={Colors.textMuted} />
          <Text className="font-manrope-extrabold text-base text-textPrimary">Notification Not Found</Text>
          <Text className="font-manrope-medium text-xs text-textMuted text-center">
            This notification may have expired or been removed.
          </Text>
        </View>
        <BottomNav activeTab="Home" navigation={navigation} />
      </View>
    );
  }

  const config = typeConfig[notification.type] || typeConfig.announcement;

  const handleAction = () => {
    if (notification.actionRoute) {
      navigation.navigate(notification.actionRoute as any);
    } else {
      navigation.goBack();
    }
  };

  const formatDate = (timestamp: number) => {
    const d = new Date(timestamp);
    return d.toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <View className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <HeaderBar
        showBack
        onBackPress={() => navigation.goBack()}
        title="Notification Details"
        subtitle={config.label}
        activeRoute="Notifications"
      />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 22, paddingTop: 18, paddingBottom: 48, gap: 20 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Category Header Card */}
        <View className="bg-white rounded-2xl p-5 border border-border shadow-sm gap-3">
          <View className="flex-row items-center justify-between">
            <View
              className="flex-row items-center gap-1.5 px-3 py-1 rounded-full"
              style={{ backgroundColor: config.bg }}
            >
              <MaterialIcons
                name={(notification.icon as keyof typeof MaterialIcons.glyphMap) || (config.icon as any)}
                size={16}
                color={config.color}
              />
              <Text className="font-manrope-extrabold text-[11px]" style={{ color: config.color }}>
                {config.label}
              </Text>
            </View>

            <View className="flex-row items-center gap-1">
              <MaterialIcons name="check-circle" size={14} color={Colors.success} />
              <Text className="font-manrope-medium text-[11px] text-textMuted">Read</Text>
            </View>
          </View>

          {/* Title */}
          <Text className="font-manrope-extrabold text-xl text-textPrimary leading-7 tracking-tight">
            {notification.title}
          </Text>

          {/* Date stamp */}
          <View className="flex-row items-center gap-1.5 pt-1 border-t border-border">
            <MaterialIcons name="access-time" size={14} color={Colors.textMuted} />
            <Text className="font-manrope-medium text-xs text-textMuted">
              {formatDate(notification.createdAt)}
            </Text>
          </View>
        </View>

        {/* Detailed Body Section */}
        <View className="bg-white rounded-2xl p-5 border border-border shadow-sm gap-3">
          <Text className="font-manrope-bold text-xs text-textSecondary uppercase tracking-wider">
            Notice & Circular Content
          </Text>

          <Text className="font-manrope-semibold text-sm text-textPrimary leading-6">
            {notification.message}
          </Text>

          {notification.detailedBody && (
            <View className="bg-[#FAF7F4] p-4 rounded-xl border border-border mt-1">
              <Text className="font-manrope-medium text-[13px] text-textLead leading-6">
                {notification.detailedBody}
              </Text>
            </View>
          )}
        </View>

        {/* Issuer / Board Compliance Footnote */}
        <View className="bg-palePeach/60 rounded-xl p-3.5 border border-[#f2ded3] flex-row items-center gap-3">
          <MaterialIcons name="verified-user" size={20} color={Colors.primary} />
          <View className="flex-1">
            <Text className="font-manrope-bold text-xs text-textPrimary">Verified Circular</Text>
            <Text className="font-manrope-medium text-[10px] text-textSecondary">
              Official notification from Andhra Pradesh State Board of Educational Research and Training (SCERT).
            </Text>
          </View>
        </View>

        {/* Primary Action Button */}
        {notification.actionRoute && (
          <TouchableOpacity
            className="flex-row items-center justify-center gap-2 py-4 rounded-2xl bg-primary shadow-sm"
            onPress={handleAction}
            activeOpacity={0.85}
          >
            <Text className="font-manrope-bold text-sm text-white">
              {notification.actionLabel || 'View Details'}
            </Text>
            <MaterialIcons name="arrow-forward" size={18} color={Colors.white} />
          </TouchableOpacity>
        )}

        <TouchableOpacity
          className="flex-row items-center justify-center gap-2 py-3.5 rounded-2xl border border-border bg-white"
          onPress={() => navigation.goBack()}
          activeOpacity={0.85}
        >
          <MaterialIcons name="arrow-back" size={18} color={Colors.textSecondary} />
          <Text className="font-manrope-bold text-sm text-textSecondary">Back to All Notifications</Text>
        </TouchableOpacity>
      </ScrollView>

      <BottomNav activeTab="Home" navigation={navigation} />
    </View>
  );
};
