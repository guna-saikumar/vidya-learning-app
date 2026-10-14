import React from 'react';
import { View, Text, TouchableOpacity, Image, Platform, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import Colors from '../../constants/colors';
import { useAdminAuth } from '../../hooks/useAdminAuth';

interface HeaderBarProps {
  title?: string;
  subtitle?: string;
  eyebrow?: string;
  showBack?: boolean;
  onBackPress?: () => void;
  onProfilePress?: () => void;
  rightAction?: React.ReactNode;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
  title,
  subtitle,
  eyebrow,
  showBack = false,
  onBackPress,
  onProfilePress,
  rightAction,
}) => {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const { user } = useAdminAuth();
  const topInset = Math.max(
    insets.top,
    Platform.OS === 'android' ? (StatusBar.currentHeight || 28) : 0
  );

  const handleProfilePress = () => {
    if (onProfilePress) {
      onProfilePress();
    } else {
      try {
        navigation.navigate('Profile');
      } catch (e) {
        // Fallback
      }
    }
  };

  return (
    <View className="bg-white z-10" style={{ paddingTop: topInset }}>
      {/* 1. Fixed Top Navbar on ALL pages (Matches student-mobile) */}
      <View className="h-16 px-5 flex-row items-center justify-between bg-white border-b border-border">
        {/* Left: Brand Logo + Vidya Learning with Admin Badge directly below */}
        <View className="flex-row items-center gap-2.5">
          <View
            className="w-10 h-10 rounded-lg bg-palePeach border border-[#f2ded3] items-center justify-center shadow-sm overflow-hidden"
            style={{ width: 40, height: 40 }}
          >
            <Image
              source={require('../../../assets/app-images/logo.png')}
              className="w-7 h-7"
              style={{ width: 28, height: 28 }}
              resizeMode="contain"
            />
          </View>
          <View className="justify-center">
            <Text className="font-manrope-extrabold text-[15px] text-textPrimary tracking-tight leading-tight">
              Vidya Learning
            </Text>
            <View className="self-start mt-0.5 bg-palePeach px-2 py-0.5 rounded-full border border-primaryLight">
              <Text className="font-manrope-extrabold text-[9px] text-primary tracking-wider">
                ADMIN
              </Text>
            </View>
          </View>
        </View>

        {/* Right: Admin Profile Chip Synced With Global Profile */}
        <TouchableOpacity
          className="flex-row items-center gap-2 py-1 px-2.5 rounded-full border border-border bg-white shadow-xs max-w-[170px]"
          onPress={handleProfilePress}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Admin Profile"
        >
          <Text
            className="font-manrope-bold text-[13px] text-textPrimary"
            numberOfLines={1}
          >
            {user?.fullName || 'Admin Name'}
          </Text>
          <View
            className="w-[30px] h-[30px] rounded-full bg-palePeach border border-primaryLight items-center justify-center overflow-hidden"
            style={{ width: 30, height: 30, borderRadius: 15 }}
          >
            <MaterialIcons name="person" size={20} color={Colors.primary} />
          </View>
        </TouchableOpacity>
      </View>

      {/* 2. Back Header Section seamlessly flowing into the page content below (Matches student-mobile) */}
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

          <View className="flex-1 justify-center min-w-0">
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
              <Text
                className="font-manrope-extrabold text-xl text-textPrimary tracking-tight"
                numberOfLines={1}
              >
                {title}
              </Text>
            ) : null}
          </View>

          {rightAction ? (
            <View className="flex-row items-center gap-2">
              {rightAction}
            </View>
          ) : null}
        </View>
      )}
    </View>
  );
};
