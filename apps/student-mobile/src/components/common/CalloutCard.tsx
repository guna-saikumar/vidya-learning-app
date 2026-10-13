import React from 'react';
import { View, Text } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Colors from '../../constants/colors';
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
  variant = 'example',
  formulaText,
  exampleBadges,
  objectivesList,
}) => {
  // Figma Make .learning-box
  if (variant === 'learning' || variant === 'tip') {
    return (
      <HoverCard className="flex-row gap-3.5 p-5 rounded-[18px] border border-[#ead7cd] bg-palePeach my-2" lift={-3}>
        <View className="mt-0.5">
          <MaterialIcons name="auto-awesome" size={20} color={Colors.primary} />
        </View>
        <View className="flex-1 gap-1.5">
          <Text className="font-manrope-extrabold text-base text-textPrimary">{title || 'Learning objectives'}</Text>
          {description ? (
            <Text className="font-manrope-medium text-[13px] text-[#66544d] leading-[19px]">{description}</Text>
          ) : null}
          {objectivesList && objectivesList.length > 0 && (
            <View className="gap-1.5 mt-1">
              {objectivesList.map((item, idx) => (
                <View key={idx} className="flex-row items-start gap-1.5">
                  <Text className="font-manrope-bold text-sm text-primary leading-[18px]">•</Text>
                  <Text className="font-manrope-medium text-[13px] text-[#66544d] leading-[19px] flex-1">{item}</Text>
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
      <HoverCard className="p-[18px] border-l-[3px] border-l-accentGold rounded-r-xl bg-accentGoldBg my-2.5 gap-1.5" lift={-3}>
        <Text className="font-manrope-extrabold text-[11px] text-accentGoldDark tracking-wider uppercase">
          {title || 'TRY IT YOURSELF'}
        </Text>
        {formulaText && (
          <Text className="font-manrope-extrabold text-base text-textPrimary italic my-0.5">{formulaText}</Text>
        )}
        <Text className="font-manrope-medium text-[13px] text-[#5b4a3e] leading-5">{description}</Text>
        {exampleBadges && exampleBadges.length > 0 && (
          <View className="flex-row flex-wrap gap-1.5 mt-1.5">
            {exampleBadges.map((badge, idx) => (
              <View key={idx} className="bg-white px-2 py-0.5 rounded border border-[#eedcba]">
                <Text className="font-manrope-bold text-[11px] text-textPrimary">{badge}</Text>
              </View>
            ))}
          </View>
        )}
      </HoverCard>
    );
  }

  // Notice box
  return (
    <View className="flex-row items-center gap-2 p-3 rounded-xl bg-softWarm">
      <MaterialIcons name="info-outline" size={18} color={Colors.primary} />
      <Text className="font-manrope-medium text-xs text-textSecondary flex-1 leading-4">{description}</Text>
    </View>
  );
};
