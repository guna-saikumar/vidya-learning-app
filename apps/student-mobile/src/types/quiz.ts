export type QuizDifficulty = 'easy' | 'medium' | 'hard';

export type QuizQuestion = {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  difficulty: QuizDifficulty;
  topic?: string;
};

export type Quiz = {
  id: string;
  title: string;
  description: string;
  subjectId: string;
  subjectName: string;
  classId: string;
  chapterId: string;
  chapterTitle: string;
  questions: QuizQuestion[];
  timeLimitMinutes: number;
  passingScore: number;
  icon: string;
};

export type QuizAttempt = {
  quizId: string;
  answers: Record<string, number>; // questionId -> selectedIndex
  score: number;
  totalQuestions: number;
  correctCount: number;
  timeTakenSeconds: number;
  completedAt: number;
  passed: boolean;
};

export type QuizState = {
  currentQuestionIndex: number;
  answers: Record<string, number>;
  timeRemainingSeconds: number;
  isFinished: boolean;
};

export type Notification = {
  id: string;
  title: string;
  message: string;
  detailedBody?: string;
  actionLabel?: string;
  type: 'announcement' | 'reminder' | 'achievement' | 'update';
  icon: string;
  read: boolean;
  createdAt: number;
  actionRoute?: string;
  actionParams?: Record<string, string>;
};
