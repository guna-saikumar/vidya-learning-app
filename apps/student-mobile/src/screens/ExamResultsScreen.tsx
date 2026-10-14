import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Alert,
  Image,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MaterialIcons } from '@expo/vector-icons';
import Colors from '../constants/colors';
import { HeaderBar, BottomNav } from '../components/navigation';
import { HoverCard, PageIntro } from '../components/common';
import { RootStackParamList } from '../types/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'ExamResults'>;

type AssessmentType = 'fa2' | 'fa1' | 'sa1_model' | 'prev_annual';

interface SubjectResult {
  code: string;
  name: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  maxMarks: number;
  marksObtained: number;
  grade: string;
  points: number;
  remarks: string;
}

const ASSESSMENT_RESULTS: Record<AssessmentType, {
  title: string;
  shortTitle: string;
  term: string;
  date: string;
  status: string;
  gpa: string;
  totalMarks: number;
  maxTotal: number;
  percentage: string;
  overallGrade: string;
  teacherRemarks: string;
  conduct: string;
  subjects: SubjectResult[];
}> = {
  fa2: {
    title: 'Formative Assessment 2 (FA-2)',
    shortTitle: 'FA-2 Assessment',
    term: 'Academic Year 2026–2027',
    date: 'Published Sep 28, 2026',
    status: 'PASSED · DISTINCTION',
    gpa: '9.6',
    totalMarks: 335,
    maxTotal: 350,
    percentage: '95.7%',
    overallGrade: 'A1',
    conduct: 'Exemplary',
    teacherRemarks: 'Exceptional problem-solving skills in Mathematics and analytical logic in Science. Continues to demonstrate disciplined study habits.',
    subjects: [
      { code: '01T', name: 'First Language Telugu', icon: 'translate', maxMarks: 50, marksObtained: 47, grade: 'A1', points: 10, remarks: 'Excellent grammar and poetry analysis' },
      { code: '02H', name: 'Second Language Hindi', icon: 'menu-book', maxMarks: 50, marksObtained: 45, grade: 'A1', points: 9, remarks: 'Good vocabulary and neat presentation' },
      { code: '03E', name: 'General English', icon: 'language', maxMarks: 50, marksObtained: 48, grade: 'A1', points: 10, remarks: 'Strong reading comprehension and creative writing' },
      { code: '04M', name: 'Mathematics', icon: 'calculate', maxMarks: 50, marksObtained: 50, grade: 'A1', points: 10, remarks: 'Perfect score · Flawless proof derivation' },
      { code: '05PS', name: 'Physical Science', icon: 'science', maxMarks: 50, marksObtained: 48, grade: 'A1', points: 10, remarks: 'Clear understanding of force & pressure' },
      { code: '06BS', name: 'Biological Science', icon: 'biotech', maxMarks: 50, marksObtained: 49, grade: 'A1', points: 10, remarks: 'Accurate biological diagrams and labeling' },
      { code: '07SS', name: 'Social Studies', icon: 'public', maxMarks: 50, marksObtained: 48, grade: 'A1', points: 10, remarks: 'Thorough knowledge of resources & civic duties' },
    ],
  },
  fa1: {
    title: 'Formative Assessment 1 (FA-1)',
    shortTitle: 'FA-1 Assessment',
    term: 'Academic Year 2026–2027',
    date: 'Published Jul 30, 2026',
    status: 'PASSED · DISTINCTION',
    gpa: '9.4',
    totalMarks: 328,
    maxTotal: 350,
    percentage: '93.7%',
    overallGrade: 'A1',
    conduct: 'Very Good',
    teacherRemarks: 'Strong start to Class 8 syllabus. Active participation in classroom discussions and periodic slip tests.',
    subjects: [
      { code: '01T', name: 'First Language Telugu', icon: 'translate', maxMarks: 50, marksObtained: 46, grade: 'A1', points: 9, remarks: 'Good grasp of prose & grammar' },
      { code: '02H', name: 'Second Language Hindi', icon: 'menu-book', maxMarks: 50, marksObtained: 44, grade: 'A1', points: 9, remarks: 'Satisfactory comprehension' },
      { code: '03E', name: 'General English', icon: 'language', maxMarks: 50, marksObtained: 47, grade: 'A1', points: 10, remarks: 'Excellent written vocabulary' },
      { code: '04M', name: 'Mathematics', icon: 'calculate', maxMarks: 50, marksObtained: 49, grade: 'A1', points: 10, remarks: 'Outstanding analytical precision' },
      { code: '05PS', name: 'Physical Science', icon: 'science', maxMarks: 50, marksObtained: 46, grade: 'A1', points: 9, remarks: 'Good conceptual understanding' },
      { code: '06BS', name: 'Biological Science', icon: 'biotech', maxMarks: 50, marksObtained: 48, grade: 'A1', points: 10, remarks: 'Well-illustrated experiments' },
      { code: '07SS', name: 'Social Studies', icon: 'public', maxMarks: 50, marksObtained: 48, grade: 'A1', points: 10, remarks: 'Thorough historical understanding' },
    ],
  },
  sa1_model: {
    title: 'SA-1 Diagnostic Pre-Board Evaluation',
    shortTitle: 'SA-1 Pre-Board',
    term: 'Diagnostic Model Exam 2026',
    date: 'Conducted Oct 10, 2026',
    status: 'EVALUATED · READY',
    gpa: '9.2',
    totalMarks: 462,
    maxTotal: 500,
    percentage: '92.4%',
    overallGrade: 'A1',
    conduct: 'Good',
    teacherRemarks: 'Well prepared for upcoming SA-1 Board exam. Suggested to review Social Studies geography portions.',
    subjects: [
      { code: '01T', name: 'First Language Telugu', icon: 'translate', maxMarks: 100, marksObtained: 91, grade: 'A1', points: 9, remarks: 'Good time management' },
      { code: '02M', name: 'Mathematics', icon: 'calculate', maxMarks: 100, marksObtained: 97, grade: 'A1', points: 10, remarks: 'High precision in algebra & geometry' },
      { code: '03PS', name: 'Physical Science', icon: 'science', maxMarks: 50, marksObtained: 47, grade: 'A1', points: 10, remarks: 'Thorough concept retention' },
      { code: '04BS', name: 'Biological Science', icon: 'biotech', maxMarks: 50, marksObtained: 46, grade: 'A1', points: 9, remarks: 'Good explanatory answers' },
      { code: '05SS', name: 'Social Studies', icon: 'public', maxMarks: 100, marksObtained: 89, grade: 'A2', points: 8, remarks: 'Revise chapter 3 map work' },
      { code: '06E', name: 'General English', icon: 'language', maxMarks: 100, marksObtained: 92, grade: 'A1', points: 9, remarks: 'Well-written essays and letter' },
    ],
  },
  prev_annual: {
    title: 'Class 7 Annual Board Examination',
    shortTitle: 'Class 7 Board',
    term: 'Academic Year 2025–2026',
    date: 'Archived · April 2026',
    status: 'PROMOTED TO CLASS 8',
    gpa: '9.5',
    totalMarks: 572,
    maxTotal: 600,
    percentage: '95.3%',
    overallGrade: 'A1',
    conduct: 'Exemplary',
    teacherRemarks: 'Ranked in the top 3rd percentile across the mandal. Promoted to Class 8 with honors.',
    subjects: [
      { code: '01T', name: 'First Language Telugu', icon: 'translate', maxMarks: 100, marksObtained: 94, grade: 'A1', points: 9, remarks: 'Distinction' },
      { code: '02H', name: 'Second Language Hindi', icon: 'menu-book', maxMarks: 100, marksObtained: 90, grade: 'A1', points: 9, remarks: 'Distinction' },
      { code: '03E', name: 'General English', icon: 'language', maxMarks: 100, marksObtained: 96, grade: 'A1', points: 10, remarks: 'Distinction' },
      { code: '04M', name: 'Mathematics', icon: 'calculate', maxMarks: 100, marksObtained: 99, grade: 'A1', points: 10, remarks: 'Top Subject Performer in Mandal' },
      { code: '05S', name: 'General Science', icon: 'science', maxMarks: 100, marksObtained: 95, grade: 'A1', points: 10, remarks: 'Distinction' },
      { code: '06SS', name: 'Social Studies', icon: 'public', maxMarks: 100, marksObtained: 98, grade: 'A1', points: 10, remarks: 'Distinction' },
    ],
  },
};

