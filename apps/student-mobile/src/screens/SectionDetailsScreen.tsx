import React from 'react';
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
      <View className="flex-1 bg-white">
        <HeaderBar showBack onBackPress={() => navigation.goBack()} title="Section Details" />
        <View className="flex-1 items-center justify-center">
          <Text className="font-manrope-medium text-sm text-textSecondary">Section not found</Text>
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
    <View className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <HeaderBar
        showBack
        onBackPress={() => navigation.goBack()}
        title={section.title}
        eyebrow={`${subject.name} · CHAPTER ${chapter.order}`}
        onProfilePress={() => navigation.navigate("Profile")}
      />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: 40, gap: 16 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Lead overview paragraph */}
        <Text className="font-manrope-medium text-[15px] text-textLead leading-[25px]">{section.content}</Text>

        {/* Understanding the idea section matching Figma Make */}
        <View className="gap-2 mt-1">
          <Text className="font-manrope-extrabold text-[17px] text-textPrimary">Understanding the idea</Text>
          <Text className="font-manrope-medium text-sm text-textSecondary leading-[22px]">
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
          className={`flex-row items-center justify-center gap-2 min-h-[46px] rounded-xl shadow-md mt-2 ${
            isSectionDone ? 'bg-success' : 'bg-primary'
          }`}
          onPress={handleMarkSectionDone}
          activeOpacity={0.88}
        >
          <MaterialIcons name="check" size={19} color={Colors.white} />
          <Text className="font-manrope-bold text-[13px] text-white">
            {isSectionDone ? 'Topic Completed' : 'Mark topic as completed'}
          </Text>
        </TouchableOpacity>

        {/* Return to Chapter Overview Link */}
        <TouchableOpacity
          className="flex-row items-center justify-center gap-1.5 py-1"
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
          <Text className="font-manrope-bold text-[13px] text-primary">Return to Chapter Overview</Text>
        </TouchableOpacity>

        {/* Pager matching Figma Make .pager */}
        <View className="flex-row gap-2.5 mt-1">
          <TouchableOpacity
            className={`flex-1 min-h-[57px] flex-row items-center justify-center gap-2.5 p-2 border border-border rounded-2xl bg-white ${
              !prevSection ? 'opacity-35' : ''
            }`}
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
              <Text className="font-manrope-bold text-[9px] text-textMuted tracking-wider uppercase">PREVIOUS</Text>
              <Text className="font-manrope-extrabold text-xs text-textPrimary">Topic</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            className={`flex-1 min-h-[57px] flex-row items-center justify-center gap-2.5 p-2 border border-border rounded-2xl bg-white ${
              !nextSection ? 'opacity-35' : ''
            }`}
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
            <View className="items-end">
              <Text className="font-manrope-bold text-[9px] text-textMuted tracking-wider uppercase">NEXT</Text>
              <Text className="font-manrope-extrabold text-xs text-textPrimary">Topic</Text>
            </View>
            <MaterialIcons
              name="arrow-forward"
              size={18}
              color={nextSection ? Colors.textPrimary : Colors.textMuted}
            />
          </TouchableOpacity>
        </View>
      </ScrollView>
      <BottomNav activeTab="Learn" navigation={navigation} />
    </View>
  );
};
