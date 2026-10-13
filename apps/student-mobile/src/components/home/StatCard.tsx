import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Colors from '../../../../../packages/design-tokens/src/colors';
import { Shadows } from '../../../../../packages/design-tokens/src/spacing';
import { HoverCard } from '../common';

interface StatCardProps {
  label: string;
  value: string | number;
  subtitle?: string;
  iconName: keyof typeof MaterialIcons.glyphMap;
  badge?: string;
  isProgress?: boolean;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  subtitle,
  iconName,
  badge,
  isProgress = false,
}) => {
  return (
    <HoverCard
      style={styles.card}
      lift={-3}
    >
      {/* Left side icon */}
      <View style={[styles.iconContainer, isProgress && styles.progressIconContainer]}>
        <MaterialIcons
          name={iconName}
          size={20}
          color={isProgress ? Colors.success : Colors.primary}
        />
      </View>

      {/* Right side title and numbers */}
      <View style={styles.rightContent}>
        <Text style={styles.label} numberOfLines={1}>
          {label}
        </Text>
        <View style={styles.numberRow}>
          <Text style={styles.valueText}>{value}</Text>
          {badge ? (
            <View style={[styles.badgeContainer, isProgress && styles.progressBadgeContainer]}>
              <Text style={[styles.badgeText, isProgress && styles.progressBadgeText]}>
                {badge}
              </Text>
            </View>
          ) : subtitle ? (
            <Text style={styles.subtitleText} numberOfLines={1}>
              {subtitle}
            </Text>
          ) : null}
        </View>
      </View>
    </HoverCard>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minHeight: 76,
    backgroundColor: Colors.white,
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    ...Shadows.subtle,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.palePeach,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressIconContainer: {
    backgroundColor: Colors.successBg,
  },
  rightContent: {
    flex: 1,
    justifyContent: 'center',
    gap: 1,
  },
  label: {
    fontFamily: 'Manrope_600SemiBold',
    fontSize: 11,
    color: Colors.textSecondary,
    letterSpacing: -0.1,
  },
  numberRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 5,
    flexWrap: 'wrap',
  },
  valueText: {
    fontFamily: 'Manrope_800ExtraBold',
    fontSize: 20,
    color: Colors.textPrimary,
    lineHeight: 24,
    letterSpacing: -0.4,
  },
  badgeContainer: {
    backgroundColor: Colors.palePeach,
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 5,
  },
  badgeText: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 9,
    color: Colors.primaryDark,
  },
  progressBadgeContainer: {
    backgroundColor: Colors.successBg,
  },
  progressBadgeText: {
    color: Colors.success,
  },
  subtitleText: {
    fontFamily: 'Manrope_500Medium',
    fontSize: 10,
    color: Colors.textMuted,
  },
});
