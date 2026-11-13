import React from 'react';
import { View, Text } from 'react-native';

interface PageIntroProps {
  eyebrow?: string;
  title: string;
  description?: string;
  badge?: string;
}

export const PageIntro: React.FC<PageIntroProps> = ({
  eyebrow,
  title,
  description,
  badge,
}) => {
  return (
    <View className="py-1 gap-1">
      {eyebrow ? (
        <View className="flex-row items-center gap-2 mb-0.5">
          <Text className="font-manrope-extrabold text-[11px] text-primary tracking-widest uppercase">
            {eyebrow}
          </Text>
          {badge && (
            <View className="bg-palePeach px-2 py-0.5 rounded-full">
              <Text className="font-manrope-bold text-[10px] text-primaryDark">{badge}</Text>
            </View>
          )}
        </View>
      ) : null}
      <Text className="font-manrope-extrabold text-[22px] text-textPrimary tracking-tight">
        {title}
      </Text>
      {description ? (
        <Text className="font-manrope-medium text-[13px] text-textSecondary leading-[19px]">
          {description}
        </Text>
      ) : null}
    </View>
  );
};
