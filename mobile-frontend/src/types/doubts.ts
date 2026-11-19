export type DoubtAuthorRole = 'student' | 'teacher';

export type DoubtAuthor = {
  id: string;
  name: string;
  role: DoubtAuthorRole;
};

/** Derived from answers + resolution, never stored. See getDoubtStatus(). */
export type DoubtStatus = 'open' | 'peer_answered' | 'teacher_answered' | 'resolved';

export type DoubtFilter = 'all' | 'unanswered' | 'mine';

export type DoubtAnswer = {
  id: string;
  doubtId: string;
  author: DoubtAuthor;
  body: string;
  helpfulCount: number;
  markedHelpfulByMe: boolean;
  isAccepted: boolean;
  createdAt: string; // ISO 8601
};

/** One row in the list screen. */
export type DoubtSummary = {
  id: string;
  chapterId: string;
  sectionId?: string;
  title: string;
  preview: string;
  author: DoubtAuthor;
  createdAt: string; // ISO 8601
  upvoteCount: number;
  upvotedByMe: boolean;
  answerCount: number;
  hasTeacherAnswer: boolean;
  isResolved: boolean;
};

/** Full thread shown on the detail screen. */
export type DoubtThread = Omit<DoubtSummary, 'preview' | 'answerCount' | 'hasTeacherAnswer'> & {
  body: string;
  answers: DoubtAnswer[];
};

export type CreateDoubtInput = {
  chapterId: string;
  sectionId?: string;
  title: string;
  body: string;
};
