import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Image,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MaterialIcons } from '@expo/vector-icons';
import Colors from '../../../../packages/design-tokens/src/colors';
import { Spacing, BorderRadius, Shadows } from '../../../../packages/design-tokens/src/spacing';
import { HeaderBar, BottomNav } from '../components/navigation';
import { SearchBar, HoverCard } from '../components/common';
import { ChapterListItem } from '../components/curriculum';
import { getSubjectById } from '../../../../packages/curriculum/src/curriculum.service';
import { Chapter, Section } from '../../../../packages/curriculum/src/curriculum.types';
import { useLearningProgress } from '../hooks/useLearningProgress';
import { RootStackParamList } from '../types/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'SubjectIndex'>;
type FilterStatus = 'all' | 'in-progress' | 'completed' | 'unread';

export const SubjectIndexScreen: React.FC<Props> = ({ route, navigation }) => {
  const { classId, subjectId } = route.params;
  const { progressMap } = useLearningProgress();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('all');

  const result = getSubjectById(subjectId);
  const subject = result?.subject;
  const schoolClass = result?.schoolClass;

  const filteredChapters = useMemo<Chapter[]>(() => {
    if (!subject) return [];

    return subject.chapters.filter((ch: Chapter) => {
      const p = progressMap[ch.id];
      const isCompleted = p?.completed || false;
      const isInProgress = !isCompleted && (p?.progressPercent || 0) > 0;
      const isUnread = !isCompleted && !isInProgress;

      let matchesFilter = true;
      if (statusFilter === 'completed') matchesFilter = isCompleted;
      if (statusFilter === 'in-progress') matchesFilter = isInProgress;
      if (statusFilter === 'unread') matchesFilter = isUnread;

      const matchesSearch =
        ch.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ch.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ch.sections.some((s: Section) => s.title.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchesFilter && matchesSearch;
    });
  }, [subject, progressMap, statusFilter, searchQuery]);

  if (!subject || !schoolClass) {
    return (
      <View style={styles.safeArea}>
        <HeaderBar showBack onBackPress={() => navigation.goBack()} title="Subject Index" />
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>Subject not found</Text>
        </View>
      </View>
    );
  }

  const totalChaptersCount = subject.chapters.length;
  let completedCount = 0;
  let inProgressCount = 0;

  subject.chapters.forEach((ch: Chapter) => {
    const p = progressMap[ch.id];
    if (p?.completed) completedCount++;
    else if ((p?.progressPercent || 0) > 0) inProgressCount++;
  });

  const unreadCount = totalChaptersCount - completedCount - inProgressCount;
  const completionPercent = Math.round((completedCount / Math.max(1, totalChaptersCount)) * 100);

  return (
    <View style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />
      <HeaderBar
        showBack
        onBackPress={() => navigation.goBack()}
        title={`${subject.name} Index`}
        subtitle={`${schoolClass.title} • Table of Contents`}
        onProfilePress={() => navigation.navigate("Profile")}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Subject Overview Banner with Thumbnail & Progress */}
        <HoverCard style={styles.overviewBanner} lift={-3}>
          <View style={styles.bannerHeader}>
            <View style={styles.bannerTitleGroup}>
              <View style={styles.curriculumTag}>
                <MaterialIcons name="menu-book" size={16} color={Colors.primary} />
                <Text style={styles.curriculumTagText}>SCERT AP Syllabus · 2026–2027</Text>
              </View>
              <Text style={styles.bannerTitle}>Chapter Roadmap</Text>
            </View>

            <View style={styles.bannerThumbnailBox}>
              <Image
                source={require('../../assets/app-images/math_banner.png')}
                style={styles.bannerThumbnail}
              />
            </View>
          </View>

          {/* Overall Subject Progress Card with Segmented Track */}
          <View style={styles.progressCard}>
            <View style={styles.progressCardHeader}>
              <View style={styles.progressDoneBadge}>
                <MaterialIcons name="check-circle" size={14} color={Colors.success} />
                <Text style={styles.progressDoneText}>
                  {completionPercent}% Done
                </Text>
              </View>
              <Text style={styles.progressFractionText}>
                {completedCount} of {totalChaptersCount} Chapters
              </Text>
            </View>

            <View style={styles.segmentedTrack}>
              {subject.chapters.map((ch: Chapter) => {
                const p = progressMap[ch.id];
                const isDone = p?.completed;
                const isInProg = !isDone && (p?.progressPercent || 0) > 0;
                return (
                  <View
                    key={ch.id}
                    style={[
                      styles.segment,
                      isDone
                        ? styles.segmentDone
                        : isInProg
                        ? styles.segmentInProgress
                        : styles.segmentUnread,
                    ]}
                  />
                );
              })}
            </View>
          </View>
        </HoverCard>

        {/* Search Bar */}
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          onClear={() => setSearchQuery('')}
          placeholder="Search chapter title or topic..."
        />

        {/* Quick Filter Pills */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.pillsScroll}
        >
          <TouchableOpacity
            style={[styles.pill, statusFilter === 'all' && styles.pillActive]}
            onPress={() => setStatusFilter('all')}
          >
            <Text
              style={[
                styles.pillText,
                statusFilter === 'all' && styles.pillTextActive,
              ]}
            >
              All Chapters ({totalChaptersCount})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.pill, statusFilter === 'in-progress' && styles.pillActive]}
            onPress={() => setStatusFilter('in-progress')}
          >
            <Text
              style={[
                styles.pillText,
                statusFilter === 'in-progress' && styles.pillTextActive,
              ]}
            >
              In Progress ({inProgressCount})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.pill, statusFilter === 'completed' && styles.pillActive]}
            onPress={() => setStatusFilter('completed')}
          >
            <Text
              style={[
                styles.pillText,
                statusFilter === 'completed' && styles.pillTextActive,
              ]}
            >
              Completed ({completedCount})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.pill, statusFilter === 'unread' && styles.pillActive]}
            onPress={() => setStatusFilter('unread')}
          >
            <Text
              style={[
                styles.pillText,
                statusFilter === 'unread' && styles.pillTextActive,
              ]}
            >
              Unread ({unreadCount})
            </Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Chapter Table of Contents List */}
        <View style={styles.chaptersList}>
          {filteredChapters.length > 0 ? (
            filteredChapters.map((chapter) => {
              const p = progressMap[chapter.id];
              return (
                <ChapterListItem
                  key={chapter.id}
                  chapter={chapter}
                  isCompleted={p?.completed || false}
                  progressPercent={p?.progressPercent || 0}
                  onPress={() =>
                    navigation.navigate('ChapterDetails', {
                      classId,
                      subjectId,
                      chapterId: chapter.id,
                    })
                  }
                  onSectionPress={(sectionId) =>
                    navigation.navigate('SectionDetails', {
                      classId,
                      subjectId,
                      chapterId: chapter.id,
                      sectionId,
                    })
                  }
                />
              );
            })
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyTitle}>No Chapters Found</Text>
              <Text style={styles.emptySubtitle}>
                No chapters matching your filter or query.
              </Text>
            </View>
          )}
        </View>
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
    paddingTop: 12,
    paddingBottom: 40,
    gap: 16,
  },
  breadcrumbRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 2,
  },
  backToSubjects: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  backToSubjectsText: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 12,
    color: Colors.primary,
  },
  breadcrumbBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.palePeach,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BorderRadius.pill,
    gap: 4,
  },
  breadcrumbClassText: {
    fontFamily: 'Manrope_600SemiBold',
    fontSize: 11,
    color: Colors.textSecondary,
  },
  breadcrumbSubjectText: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 11,
    color: Colors.primary,
  },
  overviewBanner: {
    backgroundColor: Colors.palePeach,
    borderRadius: 20,
    padding: 16,
    gap: 10,
    borderWidth: 1,
    borderColor: '#ead7cd',
    ...Shadows.subtle,
  },
  bannerHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  bannerTitleGroup: {
    flex: 1,
  },
  curriculumTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  curriculumTagText: {
    fontFamily: 'Manrope_800ExtraBold',
    fontSize: 10,
    color: Colors.primary,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  bannerTitle: {
    fontFamily: 'Manrope_800ExtraBold',
    fontSize: 20,
    color: Colors.textPrimary,
  },
  bannerThumbnailBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: Colors.white,
    overflow: 'hidden',
  },
  bannerThumbnail: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  bannerDescription: {
    fontFamily: 'Manrope_500Medium',
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  progressCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  progressCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  progressDoneBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.successBg,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BorderRadius.pill,
  },
  progressDoneText: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 11,
    color: Colors.success,
  },
  progressFractionText: {
    fontFamily: 'Manrope_600SemiBold',
    fontSize: 11,
    color: Colors.textSecondary,
  },
  segmentedTrack: {
    flexDirection: 'row',
    height: 5,
    gap: 3,
    borderRadius: 20,
    overflow: 'hidden',
  },
  segment: {
    flex: 1,
    height: '100%',
    borderRadius: 2,
  },
  segmentDone: {
    backgroundColor: Colors.success,
  },
  segmentInProgress: {
    backgroundColor: Colors.primary,
  },
  segmentUnread: {
    backgroundColor: '#f0e7e2',
  },
  pillsScroll: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 2,
  },
  pill: {
    height: 34,
    paddingHorizontal: 14,
    borderRadius: BorderRadius.pill,
    backgroundColor: Colors.softWarm,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  pillText: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 12,
    color: Colors.textSecondary,
  },
  pillTextActive: {
    color: Colors.white,
  },
  chaptersList: {
    gap: 2,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 30,
    gap: 6,
  },
  emptyTitle: {
    fontFamily: 'Manrope_800ExtraBold',
    fontSize: 15,
    color: Colors.textPrimary,
  },
  emptySubtitle: {
    fontFamily: 'Manrope_500Medium',
    fontSize: 12,
    color: Colors.textMuted,
  },
});
