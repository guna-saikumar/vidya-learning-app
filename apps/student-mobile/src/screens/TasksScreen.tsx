import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  RefreshControl,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MaterialIcons } from '@expo/vector-icons';
import Colors from '../constants/colors';
import { HeaderBar, BottomNav } from '../components/navigation';
import { PageIntro } from '../components/common';
import { TaskCard } from '../components/tasks';
import { getAllTasks, getTaskStats, initializeTasksIfNeeded } from '../services/taskService';
import { RootStackParamList } from '../types/navigation';
import { Task, TaskFilter } from '../types/tasks';

type Props = NativeStackScreenProps<RootStackParamList, 'Tasks'>;

export const TasksScreen: React.FC<Props> = ({ navigation }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, completed: 0, overdue: 0 });
  const [selectedFilter, setSelectedFilter] = useState<TaskFilter>('all');
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    await initializeTasksIfNeeded();
    const allTasks = await getAllTasks();
    const taskStats = await getTaskStats();
    setTasks(allTasks);
    setStats(taskStats);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  const filteredTasks = tasks.filter((t) => {
    switch (selectedFilter) {
      case 'pending':
        return t.status === 'pending' || t.status === 'in-progress';
      case 'completed':
        return t.status === 'completed';
      case 'overdue':
        return t.status === 'overdue';
      default:
        return true;
    }
  });

  const handleTaskPress = (task: Task) => {
    if (task.type === 'quiz' && task.status !== 'completed') {
      navigation.navigate('Quiz', {
        quizId: `quiz-${task.chapterId}`,
        classId: task.classId,
        subjectId: task.subjectId,
        chapterId: task.chapterId || '',
      });
    } else if (task.chapterId) {
      navigation.navigate('ChapterDetails', {
        classId: task.classId,
        subjectId: task.subjectId,
        chapterId: task.chapterId,
      });
    }
  };

  const filters: { key: TaskFilter; label: string; count: number }[] = [
    { key: 'all', label: 'All', count: stats.total },
    { key: 'pending', label: 'Pending', count: stats.pending },
    { key: 'completed', label: 'Done', count: stats.completed },
    { key: 'overdue', label: 'Overdue', count: stats.overdue },
  ];

  return (
    <View className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />
      <HeaderBar
        activeRoute="Tasks"
        onProfilePress={() => navigation.navigate('Profile')}
      />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 22, paddingTop: 18, paddingBottom: 48, gap: 20 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.primary}
            colors={[Colors.primary]}
          />
        }
      >
        {/* Page Heading */}
        <PageIntro
          eyebrow="STUDY TASKS"
          badge={`${stats.pending} Pending`}
          title="My Tasks"
        />

        {/* Stats Cards */}
        <View className="flex-row gap-2.5">
          <View className="flex-1 bg-palePeach rounded-2xl py-3.5 px-3 items-center border border-[#f2ded3]">
            <Text className="font-manrope-extrabold text-xl text-primaryDark">{stats.pending}</Text>
            <Text className="font-manrope-bold text-[11px] text-primary mt-0.5">Pending</Text>
          </View>
          <View className="flex-1 bg-successBg rounded-2xl py-3.5 px-3 items-center border border-[#c8e3d5]">
            <Text className="font-manrope-extrabold text-xl text-success">{stats.completed}</Text>
            <Text className="font-manrope-bold text-[11px] text-success mt-0.5">Completed</Text>
          </View>
          <View className="flex-1 bg-errorBg rounded-2xl py-3.5 px-3 items-center border border-[#f0c4c0]">
            <Text className="font-manrope-extrabold text-xl text-error">{stats.overdue}</Text>
            <Text className="font-manrope-bold text-[11px] text-error mt-0.5">Overdue</Text>
          </View>
        </View>

        {/* Filter Pills */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8 }}
        >
          {filters.map((f) => (
            <TouchableOpacity
              key={f.key}
              className={`px-4 py-2 rounded-full border ${
                selectedFilter === f.key
                  ? 'bg-primary border-primary'
                  : 'bg-softWarm border-border'
              }`}
              onPress={() => setSelectedFilter(f.key)}
            >
              <Text
                className={`font-manrope-bold text-xs ${
                  selectedFilter === f.key ? 'text-white' : 'text-textSecondary'
                }`}
              >
                {f.label} ({f.count})
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Task List */}
        <View className="gap-3">
          {filteredTasks.length > 0 ? (
            filteredTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onPress={() => handleTaskPress(task)}
              />
            ))
          ) : (
            <View className="items-center justify-center py-16 gap-2.5">
              <View className="w-14 h-14 rounded-[17px] bg-palePeach items-center justify-center mb-1.5">
                <MaterialIcons
                  name={selectedFilter === 'completed' ? 'check-circle' : 'assignment'}
                  size={28}
                  color={Colors.primary}
                />
              </View>
              <Text className="font-manrope-extrabold text-[17px] text-textPrimary">
                {selectedFilter === 'completed' ? 'No completed tasks yet' : 'No tasks found'}
              </Text>
              <Text className="font-manrope-medium text-[13px] text-textMuted text-center px-8 leading-[18px]">
                {selectedFilter === 'completed'
                  ? 'Complete quizzes and assignments to see them here.'
                  : 'All caught up! No pending tasks right now.'}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
      <BottomNav activeTab="Tasks" navigation={navigation} />
    </View>
  );
};
