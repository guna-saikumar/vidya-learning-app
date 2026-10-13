import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MaterialIcons } from '@expo/vector-icons';
import Colors from '../../../../packages/design-tokens/src/colors';
import { Spacing, BorderRadius, Shadows } from '../../../../packages/design-tokens/src/spacing';
import { HeaderBar, BottomNav } from '../components/navigation';
import { SearchBar } from '../components/common';
import { SubjectCard } from '../components/curriculum';
import { getClassById } from '../../../../packages/curriculum/src/curriculum.service';
import { useLearningProgress } from '../hooks/useLearningProgress';
import { RootStackParamList } from '../types/navigation';
import { SubjectCategory, Subject } from '../../../../packages/curriculum/src/curriculum.types';

type Props = NativeStackScreenProps<RootStackParamList, 'ClassSubjects'>;

export const ClassSubjectsScreen: React.FC<Props> = ({ route, navigation }) => {
  const { classId } = route.params;
  const { progressMap } = useLearningProgress();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<SubjectCategory>('all');

  const schoolClass = getClassById(classId);

  const filteredSubjects = useMemo<Subject[]>(() => {
    if (!schoolClass) return [];
    return schoolClass.subjects.filter((s: Subject) => {
      const matchesCategory =
        selectedCategory === 'all' || s.category === selectedCategory;
      const matchesSearch =
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.description?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [schoolClass, selectedCategory, searchQuery]);

  if (!schoolClass) {
    return (
      <View style={styles.safeArea}>
        <HeaderBar showBack onBackPress={() => navigation.goBack()} title="Subjects" />
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Class curriculum not found.</Text>
        </View>
      </View>
    );
  }

  const getSubjectProgress = (subjectId: string, chapters: any[]) => {
    if (chapters.length === 0) return { percent: 0, completed: 0 };
    let completedCount = 0;
    let totalPercentSum = 0;

    chapters.forEach((ch) => {
      const p = progressMap[ch.id];
      if (p) {
        if (p.completed) completedCount++;
        totalPercentSum += p.progressPercent || 0;
      }
    });

    const avgPercent = Math.round(totalPercentSum / chapters.length);
    return {
      percent: avgPercent,
      completed: completedCount,
    };
  };

  return (
    <View style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />
      <HeaderBar
        showBack
        onBackPress={() => navigation.goBack()}
        title={`${schoolClass.title} Subjects`}
        subtitle={`${schoolClass.subjects.length} Enrolled`}
        onProfilePress={() => navigation.navigate("Profile")}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Search Bar */}
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          onClear={() => setSearchQuery('')}
          placeholder={`Search subjects in ${schoolClass.title}...`}
        />

        {/* Category Filter Pills */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.pillsScroll}
        >
          <TouchableOpacity
            style={[
              styles.pill,
              selectedCategory === 'all' && styles.pillActive,
            ]}
            onPress={() => setSelectedCategory('all')}
          >
            <Text
              style={[
                styles.pillText,
                selectedCategory === 'all' && styles.pillTextActive,
              ]}
            >
              All ({schoolClass.subjects.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.pill,
              selectedCategory === 'stem' && styles.pillActive,
            ]}
            onPress={() => setSelectedCategory('stem')}
          >
            <Text
              style={[
                styles.pillText,
                selectedCategory === 'stem' && styles.pillTextActive,
              ]}
            >
              Science & Math
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.pill,
              selectedCategory === 'languages' && styles.pillActive,
            ]}
            onPress={() => setSelectedCategory('languages')}
          >
            <Text
              style={[
                styles.pillText,
                selectedCategory === 'languages' && styles.pillTextActive,
              ]}
            >
              Languages
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.pill,
              selectedCategory === 'social' && styles.pillActive,
            ]}
            onPress={() => setSelectedCategory('social')}
          >
            <Text
              style={[
                styles.pillText,
                selectedCategory === 'social' && styles.pillTextActive,
              ]}
            >
              Social Studies
            </Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Subjects List */}
        <View style={styles.subjectsList}>
          {filteredSubjects.length > 0 ? (
            filteredSubjects.map((subject: Subject) => {
              const { percent, completed } = getSubjectProgress(
                subject.id,
                subject.chapters
              );
              return (
                <SubjectCard
                  key={subject.id}
                  subject={subject}
                  progressPercent={percent}
                  completedChaptersCount={completed}
                  onPress={() =>
                    navigation.navigate('SubjectIndex', {
                      classId: schoolClass.id,
                      subjectId: subject.id,
                    })
                  }
                />
              );
            })
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyTitle}>No Subjects Found</Text>
              <Text style={styles.emptySubtitle}>
                Try adjusting your search or category filter.
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
  bannerContainer: {
    backgroundColor: Colors.palePeach,
    borderRadius: 20,
    padding: 16,
    gap: 6,
    borderWidth: 1,
    borderColor: '#ead7cd',
  },
  bannerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  backLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  backLinkText: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 12,
    color: Colors.primary,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.white,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.pill,
  },
  verifiedBadgeText: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 10,
    color: Colors.primary,
  },
  bannerTitle: {
    fontFamily: 'Manrope_800ExtraBold',
    fontSize: 20,
    color: Colors.textPrimary,
  },
  bannerSubtitle: {
    fontFamily: 'Manrope_500Medium',
    fontSize: 12,
    color: Colors.textSecondary,
  },
  helperNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 10,
    gap: 8,
    marginTop: 6,
  },
  helperNoticeText: {
    fontFamily: 'Manrope_500Medium',
    fontSize: 12,
    color: Colors.textSecondary,
    flex: 1,
    lineHeight: 16,
  },
  helperNoticeBold: {
    fontFamily: 'Manrope_700Bold',
    color: Colors.primary,
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
  subjectsList: {
    gap: 2,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    gap: 6,
  },
  emptyText: {
    fontFamily: 'Manrope_500Medium',
    fontSize: 14,
    color: Colors.textSecondary,
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
  },
});
