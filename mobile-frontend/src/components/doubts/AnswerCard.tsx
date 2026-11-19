import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Colors from '../../constants/colors';
import { formatRelativeTime, getInitials } from '../../utils/doubts';
import type { DoubtAnswer } from '../../types/doubts';

interface AnswerCardProps {
  answer: DoubtAnswer;
  onToggleHelpful: () => void;
  /** Present only when the viewer asked the doubt and it is still open. */
  onAccept?: () => void;
}

export const AnswerCard: React.FC<AnswerCardProps> = ({ answer, onToggleHelpful, onAccept }) => {
  const isTeacher = answer.author.role === 'teacher';
  return (
    <View
      className={`rounded-[20px] p-4 border gap-3 ${
        answer.isAccepted ? 'bg-successBg border-success' : 'bg-white border-border'
      }`}
    >
      <View className="flex-row items-center gap-3">
        <View
          className={`w-9 h-9 rounded-full items-center justify-center ${
            isTeacher ? 'bg-primary' : 'bg-palePeach'
          }`}
        >
          <Text className={`font-manrope-extrabold text-xs ${isTeacher ? 'text-white' : 'text-primary'}`}>
            {getInitials(answer.author.name)}
          </Text>
        </View>
        <View className="flex-1 gap-1" style={{ minWidth: 0 }}>
          <View className="flex-row flex-wrap items-center gap-1.5">
            <Text className="font-manrope-extrabold text-sm text-textPrimary">{answer.author.name}</Text>
            {isTeacher && (
              <View className="px-2 py-0.5 rounded-full bg-palePeach">
                <Text className="font-manrope-bold text-[11px] text-primary">Teacher</Text>
              </View>
            )}
            {answer.isAccepted && (
              <View className="flex-row items-center gap-1 px-2 py-0.5 rounded-full bg-white">
                <MaterialIcons name="check-circle" size={12} color={Colors.success} />
                <Text className="font-manrope-bold text-[11px] text-success">Accepted answer</Text>
              </View>
            )}
          </View>
          <Text className="font-manrope-medium text-xs text-textMuted">
            {formatRelativeTime(answer.createdAt)}
          </Text>
        </View>
      </View>

      <Text className="font-manrope-medium text-sm text-textPrimary leading-[22px]">{answer.body}</Text>

      <View className="flex-row flex-wrap items-center gap-2.5">
        <TouchableOpacity
          className={`flex-row items-center gap-1.5 px-3.5 h-11 rounded-xl border ${
            answer.markedHelpfulByMe ? 'bg-palePeach border-primary' : 'bg-white border-border'
          }`}
          onPress={onToggleHelpful}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel={`Helpful, ${answer.helpfulCount}`}
          accessibilityState={{ selected: answer.markedHelpfulByMe }}
        >
          <MaterialIcons
            name={answer.markedHelpfulByMe ? 'thumb-up' : 'thumb-up-off-alt'}
            size={16}
            color={answer.markedHelpfulByMe ? Colors.primary : Colors.textSecondary}
          />
          <Text
            className={`font-manrope-bold text-xs ${
              answer.markedHelpfulByMe ? 'text-primary' : 'text-textPrimary'
            }`}
          >
            Helpful · {answer.helpfulCount}
          </Text>
        </TouchableOpacity>

        {onAccept && (
          <TouchableOpacity
            className="flex-row items-center gap-1.5 px-3.5 h-11 rounded-xl border border-success bg-white"
            onPress={onAccept}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Accept this answer and mark the doubt resolved"
          >
            <MaterialIcons name="check" size={16} color={Colors.success} />
            <Text className="font-manrope-bold text-xs text-success">Accept answer</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};
