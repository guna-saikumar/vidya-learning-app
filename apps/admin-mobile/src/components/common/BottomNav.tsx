import React from 'react';
import { View, Text, TouchableOpacity, Platform } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '../../constants/colors';

export type AdminBottomNavTab = 'Home' | 'Curriculum' | 'Materials' | 'Profile';

interface BottomNavProps {
  activeTab?: AdminBottomNavTab;
  navigation: any;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab = 'Home', navigation }) => {
  const insets = useSafeAreaInsets();
  const bottomInset = Math.max(insets.bottom, Platform.OS === 'ios' ? 18 : 8);

  const tabs: Array<{
    key: AdminBottomNavTab;
    screenName: string;
    label: string;
    icon: keyof typeof MaterialIcons.glyphMap;
  }> = [
    { key: 'Home', screenName: 'Dashboard', label: 'Home', icon: 'home' },
    { key: 'Curriculum', screenName: 'Curriculum', label: 'Curriculum', icon: 'menu-book' },
    { key: 'Materials', screenName: 'Materials', label: 'Materials', icon: 'library-books' },
    { key: 'Profile', screenName: 'Profile', label: 'Profile', icon: 'manage-accounts' },
  ];

  const handleTabPress = (tab: (typeof tabs)[number]) => {
    try {
      navigation.navigate('MainTabs', { screen: tab.screenName });
    } catch {
      navigation.navigate(tab.screenName);
    }
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
            onPress={() => handleTabPress(tab)}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel={tab.label}
          >
            <View className={`w-12 h-8 rounded-full items-center justify-center ${isActive ? 'bg-palePeach' : ''}`}>
              <MaterialIcons name={tab.icon} size={22} color={color} />
            </View>
            <Text
              className={`font-manrope-bold text-[11px] mt-0.5 ${isActive ? 'text-primary' : 'text-[#99877f]'}`}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

export default BottomNav;
