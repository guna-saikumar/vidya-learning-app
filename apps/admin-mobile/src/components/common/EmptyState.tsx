import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { FolderOpen } from 'lucide-react-native';
import Colors from '../../constants/colors';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  message: string;
  actionLabel?: string;
  onActionPress?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  message,
  actionLabel,
  onActionPress,
}) => {
  return (
    <View className="items-center justify-center py-12 px-6 gap-3">
      <View className="w-16 h-16 rounded-2xl bg-palePeach items-center justify-center border border-primaryLight shadow-sm">
        {icon || <FolderOpen size={30} color={Colors.primary} />}
      </View>
      <Text className="font-manrope-extrabold text-base text-textPrimary text-center">
        {title}
      </Text>
      <Text className="font-manrope-medium text-xs text-textSecondary text-center max-w-xs leading-5">
        {message}
      </Text>
      {actionLabel && onActionPress && (
        <TouchableOpacity
          className="mt-2 bg-primary px-5 py-2.5 rounded-full shadow-sm"
          onPress={onActionPress}
          activeOpacity={0.8}
        >
          <Text className="font-manrope-bold text-xs text-white">{actionLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};
