import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity, Platform,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CompositeScreenProps } from '@react-navigation/native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { MaterialIcons } from '@expo/vector-icons';
import Colors from '../constants/colors';
import { Spacing, BorderRadius, Shadows } from '../constants/spacing';
import { HeaderBar } from '../components/HeaderBar';
import { BottomNav } from '../components/BottomNav';
import { SearchBar } from '../components/SearchBar';
import { HoverCard } from '../components/HoverCard';
import { StatCard } from '../components/StatCard';
import { ClassCard } from '../components/ClassCard';
import { CalloutCard } from '../components/CalloutCard';
import { getClasses, getCurriculumStats, searchCurriculum } from '../services/curriculumService';
import { useLearningProgress } from '../hooks/useLearningProgress';
import { RootStackParamList, MainTabParamList } from '../types/navigation';

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'Home'>,
  NativeStackScreenProps<RootStackParamList>
>;

export const DashboardScreen: React.FC<Props> = ({ navigation }) => {
  const { profile, bookmarks, selectActiveGrade } = useLearningProgress();
  const [searchQuery, setSearchQuery] = useState('');
  const classes = getClasses();
  const stats = getCurriculumStats();

  const activeClassId = profile?.activeClassId || 'class-8';
  const searchResults = searchQuery.trim() ? searchCurriculum(searchQuery) : [];

  const handleSelectClass = (classId: string) => {
    selectActiveGrade(classId);
    navigation.navigate('ClassSubjects', { classId });
  };

  const handleOpenChapter = (classId: string, subjectId: string, chapterId: string) => {
    navigation.navigate('ChapterDetails', { classId, subjectId, chapterId });
  };

  return (
    <View style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />
      <HeaderBar onProfilePress={() => navigation.navigate('Profile')} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Greeting & Study Streak */}
        <View style={styles.greetingSection}>
          <View style={styles.greetingTextContainer}>
            <Text style={styles.greetingTitle}>
              Good morning, {profile?.displayName?.split(' ')[0] || 'Aarav'}!
            </Text>
            <Text style={styles.greetingSubtitle}>
              What would you like to learn today?
            </Text>
          </View>

          <View style={styles.streakBadge}>
            <MaterialIcons
              name="local-fire-department"
              size={18}
              color={Colors.accentGoldDark}
            />
            <Text style={styles.streakText}>
              {profile?.streakDays || 5} Day Streak
            </Text>
          </View>
        </View>

        {/* Search Bar */}
        <View style={styles.searchSection}>
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
            <View style={styles.searchResultsBox}>
              <Text style={styles.searchResultsHeader}>SEARCH RESULTS</Text>
              {searchResults.slice(0, 5).map((item) => (
                <TouchableOpacity
                  key={`${item.type}-${item.id}`}
                  style={styles.searchResultItem}
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
                  <View style={styles.searchResultTextContainer}>
                    <Text style={styles.searchResultTitle}>{item.title}</Text>
                    <Text style={styles.searchResultSubtitle}>{item.subtitle}</Text>
                  </View>
                  <MaterialIcons name="chevron-right" size={16} color={Colors.textMuted} />
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Curriculum Overview / Stats Grid */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Curriculum Overview</Text>
          <View style={styles.pillBadge}>
            <Text style={styles.pillBadgeText}>AP SCERT 2026–27</Text>
          </View>
        </View>

        <View style={styles.statsGrid}>
          <View style={styles.statsRow}>
            <StatCard
              label="Total Classes"
              value={stats.totalClasses}
              badge="Grades 6–10"
              iconName="school"
            />
            <StatCard
              label="Total Subjects"
              value={stats.totalSubjects}
              subtitle="across syllabi"
              iconName="auto-stories"
            />
          </View>
          <View style={styles.statsRow}>
            <StatCard
              label="Total Chapters"
              value={stats.totalChapters}
              subtitle="topics"
              iconName="menu-book"
            />
            <StatCard
              label="Progress"
              value="68%"
              badge="Completed"
              iconName="insights"
              isProgress={true}
            />
          </View>
        </View>

        {/* 1st: Continue Learning Section (Immediate Action / Daily Habit) */}
        <View style={styles.sectionHeader}>
          <View style={styles.titleWithDot}>
            <Text style={styles.sectionTitle}>Continue Learning</Text>
            <View style={styles.orangeDot} />
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('MyLearning')}>
            <Text style={styles.linkText}>View All</Text>
          </TouchableOpacity>
        </View>

        {/* Lesson Card 1: Mathematics */}
        <HoverCard style={styles.continueCard} lift={-4}>
          <View style={styles.continueCardHeader}>
            <View style={styles.subjectIconBox}>
              <MaterialIcons name="calculate" size={24} color={Colors.primary} />
            </View>
            <View style={styles.continueCardTitleBox}>
              <View style={styles.continueBreadcrumb}>
                <Text style={styles.continueClassText}>Class 8 • Mathematics</Text>
                <View style={styles.unitChip}>
                  <Text style={styles.unitChipText}>Unit 1</Text>
                </View>
              </View>
              <Text style={styles.continueChapterTitle} numberOfLines={1}>
                Chapter 1: Rational Numbers
              </Text>
            </View>
            <TouchableOpacity
              onPress={() =>
                navigation.navigate('ChapterDetails', {
                  classId: 'class-8',
                  subjectId: 'c8-maths',
                  chapterId: 'c8-m-ch1',
                })
              }
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <MaterialIcons name="bookmark" size={20} color={Colors.primary} />
            </TouchableOpacity>
          </View>

          {/* Progress Tracker */}
          <View style={styles.progressTracker}>
            <View style={styles.progressRowLabels}>
              <Text style={styles.subtopicsCount}>6 of 8 subtopics complete</Text>
              <Text style={styles.progressNumber}>75%</Text>
            </View>
            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { width: '75%' }]} />
            </View>
          </View>

          <View style={styles.continueFooter}>
            <View style={styles.timeRemainingRow}>
              <MaterialIcons name="schedule" size={14} color={Colors.textMuted} />
              <Text style={styles.timeRemainingText}>15m remaining</Text>
            </View>
            <TouchableOpacity
              style={styles.continueButton}
              onPress={() =>
                handleOpenChapter('class-8', 'c8-maths', 'c8-m-ch1')
              }
              activeOpacity={0.85}
            >
              <Text style={styles.continueButtonText}>Continue</Text>
              <MaterialIcons name="play-arrow" size={16} color={Colors.white} />
            </TouchableOpacity>
          </View>
        </HoverCard>

        {/* Lesson Card 2: Science */}
        <HoverCard style={styles.continueCard} lift={-4}>
          <View style={styles.continueCardHeader}>
            <View style={styles.subjectIconBox}>
              <MaterialIcons name="science" size={24} color={Colors.primary} />
            </View>
            <View style={styles.continueCardTitleBox}>
              <View style={styles.continueBreadcrumb}>
                <Text style={styles.continueClassText}>Class 8 • Physical Science</Text>
                <View style={styles.unitChip}>
                  <Text style={styles.unitChipText}>Physics</Text>
                </View>
              </View>
              <Text style={styles.continueChapterTitle} numberOfLines={1}>
                Chapter 1: Force and Pressure
              </Text>
            </View>
            <TouchableOpacity
              onPress={() =>
                navigation.navigate('ChapterDetails', {
                  classId: 'class-8',
                  subjectId: 'c8-pscience',
                  chapterId: 'c8-ps-ch1',
                })
              }
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <MaterialIcons name="bookmark-border" size={20} color={Colors.textMuted} />
            </TouchableOpacity>
          </View>

          {/* Progress Tracker */}
          <View style={styles.progressTracker}>
            <View style={styles.progressRowLabels}>
              <Text style={styles.subtopicsCount}>2 of 5 modules completed</Text>
              <Text style={styles.progressNumber}>40%</Text>
            </View>
            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { width: '40%' }]} />
            </View>
          </View>

          <View style={styles.continueFooter}>
            <View style={styles.timeRemainingRow}>
              <MaterialIcons name="schedule" size={14} color={Colors.textMuted} />
              <Text style={styles.timeRemainingText}>28m remaining</Text>
            </View>
            <TouchableOpacity
              style={styles.continueButton}
              onPress={() =>
                handleOpenChapter('class-8', 'c8-pscience', 'c8-ps-ch1')
              }
              activeOpacity={0.85}
            >
              <Text style={styles.continueButtonText}>Continue</Text>
              <MaterialIcons name="play-arrow" size={16} color={Colors.white} />
            </TouchableOpacity>
          </View>
        </HoverCard>

        {/* 2nd: Select Your Class Section (Curriculum Exploration & Scope) */}
        <View style={styles.sectionHeaderWithSubtitle}>
          <View>
            <Text style={styles.sectionTitle}>Select Your Class</Text>
            <Text style={styles.sectionSubtitle}>Secondary Grades 6 to 10</Text>
          </View>
          <Text style={styles.headerMetaText}>SCERT AP Board</Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.classCardsScroll}
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

        {/* Recent Activity & Bookmarks Highlights */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Activity & Milestones</Text>
          <MaterialIcons name="history" size={20} color={Colors.textMuted} />
        </View>

        <View style={styles.milestonesCard}>
          {bookmarks.slice(0, 2).map((bm, index) => (
            <TouchableOpacity
              key={bm.id}
              style={[
                styles.bookmarkHighlightItem,
                index > 0 && styles.bookmarkItemBorder,
              ]}
              onPress={() =>
                handleOpenChapter(bm.classId, bm.subjectId, bm.chapterId)
              }
              activeOpacity={0.75}
            >
              <View style={styles.bookmarkIconCircle}>
                <MaterialIcons
                  name={bm.type === 'formula' ? 'functions' : 'auto-stories'}
                  size={18}
                  color={Colors.primary}
                />
              </View>
              <View style={styles.bookmarkInfo}>
                <View style={styles.bookmarkTopInfo}>
                  <Text style={styles.bookmarkSubtitle}>{bm.subtitle}</Text>
                  <Text style={styles.bookmarkTime}>Saved</Text>
                </View>
                <Text style={styles.bookmarkTitle}>{bm.title}</Text>
                {bm.previewText && (
                  <View style={styles.previewTagBox}>
                    <Text style={styles.previewTagText} numberOfLines={1}>
                      {bm.previewText}
                    </Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Daily Study Ritual Tip */}
        <CalloutCard
          variant="learning"
          title="Daily Study Ritual"
          description="Reviewing one bookmarked formula every morning increases retention by 40%."
        />
      </ScrollView>
      <BottomNav activeTab="Home" navigation={navigation} />
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
  greetingSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 4,
  },
  greetingTextContainer: {
    flex: 1,
  },
  greetingTitle: {
    fontFamily: 'Manrope_800ExtraBold',
    fontSize: 24,
    color: Colors.textPrimary,
    letterSpacing: -0.6,
  },
  greetingSubtitle: {
    fontFamily: 'Manrope_500Medium',
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.palePeach,
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: BorderRadius.pill,
    ...Shadows.subtle,
  },
  streakText: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 11,
    color: Colors.primaryDark,
  },
  searchSection: {
    position: 'relative',
    zIndex: 10,
  },
  searchResultsBox: {
    backgroundColor: Colors.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.sm,
    marginTop: 6,
    ...Shadows.subtle,
  },
  searchResultsHeader: {
    fontFamily: 'Manrope_800ExtraBold',
    fontSize: 10,
    color: Colors.textMuted,
    letterSpacing: 1,
    paddingHorizontal: 8,
    paddingBottom: 4,
  },
  searchResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 9,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  searchResultTextContainer: {
    flex: 1,
  },
  searchResultTitle: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 13,
    color: Colors.textPrimary,
  },
  searchResultSubtitle: {
    fontFamily: 'Manrope_500Medium',
    fontSize: 11,
    color: Colors.textSecondary,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  sectionHeaderWithSubtitle: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  sectionTitle: {
    fontFamily: 'Manrope_800ExtraBold',
    fontSize: 17,
    color: Colors.textPrimary,
    letterSpacing: -0.3,
  },
  sectionSubtitle: {
    fontFamily: 'Manrope_500Medium',
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  pillBadge: {
    backgroundColor: Colors.palePeach,
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 6,
  },
  pillBadgeText: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 11,
    color: Colors.primary,
  },
  headerMetaText: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 11,
    color: Colors.primary,
    marginTop: 2,
  },
  statsGrid: {
    gap: 10,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  classCardsScroll: {
    paddingVertical: 4,
  },
  titleWithDot: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  orangeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.primary,
  },
  linkText: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 12,
    color: Colors.primary,
  },
  continueCard: {
    backgroundColor: Colors.white,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 10,
    ...Shadows.subtle,
    ...(Platform.OS === 'web' && {
      transitionDuration: '220ms',
      transitionProperty: 'transform, box-shadow, border-color',
      transitionTimingFunction: 'cubic-bezier(0.2, 0, 0, 1)',
      cursor: 'pointer',
    } as any),
  },
  continueCardHovered: {
    transform: [{ translateY: -4 }],
    shadowColor: 'rgba(58, 45, 41, 0.14)',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.14,
    shadowRadius: 16,
    elevation: 6,
    borderColor: Colors.borderHover,
  },
  continueCardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  subjectIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: Colors.palePeach,
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueCardTitleBox: {
    flex: 1,
  },
  continueBreadcrumb: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  continueClassText: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 11,
    color: Colors.primary,
  },
  unitChip: {
    backgroundColor: Colors.softWarm,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  unitChipText: {
    fontFamily: 'Manrope_600SemiBold',
    fontSize: 10,
    color: Colors.textSecondary,
  },
  continueChapterTitle: {
    fontFamily: 'Manrope_800ExtraBold',
    fontSize: 15,
    color: Colors.textPrimary,
    marginTop: 2,
  },
  progressTracker: {
    gap: 6,
  },
  progressRowLabels: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  subtopicsCount: {
    fontFamily: 'Manrope_500Medium',
    fontSize: 11,
    color: Colors.textSecondary,
  },
  progressNumber: {
    fontFamily: 'Manrope_800ExtraBold',
    fontSize: 12,
    color: Colors.primary,
  },
  progressBarBg: {
    height: 5,
    borderRadius: 20,
    backgroundColor: '#f0e7e2',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 20,
    backgroundColor: Colors.primary,
  },
  continueFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 4,
  },
  timeRemainingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timeRemainingText: {
    fontFamily: 'Manrope_500Medium',
    fontSize: 11,
    color: Colors.textMuted,
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: BorderRadius.pill,
    ...Shadows.subtle,
  },
  continueButtonText: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 12,
    color: Colors.white,
  },
  milestonesCard: {
    backgroundColor: Colors.white,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.subtle,
  },
  bookmarkHighlightItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingVertical: 8,
  },
  bookmarkItemBorder: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 10,
  },
  bookmarkIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: Colors.palePeach,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  bookmarkInfo: {
    flex: 1,
  },
  bookmarkTopInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bookmarkSubtitle: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 11,
    color: Colors.primary,
  },
  bookmarkTime: {
    fontFamily: 'Manrope_500Medium',
    fontSize: 10,
    color: Colors.textMuted,
  },
  bookmarkTitle: {
    fontFamily: 'Manrope_800ExtraBold',
    fontSize: 14,
    color: Colors.textPrimary,
    marginTop: 1,
  },
  previewTagBox: {
    backgroundColor: Colors.softWarm,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginTop: 4,
  },
  previewTagText: {
    fontFamily: 'Manrope_500Medium',
    fontSize: 11,
    color: Colors.textSecondary,
  },
});
