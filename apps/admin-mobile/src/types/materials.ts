export type MaterialType =
  | 'pdf'
  | 'video'
  | 'presentation'
  | 'notes'
  | 'image'
  | 'quiz'
  | 'external';

export type PublicationStatus = 'draft' | 'published' | 'archived';

export interface LectureMaterial {
  id: string;
  title: string;
  description?: string;
  materialType: MaterialType;
  classId: string;
  grade: number;
  subjectId: string;
  subjectName: string;
  chapterId: string;
  chapterTitle: string;
  sectionId?: string;
  sectionTitle?: string;
  language: string;
  displayOrder: number;
  status: PublicationStatus;
  fileUrl?: string;
  fileName?: string;
  fileSizeBytes?: number;
  videoUrl?: string;
  thumbnailUrl?: string;
  notesContent?: string;
  quizData?: {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  };
  createdAt: string;
  updatedAt: string;
  authorName?: string;
}

export interface MaterialFilter {
  classId?: string;
  subjectId?: string;
  chapterId?: string;
  materialType?: MaterialType | 'all';
  status?: PublicationStatus | 'all';
  searchQuery?: string;
}
