import React from 'react';
import { View, Text } from 'react-native';
import { MaterialType } from '../../types/materials';
import { FileText, Video, Presentation, BookOpen, Image as ImageIcon, HelpCircle, Link2 } from 'lucide-react-native';
import Colors from '../../constants/colors';

interface TypeBadgeProps {
  type: MaterialType;
  size?: 'sm' | 'md';
}

export const TypeBadge: React.FC<TypeBadgeProps> = ({ type, size = 'md' }) => {
  const isSm = size === 'sm';
  const iconSize = isSm ? 12 : 14;

  const getBadgeConfig = () => {
    switch (type) {
      case 'pdf':
        return {
          label: 'PDF Document',
          icon: <FileText size={iconSize} color={Colors.primary} />,
          bg: 'bg-palePeach',
          textColor: 'text-primaryDark',
        };
      case 'video':
        return {
          label: 'Lecture Video',
          icon: <Video size={iconSize} color="#b45309" />,
          bg: 'bg-[#fef3c7]',
          textColor: 'text-[#92400e]',
        };
      case 'presentation':
        return {
          label: 'Slides / PPT',
          icon: <Presentation size={iconSize} color="#047857" />,
          bg: 'bg-[#d1fae5]',
          textColor: 'text-[#065f46]',
        };
      case 'notes':
        return {
          label: 'Lecture Notes',
          icon: <BookOpen size={iconSize} color={Colors.primary} />,
          bg: 'bg-palePeach',
          textColor: 'text-primaryDark',
        };
      case 'image':
        return {
          label: 'Diagram / Image',
          icon: <ImageIcon size={iconSize} color="#4338ca" />,
          bg: 'bg-[#ede9fe]',
          textColor: 'text-[#3730a3]',
        };
      case 'quiz':
        return {
          label: 'Checkpoint Quiz',
          icon: <HelpCircle size={iconSize} color={Colors.accentGoldDark} />,
          bg: 'bg-accentGoldBg',
          textColor: 'text-accentGoldDark',
        };
      case 'external':
      default:
        return {
          label: 'Web Resource',
          icon: <Link2 size={iconSize} color={Colors.textSecondary} />,
          bg: 'bg-softWarm',
          textColor: 'text-textPrimary',
        };
    }
  };

  const config = getBadgeConfig();

  return (
    <View className={`flex-row items-center gap-1 rounded-md ${config.bg} ${isSm ? 'px-1.5 py-0.5' : 'px-2 py-1'}`}>
      {config.icon}
      <Text className={`font-manrope-bold ${config.textColor} ${isSm ? 'text-[10px]' : 'text-[11px]'}`}>
        {config.label}
      </Text>
    </View>
  );
};
