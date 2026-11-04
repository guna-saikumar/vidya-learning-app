import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Colors from '../../constants/colors';
import { getUnreadCount } from '../../services/notificationService';
import { useLearningProgress } from '../../hooks/useLearningProgress';

interface HeaderBarProps {
  title?: string;
  eyebrow?: string;
  subtitle?: string;
  showBack?: boolean;
  onBackPress?: () => void;
  showSearch?: boolean;
  onSearchPress?: () => void;
  showBookmark?: boolean;
  isBookmarked?: boolean;
  onBookmarkPress?: () => void;
  onProfilePress?: () => void;
  onNotificationPress?: () => void;
  rightAction?: React.ReactNode;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
  title,
  eyebrow,
  subtitle,
  showBack = false,
  onBackPress,
  showBookmark = false,
  isBookmarked = false,
  onBookmarkPress,
  onProfilePress,
  onNotificationPress,
  rightAction,
}) => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const { profile } = useLearningProgress();
  // insets.top adapts across notches/islands and edge-to-edge status bars without double-padding.
  const topInset = insets.top;
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const loadUnread = async () => {
      try {
        const count = await getUnreadCount();
        setUnreadCount(count);
      } catch {
        setUnreadCount(0);
      }
    };
    loadUnread();
  }, []);

  const handleNotificationPress = () => {
    if (onNotificationPress) {
      onNotificationPress();
    } else {
      navigation?.navigate('Notifications');
    }
  };

  const handleProfilePress = () => {
    if (onProfilePress) {
      onProfilePress();
    } else {
      navigation?.navigate('Profile');
    }
  };

  const handleHomePress = () => {
    navigation?.navigate('Home');
  };

  return (
    <View className="bg-white z-10" style={{ paddingTop: topInset }}>
      {/* Top Navbar with App Name & Profile */}
      <View className="h-16 px-4 flex-row items-center justify-between bg-white border-b border-border">
        {/* Left side: Logo + App Title (Navigates to Home) */}
        <TouchableOpacity
          className="flex-row items-center gap-2.5"
          onPress={handleHomePress}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Go to Home"
        >
          <View
            className="w-10 h-10 rounded-xl bg-palePeach border border-[#f2ded3] items-center justify-center shadow-sm overflow-hidden"
            style={{ width: 40, height: 40 }}
          >
            <Image
              source={require('../../../assets/app-images/logo.png')}
              className="w-7 h-7"
              style={{ width: 28, height: 28 }}
              resizeMode="contain"
            />
          </View>
          <View>
            <Text className="font-manrope-extrabold text-base text-textPrimary tracking-tight">
              Vidya Learning
            </Text>
            <Text className="font-manrope-medium text-[10px] text-textMuted -mt-0.5">
              AP SCERT Division
            </Text>
          </View>
        </TouchableOpacity>

        {/* Right side: Notifications bell + Profile chip */}
        <View className="flex-row items-center gap-2">
          {/* Notification Bell */}
          <TouchableOpacity
            className="w-10 h-10 rounded-full border border-border items-center justify-center bg-white"
            onPress={handleNotificationPress}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Notifications"
          >
            <MaterialIcons name="notifications-none" size={20} color={Colors.textPrimary} />
            {unreadCount > 0 && (
              <View className="absolute -top-0.5 -right-0.5 w-[18px] h-[18px] rounded-full bg-error items-center justify-center border-2 border-white">
                <Text className="font-manrope-extrabold text-[9px] text-white">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Profile Avatar Button */}
          <TouchableOpacity
            className="w-10 h-10 rounded-full border border-border bg-white items-center justify-center overflow-hidden shadow-sm"
            onPress={handleProfilePress}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Student profile"
          >
            <Image
              source={
                profile?.avatarUrl
                  ? { uri: profile.avatarUrl }
                  : require('../../../assets/app-images/avatar.png')
              }
              className="w-8 h-8 rounded-full"
              style={{ width: 32, height: 32, borderRadius: 16 }}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Back Section seamlessly flowing into the page content below */}
      {showBack && (
        <View className="px-5 pt-3.5 pb-1 flex-row items-center justify-between bg-white gap-3">
          <TouchableOpacity
            className="w-10 h-10 rounded-xl border border-border bg-white items-center justify-center shadow-sm"
            onPress={onBackPress}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <MaterialIcons name="arrow-back" size={20} color={Colors.textPrimary} />
          </TouchableOpacity>

          <View className="flex-1 justify-center">
            {subtitle ? (
              <Text className="font-manrope-extrabold text-[10px] text-primary tracking-wider mb-0.5 uppercase">
                {subtitle}
              </Text>
            ) : eyebrow ? (
              <Text className="font-manrope-extrabold text-[10px] text-primary tracking-wider mb-0.5 uppercase">
                {eyebrow}
              </Text>
            ) : null}
            {title ? (
              <Text className="font-manrope-extrabold text-xl text-textPrimary tracking-tight" numberOfLines={1}>
                {title}
              </Text>
            ) : null}
          </View>

          <View className="flex-row items-center gap-2">
            {showBookmark && (
              <TouchableOpacity
                className={`w-10 h-10 rounded-xl border items-center justify-center shadow-sm ${
                  isBookmarked ? 'bg-palePeach border-primary' : 'bg-white border-border'
                }`}
                onPress={onBookmarkPress}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel={isBookmarked ? 'Remove bookmark' : 'Add bookmark'}
              >
                <MaterialIcons
                  name={isBookmarked ? 'bookmark' : 'bookmark-border'}
                  size={20}
                  color={isBookmarked ? Colors.primary : Colors.textPrimary}
                />
              </TouchableOpacity>
            )}

            {rightAction && (
              <View className="items-center justify-center">
                {rightAction}
              </View>
            )}
          </View>
        </View>
      )}
    </View>
  );
};
