import React from 'react';
import { View, TextInput, TouchableOpacity, Text, ScrollView } from 'react-native';
import { Search, X } from 'lucide-react-native';
import Colors from '../../constants/colors';

interface FilterOption {
  key: string;
  label: string;
  badge?: number;
}

interface SearchFilterBarProps {
  searchQuery: string;
  onSearchChange: (text: string) => void;
  placeholder?: string;
  filters?: FilterOption[];
  activeFilter?: string;
  onFilterSelect?: (key: string) => void;
}

export const SearchFilterBar: React.FC<SearchFilterBarProps> = ({
  searchQuery,
  onSearchChange,
  placeholder = 'Search curriculum, chapters, materials...',
  filters,
  activeFilter,
  onFilterSelect,
}) => {
  return (
    <View className="gap-2.5">
      {/* Search Input Box */}
      <View className="flex-row items-center bg-white border border-border rounded-[16px] px-3.5 h-12 shadow-sm">
        <Search size={18} color={Colors.textSecondary} />
        <TextInput
          className="flex-1 min-w-0 ml-2.5 font-manrope-medium text-sm text-textPrimary"
          value={searchQuery}
          onChangeText={onSearchChange}
          placeholder={placeholder}
          placeholderTextColor={Colors.textPlaceholder}
          returnKeyType="search"
          autoCapitalize="none"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity
            onPress={() => onSearchChange('')}
            className="w-6 h-6 rounded-full bg-softWarm items-center justify-center"
            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
          >
            <X size={14} color={Colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      {/* Filter Chips */}
      {filters && filters.length > 0 && onFilterSelect && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8 }}
          className="py-0.5"
        >
          {filters.map((filter) => {
            const isActive = activeFilter === filter.key;
            return (
              <TouchableOpacity
                key={filter.key}
                onPress={() => onFilterSelect(filter.key)}
                className={`flex-row items-center gap-1.5 px-3 py-1.5 rounded-full border ${
                  isActive
                    ? 'bg-primary border-primary'
                    : 'bg-white border-border'
                }`}
                activeOpacity={0.75}
              >
                <Text
                  className={`font-manrope-bold text-xs ${
                    isActive ? 'text-white' : 'text-textSecondary'
                  }`}
                >
                  {filter.label}
                </Text>
                {typeof filter.badge === 'number' && (
                  <View
                    className={`px-1.5 py-0.2 rounded-full ${
                      isActive ? 'bg-white/20' : 'bg-softWarm'
                    }`}
                  >
                    <Text
                      className={`font-manrope-bold text-[10px] ${
                        isActive ? 'text-white' : 'text-textMuted'
                      }`}
                    >
                      {filter.badge}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
};
