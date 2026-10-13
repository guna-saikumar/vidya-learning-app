import React from 'react';
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
import Colors from '../constants/colors';
import { Spacing } from '../constants/spacing';
import { HeaderBar, BottomNav } from '../components/navigation';
import { CalloutCard } from '../components/common';
import { getSectionById } from '../services/curriculumService';
import { markSectionCompleted } from '../services/progressService';
import { useLearningProgress } from '../hooks/useLearningProgress';
import { RootStackParamList } from '../types/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'SectionDetails'>;

export const SectionDetailsScreen: React.FC<Props> = ({ route, navigation }) => {
  const { classId, subjectId, chapterId, sectionId } = route.params;
  const { progressMap, refreshData } = useLearningProgress();

  const result = getSectionById(sectionId);
  const section = result?.section;
  const chapter = result?.chapter;
  const subject = result?.subject;
  const schoolClass = result?.schoolClass;

  if (!section || !chapter || !subject || !schoolClass) {
    return (
      <View style={styles.safeArea}>
        <HeaderBar showBack onBackPress={() => navigation.goBack()} title="Section Details" />
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Section not found</Text>
        </View>
      </View>
    );
  }

  const currentChapterProgress = progressMap[chapterId];
  const isSectionDone =
    currentChapterProgress?.completedSections?.includes(sectionId) || false;

  const currentIndex = chapter.sections.findIndex((s) => s.id === sectionId);
  const prevSection = currentIndex > 0 ? chapter.sections[currentIndex - 1] : null;
  const nextSection =
    currentIndex < chapter.sections.length - 1
      ? chapter.sections[currentIndex + 1]
      : null;

  const handleMarkSectionDone = async () => {
    await markSectionCompleted(
      classId,
      subjectId,
      chapterId,
      sectionId,
      chapter.sections.length
    );
    await refreshData();
  };

  return (
    <View style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />
      <HeaderBar
        showBack
        onBackPress={() => navigation.goBack()}
        title={section.title}
        eyebrow={`${subject.name} · CHAPTER ${chapter.order}`}
        onProfilePress={() => navigation.navigate("Profile")}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Lead overview paragraph */}
        <Text style={styles.leadParagraph}>{section.content}</Text>

        {/* Understanding the idea section matching Figma Make */}
        <View style={styles.conceptBlock}>
          <Text style={styles.conceptTitle}>Understanding the idea</Text>
          <Text style={styles.conceptBody}>
            Start by noticing the main idea and the words used to explain it. Connect each new detail to something you already know. This makes the concept easier to remember and use.
          </Text>

          {/* Example Callout Box with gold border */}
          <CalloutCard
            variant="example"
            title="TRY IT YOURSELF"
            formulaText={section.keyAxiom}
            description={
              section.summaryPoint ||
              'Apply the formal definition above to solve related textbook problems.'
            }
          />
        </View>

        {/* Mark Topic Completed Button */}
        <TouchableOpacity
          style={[
            styles.completeButton,
            isSectionDone && styles.completeButtonDone,
          ]}
          onPress={handleMarkSectionDone}
          activeOpacity={0.88}
        >
          <MaterialIcons name="check" size={19} color={Colors.white} />
          <Text style={styles.completeButtonText}>
            {isSectionDone ? 'Topic Completed' : 'Mark topic as completed'}
          </Text>
        </TouchableOpacity>

        {/* Return to Chapter Overview Link */}
        <TouchableOpacity
          style={styles.returnLink}
          onPress={() =>
            navigation.navigate('ChapterDetails', {
              classId,
              subjectId,
              chapterId,
            })
          }
          activeOpacity={0.8}
        >
          <MaterialIcons name="menu-book" size={18} color={Colors.primary} />
          <Text style={styles.returnLinkText}>Return to Chapter Overview</Text>
        </TouchableOpacity>

        {/* Pager matching Figma Make .pager */}
        <View style={styles.pagerRow}>
          <TouchableOpacity
            style={[styles.pagerButton, !prevSection && styles.pagerButtonDisabled]}
            disabled={!prevSection}
            onPress={() =>
              prevSection &&
              navigation.navigate('SectionDetails', {
                classId,
                subjectId,
                chapterId,
                sectionId: prevSection.id,
              })
            }
            activeOpacity={0.8}
          >
            <MaterialIcons
              name="arrow-back"
              size={18}
              color={prevSection ? Colors.textPrimary : Colors.textMuted}
            />
            <View>
              <Text style={styles.pagerSmallLabel}>PREVIOUS</Text>
              <Text style={styles.pagerTitleLabel}>Topic</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.pagerButton, !nextSection && styles.pagerButtonDisabled]}
            disabled={!nextSection}
            onPress={() =>
              nextSection &&
              navigation.navigate('SectionDetails', {
                classId,
                subjectId,
                chapterId,
                sectionId: nextSection.id,
              })
            }
            activeOpacity={0.8}
          >
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.pagerSmallLabel}>NEXT</Text>
              <Text style={styles.pagerTitleLabel}>Topic</Text>
            </View>
            <MaterialIcons
              name="arrow-forward"
              size={18}
              color={nextSection ? Colors.textPrimary : Colors.textMuted}
            />
          </TouchableOpacity>
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
  eyebrow: {
    fontFamily: 'Manrope_800ExtraBold',
    fontSize: 11,
    color: Colors.primary,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  leadParagraph: {
    fontFamily: 'Manrope_500Medium',
    fontSize: 15,
    color: Colors.textLead,
    lineHeight: 25,
  },
  conceptBlock: {
    gap: 8,
    marginTop: 4,
  },
  conceptTitle: {
    fontFamily: 'Manrope_800ExtraBold',
    fontSize: 17,
    color: Colors.textPrimary,
  },
  conceptBody: {
    fontFamily: 'Manrope_500Medium',
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  completeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    minHeight: 46,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    shadowColor: Colors.primaryDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 3,
    marginTop: 8,
  },
  completeButtonDone: {
    backgroundColor: Colors.success,
  },
  completeButtonText: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 13,
    color: Colors.white,
  },
  returnLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 4,
  },
  returnLinkText: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 13,
    color: Colors.primary,
  },
  pagerRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  pagerButton: {
    flex: 1,
    minHeight: 57,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
    padding: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 14,
    backgroundColor: Colors.white,
  },
  pagerButtonDisabled: {
    opacity: 0.35,
  },
  pagerSmallLabel: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 9,
    color: Colors.textMuted,
    letterSpacing: 0.8,
  },
  pagerTitleLabel: {
    fontFamily: 'Manrope_800ExtraBold',
    fontSize: 12,
    color: Colors.textPrimary,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontFamily: 'Manrope_500Medium',
    fontSize: 14,
    color: Colors.textSecondary,
  },
});
