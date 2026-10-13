import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Colors from '../../constants/colors';
import { Shadows } from '../../constants/spacing';
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
  return (
    <HoverCard
      style={[
        styles.card,
        horizontal ? styles.cardHorizontal : styles.cardFullWidth,
        isSelected && styles.selectedCard,
      ]}
      onPress={onPress}
      lift={-4}
    >
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
            <MaterialIcons name="check" size={14} color={Colors.white} />
          </View>
        ) : (
          <MaterialIcons name="chevron-right" size={20} color={Colors.textMuted} />
        )}
      </View>

      <View style={styles.body}>
        <Text style={[styles.title, isSelected && styles.selectedTitle]}>
          {schoolClass.title}
        </Text>
        <Text style={[styles.subtitle, isSelected && styles.selectedSubtitle]}>
          {schoolClass.subjects.length} Subjects
        </Text>
      </View>
    </HoverCard>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 18,
    justifyContent: 'space-between',
    ...Shadows.subtle,
  },
  cardHorizontal: {
    width: 170,
    minHeight: 124,
    marginRight: 12,
  },
  cardFullWidth: {
    width: '100%',
    minHeight: 88,
    marginBottom: 12,
  },
  selectedCard: {
    borderColor: Colors.primary,
    borderWidth: 1.5,
    backgroundColor: Colors.surfaceSoft,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  iconContainer: {
    width: 38,
    height: 38,
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
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    gap: 3,
  },
  title: {
    fontFamily: 'Manrope_800ExtraBold',
    fontSize: 16,
    color: Colors.textPrimary,
    letterSpacing: -0.3,
  },
  selectedTitle: {
    color: Colors.primaryDark,
  },
  subtitle: {
    fontFamily: 'Manrope_600SemiBold',
    fontSize: 12,
    color: Colors.textSecondary,
  },
  selectedSubtitle: {
    color: Colors.primary,
  },
});
