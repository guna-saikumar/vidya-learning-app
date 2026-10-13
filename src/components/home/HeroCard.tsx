import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Colors from '../../constants/colors';
import { Spacing, BorderRadius } from '../../constants/spacing';

interface HeroCardProps {
  pillText?: string;
  title?: string;
  subtitle?: string;
}

export const HeroCard: React.FC<HeroCardProps> = ({
  pillText = 'Daily learning',
  title = 'Small steps lead to big progress.',
  subtitle = 'Keep your momentum going with one focused lesson today.',
}) => {
  return (
    <View style={styles.card}>
      <View style={styles.copy}>
        <View style={styles.pill}>
          <MaterialIcons name="auto-awesome" size={13} color={Colors.white} />
          <Text style={styles.pillText}>{pillText}</Text>
        </View>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>

      {/* Decorative Orbits & Icon matching Figma Make .hero-visual */}
      <View style={styles.visualContainer} pointerEvents="none">
        <View style={[styles.orbit, styles.orbitOne]} />
        <View style={[styles.orbit, styles.orbitTwo]} />
        <View style={styles.capIconWrapper}>
          <MaterialIcons name="school" size={44} color={Colors.primaryLight} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    minHeight: 175,
    backgroundColor: Colors.primaryDark,
    borderRadius: 24,
    padding: Spacing.md,
    position: 'relative',
    overflow: 'hidden',
    justifyContent: 'center',
  },
  copy: {
    width: '74%',
    zIndex: 2,
    gap: 8,
  },
  pill: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: BorderRadius.pill,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.18)',
  },
  pillText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.white,
  },
  title: {
    fontSize: 19,
    fontWeight: '800',
    color: Colors.white,
    lineHeight: 24,
    letterSpacing: -0.4,
  },
  subtitle: {
    fontSize: 12,
    color: Colors.primaryLight,
    lineHeight: 18,
  },
  visualContainer: {
    position: 'absolute',
    right: -10,
    bottom: -5,
    width: 125,
    height: 125,
    alignItems: 'center',
    justifyContent: 'center',
  },
  orbit: {
    position: 'absolute',
    borderRadius: BorderRadius.pill,
    borderColor: 'rgba(243, 217, 204, 0.24)',
    borderWidth: 1,
  },
  orbitOne: {
    width: 105,
    height: 105,
  },
  orbitTwo: {
    width: 78,
    height: 78,
    borderStyle: 'dashed',
    transform: [{ rotate: '20deg' }],
  },
  capIconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
