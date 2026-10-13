import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Colors from '../../constants/colors';
import { Chapter } from '../../types/curriculum';
import { HoverCard } from '../common/HoverCard';

interface ChapterListItemProps {
  chapter: Chapter;
  isCompleted?: boolean;
  progressPercent?: number;
  onPress: () => void;
  onSectionPress?: (sectionId: string) => void;
}

export const ChapterListItem: React.FC<ChapterListItemProps> = ({
  chapter,
  isCompleted = false,
  onPress,
  onSectionPress,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const formattedOrder = chapter.order < 10 ? `0${chapter.order}` : `${chapter.order}`;

  return (
    <HoverCard
      className="mb-3 bg-white rounded-[20px] border border-border overflow-hidden shadow-sm"
      lift={-3}
    >
      <TouchableOpacity
        className="flex-row items-start gap-3.5 p-[18px]"
        onPress={onPress}
        activeOpacity={0.88}
      >
        {/* Chapter Number Badge matching Figma Make .chapter-number */}
        <View
          className={`w-10 h-10 rounded-xl items-center justify-center mt-0.5 ${
            isCompleted ? 'bg-successBg' : 'bg-palePeach'
          }`}
        >
          {isCompleted ? (
            <MaterialIcons name="check" size={18} color={Colors.success} />
          ) : (
            <Text className="font-manrope-extrabold text-sm text-primary">{formattedOrder}</Text>
          )}
        </View>

        {/* Chapter Copy */}
        <View className="flex-1 gap-1">
          <Text className="font-manrope-extrabold text-base text-textPrimary leading-[22px] tracking-tight">
            {chapter.title}
          </Text>
          {chapter.description && (
            <Text className="font-manrope-medium text-xs text-textSecondary leading-4 mt-0.5" numberOfLines={2}>
              {chapter.description}
            </Text>
          )}
          <Text className="font-manrope-semibold text-[11px] text-textExtraMuted mt-1">
            {chapter.sections.length} Sections • {chapter.durationMinutes || 18} mins
          </Text>
        </View>

        <TouchableOpacity
          className="self-center p-0.5"
          onPress={() => setIsExpanded(!isExpanded)}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <MaterialIcons
            name={isExpanded ? 'expand-less' : 'chevron-right'}
            size={22}
            color={Colors.textMuted}
          />
        </TouchableOpacity>
      </TouchableOpacity>

      {/* Expandable Section Links */}
      {isExpanded && (
        <View className="px-4 pb-4 pt-2 border-t border-border gap-2">
          <Text className="font-manrope-extrabold text-[10px] text-primary tracking-wider mb-0.5 uppercase">
            Sections
          </Text>
          {chapter.sections.map((section, idx) => (
            <TouchableOpacity
              key={section.id}
              className="flex-row items-center gap-3 p-[11px] rounded-[14px] border border-border bg-white"
              onPress={() => onSectionPress && onSectionPress(section.id)}
              activeOpacity={0.75}
            >
              <View className="w-7 h-7 rounded-[9px] bg-palePeach items-center justify-center">
                <Text className="font-manrope-extrabold text-[11px] text-primary">{idx + 1}</Text>
              </View>
              <Text className="flex-1 font-manrope-bold text-[13px] text-textPrimary" numberOfLines={1}>
                {section.title}
              </Text>
              <MaterialIcons name="chevron-right" size={18} color={Colors.textMuted} />
            </TouchableOpacity>
          ))}
        </View>
      )}
    </HoverCard>
  );
};
