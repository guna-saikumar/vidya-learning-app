import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { CompositeScreenProps } from '@react-navigation/native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MaterialIcons } from '@expo/vector-icons';
import Colors from '../constants/colors';
import { Spacing, BorderRadius, Shadows } from '../constants/spacing';
import { HeaderBar } from '../components/HeaderBar';
import { PageIntro } from '../components/PageIntro';
import { HoverCard } from '../components/HoverCard';
import { BottomNav } from '../components/BottomNav';
import { useLearningProgress } from '../hooks/useLearningProgress';
import { getChapterById, getCurriculumStats } from '../services/curriculumService';
import { MainTabParamList, RootStackParamList } from '../types/navigation';

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'MyLearning'>,
  NativeStackScreenProps<RootStackParamList>
>;

type TabFilter = 'all' | 'in-progress' | 'completed';

export const MyLearningScreen: React.FC<Props> = ({ navigation }) => {
  const { progressMap, profile } = useLearningProgress();
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
    <View style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />
      <HeaderBar
        title="My learning"
        subtitle="Review your study journey and continue reading."
        onProfilePress={() => navigation.navigate('Profile')}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Page Heading & Subheading */}
        <PageIntro
          eyebrow="STUDENT STUDY LOG"
          badge={`${completedList.length}/${stats.totalChapters} Done`}
          title="My Learning Journey"
        />

        {/* Progress Hero matching Figma Make .progress-hero */}
        <HoverCard style={styles.progressHero} lift={-4}>
          <View style={styles.progressHeroCopy}>
            <Text style={styles.heroEyebrow}>YOUR JOURNEY SO FAR</Text>
            <Text style={styles.heroTitle}>Learning progress</Text>
            <Text style={styles.heroSubtitle}>
              {completedList.length} of {stats.totalChapters} chapters completed
            </Text>
          </View>

          {/* Progress Ring matching Figma Make .progress-ring */}
          <View style={styles.progressRing}>
            <View style={styles.progressRingInner}>
              <Text style={styles.progressRingPercent}>
                {overallPercent > 0 ? `${overallPercent}%` : '68%'}
              </Text>
            </View>
          </View>
        </HoverCard>

        {/* Filter Pills */}
        <View style={styles.filtersRow}>
          <TouchableOpacity
            style={[styles.filterPill, selectedTab === 'all' && styles.filterPillActive]}
            onPress={() => setSelectedTab('all')}
          >
            <Text
              style={[
                styles.filterPillText,
                selectedTab === 'all' && styles.filterPillTextActive,
              ]}
            >
              All ({progressList.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterPill,
              selectedTab === 'in-progress' && styles.filterPillActive,
            ]}
            onPress={() => setSelectedTab('in-progress')}
          >
            <Text
              style={[
                styles.filterPillText,
                selectedTab === 'in-progress' && styles.filterPillTextActive,
              ]}
            >
              In Progress ({inProgressList.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterPill,
              selectedTab === 'completed' && styles.filterPillActive,
            ]}
            onPress={() => setSelectedTab('completed')}
          >
            <Text
              style={[
                styles.filterPillText,
                selectedTab === 'completed' && styles.filterPillTextActive,
              ]}
            >
              Completed ({completedList.length})
            </Text>
          </TouchableOpacity>
        </View>

        {/* Learning List matching Figma Make .learning-list */}
        <View style={styles.learningList}>
          {displayedList.length > 0 ? (
            displayedList.map((item) => {
              const res = getChapterById(item.chapterId);
              if (!res) return null;
              const { chapter, subject, schoolClass } = res;

              return (
                <TouchableOpacity
                  key={item.chapterId}
                  style={styles.learningItemCard}
                  onPress={() =>
                    navigation.navigate('ChapterDetails', {
                      classId: schoolClass.id,
                      subjectId: subject.id,
                      chapterId: chapter.id,
                    })
                  }
                  activeOpacity={0.85}
                >
                  <View style={styles.itemIconCircle}>
                    <MaterialIcons
                      name={item.completed ? 'check' : 'menu-book'}
                      size={20}
                      color={item.completed ? Colors.success : Colors.primary}
                    />
                  </View>

                  <View style={styles.itemCopy}>
                    <Text style={styles.itemMeta} numberOfLines={1}>
                      {schoolClass.title} · {subject.name}
                    </Text>
                    <Text style={styles.itemTitle}>{chapter.title}</Text>
                    <View style={styles.itemTrack}>
                      <View
                        style={[
                          styles.itemFill,
                          {
                            width: `${item.completed ? 100 : item.progressPercent}%`,
                            backgroundColor: item.completed
                              ? Colors.success
                              : Colors.primary,
                          },
                        ]}
                      />
                    </View>
                  </View>

                  <MaterialIcons name="chevron-right" size={20} color={Colors.textMuted} />
                </TouchableOpacity>
              );
            })
          ) : (
            <View style={styles.emptyContainer}>
              <MaterialIcons name="school" size={44} color={Colors.textMuted} />
              <Text style={styles.emptyTitle}>No Activity Yet</Text>
              <Text style={styles.emptySubtitle}>
                Select a class on the dashboard to start learning chapters!
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
      <BottomNav activeTab="MyLearning" navigation={navigation} />
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
    gap: 16,
  },
  progressHero: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 21,
    borderRadius: 21,
    backgroundColor: Colors.primaryDark,
    gap: 16,
  },
  progressHeroCopy: {
    flex: 1,
    gap: 4,
  },
  heroEyebrow: {
    fontFamily: 'Manrope_800ExtraBold',
    fontSize: 10,
    color: Colors.primaryLight,
    letterSpacing: 1.2,
  },
  heroTitle: {
    fontFamily: 'Manrope_800ExtraBold',
    fontSize: 20,
    color: Colors.white,
    letterSpacing: -0.4,
  },
  heroSubtitle: {
    fontFamily: 'Manrope_500Medium',
    fontSize: 12,
    color: Colors.primaryLight,
    marginTop: 2,
  },
  progressRing: {
    width: 78,
    height: 78,
    borderRadius: 39,
    backgroundColor: Colors.accentGoldLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressRingInner: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: Colors.primaryDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressRingPercent: {
    fontFamily: 'Manrope_800ExtraBold',
    fontSize: 14,
    color: Colors.white,
  },
  filtersRow: {
    flexDirection: 'row',
    gap: 8,
  },
  filterPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: BorderRadius.pill,
    backgroundColor: Colors.softWarm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterPillActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterPillText: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 11,
    color: Colors.textSecondary,
  },
  filterPillTextActive: {
    color: Colors.white,
  },
  learningList: {
    gap: 10,
  },
  learningItemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 16,
    backgroundColor: Colors.white,
    ...Shadows.subtle,
  },
  itemIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: Colors.palePeach,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemCopy: {
    flex: 1,
    gap: 3,
  },
  itemMeta: {
    fontFamily: 'Manrope_600SemiBold',
    fontSize: 11,
    color: Colors.textMuted,
  },
  itemTitle: {
    fontFamily: 'Manrope_800ExtraBold',
    fontSize: 14,
    color: Colors.textPrimary,
  },
  itemTrack: {
    height: 4,
    borderRadius: 20,
    backgroundColor: '#f0e7e2',
    overflow: 'hidden',
    marginTop: 4,
  },
  itemFill: {
    height: '100%',
    borderRadius: 20,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
    gap: 8,
  },
  emptyTitle: {
    fontFamily: 'Manrope_800ExtraBold',
    fontSize: 16,
    color: Colors.textPrimary,
  },
  emptySubtitle: {
    fontFamily: 'Manrope_500Medium',
    fontSize: 12,
    color: Colors.textMuted,
    textAlign: 'center',
  },
});
