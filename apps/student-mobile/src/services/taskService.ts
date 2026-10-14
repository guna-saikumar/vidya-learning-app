import AsyncStorage from '@react-native-async-storage/async-storage';
import { Task, TaskFilter } from '../types/tasks';
import { MOCK_TASKS } from '../data/tasks';

const STORAGE_KEY = '@vidya_tasks';

export const initializeTasksIfNeeded = async (): Promise<void> => {
  try {
    const existing = await AsyncStorage.getItem(STORAGE_KEY);
    if (!existing) {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(MOCK_TASKS));
    }
  } catch (error) {
    console.error('Failed to initialize tasks:', error);
  }
};

export const getAllTasks = async (): Promise<Task[]> => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEY);
    if (data) {
      const tasks: Task[] = JSON.parse(data);
      // Auto-mark overdue tasks
      const now = Date.now();
      return tasks.map((t) => {
        if (t.status === 'pending' && t.dueDate && t.dueDate < now) {
          return { ...t, status: 'overdue' as const };
        }
        return t;
      });
    }
    return MOCK_TASKS;
  } catch {
    return MOCK_TASKS;
  }
};

export const getFilteredTasks = async (filter: TaskFilter): Promise<Task[]> => {
  const all = await getAllTasks();
  switch (filter) {
    case 'pending':
      return all.filter((t) => t.status === 'pending' || t.status === 'in-progress');
    case 'completed':
      return all.filter((t) => t.status === 'completed');
    case 'overdue':
      return all.filter((t) => t.status === 'overdue');
    default:
      return all;
  }
};

export const getTaskStats = async () => {
  const all = await getAllTasks();
  return {
    total: all.length,
    pending: all.filter((t) => t.status === 'pending' || t.status === 'in-progress').length,
    completed: all.filter((t) => t.status === 'completed').length,
    overdue: all.filter((t) => t.status === 'overdue').length,
  };
};

export const completeTask = async (taskId: string, score?: number, maxScore?: number): Promise<void> => {
  try {
    const tasks = await getAllTasks();
    const updated = tasks.map((t) => {
      if (t.id === taskId) {
        return {
          ...t,
          status: 'completed' as const,
          completedAt: Date.now(),
          completedQuestions: t.totalQuestions,
          score: score ?? t.score,
          maxScore: maxScore ?? t.maxScore,
        };
      }
      return t;
    });
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('Failed to complete task:', error);
  }
};

export const updateTaskProgress = async (
  taskId: string,
  completedQuestions: number
): Promise<void> => {
  try {
    const tasks = await getAllTasks();
    const updated = tasks.map((t) => {
      if (t.id === taskId) {
        return {
          ...t,
          status: 'in-progress' as const,
          completedQuestions,
        };
      }
      return t;
    });
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('Failed to update task progress:', error);
  }
};
