import React from 'react';
import { View, Text } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Colors from '../../constants/colors';
import { DOUBT_STATUS_LABEL } from '../../utils/doubts';
import type { DoubtStatus } from '../../types/doubts';

const STYLES: Record<DoubtStatus, { bg: string; text: string; color: string }> = {
  open: { bg: 'bg-accentGoldBg', text: 'text-accentGoldDark', color: Colors.accentGoldDark },
  peer_answered: { bg: 'bg-palePeach', text: 'text-primary', color: Colors.primary },
  teacher_answered: { bg: 'bg-successBg', text: 'text-success', color: Colors.success },
  resolved: { bg: 'bg-successBg', text: 'text-success', color: Colors.success },
};

export const DoubtStatusChip: React.FC<{ status: DoubtStatus }> = ({ status }) => {
  const s = STYLES[status];
  return (
    <View className={`flex-row items-center gap-1 px-2.5 py-0.5 rounded-full ${s.bg}`}>
      {status === 'resolved' && <MaterialIcons name="check-circle" size={12} color={s.color} />}
      <Text className={`font-manrope-bold text-xs ${s.text}`}>{DOUBT_STATUS_LABEL[status]}</Text>
    </View>
  );
};
