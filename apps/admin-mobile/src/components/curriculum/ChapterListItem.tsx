import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Chapter, Section } from '../../types/curriculum';
import {
  ChevronDown,
  ChevronUp,
  Clock,
  Plus,
  Edit2,
  Trash2,
  FileText,
  Target,
} from 'lucide-react-native';
import Colors from '../../constants/colors';
import { StatusBadge } from '../common/StatusBadge';
import { HoverCard } from '../common/HoverCard';

interface ChapterListItemProps {
  chapter: Chapter;
  onEdit: () => void;
  onDelete: () => void;
  onAddSection: () => void;
  onEditSection: (section: Section) => void;
  onDeleteSection: (sectionId: string) => void;
}

export const ChapterListItem: React.FC<ChapterListItemProps> = ({
  chapter,
  onEdit,
  onDelete,
  onAddSection,
  onEditSection,
  onDeleteSection,
}) => {
  const [expanded, setExpanded] = useState(false);
  const formattedOrder = chapter.chapterNumber < 10 ? `0${chapter.chapterNumber}` : `${chapter.chapterNumber}`;

  return (
    <HoverCard className="bg-white rounded-[20px] border border-border shadow-sm overflow-hidden my-2" lift={-3}>
      {/* Chapter Main Header */}
      <View className="p-4 gap-3">
        <View className="flex-row items-start justify-between gap-2.5">
          <View className="flex-row items-center gap-3 flex-1 min-w-0">
            {/* Number Badge matching student-mobile */}
            <View className="w-10 h-10 rounded-[12px] bg-palePeach items-center justify-center border border-primaryLight shadow-sm">
              <Text className="font-manrope-extrabold text-sm text-primary">
                {formattedOrder}
              </Text>
            </View>

            <View className="flex-1 min-w-0">
              {chapter.unitName && (
                <Text className="font-manrope-bold text-[10px] text-primary tracking-wider uppercase mb-0.5">
                  {chapter.unitName}
                </Text>
              )}
              <Text className="font-manrope-extrabold text-base text-textPrimary tracking-tight" numberOfLines={2}>
                {chapter.title}
              </Text>
            </View>
          </View>

          <StatusBadge status={chapter.status} size="sm" />
        </View>

        {chapter.description ? (
          <Text className="font-manrope-medium text-xs text-textSecondary leading-[17px]">
            {chapter.description}
          </Text>
        ) : null}

        {/* Learning Goals Snippet */}
        {chapter.learningGoals && chapter.learningGoals.length > 0 && (
          <View className="flex-row items-center gap-2 bg-palePeach/70 p-2.5 rounded-[12px] border border-primaryLight">
            <Target size={14} color={Colors.primary} />
            <Text className="font-manrope-semibold text-[11px] text-textPrimary flex-1" numberOfLines={2}>
              {chapter.learningGoals[0]}
              {chapter.learningGoals.length > 1 ? ` (+${chapter.learningGoals.length - 1} more)` : ''}
            </Text>
          </View>
        )}

        {/* Footer Row */}
        <View className="flex-row flex-wrap items-center justify-between gap-y-2 pt-2.5 border-t border-border">
          <View className="flex-row items-center gap-2">
            {chapter.durationMinutes && (
              <View className="flex-row items-center gap-1">
                <Clock size={12} color={Colors.textMuted} />
                <Text className="font-manrope-medium text-[11px] text-textMuted">
                  {chapter.durationMinutes}m
                </Text>
              </View>
            )}
            <TouchableOpacity
              className="flex-row items-center gap-1 bg-softWarm px-2 py-0.5 rounded-full border border-border"
              onPress={() => setExpanded(!expanded)}
              activeOpacity={0.7}
            >
              <Text className="font-manrope-bold text-[11px] text-primary">
                {chapter.sections.length} {chapter.sections.length === 1 ? 'Section' : 'Sections'}
              </Text>
              {expanded ? (
                <ChevronUp size={12} color={Colors.primary} />
              ) : (
                <ChevronDown size={12} color={Colors.primary} />
              )}
            </TouchableOpacity>
          </View>

          {/* Action buttons */}
          <View className="flex-row items-center gap-1.5">
            <TouchableOpacity
              className="flex-row items-center gap-1 bg-primary px-2.5 py-1 rounded-full"
              onPress={onAddSection}
              activeOpacity={0.8}
            >
              <Plus size={11} color={Colors.white} />
              <Text className="font-manrope-bold text-[11px] text-white">Section</Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="w-7 h-7 rounded-lg bg-softWarm items-center justify-center border border-border"
              onPress={onEdit}
              activeOpacity={0.7}
              accessibilityLabel="Edit chapter"
            >
              <Edit2 size={12} color={Colors.textSecondary} />
            </TouchableOpacity>

            <TouchableOpacity
              className="w-7 h-7 rounded-lg bg-softWarm items-center justify-center border border-border"
              onPress={onDelete}
              activeOpacity={0.7}
              accessibilityLabel="Delete chapter"
            >
              <Trash2 size={12} color={Colors.error} />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Expandable Sections List */}
      {expanded && (
        <View className="bg-surface p-4 border-t border-border gap-2">
          <View className="flex-row items-center justify-between pb-1">
            <Text className="font-manrope-extrabold text-xs text-textPrimary uppercase tracking-wider">
              Sections & Sub-Topics
            </Text>
            <TouchableOpacity onPress={onAddSection} className="flex-row items-center gap-1">
              <Plus size={12} color={Colors.primary} />
              <Text className="font-manrope-bold text-xs text-primary">Add Section</Text>
            </TouchableOpacity>
          </View>

          {chapter.sections.length === 0 ? (
            <View className="py-4 items-center justify-center bg-white rounded-[14px] border border-border">
              <Text className="font-manrope-medium text-xs text-textMuted">
                No sections created yet for this chapter.
              </Text>
            </View>
          ) : (
            chapter.sections.map((sec, idx) => (
              <View
                key={sec.id}
                className="bg-white p-3.5 rounded-[14px] border border-border flex-row items-center justify-between gap-2 shadow-xs"
              >
                <View className="flex-row items-center gap-2.5 flex-1 min-w-0">
                  <View className="w-6 h-6 rounded-md bg-palePeach items-center justify-center">
                    <Text className="font-manrope-bold text-[10px] text-primary">{idx + 1}</Text>
                  </View>
                  <View className="flex-1 min-w-0">
                    <Text className="font-manrope-extrabold text-[13px] text-textPrimary" numberOfLines={1}>
                      {sec.title}
                    </Text>
                    {(sec.summaryPoint || sec.content) ? (
                      <Text className="font-manrope-medium text-[11px] text-textSecondary" numberOfLines={1}>
                        {sec.summaryPoint || sec.content}
                      </Text>
                    ) : null}
                  </View>
                </View>

                <View className="flex-row items-center gap-1">
                  <TouchableOpacity
                    className="w-7 h-7 rounded-md bg-softWarm items-center justify-center"
                    onPress={() => onEditSection(sec)}
                    activeOpacity={0.7}
                  >
                    <Edit2 size={12} color={Colors.textSecondary} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    className="w-7 h-7 rounded-md bg-softWarm items-center justify-center"
                    onPress={() => onDeleteSection(sec.id)}
                    activeOpacity={0.7}
                  >
                    <Trash2 size={12} color={Colors.error} />
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </View>
      )}
    </HoverCard>
  );
};
