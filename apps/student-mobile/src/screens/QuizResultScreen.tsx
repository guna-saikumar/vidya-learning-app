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
import { HoverCard } from '../components/common';
import { RootStackParamList } from '../types/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'QuizResult'>;

export const QuizResultScreen: React.FC<Props> = ({ route, navigation }) => {
  const { quizId, score, correctCount, totalQuestions, timeTaken, passed } = route.params;

  const minutes = Math.floor(timeTaken / 60);
  const seconds = timeTaken % 60;
  const wrongCount = totalQuestions - correctCount;

  return (
    <View className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <HeaderBar
        showBack
        onBackPress={() => navigation.navigate('Tasks')}
        title="Quiz Completed"
        subtitle={passed ? 'Outstanding performance!' : 'Keep practicing and improving'}
      />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 22, paddingTop: 18, paddingBottom: 48, gap: 20 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Result Header Badge */}
        <View className="items-center gap-3 pt-2">
          <View
            className="w-20 h-20 rounded-full items-center justify-center shadow-sm"
            style={{ backgroundColor: passed ? Colors.successBg : Colors.errorBg }}
          >
            <MaterialIcons
              name={passed ? 'emoji-events' : 'replay'}
              size={42}
              color={passed ? Colors.success : Colors.error}
            />
          </View>

          <Text className="font-manrope-extrabold text-2xl text-textPrimary tracking-tight">
            {passed ? 'Great Job!' : 'Keep Practicing!'}
          </Text>
          <Text className="font-manrope-medium text-xs text-textSecondary text-center px-6 leading-5">
            {passed
              ? 'You successfully passed the quiz! Your chapter concepts are well understood.'
              : 'You did not pass this attempt, but revising the lesson will help you master it.'}
          </Text>
        </View>

        {/* Score Card matching Figma aesthetic */}
        <HoverCard
          className="items-center py-7 rounded-[22px] gap-2.5 shadow-md"
          lift={-3}
          style={{ backgroundColor: passed ? Colors.primaryDark : '#4a3832' }}
        >
          <Text className="font-manrope-extrabold text-[11px] text-primaryLight tracking-widest uppercase">
            FINAL SCORE
          </Text>
          <Text className="font-manrope-extrabold text-[52px] text-white tracking-tight leading-[58px]">
            {score}%
          </Text>
          <View className="flex-row items-center gap-1.5 bg-black/15 px-3 py-1 rounded-full">
            <MaterialIcons name="timer" size={15} color={Colors.primaryLight} />
            <Text className="font-manrope-medium text-xs text-primaryLight">
              Time taken: {minutes}m {seconds}s
            </Text>
          </View>
        </HoverCard>

        {/* Stats Grid */}
        <View className="flex-row gap-2.5">
          <View className="flex-1 bg-successBg rounded-2xl py-3.5 items-center border border-[#c8e3d5]">
            <MaterialIcons name="check-circle" size={22} color={Colors.success} />
            <Text className="font-manrope-extrabold text-lg text-success mt-1">{correctCount}</Text>
            <Text className="font-manrope-bold text-[10px] text-success mt-0.5">Correct</Text>
          </View>

          <View className="flex-1 bg-errorBg rounded-2xl py-3.5 items-center border border-[#f0c4c0]">
            <MaterialIcons name="cancel" size={22} color={Colors.error} />
            <Text className="font-manrope-extrabold text-lg text-error mt-1">{wrongCount}</Text>
            <Text className="font-manrope-bold text-[10px] text-error mt-0.5">Wrong</Text>
          </View>

          <View className="flex-1 bg-palePeach rounded-2xl py-3.5 items-center border border-[#f2ded3]">
            <MaterialIcons name="help-outline" size={22} color={Colors.primary} />
            <Text className="font-manrope-extrabold text-lg text-primaryDark mt-1">{totalQuestions}</Text>
            <Text className="font-manrope-bold text-[10px] text-primary mt-0.5">Total</Text>
          </View>
        </View>

        {/* Performance breakdown */}
        <View className="bg-white rounded-[20px] p-5 border border-border shadow-sm gap-3.5">
          <Text className="font-manrope-extrabold text-sm text-textPrimary">Performance Breakdown</Text>

          {/* Accuracy */}
          <View className="gap-1.5">
            <View className="flex-row items-center justify-between">
              <Text className="font-manrope-medium text-xs text-textSecondary">Accuracy</Text>
              <Text className="font-manrope-extrabold text-xs text-primary">{score}%</Text>
            </View>
            <View className="h-2 rounded-full bg-[#F3EDE9] overflow-hidden">
              <View
                className="h-full rounded-full"
                style={{
                  width: `${score}%`,
                  backgroundColor: score >= 60 ? Colors.success : Colors.error,
                }}
              />
            </View>
          </View>

          {/* Speed */}
          <View className="gap-1.5">
            <View className="flex-row items-center justify-between">
              <Text className="font-manrope-medium text-xs text-textSecondary">Average Speed</Text>
              <Text className="font-manrope-extrabold text-xs text-primary">
                {Math.round(timeTaken / (totalQuestions || 1))}s / question
              </Text>
            </View>
            <View className="h-2 rounded-full bg-[#F3EDE9] overflow-hidden">
              <View
                className="h-full rounded-full bg-accentGold"
                style={{ width: `${Math.min(100, Math.round((120 - (timeTaken / (totalQuestions || 1))) / 1.2))}%` }}
              />
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View className="gap-2.5">
          <TouchableOpacity
            className="flex-row items-center justify-center gap-2 py-3.5 rounded-2xl bg-primary shadow-sm"
            onPress={() => navigation.replace('Quiz', { quizId })}
            activeOpacity={0.85}
          >
            <MaterialIcons name="refresh" size={18} color={Colors.white} />
            <Text className="font-manrope-bold text-sm text-white">Retake Quiz</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-row items-center justify-center gap-2 py-3.5 rounded-2xl border border-border bg-white shadow-sm"
            onPress={() => navigation.navigate('Tasks')}
            activeOpacity={0.85}
          >
            <MaterialIcons name="assignment" size={18} color={Colors.primary} />
            <Text className="font-manrope-bold text-sm text-primary">View Assigned Tasks</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-row items-center justify-center gap-2 py-3 rounded-2xl"
            onPress={() => navigation.navigate('Home')}
            activeOpacity={0.85}
          >
            <MaterialIcons name="home" size={18} color={Colors.textSecondary} />
            <Text className="font-manrope-semibold text-xs text-textSecondary">Back to Home</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Persistent Bottom Navigation */}
      <BottomNav activeTab="Tasks" navigation={navigation} />
    </View>
  );
};
