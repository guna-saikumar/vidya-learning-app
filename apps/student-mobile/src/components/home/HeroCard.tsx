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
  pillText = "Today's Focus",
  title = 'Consistent practice creates mastery',
  subtitle = 'Pick up right where you left off or explore a new topic.',
}) => {
  return (
    <View style={styles.card}>
      <View style={styles.copy}>
        {pillText ? (
          <View style={styles.pill}>
            <MaterialIcons name="auto-awesome" size={13} color={Colors.white} />
            <Text style={styles.pillText}>{pillText}</Text>
          </View>
        ) : null}
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>

      <View style={styles.iconCircle}>
        <MaterialIcons name="school" size={36} color="rgba(255, 255, 255, 0.25)" />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.primaryDark,
    borderRadius: 24,
    padding: 24,
    position: 'relative',
    overflow: 'hidden',
    justifyContent: 'center',
    minHeight: 160,
  },
  copy: {
    width: '80%',
    gap: 10,
    zIndex: 2,
  },
  pill: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: BorderRadius.pill,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
  },
  pillText: {
    fontSize: 11,
    fontFamily: 'Manrope_700Bold',
    color: Colors.white,
    letterSpacing: 0.2,
  },
  title: {
    fontSize: 20,
    fontFamily: 'Manrope_800ExtraBold',
    color: Colors.white,
    lineHeight: 26,
    letterSpacing: -0.4,
  },
  subtitle: {
    fontSize: 13,
    fontFamily: 'Manrope_500Medium',
    color: Colors.primaryLight,
    lineHeight: 19,
  },
  iconCircle: {
    position: 'absolute',
    right: -10,
    bottom: -10,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
