import React from 'react';
import { View, TextInput, TouchableOpacity, Text } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Colors from '../../constants/colors';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  onClear?: () => void;
  showFilterButton?: boolean;
  onFilterPress?: () => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChangeText,
  placeholder = 'Search subjects, chapters, topics...',
  onClear,
  showFilterButton = false,
  onFilterPress,
}) => {
  return (
    <View className="flex-row items-center gap-2">
      <View className="flex-1 h-[52px] flex-row items-center bg-white rounded-2xl border border-border px-4 shadow-sm">
        <MaterialIcons name="search" size={20} color={Colors.textSecondary} style={{ marginRight: 10 }} />
        <TextInput
          className="flex-1 font-manrope-medium text-sm text-textPrimary py-0"
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={Colors.textPlaceholder}
          returnKeyType="search"
          autoCapitalize="none"
        />
        {value.length > 0 && onClear && (
          <TouchableOpacity
            className="p-1.5"
            onPress={onClear}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <MaterialIcons name="close" size={16} color={Colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      {showFilterButton && (
        <TouchableOpacity
          className="h-[52px] flex-row items-center gap-1.5 px-4 rounded-2xl border border-border bg-white shadow-sm"
          onPress={onFilterPress}
          activeOpacity={0.8}
        >
          <MaterialIcons name="tune" size={18} color={Colors.primary} />
          <Text className="font-manrope-bold text-[13px] text-primary">Filter</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};
