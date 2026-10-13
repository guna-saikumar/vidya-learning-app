import React, { useState, useEffect } from 'react';
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
import { CalloutCard } from '../components/common';
import { HeaderBar, BottomNav } from '../components/navigation';
import { getChapterById } from '../../../../packages/curriculum/src/curriculum.service';
import { Chapter, Section } from '../../../../packages/curriculum/src/curriculum.types';
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
      <View style={styles.safeArea}>
        <View style={styles.subNavBar}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <MaterialIcons name="arrow-back" size={24} color={Colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.subNavBarTitle}>Chapter not found</Text>
        </View>
      </View>
    );
  }

  const currentIndex = subject.chapters.findIndex((c: Chapter) => c.id === chapterId);
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
    <View style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />

      <HeaderBar
        showBack
        onBackPress={() => navigation.goBack()}
        title={chapter.title}
        subtitle={`${schoolClass.title} • ${subject.name} • Ch ${chapter.order}`}
        onProfilePress={() => navigation.navigate("Profile")}
        showBookmark
        isBookmarked={isBookmarked}
        onBookmarkPress={onBookmark}
        rightAction={
          <TouchableOpacity
            style={[
              styles.donePillButton,
              isCompleted && styles.donePillButtonCompleted,
            ]}
            onPress={onToggleDone}
            activeOpacity={0.8}
          >
            <MaterialIcons
              name={isCompleted ? 'check' : 'radio-button-unchecked'}
              size={15}
              color={isCompleted ? Colors.white : Colors.success}
            />
            <Text
              style={[
                styles.donePillText,
                isCompleted && styles.donePillTextCompleted,
              ]}
            >
              {isCompleted ? 'Done' : 'Mark Done'}
            </Text>
          </TouchableOpacity>
        }
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Chapter Header Block */}
        <View style={styles.headerBlock}>
          <View style={styles.metaRow}>
            <Text style={styles.metaText}>{schoolClass.title}</Text>
            <Text style={styles.metaBullet}>•</Text>
            <Text style={styles.metaText}>
              {chapter.sections.length} Sections
            </Text>
            <Text style={styles.metaBullet}>•</Text>
            <Text
              style={[
                styles.metaStatusText,
                isCompleted && styles.metaStatusCompleted,
              ]}
            >
              {isCompleted ? 'Completed' : 'In Progress'}
            </Text>
          </View>
        </View>

        {/* Learning Objectives Box */}
        {chapter.learningGoals && chapter.learningGoals.length > 0 && (
          <View style={styles.goalsContainer}>
            <View style={styles.goalsTitleRow}>
              <MaterialIcons name="auto-awesome" size={18} color={Colors.primary} />
              <Text style={styles.goalsTitle}>Learning objectives</Text>
            </View>
            <Text style={styles.goalsIntro}>
              By the end of this chapter, you will understand:
            </Text>
            <View style={styles.goalsList}>
              {chapter.learningGoals.map((goal: string, idx: number) => (
                <View key={idx} style={styles.goalItem}>
                  <View style={styles.goalNumber}>
                    <Text style={styles.goalNumberText}>{idx + 1}</Text>
                  </View>
                  <Text style={styles.goalItemText}>{goal}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Atmospheric Study Banner */}
        <View style={styles.bannerContainer}>
          <Image
            source={require('../../assets/app-images/study_banner.png')}
            style={styles.bannerImage}
          />
          <View style={styles.bannerOverlay}>
            <Text style={styles.bannerCaption}>
              {chapter.unitName || 'Foundations of Modern Arithmetic'}
            </Text>
          </View>
        </View>

        {/* Detailed Sections */}
        {chapter.sections.map((section: Section, idx: number) => (
          <View key={section.id} style={styles.sectionBlock}>
            <TouchableOpacity
              style={styles.sectionHeaderClickable}
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
              <View style={styles.sectionOrderBadge}>
                <Text style={styles.sectionOrderText}>
                  {chapter.order}.{idx + 1}
                </Text>
              </View>
              <Text style={styles.sectionTitle}>{section.title}</Text>
              <MaterialIcons name="chevron-right" size={18} color={Colors.textMuted} />
            </TouchableOpacity>

            <Text style={styles.sectionBodyText}>{section.content}</Text>

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
        <View style={styles.bentoSection}>
          <Text style={styles.bentoHeader}>Core Algebraic Properties</Text>
          <View style={styles.bentoGrid}>
            <View style={styles.bentoBox}>
              <Text style={styles.bentoPropertyTitle}>Addition</Text>
              <Text style={styles.bentoFormula}>a/b + c/d ∈ ℚ</Text>
              <Text style={styles.bentoExample}>3/8 + (-5/7) = -19/56</Text>
            </View>
            <View style={styles.bentoBox}>
              <Text style={styles.bentoPropertyTitle}>Multiplication</Text>
              <Text style={styles.bentoFormula}>a/b × c/d ∈ ℚ</Text>
              <Text style={styles.bentoExample}>-2/3 × 4/5 = -8/15</Text>
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
          <View style={styles.quizCard}>
            <View style={styles.quizHeader}>
              <MaterialIcons name="help-outline" size={18} color={Colors.primary} />
              <Text style={styles.quizHeaderTitle}>QUICK CONCEPT CHECK</Text>
            </View>
            <Text style={styles.quizQuestion}>{chapter.quiz.question}</Text>

            <View style={styles.quizOptions}>
              {chapter.quiz.options.map((opt: string, optIdx: number) => {
                const isSelected = selectedQuizOption === optIdx;
                const isCorrect = optIdx === chapter.quiz?.correctIndex;
                return (
                  <TouchableOpacity
                    key={optIdx}
                    style={[
                      styles.quizOption,
                      isSelected && styles.quizOptionSelected,
                      showQuizResult && isCorrect && styles.quizOptionCorrect,
                      showQuizResult && isSelected && !isCorrect && styles.quizOptionIncorrect,
                    ]}
                    onPress={() => handleQuizSelect(optIdx)}
                    disabled={showQuizResult}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={[
                        styles.quizOptionText,
                        showQuizResult && isCorrect && styles.quizOptionTextCorrect,
                        showQuizResult && isSelected && !isCorrect && styles.quizOptionTextIncorrect,
                      ]}
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
              <View style={styles.quizExplanationBox}>
                <Text style={styles.quizExplanationText}>
                  {chapter.quiz.explanation}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Big Mark Complete Button */}
        <TouchableOpacity
          style={[
            styles.bigCompleteButton,
            isCompleted && styles.bigCompleteButtonDone,
          ]}
          onPress={onToggleDone}
          activeOpacity={0.88}
        >
          <MaterialIcons
            name={isCompleted ? 'check' : 'check-circle'}
            size={20}
            color={Colors.white}
          />
          <Text style={styles.bigCompleteButtonText}>
            {isCompleted ? 'Chapter Completed' : 'Mark Chapter as Completed'}
          </Text>
        </TouchableOpacity>

        {/* Previous & Next Chapter Navigation */}
        <View style={styles.chapterNavContainer}>
          {nextChapter ? (
            <TouchableOpacity
              style={styles.nextChapterCard}
              onPress={() =>
                navigation.navigate('ChapterDetails', {
                  classId,
                  subjectId,
                  chapterId: nextChapter.id,
                })
              }
              activeOpacity={0.88}
            >
              <View style={styles.nextChapterTextContainer}>
                <Text style={styles.nextChapterPrefix}>
                  Next Chapter • Ch 0{nextChapter.order}
                </Text>
                <Text style={styles.nextChapterTitle}>{nextChapter.title}</Text>
              </View>
              <MaterialIcons name="arrow-forward" size={22} color={Colors.white} />
            </TouchableOpacity>
          ) : (
            <View style={styles.endOfSyllabusBox}>
              <MaterialIcons name="celebration" size={20} color={Colors.success} />
              <Text style={styles.endOfSyllabusText}>
                You have reached the end of this syllabus!
              </Text>
            </View>
          )}

          {prevChapter ? (
            <TouchableOpacity
              style={styles.prevChapterButton}
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
              <Text style={styles.prevChapterText}>
                Previous: {prevChapter.title}
              </Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.startOfSyllabusBox}>
              <MaterialIcons name="first-page" size={16} color={Colors.textMuted} />
              <Text style={styles.startOfSyllabusText}>
                Start of Syllabus • First Chapter
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
  subNavBar: {
    height: 54,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flex: 1,
  },
  backButtonText: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 13,
    color: Colors.textPrimary,
  },
  backButtonBullet: {
    color: Colors.textMuted,
    fontSize: 12,
  },
  backButtonClass: {
    fontFamily: 'Manrope_500Medium',
    fontSize: 12,
    color: Colors.textSecondary,
  },
  subNavBarTitle: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 14,
    color: Colors.textPrimary,
    marginLeft: 8,
  },
  navRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  navIconButton: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: Colors.palePeach,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navIconButtonActive: {
    backgroundColor: Colors.palePeachHover,
  },
  donePillButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.successBg,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: BorderRadius.pill,
  },
  donePillButtonCompleted: {
    backgroundColor: Colors.success,
  },
  donePillText: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 11,
    color: Colors.success,
  },
  donePillTextCompleted: {
    color: Colors.white,
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
  headerBlock: {
    gap: 4,
  },
  chapterBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    backgroundColor: Colors.palePeach,
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: BorderRadius.pill,
  },
  chapterBadgeText: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 11,
    color: Colors.primary,
  },
  chapterTitle: {
    fontFamily: 'Manrope_800ExtraBold',
    fontSize: 24,
    color: Colors.textPrimary,
    letterSpacing: -0.5,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  metaText: {
    fontFamily: 'Manrope_500Medium',
    fontSize: 12,
    color: Colors.textSecondary,
  },
  metaBullet: {
    color: Colors.textMuted,
    fontSize: 10,
  },
  metaStatusText: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 12,
    color: Colors.primary,
  },
  metaStatusCompleted: {
    color: Colors.success,
  },
  goalsContainer: {
    backgroundColor: Colors.palePeach,
    borderRadius: 18,
    padding: 18,
    gap: 8,
    borderWidth: 1,
    borderColor: '#ead7cd',
  },
  goalsTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  goalsTitle: {
    fontFamily: 'Manrope_800ExtraBold',
    fontSize: 16,
    color: Colors.primary,
  },
  goalsIntro: {
    fontFamily: 'Manrope_500Medium',
    fontSize: 12,
    color: Colors.textSecondary,
  },
  goalsList: {
    gap: 6,
    marginTop: 2,
  },
  goalItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  goalNumber: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  goalNumberText: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 10,
    color: Colors.white,
  },
  goalItemText: {
    fontFamily: 'Manrope_500Medium',
    fontSize: 13,
    color: Colors.textPrimary,
    flex: 1,
    lineHeight: 18,
  },
  bannerContainer: {
    height: 140,
    borderRadius: 18,
    overflow: 'hidden',
    position: 'relative',
    ...Shadows.subtle,
  },
  bannerImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  bannerOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: 14,
    backgroundColor: 'rgba(58, 45, 41, 0.45)',
  },
  bannerCaption: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 13,
    color: Colors.white,
    letterSpacing: 0.3,
  },
  sectionBlock: {
    gap: 8,
    paddingTop: 4,
  },
  sectionHeaderClickable: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionOrderBadge: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 5,
  },
  sectionOrderText: {
    fontFamily: 'Manrope_800ExtraBold',
    fontSize: 11,
    color: Colors.white,
  },
  sectionTitle: {
    fontFamily: 'Manrope_800ExtraBold',
    fontSize: 17,
    color: Colors.textPrimary,
    flex: 1,
  },
  sectionBodyText: {
    fontFamily: 'Manrope_500Medium',
    fontSize: 14,
    color: Colors.textLead,
    lineHeight: 23,
  },
  bentoSection: {
    backgroundColor: Colors.softWarm,
    borderRadius: 18,
    padding: 16,
    gap: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  bentoHeader: {
    fontFamily: 'Manrope_800ExtraBold',
    fontSize: 14,
    color: Colors.textPrimary,
  },
  bentoGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  bentoBox: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 11,
    gap: 4,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.subtle,
  },
  bentoPropertyTitle: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 11,
    color: Colors.primary,
  },
  bentoFormula: {
    fontFamily: 'Manrope_800ExtraBold',
    fontSize: 13,
    color: Colors.textPrimary,
  },
  bentoExample: {
    fontFamily: 'Manrope_500Medium',
    fontSize: 10,
    color: Colors.textSecondary,
  },
  quizCard: {
    backgroundColor: Colors.white,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 10,
    ...Shadows.subtle,
  },
  quizHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  quizHeaderTitle: {
    fontFamily: 'Manrope_800ExtraBold',
    fontSize: 11,
    color: Colors.primary,
    letterSpacing: 1,
  },
  quizQuestion: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 14,
    color: Colors.textPrimary,
    lineHeight: 20,
  },
  quizOptions: {
    gap: 8,
  },
  quizOption: {
    minHeight: 44,
    borderRadius: 12,
    backgroundColor: Colors.white,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  quizOptionSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.palePeach,
  },
  quizOptionCorrect: {
    backgroundColor: Colors.successBg,
    borderColor: Colors.success,
  },
  quizOptionIncorrect: {
    backgroundColor: Colors.errorBg,
    borderColor: Colors.error,
  },
  quizOptionText: {
    fontFamily: 'Manrope_600SemiBold',
    fontSize: 13,
    color: Colors.textPrimary,
  },
  quizOptionTextCorrect: {
    color: Colors.success,
    fontFamily: 'Manrope_700Bold',
  },
  quizOptionTextIncorrect: {
    color: Colors.error,
  },
  quizExplanationBox: {
    backgroundColor: Colors.softWarm,
    padding: 10,
    borderRadius: 8,
  },
  quizExplanationText: {
    fontFamily: 'Manrope_500Medium',
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 16,
  },
  bigCompleteButton: {
    height: 48,
    borderRadius: 14,
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 6,
    shadowColor: Colors.primaryDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 3,
  },
  bigCompleteButtonDone: {
    backgroundColor: Colors.success,
  },
  bigCompleteButtonText: {
    fontFamily: 'Manrope_800ExtraBold',
    fontSize: 14,
    color: Colors.white,
  },
  chapterNavContainer: {
    gap: 10,
    paddingTop: 8,
  },
  nextChapterCard: {
    backgroundColor: Colors.primary,
    borderRadius: 18,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...Shadows.subtle,
  },
  nextChapterTextContainer: {
    flex: 1,
  },
  nextChapterPrefix: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 10,
    color: Colors.primaryLight,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  nextChapterTitle: {
    fontFamily: 'Manrope_800ExtraBold',
    fontSize: 15,
    color: Colors.white,
    marginTop: 2,
  },
  endOfSyllabusBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.successBg,
    padding: 16,
    borderRadius: 18,
  },
  endOfSyllabusText: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 12,
    color: Colors.success,
  },
  prevChapterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 8,
    alignSelf: 'flex-start',
  },
  prevChapterText: {
    fontFamily: 'Manrope_600SemiBold',
    fontSize: 12,
    color: Colors.textSecondary,
  },
  startOfSyllabusBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  startOfSyllabusText: {
    fontFamily: 'Manrope_500Medium',
    fontSize: 11,
    color: Colors.textMuted,
  },
});
