import React from 'react';
import { View, Text } from 'react-native';

interface LearningProgressCardProps {
  completedCount: number;
  totalCount: number;
  progressPercent: number;
  title?: string;
  mediumNote?: string;
}

export const LearningProgressCard: React.FC<LearningProgressCardProps> = ({
  completedCount,
  totalCount,
  progressPercent,
  title = 'Your learning progress',
  mediumNote = 'English medium · Choose a subject to browse its chapters and lessons.',
}) => {
  const clampedPercent = Math.min(100, Math.max(0, Math.round(progressPercent)));

  return (
    <View className="gap-2.5">
      {mediumNote ? (
        <Text className="font-manrope-medium text-xs text-textSecondary leading-relaxed">
          {mediumNote}
        </Text>
      ) : null}

      <View className="bg-white rounded-[22px] p-5 border border-border shadow-sm gap-3.5">
        <View className="flex-row items-center justify-between">
          <View className="flex-1 mr-3">
            <Text className="font-manrope-extrabold text-base text-textPrimary tracking-tight">
              {title}
            </Text>
            <Text className="font-manrope-medium text-xs text-textSecondary mt-0.5">
              {completedCount} of {totalCount} sample chapters completed
            </Text>
          </View>

          <Text className="font-manrope-extrabold text-3xl text-primary tracking-tight">
            {clampedPercent}%
          </Text>
        </View>

        {/* Horizontal Progress Track */}
        <View className="h-2 rounded-full bg-[#f3ede9] overflow-hidden">
          <View
            className="h-full rounded-full bg-primary"
            style={{ width: `${clampedPercent}%` }}
          />
        </View>
      </View>
    </View>
  );
};
