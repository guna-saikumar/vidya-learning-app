import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { DashboardScreen } from '../screens/DashboardScreen';
import { MyLearningScreen } from '../screens/MyLearningScreen';
import { BookmarksScreen } from '../screens/BookmarksScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { ClassSubjectsScreen } from '../screens/ClassSubjectsScreen';
import { SubjectIndexScreen } from '../screens/SubjectIndexScreen';
import { ChapterDetailsScreen } from '../screens/ChapterDetailsScreen';
import { SectionDetailsScreen } from '../screens/SectionDetailsScreen';
import Colors from '../../../../packages/design-tokens/src/colors';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator: React.FC = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: Colors.surface },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="Home" component={DashboardScreen} options={{ animation: 'fade' }} />
        <Stack.Screen name="MyLearning" component={MyLearningScreen} options={{ animation: 'fade' }} />
        <Stack.Screen name="Bookmarks" component={BookmarksScreen} options={{ animation: 'fade' }} />
        <Stack.Screen name="Profile" component={ProfileScreen} options={{ animation: 'fade' }} />
        <Stack.Screen name="ClassSubjects" component={ClassSubjectsScreen} />
        <Stack.Screen name="SubjectIndex" component={SubjectIndexScreen} />
        <Stack.Screen name="ChapterDetails" component={ChapterDetailsScreen} />
        <Stack.Screen name="SectionDetails" component={SectionDetailsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
