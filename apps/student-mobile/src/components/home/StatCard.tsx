import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Colors from '../../constants/colors';
import { Shadows } from '../../constants/spacing';
import { HoverCard } from '../common/HoverCard';

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
    <HoverCard style={styles.card} lift={-3}>
      {/* Left side icon */}
      <View style={[styles.iconContainer, isProgress && styles.progressIconContainer]}>
        <MaterialIcons
          name={iconName}
          size={22}
          color={isProgress ? Colors.success : Colors.primary}
        />
      </View>

      {/* Right side numbers and headings */}
      <View style={styles.rightContent}>
        <View style={styles.valueRow}>
          <Text style={styles.valueText} numberOfLines={1}>
            {value}
          </Text>
          {badge ? (
            <View style={[styles.badgeContainer, isProgress && styles.progressBadgeContainer]}>
              <Text style={[styles.badgeText, isProgress && styles.progressBadgeText]}>
                {badge}
              </Text>
            </View>
          ) : null}
        </View>

        <Text style={styles.label} numberOfLines={1}>
          {label}
        </Text>
      </View>
    </HoverCard>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minHeight: 84,
    backgroundColor: Colors.white,
    borderRadius: 20,
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    ...Shadows.subtle,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 14,
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
    gap: 2,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  valueText: {
    fontFamily: 'Manrope_800ExtraBold',
    fontSize: 22,
    color: Colors.textPrimary,
    letterSpacing: -0.5,
    lineHeight: 26,
  },
  label: {
    fontFamily: 'Manrope_600SemiBold',
    fontSize: 12,
    color: Colors.textSecondary,
    letterSpacing: -0.1,
  },
  badgeContainer: {
    backgroundColor: Colors.palePeach,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  badgeText: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 10,
    color: Colors.primaryDark,
  },
  progressBadgeContainer: {
    backgroundColor: Colors.successBg,
  },
  progressBadgeText: {
    color: Colors.success,
  },
});
