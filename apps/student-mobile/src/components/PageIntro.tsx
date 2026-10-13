import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Colors from '../../../../packages/design-tokens/src/colors';

interface PageIntroProps {
  eyebrow?: string;
  title: string;
  description?: string;
  badge?: string;
}

export const PageIntro: React.FC<PageIntroProps> = ({
  eyebrow,
  title,
  description,
  badge,
}) => {
  return (
    <View style={styles.container}>
      {eyebrow ? (
        <View style={styles.eyebrowRow}>
          <Text style={styles.eyebrowText}>{eyebrow.toUpperCase()}</Text>
          {badge && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{badge}</Text>
            </View>
          )}
        </View>
      ) : null}
      <Text style={styles.title}>{title}</Text>
      {description ? <Text style={styles.description}>{description}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 4,
    gap: 4,
  },
  eyebrowRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 2,
  },
  eyebrowText: {
    fontFamily: 'Manrope_800ExtraBold',
    fontSize: 11,
    color: Colors.primary,
    letterSpacing: 1.2,
  },
  badge: {
    backgroundColor: Colors.palePeach,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 20,
  },
  badgeText: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 10,
    color: Colors.primaryDark,
  },
  title: {
    fontFamily: 'Manrope_800ExtraBold',
    fontSize: 22,
    color: Colors.textPrimary,
    letterSpacing: -0.4,
  },
  description: {
    fontFamily: 'Manrope_500Medium',
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 19,
  },
});
