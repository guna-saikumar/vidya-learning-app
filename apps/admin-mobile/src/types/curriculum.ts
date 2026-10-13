export type SubjectCategory = 'all' | 'stem' | 'languages' | 'social';

export type PublicationStatus = 'draft' | 'published' | 'archived';

export interface Section {
  id: string;
  chapterId: string;
  sectionNumber: number;
  title: string;
  content: string;
  summaryPoint?: string;
  keyAxiom?: string;
  durationMinutes?: number;
  displayOrder: number;
  status: PublicationStatus;
}

export interface Chapter {
  id: string;
  subjectId: string;
  chapterNumber: number;
  title: string;
  description?: string;
  unitName?: string;
  durationMinutes?: number;
  learningGoals: string[];
  bannerUrl?: string;
  displayOrder: number;
  status: PublicationStatus;
  sections: Section[];
  quiz?: {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  };
}

export interface Subject {
  id: string;
  classId: string;
  code: string;
  name: string;
  description?: string;
  category: SubjectCategory;
  iconName: string;
  bannerUrl?: string;
  displayOrder: number;
  isArchived: boolean;
  chapters: Chapter[];
}

export interface SchoolClass {
  id: string;
  grade: number;
  title: string;
  subtitle: string;
  badge: string;
  displayOrder: number;
  subjects: Subject[];
}

export interface AcademicBoardConfig {
  boardName: string;
  academicYear: string;
  state: string;
  classesSupported: number[];
}
