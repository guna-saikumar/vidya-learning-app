import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '../../../../packages/design-tokens/src/colors';

export type BottomNavTab = 'Home' | 'MyLearning' | 'Bookmarks' | 'Profile';

interface BottomNavProps {
  activeTab?: BottomNavTab;
  navigation: any;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab = 'Home', navigation }) => {
  const insets = useSafeAreaInsets();
  const bottomInset = Math.max(insets.bottom, Platform.OS === 'ios' ? 18 : 8);

  const tabs: Array<{ key: BottomNavTab; label: string; icon: keyof typeof MaterialIcons.glyphMap }> = [
    { key: 'Home', label: 'Home', icon: 'home' },
    { key: 'MyLearning', label: 'My Learning', icon: 'school' },
    { key: 'Bookmarks', label: 'Bookmarks', icon: 'bookmark' },
    { key: 'Profile', label: 'Profile', icon: 'person' },
  ];

  const handleTabPress = (key: BottomNavTab) => {
    if (activeTab === key && (key === 'Home' || key === 'MyLearning' || key === 'Bookmarks' || key === 'Profile')) {
      navigation.navigate(key);
      return;
    }
    navigation.navigate(key);
  };

  return (
    <View style={[styles.tabBar, { paddingBottom: bottomInset, height: 58 + bottomInset }]}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.key;
        const color = isActive ? Colors.primary : '#99877f';

        return (
          <TouchableOpacity
            key={tab.key}
            style={styles.tabItem}
            onPress={() => handleTabPress(tab.key)}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel={tab.label}
          >
            <View style={[styles.iconPill, isActive && styles.iconPillActive]}>
              <MaterialIcons name={tab.icon} size={22} color={color} />
            </View>
            <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
    borderTopColor: Colors.border,
    borderTopWidth: 1,
    paddingTop: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    elevation: 8,
    shadowColor: Colors.shadowCard,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 14,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 2,
  },
  iconPill: {
    width: 44,
    height: 30,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconPillActive: {
    backgroundColor: Colors.palePeach,
  },
  tabLabel: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 10,
    marginTop: 2,
    color: '#99877f',
  },
  tabLabelActive: {
    color: Colors.primary,
  },
});
