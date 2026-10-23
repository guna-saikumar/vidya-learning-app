import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Image,
  Switch,
  Alert,
  Modal,
  Linking,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MaterialIcons } from '@expo/vector-icons';
import Colors from '../constants/colors';
import { HeaderBar, BottomNav } from '../components/navigation';
import { PageIntro, HoverCard } from '../components/common';
import { useLearningProgress } from '../hooks/useLearningProgress';
import { useAuth } from '../hooks/useAuth';
import { getClasses } from '../services/curriculumService';
import { RootStackParamList } from '../types/navigation';
import { useAppDispatch } from '../store';
import { uploadAvatarThunk, removeAvatarThunk } from '../store/slices/studentSlice';

type Props = NativeStackScreenProps<RootStackParamList, 'Profile'>;

const MEDIA_COPY = {
  camera: {
    title: 'Camera access needed',
    message: 'Allow camera access to take a profile photo.',
  },
  library: {
    title: 'Photo access needed',
    message: 'Allow photo library access to choose a profile photo.',
  },
} as const;

/** Requests camera / photo library permission; offers Settings when it was permanently denied. */
const ensureMediaPermission = async (kind: keyof typeof MEDIA_COPY): Promise<boolean> => {
  const get =
    kind === 'camera'
      ? ImagePicker.getCameraPermissionsAsync
      : ImagePicker.getMediaLibraryPermissionsAsync;
  const request =
    kind === 'camera'
      ? ImagePicker.requestCameraPermissionsAsync
      : ImagePicker.requestMediaLibraryPermissionsAsync;

  let perm = await get();
  if (!perm.granted && perm.canAskAgain) perm = await request();
  if (perm.granted) return true;

  const { title, message } = MEDIA_COPY[kind];
  Alert.alert(
    title,
    message,
    perm.canAskAgain
      ? [{ text: 'OK' }]
      : [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Open Settings', onPress: () => Linking.openSettings() },
        ]
  );
  return false;
};

