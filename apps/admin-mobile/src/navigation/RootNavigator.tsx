import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import Colors from '../constants/colors';
import { useAdminAuth } from '../hooks/useAdminAuth';

// Auth Screens
import { LoginScreen } from '../screens/auth/LoginScreen';
import { RegisterScreen } from '../screens/auth/RegisterScreen';
import { VerifyOtpScreen } from '../screens/auth/VerifyOtpScreen';
import { ForgotPasswordScreen } from '../screens/auth/ForgotPasswordScreen';
import { ResetPasswordScreen } from '../screens/auth/ResetPasswordScreen';

// Authenticated Screens
import { TabNavigator } from './TabNavigator';
import { ChaptersScreen } from '../screens/ChaptersScreen';
import { AddEditMaterialScreen } from '../screens/AddEditMaterialScreen';
import { ContentEditorScreen } from '../screens/ContentEditorScreen';
import { PreviewPublishScreen } from '../screens/PreviewPublishScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator: React.FC = () => {
  const { isAuthenticated, loading } = useAdminAuth();

  if (loading) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: Colors.white },
          animation: 'slide_from_right',
        }}
      >
        {!isAuthenticated ? (
          // Auth Stack (Unauthenticated)
          <Stack.Group>
            <Stack.Screen name="Login" component={LoginScreen} options={{ animation: 'fade' }} />
            <Stack.Screen name="Register" component={RegisterScreen} />
            <Stack.Screen name="VerifyOtp" component={VerifyOtpScreen} />
            <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
            <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
          </Stack.Group>
        ) : (
          // Admin Console Stack (Authenticated)
          <Stack.Group>
            <Stack.Screen name="MainTabs" component={TabNavigator} options={{ animation: 'fade' }} />
            <Stack.Screen name="Chapters" component={ChaptersScreen} />
            <Stack.Screen name="AddEditMaterial" component={AddEditMaterialScreen} />
            <Stack.Screen name="ContentEditor" component={ContentEditorScreen} />
            <Stack.Screen name="PreviewPublish" component={PreviewPublishScreen} />
          </Stack.Group>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};
