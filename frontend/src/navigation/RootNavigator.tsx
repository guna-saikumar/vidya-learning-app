import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { useAuth } from '../hooks/useAuth';
import { useAppSelector } from '../store';
import Colors from '../constants/colors';

// Auth Screen
import { LoginScreen } from '../screens/LoginScreen';

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
import { ContactUsScreen } from '../screens/ContactUsScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

const LoadingScreen: React.FC = () => (
  <View style={{ flex: 1, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' }}>
    <ActivityIndicator size="large" color={Colors.primary} />
  </View>
);

export const RootNavigator: React.FC = () => {
  const { isAuthenticated, isOnboarded, loading: authLoading } = useAuth();
  const profileIsOnboarded = useAppSelector((state) => state.student.profile?.isOnboarded);

  const needsOnboarding = isAuthenticated && !(profileIsOnboarded ?? isOnboarded);

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: Colors.surface },
        animation: 'slide_from_right',
        animationDuration: 200,
      }}
    >
      {authLoading ? (
        <Stack.Screen
          name="Loading"
          component={LoadingScreen}
          options={{ animation: 'none' }}
        />
      ) : !isAuthenticated ? (
          // Unauthenticated Stack: Protected routes are inaccessible
          <Stack.Group>
            <Stack.Screen
              name="Login"
              component={LoginScreen}
              options={{ animation: 'none' }}
            />
          </Stack.Group>
        ) : needsOnboarding ? (
          // First-Time Student Onboarding: Collect school, class, section details
          <Stack.Group>
            <Stack.Screen
              name="StudentOnboarding"
              component={StudentOnboardingScreen}
              options={{ animation: 'fade', animationDuration: 180 }}
            />
            <Stack.Screen name="Home" component={DashboardScreen} />
          </Stack.Group>
        ) : (
          // Authenticated Stack: Gated protected routes
          <Stack.Group>
            {/* 3 Main Bottom Tab Screens - Instant 0ms switching */}
            <Stack.Screen name="Home" component={DashboardScreen} options={{ animation: 'none' }} />
            <Stack.Screen name="Learn" component={LearnScreen} options={{ animation: 'none' }} />
            <Stack.Screen name="Profile" component={ProfileScreen} options={{ animation: 'none' }} />

            {/* Secondary Screens */}
            <Stack.Screen name="MyLearning" component={MyLearningScreen} options={{ animation: 'slide_from_right', animationDuration: 200 }} />
            <Stack.Screen name="Bookmarks" component={BookmarksScreen} options={{ animation: 'slide_from_right', animationDuration: 200 }} />

            {/* Student Onboarding & Academic Details Editor */}
            <Stack.Screen name="StudentOnboarding" component={StudentOnboardingScreen} options={{ animation: 'slide_from_bottom', animationDuration: 220 }} />

            {/* Curriculum Screens - Snappy hardware-accelerated transitions */}
            <Stack.Screen name="ClassSubjects" component={ClassSubjectsScreen} options={{ animation: 'slide_from_right', animationDuration: 200 }} />
            <Stack.Screen name="SubjectIndex" component={SubjectIndexScreen} options={{ animation: 'slide_from_right', animationDuration: 200 }} />
            <Stack.Screen name="ChapterDetails" component={ChapterDetailsScreen} options={{ animation: 'slide_from_right', animationDuration: 200 }} />
            <Stack.Screen name="SectionDetails" component={SectionDetailsScreen} options={{ animation: 'slide_from_right', animationDuration: 200 }} />

            {/* Notifications */}
            <Stack.Screen name="Notifications" component={NotificationsScreen} options={{ animation: 'slide_from_right', animationDuration: 200 }} />
            <Stack.Screen name="NotificationDetail" component={NotificationDetailScreen} options={{ animation: 'slide_from_right', animationDuration: 200 }} />

            {/* Support & Contact Us */}
            <Stack.Screen name="ContactUs" component={ContactUsScreen} options={{ animation: 'slide_from_right', animationDuration: 200 }} />
          </Stack.Group>
        )}
      </Stack.Navigator>
  );
};
