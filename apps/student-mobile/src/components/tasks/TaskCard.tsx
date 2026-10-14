import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Colors from '../../constants/colors';
import { Task } from '../../types/tasks';

interface TaskCardProps {
  task: Task;
  onPress: () => void;
}

const priorityConfig = {
  high: { color: Colors.error, bg: 'bg-errorBg', label: 'HIGH' },
  medium: { color: Colors.accentGold, bg: 'bg-accentGoldBg', label: 'MEDIUM' },
  low: { color: Colors.success, bg: 'bg-successBg', label: 'LOW' },
};

const statusConfig = {
  pending: { color: Colors.accentGold, icon: 'schedule' as const, label: 'Pending' },
  'in-progress': { color: Colors.primary, icon: 'hourglass-top' as const, label: 'In Progress' },
  completed: { color: Colors.success, icon: 'check-circle' as const, label: 'Completed' },
  overdue: { color: Colors.error, icon: 'warning' as const, label: 'Overdue' },
};

const typeIcons: Record<string, keyof typeof MaterialIcons.glyphMap> = {
  quiz: 'quiz',
  assignment: 'assignment',
  practice: 'edit',
  revision: 'replay',
};

const formatDueDate = (timestamp?: number): string => {
  if (!timestamp) return '';
  const now = Date.now();
  const diff = timestamp - now;
  const days = Math.ceil(diff / 86400000);

  if (days < 0) return `${Math.abs(days)}d overdue`;
  if (days === 0) return 'Due today';
  if (days === 1) return 'Due tomorrow';
  return `Due in ${days} days`;
};

export const TaskCard: React.FC<TaskCardProps> = ({ task, onPress }) => {
  const priority = priorityConfig[task.priority];
  const status = statusConfig[task.status];
  const iconName = typeIcons[task.type] || 'assignment';

  const hasProgress = task.totalQuestions && task.completedQuestions !== undefined;
  const progressPercent = hasProgress
    ? Math.round(((task.completedQuestions || 0) / task.totalQuestions!) * 100)
    : 0;

  return (
    <TouchableOpacity
      className="bg-white rounded-[20px] p-5 border border-border shadow-sm"
      onPress={onPress}
      activeOpacity={0.85}
    >
      <View className="flex-row items-start gap-3.5">
        {/* Icon */}
        <View
          className="w-11 h-11 rounded-xl items-center justify-center"
          style={{ backgroundColor: task.status === 'completed' ? Colors.successBg : Colors.palePeach }}
        >
          <MaterialIcons
            name={task.status === 'completed' ? 'check-circle' : iconName}
            size={24}
            color={task.status === 'completed' ? Colors.success : Colors.primary}
          />
        </View>

        {/* Content */}
        <View className="flex-1">
          {/* Subject & Priority badges */}
          <View className="flex-row items-center gap-2 mb-1">
            <Text className="font-manrope-bold text-[11px] text-primary">{task.subjectName}</Text>
            <View
              className="px-1.5 py-0.5 rounded"
              style={{ backgroundColor: priority.color + '18' }}
            >
              <Text
                className="font-manrope-extrabold text-[9px]"
                style={{ color: priority.color }}
              >
                {priority.label}
              </Text>
            </View>
          </View>

          {/* Title */}
          <Text className="font-manrope-extrabold text-[15px] text-textPrimary tracking-tight" numberOfLines={1}>
            {task.title}
          </Text>

          {/* Description */}
          <Text className="font-manrope-medium text-xs text-textSecondary mt-0.5 leading-4" numberOfLines={2}>
            {task.description}
          </Text>
        </View>
      </View>

      {/* Progress bar (if applicable) */}
      {hasProgress && task.status !== 'completed' && (
        <View className="mt-3 gap-1.5">
          <View className="flex-row items-center justify-between">
            <Text className="font-manrope-medium text-xs text-textSecondary">
              {task.completedQuestions || 0} of {task.totalQuestions} questions
            </Text>
            <Text className="font-manrope-extrabold text-xs text-primary">{progressPercent}%</Text>
          </View>
          <View className="h-1.5 rounded-full bg-[#F3EDE9] overflow-hidden">
            <View
              className="h-full rounded-full bg-primary"
              style={{ width: `${progressPercent}%` }}
            />
          </View>
        </View>
      )}

      {/* Score (for completed tasks) */}
      {task.status === 'completed' && task.score !== undefined && (
        <View className="mt-3 flex-row items-center gap-2 bg-successBg px-3 py-2 rounded-xl">
          <MaterialIcons name="emoji-events" size={16} color={Colors.success} />
          <Text className="font-manrope-bold text-xs text-success">
            Score: {task.score}/{task.maxScore}
          </Text>
        </View>
      )}

      {/* Footer: Due date & Status & Time */}
      <View className="flex-row items-center justify-between mt-3 pt-3 border-t border-border">
        <View className="flex-row items-center gap-3">
          {/* Status badge */}
          <View className="flex-row items-center gap-1">
            <MaterialIcons name={status.icon} size={14} color={status.color} />
            <Text className="font-manrope-bold text-[11px]" style={{ color: status.color }}>
              {status.label}
            </Text>
          </View>

          {/* Due date */}
          {task.dueDate && task.status !== 'completed' && (
            <Text className="font-manrope-medium text-[11px] text-textMuted">
              {formatDueDate(task.dueDate)}
            </Text>
          )}
        </View>

        {/* Estimated time */}
        <View className="flex-row items-center gap-1">
          <MaterialIcons name="schedule" size={12} color={Colors.textMuted} />
          <Text className="font-manrope-medium text-[11px] text-textMuted">
            {task.estimatedMinutes} min
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};
