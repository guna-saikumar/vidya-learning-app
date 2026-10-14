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
import { SearchBar, PageIntro } from '../components/common';
import { ClassCard } from '../components/home';
import { SubjectCard } from '../components/curriculum';
import { getClasses, getSubjectsByClass } from '../services/curriculumService';
import { useLearningProgress } from '../hooks/useLearningProgress';
import { RootStackParamList } from '../types/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'Learn'>;

export const LearnScreen: React.FC<Props> = ({ navigation }) => {
  const { profile, progressMap, selectActiveGrade } = useLearningProgress();
  const classes = getClasses();
  const [searchQuery, setSearchQuery] = useState('');

  const activeClassId = profile?.activeClassId || 'class-8';
  const activeClass = classes.find((c) => c.id === activeClassId);
  const subjects = getSubjectsByClass(activeClassId);

  const filteredSubjects = subjects.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleClassSelect = (classId: string) => {
    selectActiveGrade(classId);
  };

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
      <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />
      <HeaderBar
        activeRoute="Learn"
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

        {/* Class Selector */}
        <View className="gap-2">
          <Text className="font-manrope-extrabold text-base text-textPrimary tracking-tight">
            Select Your Class
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 8 }}
          >
            {classes.map((c) => {
              const isSelected = c.id === activeClassId;
              return (
                <TouchableOpacity
                  key={c.id}
                  className={`px-5 py-3 rounded-2xl border ${
                    isSelected
                      ? 'bg-primary border-primary'
                      : 'bg-white border-border'
                  }`}
                  onPress={() => handleClassSelect(c.id)}
                  activeOpacity={0.8}
                >
                  <Text
                    className={`font-manrope-extrabold text-sm ${
                      isSelected ? 'text-white' : 'text-textPrimary'
                    }`}
                  >
                    {c.badge}
                  </Text>
                  <Text
                    className={`font-manrope-medium text-[11px] mt-0.5 ${
                      isSelected ? 'text-primaryLight' : 'text-textSecondary'
                    }`}
                  >
                    {c.subjects.length} Subjects
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Search */}
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          onClear={() => setSearchQuery('')}
          placeholder={`Search in ${activeClass?.title || 'Class'}...`}
        />

        {/* Subjects Grid */}
        <View className="gap-2">
          <View className="flex-row items-center justify-between">
            <Text className="font-manrope-extrabold text-base text-textPrimary tracking-tight">
              {activeClass?.title} Subjects
            </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('ClassSubjects', { classId: activeClassId })}
            >
              <Text className="font-manrope-bold text-[13px] text-primary">View All</Text>
            </TouchableOpacity>
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
                No subjects match your search.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
      <BottomNav activeTab="Learn" navigation={navigation} />
    </View>
  );
};
