import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Colors from '../../constants/colors';
import { QuizQuestion as QuizQuestionType } from '../../types/quiz';

interface QuizQuestionProps {
  question: QuizQuestionType;
  questionNumber: number;
  totalQuestions: number;
  selectedAnswer: number | undefined;
  isSubmitted: boolean;
  onSelectAnswer: (index: number) => void;
}

const OPTION_LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'];

export const QuizQuestionCard: React.FC<QuizQuestionProps> = ({
  question,
  questionNumber,
  totalQuestions,
  selectedAnswer,
  isSubmitted,
  onSelectAnswer,
}) => {
  const difficultyConfig = {
    easy: { label: 'Easy', color: Colors.success, bg: Colors.successBg },
    medium: { label: 'Medium', color: Colors.accentGold, bg: Colors.accentGoldBg },
    hard: { label: 'Hard', color: Colors.error, bg: Colors.errorBg },
  };

  const diff = difficultyConfig[question.difficulty] || difficultyConfig.medium;

  return (
    <View className="gap-4">
      {/* Top Question Tag Bar */}
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-2">
          <View className="bg-palePeach px-2.5 py-1 rounded-lg">
            <Text className="font-manrope-extrabold text-[11px] text-primary tracking-wide uppercase">
              Question {questionNumber} / {totalQuestions}
            </Text>
          </View>
          {question.topic && (
            <View className="bg-surfaceSoft px-2.5 py-1 rounded-lg border border-border">
              <Text className="font-manrope-bold text-[11px] text-textSecondary" numberOfLines={1}>
                {question.topic}
              </Text>
            </View>
          )}
        </View>

        <View className="px-2.5 py-1 rounded-lg" style={{ backgroundColor: diff.bg }}>
          <Text className="font-manrope-extrabold text-[10px] tracking-wide" style={{ color: diff.color }}>
            {diff.label.toUpperCase()}
          </Text>
        </View>
      </View>

      {/* Question Card Container */}
      <View className="bg-white rounded-[22px] p-5 border border-border shadow-sm gap-3">
        <Text className="font-manrope-extrabold text-base text-textPrimary leading-[24px]">
          {question.question}
        </Text>
      </View>

      {/* Options List */}
      <View className="gap-2.5">
        {question.options.map((option, index) => {
          const letter = OPTION_LETTERS[index] || `${index + 1}`;
          const isSelected = selectedAnswer === index;
          const isCorrect = index === question.correctIndex;
          const showCorrect = isSubmitted && isCorrect;
          const showWrong = isSubmitted && isSelected && !isCorrect;

          let borderColor = Colors.border;
          let bgColor = Colors.white;
          let textColor = Colors.textPrimary;
          let badgeBg = '#F3EDE9';
          let badgeTextColor = Colors.textSecondary;

          if (showCorrect) {
            borderColor = Colors.success;
            bgColor = Colors.successBg;
            textColor = Colors.success;
            badgeBg = Colors.success;
            badgeTextColor = Colors.white;
          } else if (showWrong) {
            borderColor = Colors.error;
            bgColor = Colors.errorBg;
            textColor = Colors.error;
            badgeBg = Colors.error;
            badgeTextColor = Colors.white;
          } else if (isSelected && !isSubmitted) {
            borderColor = Colors.primary;
            bgColor = Colors.palePeach;
            textColor = Colors.primary;
            badgeBg = Colors.primary;
            badgeTextColor = Colors.white;
          }

          return (
            <TouchableOpacity
              key={index}
              className="flex-row items-center gap-3 p-3.5 rounded-2xl border transition-all"
              style={{ borderColor, backgroundColor: bgColor }}
              onPress={() => !isSubmitted && onSelectAnswer(index)}
              activeOpacity={isSubmitted ? 1 : 0.8}
              disabled={isSubmitted}
            >
              {/* Option Letter Indicator */}
              <View
                className="w-8 h-8 rounded-xl items-center justify-center"
                style={{ backgroundColor: badgeBg }}
              >
                <Text
                  className="font-manrope-extrabold text-xs"
                  style={{ color: badgeTextColor }}
                >
                  {letter}
                </Text>
              </View>

              {/* Option Text */}
              <Text
                className="font-manrope-semibold text-[13px] flex-1 leading-5"
                style={{ color: textColor }}
              >
                {option}
              </Text>

              {/* Feedback Icons */}
              {showCorrect && (
                <MaterialIcons name="check-circle" size={20} color={Colors.success} />
              )}
              {showWrong && (
                <MaterialIcons name="cancel" size={20} color={Colors.error} />
              )}
              {isSelected && !isSubmitted && (
                <MaterialIcons name="radio-button-checked" size={20} color={Colors.primary} />
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Explanation Box (when submitted/checked) */}
      {isSubmitted && (
        <View className="bg-accentGoldBg rounded-2xl p-4 gap-2 border border-[#edd7a6] mt-1 shadow-sm">
          <View className="flex-row items-center gap-2">
            <MaterialIcons name="lightbulb" size={18} color={Colors.accentGoldDark} />
            <Text className="font-manrope-extrabold text-xs text-accentGoldDark uppercase tracking-wider">
              Concept & Explanation
            </Text>
          </View>
          <Text className="font-manrope-medium text-xs text-textLead leading-5">
            {question.explanation}
          </Text>
        </View>
      )}
    </View>
  );
};
