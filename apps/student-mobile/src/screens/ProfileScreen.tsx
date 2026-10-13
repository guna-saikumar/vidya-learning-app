import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Image,
  Switch,
  Alert,
} from 'react-native';
import { CompositeScreenProps } from '@react-navigation/native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MaterialIcons } from '@expo/vector-icons';
import Colors from '../../../../packages/design-tokens/src/colors';
import { Shadows } from '../../../../packages/design-tokens/src/spacing';
import { HeaderBar } from '../components/HeaderBar';
import { PageIntro } from '../components/PageIntro';
import { HoverCard } from '../components/HoverCard';
import { BottomNav } from '../components/BottomNav';
import { useLearningProgress } from '../hooks/useLearningProgress';
import { getClasses, getBoardInfo } from '../../../../packages/curriculum/src/curriculum.service';
import { MainTabParamList, RootStackParamList } from '../types/navigation';

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'Profile'>,
  NativeStackScreenProps<RootStackParamList>
>;

export const ProfileScreen: React.FC<Props> = ({ navigation }) => {
  const { profile, bookmarks, progressMap, selectActiveGrade } = useLearningProgress();
  const [dailyReminders, setDailyReminders] = useState(true);
  const [offlineSync, setOfflineSync] = useState(true);
  const classes = getClasses();
  const BOARD_INFO = getBoardInfo();

  const completedCount = Object.values(progressMap).filter((p) => p.completed).length;
  const activeClass = classes.find((c) => c.id === profile?.activeClassId) || classes[2];

  const handleGradeChange = (classId: string) => {
    selectActiveGrade(classId);
    Alert.alert('Class Preference Updated', `Active study class set to ${classes.find(c => c.id === classId)?.title}`);
  };

  return (
    <View style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />
      <HeaderBar
        title="Profile"
        subtitle="Student preferences and study statistics."
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Page Heading & Subheading */}
        <PageIntro
          eyebrow="STUDENT ACCOUNT"
          badge={`${activeClass.title} Enrolled`}
          title="Student Profile & Settings"
        />

        {/* Profile Card matching Figma Make .profile-card */}
        <HoverCard style={styles.profileCard} lift={-3}>
          <Image
            source={require('../../assets/app-images/avatar.png')}
            style={styles.avatarLarge as any}
          />
          <View style={styles.profileTextInfo}>
            <Text style={styles.nameText}>
              {profile?.displayName || 'Aarav Sharma'}
            </Text>
            <Text style={styles.enrolledText}>
              Enrolled in {activeClass.title} · AP State Board (2026–27)
            </Text>
          </View>
        </HoverCard>

        {/* Active Class Switcher matching Figma Make .class-selector */}
        <View style={styles.sectionBlock}>
          <Text style={styles.eyebrow}>ACTIVE CLASS</Text>
          <Text style={styles.headingTitle}>Switch enrolled class</Text>
          <View style={styles.classSelectorGrid}>
            {classes.map((c) => {
              const isSelected = c.id === profile?.activeClassId;
              return (
                <TouchableOpacity
                  key={c.id}
                  style={[
                    styles.classSelectorButton,
                    isSelected && styles.classSelectorButtonSelected,
                  ]}
                  onPress={() => handleGradeChange(c.id)}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.classSelectorText,
                      isSelected && styles.classSelectorTextSelected,
                    ]}
                  >
                    Class {c.grade}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Profile Statistics matching Figma Make .profile-stats */}
        <View style={styles.sectionBlock}>
          <Text style={styles.eyebrow}>MILESTONES</Text>
          <Text style={styles.headingTitle}>Learning achievements</Text>
          <View style={styles.profileStatsRow}>
            <View style={styles.statArticle}>
              <View style={styles.statIconBox}>
                <MaterialIcons name="local-fire-department" size={20} color={Colors.primary} />
              </View>
              <Text style={styles.statNumberText}>{profile?.streakDays || 5}</Text>
              <Text style={styles.statLabelText}>Day streak</Text>
            </View>

            <View style={styles.statArticle}>
              <View style={styles.statIconBox}>
                <MaterialIcons name="bookmark" size={20} color={Colors.primary} />
              </View>
              <Text style={styles.statNumberText}>{bookmarks.length}</Text>
              <Text style={styles.statLabelText}>Bookmarks</Text>
            </View>

            <View style={styles.statArticle}>
              <View style={styles.statIconBox}>
                <MaterialIcons name="check" size={20} color={Colors.primary} />
              </View>
              <Text style={styles.statNumberText}>{completedCount}</Text>
              <Text style={styles.statLabelText}>Completed</Text>
            </View>
          </View>
        </View>

        {/* Settings Group */}
        <View style={styles.sectionBlock}>
          <Text style={styles.eyebrow}>PREFERENCES</Text>
          <Text style={styles.headingTitle}>Study settings</Text>

          <View style={styles.settingsGroup}>
            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <MaterialIcons name="notifications-active" size={20} color={Colors.primary} />
                <View>
                  <Text style={styles.settingTitle}>Daily Study Reminders</Text>
                  <Text style={styles.settingSubtitle}>Notification at 6:00 PM</Text>
                </View>
              </View>
              <Switch
                value={dailyReminders}
                onValueChange={setDailyReminders}
                trackColor={{ false: Colors.border, true: Colors.primaryLight }}
                thumbColor={dailyReminders ? Colors.primary : Colors.white}
              />
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <MaterialIcons name="offline-pin" size={20} color={Colors.primary} />
                <View>
                  <Text style={styles.settingTitle}>Offline Content Cache</Text>
                  <Text style={styles.settingSubtitle}>Cached curriculum for offline reading</Text>
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

        {/* Demo Note matching Figma Make .demo-note */}
        <View style={styles.demoNote}>
          <MaterialIcons name="info-outline" size={18} color={Colors.primary} style={{ marginTop: 2 }} />
          <Text style={styles.demoNoteText}>
            Vidya Learn prototype uses local curriculum data for demonstration. All class options, chapters, and topics are ready for backend synchronization.
          </Text>
        </View>
      </ScrollView>
      <BottomNav activeTab="Profile" navigation={navigation} />
    </View>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
    gap: 20,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.palePeach,
    borderRadius: 20,
    padding: 20,
    gap: 16,
  },
  avatarLarge: {
    width: 58,
    height: 58,
    borderRadius: 29,
  },
  profileTextInfo: {
    flex: 1,
    gap: 4,
  },
  nameText: {
    fontFamily: 'Manrope_800ExtraBold',
    fontSize: 18,
    color: Colors.textPrimary,
  },
  enrolledText: {
    fontFamily: 'Manrope_500Medium',
    fontSize: 12,
    color: Colors.textSecondary,
  },
  sectionBlock: {
    gap: 8,
  },
  eyebrow: {
    fontFamily: 'Manrope_800ExtraBold',
    fontSize: 11,
    color: Colors.primary,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  headingTitle: {
    fontFamily: 'Manrope_800ExtraBold',
    fontSize: 18,
    color: Colors.textPrimary,
    letterSpacing: -0.4,
  },
  classSelectorGrid: {
    flexDirection: 'row',
    gap: 7,
    marginTop: 4,
  },
  classSelectorButton: {
    flex: 1,
    minHeight: 48,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  classSelectorButtonSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  classSelectorText: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 11,
    color: Colors.textSecondary,
  },
  classSelectorTextSelected: {
    color: Colors.white,
  },
  profileStatsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  statArticle: {
    flex: 1,
    paddingVertical: 15,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 16,
    backgroundColor: Colors.white,
    alignItems: 'center',
    ...Shadows.subtle,
  },
  statIconBox: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: Colors.palePeach,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statNumberText: {
    fontFamily: 'Manrope_800ExtraBold',
    fontSize: 18,
    color: Colors.textPrimary,
  },
  statLabelText: {
    fontFamily: 'Manrope_600SemiBold',
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  settingsGroup: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
    ...Shadows.subtle,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  settingTitle: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 13,
    color: Colors.textPrimary,
  },
  settingSubtitle: {
    fontFamily: 'Manrope_500Medium',
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  demoNote: {
    flexDirection: 'row',
    gap: 10,
    padding: 16,
    borderRadius: 15,
    backgroundColor: Colors.softWarm,
  },
  demoNoteText: {
    flex: 1,
    fontFamily: 'Manrope_600SemiBold',
    fontSize: 11,
    color: Colors.primary,
    lineHeight: 16,
  },
});
