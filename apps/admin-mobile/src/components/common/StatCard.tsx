import React from 'react';
import { View, Text } from 'react-native';
import Colors from '../../constants/colors';
import { HoverCard } from './HoverCard';

interface StatCardProps {
  label: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  badge?: string;
  badgeColor?: 'success' | 'warning' | 'primary' | 'muted';
  isProgress?: boolean;
  onPress?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  subtitle,
  icon,
  badge,
  badgeColor = 'primary',
  isProgress = false,
  onPress,
}) => {
  const getBadgeStyle = () => {
    switch (badgeColor) {
      case 'success':
        return { bg: 'bg-successBg', text: 'text-success' };
      case 'warning':
        return { bg: 'bg-accentGoldBg', text: 'text-accentGoldDark' };
      case 'muted':
        return { bg: 'bg-softWarm', text: 'text-textMuted' };
      case 'primary':
      default:
        return { bg: 'bg-palePeach', text: 'text-primaryDark' };
    }
  };

  const badgeStyle = getBadgeStyle();

  return (
    <HoverCard
      className="flex-1 min-h-[84px] bg-white rounded-[20px] py-4 px-4 border border-border flex-row items-center gap-3.5 shadow-sm"
      lift={-3}
      onPress={onPress}
    >
      {/* Left side icon matching student-mobile */}
      <View
        className={`w-11 h-11 rounded-[14px] items-center justify-center ${
          isProgress ? 'bg-successBg' : badgeColor === 'warning' ? 'bg-accentGoldBg' : 'bg-palePeach'
        }`}
      >
        {icon}
      </View>

      {/* Right side numbers and headings */}
      <View className="flex-1 justify-center gap-0.5 min-w-0">
        <View className="flex-row items-center gap-1.5 flex-wrap">
          <Text
            className="font-manrope-extrabold text-[22px] text-textPrimary tracking-tight leading-[26px]"
            numberOfLines={1}
          >
            {value}
          </Text>
          {badge ? (
            <View className={`px-1.5 py-0.5 rounded-md ${badgeStyle.bg}`}>
              <Text className={`font-manrope-bold text-[10px] ${badgeStyle.text}`}>
                {badge}
              </Text>
            </View>
          ) : null}
        </View>

        <Text
          className="font-manrope-semibold text-xs text-textSecondary tracking-tight"
          numberOfLines={1}
        >
          {label}
        </Text>

        {subtitle && (
          <Text
            className="font-manrope-medium text-[10px] text-textMuted leading-3"
            numberOfLines={1}
          >
            {subtitle}
          </Text>
        )}
      </View>
    </HoverCard>
  );
};
