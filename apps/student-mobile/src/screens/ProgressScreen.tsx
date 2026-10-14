import React, { useMemo, useState, useEffect } from 'react';
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
import { PageIntro, HoverCard } from '../components/common';
import { SubjectProgress, WeeklyChart } from '../components/progress';
import { useLearningProgress } from '../hooks/useLearningProgress';
import { getClasses, getCurriculumStats } from '../services/curriculumService';
import { getQuizStats } from '../services/quizService';
import { getAllTasks, getTaskStats } from '../services/taskService';
import { RootStackParamList } from '../types/navigation';
import { Task } from '../types/tasks';

type Props = NativeStackScreenProps<RootStackParamList, 'Progress'>;

type ProgressTab = 'overview' | 'quizzes' | 'assignments' | 'subjects';

const WEEKLY_DATA = [
  { day: 'Mon', minutes: 35 },
  { day: 'Tue', minutes: 50 },
  { day: 'Wed', minutes: 20 },
  { day: 'Thu', minutes: 45 },
  { day: 'Fri', minutes: 60 },
  { day: 'Sat', minutes: 30 },
  { day: 'Sun', minutes: 15 },
];

export const ProgressScreen: React.FC<Props> = ({ navigation }) => {
  const { profile, progressMap, bookmarks } = useLearningProgress();
  const classes = getClasses();
  const stats = getCurriculumStats();

  const [activeTab, setActiveTab] = useState<ProgressTab>('overview');
  const [quizStats, setQuizStats] = useState<any>(null);
  const [taskStats, setTaskStats] = useState<any>(null);
  const [assignments, setAssignments] = useState<Task[]>([]);
  const [assignmentFilter, setAssignmentFilter] = useState<'all' | 'pending' | 'completed'>('all');

  useEffect(() => {
    getQuizStats().then(setQuizStats).catch(() => {});
    getTaskStats().then(setTaskStats).catch(() => {});
    getAllTasks().then((all) => {
      setAssignments(all.filter((t) => t.type === 'assignment' || t.type === 'practice'));
    }).catch(() => {});
  }, []);

  const activeClassId = profile?.activeClassId || 'class-8';
  const activeClass = classes.find((c) => c.id === activeClassId);

  const progressList = Object.values(progressMap);
  const completedCount = progressList.filter((p) => p.completed).length;
  const inProgressCount = progressList.filter((p) => !p.completed && p.progressPercent > 0).length;

  const overallPercent = Math.min(
    100,
    Math.round((completedCount / Math.max(1, stats.totalChapters)) * 100)
  );

  const subjectProgressData = useMemo(() => {
    if (!activeClass) return [];

    return activeClass.subjects.map((subject) => {
      let completedChapters = 0;
      let totalPercent = 0;

      subject.chapters.forEach((ch) => {
        const progress = progressMap[ch.id];
        if (progress) {
          if (progress.completed) completedChapters++;
          totalPercent += progress.progressPercent || 0;
        }
      });

      const avgPercent = subject.chapters.length > 0
        ? Math.round(totalPercent / subject.chapters.length)
        : 0;

      return {
        subjectName: subject.name,
        icon: subject.icon,
        totalChapters: subject.chapters.length,
        completedChapters,
        progressPercent: avgPercent,
      };
    });
  }, [activeClass, progressMap]);

  const totalStudyMinutes = WEEKLY_DATA.reduce((sum, d) => sum + d.minutes, 0);

  const filteredAssignments = assignments.filter((t) => {
    if (assignmentFilter === 'pending') return t.status === 'pending' || t.status === 'in-progress';
    if (assignmentFilter === 'completed') return t.status === 'completed';
    return true;
  });

  return (
    <View className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />
      <HeaderBar
        title="Learning Progress"
        subtitle="Analytics & Academic Mastery"
        activeRoute="Progress"
      />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 22, paddingTop: 18, paddingBottom: 48, gap: 20 }}
        showsVerticalScrollIndicator={false}
      >
        <PageIntro
          eyebrow="ACADEMIC HEALTH"
          badge={`${activeClass?.title || 'Class 8'} Enrolled`}
          title="Progress & Mastery"
        />

        {/* UX Level 1: Consolidated Academic Vital Signs Card */}
        <HoverCard className="p-5 rounded-[22px] bg-primaryDark gap-3.5 shadow-md" lift={-3}>
          <View className="flex-row items-center justify-between">
            <View className="bg-primaryLight/20 px-3 py-1 rounded-full border border-primaryLight/30">
              <Text className="font-manrope-extrabold text-[10px] text-primaryLight tracking-wider uppercase">
                ACADEMIC PERFORMANCE · TIER A
              </Text>
            </View>

            <TouchableOpacity
              className="flex-row items-center gap-1 bg-white/10 px-2.5 py-1 rounded-full"
              onPress={() => navigation.navigate('ExamResults')}
              activeOpacity={0.8}
            >
              <Text className="font-manrope-bold text-[11px] text-white">Board Memo</Text>
              <MaterialIcons name="chevron-right" size={14} color={Colors.white} />
            </TouchableOpacity>
          </View>

          <View className="flex-row items-center justify-between py-1">
            <View className="gap-1 flex-1 pr-3">
              <Text className="font-manrope-extrabold text-[28px] text-white tracking-tight leading-8">
                {overallPercent}% Syllabus
              </Text>
              <Text className="font-manrope-medium text-xs text-primaryLight leading-4">
                {completedCount} chapters mastered · {inProgressCount} in progress
              </Text>
            </View>

            <View className="w-16 h-16 rounded-full bg-accentGoldLight items-center justify-center">
              <View className="w-[50px] h-[50px] rounded-full bg-primaryDark items-center justify-center">
                <Text className="font-manrope-extrabold text-sm text-white">
                  {overallPercent}%
                </Text>
              </View>
            </View>
          </View>

          {/* Metric Bar: 4 perfectly aligned, centered stat tiles */}
          <View className="flex-row gap-1.5 pt-2.5 border-t border-white/10">
            <View className="flex-1 bg-white/10 py-2 px-1 rounded-xl items-center justify-center min-h-[50px]">
              <Text className="font-manrope-extrabold text-sm text-white text-center">
                {quizStats?.averageScore || 85}%
              </Text>
              <Text
                className="font-manrope-medium text-[10px] text-primaryLight text-center mt-0.5"
                numberOfLines={1}
              >
                Quiz Avg
              </Text>
            </View>

            <View className="flex-1 bg-white/10 py-2 px-1 rounded-xl items-center justify-center min-h-[50px]">
              <Text className="font-manrope-extrabold text-sm text-white text-center">
                {taskStats?.completed || 4}/{taskStats?.total || 6}
              </Text>
              <Text
                className="font-manrope-medium text-[10px] text-primaryLight text-center mt-0.5"
                numberOfLines={1}
              >
                Tasks
              </Text>
            </View>

            <View className="flex-1 bg-white/10 py-2 px-1 rounded-xl items-center justify-center min-h-[50px]">
              <Text className="font-manrope-extrabold text-sm text-white text-center">
                {profile?.streakDays || 5} Days
              </Text>
              <Text
                className="font-manrope-medium text-[10px] text-primaryLight text-center mt-0.5"
                numberOfLines={1}
              >
                Streak
              </Text>
            </View>

            <View className="flex-1 bg-white/10 py-2 px-1 rounded-xl items-center justify-center min-h-[50px]">
              <Text className="font-manrope-extrabold text-sm text-white text-center">
                {totalStudyMinutes}m
              </Text>
              <Text
                className="font-manrope-medium text-[10px] text-primaryLight text-center mt-0.5"
                numberOfLines={1}
              >
                This Week
              </Text>
            </View>
          </View>
        </HoverCard>

        {/* UX Level 2: Clean Segmented Horizontal Tab Control */}
        <View className="flex-row gap-1.5 bg-[#FAF7F4] p-1 rounded-2xl border border-border">
          {[
            { key: 'overview', label: 'Overview', icon: 'dashboard' },
            { key: 'quizzes', label: 'Quizzes', icon: 'quiz' },
            { key: 'assignments', label: 'Tasks', icon: 'assignment' },
            { key: 'subjects', label: 'Subjects', icon: 'auto-stories' },
          ].map((tab) => {
            const isSelected = activeTab === tab.key;
            return (
              <TouchableOpacity
                key={tab.key}
                className={`flex-1 py-2 rounded-xl items-center flex-row justify-center gap-1.5 ${
                  isSelected ? 'bg-primary shadow-sm' : 'bg-transparent'
                }`}
                onPress={() => setActiveTab(tab.key as ProgressTab)}
                activeOpacity={0.8}
              >
                <MaterialIcons
                  name={tab.icon as any}
                  size={14}
                  color={isSelected ? Colors.white : Colors.textSecondary}
                />
                <Text
                  className={`font-manrope-bold text-xs ${
                    isSelected ? 'text-white' : 'text-textSecondary'
                  }`}
                >
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* ============================================================ */}
        {/* TAB 1: OVERVIEW DASHBOARD                                   */}
        {/* ============================================================ */}
        {activeTab === 'overview' && (
          <View className="gap-4">
            {/* 1. Weekly Study Habit Chart */}
            <WeeklyChart data={WEEKLY_DATA} goalMinutes={profile?.studyGoalMinutes || 45} />

            {/* 2. Quick Assessment & Results Banner */}
            <View className="bg-white rounded-2xl p-4 border border-border shadow-sm gap-3">
              <View className="flex-row items-center justify-between pb-2 border-b border-border">
                <View className="flex-row items-center gap-2">
                  <MaterialIcons name="analytics" size={18} color={Colors.primary} />
                  <Text className="font-manrope-extrabold text-sm text-textPrimary">
                    Assessment Snapshot
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => navigation.navigate('ExamResults')}
                  activeOpacity={0.7}
                >
                  <Text className="font-manrope-bold text-xs text-primary">Check Results →</Text>
                </TouchableOpacity>
              </View>

              <View className="flex-row gap-3">
                <TouchableOpacity
                  className="flex-1 bg-[#FAF7F4] p-3 rounded-xl border border-border"
                  onPress={() => setActiveTab('quizzes')}
                  activeOpacity={0.8}
                >
                  <Text className="font-manrope-extrabold text-base text-primary">
                    {quizStats?.totalTaken || 4} Quizzes
                  </Text>
                  <Text className="font-manrope-medium text-xs text-textSecondary mt-0.5">
                    {quizStats?.averageScore || 85}% Average Score
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  className="flex-1 bg-[#FAF7F4] p-3 rounded-xl border border-border"
                  onPress={() => setActiveTab('assignments')}
                  activeOpacity={0.8}
                >
                  <Text className="font-manrope-extrabold text-base text-success">
                    {assignments.filter((a) => a.status === 'completed').length} Tasks Done
                  </Text>
                  <Text className="font-manrope-medium text-xs text-textSecondary mt-0.5">
                    92% On-Time Rate
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* 3. Upcoming Exam Readiness Widget */}
            <HoverCard className="bg-white rounded-2xl p-4 border border-border shadow-sm gap-3" lift={-2}>
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center gap-2.5 flex-1 pr-2">
                  <View className="w-9 h-9 rounded-xl bg-palePeach items-center justify-center">
                    <MaterialIcons name="event-note" size={20} color={Colors.primary} />
                  </View>
                  <View className="flex-1">
                    <Text className="font-manrope-extrabold text-sm text-textPrimary">
                      SA-1 Board Exam in 14 Days
                    </Text>
                    <Text className="font-manrope-medium text-xs text-textSecondary mt-0.5">
                      Starts Nov 16 · Telugu, Maths, Science
                    </Text>
                  </View>
                </View>

                <TouchableOpacity
                  className="bg-primary py-1.5 px-3 rounded-full"
                  onPress={() => navigation.navigate('ExamSchedule')}
                  activeOpacity={0.8}
                >
                  <Text className="font-manrope-bold text-xs text-white">Timetable</Text>
                </TouchableOpacity>
              </View>
            </HoverCard>

            {/* 4. Subject Syllabus Highlights Preview */}
            <View className="bg-white rounded-2xl p-4 border border-border shadow-sm gap-3">
              <View className="flex-row items-center justify-between pb-2 border-b border-border">
                <Text className="font-manrope-extrabold text-sm text-textPrimary">Top Subjects</Text>
                <TouchableOpacity onPress={() => setActiveTab('subjects')} activeOpacity={0.7}>
                  <Text className="font-manrope-bold text-xs text-primary">View All Subjects →</Text>
                </TouchableOpacity>
              </View>

              {subjectProgressData.slice(0, 3).map((sp) => (
                <View key={sp.subjectName}>
                  <SubjectProgress {...sp} />
                </View>
              ))}
            </View>
          </View>
        )}

        {/* ============================================================ */}
        {/* TAB 2: QUIZZES DEEP-DIVE                                     */}
        {/* ============================================================ */}
        {activeTab === 'quizzes' && (
          <View className="gap-3">
            <View className="flex-row gap-2.5">
              <View className="flex-1 bg-white p-3.5 rounded-2xl border border-border shadow-sm items-center">
                <Text className="font-manrope-extrabold text-2xl text-primary">
                  {quizStats?.totalTaken || 4}
                </Text>
                <Text className="font-manrope-bold text-xs text-textPrimary mt-0.5">Completed</Text>
              </View>

              <View className="flex-1 bg-white p-3.5 rounded-2xl border border-border shadow-sm items-center">
                <Text className="font-manrope-extrabold text-2xl text-success">
                  {quizStats?.averageScore || 85}%
                </Text>
                <Text className="font-manrope-bold text-xs text-textPrimary mt-0.5">Average Score</Text>
              </View>

              <View className="flex-1 bg-white p-3.5 rounded-2xl border border-border shadow-sm items-center">
                <Text className="font-manrope-extrabold text-2xl text-accentGoldDark">
                  {quizStats?.passRate || 100}%
                </Text>
                <Text className="font-manrope-bold text-xs text-textPrimary mt-0.5">Pass Rate</Text>
              </View>
            </View>

            <View className="bg-white rounded-2xl p-4 border border-border shadow-sm gap-3">
              <View className="flex-row items-center justify-between pb-2 border-b border-border">
                <Text className="font-manrope-extrabold text-sm text-textPrimary">Quiz Attempt History</Text>
                <TouchableOpacity onPress={() => navigation.navigate('Tasks')} activeOpacity={0.7}>
                  <Text className="font-manrope-bold text-xs text-primary">+ New Quiz</Text>
                </TouchableOpacity>
              </View>

              {(quizStats?.recentAttempts || []).map((attempt: any, idx: number) => (
                <View
                  key={idx}
                  className="py-2.5 border-b border-border/60 last:border-b-0 flex-row items-center justify-between"
                >
                  <View className="flex-1 pr-2">
                    <Text className="font-manrope-extrabold text-xs text-textPrimary">
                      {attempt.title}
                    </Text>
                    <Text className="font-manrope-medium text-[11px] text-textSecondary mt-0.5">
                      {attempt.subject} · {attempt.date}
                    </Text>
                  </View>

                  <View className="flex-row items-center gap-2">
                    <View
                      className={`px-2.5 py-1 rounded-lg ${
                        attempt.score >= 80 ? 'bg-successBg' : 'bg-palePeach'
                      }`}
                    >
                      <Text
                        className={`font-manrope-extrabold text-xs ${
                          attempt.score >= 80 ? 'text-success' : 'text-primary'
                        }`}
                      >
                        {attempt.score}%
                      </Text>
                    </View>

                    <TouchableOpacity
                      className="py-1 px-2.5 rounded-lg border border-border bg-white"
                      onPress={() => navigation.navigate('Tasks')}
                      activeOpacity={0.7}
                    >
                      <Text className="font-manrope-bold text-[11px] text-primary">Retake</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* ============================================================ */}
        {/* TAB 3: ASSIGNMENTS DEEP-DIVE                                 */}
        {/* ============================================================ */}
        {activeTab === 'assignments' && (
          <View className="gap-3">
            <View className="flex-row gap-2.5">
              <View className="flex-1 bg-white p-3.5 rounded-2xl border border-border shadow-sm items-center">
                <Text className="font-manrope-extrabold text-2xl text-primary">
                  {assignments.filter((a) => a.status === 'completed').length} / {assignments.length || 5}
                </Text>
                <Text className="font-manrope-bold text-xs text-textPrimary mt-0.5">Submitted</Text>
              </View>

              <View className="flex-1 bg-white p-3.5 rounded-2xl border border-border shadow-sm items-center">
                <Text className="font-manrope-extrabold text-2xl text-accentGoldDark">
                  {assignments.filter((a) => a.status === 'pending' || a.status === 'in-progress').length}
                </Text>
                <Text className="font-manrope-bold text-xs text-textPrimary mt-0.5">Pending</Text>
              </View>

              <View className="flex-1 bg-white p-3.5 rounded-2xl border border-border shadow-sm items-center">
                <Text className="font-manrope-extrabold text-2xl text-success">
                  92%
                </Text>
                <Text className="font-manrope-bold text-xs text-textPrimary mt-0.5">On-Time</Text>
              </View>
            </View>

            {/* Filter pills for assignments */}
            <View className="flex-row gap-2">
              {[
                { key: 'all', label: 'All Tasks' },
                { key: 'pending', label: 'Pending Due' },
                { key: 'completed', label: 'Submitted' },
              ].map((f) => (
                <TouchableOpacity
                  key={f.key}
                  className={`py-1.5 px-3 rounded-full border ${
                    assignmentFilter === f.key ? 'bg-primary border-primary' : 'bg-surfaceSoft border-border'
                  }`}
                  onPress={() => setAssignmentFilter(f.key as any)}
                  activeOpacity={0.8}
                >
                  <Text
                    className={`font-manrope-bold text-xs ${
                      assignmentFilter === f.key ? 'text-white' : 'text-textSecondary'
                    }`}
                  >
                    {f.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Tasks list */}
            <View className="bg-white rounded-2xl p-4 border border-border shadow-sm gap-2.5">
              {filteredAssignments.map((task) => (
                <View
                  key={task.id}
                  className="py-2.5 border-b border-border/60 last:border-b-0 flex-row items-center justify-between"
                >
                  <View className="flex-1 pr-2">
                    <Text className="font-manrope-extrabold text-xs text-textPrimary">
                      {task.title}
                    </Text>
                    <Text className="font-manrope-medium text-[11px] text-textSecondary mt-0.5">
                      {task.subjectName} · {task.priority.toUpperCase()} Priority
                    </Text>
                  </View>

                  <View
                    className={`px-2.5 py-1 rounded-lg ${
                      task.status === 'completed' ? 'bg-successBg' : 'bg-palePeach'
                    }`}
                  >
                    <Text
                      className={`font-manrope-bold text-[11px] ${
                        task.status === 'completed' ? 'text-success' : 'text-primary'
                      }`}
                    >
                      {task.status === 'completed' ? 'Submitted' : 'Pending'}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* ============================================================ */}
        {/* TAB 4: SUBJECT-WISE SYLLABUS                                 */}
        {/* ============================================================ */}
        {activeTab === 'subjects' && (
          <View className="gap-3">
            <View className="bg-white rounded-[20px] p-5 border border-border shadow-sm">
              <View className="flex-row items-center justify-between pb-3 border-b border-border mb-3">
                <Text className="font-manrope-extrabold text-base text-textPrimary">
                  Class 8 Subject Syllabus
                </Text>
                <Text className="font-manrope-semibold text-xs text-textMuted">
                  {completedCount} Chapters Done
                </Text>
              </View>

              {subjectProgressData.map((sp) => (
                <View key={sp.subjectName}>
                  <SubjectProgress {...sp} />
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>

      <BottomNav activeTab="Progress" navigation={navigation} />
    </View>
  );
};
