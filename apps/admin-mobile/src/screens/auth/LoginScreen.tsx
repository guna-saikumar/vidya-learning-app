import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '../../constants/colors';
import { useAdminAuth } from '../../hooks/useAdminAuth';

export const LoginScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const { login } = useAdminAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      setErrorMessage('Please enter both email and password.');
      return;
    }
    setErrorMessage(null);
    setLoading(true);

    try {
      await login(email.trim(), password);
    } catch (err: any) {
      const msg = err?.message || 'Login failed. Please check your credentials.';
      if (msg.toLowerCase().includes('not verified')) {
        setErrorMessage('Email not verified. Redirecting to OTP verification...');
        setTimeout(() => {
          navigation.navigate('VerifyOtp', { email: email.trim() });
        }, 1200);
      } else {
        setErrorMessage(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFillDemo = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setErrorMessage(null);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      className="flex-1 bg-white"
      style={{ paddingTop: Math.max(insets.top, 20) }}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24, paddingBottom: 40 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Brand Header */}
        <View className="items-center mt-6 mb-8">
          <View
            className="w-14 h-14 rounded-2xl bg-palePeach border border-[#f2ded3] items-center justify-center shadow-sm overflow-hidden mb-3"
            style={{ width: 56, height: 56 }}
          >
            <Image
              source={require('../../../assets/app-images/logo.png')}
              className="w-10 h-10"
              style={{ width: 40, height: 40 }}
              resizeMode="contain"
            />
          </View>
          <Text className="font-manrope-extrabold text-2xl text-textPrimary tracking-tight">
            Vidya Learning
          </Text>
          <View className="mt-1 bg-palePeach px-2.5 py-0.5 rounded-full border border-primaryLight">
            <Text className="font-manrope-extrabold text-[10px] text-primary tracking-widest uppercase">
              Admin Portal
            </Text>
          </View>
        </View>

        {/* Title */}
        <View className="mb-6">
          <Text className="font-manrope-bold text-xl text-textPrimary">Sign In</Text>
          <Text className="font-manrope-medium text-xs text-textSecondary mt-1 leading-relaxed">
            Enter your official credentials to manage State Board curriculum and learning materials.
          </Text>
        </View>

        {/* Error Alert */}
        {errorMessage && (
          <View className="mb-4 p-3.5 rounded-xl bg-red-50 border border-red-200 flex-row items-center gap-2.5">
            <MaterialIcons name="error-outline" size={20} color="#DC2626" />
            <Text className="font-manrope-medium text-xs text-red-700 flex-1">{errorMessage}</Text>
          </View>
        )}

        {/* Email Field */}
        <View className="mb-4">
          <Text className="font-manrope-semibold text-xs text-textPrimary mb-1.5">Official Email</Text>
          <View className="flex-row items-center h-12 px-3.5 rounded-xl border border-border bg-inputBg">
            <MaterialIcons name="mail-outline" size={20} color={Colors.textSecondary} />
            <TextInput
              className="flex-1 ml-2.5 font-manrope-medium text-sm text-textPrimary"
              placeholder="e.g. admin@vidya.edu.in"
              placeholderTextColor={Colors.textMuted}
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
          </View>
        </View>

        {/* Password Field */}
        <View className="mb-2">
          <Text className="font-manrope-semibold text-xs text-textPrimary mb-1.5">Password</Text>
          <View className="flex-row items-center h-12 px-3.5 rounded-xl border border-border bg-inputBg">
            <MaterialIcons name="lock-outline" size={20} color={Colors.textSecondary} />
            <TextInput
              className="flex-1 ml-2.5 font-manrope-medium text-sm text-textPrimary"
              placeholder="••••••••"
              placeholderTextColor={Colors.textMuted}
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <MaterialIcons
                name={showPassword ? 'visibility-off' : 'visibility'}
                size={20}
                color={Colors.textSecondary}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Forgot Password Link */}
        <View className="items-end mb-6">
          <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')} activeOpacity={0.7}>
            <Text className="font-manrope-semibold text-xs text-primary">Forgot Password?</Text>
          </TouchableOpacity>
        </View>

        {/* Sign In Button */}
        <TouchableOpacity
          className="h-12 rounded-xl bg-primary items-center justify-center shadow-sm"
          onPress={handleLogin}
          disabled={loading}
          activeOpacity={0.85}
        >
          {loading ? (
            <ActivityIndicator color={Colors.white} size="small" />
          ) : (
            <Text className="font-manrope-bold text-sm text-white">Sign In as Administrator</Text>
          )}
        </TouchableOpacity>

        {/* Quick Demo Credentials */}
        <View className="mt-8 p-3.5 rounded-xl bg-palePeach/70 border border-[#f2ded3]">
          <Text className="font-manrope-bold text-[11px] text-primary uppercase tracking-wider mb-2">
            Quick Test Credentials (Fastify API)
          </Text>
          <View className="flex-row gap-2">
            <TouchableOpacity
              className="flex-1 py-1.5 px-2 rounded-lg bg-white border border-primaryLight items-center"
              onPress={() => handleFillDemo('admin@vidya.edu.in', 'AdminDemo1!')}
              activeOpacity={0.7}
            >
              <Text className="font-manrope-semibold text-[11px] text-textPrimary">admin@vidya.edu.in</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="flex-1 py-1.5 px-2 rounded-lg bg-white border border-primaryLight items-center"
              onPress={() => handleFillDemo('admin@example.com', 'AdminDemo1!')}
              activeOpacity={0.7}
            >
              <Text className="font-manrope-semibold text-[11px] text-textPrimary">admin@example.com</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Register Footer */}
        <View className="flex-row items-center justify-center mt-8 gap-1.5">
          <Text className="font-manrope-medium text-xs text-textSecondary">
            New administrator?
          </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Register')} activeOpacity={0.7}>
            <Text className="font-manrope-bold text-xs text-primary">Create an account</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};
