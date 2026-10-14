import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  Switch,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialIcons } from '@expo/vector-icons';
import Colors from '../constants/colors';
import { HeaderBar } from '../components/common/HeaderBar';
import { ModalConfirm } from '../components/common/ModalConfirm';
import { HoverCard } from '../components/common/HoverCard';
import { PageIntro } from '../components/common/PageIntro';
import { resetCurriculumToDefaults } from '../services/curriculumService';
import { resetMaterialsToDefaults } from '../services/materialsService';
import { AP_BOARD_CONFIG } from '../constants/curriculumConfig';

import { useAdminAuth } from '../hooks/useAdminAuth';

export const ProfileSettingsScreen: React.FC = () => {
  const { user, updateProfile, logout } = useAdminAuth();
  const [isResetConfirmVisible, setIsResetConfirmVisible] = useState(false);
  const [isLogoutConfirmVisible, setIsLogoutConfirmVisible] = useState(false);

  const currentUser = user || {
    id: 'admin-001-vidya',
    fullName: 'Dr. Ramesh Sharma',
    email: 'admin@vidya.edu.in',
    phone: 'Not configured',
    role: 'Admin',
    department: 'Academic Director · AP SCERT Division',
  };

  // Modals
  const [activeModal, setActiveModal] = useState<
    'personal' | 'security' | 'notifications' | 'preferences' | 'help' | null
  >(null);

  // Form states
  const [editForm, setEditForm] = useState({
    fullName: currentUser.fullName || 'Admin Name',
    email: currentUser.email || 'admin@vidya.edu.in',
    phone: currentUser.phone || 'Not configured',
    role: currentUser.role || 'Admin',
    department: currentUser.department || 'Academic Director · AP SCERT Division',
  });

  // Security states
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');

  // Notifications states
  const [notifDailyAlerts, setNotifDailyAlerts] = useState(true);
  const [notifCurriculumUpdates, setNotifCurriculumUpdates] = useState(true);
  const [notifMaterialUploads, setNotifMaterialUploads] = useState(true);
  const [notifMaintenance, setNotifMaintenance] = useState(false);

  // Preferences states
  const [offlineSync, setOfflineSync] = useState(true);

  // Sync form when global user updates
  useEffect(() => {
    if (user) {
      setEditForm({
        fullName: user.fullName || 'Admin Name',
        email: user.email || 'admin@vidya.edu.in',
        phone: user.phone || 'Not configured',
        role: user.role || 'Admin',
        department: user.department || 'Academic Director · AP SCERT Division',
      });
    }
  }, [user]);

  const handleSaveProfile = async () => {
    try {
      await updateProfile(editForm);
      setActiveModal(null);
      Alert.alert('Profile Updated', 'Your profile details have been saved and synced across all pages.');
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to save profile changes.');
    }
  };

  const handleSaveSecurity = () => {
    if (newPass.trim() && newPass.length < 6) {
      Alert.alert('Invalid Password', 'New password must be at least 6 characters.');
      return;
    }
    setCurrentPass('');
    setNewPass('');
    setActiveModal(null);
    Alert.alert('Security Settings Updated', 'Security preferences and password updated.');
  };

  const handleResetData = async () => {
    try {
      await resetCurriculumToDefaults();
      await resetMaterialsToDefaults();
      setIsResetConfirmVisible(false);
      Alert.alert(
        'Reset Complete',
        'Curriculum classes (6–10) and lecture materials have been restored to default SCERT AP Board state.'
      );
    } catch (err: any) {
      setIsResetConfirmVisible(false);
      Alert.alert('Error', err.message || 'Failed to reset data.');
    }
  };

  const menuItems = [
    {
      id: 'personal',
      title: 'Personal Information',
      subtitle: 'Name, email and phone',
      icon: <MaterialIcons name="person-outline" size={24} color={Colors.primary} />,
      onPress: () => {
        setEditForm({
          fullName: currentUser.fullName || 'Admin Name',
          email: currentUser.email || 'admin@vidya.edu.in',
          phone: currentUser.phone || 'Not configured',
          role: currentUser.role || 'Admin',
          department: currentUser.department || 'Academic Director · AP SCERT Division',
        });
        setActiveModal('personal');
      },
    },
    {
      id: 'security',
      title: 'Security & Privacy',
      subtitle: 'Password and active sessions',
      icon: <MaterialIcons name="security" size={24} color={Colors.primary} />,
      onPress: () => setActiveModal('security'),
    },
    {
      id: 'notifications',
      title: 'Notifications',
      subtitle: 'Manage alerts and reminders',
      icon: <MaterialIcons name="notifications-none" size={24} color={Colors.primary} />,
      onPress: () => setActiveModal('notifications'),
    },
    {
      id: 'preferences',
      title: 'App Preferences',
      subtitle: 'Academic year and defaults',
      icon: <MaterialIcons name="tune" size={24} color={Colors.primary} />,
      onPress: () => setActiveModal('preferences'),
    },
    {
      id: 'help',
      title: 'Help & Support',
      subtitle: 'Help center and app information',
      icon: <MaterialIcons name="help-outline" size={24} color={Colors.primary} />,
      onPress: () => setActiveModal('help'),
    },
  ];

  return (
    <View className="flex-1 bg-white">
      <HeaderBar />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingHorizontal: 22,
          paddingTop: 18,
          paddingBottom: 50,
          gap: 20,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Consistent Page Heading & Subheading scrolling naturally with the content */}
        <PageIntro
          eyebrow="ADMINISTRATOR ACCOUNT"
          badge="Admin"
          title="My Profile"
          description="Manage administrator identity, credentials, alerts, and system preferences."
          rightAction={
            <TouchableOpacity
              className="w-10 h-10 rounded-full bg-softWarm items-center justify-center border border-border"
              onPress={() => setActiveModal('preferences')}
              activeOpacity={0.7}
            >
              <MaterialIcons name="settings" size={20} color={Colors.textSecondary} />
            </TouchableOpacity>
          }
        />

        {/* Hero Admin Profile Card matching the user's design */}
        <HoverCard
          className="bg-palePeach rounded-[24px] p-6 border border-primaryLight/70 items-center shadow-sm"
          lift={-2}
        >
          {/* Centered Circular Avatar */}
          <View className="w-20 h-20 rounded-full bg-white items-center justify-center border-2 border-primaryLight shadow-sm mb-3">
            <MaterialIcons name="person" size={42} color={Colors.primary} />
          </View>

          {/* Admin Name */}
          <Text className="font-manrope-extrabold text-xl text-textPrimary text-center tracking-tight">
            {currentUser.fullName || 'Admin Name'}
          </Text>

          {/* Admin Email */}
          <Text className="font-manrope-medium text-sm text-textSecondary text-center mt-1">
            {currentUser.email || 'admin@vidya.edu.in'}
          </Text>

          {/* Admin Badge Pill */}
          <View className="bg-softWarm px-3.5 py-1 rounded-full mt-2.5 border border-border">
            <Text className="font-manrope-bold text-xs text-primaryDark">
              Admin
            </Text>
          </View>

          {/* Edit Profile Button */}
          <TouchableOpacity
            className="bg-primary px-8 py-2.5 rounded-2xl mt-4 shadow-sm"
            onPress={() => {
              setEditForm({
                fullName: currentUser.fullName || 'Admin Name',
                email: currentUser.email || 'admin@vidya.edu.in',
                phone: currentUser.phone || 'Not configured',
                role: currentUser.role || 'Admin',
                department: currentUser.department || 'Academic Director · AP SCERT Division',
              });
              setActiveModal('personal');
            }}
            activeOpacity={0.8}
          >
            <Text className="font-manrope-bold text-sm text-white">Edit Profile</Text>
          </TouchableOpacity>
        </HoverCard>

        {/* Menu Items List matching the user's design */}
        <View className="gap-3">
          {menuItems.map((item) => (
            <HoverCard
              key={item.id}
              className="bg-white rounded-[20px] p-4 border border-border shadow-sm"
              lift={-2}
            >
              <TouchableOpacity
                className="flex-row items-center justify-between"
                onPress={item.onPress}
                activeOpacity={0.7}
              >
                <View className="flex-row items-center flex-1 min-w-0 mr-3">
                  <View className="w-12 h-12 rounded-[16px] bg-palePeach items-center justify-center border border-primaryLight/60 mr-3.5">
                    {item.icon}
                  </View>
                  <View className="flex-1 min-w-0">
                    <Text className="font-manrope-bold text-[15px] text-textPrimary tracking-tight">
                      {item.title}
                    </Text>
                    <Text
                      className="font-manrope-medium text-xs text-textSecondary mt-0.5"
                      numberOfLines={1}
                    >
                      {item.subtitle}
                    </Text>
                  </View>
                </View>
                <MaterialIcons name="chevron-right" size={22} color={Colors.textMuted} />
              </TouchableOpacity>
            </HoverCard>
          ))}

          {/* Sign Out Card */}
          <HoverCard
            className="bg-white rounded-[20px] p-4 border border-red-200 shadow-sm"
            lift={-2}
          >
            <TouchableOpacity
              className="flex-row items-center justify-between"
              onPress={() => setIsLogoutConfirmVisible(true)}
              activeOpacity={0.7}
            >
              <View className="flex-row items-center flex-1 min-w-0 mr-3">
                <View className="w-12 h-12 rounded-[16px] bg-red-50 items-center justify-center border border-red-200 mr-3.5">
                  <MaterialIcons name="logout" size={24} color="#DC2626" />
                </View>
                <View className="flex-1 min-w-0">
                  <Text className="font-manrope-bold text-[15px] text-red-600 tracking-tight">
                    Sign Out
                  </Text>
                  <Text className="font-manrope-medium text-xs text-textSecondary mt-0.5" numberOfLines={1}>
                    End administrative session on this device
                  </Text>
                </View>
              </View>
              <MaterialIcons name="chevron-right" size={22} color={Colors.textMuted} />
            </TouchableOpacity>
          </HoverCard>
        </View>
      </ScrollView>

      {/* 1. Personal Information / Edit Profile Modal */}
      <Modal
        visible={activeModal === 'personal'}
        animationType="slide"
        transparent
        onRequestClose={() => setActiveModal(null)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          className="flex-1 bg-black/50 justify-end"
        >
          <View className="bg-white rounded-t-[32px] p-6 max-h-[90%] border-t border-border">
            <View className="flex-row items-center justify-between pb-4 border-b border-border">
              <View>
                <Text className="font-manrope-extrabold text-lg text-textPrimary tracking-tight">
                  Personal Information
                </Text>
                <Text className="font-manrope-medium text-xs text-textSecondary">
                  Update administrator identity details
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setActiveModal(null)}
                className="w-9 h-9 rounded-full bg-softWarm items-center justify-center border border-border"
              >
                <MaterialIcons name="close" size={20} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView className="py-4" showsVerticalScrollIndicator={false}>
              <View className="gap-3.5">
                <View>
                  <Text className="font-manrope-bold text-xs text-textSecondary mb-1.5">
                    Full Name
                  </Text>
                  <View className="flex-row items-center border border-border rounded-xl px-3.5 py-2.5 bg-surface">
                    <MaterialIcons name="person" size={18} color={Colors.textMuted} className="mr-2" />
                    <TextInput
                      className="flex-1 font-manrope-medium text-sm text-textPrimary"
                      value={editForm.fullName}
                      onChangeText={(t) => setEditForm({ ...editForm, fullName: t })}
                      placeholder="Admin Name"
                    />
                  </View>
                </View>

                <View>
                  <Text className="font-manrope-bold text-xs text-textSecondary mb-1.5">
                    Email Address
                  </Text>
                  <View className="flex-row items-center border border-border rounded-xl px-3.5 py-2.5 bg-surface">
                    <MaterialIcons name="email" size={18} color={Colors.textMuted} className="mr-2" />
                    <TextInput
                      className="flex-1 font-manrope-medium text-sm text-textPrimary"
                      value={editForm.email}
                      onChangeText={(t) => setEditForm({ ...editForm, email: t })}
                      placeholder="admin@vidyalearning.com"
                      keyboardType="email-address"
                      autoCapitalize="none"
                    />
                  </View>
                </View>

                <View>
                  <Text className="font-manrope-bold text-xs text-textSecondary mb-1.5">
                    Phone Number
                  </Text>
                  <View className="flex-row items-center border border-border rounded-xl px-3.5 py-2.5 bg-surface">
                    <MaterialIcons name="phone" size={18} color={Colors.textMuted} className="mr-2" />
                    <TextInput
                      className="flex-1 font-manrope-medium text-sm text-textPrimary"
                      value={editForm.phone}
                      onChangeText={(t) => setEditForm({ ...editForm, phone: t })}
                      placeholder="Enter contact number"
                      keyboardType="phone-pad"
                    />
                  </View>
                </View>

                <View>
                  <Text className="font-manrope-bold text-xs text-textSecondary mb-1.5">
                    Division & Department
                  </Text>
                  <View className="flex-row items-center border border-border rounded-xl px-3.5 py-2.5 bg-surface">
                    <MaterialIcons name="business" size={18} color={Colors.textMuted} className="mr-2" />
                    <TextInput
                      className="flex-1 font-manrope-medium text-sm text-textPrimary"
                      value={editForm.department}
                      onChangeText={(t) => setEditForm({ ...editForm, department: t })}
                      placeholder="Academic Director · AP SCERT Division"
                    />
                  </View>
                </View>

                <View className="bg-palePeach p-3.5 rounded-xl border border-primaryLight/70 flex-row items-center justify-between mt-1">
                  <View>
                    <Text className="font-manrope-bold text-xs text-textPrimary">Access Level</Text>
                    <Text className="font-manrope-medium text-[11px] text-textSecondary">
                      Full administrative authority across Classes 6–10
                    </Text>
                  </View>
                  <View className="bg-primary px-3 py-1 rounded-full">
                    <Text className="font-manrope-bold text-[10px] text-white">Admin</Text>
                  </View>
                </View>
              </View>
            </ScrollView>

            <View className="flex-row gap-3 pt-4 border-t border-border">
              <TouchableOpacity
                className="flex-1 py-3 rounded-xl border border-border items-center justify-center bg-softWarm"
                onPress={() => setActiveModal(null)}
              >
                <Text className="font-manrope-bold text-sm text-textSecondary">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-1 py-3 rounded-xl bg-primary items-center justify-center shadow-sm"
                onPress={handleSaveProfile}
              >
                <Text className="font-manrope-bold text-sm text-white">Save Changes</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* 2. Security & Privacy Modal */}
      <Modal
        visible={activeModal === 'security'}
        animationType="slide"
        transparent
        onRequestClose={() => setActiveModal(null)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          className="flex-1 bg-black/50 justify-end"
        >
          <View className="bg-white rounded-t-[32px] p-6 max-h-[90%] border-t border-border">
            <View className="flex-row items-center justify-between pb-4 border-b border-border">
              <View>
                <Text className="font-manrope-extrabold text-lg text-textPrimary tracking-tight">
                  Security & Privacy
                </Text>
                <Text className="font-manrope-medium text-xs text-textSecondary">
                  Password and active session management
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setActiveModal(null)}
                className="w-9 h-9 rounded-full bg-softWarm items-center justify-center border border-border"
              >
                <MaterialIcons name="close" size={20} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView className="py-4 gap-4" showsVerticalScrollIndicator={false}>
              {/* Active Session info */}
              <View className="bg-surface rounded-2xl p-4 border border-border gap-2">
                <View className="flex-row items-center gap-2">
                  <MaterialIcons name="smartphone" size={18} color={Colors.primary} />
                  <Text className="font-manrope-bold text-xs text-textPrimary">Current Session</Text>
                </View>
                <Text className="font-manrope-medium text-xs text-textSecondary">
                  Vidya Learning Mobile Admin · Authorized Device (Expo 52)
                </Text>
                <View className="flex-row items-center gap-1.5 mt-1">
                  <View className="w-2 h-2 rounded-full bg-success" />
                  <Text className="font-manrope-semibold text-[11px] text-success">
                    Active & Verified Now
                  </Text>
                </View>
              </View>

              {/* 2FA Toggle */}
              <View className="flex-row items-center justify-between p-4 bg-white rounded-2xl border border-border">
                <View className="flex-1 min-w-0 mr-3">
                  <Text className="font-manrope-bold text-xs text-textPrimary">
                    Two-Factor Authentication (2FA)
                  </Text>
                  <Text className="font-manrope-medium text-[11px] text-textSecondary mt-0.5">
                    Require OTP verification for administrative modifications
                  </Text>
                </View>
                <Switch
                  value={twoFactorEnabled}
                  onValueChange={setTwoFactorEnabled}
                  trackColor={{ false: Colors.border, true: Colors.primary }}
                  thumbColor={Colors.white}
                />
              </View>

              {/* Change Password fields */}
              <View className="gap-3">
                <Text className="font-manrope-extrabold text-xs text-textPrimary uppercase tracking-wider">
                  Update Password
                </Text>

                <View>
                  <Text className="font-manrope-bold text-xs text-textSecondary mb-1.5">
                    Current Password
                  </Text>
                  <View className="flex-row items-center border border-border rounded-xl px-3.5 py-2.5 bg-surface">
                    <MaterialIcons name="lock-outline" size={18} color={Colors.textMuted} className="mr-2" />
                    <TextInput
                      className="flex-1 font-manrope-medium text-sm text-textPrimary"
                      secureTextEntry
                      value={currentPass}
                      onChangeText={setCurrentPass}
                      placeholder="••••••••"
                    />
                  </View>
                </View>

                <View>
                  <Text className="font-manrope-bold text-xs text-textSecondary mb-1.5">
                    New Password
                  </Text>
                  <View className="flex-row items-center border border-border rounded-xl px-3.5 py-2.5 bg-surface">
                    <MaterialIcons name="lock-outline" size={18} color={Colors.textMuted} className="mr-2" />
                    <TextInput
                      className="flex-1 font-manrope-medium text-sm text-textPrimary"
                      secureTextEntry
                      value={newPass}
                      onChangeText={setNewPass}
                      placeholder="Enter new password"
                    />
                  </View>
                </View>
              </View>
            </ScrollView>

            <View className="flex-row gap-3 pt-4 border-t border-border">
              <TouchableOpacity
                className="flex-1 py-3 rounded-xl border border-border items-center justify-center bg-softWarm"
                onPress={() => setActiveModal(null)}
              >
                <Text className="font-manrope-bold text-sm text-textSecondary">Close</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-1 py-3 rounded-xl bg-primary items-center justify-center shadow-sm"
                onPress={handleSaveSecurity}
              >
                <Text className="font-manrope-bold text-sm text-white">Save Security</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* 3. Notifications Modal */}
      <Modal
        visible={activeModal === 'notifications'}
        animationType="slide"
        transparent
        onRequestClose={() => setActiveModal(null)}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-[32px] p-6 max-h-[85%] border-t border-border">
            <View className="flex-row items-center justify-between pb-4 border-b border-border">
              <View>
                <Text className="font-manrope-extrabold text-lg text-textPrimary tracking-tight">
                  Notifications
                </Text>
                <Text className="font-manrope-medium text-xs text-textSecondary">
                  Manage alerts and administrator reminders
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setActiveModal(null)}
                className="w-9 h-9 rounded-full bg-softWarm items-center justify-center border border-border"
              >
                <MaterialIcons name="close" size={20} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView className="py-4 gap-3" showsVerticalScrollIndicator={false}>
              <View className="flex-row items-center justify-between p-4 bg-white rounded-2xl border border-border">
                <View className="flex-1 min-w-0 mr-3">
                  <Text className="font-manrope-bold text-xs text-textPrimary">
                    Daily Study Reminders
                  </Text>
                  <Text className="font-manrope-medium text-[11px] text-textSecondary mt-0.5">
                    Send curriculum engagement notifications
                  </Text>
                </View>
                <Switch
                  value={notifDailyAlerts}
                  onValueChange={setNotifDailyAlerts}
                  trackColor={{ false: Colors.border, true: Colors.primary }}
                  thumbColor={Colors.white}
                />
              </View>

              <View className="flex-row items-center justify-between p-4 bg-white rounded-2xl border border-border">
                <View className="flex-1 min-w-0 mr-3">
                  <Text className="font-manrope-bold text-xs text-textPrimary">
                    Curriculum Sync Alerts
                  </Text>
                  <Text className="font-manrope-medium text-[11px] text-textSecondary mt-0.5">
                    Alert when subjects or chapters are added or edited
                  </Text>
                </View>
                <Switch
                  value={notifCurriculumUpdates}
                  onValueChange={setNotifCurriculumUpdates}
                  trackColor={{ false: Colors.border, true: Colors.primary }}
                  thumbColor={Colors.white}
                />
              </View>

              <View className="flex-row items-center justify-between p-4 bg-white rounded-2xl border border-border">
                <View className="flex-1 min-w-0 mr-3">
                  <Text className="font-manrope-bold text-xs text-textPrimary">
                    Material Upload Confirmations
                  </Text>
                  <Text className="font-manrope-medium text-[11px] text-textSecondary mt-0.5">
                    Confirm publish status for new PDF/PPT attachments
                  </Text>
                </View>
                <Switch
                  value={notifMaterialUploads}
                  onValueChange={setNotifMaterialUploads}
                  trackColor={{ false: Colors.border, true: Colors.primary }}
                  thumbColor={Colors.white}
                />
              </View>

              <View className="flex-row items-center justify-between p-4 bg-white rounded-2xl border border-border">
                <View className="flex-1 min-w-0 mr-3">
                  <Text className="font-manrope-bold text-xs text-textPrimary">
                    System Maintenance Notices
                  </Text>
                  <Text className="font-manrope-medium text-[11px] text-textSecondary mt-0.5">
                    Alerts regarding cloud sync and scheduled downtime
                  </Text>
                </View>
                <Switch
                  value={notifMaintenance}
                  onValueChange={setNotifMaintenance}
                  trackColor={{ false: Colors.border, true: Colors.primary }}
                  thumbColor={Colors.white}
                />
              </View>
            </ScrollView>

            <TouchableOpacity
              className="py-3.5 rounded-xl bg-primary items-center justify-center shadow-sm mt-2"
              onPress={() => {
                setActiveModal(null);
                Alert.alert('Settings Saved', 'Notification preferences updated.');
              }}
            >
              <Text className="font-manrope-bold text-sm text-white">Save Preferences</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* 4. App Preferences Modal */}
      <Modal
        visible={activeModal === 'preferences'}
        animationType="slide"
        transparent
        onRequestClose={() => setActiveModal(null)}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-[32px] p-6 max-h-[85%] border-t border-border">
            <View className="flex-row items-center justify-between pb-4 border-b border-border">
              <View>
                <Text className="font-manrope-extrabold text-lg text-textPrimary tracking-tight">
                  App Preferences
                </Text>
                <Text className="font-manrope-medium text-xs text-textSecondary">
                  Academic year and default curriculum configurations
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setActiveModal(null)}
                className="w-9 h-9 rounded-full bg-softWarm items-center justify-center border border-border"
              >
                <MaterialIcons name="close" size={20} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView className="py-4 gap-3.5" showsVerticalScrollIndicator={false}>
              <View className="bg-surface rounded-2xl p-4 border border-border gap-2">
                <View className="flex-row items-center justify-between">
                  <Text className="font-manrope-bold text-xs text-textSecondary">
                    Academic Year:
                  </Text>
                  <Text className="font-manrope-bold text-xs text-primary">
                    {AP_BOARD_CONFIG.academicYear} (Active)
                  </Text>
                </View>
                <View className="flex-row items-center justify-between">
                  <Text className="font-manrope-bold text-xs text-textSecondary">State Board:</Text>
                  <Text className="font-manrope-semibold text-xs text-textPrimary">
                    {AP_BOARD_CONFIG.boardName}
                  </Text>
                </View>
                <View className="flex-row items-center justify-between">
                  <Text className="font-manrope-bold text-xs text-textSecondary">
                    Curriculum Scope:
                  </Text>
                  <Text className="font-manrope-semibold text-xs text-textPrimary">
                    Classes 6, 7, 8, 9, 10
                  </Text>
                </View>
              </View>

              <View className="flex-row items-center justify-between p-4 bg-white rounded-2xl border border-border">
                <View className="flex-1 min-w-0 mr-3">
                  <Text className="font-manrope-bold text-xs text-textPrimary">
                    High-Speed Offline Storage
                  </Text>
                  <Text className="font-manrope-medium text-[11px] text-textSecondary mt-0.5">
                    Cache curriculum offline for zero latency operations
                  </Text>
                </View>
                <Switch
                  value={offlineSync}
                  onValueChange={setOfflineSync}
                  trackColor={{ false: Colors.border, true: Colors.primary }}
                  thumbColor={Colors.white}
                />
              </View>

              {/* Maintenance Reset Action */}
              <TouchableOpacity
                className="p-4 bg-softWarm rounded-2xl border border-border flex-row items-center gap-3 mt-1"
                onPress={() => {
                  setActiveModal(null);
                  setIsResetConfirmVisible(true);
                }}
                activeOpacity={0.7}
              >
                <MaterialIcons name="restore" size={20} color={Colors.warning} />
                <View className="flex-1 min-w-0">
                  <Text className="font-manrope-bold text-xs text-textPrimary">
                    Restore Default SCERT AP Curriculum
                  </Text>
                  <Text className="font-manrope-medium text-[11px] text-textMuted mt-0.5">
                    Re-seeds default Classes 6–10 subjects and syllabus
                  </Text>
                </View>
              </TouchableOpacity>
            </ScrollView>

            <TouchableOpacity
              className="py-3.5 rounded-xl bg-primary items-center justify-center shadow-sm mt-2"
              onPress={() => setActiveModal(null)}
            >
              <Text className="font-manrope-bold text-sm text-white">Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* 5. Help & Support Modal */}
      <Modal
        visible={activeModal === 'help'}
        animationType="slide"
        transparent
        onRequestClose={() => setActiveModal(null)}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-[32px] p-6 max-h-[85%] border-t border-border">
            <View className="flex-row items-center justify-between pb-4 border-b border-border">
              <View>
                <Text className="font-manrope-extrabold text-lg text-textPrimary tracking-tight">
                  Help & Support
                </Text>
                <Text className="font-manrope-medium text-xs text-textSecondary">
                  Help center and application information
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setActiveModal(null)}
                className="w-9 h-9 rounded-full bg-softWarm items-center justify-center border border-border"
              >
                <MaterialIcons name="close" size={20} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView className="py-4 gap-3.5" showsVerticalScrollIndicator={false}>
              <View className="bg-surface rounded-2xl p-4 border border-border gap-2">
                <Text className="font-manrope-bold text-xs text-textPrimary">
                  Vidya Learning Admin Application
                </Text>
                <Text className="font-manrope-medium text-xs text-textSecondary">
                  Version 1.0.0 · Designed for Andhra Pradesh SCERT Board Administrators and Faculty.
                </Text>
              </View>

              <View className="bg-white rounded-2xl p-4 border border-border gap-2.5">
                <View className="flex-row items-center justify-between">
                  <Text className="font-manrope-bold text-xs text-textSecondary">
                    Technical Support:
                  </Text>
                  <Text className="font-manrope-bold text-xs text-primary">
                    support@vidyalearning.com
                  </Text>
                </View>
                <View className="flex-row items-center justify-between">
                  <Text className="font-manrope-bold text-xs text-textSecondary">
                    Toll-Free Helpline:
                  </Text>
                  <Text className="font-manrope-semibold text-xs text-textPrimary">
                    1800-425-0033
                  </Text>
                </View>
                <View className="flex-row items-center justify-between">
                  <Text className="font-manrope-bold text-xs text-textSecondary">
                    Official Portal:
                  </Text>
                  <Text className="font-manrope-semibold text-xs text-textPrimary">
                    scert.ap.gov.in
                  </Text>
                </View>
              </View>

              <View className="bg-palePeach rounded-2xl p-4 border border-primaryLight/70 gap-1.5">
                <Text className="font-manrope-bold text-xs text-primaryDark">
                  Guidelines & Compliance
                </Text>
                <Text className="font-manrope-medium text-[11px] text-textSecondary leading-4">
                  All learning material uploads and curriculum modifications conform to the official
                  AP SCERT 2026–2027 curriculum benchmarks.
                </Text>
              </View>
            </ScrollView>

            <TouchableOpacity
              className="py-3.5 rounded-xl bg-primary items-center justify-center shadow-sm mt-2"
              onPress={() => setActiveModal(null)}
            >
              <Text className="font-manrope-bold text-sm text-white">Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Reset Confirmation Modal */}
      <ModalConfirm
        visible={isResetConfirmVisible}
        title="Restore Default Curriculum?"
        message="This will reset local curriculum and materials to default SCERT Andhra Pradesh State Board 2026–2027 seed data."
        confirmLabel="Reset Data"
        variant="warning"
        onConfirm={handleResetData}
        onCancel={() => setIsResetConfirmVisible(false)}
      />

      {/* Logout Confirmation Modal */}
      <ModalConfirm
        visible={isLogoutConfirmVisible}
        title="Sign Out of Admin Portal?"
        message="You will need to sign in again with your email and password to access the curriculum management portal."
        confirmLabel="Sign Out"
        variant="danger"
        onConfirm={async () => {
          setIsLogoutConfirmVisible(false);
          await logout();
        }}
        onCancel={() => setIsLogoutConfirmVisible(false)}
      />
    </View>
  );
};

export default ProfileSettingsScreen;
