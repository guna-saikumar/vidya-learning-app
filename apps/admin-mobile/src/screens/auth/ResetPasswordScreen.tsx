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
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '../../constants/colors';
import { useAdminAuth } from '../../hooks/useAdminAuth';

export const ResetPasswordScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const insets = useSafeAreaInsets();
  const { resetPassword } = useAdminAuth();

  const initialEmail = route.params?.email || '';
  const [email, setEmail] = useState(initialEmail);
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleReset = async () => {
    if (!email.trim() || !otp.trim() || !newPassword) {
      setErrorMessage('Please fill in all required fields.');
      return;
    }
    if (otp.trim().length !== 6) {
      setErrorMessage('Verification code must be 6 digits.');
      return;
    }
    if (newPassword.length < 8) {
      setErrorMessage('New password must be at least 8 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    setErrorMessage(null);
    setLoading(true);

    try {
      const res = await resetPassword({
        email: email.trim(),
        otp: otp.trim(),
        newPassword,
      });
      setSuccessMessage(res.message || 'Password updated successfully! Redirecting to login...');
      setTimeout(() => {
        navigation.navigate('Login');
      }, 1500);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to update password. Code may be expired.');
    } finally {
      setLoading(false);
    }
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
        {/* Top Header */}
        <View className="flex-row items-center mt-2 mb-8">
          <TouchableOpacity
            className="w-10 h-10 rounded-full border border-border items-center justify-center bg-white"
            onPress={() => navigation.navigate('Login')}
            activeOpacity={0.8}
          >
            <MaterialIcons name="arrow-back" size={20} color={Colors.textPrimary} />
          </TouchableOpacity>
        </View>

        {/* Icon & Title */}
        <View className="items-center mb-8">
          <View className="w-16 h-16 rounded-2xl bg-palePeach border border-[#f2ded3] items-center justify-center mb-4">
            <MaterialIcons name="vpn-key" size={32} color={Colors.primary} />
          </View>
          <Text className="font-manrope-bold text-2xl text-textPrimary text-center">
            Set New Password
          </Text>
          <Text className="font-manrope-medium text-xs text-textSecondary text-center mt-2 px-6 leading-relaxed">
            Enter the 6-digit OTP code sent to{' '}
            <Text className="font-manrope-bold text-textPrimary">{email || 'your email'}</Text> along with your new password.
          </Text>
        </View>

        {/* Error Alert */}
        {errorMessage && (
          <View className="mb-4 p-3.5 rounded-xl bg-red-50 border border-red-200 flex-row items-center gap-2.5">
            <MaterialIcons name="error-outline" size={20} color="#DC2626" />
            <Text className="font-manrope-medium text-xs text-red-700 flex-1">{errorMessage}</Text>
          </View>
        )}

        {/* Success Alert */}
        {successMessage && (
          <View className="mb-4 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 flex-row items-center gap-2.5">
            <MaterialIcons name="check-circle" size={20} color="#059669" />
            <Text className="font-manrope-medium text-xs text-emerald-800 flex-1">{successMessage}</Text>
          </View>
        )}

        {/* OTP Input */}
        <View className="mb-4">
          <Text className="font-manrope-semibold text-xs text-textPrimary mb-1.5">6-Digit Reset Code *</Text>
          <View className="flex-row items-center h-12 px-3.5 rounded-xl border border-border bg-inputBg">
            <MaterialIcons name="pin" size={20} color={Colors.textSecondary} />
            <TextInput
              className="flex-1 ml-2.5 font-manrope-bold text-base text-textPrimary tracking-[4px]"
              placeholder="123456"
              placeholderTextColor={Colors.textMuted}
              keyboardType="number-pad"
              maxLength={6}
              value={otp}
              onChangeText={setOtp}
            />
          </View>
        </View>

        {/* New Password */}
        <View className="mb-4">
          <Text className="font-manrope-semibold text-xs text-textPrimary mb-1.5">New Password (Min 8 chars) *</Text>
          <View className="flex-row items-center h-12 px-3.5 rounded-xl border border-border bg-inputBg">
            <MaterialIcons name="lock-outline" size={20} color={Colors.textSecondary} />
            <TextInput
              className="flex-1 ml-2.5 font-manrope-medium text-sm text-textPrimary"
              placeholder="••••••••"
              placeholderTextColor={Colors.textMuted}
              secureTextEntry={!showPassword}
              value={newPassword}
              onChangeText={setNewPassword}
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

        {/* Confirm New Password */}
        <View className="mb-6">
          <Text className="font-manrope-semibold text-xs text-textPrimary mb-1.5">Confirm New Password *</Text>
          <View className="flex-row items-center h-12 px-3.5 rounded-xl border border-border bg-inputBg">
            <MaterialIcons name="lock-outline" size={20} color={Colors.textSecondary} />
            <TextInput
              className="flex-1 ml-2.5 font-manrope-medium text-sm text-textPrimary"
              placeholder="••••••••"
              placeholderTextColor={Colors.textMuted}
              secureTextEntry={!showPassword}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />
          </View>
        </View>

        {/* Reset Button */}
        <TouchableOpacity
          className="h-12 rounded-xl bg-primary items-center justify-center shadow-sm mb-6"
          onPress={handleReset}
          disabled={loading}
          activeOpacity={0.85}
        >
          {loading ? (
            <ActivityIndicator color={Colors.white} size="small" />
          ) : (
            <Text className="font-manrope-bold text-sm text-white">Update Password</Text>
          )}
        </TouchableOpacity>

        {/* Back to Login */}
        <View className="items-center">
          <TouchableOpacity onPress={() => navigation.navigate('Login')} activeOpacity={0.7}>
            <Text className="font-manrope-semibold text-xs text-textSecondary">
              Cancel and return to <Text className="text-primary font-manrope-bold">Sign In</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};
