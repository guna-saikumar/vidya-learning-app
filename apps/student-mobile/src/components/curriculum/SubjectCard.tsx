import React from 'react';
import { View, Text } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Colors from '../../constants/colors';
import { Subject } from '../../types/curriculum';
import { HoverCard } from '../common/HoverCard';

interface SubjectCardProps {
  subject: Subject;
  progressPercent?: number;
  completedChaptersCount?: number;
  onPress: () => void;
}

export const SubjectCard: React.FC<SubjectCardProps> = ({
  subject,
  progressPercent = 0,
  onPress,
}) => {
  const totalChapters = subject.chapters.length;

  return (
    <HoverCard
      className="flex-row items-start gap-4 p-5 border border-border rounded-[20px] bg-white mb-3.5 shadow-sm"
      onPress={onPress}
      lift={-4}
    >
      {/* Subject Icon Box matching Figma Make .subject-icon */}
      <View className="w-12 h-12 rounded-[14px] bg-palePeach items-center justify-center">
        <MaterialIcons
          name={(subject.icon as any) || 'menu-book'}
          size={24}
          color={Colors.primary}
        />
      </View>

      {/* Subject Content */}
      <View className="flex-1 gap-1.5">
        <View className="flex-row items-center justify-between">
          <Text className="font-manrope-extrabold text-[17px] text-textPrimary tracking-tight flex-1" numberOfLines={1}>
            {subject.name}
          </Text>
          <MaterialIcons name="chevron-right" size={20} color={Colors.textMuted} />
        </View>

        {subject.description && (
          <Text className="font-manrope-medium text-[13px] text-textSecondary leading-[18px]" numberOfLines={2}>
            {subject.description}
          </Text>
        )}

        <View className="flex-row items-center justify-between mt-1">
          <Text className="font-manrope-semibold text-xs text-textMuted">{totalChapters} chapters</Text>
          <Text className="font-manrope-semibold text-xs text-textMuted">{progressPercent}% complete</Text>
        </View>

        {/* Progress Track */}
        <View className="h-1.5 rounded-full bg-[#F3EDE9] overflow-hidden mt-1">
          <View
            className="h-full rounded-full bg-primary"
            style={{ width: `${Math.max(2, Math.min(100, progressPercent))}%` }}
          />
        </View>
      </View>
    </HoverCard>
  );
};
