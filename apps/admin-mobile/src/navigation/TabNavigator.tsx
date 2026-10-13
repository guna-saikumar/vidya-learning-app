import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { AdminTabParamList } from '../types/navigation';
import { DashboardScreen } from '../screens/DashboardScreen';
import { ClassesScreen } from '../screens/ClassesScreen';
import { MaterialsLibraryScreen } from '../screens/MaterialsLibraryScreen';
import { ProfileSettingsScreen } from '../screens/ProfileSettingsScreen';
import { BottomNav, AdminBottomNavTab } from '../components/common/BottomNav';

const Tab = createBottomTabNavigator<AdminTabParamList>();

export const TabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      initialRouteName="Dashboard"
      screenOptions={{
        headerShown: false,
      }}
      tabBar={({ state, navigation }) => {
        const routeName = state.routes[state.index].name;
        const activeTab =
          routeName === 'Dashboard'
            ? 'Home'
            : (routeName as AdminBottomNavTab);
        return <BottomNav activeTab={activeTab} navigation={navigation} />;
      }}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Curriculum" component={ClassesScreen} />
      <Tab.Screen name="Materials" component={MaterialsLibraryScreen} />
      <Tab.Screen name="Profile" component={ProfileSettingsScreen} />
    </Tab.Navigator>
  );
};

export default TabNavigator;
