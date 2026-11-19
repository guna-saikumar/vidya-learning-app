import React, { useCallback, useMemo, useState } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, StatusBar } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import Colors from '../constants/colors';
import { HeaderBar } from '../components/navigation';
import { DoubtListItem } from '../components/doubts';
import { getChapterById } from '../services/curriculumService';
import { getCurrentUserId, listDoubts, toggleDoubtUpvote } from '../services/doubtService';
import { filterDoubts } from '../utils/doubts';
import type { DoubtFilter, DoubtSummary } from '../types/doubts';
import type { RootStackParamList } from '../types/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'Doubts'>;

const FILTERS: { key: DoubtFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'unanswered', label: 'Unanswered' },
  { key: 'mine', label: 'Mine' },
];

export const DoubtsScreen: React.FC<Props> = ({ route, navigation }) => {
  const { classId, subjectId, chapterId } = route.params;
  const chapter = getChapterById(chapterId)?.chapter;

  const [doubts, setDoubts] = useState<DoubtSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<DoubtFilter>('all');
  const [query, setQuery] = useState('');

  const load = useCallback(async () => {
    setDoubts(await listDoubts(chapterId));
    setLoading(false);
  }, [chapterId]);

  // Reload when returning from the thread or the ask screen.
  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const visible = useMemo(
    () => filterDoubts(doubts, filter, query, getCurrentUserId()),
    [doubts, filter, query]
  );

  const sectionTitle = (sectionId?: string) =>
    sectionId ? chapter?.sections.find((s) => s.id === sectionId)?.title : undefined;

  const openAsk = () => navigation.navigate('AskDoubt', { classId, subjectId, chapterId });

  const onUpvote = async (doubtId: string) => {
    await toggleDoubtUpvote(doubtId);
    await load();
  };

  const hasActiveFilter = filter !== 'all' || query.trim().length > 0;

  return (
    <View className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" />
      <HeaderBar
        showBack
        onBackPress={() => navigation.goBack()}
        title="Doubts"
        subtitle={chapter ? `${chapter.title}` : 'Chapter'}
        onProfilePress={() => navigation.navigate('Profile')}
      />

      <FlatList
        data={visible}
        keyExtractor={(item) => item.id}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 22, paddingTop: 18, paddingBottom: 50, gap: 14 }}
        ListHeaderComponent={
          <View className="gap-3.5 mb-1">
            <TouchableOpacity
              className="flex-row items-center justify-center gap-2 h-12 rounded-xl bg-primary"
              onPress={openAsk}
              activeOpacity={0.85}
              accessibilityRole="button"
              accessibilityLabel="Ask a doubt"
            >
              <MaterialIcons name="edit" size={18} color={Colors.white} />
              <Text className="font-manrope-bold text-sm text-white">Ask a doubt</Text>
            </TouchableOpacity>

            <View className="flex-row items-center gap-2 px-3.5 h-12 rounded-xl border border-border bg-white">
              <MaterialIcons name="search" size={20} color={Colors.textMuted} />
              <TextInput
                className="flex-1 font-manrope-medium text-sm text-textPrimary"
                placeholder="Search this chapter's doubts"
                placeholderTextColor={Colors.textPlaceholder}
                value={query}
                onChangeText={setQuery}
                returnKeyType="search"
                accessibilityLabel="Search doubts"
              />
              {query.length > 0 && (
                <TouchableOpacity
                  onPress={() => setQuery('')}
                  hitSlop={10}
                  accessibilityRole="button"
                  accessibilityLabel="Clear search"
                >
                  <MaterialIcons name="close" size={18} color={Colors.textMuted} />
                </TouchableOpacity>
              )}
            </View>

            <View className="flex-row gap-2">
              {FILTERS.map((f) => {
                const active = filter === f.key;
                return (
                  <TouchableOpacity
                    key={f.key}
                    className={`px-4 h-11 rounded-full border items-center justify-center ${
                      active ? 'bg-primary border-primary' : 'bg-white border-border'
                    }`}
                    onPress={() => setFilter(f.key)}
                    activeOpacity={0.8}
                    accessibilityRole="button"
                    accessibilityState={{ selected: active }}
                  >
                    <Text
                      className={`font-manrope-bold text-xs ${active ? 'text-white' : 'text-textPrimary'}`}
                    >
                      {f.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        }
        renderItem={({ item }) => (
          <DoubtListItem
            doubt={item}
            sectionTitle={sectionTitle(item.sectionId)}
            onPress={() =>
              navigation.navigate('DoubtThread', { classId, subjectId, chapterId, doubtId: item.id })
            }
            onUpvote={() => onUpvote(item.id)}
          />
        )}
        ListEmptyComponent={
          loading ? undefined : (
            <View className="bg-surfaceSoft rounded-[20px] p-6 border border-border items-center gap-2.5">
              <MaterialIcons name="forum" size={28} color={Colors.primary} />
              <Text className="font-manrope-extrabold text-base text-textPrimary text-center">
                {hasActiveFilter ? 'No doubts match' : 'No doubts on this chapter yet'}
              </Text>
              <Text className="font-manrope-medium text-[13px] text-textSecondary text-center leading-[19px]">
                {hasActiveFilter
                  ? 'Try a different search or switch the filter back to All.'
                  : 'If something in this chapter is unclear, ask it here and your teacher or classmates can answer.'}
              </Text>
            </View>
          )
        }
      />
    </View>
  );
};