export const ProfileScreen: React.FC<Props> = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const { user, logout } = useAuth();
  const { profile, bookmarks, progressMap, saveProfile } = useLearningProgress();
  const [offlineSync, setOfflineSync] = useState(true);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const classes = getClasses();

  const completedCount = Object.values(progressMap).filter((p) => p.completed).length;
  const activeClass = classes.find((c) => c.id === profile?.activeClassId);

  const pickImageFromDevice = async () => {
    try {
      if (!(await ensureMediaPermission('library'))) return;

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.85,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setShowAvatarModal(false);
        const selectedUri = result.assets[0].uri;
        await saveProfile({ avatarUrl: selectedUri });
        dispatch(uploadAvatarThunk(selectedUri));
        Alert.alert('Profile Photo Updated', 'Your profile picture has been updated from your device.');
      }
    } catch (err) {
      console.error('Error picking image from device:', err);
      Alert.alert('Error', 'Could not open photo library. Please try again.');
    }
  };

  const takePhotoWithCamera = async () => {
    try {
      if (!(await ensureMediaPermission('camera'))) return;

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.85,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setShowAvatarModal(false);
        const selectedUri = result.assets[0].uri;
        await saveProfile({ avatarUrl: selectedUri });
        dispatch(uploadAvatarThunk(selectedUri));
        Alert.alert('Profile Photo Updated', 'Your new photo has been saved as your profile picture.');
      }
    } catch (err) {
      console.error('Error taking photo with camera:', err);
      Alert.alert('Error', 'Could not open camera. Please try again.');
    }
  };

  const handleResetToDefault = async () => {
    try {
      setShowAvatarModal(false);
      await saveProfile({ avatarUrl: '' });
      dispatch(removeAvatarThunk());
      Alert.alert('Default Restored', 'Profile picture reset to default student icon.');
    } catch {
      Alert.alert('Error', 'Failed to reset profile picture.');
    }
  };

  return (
    <View className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <HeaderBar
        title="Profile"
        subtitle="Student preferences and study statistics."
      />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 22, paddingTop: 18, paddingBottom: 48, gap: 24 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Page Heading & Subheading */}
        <PageIntro
          eyebrow="STUDENT ACCOUNT"
          badge={activeClass ? `${activeClass.title} Enrolled` : 'Class not set'}
          title="Student Profile & Settings"
        />

        {/* Profile Card matching Figma Make .profile-card */}
        <HoverCard className="bg-palePeach rounded-[22px] p-[22px] gap-3.5 border border-[#f2ded3] shadow-sm" lift={-3}>
          <View className="flex-row items-center gap-4">
            <View className="relative">
              <TouchableOpacity
                onPress={() => setShowAvatarModal(true)}
                activeOpacity={0.85}
                accessibilityRole="button"
                accessibilityLabel="Edit profile picture"
                className="relative"
              >
                <Image
                  source={
                    profile?.avatarUrl
                      ? { uri: profile.avatarUrl }
                      : require('../../assets/app-images/avatar.png')
                  }
                  className="w-[66px] h-[66px] rounded-full border-2 border-white shadow-sm"
                  style={{ width: 66, height: 66, borderRadius: 33 }}
                />
                <View
                  className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-primary items-center justify-center border-2 border-white shadow-md"
                  style={{ backgroundColor: Colors.primary }}
                >
                  <MaterialIcons name="camera-alt" size={14} color="#ffffff" />
                </View>
              </TouchableOpacity>
            </View>

            <View className="flex-1 gap-1">
              <View className="flex-row items-center justify-between">
                <Text className="font-manrope-extrabold text-lg text-textPrimary">
                  {profile?.firstName && profile?.lastName
                    ? `${profile.firstName} ${profile.lastName}`
                    : (profile?.displayName || user?.name || 'Student')}
                </Text>
                <View className="bg-primary px-2.5 py-0.5 rounded-full">
                  <Text className="font-manrope-bold text-[10px] text-white">
                    Roll #{profile?.rollNumber || '—'}
                  </Text>
                </View>
              </View>
              <Text className="font-manrope-medium text-xs text-textSecondary" numberOfLines={1}>
                {profile?.schoolName || 'School not set'}
              </Text>
              <Text className="font-manrope-bold text-xs text-primaryDark mt-0.5">
                {activeClass?.title || 'Class not set'} · Section {profile?.section || '—'} · {profile?.medium || '—'}
              </Text>
            </View>
          </View>
        </HoverCard>

        {/* Student Personal Details Card */}
        <View className="gap-2.5">
          <View className="flex-row items-center justify-between">
            <Text className="font-manrope-extrabold text-lg text-textPrimary tracking-tight">
              Student Details
            </Text>
            <TouchableOpacity
              className="flex-row items-center gap-1 bg-palePeach px-3 py-1.5 rounded-full border border-border"
              onPress={() => navigation.navigate('StudentOnboarding', { isEdit: true })}
              activeOpacity={0.8}
            >
              <MaterialIcons name="edit" size={14} color={Colors.primary} />
              <Text className="font-manrope-bold text-xs text-primary">Edit Profile</Text>
            </TouchableOpacity>
          </View>

          <View className="bg-white rounded-[22px] p-5 border border-border shadow-sm gap-3.5">
            <View className="flex-row items-center justify-between pb-3 border-b border-border">
              <View className="flex-row items-center gap-2.5">
                <MaterialIcons name="person" size={18} color={Colors.primary} />
                <Text className="font-manrope-medium text-xs text-textSecondary">Student Name</Text>
              </View>
              <Text className="font-manrope-bold text-xs text-textPrimary">
                {profile?.firstName && profile?.lastName ? `${profile.firstName} ${profile.lastName}` : (profile?.displayName || 'Student')}
              </Text>
            </View>

            <View className="flex-row items-center justify-between pb-3 border-b border-border">
              <View className="flex-row items-center gap-2.5">
                <MaterialIcons name="cake" size={18} color={Colors.primary} />
                <Text className="font-manrope-medium text-xs text-textSecondary">Date of Birth</Text>
              </View>
              <Text className="font-manrope-bold text-xs text-textPrimary">
                {profile?.dateOfBirth || '—'}
              </Text>
            </View>

            <View className="flex-row items-center justify-between pb-3 border-b border-border">
              <View className="flex-row items-center gap-2.5">
                <MaterialIcons name="people-outline" size={18} color={Colors.primary} />
                <Text className="font-manrope-medium text-xs text-textSecondary">Gender</Text>
              </View>
              <Text className="font-manrope-bold text-xs text-textPrimary">
                {profile?.gender || '—'}
              </Text>
            </View>

            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-2.5">
                <MaterialIcons name="badge" size={18} color={Colors.primary} />
                <Text className="font-manrope-medium text-xs text-textSecondary">Roll Number</Text>
              </View>
              <Text className="font-manrope-bold text-xs text-textPrimary">
                #{profile?.rollNumber || '—'}
              </Text>
            </View>
          </View>
        </View>

        {/* Academic Details Card (Collected from Student Form) */}
        <View className="gap-2.5">
          <Text className="font-manrope-extrabold text-lg text-textPrimary tracking-tight">
            Academic Information
          </Text>

          <View className="bg-white rounded-[22px] p-5 border border-border shadow-sm gap-3.5">
            <View className="flex-row items-center justify-between pb-3 border-b border-border">
              <View className="flex-row items-center gap-2.5">
                <MaterialIcons name="school" size={18} color={Colors.primary} />
                <Text className="font-manrope-medium text-xs text-textSecondary">School</Text>
              </View>
              <Text className="font-manrope-bold text-xs text-textPrimary text-right flex-1 ml-3" numberOfLines={1}>
                {profile?.schoolName || '—'}
              </Text>
            </View>

            <View className="flex-row items-center justify-between pb-3 border-b border-border">
              <View className="flex-row items-center gap-2.5">
                <MaterialIcons name="location-on" size={18} color={Colors.primary} />
                <Text className="font-manrope-medium text-xs text-textSecondary">Location & District</Text>
              </View>
              <Text className="font-manrope-bold text-xs text-textPrimary text-right flex-1 ml-3" numberOfLines={1}>
                {[profile?.location, profile?.district].filter(Boolean).join(', ') || '—'}
              </Text>
            </View>

            <View className="flex-row items-center justify-between pb-3 border-b border-border">
              <View className="flex-row items-center gap-2.5">
                <MaterialIcons name="class" size={18} color={Colors.primary} />
                <Text className="font-manrope-medium text-xs text-textSecondary">Class & Section</Text>
              </View>
              <Text className="font-manrope-bold text-xs text-primaryDark">
                {activeClass?.title || '—'} — Section {profile?.section || '—'}
              </Text>
            </View>

            <View className="flex-row items-center justify-between pb-3 border-b border-border">
              <View className="flex-row items-center gap-2.5">
                <MaterialIcons name="translate" size={18} color={Colors.primary} />
                <Text className="font-manrope-medium text-xs text-textSecondary">Medium</Text>
              </View>
              <Text className="font-manrope-bold text-xs text-textPrimary">
                {profile?.medium || '—'}
              </Text>
            </View>

            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-2.5">
                <MaterialIcons name="event" size={18} color={Colors.primary} />
                <Text className="font-manrope-medium text-xs text-textSecondary">Academic Session</Text>
              </View>
              <Text className="font-manrope-bold text-xs text-textPrimary">
                {profile?.academicYear || '—'} (AP SCERT)
              </Text>
            </View>
          </View>
        </View>

        {/* Parent & Contact Details Card */}
        <View className="gap-2.5">
          <Text className="font-manrope-extrabold text-lg text-textPrimary tracking-tight">
            Parents & Contact Details
          </Text>

          <View className="bg-white rounded-[22px] p-5 border border-border shadow-sm gap-3.5">
            <View className="flex-row items-center justify-between pb-3 border-b border-border">
              <View className="flex-row items-center gap-2.5">
                <MaterialIcons name="person-outline" size={18} color={Colors.primary} />
                <Text className="font-manrope-medium text-xs text-textSecondary">Father&apos;s Name</Text>
              </View>
              <Text className="font-manrope-bold text-xs text-textPrimary">
                {profile?.fatherName || profile?.guardianName || '—'}
              </Text>
            </View>

            <View className="flex-row items-center justify-between pb-3 border-b border-border">
              <View className="flex-row items-center gap-2.5">
                <MaterialIcons name="face" size={18} color={Colors.primary} />
                <Text className="font-manrope-medium text-xs text-textSecondary">Mother&apos;s Name</Text>
              </View>
              <Text className="font-manrope-bold text-xs text-textPrimary">
                {profile?.motherName || '—'}
              </Text>
            </View>

            <View className="flex-row items-center justify-between pb-3 border-b border-border">
              <View className="flex-row items-center gap-2.5">
                <MaterialIcons name="phone" size={18} color={Colors.primary} />
                <Text className="font-manrope-medium text-xs text-textSecondary">Parent Contact Mobile</Text>
              </View>
              <Text className="font-manrope-bold text-xs text-textPrimary">
                {profile?.parentPhone || profile?.guardianPhone || '—'}
              </Text>
            </View>

            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-2.5">
                <MaterialIcons name="mail-outline" size={18} color={Colors.primary} />
                <Text className="font-manrope-medium text-xs text-textSecondary">Login Email</Text>
              </View>
              <Text className="font-manrope-bold text-xs text-textPrimary">
                {user?.email || '—'}
              </Text>
            </View>
          </View>
        </View>

        {/* Profile Statistics */}
        <View className="gap-2">
          <Text className="font-manrope-extrabold text-lg text-textPrimary tracking-tight">Achievements</Text>
          <View className="flex-row gap-2.5 mt-1">
            <View className="flex-1 py-3.5 px-2 border border-border rounded-2xl bg-white items-center shadow-sm">
              <View className="w-[34px] h-[34px] rounded-[10px] bg-palePeach items-center justify-center mb-2">
                <MaterialIcons name="bookmark" size={20} color={Colors.primary} />
              </View>
              <Text className="font-manrope-extrabold text-lg text-textPrimary">{bookmarks.length}</Text>
              <Text className="font-manrope-semibold text-[11px] text-textSecondary mt-0.5">Bookmarks</Text>
            </View>

            <View className="flex-1 py-3.5 px-2 border border-border rounded-2xl bg-white items-center shadow-sm">
              <View className="w-[34px] h-[34px] rounded-[10px] bg-palePeach items-center justify-center mb-2">
                <MaterialIcons name="check" size={20} color={Colors.primary} />
              </View>
              <Text className="font-manrope-extrabold text-lg text-textPrimary">{completedCount}</Text>
              <Text className="font-manrope-semibold text-[11px] text-textSecondary mt-0.5">Completed</Text>
            </View>
          </View>
        </View>

        {/* Settings Group */}
        <View className="gap-2">
          <Text className="font-manrope-extrabold text-lg text-textPrimary tracking-tight">Study Settings</Text>

          <View className="bg-white rounded-2xl border border-border overflow-hidden shadow-sm">
            {/* Language Preference */}
            <View className="flex-row items-center justify-between p-4 border-b border-border">
              <View className="flex-row items-center gap-3 flex-1">
                <MaterialIcons name="translate" size={20} color={Colors.primary} />
                <View>
                  <Text className="font-manrope-bold text-[13px] text-textPrimary">Study Medium / Language</Text>
                  <Text className="font-manrope-medium text-[11px] text-textSecondary mt-0.5">Primary instruction language</Text>
                </View>
              </View>
              <View className="flex-row gap-1 bg-[#F5F2EF] p-1 rounded-xl">
                <TouchableOpacity
                  className="px-2.5 py-1 rounded-lg bg-primary"
                  activeOpacity={0.8}
                >
                  <Text className="font-manrope-bold text-[11px] text-white">English</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className="px-2.5 py-1 rounded-lg"
                  activeOpacity={0.8}
                  onPress={() => Alert.alert('Telugu Medium', 'Telugu medium textbooks & bilingual summaries are enabled.')}
                >
                  <Text className="font-manrope-medium text-[11px] text-textSecondary">తెలుగు</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Daily Study Goal */}
            <View className="p-4 border-b border-border">
              <View className="flex-row items-center gap-3 mb-2.5">
                <MaterialIcons name="timer" size={20} color={Colors.primary} />
                <View>
                  <Text className="font-manrope-bold text-[13px] text-textPrimary">Daily Study Goal</Text>
                  <Text className="font-manrope-medium text-[11px] text-textSecondary mt-0.5">Target daily learning time</Text>
                </View>
              </View>
              <View className="flex-row gap-2 mt-1">
                {['30 mins', '45 mins', '60 mins'].map((goal, idx) => {
                  const isSelected = idx === 1; // 45 mins default
                  return (
                    <TouchableOpacity
                      key={goal}
                      className={`flex-1 py-2 rounded-xl items-center border ${
                        isSelected ? 'bg-primary border-primary' : 'bg-white border-border'
                      }`}
                      activeOpacity={0.8}
                      onPress={() => Alert.alert('Study Goal', `Daily study goal set to ${goal}`)}
                    >
                      <Text
                        className={`font-manrope-bold text-[11px] ${
                          isSelected ? 'text-white' : 'text-textSecondary'
                        }`}
                      >
                        {goal}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Offline Content Cache */}
            <View className="flex-row items-center justify-between p-4">
              <View className="flex-row items-center gap-3 flex-1">
                <MaterialIcons name="offline-pin" size={20} color={Colors.primary} />
                <View>
                  <Text className="font-manrope-bold text-[13px] text-textPrimary">Offline Content Cache</Text>
                  <Text className="font-manrope-medium text-[11px] text-textSecondary mt-0.5">Cached curriculum for offline reading</Text>
                </View>
              </View>
              <Switch
                value={offlineSync}
                onValueChange={setOfflineSync}
                trackColor={{ false: Colors.border, true: Colors.primaryLight }}
                thumbColor={offlineSync ? Colors.primary : Colors.white}
              />
            </View>
          </View>
        </View>

        {/* Account Actions / Sign Out */}
        <View className="gap-2">
          <TouchableOpacity
            className="flex-row items-center justify-center p-3.5 rounded-2xl bg-red-50 border border-red-200 gap-2 shadow-xs"
            onPress={() => {
              Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Sign Out',
                  style: 'destructive',
                  onPress: () => logout(),
                },
              ]);
            }}
            activeOpacity={0.8}
          >
            <MaterialIcons name="logout" size={18} color="#DC2626" />
            <Text className="font-manrope-bold text-sm text-red-600">Sign Out</Text>
          </TouchableOpacity>
        </View>

        {/* App Info & Board Compliance */}
        <View className="items-center py-2 gap-1">
          <Text className="font-manrope-bold text-xs text-textSecondary">Vidya Learning App v1.2.0</Text>
          <Text className="font-manrope-medium text-[10px] text-textMuted">
            Aligned with Andhra Pradesh SCERT Curriculum
          </Text>
        </View>
      </ScrollView>

      {/* Device Photo Picker Modal */}
      <Modal
        visible={showAvatarModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAvatarModal(false)}
      >
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-white rounded-t-[32px] p-6 border-t border-border shadow-2xl">
            {/* Modal Header */}
            <View className="flex-row items-center justify-between pb-4 border-b border-border">
              <View>
                <Text className="font-manrope-extrabold text-xl text-textPrimary tracking-tight">
                  Profile Photo
                </Text>
                <Text className="font-manrope-medium text-xs text-textSecondary mt-0.5">
                  Select a photo from your device or camera
                </Text>
              </View>
              <TouchableOpacity
                className="w-9 h-9 rounded-full bg-border/50 items-center justify-center"
                onPress={() => setShowAvatarModal(false)}
              >
                <MaterialIcons name="close" size={20} color={Colors.textPrimary} />
              </TouchableOpacity>
            </View>

            {/* Current Preview */}
            <View className="items-center py-5">
              <View className="relative">
                <Image
                  source={
                    profile?.avatarUrl
                      ? { uri: profile.avatarUrl }
                      : require('../../assets/app-images/avatar.png')
                  }
                  className="w-24 h-24 rounded-full border-4 border-primary/20 shadow-md"
                  style={{ width: 96, height: 96, borderRadius: 48 }}
                />
                <View className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-primary items-center justify-center border-2 border-white">
                  <MaterialIcons name="camera-alt" size={14} color="#ffffff" />
                </View>
              </View>
              <Text className="font-manrope-bold text-sm text-textPrimary mt-3">
                {profile?.firstName && profile?.lastName
                  ? `${profile.firstName} ${profile.lastName}`
                  : profile?.displayName || 'Student'}
              </Text>
              <Text className="font-manrope-medium text-[11px] text-textMuted">
                {profile?.avatarUrl ? 'Custom Device Photo' : 'Default Student Icon'}
              </Text>
            </View>

            {/* Device Source Options */}
            <View className="gap-3 pt-2 pb-6">
              <TouchableOpacity
                className="flex-row items-center p-4 rounded-2xl bg-primary/10 border border-primary/30"
                onPress={pickImageFromDevice}
                activeOpacity={0.8}
              >
                <View className="w-12 h-12 rounded-xl bg-primary items-center justify-center mr-3.5 shadow-sm">
                  <MaterialIcons name="photo-library" size={24} color="#ffffff" />
                </View>
                <View className="flex-1">
                  <Text className="font-manrope-bold text-sm text-textPrimary">
                    Choose from Gallery
                  </Text>
                  <Text className="font-manrope-medium text-xs text-textSecondary mt-0.5">
                    Select a photo from your device storage
                  </Text>
                </View>
                <MaterialIcons name="chevron-right" size={22} color={Colors.textMuted} />
              </TouchableOpacity>

              <TouchableOpacity
                className="flex-row items-center p-4 rounded-2xl bg-gray-50 border border-border"
                onPress={takePhotoWithCamera}
                activeOpacity={0.8}
              >
                <View className="w-12 h-12 rounded-xl bg-primaryDark items-center justify-center mr-3.5 shadow-sm">
                  <MaterialIcons name="photo-camera" size={24} color="#ffffff" />
                </View>
                <View className="flex-1">
                  <Text className="font-manrope-bold text-sm text-textPrimary">
                    Take Photo with Camera
                  </Text>
                  <Text className="font-manrope-medium text-xs text-textSecondary mt-0.5">
                    Capture a new picture using your camera
                  </Text>
                </View>
                <MaterialIcons name="chevron-right" size={22} color={Colors.textMuted} />
              </TouchableOpacity>

              {profile?.avatarUrl ? (
                <TouchableOpacity
                  className="flex-row items-center justify-center py-3 rounded-2xl border border-red-200 bg-red-50/60 mt-1"
                  onPress={handleResetToDefault}
                  activeOpacity={0.8}
                >
                  <MaterialIcons name="delete-outline" size={18} color="#DC2626" />
                  <Text className="font-manrope-bold text-xs text-red-600 ml-1.5">
                    Remove Custom Photo & Use Default
                  </Text>
                </TouchableOpacity>
              ) : null}

              <TouchableOpacity
                className="py-3 rounded-2xl items-center justify-center bg-gray-100 mt-1"
                onPress={() => setShowAvatarModal(false)}
                activeOpacity={0.8}
              >
                <Text className="font-manrope-bold text-xs text-textSecondary">Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <BottomNav activeTab="Profile" navigation={navigation} />
    </View>
  );
};
