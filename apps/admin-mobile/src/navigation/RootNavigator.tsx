import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import Colors from '../constants/colors';

// Navigators & Screens
import { TabNavigator } from './TabNavigator';
import { ChaptersScreen } from '../screens/ChaptersScreen';
import { AddEditMaterialScreen } from '../screens/AddEditMaterialScreen';
import { ContentEditorScreen } from '../screens/ContentEditorScreen';
import { PreviewPublishScreen } from '../screens/PreviewPublishScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator: React.FC = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="MainTabs"
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: Colors.white },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="MainTabs" component={TabNavigator} options={{ animation: 'fade' }} />
        <Stack.Screen name="Chapters" component={ChaptersScreen} />
        <Stack.Screen name="AddEditMaterial" component={AddEditMaterialScreen} />
        <Stack.Screen name="ContentEditor" component={ContentEditorScreen} />
        <Stack.Screen name="PreviewPublish" component={PreviewPublishScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
