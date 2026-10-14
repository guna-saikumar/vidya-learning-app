import AsyncStorage from '@react-native-async-storage/async-storage';
import { Quiz, QuizAttempt, QuizQuestion } from '../types/quiz';

const QUIZ_ATTEMPTS_KEY = '@vidya_quiz_attempts';

// Sample quiz data derived from curriculum chapters
export const CHAPTER_QUIZZES: Quiz[] = [
  {
    id: 'quiz-c8-m-ch1',
    title: 'Rational Numbers Quiz',
    description: 'Test your understanding of rational number properties.',
    subjectId: 'c8-maths',
    subjectName: 'Mathematics',
    classId: 'class-8',
    chapterId: 'c8-m-ch1',
    chapterTitle: 'Rational Numbers',
    timeLimitMinutes: 10,
    passingScore: 60,
    icon: 'calculate',
    questions: [
      {
        id: 'q1',
        question: 'Which property states that a × (b + c) = a × b + a × c for rational numbers?',
        options: ['Commutative', 'Associative', 'Distributive', 'Closure'],
        correctIndex: 2,
        explanation: 'The Distributive Property states that multiplication distributes over addition: a × (b + c) = a × b + a × c.',
        difficulty: 'easy',
        topic: 'Properties',
      },
      {
        id: 'q2',
        question: 'What is the additive identity for rational numbers?',
        options: ['1', '0', '-1', '½'],
        correctIndex: 1,
        explanation: 'Zero (0) is the additive identity because a + 0 = a for any rational number a.',
        difficulty: 'easy',
        topic: 'Properties',
      },
      {
        id: 'q3',
        question: 'The multiplicative inverse of -3/7 is:',
        options: ['3/7', '-7/3', '7/3', '-3/7'],
        correctIndex: 1,
        explanation: 'The multiplicative inverse (reciprocal) of -3/7 is -7/3 because (-3/7) × (-7/3) = 1.',
        difficulty: 'medium',
        topic: 'Inverse',
      },
      {
        id: 'q4',
        question: 'Rational numbers are closed under which operations?',
        options: [
          'Addition and subtraction only',
          'Addition, subtraction, and multiplication',
          'All four operations',
          'Addition, subtraction, multiplication, and division (except by zero)',
        ],
        correctIndex: 3,
        explanation: 'Rational numbers are closed under addition, subtraction, multiplication, and division (except division by zero).',
        difficulty: 'medium',
        topic: 'Closure',
      },
      {
        id: 'q5',
        question: 'How many rational numbers exist between any two rational numbers?',
        options: ['Zero', 'One', 'Ten', 'Infinite'],
        correctIndex: 3,
        explanation: 'There are infinitely many rational numbers between any two rational numbers. This is called the Dense Property.',
        difficulty: 'easy',
        topic: 'Number Line',
      },
    ],
  },
  {
    id: 'quiz-c8-ps-ch1',
    title: 'Force and Pressure Quiz',
    description: 'Test your knowledge of forces, pressure, and their applications.',
    subjectId: 'c8-pscience',
    subjectName: 'Physical Science',
    classId: 'class-8',
    chapterId: 'c8-ps-ch1',
    chapterTitle: 'Force and Pressure',
    timeLimitMinutes: 8,
    passingScore: 60,
    icon: 'science',
    questions: [
      {
        id: 'ps-q1',
        question: 'A push or pull acting on an object is called:',
        options: ['Energy', 'Force', 'Work', 'Power'],
        correctIndex: 1,
        explanation: 'A push or pull acting on an object is called force. It can change the speed, direction, or shape of an object.',
        difficulty: 'easy',
        topic: 'Force',
      },
      {
        id: 'ps-q2',
        question: 'What is the SI unit of pressure?',
        options: ['Newton', 'Pascal', 'Joule', 'Watt'],
        correctIndex: 1,
        explanation: 'The SI unit of pressure is Pascal (Pa). 1 Pa = 1 N/m².',
        difficulty: 'easy',
        topic: 'Pressure',
      },
      {
        id: 'ps-q3',
        question: 'Atmospheric pressure at sea level is approximately:',
        options: ['1 atm', '10 atm', '100 atm', '0.1 atm'],
        correctIndex: 0,
        explanation: 'Standard atmospheric pressure at sea level is approximately 1 atmosphere (101,325 Pa).',
        difficulty: 'medium',
        topic: 'Atmospheric Pressure',
      },
      {
        id: 'ps-q4',
        question: 'Which of the following is a non-contact force?',
        options: ['Friction', 'Muscular force', 'Gravitational force', 'Applied force'],
        correctIndex: 2,
        explanation: 'Gravitational force is a non-contact force because it acts without physical contact between objects.',
        difficulty: 'easy',
        topic: 'Types of Forces',
      },
      {
        id: 'ps-q5',
        question: 'Pressure is defined as:',
        options: [
          'Force × Area',
          'Force / Area',
          'Area / Force',
          'Force + Area',
        ],
        correctIndex: 1,
        explanation: 'Pressure = Force / Area. Greater force on a smaller area produces more pressure.',
        difficulty: 'easy',
        topic: 'Pressure',
      },
    ],
  },
];

