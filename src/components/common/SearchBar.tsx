import React from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Colors from '../../constants/colors';
import { Shadows } from '../../constants/spacing';

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
    <View style={styles.container}>
      <View style={styles.searchBox}>
        <MaterialIcons name="search" size={20} color={Colors.textSecondary} style={styles.searchIcon} />
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={Colors.textPlaceholder}
          returnKeyType="search"
          autoCapitalize="none"
        />
        {value.length > 0 && onClear && (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={onClear}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <MaterialIcons name="close" size={16} color={Colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      {showFilterButton && (
        <TouchableOpacity
          style={styles.filterButton}
          onPress={onFilterPress}
          activeOpacity={0.8}
        >
          <MaterialIcons name="tune" size={18} color={Colors.primary} />
          <Text style={styles.filterText}>Filter</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  searchBox: {
    flex: 1,
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 16,
    ...Shadows.subtle,
  },
  searchIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontFamily: 'Manrope_500Medium',
    fontSize: 14,
    color: Colors.textPrimary,
    paddingVertical: 0,
  },
  clearButton: {
    padding: 6,
  },
  filterButton: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
    ...Shadows.subtle,
  },
  filterText: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 13,
    color: Colors.primary,
  },
});
