import React, { useState, useRef } from 'react';
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
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '../constants/colors';
import { useAuth } from '../hooks/useAuth';

export const LoginScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { login } = useAuth();
  const passwordInputRef = useRef<React.ElementRef<typeof TextInput>>(null);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [forgotPasswordNotice, setForgotPasswordNotice] = useState<string | null>(null);

  const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const validateForm = (): boolean => {
    let isValid = true;
    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      setEmailError('Student email address is required.');
      isValid = false;
    } else if (!EMAIL_REGEX.test(trimmedEmail)) {
      setEmailError('Please enter a valid email address (e.g. student@school.gov.in).');
      isValid = false;
    } else {
      setEmailError(null);
    }

    if (!password) {
      setPasswordError('Password is required.');
      isValid = false;
    } else if (password.length < 4) {
      setPasswordError('Password must be at least 4 characters.');
      isValid = false;
    } else {
      setPasswordError(null);
    }

    return isValid;
  };

  const handleLogin = async () => {
    if (loading) return;

    if (!validateForm()) {
      setErrorMessage('Please enter a valid student email address and password.');
      return;
    }

    const trimmedEmail = email.trim();
    setErrorMessage(null);
    setEmailError(null);
    setPasswordError(null);
    setForgotPasswordNotice(null);
    setLoading(true);

    try {
      await login(trimmedEmail, password);
    } catch (err: unknown) {
      const msg =
        err instanceof Error && err.message
          ? err.message
          : 'Invalid email or password';
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    const copy = 'Please contact the administrator to reset your password.';
    setForgotPasswordNotice(copy);
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
        <View className="items-center mt-6 mb-7">
          <View
            className="w-14 h-14 rounded-2xl bg-palePeach border border-[#f2ded3] items-center justify-center shadow-sm overflow-hidden mb-3"
            style={{ width: 56, height: 56 }}
          >
            <Image
              source={require('../../assets/app-images/logo.png')}
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
              Student Portal · AP SCERT
            </Text>
          </View>
        </View>

        {/* Title */}
        <View className="mb-5">
          <Text className="font-manrope-bold text-xl text-textPrimary">Sign In</Text>
          <Text className="font-manrope-medium text-xs text-textSecondary mt-1 leading-relaxed">
            Enter your student credentials to access your textbook lessons.
          </Text>
        </View>

        {/* Error Alert */}
        {errorMessage && (
          <View className="mb-4 p-3.5 rounded-xl bg-red-50 border border-red-200 flex-row items-center gap-2.5">
            <MaterialIcons name="error-outline" size={20} color="#DC2626" />
            <Text className="font-manrope-medium text-xs text-red-700 flex-1">{errorMessage}</Text>
          </View>
        )}

        {/* Forgot Password Notice Alert */}
        {forgotPasswordNotice && (
          <View className="mb-4 p-3.5 rounded-xl bg-amber-50 border border-amber-200 flex-row items-center gap-2.5">
            <MaterialIcons name="info-outline" size={20} color="#D97706" />
            <Text className="font-manrope-medium text-xs text-amber-800 flex-1">
              {forgotPasswordNotice}
            </Text>
          </View>
        )}

        {/* Email Field */}
        <View className="mb-4">
          <View className="flex-row items-center justify-between mb-1.5">
            <Text className="font-manrope-semibold text-xs text-textPrimary">Student Email</Text>
            {emailError && (
              <Text className="font-manrope-bold text-[11px] text-red-600">{emailError}</Text>
            )}
          </View>
          <View
            className={`flex-row items-center h-12 px-3.5 rounded-xl border bg-[#F9FAFB] ${
              emailError ? 'border-red-500 bg-red-50/20' : 'border-border'
            }`}
          >
            <MaterialIcons
              name="mail-outline"
              size={20}
              color={emailError ? '#DC2626' : Colors.textSecondary}
            />
            <TextInput
              className="flex-1 ml-2.5 font-manrope-medium text-sm text-textPrimary"
              placeholder="Enter your email (e.g. student@school.gov.in)"
              placeholderTextColor={Colors.textMuted}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="next"
              onSubmitEditing={() => passwordInputRef.current?.focus()}
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                if (emailError) setEmailError(null);
                if (errorMessage) setErrorMessage(null);
              }}
            />
          </View>
        </View>

        {/* Password Field */}
        <View className="mb-2">
          <View className="flex-row items-center justify-between mb-1.5">
            <Text className="font-manrope-semibold text-xs text-textPrimary">Password</Text>
            {passwordError && (
              <Text className="font-manrope-bold text-[11px] text-red-600">{passwordError}</Text>
            )}
          </View>
          <View
            className={`flex-row items-center h-12 px-3.5 rounded-xl border bg-[#F9FAFB] ${
              passwordError ? 'border-red-500 bg-red-50/20' : 'border-border'
            }`}
          >
            <MaterialIcons
              name="lock-outline"
              size={20}
              color={passwordError ? '#DC2626' : Colors.textSecondary}
            />
            <TextInput
              ref={passwordInputRef}
              className="flex-1 ml-2.5 font-manrope-medium text-sm text-textPrimary"
              placeholder="••••••••"
              placeholderTextColor={Colors.textMuted}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              returnKeyType="go"
              onSubmitEditing={handleLogin}
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                if (passwordError) setPasswordError(null);
                if (errorMessage) setErrorMessage(null);
              }}
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <MaterialIcons
                name={showPassword ? 'visibility-off' : 'visibility'}
                size={20}
                color={passwordError ? '#DC2626' : Colors.textSecondary}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Forgot Password Link */}
        <View className="items-end mb-6">
          <TouchableOpacity onPress={handleForgotPassword} activeOpacity={0.7}>
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
            <Text className="font-manrope-bold text-sm text-white">Sign In as Student</Text>
          )}
        </TouchableOpacity>

        {/* Account Provisioning Footer Note */}
        <View className="mt-8 p-3 rounded-xl bg-slate-50 border border-slate-200">
          <Text className="font-manrope-medium text-[11px] text-textSecondary text-center leading-4">
            Student accounts are issued by the school administration. To reset your password, please contact the administrator.
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

