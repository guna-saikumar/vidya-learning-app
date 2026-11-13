import React from 'react';
import { View, Text } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Colors from '../../constants/colors';

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
    <View className="bg-primaryDark rounded-3xl p-6 relative overflow-hidden justify-center min-h-[160px]">
      <View className="w-4/5 gap-2.5 z-10">
        {pillText ? (
          <View className="self-start flex-row items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10">
            <MaterialIcons name="auto-awesome" size={13} color={Colors.white} />
            <Text className="text-[11px] font-manrope-bold text-white tracking-wide">{pillText}</Text>
          </View>
        ) : null}
        <Text className="text-xl font-manrope-extrabold text-white leading-[26px] tracking-tight">{title}</Text>
        <Text className="text-[13px] font-manrope-medium text-primaryLight leading-[19px]">{subtitle}</Text>
      </View>

      <View className="absolute -right-2.5 -bottom-2.5 w-24 h-24 rounded-full bg-white/5 items-center justify-center">
        <MaterialIcons name="school" size={36} color="rgba(255, 255, 255, 0.25)" />
      </View>
    </View>
  );
};