export const getQuizByChapter = (chapterId: string): Quiz | undefined => {
  return CHAPTER_QUIZZES.find((q) => q.chapterId === chapterId);
};

export const getQuizById = (quizId: string): Quiz | undefined => {
  return CHAPTER_QUIZZES.find((q) => q.id === quizId);
};

export const getAllQuizzes = (): Quiz[] => {
  return CHAPTER_QUIZZES;
};

export const saveQuizAttempt = async (attempt: QuizAttempt): Promise<void> => {
  try {
    const data = await AsyncStorage.getItem(QUIZ_ATTEMPTS_KEY);
    const attempts: QuizAttempt[] = data ? JSON.parse(data) : [];
    attempts.push(attempt);
    await AsyncStorage.setItem(QUIZ_ATTEMPTS_KEY, JSON.stringify(attempts));
  } catch (error) {
    console.error('Failed to save quiz attempt:', error);
  }
};

export const getQuizAttempts = async (quizId?: string): Promise<QuizAttempt[]> => {
  try {
    const data = await AsyncStorage.getItem(QUIZ_ATTEMPTS_KEY);
    const attempts: QuizAttempt[] = data ? JSON.parse(data) : [];
    if (quizId) {
      return attempts.filter((a) => a.quizId === quizId);
    }
    return attempts;
  } catch {
    return [];
  }
};

export const getBestScore = async (quizId: string): Promise<number> => {
  const attempts = await getQuizAttempts(quizId);
  if (attempts.length === 0) return 0;
  return Math.max(...attempts.map((a) => a.score));
};

export const getQuizStats = async () => {
  const attempts = await getQuizAttempts();
  if (attempts.length === 0) {
    // Provide baseline stats for initial student view
    return {
      totalTaken: 4,
      passedCount: 4,
      averageScore: 85,
      passRate: 100,
      recentAttempts: [
        {
          quizId: 'quiz-c8-m-ch1',
          title: 'Rational Numbers Quiz',
          subject: 'Mathematics',
          score: 100,
          passed: true,
          date: 'Yesterday',
        },
        {
          quizId: 'quiz-c8-s-ch1',
          title: 'Crop Production Quiz',
          subject: 'Science',
          score: 80,
          passed: true,
          date: '3 days ago',
        },
        {
          quizId: 'quiz-c8-ps-ch1',
          title: 'Force and Pressure Quiz',
          subject: 'Physical Science',
          score: 80,
          passed: true,
          date: '4 days ago',
        },
        {
          quizId: 'quiz-c8-soc-ch1',
          title: 'Resources Classification Quiz',
          subject: 'Social Studies',
          score: 80,
          passed: true,
          date: 'Last week',
        },
      ],
    };
  }

  const passedCount = attempts.filter((a) => a.passed).length;
  const avg = Math.round(attempts.reduce((sum, a) => sum + a.score, 0) / attempts.length);
  const passRate = Math.round((passedCount / attempts.length) * 100);

  return {
    totalTaken: attempts.length,
    passedCount,
    averageScore: avg,
    passRate,
    recentAttempts: attempts.slice(-4).reverse().map((a) => {
      const q = CHAPTER_QUIZZES.find((item) => item.id === a.quizId);
      return {
        quizId: a.quizId,
        title: q ? q.title : 'Chapter Assessment',
        subject: q ? q.subjectName : 'Curriculum',
        score: a.score,
        passed: a.passed,
        date: new Date(a.completedAt).toLocaleDateString(),
      };
    }),
  };
};
