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
import { useNavigation } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '../../constants/colors';
import { useAdminAuth } from '../../hooks/useAdminAuth';

export const ForgotPasswordScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const { forgotPassword } = useAdminAuth();

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSendReset = async () => {
    if (!email.trim()) {
      setErrorMessage('Please enter your administrator email address.');
      return;
    }

    setErrorMessage(null);
    setLoading(true);

    try {
      await forgotPassword(email.trim());
      navigation.navigate('ResetPassword', { email: email.trim() });
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to dispatch reset code.');
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
            onPress={() => navigation.goBack()}
            activeOpacity={0.8}
          >
            <MaterialIcons name="arrow-back" size={20} color={Colors.textPrimary} />
          </TouchableOpacity>
        </View>

        {/* Icon & Title */}
        <View className="items-center mb-8">
          <View className="w-16 h-16 rounded-2xl bg-palePeach border border-[#f2ded3] items-center justify-center mb-4">
            <MaterialIcons name="lock-reset" size={32} color={Colors.primary} />
          </View>
          <Text className="font-manrope-bold text-2xl text-textPrimary text-center">
            Forgot Password
          </Text>
          <Text className="font-manrope-medium text-xs text-textSecondary text-center mt-2 px-6 leading-relaxed">
            Enter your official email and we will send a 6-digit OTP code to reset your password.
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
        <View className="mb-6">
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

        {/* Send Button */}
        <TouchableOpacity
          className="h-12 rounded-xl bg-primary items-center justify-center shadow-sm mb-6"
          onPress={handleSendReset}
          disabled={loading}
          activeOpacity={0.85}
        >
          {loading ? (
            <ActivityIndicator color={Colors.white} size="small" />
          ) : (
            <Text className="font-manrope-bold text-sm text-white">Send Reset Code</Text>
          )}
        </TouchableOpacity>

        {/* Back to Login */}
        <View className="items-center">
          <TouchableOpacity onPress={() => navigation.navigate('Login')} activeOpacity={0.7}>
            <Text className="font-manrope-semibold text-xs text-textSecondary">
              Remember password? <Text className="text-primary font-manrope-bold">Sign In</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};
