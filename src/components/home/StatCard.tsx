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
      <View style={styles.topRow}>
        <View style={[styles.iconContainer, isProgress && styles.progressIconContainer]}>
          <MaterialIcons
            name={iconName}
            size={20}
            color={isProgress ? Colors.success : Colors.primary}
          />
        </View>
        {badge ? (
          <View style={[styles.badgeContainer, isProgress && styles.progressBadgeContainer]}>
            <Text style={[styles.badgeText, isProgress && styles.progressBadgeText]}>
              {badge}
            </Text>
          </View>
        ) : null}
      </View>

      <View style={styles.bottomContent}>
        <Text style={styles.valueText}>{value}</Text>
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
    minHeight: 104,
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    justifyContent: 'space-between',
    ...Shadows.subtle,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  iconContainer: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: Colors.palePeach,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressIconContainer: {
    backgroundColor: Colors.successBg,
  },
  badgeContainer: {
    backgroundColor: Colors.palePeach,
    paddingHorizontal: 8,
    paddingVertical: 3,
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
  bottomContent: {
    gap: 3,
  },
  valueText: {
    fontFamily: 'Manrope_800ExtraBold',
    fontSize: 24,
    color: Colors.textPrimary,
    letterSpacing: -0.5,
    lineHeight: 28,
  },
  label: {
    fontFamily: 'Manrope_600SemiBold',
    fontSize: 12,
    color: Colors.textSecondary,
    letterSpacing: -0.1,
  },
});