export const ExamResultsScreen: React.FC<Props> = ({ navigation }) => {
  const [selectedAssessment, setSelectedAssessment] = useState<AssessmentType>('fa2');
  const result = ASSESSMENT_RESULTS[selectedAssessment];

  const handleDownloadMemo = () => {
    Alert.alert(
      'Marks Memo Downloaded',
      `Official SCERT AP Memorandum of Marks for ${result.title} has been downloaded and verified with digital signature.`,
      [{ text: 'View File', style: 'default' }, { text: 'Done', style: 'cancel' }]
    );
  };

  return (
    <View className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      {/* Clean Top Navbar without Back Section */}
      <HeaderBar activeRoute="ExamResults" />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 22, paddingTop: 18, paddingBottom: 48, gap: 18 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Page Heading */}
        <PageIntro
          eyebrow="OFFICIAL MEMORANDUM OF MARKS"
          badge="SCERT AP Verified"
          title="Exam Results & Grades"
        />
        {/* Student Verification ID Card (Clear, Balanced & Never Cramped) */}
        <View className="bg-palePeach rounded-[22px] p-4 border border-[#F2DED3] shadow-sm gap-3">
          {/* Top Row: Avatar, Student Name, Class, and Hall Ticket Badge */}
          <View className="flex-row items-center justify-between pb-3 border-b border-[#EBD7CB]">
            <View className="flex-row items-center gap-3 flex-1 pr-2">
              <Image
                source={require('../../assets/app-images/avatar.png')}
                className="w-12 h-12 rounded-full border-2 border-primary"
                style={{ width: 48, height: 48, borderRadius: 24 }}
              />
              <View className="flex-1">
                <Text className="font-manrope-extrabold text-base text-textPrimary" numberOfLines={1}>
                  Aarav Sharma
                </Text>
                <Text className="font-manrope-medium text-xs text-textSecondary mt-0.5">
                  Class 8 · Section A · AP Board 2026–27
                </Text>
              </View>
            </View>

            <View className="bg-primary px-3 py-1.5 rounded-xl items-center shadow-xs">
              <Text className="font-manrope-extrabold text-[9px] text-white tracking-wider uppercase">HT Number</Text>
              <Text className="font-manrope-bold text-xs text-white">26084192</Text>
            </View>
          </View>

          {/* School / Institution Full Row with Icon & SCERT badge */}
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-2 flex-1 pr-2">
              <View className="w-6 h-6 rounded-md bg-white/80 border border-[#E8D4C8] items-center justify-center">
                <MaterialIcons name="school" size={14} color={Colors.primary} />
              </View>
              <Text className="font-manrope-bold text-xs text-textPrimary" numberOfLines={1}>
                Z.P. High School, Guntur
              </Text>
            </View>
            <View className="flex-row items-center gap-1 bg-white/80 px-2 py-0.5 rounded-full border border-[#E8D4C8]">
              <MaterialIcons name="verified" size={12} color={Colors.success} />
              <Text className="font-manrope-bold text-[10px] text-success">Verified</Text>
            </View>
          </View>

          {/* 3 Metric Pills: Roll Number, Academic Year, Conduct */}
          <View className="flex-row items-center gap-2 pt-1 border-t border-[#EBD7CB]/60">
            <View className="flex-1 bg-white/80 py-1.5 px-2 rounded-xl border border-[#ECD7CC] items-center">
              <Text className="font-manrope-medium text-[9px] text-textMuted uppercase tracking-wider">Roll No</Text>
              <Text className="font-manrope-bold text-xs text-textPrimary mt-0.5">08-A-24</Text>
            </View>
            <View className="flex-1 bg-white/80 py-1.5 px-2 rounded-xl border border-[#ECD7CC] items-center">
              <Text className="font-manrope-medium text-[9px] text-textMuted uppercase tracking-wider">District</Text>
              <Text className="font-manrope-bold text-xs text-textPrimary mt-0.5">Guntur</Text>
            </View>
            <View className="flex-1 bg-white/80 py-1.5 px-2 rounded-xl border border-[#ECD7CC] items-center">
              <Text className="font-manrope-medium text-[9px] text-textMuted uppercase tracking-wider">Conduct</Text>
              <Text className="font-manrope-bold text-xs text-success mt-0.5">{result.conduct}</Text>
            </View>
          </View>
        </View>

        {/* Assessment Term Selector (Clean 2x2 Grid so nothing is cut off) */}
        <View className="gap-2">
          <Text className="font-manrope-bold text-xs text-textSecondary uppercase tracking-wider">
            Select Examination Term
          </Text>

          <View className="flex-row gap-2">
            {[
              { key: 'fa2', label: 'FA-2 (Sep 2026)' },
              { key: 'fa1', label: 'FA-1 (Jul 2026)' },
            ].map((tab) => {
              const isSelected = selectedAssessment === tab.key;
              return (
                <TouchableOpacity
                  key={tab.key}
                  className={`flex-1 py-2.5 px-3 rounded-xl border items-center justify-center ${
                    isSelected
                      ? 'bg-primary border-primary shadow-sm'
                      : 'bg-white border-border'
                  }`}
                  onPress={() => setSelectedAssessment(tab.key as AssessmentType)}
                  activeOpacity={0.8}
                >
                  <Text
                    className={`font-manrope-bold text-xs ${
                      isSelected ? 'text-white' : 'text-textPrimary'
                    }`}
                  >
                    {tab.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <View className="flex-row gap-2">
            {[
              { key: 'sa1_model', label: 'SA-1 Pre-Board' },
              { key: 'prev_annual', label: 'Class 7 Annual' },
            ].map((tab) => {
              const isSelected = selectedAssessment === tab.key;
              return (
                <TouchableOpacity
                  key={tab.key}
                  className={`flex-1 py-2.5 px-3 rounded-xl border items-center justify-center ${
                    isSelected
                      ? 'bg-primary border-primary shadow-sm'
                      : 'bg-white border-border'
                  }`}
                  onPress={() => setSelectedAssessment(tab.key as AssessmentType)}
                  activeOpacity={0.8}
                >
                  <Text
                    className={`font-manrope-bold text-xs ${
                      isSelected ? 'text-white' : 'text-textPrimary'
                    }`}
                  >
                    {tab.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Cumulative GPA & Score Card (Sleek, Balanced Hierarchy) */}
        <HoverCard className="p-5 rounded-[22px] bg-primaryDark gap-3.5 shadow-md" lift={-3}>
          <View className="flex-row items-center justify-between gap-2">
            <View className="bg-primaryLight/20 px-2.5 py-1 rounded-full border border-primaryLight/30 flex-1 mr-1">
              <Text
                className="font-manrope-extrabold text-[10px] text-primaryLight tracking-wider uppercase"
                numberOfLines={1}
              >
                {result.shortTitle || result.title}
              </Text>
            </View>

            <View className="bg-success px-2.5 py-0.5 rounded-full flex-shrink-0">
              <Text className="font-manrope-extrabold text-[10px] text-white">
                {result.status}
              </Text>
            </View>
          </View>

          <View className="flex-row items-center justify-between py-1">
            <View className="gap-0.5 flex-1 pr-2">
              <Text className="font-manrope-bold text-[10px] text-primaryLight uppercase tracking-wider">
                Cumulative Grade Point Average
              </Text>
              <Text className="font-manrope-extrabold text-[38px] text-white tracking-tight leading-[42px]">
                {result.gpa} <Text className="text-sm text-primaryLight font-manrope-semibold">/ 10.0 GPA</Text>
              </Text>
              <Text className="font-manrope-semibold text-xs text-primaryLight mt-0.5">
                Grade {result.overallGrade} · Aggregate {result.percentage}
              </Text>
            </View>

            <View className="w-16 h-16 rounded-full bg-accentGoldLight items-center justify-center">
              <View className="w-[52px] h-[52px] rounded-full bg-primaryDark items-center justify-center">
                <Text className="font-manrope-extrabold text-base text-accentGold">
                  {result.overallGrade}
                </Text>
              </View>
            </View>
          </View>

          <View className="flex-row gap-2 pt-2 border-t border-white/10">
            <View className="flex-1 bg-white/10 py-2 px-2.5 rounded-xl items-center">
              <Text className="font-manrope-extrabold text-xs text-white">
                {result.totalMarks} / {result.maxTotal}
              </Text>
              <Text className="font-manrope-medium text-[10px] text-primaryLight">Total Marks</Text>
            </View>

            <View className="flex-1 bg-white/10 py-2 px-2.5 rounded-xl items-center">
              <Text className="font-manrope-extrabold text-xs text-white">100%</Text>
              <Text className="font-manrope-medium text-[10px] text-primaryLight">Pass Rate</Text>
            </View>

            <View className="flex-1 bg-white/10 py-2 px-2.5 rounded-xl items-center">
              <Text className="font-manrope-extrabold text-xs text-white">Rank 1</Text>
              <Text className="font-manrope-medium text-[10px] text-primaryLight">Mandal Position</Text>
            </View>
          </View>
        </HoverCard>

        {/* Detailed Marks Memo Table */}
        <View className="bg-white rounded-[22px] p-5 border border-border shadow-sm gap-3">
          <View className="flex-row items-center justify-between pb-3 border-b border-border gap-2">
            <View className="flex-row items-center gap-2 flex-1 pr-2">
              <MaterialIcons name="format-list-numbered" size={18} color={Colors.primary} />
              <Text className="font-manrope-extrabold text-sm text-textPrimary" numberOfLines={1}>
                Subject-Wise Marks Memo
              </Text>
            </View>
            <View className="bg-palePeach px-2 py-0.5 rounded-md border border-[#ECD7CC] flex-shrink-0">
              <Text className="font-manrope-extrabold text-[10px] text-primary">
                Points / Grade
              </Text>
            </View>
          </View>

          {result.subjects.map((subj, index) => {
            const percentage = Math.round((subj.marksObtained / subj.maxMarks) * 100);

            return (
              <View
                key={subj.code}
                className={`py-3 border-b border-border/60 ${
                  index === result.subjects.length - 1 ? 'border-b-0 pb-0' : ''
                } gap-2`}
              >
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center gap-2.5 flex-1 pr-2">
                    <View className="w-8 h-8 rounded-xl bg-palePeach items-center justify-center">
                      <MaterialIcons name={subj.icon} size={16} color={Colors.primary} />
                    </View>
                    <View className="flex-1">
                      <Text className="font-manrope-extrabold text-xs text-textPrimary">
                        {subj.name}
                      </Text>
                      <Text className="font-manrope-medium text-[10px] text-textMuted mt-0.5">
                        Code: {subj.code} · {subj.remarks}
                      </Text>
                    </View>
                  </View>

                  <View className="flex-row items-center gap-2">
                    <Text className="font-manrope-extrabold text-xs text-textPrimary">
                      {subj.marksObtained}
                      <Text className="text-[10px] font-normal text-textMuted"> / {subj.maxMarks}</Text>
                    </Text>

                    <View className="px-2 py-0.5 rounded-md bg-palePeach border border-primary/20">
                      <Text className="font-manrope-extrabold text-[11px] text-primary">
                        {subj.grade}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Performance Progress Bar */}
                <View className="h-1.5 rounded-full bg-[#F3EDE9] overflow-hidden">
                  <View
                    className="h-full rounded-full"
                    style={{
                      width: `${percentage}%`,
                      backgroundColor: percentage >= 90 ? Colors.success : Colors.primary,
                    }}
                  />
                </View>
              </View>
            );
          })}
        </View>

        {/* Headmaster Verification Card */}
        <View className="bg-palePeach/70 rounded-[20px] p-4 border border-[#F2DED3] gap-2.5">
          <View className="flex-row items-center gap-2">
            <MaterialIcons name="verified" size={18} color={Colors.primary} />
            <Text className="font-manrope-extrabold text-xs text-primaryDark uppercase tracking-wider">
              Teacher Appraisal & Verification
            </Text>
          </View>
          <Text className="font-manrope-medium text-xs text-textLead leading-5">
            "{result.teacherRemarks}"
          </Text>
          <View className="flex-row items-center justify-between pt-2 border-t border-[#EBD7CB]">
            <Text className="font-manrope-semibold text-[10px] text-textMuted">
              Verified by: Headmaster, Z.P. High School
            </Text>
            <View className="flex-row items-center gap-1">
              <MaterialIcons name="check-circle" size={13} color={Colors.success} />
              <Text className="font-manrope-bold text-[10px] text-success">Digitally Signed</Text>
            </View>
          </View>
        </View>

        {/* Action Controls */}
        <View className="gap-2.5">
          <TouchableOpacity
            className="flex-row items-center justify-center gap-2 py-4 rounded-2xl bg-primary shadow-sm"
            onPress={handleDownloadMemo}
            activeOpacity={0.85}
          >
            <MaterialIcons name="download" size={18} color={Colors.white} />
            <Text className="font-manrope-bold text-sm text-white">Download Marks Memo (PDF)</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-row items-center justify-center gap-2 py-3.5 rounded-2xl border border-border bg-white shadow-sm"
            onPress={() => navigation.navigate('ExamSchedule')}
            activeOpacity={0.85}
          >
            <MaterialIcons name="event-note" size={18} color={Colors.primary} />
            <Text className="font-manrope-bold text-sm text-primary">View Upcoming Exam Schedule</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <BottomNav activeTab="Progress" navigation={navigation} />
    </View>
  );
};
