import React, { useState, useEffect } from 'react';
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
import { CalloutCard } from '../components/common';
import { getChapterById } from '../services/curriculumService';
import { useLearningProgress } from '../hooks/useLearningProgress';
import { recordChapterVisit } from '../services/progressService';
import { RootStackParamList } from '../types/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'ChapterDetails'>;

export const ChapterDetailsScreen: React.FC<Props> = ({ route, navigation }) => {
  const { classId, subjectId, chapterId } = route.params;
  const {
    progressMap,
    bookmarks,
    handleToggleChapterCompletion,
    handleToggleBookmark,
  } = useLearningProgress();

  const [selectedQuizOption, setSelectedQuizOption] = useState<number | null>(null);
  const [showQuizResult, setShowQuizResult] = useState(false);

  const result = getChapterById(chapterId);
  const chapter = result?.chapter;
  const subject = result?.subject;
  const schoolClass = result?.schoolClass;

  const currentProgress = progressMap[chapterId];
  const isCompleted = currentProgress?.completed || false;
  const isBookmarked = bookmarks.some(
    (b) => b.chapterId === chapterId && b.type === 'chapter'
  );

  useEffect(() => {
    if (chapterId && classId && subjectId) {
      recordChapterVisit(classId, subjectId, chapterId);
    }
  }, [chapterId, classId, subjectId]);

  if (!chapter || !subject || !schoolClass) {
    return (
      <View className="flex-1 bg-white">
        <View className="h-14 flex-row items-center justify-between px-5 bg-white border-b border-border">
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <MaterialIcons name="arrow-back" size={24} color={Colors.textPrimary} />
          </TouchableOpacity>
          <Text className="font-manrope-bold text-sm text-textPrimary ml-2">Chapter not found</Text>
        </View>
      </View>
    );
  }

  const currentIndex = subject.chapters.findIndex((c) => c.id === chapterId);
  const prevChapter = currentIndex > 0 ? subject.chapters[currentIndex - 1] : null;
  const nextChapter =
    currentIndex < subject.chapters.length - 1
      ? subject.chapters[currentIndex + 1]
      : null;

  const onToggleDone = async () => {
    await handleToggleChapterCompletion(classId, subjectId, chapterId);
  };

  const onBookmark = async () => {
    await handleToggleBookmark({
      classId,
      subjectId,
      chapterId,
      title: `${chapter.title} Notes`,
      subtitle: `${schoolClass.title} • ${subject.name}`,
      type: 'chapter',
      previewText: chapter.description || chapter.title,
    });
  };

  const handleQuizSelect = (optionIndex: number) => {
    setSelectedQuizOption(optionIndex);
    setShowQuizResult(true);
  };

  return (
    <View className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      <HeaderBar
        showBack
        onBackPress={() => navigation.goBack()}
        title={chapter.title}
        subtitle={`${subject.name} • Chapter ${chapter.order}`}
        onProfilePress={() => navigation.navigate("Profile")}
        showBookmark
        isBookmarked={isBookmarked}
        onBookmarkPress={onBookmark}
        rightAction={
          <TouchableOpacity
            className={`flex-row items-center gap-1.5 px-3 py-1.5 rounded-full border ${
              isCompleted
                ? 'bg-success border-success'
                : 'bg-white border-success'
            }`}
            onPress={onToggleDone}
            activeOpacity={0.8}
          >
            <MaterialIcons
              name={isCompleted ? 'check' : 'radio-button-unchecked'}
              size={15}
              color={isCompleted ? Colors.white : Colors.success}
            />
            <Text
              className={`font-manrope-bold text-xs ${
                isCompleted ? 'text-white' : 'text-success'
              }`}
            >
              {isCompleted ? 'Done' : 'Mark Done'}
            </Text>
          </TouchableOpacity>
        }
      />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 22, paddingTop: 18, paddingBottom: 50, gap: 16 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Chapter Header Block */}
        <View className="gap-2">
          <View className="flex-row items-center gap-2">
            <Text className="font-manrope-semibold text-xs text-textSecondary">{schoolClass.title}</Text>
            <Text className="text-textMuted text-xs">•</Text>
            <Text className="font-manrope-semibold text-xs text-textSecondary">
              {chapter.sections.length} Sections
            </Text>
            <Text className="text-textMuted text-xs">•</Text>
            <Text
              className={`font-manrope-bold text-xs ${
                isCompleted ? 'text-success' : 'text-primary'
              }`}
            >
              {isCompleted ? 'Completed' : 'In Progress'}
            </Text>
          </View>
        </View>

        {/* Learning Objectives Box */}
        {chapter.learningGoals && chapter.learningGoals.length > 0 && (
          <View className="bg-palePeach rounded-[18px] p-5 border border-[#ead7cd] gap-2.5 my-1">
            <View className="flex-row items-center gap-2">
              <MaterialIcons name="auto-awesome" size={18} color={Colors.primary} />
              <Text className="font-manrope-extrabold text-base text-textPrimary">Learning objectives</Text>
            </View>
            <Text className="font-manrope-medium text-[13px] text-textSecondary leading-[18px]">
              By the end of this chapter, you will understand:
            </Text>
            <View className="gap-2 mt-1">
              {chapter.learningGoals.map((goal, idx) => (
                <View key={idx} className="flex-row items-start gap-2.5">
                  <View className="w-5 h-5 rounded-full bg-white items-center justify-center mt-0.5">
                    <Text className="font-manrope-bold text-[10px] text-primary">{idx + 1}</Text>
                  </View>
                  <Text className="font-manrope-medium text-[13px] text-textPrimary leading-[18px] flex-1">{goal}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Atmospheric Study Banner */}
        <View className="h-40 rounded-[20px] overflow-hidden my-1 relative" style={{ height: 160, width: '100%' }}>
          <Image
            source={require('../../assets/app-images/study_banner.png')}
            className="w-full h-full"
            style={{ width: '100%', height: 160 }}
            resizeMode="cover"
          />
          <View className="absolute inset-0 bg-black/30 justify-end p-4">
            <Text className="font-manrope-bold text-sm text-white">
              {chapter.unitName || 'Foundations of Modern Arithmetic'}
            </Text>
          </View>
        </View>

        {/* Detailed Sections */}
        {chapter.sections.map((section, idx) => (
          <View key={section.id} className="bg-white rounded-[20px] p-5 border border-border gap-3.5 my-1 shadow-sm">
            <TouchableOpacity
              className="flex-row items-center gap-3"
              onPress={() =>
                navigation.navigate('SectionDetails', {
                  classId,
                  subjectId,
                  chapterId,
                  sectionId: section.id,
                })
              }
              activeOpacity={0.8}
            >
              <View className="w-9 h-9 rounded-xl bg-palePeach items-center justify-center">
                <Text className="font-manrope-extrabold text-xs text-primary">
                  {chapter.order}.{idx + 1}
                </Text>
              </View>
              <Text className="font-manrope-extrabold text-base text-textPrimary flex-1 tracking-tight">{section.title}</Text>
              <MaterialIcons name="chevron-right" size={18} color={Colors.textMuted} />
            </TouchableOpacity>

            <Text className="font-manrope-medium text-sm text-textSecondary leading-[22px]">{section.content}</Text>

            {/* Special Formula / Axiom Callout if provided */}
            {section.keyAxiom && (
              <CalloutCard
                variant="example"
                title="FORMAL DEFINITION & IDENTITY"
                formulaText={section.keyAxiom}
                description={
                  section.summaryPoint ||
                  'Fundamental mathematical condition for this section.'
                }
                exampleBadges={['e.g. 2/3', '-5/8', '0 = 0/1', '7 = 7/1']}
              />
            )}
          </View>
        ))}

        {/* Core Algebraic Properties Bento Card */}
        <View className="my-2 gap-3">
          <Text className="font-manrope-extrabold text-base text-textPrimary tracking-tight">Core Algebraic Properties</Text>
          <View className="flex-row gap-3">
            <View className="flex-1 bg-surfaceSoft p-4 rounded-2xl border border-border gap-1.5">
              <Text className="font-manrope-bold text-xs text-primary uppercase tracking-wider">Addition</Text>
              <Text className="font-manrope-extrabold text-base text-textPrimary my-0.5">a/b + c/d ∈ ℚ</Text>
              <Text className="font-manrope-medium text-xs text-textSecondary">3/8 + (-5/7) = -19/56</Text>
            </View>
            <View className="flex-1 bg-surfaceSoft p-4 rounded-2xl border border-border gap-1.5">
              <Text className="font-manrope-bold text-xs text-primary uppercase tracking-wider">Multiplication</Text>
              <Text className="font-manrope-extrabold text-base text-textPrimary my-0.5">a/b × c/d ∈ ℚ</Text>
              <Text className="font-manrope-medium text-xs text-textSecondary">-2/3 × 4/5 = -8/15</Text>
            </View>
          </View>
        </View>

        {/* Critical Concept Check Tip */}
        <CalloutCard
          variant="learning"
          title="Critical Concept Check"
          description="Division by zero (a ÷ 0) is not defined in mathematics. Hence, rational numbers are not closed under division!"
        />

        {/* Interactive Quick Quiz / Concept Check */}
        {chapter.quiz && (
          <View className="bg-white rounded-[20px] p-5 border border-border gap-3.5 my-2 shadow-sm">
            <View className="flex-row items-center gap-2">
              <MaterialIcons name="help-outline" size={18} color={Colors.primary} />
              <Text className="font-manrope-extrabold text-xs text-primary tracking-wider uppercase">QUICK CONCEPT CHECK</Text>
            </View>
            <Text className="font-manrope-extrabold text-base text-textPrimary leading-[22px]">{chapter.quiz.question}</Text>

            <View className="gap-2.5">
              {chapter.quiz.options.map((opt, optIdx) => {
                const isSelected = selectedQuizOption === optIdx;
                const isCorrect = optIdx === chapter.quiz?.correctIndex;
                return (
                  <TouchableOpacity
                    key={optIdx}
                    className={`flex-row items-center justify-between p-3.5 rounded-xl border ${
                      showQuizResult && isCorrect
                        ? 'border-success bg-successBg'
                        : showQuizResult && isSelected && !isCorrect
                        ? 'border-error bg-errorBg'
                        : isSelected
                        ? 'border-primary bg-palePeach/40'
                        : 'border-border bg-white'
                    }`}
                    onPress={() => handleQuizSelect(optIdx)}
                    disabled={showQuizResult}
                    activeOpacity={0.8}
                  >
                    <Text
                      className={`font-manrope-medium text-sm flex-1 ${
                        showQuizResult && isCorrect
                          ? 'font-manrope-bold text-success'
                          : showQuizResult && isSelected && !isCorrect
                          ? 'font-manrope-bold text-error'
                          : 'text-textPrimary'
                      }`}
                    >
                      {opt}
                    </Text>
                    {showQuizResult && isCorrect && (
                      <MaterialIcons name="check" size={16} color={Colors.success} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>

            {showQuizResult && (
              <View className="bg-softWarm p-3 rounded-xl mt-1">
                <Text className="font-manrope-medium text-xs text-textSecondary leading-[18px]">
                  {chapter.quiz.explanation}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Big Mark Complete Button */}
        <TouchableOpacity
          className={`flex-row items-center justify-center gap-2 py-4 px-6 rounded-2xl shadow-sm ${
            isCompleted ? 'bg-success' : 'bg-primary'
          }`}
          onPress={onToggleDone}
          activeOpacity={0.88}
        >
          <MaterialIcons
            name={isCompleted ? 'check' : 'check-circle'}
            size={20}
            color={Colors.white}
          />
          <Text className="font-manrope-extrabold text-sm text-white">
            {isCompleted ? 'Chapter Completed' : 'Mark Chapter as Completed'}
          </Text>
        </TouchableOpacity>

        {/* Previous & Next Chapter Navigation */}
        <View className="gap-2.5 mt-2">
          {nextChapter ? (
            <TouchableOpacity
              className="bg-primaryDark p-5 rounded-2xl flex-row items-center justify-between shadow-sm"
              onPress={() =>
                navigation.navigate('ChapterDetails', {
                  classId,
                  subjectId,
                  chapterId: nextChapter.id,
                })
              }
              activeOpacity={0.88}
            >
              <View className="flex-1">
                <Text className="font-manrope-bold text-xs text-primaryLight uppercase tracking-wider">
                  Next Chapter • Ch 0{nextChapter.order}
                </Text>
                <Text className="font-manrope-extrabold text-base text-white tracking-tight mt-0.5">{nextChapter.title}</Text>
              </View>
              <MaterialIcons name="arrow-forward" size={22} color={Colors.white} />
            </TouchableOpacity>
          ) : (
            <View className="flex-row items-center justify-center gap-2 p-4 rounded-xl bg-successBg">
              <MaterialIcons name="celebration" size={20} color={Colors.success} />
              <Text className="font-manrope-bold text-xs text-success">
                You have reached the end of this syllabus!
              </Text>
            </View>
          )}

          {prevChapter ? (
            <TouchableOpacity
              className="flex-row items-center justify-center gap-2 py-3 px-4 rounded-xl border border-border bg-white mt-1"
              onPress={() =>
                navigation.navigate('ChapterDetails', {
                  classId,
                  subjectId,
                  chapterId: prevChapter.id,
                })
              }
              activeOpacity={0.8}
            >
              <MaterialIcons name="arrow-back" size={16} color={Colors.textSecondary} />
              <Text className="font-manrope-medium text-xs text-textSecondary">
                Previous: {prevChapter.title}
              </Text>
            </TouchableOpacity>
          ) : (
            <View className="flex-row items-center justify-center gap-2 py-2 mt-1">
              <MaterialIcons name="first-page" size={16} color={Colors.textMuted} />
              <Text className="font-manrope-medium text-xs text-textMuted">
                Start of Syllabus • First Chapter
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
      <BottomNav activeTab="Learn" navigation={navigation} />
    </View>
  );
};
