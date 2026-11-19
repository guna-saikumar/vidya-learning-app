import React, { useEffect, useMemo, useState } from 'react';
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
import { MaterialIcons } from '@expo/vector-icons';
import Colors from '../constants/colors';
import { HeaderBar } from '../components/navigation';
import { useDoubtAuthor } from '../hooks/useDoubtAuthor';
import { getChapterById } from '../services/curriculumService';
import { createDoubt, listDoubts } from '../services/doubtService';
import {
  DOUBT_TITLE_MAX,
  findSimilarDoubts,
  validateDoubtForm,
} from '../utils/doubts';
import type { DoubtSummary } from '../types/doubts';
import type { RootStackParamList } from '../types/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'AskDoubt'>;

export const AskDoubtScreen: React.FC<Props> = ({ route, navigation }) => {
  const { classId, subjectId, chapterId } = route.params;
  const me = useDoubtAuthor();
  const chapter = getChapterById(chapterId)?.chapter;

  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [sectionId, setSectionId] = useState<string | undefined>();
  const [existing, setExisting] = useState<DoubtSummary[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    listDoubts(chapterId).then(setExisting);
  }, [chapterId]);

  const similar = useMemo(() => findSimilarDoubts(title, existing), [title, existing]);
  const errors = validateDoubtForm(title, body);
  const hasErrors = Boolean(errors.title || errors.body);

  const onPost = async () => {
    setSubmitted(true);
    if (hasErrors || posting) return;
    setPosting(true);
    const thread = await createDoubt({ chapterId, sectionId, title, body }, me);
    navigation.replace('DoubtThread', { classId, subjectId, chapterId, doubtId: thread.id });
  };

  const inputClass =
    'border rounded-xl px-3.5 py-3 font-manrope-medium text-sm text-textPrimary bg-white';

  return (
    <View className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" />
      <HeaderBar
        showBack
        onBackPress={() => navigation.goBack()}
        title="Ask a doubt"
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
          contentContainerStyle={{ paddingHorizontal: 22, paddingTop: 18, paddingBottom: 40, gap: 18 }}
        >
          <View className="gap-1.5">
            <Text className="font-manrope-bold text-sm text-textPrimary">Title</Text>
            <TextInput
              className={`${inputClass} ${submitted && errors.title ? 'border-error' : 'border-border'}`}
              placeholder="What is the doubt, in one line?"
              placeholderTextColor={Colors.textPlaceholder}
              value={title}
              onChangeText={setTitle}
              maxLength={DOUBT_TITLE_MAX + 20}
              accessibilityLabel="Title"
            />
            <View className="flex-row justify-between gap-3">
              <Text className="font-manrope-medium text-xs text-error flex-1">
                {submitted && errors.title ? errors.title : ''}
              </Text>
              <Text className="font-manrope-medium text-xs text-textMuted">
                {title.length} / {DOUBT_TITLE_MAX}
              </Text>
            </View>
          </View>

          {similar.length > 0 && (
            <View className="bg-palePeach rounded-[18px] p-4 border border-[#ead7cd] gap-2">
              <View className="flex-row items-center gap-2">
                <MaterialIcons name="lightbulb-outline" size={18} color={Colors.primary} />
                <Text className="font-manrope-extrabold text-sm text-textPrimary">
                  Already asked? Check these first
                </Text>
              </View>
              {similar.map((d) => (
                <TouchableOpacity
                  key={d.id}
                  className="justify-center" style={{ minHeight: 44 }}
                  onPress={() =>
                    navigation.replace('DoubtThread', { classId, subjectId, chapterId, doubtId: d.id })
                  }
                  accessibilityRole="link"
                  accessibilityLabel={`Open doubt: ${d.title}`}
                >
                  <Text className="font-manrope-semibold text-[13px] text-primaryDark leading-[18px]">
                    {d.title}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {chapter && chapter.sections.length > 0 && (
            <View className="gap-2">
              <Text className="font-manrope-bold text-sm text-textPrimary">Which part is it about?</Text>
              <View className="flex-row flex-wrap gap-2">
                {[{ id: undefined, title: 'Whole chapter' }, ...chapter.sections].map((s) => {
                  const active = sectionId === s.id;
                  return (
                    <TouchableOpacity
                      key={s.id ?? 'chapter'}
                      className={`px-3.5 py-2 rounded-full border justify-center ${
                        active ? 'bg-palePeach border-primary' : 'bg-white border-border'
                      }`}
                      style={{ minHeight: 44 }}
                      onPress={() => setSectionId(s.id)}
                      activeOpacity={0.8}
                      accessibilityRole="button"
                      accessibilityState={{ selected: active }}
                    >
                      <Text
                        className={`font-manrope-bold text-xs ${active ? 'text-primary' : 'text-textPrimary'}`}
                        numberOfLines={1}
                      >
                        {s.title}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          )}

          <View className="gap-1.5">
            <Text className="font-manrope-bold text-sm text-textPrimary">Details</Text>
            <TextInput
              className={`${inputClass} ${submitted && errors.body ? 'border-error' : 'border-border'}`}
              style={{ minHeight: 120, textAlignVertical: 'top' }}
              placeholder="What did you try, and where did you get stuck?"
              placeholderTextColor={Colors.textPlaceholder}
              value={body}
              onChangeText={setBody}
              multiline
              accessibilityLabel="Details"
            />
            {submitted && errors.body ? (
              <Text className="font-manrope-medium text-xs text-error">{errors.body}</Text>
            ) : null}
          </View>

          <View className="flex-row gap-3">
            <TouchableOpacity
              className="flex-1 h-12 rounded-xl border border-border bg-white items-center justify-center"
              onPress={() => navigation.goBack()}
              activeOpacity={0.8}
              accessibilityRole="button"
            >
              <Text className="font-manrope-bold text-sm text-textPrimary">Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="flex-1 h-12 rounded-xl bg-primary items-center justify-center"
              onPress={onPost}
              disabled={posting}
              activeOpacity={0.85}
              accessibilityRole="button"
              accessibilityLabel="Post doubt"
            >
              <Text className="font-manrope-bold text-sm text-white">Post doubt</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};
