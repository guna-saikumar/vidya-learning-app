import React from 'react';
import { View, Text, TouchableOpacity, Image, Platform, StatusBar } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '../../constants/colors';

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
  rightAction?: React.ReactNode;
  studentName?: string;
  studentClass?: string;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
  title,
  eyebrow,
  subtitle,
  showBack = false,
  onBackPress,
  onProfilePress,
  rightAction,
  studentName = 'Aarav',
}) => {
  const insets = useSafeAreaInsets();
  const topInset = Math.max(
    insets.top,
    Platform.OS === 'android' ? (StatusBar.currentHeight || 28) : 0
  );

  return (
    <View className="bg-white z-10" style={{ paddingTop: topInset }}>
      {/* Top Navbar with App Name & Profile */}
      <View className="h-16 px-5 flex-row items-center justify-between bg-white border-b border-border">
        <View className="flex-row items-center gap-2.5">
          <View className="w-10 h-10 rounded-xl bg-palePeach border border-[#f2ded3] items-center justify-center shadow-sm">
            <Image
              source={require('../../../assets/app-images/logo.png')}
              className="w-7 h-7"
              resizeMode="contain"
            />
          </View>
          <Text className="font-manrope-extrabold text-lg text-textPrimary tracking-tight">Vidya Learning</Text>
        </View>

        <TouchableOpacity
          className="flex-row items-center gap-2 py-1 px-2.5 rounded-full border border-border bg-white"
          onPress={onProfilePress}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Student profile"
        >
          <Text className="font-manrope-bold text-[13px] text-textPrimary">{studentName}</Text>
          <Image
            source={require('../../../assets/app-images/avatar.png')}
            className="w-[30px] h-[30px] rounded-full"
          />
        </TouchableOpacity>
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

          {rightAction && (
            <View className="flex-row items-center gap-2">
              {rightAction}
            </View>
          )}
        </View>
      )}
    </View>
  );
};
