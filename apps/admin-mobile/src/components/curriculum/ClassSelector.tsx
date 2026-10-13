import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SchoolClass } from '../../types/curriculum';

interface ClassSelectorProps {
  classes: SchoolClass[];
  selectedClassId: string;
  onSelectClass: (classId: string) => void;
  className?: string;
}

export const ClassSelector: React.FC<ClassSelectorProps> = ({
  classes,
  selectedClassId,
  onSelectClass,
  className = '',
}) => {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ gap: 10, paddingVertical: 2 }}
      className={className}
    >
      {classes.map((c) => {
        const isSelected = selectedClassId === c.id;
        return (
          <TouchableOpacity
            key={c.id}
            onPress={() => onSelectClass(c.id)}
            className={`min-w-[100px] px-3.5 py-2.5 rounded-2xl border items-center justify-center gap-1 ${
              isSelected
                ? 'bg-palePeach border-primary shadow-sm'
                : 'bg-white border-border'
            }`}
            activeOpacity={0.8}
          >
            <Text
              className={`font-manrope-extrabold text-sm ${
                isSelected ? 'text-primaryDark' : 'text-textPrimary'
              }`}
            >
              {c.title}
            </Text>
            {c.badge ? (
              <View
                className={`px-2 py-0.5 rounded-full ${
                  isSelected ? 'bg-primary' : 'bg-softWarm'
                }`}
              >
                <Text
                  className={`font-manrope-bold text-[10px] ${
                    isSelected ? 'text-white' : 'text-textSecondary'
                  }`}
                >
                  {c.badge}
                </Text>
              </View>
            ) : null}
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
};

