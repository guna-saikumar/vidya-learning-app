export type AuthMe = {
  user: { id: string; email: string };
  isOnboarded: boolean;
};

export type Profile = {
  id: string;
  email: string;
  name: string;
  firstName: string | null;
  lastName: string | null;
  gender: string | null;
  dob: string | null;
  dateOfBirth: string | null;
  grade: string | null;
  section: string | null;
  medium: string | null;
  schoolName: string | null;
  classId: string | null;
  activeClassId: string | null;
  district: string | null;
  location: string | null;
  villageCity: string | null;
  rollNumber: string | null;
  fatherName: string | null;
  motherName: string | null;
  parentPhone: string | null;
  avatarUrl: string | null;
  streakDays: number;
  studyGoalMinutes: number | null;
  language: string;
  notificationsEnabled: boolean;
  isOnboarded: boolean;
};

export type ClassItem = {
  id: string;
  grade: number;
  title: string;
  subtitle: string | null;
  badge: string | null;
  subjectsCount: number;
  chaptersCount: number;
};

export type SubjectSummary = {
  id: string;
  classId: string;
  title: string;
  code: string;
  description?: string;
  category: string;
  icon: string;
  bannerUrl?: string;
  order: number;
  totalChapters: number;
  estimatedHours: number;
};

export type ChapterSummary = {
  id: string;
  subjectId: string;
  title: string;
  description?: string;
  order: number;
  unitName?: string;
  durationMinutes?: number;
  bannerUrl?: string;
  pdfUrl?: string;
  sectionCount: number;
};

export type SectionSummary = {
  id: string;
  chapterId: string;
  title: string;
  contentMarkdown: string;
  order: number;
  durationMinutes?: number;
  summaryPoint?: string;
  keyAxiom?: string;
  keyPoints: string[];
  diagrams: unknown[];
};

export type SubjectDetail = SubjectSummary & {
  chapters: ChapterSummary[];
};

export type ChapterDetail = ChapterSummary & {
  classId: string;
  learningGoals: string[];
  sections: SectionSummary[];
};

export type SectionDetail = SectionSummary & {
  subjectId: string;
  classId: string;
};

export type ProgressChapter = {
  chapterId: string;
  subjectId?: string;
  classId?: string;
  progressPercent: number;
  completed: boolean;
  completedSections: string[];
  lastAccessedAt: string;
  lastSectionId: string | null;
};

export type ProgressResponse = {
  overallPercent: number;
  chapters: Record<string, ProgressChapter>;
};

export type Bookmark = {
  id: string;
  classId: string;
  chapterId: string;
  chapterTitle: string;
  subjectId: string;
  subjectName: string;
  sectionId: string | null;
  sectionTitle: string | null;
  title: string;
  subtitle: string | null;
  type: "chapter" | "section" | "formula";
  previewText: string | null;
  dateAdded: string;
  createdAt: string;
};

export type NotificationItem = {
  id: string;
  title: string;
  body: string;
  detailedBody: string;
  type: string;
  isRead: boolean;
  createdAt: string;
  icon: string;
  actionRoute: string | null;
  actionLabel: string | null;
};

export type SubjectProgress = {
  id: string;
  name: string;
  title: string;
  category: string;
  icon: string;
  totalChapters: number;
  completedChapters: number;
  inProgressChapters: number;
  progressPercent: number;
  estimatedHours: number;
};

export type ShellData = {
  profile: Profile;
  me: AuthMe;
  classes: ClassItem[];
  activeClass: ClassItem | null;
  overallPercent: number;
  completedChapters: number;
  totalChapters: number;
  subjectsCount: number;
  bookmarksCount: number;
  unreadNotifications: number;
};

export type DashboardData = {
  profile: Profile;
  me: AuthMe;
  activeClass: ClassItem | null;
  subjects: SubjectDetail[];
  progress: ProgressResponse;
  subjectProgress: SubjectProgress[];
  continueLearning: {
    classId: string;
    subjectId: string;
    chapterId: string;
    chapterTitle: string;
    subjectName: string;
    progressPercent: number;
    completed: boolean;
    completedSections: number;
    totalSections: number;
    durationMinutes?: number;
  } | null;
  bookmarks: Array<Bookmark & { progressPercent: number }>;
  notifications: NotificationItem[];
  stats: {
    subjects: number;
    chapters: number;
    completedChapters: number;
    overallPercent: number;
  };
  unreadNotifications: number;
};

export type LearnData = {
  profile: Profile;
  activeClass: ClassItem | null;
  classes: ClassItem[];
  subjects: SubjectDetail[];
  subjectProgress: SubjectProgress[];
  stats: {
    subjects: number;
    chapters: number;
    completedChapters: number;
    inProgressChapters: number;
    overallPercent: number;
  };
};

export type ClassPageData = {
  profile: Profile;
  classItem: ClassItem | null;
  classes: ClassItem[];
  subjects: SubjectDetail[];
  subjectProgress: SubjectProgress[];
  progress: ProgressResponse;
};

export type SubjectPageData = {
  profile: Profile;
  activeClass: ClassItem | null;
  subject: SubjectDetail;
  progress: ProgressResponse;
  chapterProgress: Record<string, ProgressChapter>;
  bookmarks: Bookmark[];
  stats: {
    total: number;
    completed: number;
    inProgress: number;
    unread: number;
    percent: number;
  };
};

export type ChapterPageData = {
  profile: Profile;
  activeClass: ClassItem | null;
  subject: SubjectDetail;
  chapter: ChapterDetail;
  progress: ProgressChapter | null;
  bookmarks: Bookmark[];
  prevChapter: ChapterSummary | null;
  nextChapter: ChapterSummary | null;
  chapterIndex: number;
};

export type SectionPageData = {
  profile: Profile;
  activeClass: ClassItem | null;
  subject: SubjectSummary;
  chapter: ChapterDetail;
  section: SectionDetail;
  chapterProgress: ProgressChapter | null;
  bookmarks: Bookmark[];
  prevSection: SectionSummary | null;
  nextSection: SectionSummary | null;
  sectionIndex: number;
};

export type LearningEntry = {
  progress: ProgressChapter;
  chapter: ChapterDetail;
  subject: SubjectSummary;
  classItem: ClassItem;
};

export type MyLearningData = {
  profile: Profile;
  entries: LearningEntry[];
  stats: {
    totalChapters: number;
    completed: number;
    inProgress: number;
    overallPercent: number;
  };
};

export type BookmarksPageData = {
  profile: Profile;
  bookmarks: Array<Bookmark & { progressPercent: number }>;
};

export type NotificationsPageData = {
  profile: Profile;
  notifications: NotificationItem[];
  unreadCount: number;
};

export type NotificationDetailData = {
  profile: Profile;
  notification: NotificationItem;
};

export type ProfilePageData = {
  profile: Profile;
  activeClass: ClassItem | null;
  classes: ClassItem[];
  progress: ProgressResponse;
  completedChapters: number;
  completedTopics: number;
  bookmarksCount: number;
};
