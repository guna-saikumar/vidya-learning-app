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
import { HeaderBar, BottomNav } from '../components/navigation';
import { StatCard, ClassCard } from '../components/home';
import { SearchBar, HoverCard, CalloutCard } from '../components/common';
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
          <Text style={styles.sectionTitle}>Overview</Text>
        </View>

        <View style={styles.statsGrid}>
          <View style={styles.statsRow}>
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
          <View style={styles.statsRow}>
            <StatCard
              label="Chapters"
              value={stats.totalChapters}
              iconName="menu-book"
            />
            <StatCard
              label="Completed"
              value="68%"
              iconName="insights"
              isProgress={true}
            />
          </View>
        </View>

        {/* Continue Learning Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Continue Learning</Text>
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
              <Text style={styles.continueClassText}>Mathematics • Class 8</Text>
              <Text style={styles.continueChapterTitle} numberOfLines={1}>
                Rational Numbers
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
              <Text style={styles.subtopicsCount}>6 of 8 topics completed</Text>
              <Text style={styles.progressNumber}>75%</Text>
            </View>
            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { width: '75%' }]} />
            </View>
          </View>

          <View style={styles.continueFooter}>
            <View style={styles.timeRemainingRow}>
              <MaterialIcons name="schedule" size={14} color={Colors.textMuted} />
              <Text style={styles.timeRemainingText}>15 mins left</Text>
            </View>
            <TouchableOpacity
              style={styles.continueButton}
              onPress={() =>
                handleOpenChapter('class-8', 'c8-maths', 'c8-m-ch1')
              }
              activeOpacity={0.85}
            >
              <Text style={styles.continueButtonText}>Resume</Text>
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
              <Text style={styles.continueClassText}>Physical Science • Class 8</Text>
              <Text style={styles.continueChapterTitle} numberOfLines={1}>
                Force and Pressure
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
              <Text style={styles.subtopicsCount}>2 of 5 topics completed</Text>
              <Text style={styles.progressNumber}>40%</Text>
            </View>
            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { width: '40%' }]} />
            </View>
          </View>

          <View style={styles.continueFooter}>
            <View style={styles.timeRemainingRow}>
              <MaterialIcons name="schedule" size={14} color={Colors.textMuted} />
              <Text style={styles.timeRemainingText}>28 mins left</Text>
            </View>
            <TouchableOpacity
              style={styles.continueButton}
              onPress={() =>
                handleOpenChapter('class-8', 'c8-pscience', 'c8-ps-ch1')
              }
              activeOpacity={0.85}
            >
              <Text style={styles.continueButtonText}>Resume</Text>
              <MaterialIcons name="play-arrow" size={16} color={Colors.white} />
            </TouchableOpacity>
          </View>
        </HoverCard>

        {/* Select Class Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Classes</Text>
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

        {/* Saved Bookmarks */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Saved Bookmarks</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Bookmarks')}>
            <Text style={styles.linkText}>View All</Text>
          </TouchableOpacity>
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

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 22,
    paddingTop: 20,
    paddingBottom: 50,
    gap: 24,
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
    gap: 5,
    backgroundColor: Colors.palePeach,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BorderRadius.pill,
    ...Shadows.subtle,
  },
  streakText: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 12,
    color: Colors.primaryDark,
  },
  searchSection: {
    position: 'relative',
    zIndex: 10,
  },
  searchResultsBox: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.sm,
    marginTop: 6,
    ...Shadows.subtle,
  },
  searchResultsHeader: {
    fontFamily: 'Manrope_800ExtraBold',
    fontSize: 11,
    color: Colors.textMuted,
    paddingHorizontal: 8,
    paddingBottom: 4,
  },
  searchResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
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
  },
  sectionTitle: {
    fontFamily: 'Manrope_800ExtraBold',
    fontSize: 18,
    color: Colors.textPrimary,
    letterSpacing: -0.4,
  },
  statsGrid: {
    gap: 12,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  classCardsScroll: {
    paddingVertical: 4,
  },
  linkText: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 13,
    color: Colors.primary,
  },
  continueCard: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 14,
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
    gap: 14,
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
  continueClassText: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 12,
    color: Colors.primary,
  },
  continueChapterTitle: {
    fontFamily: 'Manrope_800ExtraBold',
    fontSize: 16,
    color: Colors.textPrimary,
    marginTop: 3,
    letterSpacing: -0.3,
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
    fontSize: 12,
    color: Colors.textSecondary,
  },
  progressNumber: {
    fontFamily: 'Manrope_800ExtraBold',
    fontSize: 12,
    color: Colors.primary,
  },
  progressBarBg: {
    height: 6,
    borderRadius: 20,
    backgroundColor: '#F3EDE9',
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
    gap: 5,
  },
  timeRemainingText: {
    fontFamily: 'Manrope_500Medium',
    fontSize: 12,
    color: Colors.textMuted,
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.primary,
    paddingHorizontal: 18,
    paddingVertical: 9,
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
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.subtle,
  },
  bookmarkHighlightItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
    paddingVertical: 10,
  },
  bookmarkItemBorder: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 12,
  },
  bookmarkIconCircle: {
    width: 38,
    height: 38,
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
    fontSize: 12,
    color: Colors.primary,
  },
  bookmarkTime: {
    fontFamily: 'Manrope_500Medium',
    fontSize: 11,
    color: Colors.textMuted,
  },
  bookmarkTitle: {
    fontFamily: 'Manrope_800ExtraBold',
    fontSize: 15,
    color: Colors.textPrimary,
    marginTop: 2,
    letterSpacing: -0.2,
  },
  previewTagBox: {
    backgroundColor: Colors.softWarm,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    marginTop: 6,
  },
  previewTagText: {
    fontFamily: 'Manrope_500Medium',
    fontSize: 11,
    color: Colors.textSecondary,
  },
});
