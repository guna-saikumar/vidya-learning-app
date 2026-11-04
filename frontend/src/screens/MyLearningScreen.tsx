import React, { useState } from 'react';
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
import { useLearningProgress } from '../hooks/useLearningProgress';
import { getChapterById, getCurriculumStats } from '../services/curriculumService';
import { RootStackParamList } from '../types/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'MyLearning'>;

type TabFilter = 'all' | 'in-progress' | 'completed';

export const MyLearningScreen: React.FC<Props> = ({ navigation }) => {
  const { progressMap } = useLearningProgress();
  const [selectedTab, setSelectedTab] = useState<TabFilter>('all');
  const stats = getCurriculumStats();

  const progressList = Object.values(progressMap);
  const completedList = progressList.filter((p) => p.completed);
  const inProgressList = progressList.filter(
    (p) => !p.completed && (p.progressPercent || 0) > 0
  );

  let displayedList = progressList;
  if (selectedTab === 'completed') displayedList = completedList;
  if (selectedTab === 'in-progress') displayedList = inProgressList;

  displayedList.sort((a, b) => (b.lastAccessed || 0) - (a.lastAccessed || 0));

  const totalCompleted = completedList.length;
  const overallPercent = Math.min(
    100,
    Math.round((totalCompleted / Math.max(1, stats.totalChapters)) * 100)
  );

  return (
    <View className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <HeaderBar
        title="My learning"
        subtitle="Review your study journey and continue reading."
        onProfilePress={() => navigation.navigate('Profile')}
      />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 22, paddingTop: 18, paddingBottom: 48, gap: 20 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Page Heading & Subheading */}
        <PageIntro
          eyebrow="STUDENT STUDY LOG"
          badge={`${completedList.length}/${stats.totalChapters} Done`}
          title="My Learning Journey"
        />

        {/* Progress Hero matching Figma Make .progress-hero */}
        <HoverCard className="flex-row items-center justify-between p-6 rounded-[22px] bg-primaryDark gap-4" lift={-4}>
          <View className="flex-1 gap-1">
            <Text className="font-manrope-extrabold text-[11px] text-primaryLight tracking-widest uppercase">
              YOUR JOURNEY SO FAR
            </Text>
            <Text className="font-manrope-extrabold text-[22px] text-white tracking-tight">Learning progress</Text>
            <Text className="font-manrope-medium text-[13px] text-primaryLight mt-0.5">
              {completedList.length} of {stats.totalChapters} chapters completed
            </Text>
          </View>

          {/* Progress Ring matching Figma Make .progress-ring */}
          <View className="w-[78px] h-[78px] rounded-full bg-accentGoldLight items-center justify-center">
            <View className="w-[62px] h-[62px] rounded-full bg-primaryDark items-center justify-center">
              <Text className="font-manrope-extrabold text-sm text-white">
                {overallPercent > 0 ? `${overallPercent}%` : '68%'}
              </Text>
            </View>
          </View>
        </HoverCard>

        {/* Filter Pills */}
        <View className="flex-row gap-2">
          <TouchableOpacity
            className={`px-4 py-2 rounded-full border ${
              selectedTab === 'all'
                ? 'bg-primary border-primary'
                : 'bg-softWarm border-border'
            }`}
            onPress={() => setSelectedTab('all')}
          >
            <Text
              className={`font-manrope-bold text-xs ${
                selectedTab === 'all' ? 'text-white' : 'text-textSecondary'
              }`}
            >
              All ({progressList.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className={`px-4 py-2 rounded-full border ${
              selectedTab === 'in-progress'
                ? 'bg-primary border-primary'
                : 'bg-softWarm border-border'
            }`}
            onPress={() => setSelectedTab('in-progress')}
          >
            <Text
              className={`font-manrope-bold text-xs ${
                selectedTab === 'in-progress' ? 'text-white' : 'text-textSecondary'
              }`}
            >
              In Progress ({inProgressList.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className={`px-4 py-2 rounded-full border ${
              selectedTab === 'completed'
                ? 'bg-primary border-primary'
                : 'bg-softWarm border-border'
            }`}
            onPress={() => setSelectedTab('completed')}
          >
            <Text
              className={`font-manrope-bold text-xs ${
                selectedTab === 'completed' ? 'text-white' : 'text-textSecondary'
              }`}
            >
              Completed ({completedList.length})
            </Text>
          </TouchableOpacity>
        </View>

        {/* Learning List */}
        <View className="gap-3">
          {displayedList.length > 0 ? (
            displayedList.map((item) => {
              const res = getChapterById(item.chapterId);
              if (!res) return null;
              const { chapter, subject, schoolClass } = res;

              return (
                <TouchableOpacity
                  key={item.chapterId}
                  className="flex-row items-center gap-3.5 p-[18px] border border-border rounded-[20px] bg-white shadow-sm"
                  onPress={() =>
                    navigation.navigate('ChapterDetails', {
                      classId: schoolClass.id,
                      subjectId: subject.id,
                      chapterId: chapter.id,
                    })
                  }
                  activeOpacity={0.85}
                >
                  <View className="w-[38px] h-[38px] rounded-xl bg-palePeach items-center justify-center">
                    <MaterialIcons
                      name={item.completed ? 'check' : 'menu-book'}
                      size={20}
                      color={item.completed ? Colors.success : Colors.primary}
                    />
                  </View>

                  <View className="flex-1 gap-[3px]">
                    <Text className="font-manrope-semibold text-[11px] text-textMuted" numberOfLines={1}>
                      {schoolClass.title} · {subject.name}
                    </Text>
                    <Text className="font-manrope-extrabold text-sm text-textPrimary">{chapter.title}</Text>
                    <View className="h-1 rounded-full bg-[#f0e7e2] overflow-hidden mt-1">
                      <View
                        className="h-full rounded-full"
                        style={{
                          width: `${item.completed ? 100 : item.progressPercent}%`,
                          backgroundColor: item.completed
                            ? Colors.success
                            : Colors.primary,
                        }}
                      />
                    </View>
                  </View>

                  <MaterialIcons name="chevron-right" size={20} color={Colors.textMuted} />
                </TouchableOpacity>
              );
            })
          ) : (
            <View className="items-center justify-center py-12 gap-2">
              <MaterialIcons name="school" size={44} color={Colors.textMuted} />
              <Text className="font-manrope-extrabold text-base text-textPrimary">No Activity Yet</Text>
              <Text className="font-manrope-medium text-xs text-textMuted text-center">
                Select a class on the dashboard to start learning chapters!
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
      <BottomNav activeTab="Learn" navigation={navigation} />
    </View>
  );
};
