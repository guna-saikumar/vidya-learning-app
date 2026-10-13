import { NavigatorScreenParams } from '@react-navigation/native';

export type MainTabParamList = {
  Home: undefined;
  MyLearning: undefined;
  Bookmarks: undefined;
  Profile: undefined;
};

export type RootStackParamList = {
  Home: undefined;
  MyLearning: undefined;
  Bookmarks: undefined;
  Profile: undefined;
  MainTabs?: NavigatorScreenParams<MainTabParamList> | undefined;
  ClassSubjects: { classId: string };
  SubjectIndex: { classId: string; subjectId: string };
  ChapterDetails: { classId: string; subjectId: string; chapterId: string };
  SectionDetails: { classId: string; subjectId: string; chapterId: string; sectionId: string };
};
