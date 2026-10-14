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

export const RegisterScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const { register } = useAdminAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [department, setDepartment] = useState('Academic Director · AP SCERT Division');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !password) {
      setErrorMessage('Please fill in all required fields.');
      return;
    }
    if (password.length < 8) {
      setErrorMessage('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    setErrorMessage(null);
    setLoading(true);

    try {
      const res = await register({
        name: name.trim(),
        email: email.trim(),
        password,
        department: department.trim(),
      });
      navigation.navigate('VerifyOtp', { email: email.trim() });
    } catch (err: any) {
      setErrorMessage(err?.message || 'Registration failed. Please try again.');
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
        {/* Top Header with Back Button */}
        <View className="flex-row items-center justify-between mt-2 mb-6">
          <TouchableOpacity
            className="w-10 h-10 rounded-full border border-border items-center justify-center bg-white"
            onPress={() => navigation.goBack()}
            activeOpacity={0.8}
          >
            <MaterialIcons name="arrow-back" size={20} color={Colors.textPrimary} />
          </TouchableOpacity>
          <View className="flex-row items-center gap-2">
            <View
              className="w-8 h-8 rounded-lg bg-palePeach border border-[#f2ded3] items-center justify-center shadow-xs overflow-hidden"
              style={{ width: 32, height: 32 }}
            >
              <Image
                source={require('../../../assets/app-images/logo.png')}
                className="w-5 h-5"
                style={{ width: 20, height: 20 }}
                resizeMode="contain"
              />
            </View>
            <Text className="font-manrope-extrabold text-base text-textPrimary">Vidya Admin</Text>
          </View>
          <View style={{ width: 40 }} />
        </View>

        {/* Title */}
        <View className="mb-6">
          <Text className="font-manrope-bold text-2xl text-textPrimary">Create Account</Text>
          <Text className="font-manrope-medium text-xs text-textSecondary mt-1 leading-relaxed">
            Register as a curriculum coordinator or school administrator.
          </Text>
        </View>

        {/* Error Alert */}
        {errorMessage && (
          <View className="mb-4 p-3.5 rounded-xl bg-red-50 border border-red-200 flex-row items-center gap-2.5">
            <MaterialIcons name="error-outline" size={20} color="#DC2626" />
            <Text className="font-manrope-medium text-xs text-red-700 flex-1">{errorMessage}</Text>
          </View>
        )}

        {/* Name Field */}
        <View className="mb-4">
          <Text className="font-manrope-semibold text-xs text-textPrimary mb-1.5">Full Name *</Text>
          <View className="flex-row items-center h-12 px-3.5 rounded-xl border border-border bg-inputBg">
            <MaterialIcons name="person-outline" size={20} color={Colors.textSecondary} />
            <TextInput
              className="flex-1 ml-2.5 font-manrope-medium text-sm text-textPrimary"
              placeholder="e.g. Dr. Ramesh Sharma"
              placeholderTextColor={Colors.textMuted}
              value={name}
              onChangeText={setName}
            />
          </View>
        </View>

        {/* Email Field */}
        <View className="mb-4">
          <Text className="font-manrope-semibold text-xs text-textPrimary mb-1.5">Official Email *</Text>
          <View className="flex-row items-center h-12 px-3.5 rounded-xl border border-border bg-inputBg">
            <MaterialIcons name="mail-outline" size={20} color={Colors.textSecondary} />
            <TextInput
              className="flex-1 ml-2.5 font-manrope-medium text-sm text-textPrimary"
              placeholder="admin@school.edu.in"
              placeholderTextColor={Colors.textMuted}
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
          </View>
        </View>

        {/* Department Field */}
        <View className="mb-4">
          <Text className="font-manrope-semibold text-xs text-textPrimary mb-1.5">Department / Role</Text>
          <View className="flex-row items-center h-12 px-3.5 rounded-xl border border-border bg-inputBg">
            <MaterialIcons name="domain" size={20} color={Colors.textSecondary} />
            <TextInput
              className="flex-1 ml-2.5 font-manrope-medium text-sm text-textPrimary"
              placeholder="e.g. Academic Director · AP SCERT Division"
              placeholderTextColor={Colors.textMuted}
              value={department}
              onChangeText={setDepartment}
            />
          </View>
        </View>

        {/* Password Field */}
        <View className="mb-4">
          <Text className="font-manrope-semibold text-xs text-textPrimary mb-1.5">Password (Min 8 chars) *</Text>
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

        {/* Confirm Password Field */}
        <View className="mb-6">
          <Text className="font-manrope-semibold text-xs text-textPrimary mb-1.5">Confirm Password *</Text>
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

        {/* Register Button */}
        <TouchableOpacity
          className="h-12 rounded-xl bg-primary items-center justify-center shadow-sm"
          onPress={handleRegister}
          disabled={loading}
          activeOpacity={0.85}
        >
          {loading ? (
            <ActivityIndicator color={Colors.white} size="small" />
          ) : (
            <Text className="font-manrope-bold text-sm text-white">Create Admin Account</Text>
          )}
        </TouchableOpacity>

        {/* Sign In Link */}
        <View className="flex-row items-center justify-center mt-6 gap-1.5">
          <Text className="font-manrope-medium text-xs text-textSecondary">
            Already have an account?
          </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')} activeOpacity={0.7}>
            <Text className="font-manrope-bold text-xs text-primary">Sign In</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};
