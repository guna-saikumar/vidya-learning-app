import React from 'react';
import { View, Text } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Colors from '../../constants/colors';
import { HoverCard } from '../common/HoverCard';

interface StatCardProps {
  label: string;
  value: string | number;
  subtitle?: string;
  iconName: keyof typeof MaterialIcons.glyphMap;
  badge?: string;
  isProgress?: boolean;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  iconName,
  badge,
  isProgress = false,
}) => {
  return (
    <HoverCard
      className="flex-1 min-h-[84px] bg-white rounded-[20px] py-4 px-4 border border-border flex-row items-center gap-3.5 shadow-sm"
      lift={-3}
    >
      {/* Left side icon */}
      <View
        className={`w-11 h-11 rounded-[14px] items-center justify-center ${
          isProgress ? 'bg-successBg' : 'bg-palePeach'
        }`}
      >
        <MaterialIcons
          name={iconName}
          size={22}
          color={isProgress ? Colors.success : Colors.primary}
        />
      </View>

      {/* Right side numbers and headings */}
      <View className="flex-1 justify-center gap-0.5">
        <View className="flex-row items-center gap-1.5">
          <Text className="font-manrope-extrabold text-[22px] text-textPrimary tracking-tight leading-[26px]" numberOfLines={1}>
            {value}
          </Text>
          {badge ? (
            <View
              className={`px-1.5 py-0.5 rounded-md ${
                isProgress ? 'bg-successBg' : 'bg-palePeach'
              }`}
            >
              <Text
                className={`font-manrope-bold text-[10px] ${
                  isProgress ? 'text-success' : 'text-primaryDark'
                }`}
              >
                {badge}
              </Text>
            </View>
          ) : null}
        </View>

        <Text className="font-manrope-semibold text-xs text-textSecondary tracking-tight" numberOfLines={1}>
          {label}
        </Text>
      </View>
    </HoverCard>
  );
};
