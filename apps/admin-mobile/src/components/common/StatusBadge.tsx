import React from 'react';
import { View, Text } from 'react-native';
import { PublicationStatus } from '../../types/materials';
import { CheckCircle2, Clock, Archive } from 'lucide-react-native';
import Colors from '../../constants/colors';

interface StatusBadgeProps {
  status: PublicationStatus;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const isSm = size === 'sm';

  switch (status) {
    case 'published':
      return (
        <View className={`flex-row items-center gap-1 bg-[#E7F3ED] rounded-full ${isSm ? 'px-2 py-0.5' : 'px-2.5 py-1'}`}>
          <CheckCircle2 size={isSm ? 12 : 14} color={Colors.success} />
          <Text className={`font-manrope-bold text-success ${isSm ? 'text-[10px]' : 'text-xs'}`}>
            Published
          </Text>
        </View>
      );
    case 'draft':
      return (
        <View className={`flex-row items-center gap-1 bg-[#FEF3C7] rounded-full ${isSm ? 'px-2 py-0.5' : 'px-2.5 py-1'}`}>
          <Clock size={isSm ? 12 : 14} color={Colors.warning} />
          <Text className={`font-manrope-bold text-warning ${isSm ? 'text-[10px]' : 'text-xs'}`}>
            Draft
          </Text>
        </View>
      );
    case 'archived':
    default:
      return (
        <View className={`flex-row items-center gap-1 bg-softWarm rounded-full ${isSm ? 'px-2 py-0.5' : 'px-2.5 py-1'}`}>
          <Archive size={isSm ? 12 : 14} color={Colors.textMuted} />
          <Text className={`font-manrope-bold text-textMuted ${isSm ? 'text-[10px]' : 'text-xs'}`}>
            Archived
          </Text>
        </View>
      );
  }
};
