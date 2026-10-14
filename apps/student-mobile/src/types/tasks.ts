export type TaskType = 'quiz' | 'assignment' | 'practice' | 'revision';
export type TaskStatus = 'pending' | 'in-progress' | 'completed' | 'overdue';
export type TaskPriority = 'high' | 'medium' | 'low';

export type Task = {
  id: string;
  title: string;
  description: string;
  type: TaskType;
  status: TaskStatus;
  priority: TaskPriority;
  subjectId: string;
  subjectName: string;
  classId: string;
  chapterId?: string;
  chapterTitle?: string;
  dueDate?: number;
  estimatedMinutes: number;
  totalQuestions?: number;
  completedQuestions?: number;
  score?: number;
  maxScore?: number;
  createdAt: number;
  completedAt?: number;
  icon: string;
};

export type TaskFilter = 'all' | 'pending' | 'completed' | 'overdue';
export type TaskSort = 'due-date' | 'priority' | 'subject';
