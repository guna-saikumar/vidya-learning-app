import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import Colors from '../constants/colors';
import { HeaderBar } from '../components/navigation';
import { AnswerCard, DoubtStatusChip, SectionChip } from '../components/doubts';
import { useDoubtAuthor } from '../hooks/useDoubtAuthor';
import { getChapterById } from '../services/curriculumService';
import {
  getDoubtThread,
  postAnswer,
  resolveDoubt,
  toggleAnswerHelpful,
  toggleDoubtUpvote,
} from '../services/doubtService';
import {
  formatAnswerCount,
  formatRelativeTime,
  getDoubtStatus,
  sortAnswers,
} from '../utils/doubts';
import type { DoubtThread } from '../types/doubts';
import type { RootStackParamList } from '../types/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'DoubtThread'>;

export const DoubtThreadScreen: React.FC<Props> = ({ route, navigation }) => {
  const { chapterId, doubtId } = route.params;
  const me = useDoubtAuthor();
  const chapter = getChapterById(chapterId)?.chapter;

  const [thread, setThread] = useState<DoubtThread | undefined>();
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState('');

  const load = useCallback(async () => {
    const next = await getDoubtThread(doubtId);
    // Copy so React sees a change after the in-memory service mutates the object.
    setThread(next ? { ...next, answers: [...next.answers] } : undefined);
    setLoading(false);
  }, [doubtId]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  if (!thread) {
    return (
      <View className="flex-1 bg-white">
        <StatusBar barStyle="dark-content" />
        <HeaderBar showBack onBackPress={() => navigation.goBack()} title="Doubt" />
        {!loading && (
          <View className="p-6 items-center gap-2">
            <Text className="font-manrope-extrabold text-base text-textPrimary">Doubt not found</Text>
            <Text className="font-manrope-medium text-[13px] text-textSecondary text-center">
              It may have been removed. Go back to the list to see current doubts.
            </Text>
          </View>
        )}
      </View>
    );
  }

  const isOwner = thread.author.id === me.id;
  const answers = sortAnswers(thread.answers);
  const status = getDoubtStatus({
    isResolved: thread.isResolved,
    answerCount: thread.answers.length,
    hasTeacherAnswer: thread.answers.some((a) => a.author.role === 'teacher'),
  });
  const sectionTitle = thread.sectionId
    ? chapter?.sections.find((s) => s.id === thread.sectionId)?.title
    : undefined;
  const canPost = draft.trim().length > 0;

  const onPost = async () => {
    if (!canPost) return;
    await postAnswer(thread.id, draft, me);
    setDraft('');
    await load();
  };

  return (
    <View className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" />
      <HeaderBar
        showBack
        onBackPress={() => navigation.goBack()}
        title="Doubt"
        subtitle={chapter?.title}
        onProfilePress={() => navigation.navigate('Profile')}
      />

      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          className="flex-1"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 22, paddingTop: 18, paddingBottom: 40, gap: 16 }}
        >
          <View className="bg-white rounded-[20px] p-5 border border-border gap-3 shadow-sm">
            <View className="flex-row items-center justify-between gap-2">
              <DoubtStatusChip status={status} />
              <TouchableOpacity
                className={`flex-row items-center gap-1.5 px-3 h-11 rounded-xl border ${
                  thread.upvotedByMe ? 'bg-palePeach border-primary' : 'bg-white border-border'
                }`}
                onPress={async () => {
                  await toggleDoubtUpvote(thread.id);
                  await load();
                }}
                activeOpacity={0.8}
                accessibilityRole="button"
                accessibilityLabel={thread.upvotedByMe ? 'Remove upvote' : 'Upvote this doubt'}
                accessibilityState={{ selected: thread.upvotedByMe }}
              >
                <MaterialIcons
                  name="keyboard-arrow-up"
                  size={18}
                  color={thread.upvotedByMe ? Colors.primary : Colors.textSecondary}
                />
                <Text
                  className={`font-manrope-bold text-xs ${
                    thread.upvotedByMe ? 'text-primary' : 'text-textPrimary'
                  }`}
                >
                  {thread.upvoteCount}
                </Text>
              </TouchableOpacity>
            </View>

            <Text className="font-manrope-extrabold text-xl text-textPrimary leading-[27px] tracking-tight">
              {thread.title}
            </Text>
            <Text className="font-manrope-medium text-xs text-textMuted">
              {thread.author.name} asked {formatRelativeTime(thread.createdAt).toLowerCase()}
            </Text>
            {sectionTitle ? <SectionChip title={sectionTitle} /> : null}
            <Text className="font-manrope-medium text-sm text-textPrimary leading-[22px]">{thread.body}</Text>

            {isOwner && !thread.isResolved && (
              <TouchableOpacity
                className="flex-row items-center justify-center gap-2 h-11 rounded-xl border border-success bg-white"
                onPress={async () => {
                  await resolveDoubt(thread.id);
                  await load();
                }}
                activeOpacity={0.8}
                accessibilityRole="button"
                accessibilityLabel="Mark this doubt as resolved"
              >
                <MaterialIcons name="check-circle-outline" size={18} color={Colors.success} />
                <Text className="font-manrope-bold text-xs text-success">Mark as resolved</Text>
              </TouchableOpacity>
            )}
          </View>

          <Text className="font-manrope-extrabold text-base text-textPrimary tracking-tight">
            {formatAnswerCount(answers.length)}
          </Text>

          {answers.length === 0 ? (
            <View className="bg-surfaceSoft rounded-[20px] p-5 border border-border gap-1.5">
              <Text className="font-manrope-extrabold text-sm text-textPrimary">Be the first to answer</Text>
              <Text className="font-manrope-medium text-[13px] text-textSecondary leading-[19px]">
                Point to the step that helps, not just the final result.
              </Text>
            </View>
          ) : (
            answers.map((answer) => (
              <AnswerCard
                key={answer.id}
                answer={answer}
                onToggleHelpful={async () => {
                  await toggleAnswerHelpful(thread.id, answer.id);
                  await load();
                }}
                onAccept={
                  isOwner && !thread.isResolved
                    ? async () => {
                        await resolveDoubt(thread.id, answer.id);
                        await load();
                      }
                    : undefined
                }
              />
            ))
          )}

          <View className="gap-2.5 mt-1">
            <Text className="font-manrope-bold text-sm text-textPrimary">Your answer</Text>
            <TextInput
              className="border border-border rounded-xl px-3.5 py-3 font-manrope-medium text-sm text-textPrimary bg-white"
              style={{ minHeight: 104, textAlignVertical: 'top' }}
              placeholder="Explain the step, not just the result"
              placeholderTextColor={Colors.textPlaceholder}
              value={draft}
              onChangeText={setDraft}
              multiline
              accessibilityLabel="Your answer"
            />
            <TouchableOpacity
              className={`h-12 rounded-xl items-center justify-center ${
                canPost ? 'bg-primary' : 'bg-primaryLight'
              }`}
              onPress={onPost}
              disabled={!canPost}
              activeOpacity={0.85}
              accessibilityRole="button"
              accessibilityLabel="Post answer"
              accessibilityState={{ disabled: !canPost }}
            >
              <Text className="font-manrope-bold text-sm text-white">Post answer</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};
