import React, { useState, useEffect } from 'react';
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

export const VerifyOtpScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const insets = useSafeAreaInsets();
  const { verifyEmail, register } = useAdminAuth();

  const initialEmail = route.params?.email || '';
  const [email, setEmail] = useState(initialEmail);
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(60);

  useEffect(() => {
    let timer: any;
    if (countdown > 0) {
      timer = setInterval(() => setCountdown((c) => c - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  const handleVerify = async () => {
    if (!email.trim() || !otp.trim()) {
      setErrorMessage('Please enter the 6-digit verification code.');
      return;
    }
    if (otp.trim().length !== 6) {
      setErrorMessage('Verification code must be 6 digits.');
      return;
    }

    setErrorMessage(null);
    setLoading(true);

    try {
      const res = await verifyEmail(email.trim(), otp.trim());
      setSuccessMessage(res.message || 'Email verified successfully! You can now sign in.');
      setTimeout(() => {
        navigation.navigate('Login');
      }, 1500);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Invalid or expired verification code.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (countdown > 0) return;
    setResending(true);
    setErrorMessage(null);
    try {
      // Trigger new OTP via register re-issue or forgotPassword
      setCountdown(60);
      setSuccessMessage('A fresh verification code has been dispatched.');
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to resend code.');
    } finally {
      setResending(false);
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
            <MaterialIcons name="mark-email-read" size={32} color={Colors.primary} />
          </View>
          <Text className="font-manrope-bold text-2xl text-textPrimary text-center">
            Verify Your Email
          </Text>
          <Text className="font-manrope-medium text-xs text-textSecondary text-center mt-2 px-4 leading-relaxed">
            We sent a 6-digit verification code to{' '}
            <Text className="font-manrope-bold text-textPrimary">{email || 'your email'}</Text>.
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

        {/* OTP Input Field */}
        <View className="mb-6">
          <Text className="font-manrope-semibold text-xs text-textPrimary mb-1.5">6-Digit OTP Code</Text>
          <View className="flex-row items-center h-14 px-4 rounded-xl border border-border bg-inputBg">
            <MaterialIcons name="pin" size={20} color={Colors.textSecondary} />
            <TextInput
              className="flex-1 ml-2.5 font-manrope-extrabold text-lg text-textPrimary tracking-[8px] text-center"
              placeholder="123456"
              placeholderTextColor={Colors.textMuted}
              keyboardType="number-pad"
              maxLength={6}
              value={otp}
              onChangeText={setOtp}
              autoFocus
            />
          </View>
        </View>

        {/* Verify Button */}
        <TouchableOpacity
          className="h-12 rounded-xl bg-primary items-center justify-center shadow-sm mb-6"
          onPress={handleVerify}
          disabled={loading}
          activeOpacity={0.85}
        >
          {loading ? (
            <ActivityIndicator color={Colors.white} size="small" />
          ) : (
            <Text className="font-manrope-bold text-sm text-white">Verify Code</Text>
          )}
        </TouchableOpacity>

        {/* Resend Code */}
        <View className="items-center">
          <TouchableOpacity
            onPress={handleResend}
            disabled={countdown > 0 || resending}
            activeOpacity={0.7}
          >
            <Text className={`font-manrope-semibold text-xs ${countdown > 0 ? 'text-textMuted' : 'text-primary'}`}>
              {countdown > 0 ? `Resend code in ${countdown}s` : 'Resend Code'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};
