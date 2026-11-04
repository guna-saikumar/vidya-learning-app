import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { HeaderBar, BottomNav } from '../components/navigation';
import { SearchBar } from '../components/common';
import { SubjectCard, LearningProgressCard } from '../components/curriculum';
import { getClassById } from '../services/curriculumService';
import { useLearningProgress } from '../hooks/useLearningProgress';
import { RootStackParamList } from '../types/navigation';
import { SubjectCategory } from '../types/curriculum';

type Props = NativeStackScreenProps<RootStackParamList, 'ClassSubjects'>;

export const ClassSubjectsScreen: React.FC<Props> = ({ route, navigation }) => {
  const { classId } = route.params;
  const { progressMap, profile } = useLearningProgress();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<SubjectCategory>('all');

  const schoolClass = getClassById(classId);

  const { totalChapters, completedChapters, progressPercent } = useMemo(() => {
    if (!schoolClass) return { totalChapters: 0, completedChapters: 0, progressPercent: 0 };
    let total = 0;
    let completed = 0;
    schoolClass.subjects.forEach((s) => {
      s.chapters.forEach((ch) => {
        total++;
        if (progressMap[ch.id]?.completed) {
          completed++;
        }
      });
    });
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
    return {
      totalChapters: total,
      completedChapters: completed,
      progressPercent: percent,
    };
  }, [schoolClass, progressMap]);

  const filteredSubjects = useMemo(() => {
    if (!schoolClass) return [];
    return schoolClass.subjects.filter((s) => {
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
      <View className="flex-1 bg-white">
        <HeaderBar showBack onBackPress={() => navigation.goBack()} title="Subjects" />
        <View className="items-center justify-center py-10 gap-1.5">
          <Text className="font-manrope-medium text-sm text-textSecondary">Class curriculum not found.</Text>
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
    <View className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <HeaderBar
        showBack
        onBackPress={() => navigation.goBack()}
        title={schoolClass.title}
        subtitle={`${schoolClass.subjects.length} Subjects`}
        onProfilePress={() => navigation.navigate("Profile")}
      />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 22, paddingTop: 18, paddingBottom: 48, gap: 18 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Learning Progress Card as in reference image */}
        <LearningProgressCard
          mediumNote={`${profile?.medium || 'English'} medium · Choose a subject to browse its chapters and lessons.`}
          completedCount={completedChapters}
          totalCount={totalChapters}
          progressPercent={progressPercent}
        />

        {/* Subjects Header */}
        <View className="flex-row items-center justify-between pt-1">
          <Text className="font-manrope-extrabold text-xl text-textPrimary tracking-tight">
            Subjects
          </Text>
          <View className="bg-palePeach px-3 py-1 rounded-full border border-border/60">
            <Text className="font-manrope-bold text-xs text-primaryDark">
              {schoolClass.subjects.length} Subjects
            </Text>
          </View>
        </View>

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
          contentContainerStyle={{ flexDirection: 'row', gap: 8, paddingVertical: 2 }}
        >
          <TouchableOpacity
            className={`h-9 px-4 rounded-full items-center justify-center border ${
              selectedCategory === 'all'
                ? 'bg-primary border-primary'
                : 'bg-softWarm border-border'
            }`}
            onPress={() => setSelectedCategory('all')}
          >
            <Text
              className={`font-manrope-bold text-xs ${
                selectedCategory === 'all' ? 'text-white' : 'text-textSecondary'
              }`}
            >
              All ({schoolClass.subjects.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className={`h-9 px-4 rounded-full items-center justify-center border ${
              selectedCategory === 'stem'
                ? 'bg-primary border-primary'
                : 'bg-softWarm border-border'
            }`}
            onPress={() => setSelectedCategory('stem')}
          >
            <Text
              className={`font-manrope-bold text-xs ${
                selectedCategory === 'stem' ? 'text-white' : 'text-textSecondary'
              }`}
            >
              Science & Math
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className={`h-9 px-4 rounded-full items-center justify-center border ${
              selectedCategory === 'languages'
                ? 'bg-primary border-primary'
                : 'bg-softWarm border-border'
            }`}
            onPress={() => setSelectedCategory('languages')}
          >
            <Text
              className={`font-manrope-bold text-xs ${
                selectedCategory === 'languages' ? 'text-white' : 'text-textSecondary'
              }`}
            >
              Languages
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className={`h-9 px-4 rounded-full items-center justify-center border ${
              selectedCategory === 'social'
                ? 'bg-primary border-primary'
                : 'bg-softWarm border-border'
            }`}
            onPress={() => setSelectedCategory('social')}
          >
            <Text
              className={`font-manrope-bold text-xs ${
                selectedCategory === 'social' ? 'text-white' : 'text-textSecondary'
              }`}
            >
              Social Studies
            </Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Subjects List */}
        <View className="gap-0.5">
          {filteredSubjects.length > 0 ? (
            filteredSubjects.map((subject) => {
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
            <View className="items-center justify-center py-10 gap-1.5">
              <Text className="font-manrope-extrabold text-base text-textPrimary">No Subjects Found</Text>
              <Text className="font-manrope-medium text-xs text-textMuted">
                Try adjusting your search or category filter.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
      <BottomNav activeTab="Learn" navigation={navigation} />
    </View>
  );
};
