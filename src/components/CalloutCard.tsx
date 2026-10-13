import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Colors from '../constants/colors';
import { HoverCard } from './HoverCard';

interface CalloutCardProps {
  title?: string;
  description: string;
  iconName?: keyof typeof MaterialIcons.glyphMap;
  variant?: 'tip' | 'formula' | 'notice' | 'learning' | 'example';
  formulaText?: string;
  exampleBadges?: string[];
  objectivesList?: string[];
}

export const CalloutCard: React.FC<CalloutCardProps> = ({
  title,
  description,
  iconName = 'auto-awesome',
  variant = 'example',
  formulaText,
  exampleBadges,
  objectivesList,
}) => {
  // Figma Make .learning-box
  if (variant === 'learning' || variant === 'tip') {
    return (
      <HoverCard style={styles.learningBox} lift={-3}>
        <View style={styles.learningIconBox}>
          <MaterialIcons name="auto-awesome" size={20} color={Colors.primary} />
        </View>
        <View style={styles.learningContent}>
          <Text style={styles.learningTitle}>{title || 'Learning objectives'}</Text>
          {description ? (
            <Text style={styles.learningDescription}>{description}</Text>
          ) : null}
          {objectivesList && objectivesList.length > 0 && (
            <View style={styles.objectivesList}>
              {objectivesList.map((item, idx) => (
                <View key={idx} style={styles.objectiveItem}>
                  <Text style={styles.bulletDot}>•</Text>
                  <Text style={styles.objectiveText}>{item}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </HoverCard>
    );
  }

  // Figma Make .example-box (gold border-left with TRY IT YOURSELF)
  if (variant === 'example' || variant === 'formula') {
    return (
      <HoverCard style={styles.exampleBox} lift={-3}>
        <Text style={styles.exampleEyebrow}>
          {(title || 'TRY IT YOURSELF').toUpperCase()}
        </Text>
        {formulaText && (
          <Text style={styles.formulaText}>{formulaText}</Text>
        )}
        <Text style={styles.exampleText}>{description}</Text>
        {exampleBadges && exampleBadges.length > 0 && (
          <View style={styles.badgesRow}>
            {exampleBadges.map((badge, idx) => (
              <View key={idx} style={styles.badgeChip}>
                <Text style={styles.badgeChipText}>{badge}</Text>
              </View>
            ))}
          </View>
        )}
      </HoverCard>
    );
  }

  // Notice box
  return (
    <View style={styles.noticeBox}>
      <MaterialIcons name="info-outline" size={18} color={Colors.primary} />
      <Text style={styles.noticeText}>{description}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  learningBox: {
    flexDirection: 'row',
    gap: 13,
    padding: 19,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#ead7cd',
    backgroundColor: Colors.palePeach,
    marginVertical: 8,
  },
  learningIconBox: {
    marginTop: 2,
  },
  learningContent: {
    flex: 1,
    gap: 6,
  },
  learningTitle: {
    fontFamily: 'Manrope_800ExtraBold',
    fontSize: 16,
    color: Colors.textPrimary,
  },
  learningDescription: {
    fontFamily: 'Manrope_500Medium',
    fontSize: 13,
    color: '#66544d',
    lineHeight: 19,
  },
  objectivesList: {
    gap: 6,
    marginTop: 4,
  },
  objectiveItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
  },
  bulletDot: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 14,
    color: Colors.primary,
    lineHeight: 18,
  },
  objectiveText: {
    fontFamily: 'Manrope_500Medium',
    fontSize: 13,
    color: '#66544d',
    lineHeight: 19,
    flex: 1,
  },
  exampleBox: {
    padding: 18,
    borderLeftWidth: 3,
    borderLeftColor: Colors.accentGold,
    borderRadius: 14,
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
    backgroundColor: Colors.accentGoldBg,
    marginVertical: 10,
    gap: 6,
  },
  exampleEyebrow: {
    fontFamily: 'Manrope_800ExtraBold',
    fontSize: 11,
    color: Colors.accentGoldDark,
    letterSpacing: 1,
  },
  formulaText: {
    fontFamily: 'Manrope_800ExtraBold',
    fontSize: 16,
    color: Colors.textPrimary,
    fontStyle: 'italic',
    marginVertical: 2,
  },
  exampleText: {
    fontFamily: 'Manrope_500Medium',
    fontSize: 13,
    color: '#5b4a3e',
    lineHeight: 20,
  },
  badgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 6,
  },
  badgeChip: {
    backgroundColor: Colors.white,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#eedcba',
  },
  badgeChipText: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 11,
    color: Colors.textPrimary,
  },
  noticeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 12,
    backgroundColor: Colors.softWarm,
  },
  noticeText: {
    fontFamily: 'Manrope_500Medium',
    fontSize: 12,
    color: Colors.textSecondary,
    flex: 1,
    lineHeight: 16,
  },
});
