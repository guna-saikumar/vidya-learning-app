import React from 'react';
import { View, Text } from 'react-native';

interface PageIntroProps {
  eyebrow?: string;
  badge?: string;
  title: string;
  description?: string;
  rightAction?: React.ReactNode;
}

export const PageIntro: React.FC<PageIntroProps> = ({
  eyebrow,
  badge,
  title,
  description,
  rightAction,
}) => {
  return (
    <View className="py-1 gap-1">
      {eyebrow ? (
        <View className="flex-row items-center gap-2 mb-0.5">
          <Text className="font-manrope-extrabold text-[11px] text-primary tracking-widest uppercase">
            {eyebrow}
          </Text>
          {badge && (
            <View className="bg-palePeach px-2.5 py-0.5 rounded-full border border-primaryLight">
              <Text className="font-manrope-bold text-[10px] text-primaryDark">{badge}</Text>
            </View>
          )}
        </View>
      ) : null}

      <View className="flex-row items-center justify-between">
        <Text className="font-manrope-extrabold text-[22px] text-textPrimary tracking-tight flex-1">
          {title}
        </Text>
        {rightAction ? (
          <View className="ml-3">
            {rightAction}
          </View>
        ) : null}
      </View>

      {description ? (
        <Text className="font-manrope-medium text-[13px] text-textSecondary leading-[19px] mt-0.5">
          {description}
        </Text>
      ) : null}
    </View>
  );
};
