import React, { useState, useMemo } from 'react';
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
import { SearchBar, PageIntro } from '../components/common';
import { SubjectCard, LearningProgressCard } from '../components/curriculum';
import { getClassById, getSubjectsByClass } from '../services/curriculumService';
import { useLearningProgress } from '../hooks/useLearningProgress';
import { RootStackParamList } from '../types/navigation';
import { SubjectCategory } from '../types/curriculum';

type Props = NativeStackScreenProps<RootStackParamList, 'Learn'>;

export const LearnScreen: React.FC<Props> = ({ navigation }) => {
  const { profile, progressMap } = useLearningProgress();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<SubjectCategory>('all');

  const activeClassId = profile?.activeClassId ?? '';
  const activeClass = getClassById(activeClassId);
  const subjects = getSubjectsByClass(activeClassId);

  const { totalChapters, completedChapters, progressPercent } = useMemo(() => {
    if (!activeClass) return { totalChapters: 0, completedChapters: 0, progressPercent: 0 };
    let total = 0;
    let completed = 0;
    activeClass.subjects.forEach((s) => {
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
  }, [activeClass, progressMap]);

  const filteredSubjects = useMemo(() => {
    return subjects.filter((s) => {
      const matchesCategory =
        selectedCategory === 'all' || s.category === selectedCategory;
      const matchesSearch =
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.description?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [subjects, selectedCategory, searchQuery]);

  const getSubjectProgress = (chapters: any[]) => {
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

    return {
      percent: Math.round(totalPercentSum / chapters.length),
      completed: completedCount,
    };
  };

  return (
    <View className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <HeaderBar
        onProfilePress={() => navigation.navigate('Profile')}
      />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 22, paddingTop: 18, paddingBottom: 48, gap: 20 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Page Heading */}
        <PageIntro
          eyebrow="AP STATE BOARD · SCERT 2026–27"
          badge={`${subjects.length} Subjects`}
          title="Curriculum"
        />

        {/* Enrolled Curriculum Banner (Personalized - No Class Switchers) */}
        <View className="bg-sand/35 rounded-3xl p-4 border border-sand/70">
          <View className="flex-row items-center justify-between">
            <View className="flex-1 mr-3">
              <View className="flex-row items-center gap-1.5 mb-1">
                <MaterialIcons name="school" size={14} color={Colors.primary} />
                <Text className="font-manrope-bold text-xs text-primary" numberOfLines={1}>
                  {profile?.schoolName || 'Enrolled School'}
                </Text>
              </View>
              <Text className="font-manrope-extrabold text-xl text-textPrimary tracking-tight">
                {activeClass?.title || 'Class 8'} · Section {profile?.section || 'A'}
              </Text>
              <Text className="font-manrope-medium text-xs text-textSecondary mt-1">
                {profile?.medium || 'English'} Medium · Roll #{profile?.rollNumber || '01'} · {profile?.location ? `${profile.location}, ` : ''}{profile?.district || 'Andhra Pradesh'}
              </Text>
            </View>
            <View className="w-11 h-11 rounded-2xl bg-palePeach items-center justify-center border border-primary/20">
              <MaterialIcons name="auto-stories" size={22} color={Colors.primary} />
            </View>
          </View>
        </View>

        {/* Learning Progress Card */}
        <LearningProgressCard
          mediumNote={`${profile?.medium || 'English'} medium · Progress across ${activeClass?.title || 'Class 8'}`}
          completedCount={completedChapters}
          totalCount={totalChapters}
          progressPercent={progressPercent}
        />

        {/* Search */}
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          onClear={() => setSearchQuery('')}
          placeholder={`Search ${activeClass?.title || 'Class'} subjects...`}
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
              All ({subjects.length})
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

        {/* Subjects Grid */}
        <View className="gap-2">
          <View className="flex-row items-center justify-between">
            <Text className="font-manrope-extrabold text-lg text-textPrimary tracking-tight">
              {activeClass?.title} Subjects
            </Text>
            <View className="bg-palePeach px-2.5 py-0.5 rounded-full border border-border/60">
              <Text className="font-manrope-bold text-xs text-primaryDark">
                {filteredSubjects.length} Available
              </Text>
            </View>
          </View>

          {filteredSubjects.length > 0 ? (
            filteredSubjects.map((subject) => {
              const { percent, completed } = getSubjectProgress(subject.chapters);
              return (
                <SubjectCard
                  key={subject.id}
                  subject={subject}
                  progressPercent={percent}
                  completedChaptersCount={completed}
                  onPress={() =>
                    navigation.navigate('SubjectIndex', {
                      classId: activeClassId,
                      subjectId: subject.id,
                    })
                  }
                />
              );
            })
          ) : (
            <View className="items-center justify-center py-10 gap-1.5">
              <MaterialIcons name="search-off" size={36} color={Colors.textMuted} />
              <Text className="font-manrope-medium text-xs text-textMuted">
                No subjects match your filter or search.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
      <BottomNav activeTab="Learn" navigation={navigation} />
    </View>
  );
};
