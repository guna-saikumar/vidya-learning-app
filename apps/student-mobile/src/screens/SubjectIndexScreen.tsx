import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Image,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MaterialIcons } from '@expo/vector-icons';
import Colors from '../constants/colors';
import { HeaderBar, BottomNav } from '../components/navigation';
import { SearchBar, HoverCard } from '../components/common';
import { ChapterListItem } from '../components/curriculum';
import { getSubjectById } from '../services/curriculumService';
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

  const filteredChapters = useMemo(() => {
    if (!subject) return [];

    return subject.chapters.filter((ch) => {
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
        ch.sections.some((s) => s.title.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchesFilter && matchesSearch;
    });
  }, [subject, progressMap, statusFilter, searchQuery]);

  if (!subject || !schoolClass) {
    return (
      <View className="flex-1 bg-white">
        <HeaderBar showBack onBackPress={() => navigation.goBack()} title="Subject Index" />
        <View className="items-center justify-center py-8 gap-1.5">
          <Text className="font-manrope-extrabold text-[15px] text-textPrimary">Subject not found</Text>
        </View>
      </View>
    );
  }

  const totalChaptersCount = subject.chapters.length;
  let completedCount = 0;
  let inProgressCount = 0;

  subject.chapters.forEach((ch) => {
    const p = progressMap[ch.id];
    if (p?.completed) completedCount++;
    else if ((p?.progressPercent || 0) > 0) inProgressCount++;
  });

  const unreadCount = totalChaptersCount - completedCount - inProgressCount;
  const completionPercent = Math.round((completedCount / Math.max(1, totalChaptersCount)) * 100);

  return (
    <View className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />
      <HeaderBar
        showBack
        onBackPress={() => navigation.goBack()}
        title={subject.name}
        subtitle={schoolClass.title}
        onProfilePress={() => navigation.navigate("Profile")}
      />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 22, paddingTop: 18, paddingBottom: 48, gap: 18 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Subject Overview Banner with Thumbnail & Progress */}
        <HoverCard className="bg-palePeach rounded-[20px] p-5 gap-3 border border-[#ead7cd] shadow-sm" lift={-3}>
          <View className="flex-row items-start justify-between">
            <View className="flex-1">
              <View className="flex-row items-center gap-1.5 mb-1">
                <MaterialIcons name="menu-book" size={16} color={Colors.primary} />
                <Text className="font-manrope-extrabold text-[11px] text-primary tracking-wide">
                  {schoolClass.title} Curriculum
                </Text>
              </View>
              <Text className="font-manrope-extrabold text-[22px] text-textPrimary tracking-tight">
                {subject.name}
              </Text>
            </View>

            <View className="w-12 h-12 rounded-[14px] bg-white overflow-hidden">
              <Image
                source={require('../../assets/app-images/math_banner.png')}
                className="w-full h-full"
                resizeMode="cover"
              />
            </View>
          </View>

          {/* Overall Subject Progress Card with Segmented Track */}
          <View className="bg-white rounded-2xl p-4 gap-2.5 border border-border">
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-1 bg-successBg px-2 py-0.5 rounded-full">
                <MaterialIcons name="check-circle" size={14} color={Colors.success} />
                <Text className="font-manrope-bold text-[11px] text-success">
                  {completionPercent}% Done
                </Text>
              </View>
              <Text className="font-manrope-semibold text-[11px] text-textSecondary">
                {completedCount} of {totalChaptersCount} Chapters
              </Text>
            </View>

            <View className="flex-row h-[5px] gap-[3px] rounded-full overflow-hidden">
              {subject.chapters.map((ch) => {
                const p = progressMap[ch.id];
                const isDone = p?.completed;
                const isInProg = !isDone && (p?.progressPercent || 0) > 0;
                return (
                  <View
                    key={ch.id}
                    className={`flex-1 h-full rounded-sm ${
                      isDone
                        ? 'bg-success'
                        : isInProg
                        ? 'bg-primary'
                        : 'bg-[#f0e7e2]'
                    }`}
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
          contentContainerStyle={{ flexDirection: 'row', gap: 8, paddingVertical: 2 }}
        >
          <TouchableOpacity
            className={`h-[34px] px-3.5 rounded-full items-center justify-center border ${
              statusFilter === 'all'
                ? 'bg-primary border-primary'
                : 'bg-softWarm border-border'
            }`}
            onPress={() => setStatusFilter('all')}
          >
            <Text
              className={`font-manrope-bold text-xs ${
                statusFilter === 'all' ? 'text-white' : 'text-textSecondary'
              }`}
            >
              All Chapters ({totalChaptersCount})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className={`h-[34px] px-3.5 rounded-full items-center justify-center border ${
              statusFilter === 'in-progress'
                ? 'bg-primary border-primary'
                : 'bg-softWarm border-border'
            }`}
            onPress={() => setStatusFilter('in-progress')}
          >
            <Text
              className={`font-manrope-bold text-xs ${
                statusFilter === 'in-progress' ? 'text-white' : 'text-textSecondary'
              }`}
            >
              In Progress ({inProgressCount})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className={`h-[34px] px-3.5 rounded-full items-center justify-center border ${
              statusFilter === 'completed'
                ? 'bg-primary border-primary'
                : 'bg-softWarm border-border'
            }`}
            onPress={() => setStatusFilter('completed')}
          >
            <Text
              className={`font-manrope-bold text-xs ${
                statusFilter === 'completed' ? 'text-white' : 'text-textSecondary'
              }`}
            >
              Completed ({completedCount})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className={`h-[34px] px-3.5 rounded-full items-center justify-center border ${
              statusFilter === 'unread'
                ? 'bg-primary border-primary'
                : 'bg-softWarm border-border'
            }`}
            onPress={() => setStatusFilter('unread')}
          >
            <Text
              className={`font-manrope-bold text-xs ${
                statusFilter === 'unread' ? 'text-white' : 'text-textSecondary'
              }`}
            >
              Unread ({unreadCount})
            </Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Chapter Table of Contents List */}
        <View className="gap-0.5">
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
                  onSectionPress={(sectionId: string) =>
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
            <View className="items-center justify-center py-8 gap-1.5">
              <Text className="font-manrope-extrabold text-[15px] text-textPrimary">No Chapters Found</Text>
              <Text className="font-manrope-medium text-xs text-textMuted">
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
