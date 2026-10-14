import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Alert,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MaterialIcons } from '@expo/vector-icons';
import Colors from '../constants/colors';
import { HeaderBar, BottomNav } from '../components/navigation';
import { PageIntro, HoverCard } from '../components/common';
import { RootStackParamList } from '../types/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'ExamSchedule'>;

type ExamCategory = 'sa1' | 'fa' | 'sa2' | 'all';

interface ExamItem {
  id: string;
  category: 'sa1' | 'fa' | 'sa2';
  subjectName: string;
  subjectCode: string;
  dateDay: string;
  dateMonth: string;
  dayOfWeek: string;
  fullDate: string;
  time: string;
  syllabusPortion: string;
  unitsSummary: string;
  isUpcoming: boolean;
  status: 'Next Up' | 'Upcoming' | 'Scheduled';
}

const EXAM_SCHEDULE: ExamItem[] = [
  {
    id: 'exam-1',
    category: 'sa1',
    subjectName: 'First Language (Telugu)',
    subjectCode: '01T',
    dateDay: '16',
    dateMonth: 'NOV',
    dayOfWeek: 'MON',
    fullDate: 'Nov 16, 2026',
    time: '09:30 AM – 12:15 PM',
    unitsSummary: '5 Lessons: Matrubhoomi, Tyagam, Sandhulu & Grammar',
    syllabusPortion: 'Lessons 1 to 5: Matrubhoomi, Tyagam, Sandhulu, Samasalu, Alankaralu, and Letter Writing.',
    isUpcoming: true,
    status: 'Next Up',
  },
  {
    id: 'exam-2',
    category: 'sa1',
    subjectName: 'Mathematics',
    subjectCode: '02M',
    dateDay: '18',
    dateMonth: 'NOV',
    dayOfWeek: 'WED',
    fullDate: 'Nov 18, 2026',
    time: '09:30 AM – 12:15 PM',
    unitsSummary: '5 Units: Rational Numbers to Square Roots',
    syllabusPortion: 'Units 1–5: Rational Numbers, Linear Equations in One Variable, Understanding Quadrilaterals, Data Handling, Squares and Square Roots.',
    isUpcoming: true,
    status: 'Upcoming',
  },
  {
    id: 'exam-3',
    category: 'sa1',
    subjectName: 'Physical Science',
    subjectCode: '03PS',
    dateDay: '20',
    dateMonth: 'NOV',
    dayOfWeek: 'FRI',
    fullDate: 'Nov 20, 2026',
    time: '09:30 AM – 12:15 PM',
    unitsSummary: '4 Units: Force & Pressure, Friction, Sound, Electric Current',
    syllabusPortion: 'Units 1–4: Force & Pressure, Friction, Sound, Chemical Effects of Electric Current.',
    isUpcoming: true,
    status: 'Upcoming',
  },
  {
    id: 'exam-4',
    category: 'sa1',
    subjectName: 'Biological Science',
    subjectCode: '04BS',
    dateDay: '21',
    dateMonth: 'NOV',
    dayOfWeek: 'SAT',
    fullDate: 'Nov 21, 2026',
    time: '09:30 AM – 12:15 PM',
    unitsSummary: '4 Units: Crop Production, Microorganisms, Cell Structure, Animals',
    syllabusPortion: 'Units 1–4: Crop Production & Management, Microorganisms: Friend and Foe, Cell Structure and Functions, Reproduction in Animals.',
    isUpcoming: true,
    status: 'Upcoming',
  },
  {
    id: 'exam-5',
    category: 'sa1',
    subjectName: 'Social Studies',
    subjectCode: '05SS',
    dateDay: '23',
    dateMonth: 'NOV',
    dayOfWeek: 'MON',
    fullDate: 'Nov 23, 2026',
    time: '09:30 AM – 12:15 PM',
    unitsSummary: 'Geography, History (Ch 1–4), Civics: Rule of Law',
    syllabusPortion: 'Resources and Development, Our Pasts III (Chapters 1–4), Rule of Law, Secularism, and Social Justice.',
    isUpcoming: true,
    status: 'Upcoming',
  },
  {
    id: 'exam-6',
    category: 'sa1',
    subjectName: 'General English',
    subjectCode: '06E',
    dateDay: '24',
    dateMonth: 'NOV',
    dayOfWeek: 'TUE',
    fullDate: 'Nov 24, 2026',
    time: '09:30 AM – 12:15 PM',
    unitsSummary: 'Honeydew Units 1–4, Supplementary Ch 1–3, Composition',
    syllabusPortion: 'Honeydew Units 1–4, It So Happened Chapters 1–3, Reading Comprehension, Formal Letter Writing, Story Writing.',
    isUpcoming: true,
    status: 'Upcoming',
  },
  {
    id: 'exam-7',
    category: 'fa',
    subjectName: 'Formative Assessment 3 (FA-3)',
    subjectCode: 'FA-03',
    dateDay: '08',
    dateMonth: 'JAN',
    dayOfWeek: 'THU',
    fullDate: 'Jan 08 – Jan 10, 2027',
    time: 'Classroom Hours',
    unitsSummary: 'Slip Tests, Lab Activities, Project Work (50 Marks)',
    syllabusPortion: 'Internal classroom slip tests, notebook evaluation, science project submissions, and student seminars.',
    isUpcoming: false,
    status: 'Scheduled',
  },
  {
    id: 'exam-8',
    category: 'sa2',
    subjectName: 'SA-2 Annual Board Examinations',
    subjectCode: 'ANNUAL',
    dateDay: '22',
    dateMonth: 'MAR',
    dayOfWeek: 'MON',
    fullDate: 'Mar 22 – Apr 02, 2027',
    time: '09:30 AM – 12:15 PM',
    unitsSummary: 'Complete Academic Syllabus (100% Curriculum)',
    syllabusPortion: 'Full cumulative curriculum as prescribed by Andhra Pradesh SCERT for Class 8 promotion.',
    isUpcoming: false,
    status: 'Scheduled',
  },
];

