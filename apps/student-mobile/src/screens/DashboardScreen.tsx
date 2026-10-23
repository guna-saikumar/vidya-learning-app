import React, { useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MaterialIcons } from '@expo/vector-icons';
import Colors from '../constants/colors';
import { HeaderBar, BottomNav } from '../components/navigation';
import { StatCard } from '../components/home';
import { HoverCard, CalloutCard } from '../components/common';
import { getEnrolledClassStats, getChapterById } from '../services/curriculumService';
import { initializeNotificationsIfNeeded } from '../services/notificationService';
import { useLearningProgress } from '../hooks/useLearningProgress';
import { RootStackParamList } from '../types/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export const DashboardScreen: React.FC<Props> = ({ navigation }) => {
  const { profile, bookmarks, progressMap } = useLearningProgress();

  const activeClassId = profile?.activeClassId;
  const enrolledStats = getEnrolledClassStats(activeClassId);
  const activeClass = enrolledStats.schoolClass;

  const enrolledCompletedChaptersCount = Object.values(progressMap).filter(
    (p) => p.completed && activeClass?.subjects?.some((s) => s.chapters?.some((ch) => ch.id === p.chapterId))
  ).length;

  const enrolledChapterIds = activeClass?.subjects?.flatMap((s) => s.chapters?.map((c) => c.id) || []) || [];
  const totalProgressSum = enrolledChapterIds.reduce((sum, chId) => {
    const p = progressMap[chId];
    if (!p) return sum;
    return sum + (p.completed ? 100 : (p.progressPercent || 0));
  }, 0);
  const overallProgressPercent = enrolledChapterIds.length > 0
    ? Math.round(totalProgressSum / enrolledChapterIds.length)
    : 0;

  // Initialize services on mount
  useEffect(() => {
    const init = async () => {
      await initializeNotificationsIfNeeded();
    };
    init();
  }, []);

  // Get recent progress items for "Continue Learning"
  const recentProgress = Object.values(progressMap)
    .filter((p) => !p.completed && p.progressPercent > 0)
    .sort((a, b) => (b.lastAccessed || 0) - (a.lastAccessed || 0))
    .slice(0, 2);

  const handleOpenChapter = (classId: string, subjectId: string, chapterId: string) => {
    navigation.navigate('ChapterDetails', { classId, subjectId, chapterId });
  };

  const getTimeGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <View className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <HeaderBar
        onProfilePress={() => navigation.navigate('Profile')}
        onNotificationPress={() => navigation.navigate('Notifications')}
      />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 22, paddingTop: 20, paddingBottom: 50, gap: 24 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Greeting */}
        <View className="pt-1">
          <Text className="font-manrope-extrabold text-2xl text-textPrimary tracking-tight">
            {getTimeGreeting()}, {profile?.displayName?.split(' ')[0] || 'Student'}!
          </Text>
          <Text className="font-manrope-medium text-[13px] text-textSecondary mt-0.5">
            What would you like to learn today?
          </Text>
        </View>

        {/* Enrolled Academic Curriculum Card (Only Class, School & Progress) */}
        <TouchableOpacity
          className="rounded-[22px] bg-white border border-[#E8DFD8] p-5 shadow-sm gap-4"
          onPress={() => navigation.navigate('Learn')}
          activeOpacity={0.88}
        >
          <View className="flex-row items-center justify-between">
            <View className="flex-1 mr-3">
              <Text className="font-manrope-extrabold text-2xl text-textPrimary tracking-tight">
                {activeClass?.title}{profile?.section ? ` — Section ${profile.section}` : ''}
              </Text>
              <View className="flex-row items-center gap-1.5 mt-1">
                <MaterialIcons name="school" size={16} color={Colors.primary} />
                <Text className="font-manrope-medium text-xs text-textSecondary" numberOfLines={1}>
                  {profile?.schoolName || 'School not set'}
                </Text>
              </View>
            </View>

            <View className="w-12 h-12 rounded-2xl bg-palePeach items-center justify-center border border-[#F2DED3]">
              <MaterialIcons name="menu-book" size={24} color={Colors.primary} />
            </View>
          </View>

          {/* Progress Mini Bar & Syllabus Action Button */}
          <View className="pt-3 border-t border-[#F2EAE4] flex-row items-center justify-between">
            <View className="flex-1 mr-4">
              <View className="flex-row items-center justify-between mb-1.5">
                <Text className="font-manrope-bold text-[11px] text-textSecondary">
                  Syllabus Progress
                </Text>
                <Text className="font-manrope-extrabold text-xs text-primary">
                  {overallProgressPercent}%
                </Text>
              </View>
              <View className="h-2 w-full bg-[#EFE8E3] rounded-full overflow-hidden">
                <View
                  className="h-full bg-primary rounded-full"
                  style={{ width: `${Math.max(overallProgressPercent, 5)}%` }}
                />
              </View>
            </View>

            <View className="flex-row items-center gap-1 bg-primary px-3.5 py-2 rounded-xl shadow-xs">
              <Text className="font-manrope-bold text-xs text-white">Syllabus</Text>
              <MaterialIcons name="arrow-forward" size={13} color="#ffffff" />
            </View>
          </View>
        </TouchableOpacity>

        {/* Quick Actions */}
        <View className="flex-row gap-2.5">
          <TouchableOpacity
            className="flex-1 flex-row items-center gap-2.5 bg-primaryDark rounded-2xl py-3.5 px-4"
            onPress={() => navigation.navigate('Learn')}
            activeOpacity={0.85}
          >
            <View className="w-9 h-9 rounded-lg bg-white/20 items-center justify-center">
              <MaterialIcons name="auto-stories" size={20} color={Colors.white} />
            </View>
            <View className="flex-1">
              <Text className="font-manrope-bold text-xs text-white">Browse</Text>
              <Text className="font-manrope-medium text-[10px] text-primaryLight">Curriculum</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-1 flex-row items-center gap-2.5 bg-palePeach rounded-2xl py-3.5 px-4 border border-[#f2ded3]"
            onPress={() => navigation.navigate('Bookmarks')}
            activeOpacity={0.85}
          >
            <View className="w-9 h-9 rounded-lg bg-primary/15 items-center justify-center">
              <MaterialIcons name="bookmark" size={20} color={Colors.primary} />
            </View>
            <View className="flex-1">
              <Text className="font-manrope-bold text-xs text-primaryDark">Saved</Text>
              <Text className="font-manrope-medium text-[10px] text-textSecondary">Bookmarks</Text>
            </View>
          </TouchableOpacity>

        </View>

        {/* Curriculum Overview / Stats Grid - Dynamic to Enrolled Class */}
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="font-manrope-extrabold text-lg text-textPrimary tracking-tight">Overview</Text>
            <Text className="font-manrope-medium text-xs text-textSecondary mt-0.5">
              Class {enrolledStats.grade} Academic Stats
            </Text>
          </View>
          <TouchableOpacity
            className="flex-row items-center gap-1 bg-palePeach px-2.5 py-1 rounded-full border border-border"
            onPress={() => navigation.navigate('Learn')}
            activeOpacity={0.8}
          >
            <Text className="font-manrope-bold text-[11px] text-primary">Class {enrolledStats.grade}</Text>
            <MaterialIcons name="chevron-right" size={14} color={Colors.primary} />
          </TouchableOpacity>
        </View>

        <View className="gap-3">
          <View className="flex-row gap-3">
            <StatCard
              label="Subjects"
              value={enrolledStats.totalSubjects}
              iconName="auto-stories"
            />
            <StatCard
              label="Chapters"
              value={enrolledStats.totalChapters}
              iconName="menu-book"
            />
          </View>
          <View className="flex-row gap-3">
            <StatCard
              label="Completed"
              value={`${enrolledCompletedChaptersCount}`}
              iconName="check-circle"
              isProgress={enrolledCompletedChaptersCount > 0}
            />
            <StatCard
              label="Progress"
              value={`${overallProgressPercent}%`}
              iconName="trending-up"
              isProgress={true}
            />
          </View>
        </View>

        {/* Continue Learning Section - Dynamic */}
        <View className="flex-row items-center justify-between">
          <Text className="font-manrope-extrabold text-lg text-textPrimary tracking-tight">Continue Learning</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Learn')}>
            <Text className="font-manrope-bold text-[13px] text-primary">View All</Text>
          </TouchableOpacity>
        </View>

        {recentProgress.length > 0 ? (
          recentProgress.map((item) => {
            const res = getChapterById(item.chapterId);
            if (!res) return null;
            const { chapter, subject, schoolClass } = res;
            const sectionsTotal = chapter.sections.length;
            const sectionsDone = item.completedSections?.length || 0;

            return (
              <HoverCard
                key={item.chapterId}
                className="bg-white rounded-[20px] p-5 border border-border gap-3.5 shadow-sm"
                lift={-4}
              >
                <View className="flex-row items-start gap-3.5">
                  <View className="w-11 h-11 rounded-xl bg-palePeach items-center justify-center">
                    <MaterialIcons
                      name={(subject.icon as keyof typeof MaterialIcons.glyphMap) || 'menu-book'}
                      size={24}
                      color={Colors.primary}
                    />
                  </View>
                  <View className="flex-1">
                    <Text className="font-manrope-bold text-xs text-primary">
                      {subject.name} • {schoolClass.title}
                    </Text>
                    <Text className="font-manrope-extrabold text-base text-textPrimary mt-0.5 tracking-tight" numberOfLines={1}>
                      {chapter.title}
                    </Text>
                  </View>
                </View>

                {/* Progress Tracker */}
                <View className="gap-1.5">
                  <View className="flex-row items-center justify-between">
                    <Text className="font-manrope-medium text-xs text-textSecondary">
                      {sectionsDone} of {sectionsTotal} topics completed
                    </Text>
                    <Text className="font-manrope-extrabold text-xs text-primary">{item.progressPercent}%</Text>
                  </View>
                  <View className="h-1.5 rounded-full bg-[#F3EDE9] overflow-hidden">
                    <View className="h-full rounded-full bg-primary" style={{ width: `${item.progressPercent}%` }} />
                  </View>
                </View>

                <View className="flex-row items-center justify-between pt-1">
                  <View className="flex-row items-center gap-1.5">
                    <MaterialIcons name="schedule" size={14} color={Colors.textMuted} />
                    <Text className="font-manrope-medium text-xs text-textMuted">
                      {Math.max(5, (sectionsTotal - sectionsDone) * 8)} mins left
                    </Text>
                  </View>
                  <TouchableOpacity
                    className="flex-row items-center gap-1 bg-primary px-[18px] py-[9px] rounded-full shadow-sm"
                    onPress={() => handleOpenChapter(schoolClass.id, subject.id, chapter.id)}
                    activeOpacity={0.85}
                  >
                    <Text className="font-manrope-bold text-xs text-white">Resume</Text>
                    <MaterialIcons name="play-arrow" size={16} color={Colors.white} />
                  </TouchableOpacity>
                </View>
              </HoverCard>
            );
          })
        ) : (
          <View className="bg-white rounded-[20px] p-5 border border-border items-center gap-2">
            <MaterialIcons name="auto-stories" size={24} color={Colors.textMuted} />
            <Text className="font-manrope-medium text-xs text-textSecondary text-center">
              Open a chapter in Learn to see it here.
            </Text>
          </View>
        )}

        {/* Saved Bookmarks */}
        <View className="flex-row items-center justify-between">
          <Text className="font-manrope-extrabold text-lg text-textPrimary tracking-tight">Saved Bookmarks</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Bookmarks')}>
            <Text className="font-manrope-bold text-[13px] text-primary">View All</Text>
          </TouchableOpacity>
        </View>

        <View className="bg-white rounded-[20px] p-5 border border-border shadow-sm overflow-hidden">
          {bookmarks.slice(0, 2).map((bm, index) => (
            <TouchableOpacity
              key={bm.id}
              className={`flex-row items-start gap-3.5 py-2.5 ${
                index > 0 ? 'border-t border-border pt-3' : ''
              }`}
              onPress={() =>
                handleOpenChapter(bm.classId, bm.subjectId, bm.chapterId)
              }
              activeOpacity={0.75}
            >
              <View className="w-[38px] h-[38px] rounded-xl bg-palePeach items-center justify-center mt-0.5">
                <MaterialIcons
                  name={bm.type === 'formula' ? 'functions' : 'auto-stories'}
                  size={18}
                  color={Colors.primary}
                />
              </View>
              <View className="flex-1 min-w-0" style={{ flex: 1, minWidth: 0 }}>
                <View className="flex-row items-center justify-between">
                  <Text className="font-manrope-bold text-xs text-primary">{bm.subtitle}</Text>
                  <Text className="font-manrope-medium text-[11px] text-textMuted">Saved</Text>
                </View>
                <Text className="font-manrope-extrabold text-[15px] text-textPrimary mt-0.5 tracking-tight" numberOfLines={1}>
                  {bm.title}
                </Text>
                {bm.previewText && (
                  <View
                    className="bg-softWarm px-2.5 py-1 rounded-md mt-1.5 self-start max-w-full overflow-hidden"
                    style={{ maxWidth: '100%' }}
                  >
                    <Text
                      className="font-manrope-medium text-[11px] text-textSecondary"
                      numberOfLines={1}
                      ellipsizeMode="tail"
                    >
                      {bm.previewText}
                    </Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Study Habit Tip */}
        <CalloutCard
          variant="learning"
          title="Daily Study Habit"
          description="Consistent 20-minute daily sessions lead to significantly stronger conceptual retention."
        />
      </ScrollView>
      <BottomNav activeTab="Home" navigation={navigation} />
    </View>
  );
};
