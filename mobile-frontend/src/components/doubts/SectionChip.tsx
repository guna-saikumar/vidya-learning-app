import React from 'react';
import { View, Text } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Colors from '../../constants/colors';

export const SectionChip: React.FC<{ title: string }> = ({ title }) => (
  <View className="flex-row items-center gap-1 px-2 py-0.5 rounded-full bg-softWarm border border-border self-start max-w-full">
    <MaterialIcons name="menu-book" size={12} color={Colors.textSecondary} />
    <Text className="font-manrope-semibold text-[11px] text-textSecondary flex-shrink" numberOfLines={1}>
      {title}
    </Text>
  </View>
);
