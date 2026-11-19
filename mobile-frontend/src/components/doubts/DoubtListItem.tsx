import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Colors from '../../constants/colors';
import { DoubtStatusChip } from './DoubtStatusChip';
import { SectionChip } from './SectionChip';
import { formatAnswerCount, formatRelativeTime, getDoubtStatus } from '../../utils/doubts';
import type { DoubtSummary } from '../../types/doubts';

interface DoubtListItemProps {
  doubt: DoubtSummary;
  sectionTitle?: string;
  onPress: () => void;
  onUpvote: () => void;
}

export const DoubtListItem: React.FC<DoubtListItemProps> = ({
  doubt,
  sectionTitle,
  onPress,
  onUpvote,
}) => (
  <TouchableOpacity
    className="bg-white rounded-[20px] p-4 border border-border flex-row gap-3.5 shadow-sm"
    onPress={onPress}
    activeOpacity={0.85}
    accessibilityRole="button"
    accessibilityLabel={`${doubt.title}. ${formatAnswerCount(doubt.answerCount)}`}
  >
    <TouchableOpacity
      className={`w-11 h-14 rounded-xl border items-center justify-center ${
        doubt.upvotedByMe ? 'bg-palePeach border-primary' : 'bg-white border-border'
      }`}
      onPress={onUpvote}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={doubt.upvotedByMe ? 'Remove upvote' : 'Upvote this doubt'}
      accessibilityState={{ selected: doubt.upvotedByMe }}
    >
      <MaterialIcons
        name="keyboard-arrow-up"
        size={20}
        color={doubt.upvotedByMe ? Colors.primary : Colors.textSecondary}
      />
      <Text
        className={`font-manrope-extrabold text-xs ${
          doubt.upvotedByMe ? 'text-primary' : 'text-textPrimary'
        }`}
      >
        {doubt.upvoteCount}
      </Text>
    </TouchableOpacity>

    <View className="flex-1 gap-2" style={{ minWidth: 0 }}>
      <View className="flex-row items-start justify-between gap-2">
        <Text
          className="font-manrope-extrabold text-[15px] text-textPrimary leading-[21px] flex-1"
          numberOfLines={2}
        >
          {doubt.title}
        </Text>
      </View>
      <Text className="font-manrope-medium text-[13px] text-textSecondary leading-[19px]" numberOfLines={2}>
        {doubt.preview}
      </Text>
      {sectionTitle ? <SectionChip title={sectionTitle} /> : null}
      <View className="flex-row flex-wrap items-center gap-x-2.5 gap-y-1.5">
        <DoubtStatusChip status={getDoubtStatus(doubt)} />
        <Text className="font-manrope-medium text-xs text-textMuted">
          {doubt.author.name} · {formatRelativeTime(doubt.createdAt)}
        </Text>
      </View>
      <Text className="font-manrope-semibold text-xs text-textSecondary">
        {formatAnswerCount(doubt.answerCount)}
      </Text>
    </View>
  </TouchableOpacity>
);
