import React from 'react';
import { Platform, View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialIcons } from '@expo/vector-icons';
import Colors from '../constants/colors';
import { MainTabParamList } from '../types/navigation';
import { DashboardScreen } from '../screens/DashboardScreen';
import { MyLearningScreen } from '../screens/MyLearningScreen';
import { BookmarksScreen } from '../screens/BookmarksScreen';
import { ProfileScreen } from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator<MainTabParamList>();

export const TabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: '#99877f',
        tabBarStyle: {
          backgroundColor: 'rgba(255, 255, 255, 0.98)',
          borderTopColor: Colors.border,
          borderTopWidth: 1,
          height: Platform.OS === 'ios' ? 86 : 68,
          paddingBottom: Platform.OS === 'ios' ? 24 : 8,
          paddingTop: 6,
          elevation: 8,
        },
        tabBarLabelStyle: {
          fontFamily: 'Manrope_700Bold',
          fontSize: 10,
          marginTop: 2,
        },
        tabBarItemStyle: {
          paddingVertical: 2,
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={DashboardScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <View className={`w-11 h-[30px] rounded-xl items-center justify-center ${focused ? 'bg-palePeach' : ''}`}>
              <MaterialIcons name="home" size={22} color={color} />
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="MyLearning"
        component={MyLearningScreen}
        options={{
          tabBarLabel: 'My Learning',
          tabBarIcon: ({ color, focused }) => (
            <View className={`w-11 h-[30px] rounded-xl items-center justify-center ${focused ? 'bg-palePeach' : ''}`}>
              <MaterialIcons name="school" size={22} color={color} />
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="Bookmarks"
        component={BookmarksScreen}
        options={{
          tabBarLabel: 'Bookmarks',
          tabBarIcon: ({ color, focused }) => (
            <View className={`w-11 h-[30px] rounded-xl items-center justify-center ${focused ? 'bg-palePeach' : ''}`}>
              <MaterialIcons name="bookmark" size={22} color={color} />
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <View className={`w-11 h-[30px] rounded-xl items-center justify-center ${focused ? 'bg-palePeach' : ''}`}>
              <MaterialIcons name="person" size={22} color={color} />
            </View>
          ),
        }}
      />
    </Tab.Navigator>
  );
};
