import React, { useState, useEffect } from 'react';
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
import { StatCard, ClassCard } from '../components/home';
import { SearchBar, HoverCard, CalloutCard } from '../components/common';
import { getClasses, getCurriculumStats, searchCurriculum, getChapterById } from '../services/curriculumService';
import { getTaskStats, initializeTasksIfNeeded } from '../services/taskService';
import { initializeNotificationsIfNeeded } from '../services/notificationService';
import { useLearningProgress } from '../hooks/useLearningProgress';
import { RootStackParamList } from '../types/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export const DashboardScreen: React.FC<Props> = ({ navigation }) => {
  const { profile, bookmarks, progressMap, selectActiveGrade } = useLearningProgress();
  const [searchQuery, setSearchQuery] = useState('');
  const [taskStats, setTaskStats] = useState({ total: 0, pending: 0, completed: 0, overdue: 0 });
  const classes = getClasses();
  const stats = getCurriculumStats();

  const activeClassId = profile?.activeClassId || 'class-8';
  const searchResults = searchQuery.trim() ? searchCurriculum(searchQuery) : [];

  // Initialize services on mount
  useEffect(() => {
    const init = async () => {
      await initializeTasksIfNeeded();
      await initializeNotificationsIfNeeded();
      const ts = await getTaskStats();
      setTaskStats(ts);
    };
    init();
  }, []);

  // Get recent progress items for "Continue Learning"
  const recentProgress = Object.values(progressMap)
    .filter((p) => !p.completed && p.progressPercent > 0)
    .sort((a, b) => (b.lastAccessed || 0) - (a.lastAccessed || 0))
    .slice(0, 2);

  const handleSelectClass = (classId: string) => {
    selectActiveGrade(classId);
    navigation.navigate('ClassSubjects', { classId });
  };

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
        activeRoute="Home"
        onProfilePress={() => navigation.navigate('Profile')}
        onNotificationPress={() => navigation.navigate('Notifications')}
      />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 22, paddingTop: 20, paddingBottom: 50, gap: 24 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Greeting & Study Streak */}
        <View className="flex-row items-center justify-between pt-1">
          <View className="flex-1">
            <Text className="font-manrope-extrabold text-2xl text-textPrimary tracking-tight">
              {getTimeGreeting()}, {profile?.displayName?.split(' ')[0] || 'Aarav'}!
            </Text>
            <Text className="font-manrope-medium text-[13px] text-textSecondary mt-0.5">
              What would you like to learn today?
            </Text>
          </View>

          <View className="flex-row items-center gap-1 bg-palePeach px-3 py-1.5 rounded-full shadow-sm">
            <MaterialIcons
              name="local-fire-department"
              size={18}
              color={Colors.accentGoldDark}
            />
            <Text className="font-manrope-bold text-xs text-primaryDark">
              {profile?.streakDays || 5} Day Streak
            </Text>
          </View>
        </View>

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
            onPress={() => navigation.navigate('Tasks')}
            activeOpacity={0.85}
          >
            <View className="w-9 h-9 rounded-lg bg-primary/15 items-center justify-center">
              <MaterialIcons name="assignment" size={20} color={Colors.primary} />
            </View>
            <View className="flex-1">
              <Text className="font-manrope-bold text-xs text-primaryDark">{taskStats.pending} Pending</Text>
              <Text className="font-manrope-medium text-[10px] text-textSecondary">Tasks</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View className="relative z-10">
          <SearchBar
            value={searchQuery}
            onChangeText={setSearchQuery}
            onClear={() => setSearchQuery('')}
            placeholder="Search subjects, chapters, topics..."
            showFilterButton={true}
            onFilterPress={() => navigation.navigate('ClassSubjects', { classId: activeClassId })}
          />

          {/* Quick Search Dropdown if typing */}
          {searchResults.length > 0 && (
            <View className="bg-white rounded-2xl border border-border p-2 mt-1.5 shadow-sm">
              <Text className="font-manrope-extrabold text-[11px] text-textMuted px-2 pb-1">SEARCH RESULTS</Text>
              {searchResults.slice(0, 5).map((item) => (
                <TouchableOpacity
                  key={`${item.type}-${item.id}`}
                  className="flex-row items-center gap-2.5 py-2.5 px-2 border-b border-border"
                  onPress={() => {
                    setSearchQuery('');
                    if (item.type === 'subject') {
                      navigation.navigate('SubjectIndex', {
                        classId: item.classId,
                        subjectId: item.subjectId,
                      });
                    } else if (item.chapterId) {
                      navigation.navigate('ChapterDetails', {
                        classId: item.classId,
                        subjectId: item.subjectId,
                        chapterId: item.chapterId,
                      });
                    }
                  }}
                >
                  <MaterialIcons
                    name={item.type === 'subject' ? 'menu-book' : 'auto-stories'}
                    size={16}
                    color={Colors.primary}
                  />
                  <View className="flex-1">
                    <Text className="font-manrope-bold text-[13px] text-textPrimary">{item.title}</Text>
                    <Text className="font-manrope-medium text-[11px] text-textSecondary">{item.subtitle}</Text>
                  </View>
                  <MaterialIcons name="chevron-right" size={16} color={Colors.textMuted} />
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Curriculum Overview / Stats Grid */}
        <View className="flex-row items-center justify-between">
          <Text className="font-manrope-extrabold text-lg text-textPrimary tracking-tight">Overview</Text>
        </View>

        <View className="gap-3">
          <View className="flex-row gap-3">
            <StatCard
              label="Classes"
              value={stats.totalClasses}
              iconName="school"
            />
            <StatCard
              label="Subjects"
              value={stats.totalSubjects}
              iconName="auto-stories"
            />
          </View>
          <View className="flex-row gap-3">
            <StatCard
              label="Chapters"
              value={stats.totalChapters}
              iconName="menu-book"
            />
            <StatCard
              label="Tasks"
              value={`${taskStats.pending}`}
              iconName="assignment"
              isProgress={true}
            />
          </View>
        </View>

        {/* Continue Learning Section - Dynamic */}
        <View className="flex-row items-center justify-between">
          <Text className="font-manrope-extrabold text-lg text-textPrimary tracking-tight">Continue Learning</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Progress')}>
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
          /* Fallback static cards when no progress data */
          <>
            <HoverCard className="bg-white rounded-[20px] p-5 border border-border gap-3.5 shadow-sm" lift={-4}>
              <View className="flex-row items-start gap-3.5">
                <View className="w-11 h-11 rounded-xl bg-palePeach items-center justify-center">
                  <MaterialIcons name="calculate" size={24} color={Colors.primary} />
                </View>
                <View className="flex-1">
                  <Text className="font-manrope-bold text-xs text-primary">Mathematics • Class 8</Text>
                  <Text className="font-manrope-extrabold text-base text-textPrimary mt-0.5 tracking-tight" numberOfLines={1}>
                    Rational Numbers
                  </Text>
                </View>
              </View>
              <View className="gap-1.5">
                <View className="flex-row items-center justify-between">
                  <Text className="font-manrope-medium text-xs text-textSecondary">6 of 8 topics completed</Text>
                  <Text className="font-manrope-extrabold text-xs text-primary">75%</Text>
                </View>
                <View className="h-1.5 rounded-full bg-[#F3EDE9] overflow-hidden">
                  <View className="h-full rounded-full bg-primary" style={{ width: '75%' }} />
                </View>
              </View>
              <View className="flex-row items-center justify-between pt-1">
                <View className="flex-row items-center gap-1.5">
                  <MaterialIcons name="schedule" size={14} color={Colors.textMuted} />
                  <Text className="font-manrope-medium text-xs text-textMuted">15 mins left</Text>
                </View>
                <TouchableOpacity
                  className="flex-row items-center gap-1 bg-primary px-[18px] py-[9px] rounded-full shadow-sm"
                  onPress={() => handleOpenChapter('class-8', 'c8-maths', 'c8-m-ch1')}
                  activeOpacity={0.85}
                >
                  <Text className="font-manrope-bold text-xs text-white">Resume</Text>
                  <MaterialIcons name="play-arrow" size={16} color={Colors.white} />
                </TouchableOpacity>
              </View>
            </HoverCard>
          </>
        )}

        {/* Select Class Section */}
        <View className="flex-row items-center justify-between">
          <Text className="font-manrope-extrabold text-lg text-textPrimary tracking-tight">Classes</Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingVertical: 4 }}
        >
          {classes.map((c) => (
            <ClassCard
              key={c.id}
              schoolClass={c}
              isSelected={c.id === activeClassId}
              onPress={() => handleSelectClass(c.id)}
              horizontal={true}
            />
          ))}
        </ScrollView>

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
