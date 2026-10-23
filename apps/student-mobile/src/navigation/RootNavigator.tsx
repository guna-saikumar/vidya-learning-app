import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { useAuth } from '../hooks/useAuth';
import Colors from '../constants/colors';

// Auth Screen
import { LoginScreen } from '../screens/auth/LoginScreen';

// Authenticated Screens
import { DashboardScreen } from '../screens/DashboardScreen';
import { LearnScreen } from '../screens/LearnScreen';
import { MyLearningScreen } from '../screens/MyLearningScreen';
import { BookmarksScreen } from '../screens/BookmarksScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { ClassSubjectsScreen } from '../screens/ClassSubjectsScreen';
import { SubjectIndexScreen } from '../screens/SubjectIndexScreen';
import { ChapterDetailsScreen } from '../screens/ChapterDetailsScreen';
import { SectionDetailsScreen } from '../screens/SectionDetailsScreen';
import { NotificationsScreen } from '../screens/NotificationsScreen';
import { NotificationDetailScreen } from '../screens/NotificationDetailScreen';
import { StudentOnboardingScreen } from '../screens/StudentOnboardingScreen';
import { useLearningProgress } from '../hooks/useLearningProgress';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator: React.FC = () => {
  const { isAuthenticated, isOnboarded, loading: authLoading } = useAuth();
  // Only hydrate learning state after auth — avoids 401 spam on the login screen.
  const { profile, loading: profileLoading } = useLearningProgress();

  if (authLoading || (isAuthenticated && profileLoading)) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  const needsOnboarding =
    isAuthenticated && !(profile?.isOnboarded ?? isOnboarded);

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: Colors.surface },
        animation: 'slide_from_right',
      }}
    >
        {!isAuthenticated ? (
          // Unauthenticated Stack: Protected routes are inaccessible
          <Stack.Group>
            <Stack.Screen
              name="Login"
              component={LoginScreen}
              options={{ animation: 'fade' }}
            />
          </Stack.Group>
        ) : needsOnboarding ? (
          // First-Time Student Onboarding: Collect school, class, section details
          <Stack.Group>
            <Stack.Screen
              name="StudentOnboarding"
              component={StudentOnboardingScreen}
              options={{ animation: 'fade' }}
            />
            <Stack.Screen name="Home" component={DashboardScreen} />
          </Stack.Group>
        ) : (
          // Authenticated Stack: Gated protected routes
          <Stack.Group>
            {/* 3 Main Bottom Tab Screens */}
            <Stack.Screen name="Home" component={DashboardScreen} options={{ animation: 'fade' }} />
            <Stack.Screen name="Learn" component={LearnScreen} options={{ animation: 'fade' }} />

            {/* Student Onboarding & Academic Details Editor */}
            <Stack.Screen name="StudentOnboarding" component={StudentOnboardingScreen} />

            {/* Account & Profile Screen */}
            <Stack.Screen name="Profile" component={ProfileScreen} />

            {/* Secondary Screens */}
            <Stack.Screen name="MyLearning" component={MyLearningScreen} options={{ animation: 'fade' }} />
            <Stack.Screen name="Bookmarks" component={BookmarksScreen} options={{ animation: 'fade' }} />

            {/* Curriculum Screens */}
            <Stack.Screen name="ClassSubjects" component={ClassSubjectsScreen} />
            <Stack.Screen name="SubjectIndex" component={SubjectIndexScreen} />
            <Stack.Screen name="ChapterDetails" component={ChapterDetailsScreen} />
            <Stack.Screen name="SectionDetails" component={SectionDetailsScreen} />

            {/* Notifications */}
            <Stack.Screen name="Notifications" component={NotificationsScreen} />
            <Stack.Screen name="NotificationDetail" component={NotificationDetailScreen} />
          </Stack.Group>
        )}
      </Stack.Navigator>
  );
};
