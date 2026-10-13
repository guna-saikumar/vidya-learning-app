import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Colors from '../../constants/colors';
import { Shadows } from '../../constants/spacing';
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
  progressPercent = 0,
  onPress,
  onSectionPress,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const formattedOrder = chapter.order < 10 ? `0${chapter.order}` : `${chapter.order}`;

  return (
    <HoverCard
      style={styles.cardContainer}
      lift={-3}
    >
      <TouchableOpacity
        style={styles.card}
        onPress={onPress}
        activeOpacity={0.88}
      >
        {/* Chapter Number Badge matching Figma Make .chapter-number */}
        <View style={[styles.numberBadge, isCompleted && styles.numberBadgeDone]}>
          {isCompleted ? (
            <MaterialIcons name="check" size={18} color={Colors.success} />
          ) : (
            <Text style={styles.numberText}>{formattedOrder}</Text>
          )}
        </View>

        {/* Chapter Copy */}
        <View style={styles.chapterCopy}>
          <Text style={styles.chapterTitle}>{chapter.title}</Text>
          {chapter.description && (
            <Text style={styles.chapterDescription} numberOfLines={2}>
              {chapter.description}
            </Text>
          )}
          <Text style={styles.sectionsCountText}>
            {chapter.sections.length} Sections • {chapter.durationMinutes || 18} mins
          </Text>
        </View>

        <TouchableOpacity
          style={styles.expandAction}
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
        <View style={styles.sectionsContainer}>
          <Text style={styles.sectionsHeaderLabel}>Sections</Text>
          {chapter.sections.map((section, idx) => (
            <TouchableOpacity
              key={section.id}
              style={styles.sectionRow}
              onPress={() => onSectionPress && onSectionPress(section.id)}
              activeOpacity={0.75}
            >
              <View style={styles.sectionNumberCircle}>
                <Text style={styles.sectionNumberText}>{idx + 1}</Text>
              </View>
              <Text style={styles.sectionTitleText} numberOfLines={1}>
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

const styles = StyleSheet.create({
  cardContainer: {
    marginBottom: 12,
    backgroundColor: Colors.white,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
    ...Shadows.subtle,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
    padding: 18,
  },
  numberBadge: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.palePeach,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  numberBadgeDone: {
    backgroundColor: Colors.successBg,
  },
  numberText: {
    fontFamily: 'Manrope_800ExtraBold',
    fontSize: 14,
    color: Colors.primary,
  },
  chapterCopy: {
    flex: 1,
    gap: 4,
  },
  chapterTitle: {
    fontFamily: 'Manrope_800ExtraBold',
    fontSize: 16,
    color: Colors.textPrimary,
    lineHeight: 22,
    letterSpacing: -0.3,
  },
  chapterDescription: {
    fontFamily: 'Manrope_500Medium',
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 16,
    marginTop: 1,
  },
  sectionsCountText: {
    fontFamily: 'Manrope_600SemiBold',
    fontSize: 11,
    color: Colors.textExtraMuted,
    marginTop: 4,
  },
  expandAction: {
    alignSelf: 'center',
    padding: 2,
  },
  sectionsContainer: {
    paddingHorizontal: 15,
    paddingBottom: 15,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    gap: 8,
  },
  sectionsHeaderLabel: {
    fontFamily: 'Manrope_800ExtraBold',
    fontSize: 10,
    color: Colors.primary,
    letterSpacing: 1,
    marginBottom: 2,
  },
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 11,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
  },
  sectionNumberCircle: {
    width: 28,
    height: 28,
    borderRadius: 9,
    backgroundColor: Colors.palePeach,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionNumberText: {
    fontFamily: 'Manrope_800ExtraBold',
    fontSize: 11,
    color: Colors.primary,
  },
  sectionTitleText: {
    flex: 1,
    fontFamily: 'Manrope_700Bold',
    fontSize: 13,
    color: Colors.textPrimary,
  },
});