export const ExamScheduleScreen: React.FC<Props> = ({ navigation }) => {
  const [selectedCategory, setSelectedCategory] = useState<ExamCategory>('sa1');
  const [expandedExamId, setExpandedExamId] = useState<string | null>(null);

  const filteredExams = EXAM_SCHEDULE.filter((exam) => {
    if (selectedCategory === 'all') return true;
    return exam.category === selectedCategory;
  });

  const toggleExpand = (id: string) => {
    setExpandedExamId((prev) => (prev === id ? null : id));
  };

  return (
    <View className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      {/* Clean Top Navbar without Back Section */}
      <HeaderBar activeRoute="ExamSchedule" />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 22, paddingTop: 18, paddingBottom: 48, gap: 20 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Page Heading */}
        <PageIntro
          eyebrow="AP SCERT BOARD 2026–27"
          badge="Official Timetable"
          title="Exam Schedule"
        />

        {/* Quick Result Announcement Banner */}
        <TouchableOpacity
          className="bg-palePeach rounded-2xl p-3.5 border border-[#f2ded3] flex-row items-center justify-between shadow-sm"
          onPress={() => navigation.navigate('ExamResults')}
          activeOpacity={0.8}
        >
          <View className="flex-row items-center gap-3 flex-1 pr-2">
            <View className="w-9 h-9 rounded-xl bg-primary items-center justify-center">
              <MaterialIcons name="grade" size={20} color={Colors.white} />
            </View>
            <View className="flex-1">
              <Text className="font-manrope-extrabold text-xs text-textPrimary">
                Checking Past Exam Results?
              </Text>
              <Text className="font-manrope-medium text-[11px] text-textSecondary mt-0.5">
                View FA-1 & FA-2 Marks Memorandum & GPA
              </Text>
            </View>
          </View>
          <View className="flex-row items-center gap-0.5 bg-primary/10 py-1 px-2.5 rounded-full">
            <Text className="font-manrope-bold text-xs text-primary">View Results</Text>
            <MaterialIcons name="chevron-right" size={16} color={Colors.primary} />
          </View>
        </TouchableOpacity>

        {/* Clean Hero Countdown Card */}
        <HoverCard className="p-5 rounded-[22px] bg-primaryDark gap-3.5 shadow-md" lift={-3}>
          <View className="flex-row items-center justify-between">
            <View className="bg-primaryLight/20 px-3 py-1 rounded-full border border-primaryLight/30">
              <Text className="font-manrope-extrabold text-[10px] text-primaryLight tracking-wider uppercase">
                Summative Assessment 1 (SA-1)
              </Text>
            </View>

            <View className="bg-accentGold px-2.5 py-0.5 rounded-full">
              <Text className="font-manrope-extrabold text-[10px] text-white">
                14 Days Left
              </Text>
            </View>
          </View>

          <View className="gap-1">
            <Text className="font-manrope-extrabold text-xl text-white tracking-tight">
              Nov 16 – Nov 24, 2026
            </Text>
            <Text className="font-manrope-medium text-xs text-primaryLight leading-4">
              09:30 AM to 12:15 PM · 6 State Board papers covering first term portions.
            </Text>
          </View>

          <View className="flex-row gap-2 pt-2 border-t border-white/10">
            <View className="flex-row items-center gap-1.5 flex-1 bg-white/10 py-2 px-3 rounded-xl">
              <MaterialIcons name="timer" size={14} color={Colors.primaryLight} />
              <Text className="font-manrope-bold text-[11px] text-white">2h 45m Writing</Text>
            </View>

            <View className="flex-row items-center gap-1.5 flex-1 bg-white/10 py-2 px-3 rounded-xl">
              <MaterialIcons name="menu-book" size={14} color={Colors.primaryLight} />
              <Text className="font-manrope-bold text-[11px] text-white">15m Reading Time</Text>
            </View>
          </View>
        </HoverCard>

        {/* Horizontally Scrollable Filter Pills */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8, paddingVertical: 2 }}
        >
          {[
            { key: 'sa1', label: 'SA-1 (Nov 2026)' },
            { key: 'fa', label: 'FA Tests' },
            { key: 'sa2', label: 'SA-2 Annual' },
            { key: 'all', label: 'All Exams' },
          ].map((cat) => {
            const isSelected = selectedCategory === cat.key;
            return (
              <TouchableOpacity
                key={cat.key}
                className={`py-2 px-4 rounded-full border ${
                  isSelected ? 'bg-primary border-primary' : 'bg-surfaceSoft border-border'
                }`}
                onPress={() => setSelectedCategory(cat.key as ExamCategory)}
                activeOpacity={0.8}
              >
                <Text
                  className={`font-manrope-bold text-xs ${
                    isSelected ? 'text-white' : 'text-textSecondary'
                  }`}
                >
                  {cat.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* De-cluttered, Calendar-Style Timetable List */}
        <View className="gap-3">
          <Text className="font-manrope-extrabold text-sm text-textPrimary tracking-tight">
            Examination Papers ({filteredExams.length})
          </Text>

          {filteredExams.map((exam) => {
            const isExpanded = expandedExamId === exam.id;

            return (
              <View
                key={exam.id}
                className="bg-white rounded-2xl border border-border overflow-hidden shadow-sm"
              >
                {/* Main Row */}
                <TouchableOpacity
                  className="p-4 flex-row items-center gap-3.5"
                  onPress={() => toggleExpand(exam.id)}
                  activeOpacity={0.8}
                >
                  {/* Calendar Date Block */}
                  <View className="w-14 h-14 rounded-2xl bg-[#F6F2EE] border border-border items-center justify-center">
                    <Text className="font-manrope-bold text-[9px] text-primary tracking-wider uppercase">
                      {exam.dateMonth}
                    </Text>
                    <Text className="font-manrope-extrabold text-lg text-textPrimary leading-5">
                      {exam.dateDay}
                    </Text>
                    <Text className="font-manrope-medium text-[9px] text-textMuted uppercase">
                      {exam.dayOfWeek}
                    </Text>
                  </View>

                  {/* Subject Details */}
                  <View className="flex-1">
                    <View className="flex-row items-center gap-2">
                      <Text className="font-manrope-extrabold text-sm text-textPrimary flex-1" numberOfLines={1}>
                        {exam.subjectName}
                      </Text>
                      {exam.isUpcoming && (
                        <View className="bg-accentGoldBg px-2 py-0.5 rounded-md">
                          <Text className="font-manrope-extrabold text-[9px] text-accentGoldDark">
                            {exam.status}
                          </Text>
                        </View>
                      )}
                    </View>

                    <Text className="font-manrope-medium text-xs text-textSecondary mt-0.5">
                      {exam.time} · Code {exam.subjectCode}
                    </Text>

                    <Text className="font-manrope-semibold text-[11px] text-primary mt-1" numberOfLines={1}>
                      {exam.unitsSummary}
                    </Text>
                  </View>

                  <MaterialIcons
                    name={isExpanded ? 'expand-less' : 'expand-more'}
                    size={22}
                    color={Colors.textMuted}
                  />
                </TouchableOpacity>

                {/* Expanded Syllabus & Quick Action Sheet */}
                {isExpanded && (
                  <View className="px-4 pb-4 pt-1 bg-[#FAF7F4] border-t border-border/70 gap-2.5">
                    <View className="gap-1">
                      <Text className="font-manrope-bold text-[10px] text-textMuted uppercase tracking-wider">
                        Prescribed Syllabus Portions:
                      </Text>
                      <Text className="font-manrope-medium text-xs text-textLead leading-5">
                        {exam.syllabusPortion}
                      </Text>
                    </View>

                    <View className="flex-row items-center justify-end gap-2 pt-1 border-t border-border/50">
                      <TouchableOpacity
                        className="py-1.5 px-3 rounded-lg bg-white border border-border"
                        onPress={() => navigation.navigate('Tasks')}
                        activeOpacity={0.8}
                      >
                        <Text className="font-manrope-bold text-xs text-textSecondary">Practice Quiz</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        className="py-1.5 px-3 rounded-lg bg-primary"
                        onPress={() => navigation.navigate('Learn')}
                        activeOpacity={0.8}
                      >
                        <Text className="font-manrope-bold text-xs text-white">Revise Subject</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              </View>
            );
          })}
        </View>

        {/* Clean Guidelines Card */}
        <View className="bg-palePeach/70 rounded-2xl p-4 border border-[#f2ded3] gap-2">
          <View className="flex-row items-center gap-2">
            <MaterialIcons name="assignment-turned-in" size={18} color={Colors.primary} />
            <Text className="font-manrope-extrabold text-xs text-primaryDark uppercase tracking-wider">
              Essential Hall Instructions
            </Text>
          </View>
          <Text className="font-manrope-medium text-xs text-textSecondary leading-5">
            • Hall ticket must be verified by the school headmaster prior to exams.{'\n'}
            • Question paper reading window: 09:30 AM – 09:45 AM (Strictly writing prohibited).{'\n'}
            • Use blue or black ballpoint pen only for OMR and answer scripts.
          </Text>
        </View>
      </ScrollView>

      <BottomNav activeTab="Learn" navigation={navigation} />
    </View>
  );
};
