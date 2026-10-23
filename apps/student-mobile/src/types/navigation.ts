export type RootStackParamList = {
  Loading?: undefined;
  Login: undefined;
  StudentOnboarding: { isEdit?: boolean; step?: number } | undefined;
  Home: undefined;
  Learn: undefined;
  Profile: undefined;
  MyLearning: undefined;
  Bookmarks: undefined;
  ClassSubjects: { classId: string };
  SubjectIndex: { classId: string; subjectId: string };
  ChapterDetails: { classId: string; subjectId: string; chapterId: string };
  SectionDetails: { classId: string; subjectId: string; chapterId: string; sectionId: string };
  Notifications: undefined;
  NotificationDetail: { notificationId: string };
};
