import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Colors from '../../constants/colors';
import { BorderRadius, Shadows } from '../../constants/spacing';
import { SchoolClass } from '../../types/curriculum';
import { HoverCard } from '../common/HoverCard';

interface ClassCardProps {
  schoolClass: SchoolClass;
  isSelected?: boolean;
  onPress: () => void;
  horizontal?: boolean;
}

export const ClassCard: React.FC<ClassCardProps> = ({
  schoolClass,
  isSelected = false,
  onPress,
  horizontal = true,
}) => {
  const totalChapters = schoolClass.subjects.reduce(
    (acc, subj) => acc + subj.chapters.length,
    0
  );

  return (
    <HoverCard
      style={[
        styles.card,
        horizontal ? styles.cardHorizontal : styles.cardFullWidth,
        isSelected && styles.selectedCard,
      ]}
      onPress={onPress}
      lift={-5}
    >
      <View style={styles.contentPadding}>
        <View style={styles.topRow}>
          <View
            style={[
              styles.iconContainer,
              isSelected && styles.selectedIconContainer,
            ]}
          >
            <Text
              style={[
                styles.gradeNumberText,
                isSelected && styles.selectedGradeNumberText,
              ]}
            >
              {schoolClass.grade}
            </Text>
          </View>

          {isSelected ? (
            <View style={styles.selectedBadge}>
              <View style={styles.pulseDot} />
              <Text style={styles.selectedBadgeText}>Selected</Text>
            </View>
          ) : (
            <View style={styles.roundArrow}>
              <MaterialIcons name="chevron-right" size={18} color={Colors.textMuted} />
            </View>
          )}
        </View>

        <Text style={[styles.title, isSelected && styles.selectedTitle]}>
          {schoolClass.title}
        </Text>
        <Text style={[styles.subtitle, isSelected && styles.selectedSubtitle]}>
          {schoolClass.subjects.length} subjects · {totalChapters} chapters
        </Text>
      </View>

      {isSelected ? (
        <View style={styles.selectedFooter}>
          <Text style={styles.selectedFooterText}>Current Academic Year</Text>
          <MaterialIcons name="arrow-forward" size={16} color={Colors.primary} />
        </View>
      ) : (
        <View style={styles.footer}>
          <Text style={styles.badgeText}>{schoolClass.badge}</Text>
          <Text style={styles.viewText}>View →</Text>
        </View>
      )}
    </HoverCard>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.border,
    justifyContent: 'space-between',
    overflow: 'hidden',
    ...Shadows.subtle,
  },
  cardHorizontal: {
    width: 200,
    minHeight: 140,
    marginRight: 10,
  },
  cardFullWidth: {
    width: '100%',
    minHeight: 90,
    marginBottom: 10,
  },
  selectedCard: {
    borderColor: Colors.borderAccent,
    borderWidth: 1.5,
    backgroundColor: Colors.surfaceSoft,
  },
  contentPadding: {
    padding: 14,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.palePeach,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedIconContainer: {
    backgroundColor: Colors.primary,
  },
  gradeNumberText: {
    fontFamily: 'Manrope_800ExtraBold',
    fontSize: 16,
    color: Colors.primary,
  },
  selectedGradeNumberText: {
    color: Colors.white,
  },
  selectedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.pill,
    gap: 4,
  },
  pulseDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: Colors.white,
  },
  selectedBadgeText: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 10,
    color: Colors.white,
  },
  roundArrow: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.softWarm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontFamily: 'Manrope_800ExtraBold',
    fontSize: 16,
    color: Colors.textPrimary,
  },
  selectedTitle: {
    color: Colors.textPrimary,
  },
  subtitle: {
    fontFamily: 'Manrope_500Medium',
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  selectedSubtitle: {
    color: Colors.primary,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingBottom: 12,
  },
  badgeText: {
    fontFamily: 'Manrope_600SemiBold',
    fontSize: 11,
    color: Colors.textMuted,
  },
  viewText: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 11,
    color: Colors.primary,
  },
  selectedFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.palePeach,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  selectedFooterText: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 11,
    color: Colors.primaryDark,
  },
});
