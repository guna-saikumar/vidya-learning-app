import './global.css';
import React from 'react';
import {
  View,
  ActivityIndicator,
  Platform,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaProvider, initialWindowMetrics } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import {
  useFonts,
  Manrope_400Regular,
  Manrope_500Medium,
  Manrope_600SemiBold,
  Manrope_700Bold,
  Manrope_800ExtraBold,
} from '@expo-google-fonts/manrope';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
} from '@expo-google-fonts/inter';
import { NavigationContainer } from '@react-navigation/native';
import { Provider } from 'react-redux';
import { store } from './src/store';
import { AuthProvider } from './src/hooks/useAuth';
import { RootNavigator } from './src/navigation/RootNavigator';
import Colors from './src/constants/colors';

/** Desktop browsers get a phone-sized frame instead of a stretched layout. */
const PHONE_FRAME_WIDTH = 430;
const FRAME_BREAKPOINT = 560;

export default function App() {
  const [fontsLoaded] = useFonts({
    Manrope_400Regular,
    Manrope_500Medium,
    Manrope_600SemiBold,
    Manrope_700Bold,
    Manrope_800ExtraBold,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
  });
  const { width } = useWindowDimensions();

  if (!fontsLoaded) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  const showPhoneFrame = Platform.OS === 'web' && width > FRAME_BREAKPOINT;

  const navigator = (
    <NavigationContainer>
      <RootNavigator />
    </NavigationContainer>
  );

  return (
    <SafeAreaProvider initialMetrics={initialWindowMetrics}>
      <StatusBar style="dark" />
      <Provider store={store}>
        <AuthProvider>
          {showPhoneFrame ? (
            <View style={styles.backdrop}>
              <View style={styles.frame}>{navigator}</View>
            </View>
          ) : (
            navigator
          )}
        </AuthProvider>
      </Provider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    backgroundColor: '#EDE4D8',
  },
  frame: {
    width: '100%',
    maxWidth: PHONE_FRAME_WIDTH,
    height: '100%',
    maxHeight: 920,
    overflow: 'hidden',
    borderRadius: 28,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(120, 90, 60, 0.12)',
    shadowColor: '#4A3520',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.22,
    shadowRadius: 44,
    elevation: 16,
  },
});
