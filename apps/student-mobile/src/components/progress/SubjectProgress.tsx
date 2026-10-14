import React from 'react';
import { View, Text } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Colors from '../../constants/colors';

interface SubjectProgressProps {
  subjectName: string;
  icon: string;
  totalChapters: number;
  completedChapters: number;
  progressPercent: number;
}

export const SubjectProgress: React.FC<SubjectProgressProps> = ({
  subjectName,
  icon,
  totalChapters,
  completedChapters,
  progressPercent,
}) => {
  const isComplete = progressPercent === 100;

  return (
    <View className="flex-row items-center gap-3.5 py-3.5 border-b border-border">
      <View
        className="w-10 h-10 rounded-xl items-center justify-center"
        style={{ backgroundColor: isComplete ? Colors.successBg : Colors.palePeach }}
      >
        <MaterialIcons
          name={(icon as keyof typeof MaterialIcons.glyphMap) || 'menu-book'}
          size={20}
          color={isComplete ? Colors.success : Colors.primary}
        />
      </View>

      <View className="flex-1 gap-1.5">
        <View className="flex-row items-center justify-between">
          <Text className="font-manrope-bold text-[13px] text-textPrimary">{subjectName}</Text>
          <Text className="font-manrope-extrabold text-xs text-primary">{progressPercent}%</Text>
        </View>

        <View className="h-1.5 rounded-full bg-[#F3EDE9] overflow-hidden">
          <View
            className="h-full rounded-full"
            style={{
              width: `${progressPercent}%`,
              backgroundColor: isComplete ? Colors.success : Colors.primary,
            }}
          />
        </View>

        <Text className="font-manrope-medium text-[11px] text-textMuted">
          {completedChapters}/{totalChapters} chapters completed
        </Text>
      </View>
    </View>
  );
};
