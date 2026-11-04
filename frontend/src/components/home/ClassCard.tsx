import React from 'react';
import { View, Text } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Colors from '../../constants/colors';
import { SchoolClass } from '../../types/curriculum';
import { HoverCard } from '../common/HoverCard';

interface ClassCardProps {
  schoolClass: SchoolClass;
  isSelected?: boolean;
  onPress: () => void;
  horizontal?: boolean;
}

export const ClassCard: React.FC<ClassCardProps> = ({
  schoolClass,
  isSelected = false,
  onPress,
  horizontal = true,
}) => {
  return (
    <HoverCard
      className={`rounded-[20px] p-[18px] justify-between shadow-sm ${
        horizontal ? 'w-[170px] min-h-[124px] mr-3' : 'w-full min-h-[88px] mb-3'
      } ${
        isSelected
          ? 'border-[1.5px] border-primary bg-surfaceSoft'
          : 'border border-border bg-white'
      }`}
      onPress={onPress}
      lift={-4}
    >
      <View className="flex-row items-center justify-between mb-3.5">
        <View
          className={`w-[38px] h-[38px] rounded-xl items-center justify-center ${
            isSelected ? 'bg-primary' : 'bg-palePeach'
          }`}
        >
          <Text
            className={`font-manrope-extrabold text-base ${
              isSelected ? 'text-white' : 'text-primary'
            }`}
          >
            {schoolClass.grade}
          </Text>
        </View>

        {isSelected ? (
          <View className="w-[22px] h-[22px] rounded-full bg-primary items-center justify-center">
            <MaterialIcons name="check" size={14} color={Colors.white} />
          </View>
        ) : (
          <MaterialIcons name="chevron-right" size={20} color={Colors.textMuted} />
        )}
      </View>

      <View className="gap-[3px]">
        <Text
          className={`font-manrope-extrabold text-base tracking-tight ${
            isSelected ? 'text-primaryDark' : 'text-textPrimary'
          }`}
        >
          {schoolClass.title}
        </Text>
        <Text
          className={`font-manrope-semibold text-xs ${
            isSelected ? 'text-primary' : 'text-textSecondary'
          }`}
        >
          {schoolClass.subjects.length} Subjects
        </Text>
      </View>
    </HoverCard>
  );
};
