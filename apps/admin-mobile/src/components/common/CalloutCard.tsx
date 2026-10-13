import React from 'react';
import { View, Text } from 'react-native';
import { Sparkles, Info, BookOpen, AlertCircle } from 'lucide-react-native';
import Colors from '../../constants/colors';
import { HoverCard } from './HoverCard';

interface CalloutCardProps {
  title?: string;
  description: string;
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
  if (variant === 'learning' || variant === 'tip') {
    return (
      <HoverCard
        className="flex-row gap-3.5 p-5 rounded-[20px] border border-[#ead7cd] bg-palePeach my-2 overflow-hidden shadow-sm"
        lift={-3}
      >
        <View className="mt-0.5">
          <Sparkles size={20} color={Colors.primary} />
        </View>
        <View className="flex-1 min-w-0 gap-1.5" style={{ flex: 1, minWidth: 0 }}>
          <Text className="font-manrope-extrabold text-base text-textPrimary">
            {title || 'Learning Objectives'}
          </Text>
          {description ? (
            <Text className="font-manrope-medium text-[13px] text-[#66544d] leading-[19px]">
              {description}
            </Text>
          ) : null}
          {objectivesList && objectivesList.length > 0 && (
            <View className="gap-1.5 mt-1">
              {objectivesList.map((item, idx) => (
                <View key={idx} className="flex-row items-start gap-1.5">
                  <Text className="font-manrope-bold text-sm text-primary leading-[18px]">•</Text>
                  <Text className="font-manrope-medium text-[13px] text-[#66544d] leading-[19px] flex-1">
                    {item}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </HoverCard>
    );
  }

  if (variant === 'example' || variant === 'formula') {
    return (
      <HoverCard
        className="p-5 border-l-[3px] border-l-accentGold rounded-r-[20px] bg-accentGoldBg my-2.5 gap-1.5 overflow-hidden shadow-sm"
        lift={-3}
      >
        <Text className="font-manrope-extrabold text-[11px] text-accentGoldDark tracking-wider uppercase">
          {title || 'TRY IT YOURSELF'}
        </Text>
        {formulaText && (
          <Text className="font-manrope-extrabold text-base text-textPrimary italic my-0.5">
            {formulaText}
          </Text>
        )}
        <Text className="font-manrope-medium text-[13px] text-[#5b4a3e] leading-5">
          {description}
        </Text>
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
    <View className="flex-row items-center gap-2.5 p-4 rounded-[16px] bg-softWarm border border-border">
      <Info size={18} color={Colors.primary} />
      <Text className="font-manrope-medium text-xs text-textSecondary flex-1 leading-4">
        {description}
      </Text>
    </View>
  );
};
