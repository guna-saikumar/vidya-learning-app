import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Colors from '../../constants/colors';
import { Shadows } from '../../constants/spacing';
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
  completedChaptersCount = 0,
  onPress,
}) => {
  const totalChapters = subject.chapters.length;

  return (
    <HoverCard
      style={styles.card}
      onPress={onPress}
      lift={-4}
    >
      {/* Subject Icon Box matching Figma Make .subject-icon */}
      <View style={styles.iconContainer}>
        <MaterialIcons
          name={(subject.icon as any) || 'menu-book'}
          size={24}
          color={Colors.primary}
        />
      </View>

      {/* Subject Content */}
      <View style={styles.content}>
        <View style={styles.titleRow}>
          <Text style={styles.title} numberOfLines={1}>
            {subject.name}
          </Text>
          <MaterialIcons name="chevron-right" size={20} color={Colors.textMuted} />
        </View>

        {subject.description && (
          <Text style={styles.description} numberOfLines={2}>
            {subject.description}
          </Text>
        )}

        <View style={styles.metaRow}>
          <Text style={styles.metaText}>{totalChapters} chapters</Text>
          <Text style={styles.metaText}>{progressPercent}% complete</Text>
        </View>

        {/* Progress Track matching Figma Make .progress-track */}
        <View style={styles.progressTrack}>
          <View
            style={[
              styles.progressFill,
              { width: `${Math.max(2, Math.min(100, progressPercent))}%` },
            ]}
          />
        </View>
      </View>
    </HoverCard>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 20,
    backgroundColor: Colors.white,
    marginBottom: 14,
    ...Shadows.subtle,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: Colors.palePeach,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    gap: 6,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontFamily: 'Manrope_800ExtraBold',
    fontSize: 17,
    color: Colors.textPrimary,
    letterSpacing: -0.3,
    flex: 1,
  },
  description: {
    fontFamily: 'Manrope_500Medium',
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  metaText: {
    fontFamily: 'Manrope_600SemiBold',
    fontSize: 12,
    color: Colors.textMuted,
  },
  progressTrack: {
    height: 6,
    borderRadius: 20,
    backgroundColor: '#F3EDE9',
    overflow: 'hidden',
    marginTop: 4,
  },
  progressFill: {
    height: '100%',
    borderRadius: 20,
    backgroundColor: Colors.primary,
  },
});
