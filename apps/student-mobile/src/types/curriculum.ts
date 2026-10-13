export type Section = {
  id: string;
  title: string;
  content: string;
  order: number;
  durationMinutes?: number;
  summaryPoint?: string;
  keyAxiom?: string;
};

export type Chapter = {
  id: string;
  title: string;
  description?: string;
  order: number;
  unitName?: string;
  durationMinutes?: number;
  sections: Section[];
  learningGoals?: string[];
  bannerUrl?: string;
  quiz?: {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  };
};

export type SubjectCategory = 'all' | 'stem' | 'languages' | 'social';

export type Subject = {
  id: string;
  name: string;
  description?: string;
  category: SubjectCategory;
  icon: string;
  chapters: Chapter[];
  bannerUrl?: string;
};

export type SchoolClass = {
  id: string;
  grade: number;
  title: string;
  subtitle: string;
  badge: string;
  subjects: Subject[];
};

export type BookmarkItem = {
  id: string;
  classId: string;
  subjectId: string;
  chapterId: string;
  sectionId?: string;
  title: string;
  subtitle: string;
  type: 'chapter' | 'section' | 'formula';
  dateAdded: number;
  previewText?: string;
};

export type ChapterProgress = {
  chapterId: string;
  subjectId: string;
  classId: string;
  completed: boolean;
  completedSections: string[];
  progressPercent: number;
  lastAccessed: number;
};

export type UserProfile = {
  displayName: string;
  activeClassId: string;
  streakDays: number;
  avatarUrl: string;
  studyGoalMinutes: number;
};
