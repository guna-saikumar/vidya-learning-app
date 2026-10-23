import React from 'react';
import { View, Text, TouchableOpacity, Platform } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '../../constants/colors';

export type BottomNavTab = 'Home' | 'Learn' | 'Profile';

interface BottomNavProps {
  activeTab?: BottomNavTab;
  navigation: any;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab = 'Home', navigation }) => {
  const insets = useSafeAreaInsets();
  const bottomInset = Math.max(insets.bottom, Platform.OS === 'ios' ? 18 : 8);

  const tabs: Array<{ key: BottomNavTab; label: string; icon: keyof typeof MaterialIcons.glyphMap }> = [
    { key: 'Home', label: 'Home', icon: 'home' },
    { key: 'Learn', label: 'Learn', icon: 'auto-stories' },
    { key: 'Profile', label: 'Profile', icon: 'person' },
  ];

  const handleTabPress = (key: BottomNavTab) => {
    navigation.navigate(key);
  };

  return (
    <View
      className="bg-white/95 border-t border-border pt-2 flex-row items-center justify-around shadow-lg"
      style={{ paddingBottom: bottomInset, height: 62 + bottomInset }}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.key;
        const color = isActive ? Colors.primary : '#99877f';

        return (
          <TouchableOpacity
            key={tab.key}
            className="flex-1 items-center justify-center py-0.5"
            onPress={() => handleTabPress(tab.key)}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel={tab.label}
          >
            <View className={`w-11 h-7 rounded-full items-center justify-center ${isActive ? 'bg-palePeach' : ''}`}>
              <MaterialIcons name={tab.icon} size={21} color={color} />
            </View>
            <Text
              className={`font-manrope-bold text-[10px] mt-0.5 ${isActive ? 'text-primary' : 'text-[#99877f]'}`}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};
