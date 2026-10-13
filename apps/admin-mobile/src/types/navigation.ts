import { NavigatorScreenParams } from '@react-navigation/native';
import { LectureMaterial } from './materials';

export type AdminTabParamList = {
  Dashboard: undefined;
  Curriculum: undefined;
  Materials: undefined;
  Profile: undefined;
};

export type RootStackParamList = {
  MainTabs: NavigatorScreenParams<AdminTabParamList>;
  Subjects: { classId: string };
  Chapters: { classId: string; subjectId: string };
  AddEditSubject: { classId: string; subjectId?: string };
  AddEditChapter: { classId: string; subjectId: string; chapterId?: string };
  AddEditSection: { classId: string; subjectId: string; chapterId: string; sectionId?: string };
  AddEditMaterial: { materialId?: string; defaultClassId?: string; defaultSubjectId?: string; defaultChapterId?: string };
  ContentEditor: { materialId?: string; initialNotes?: string; title?: string };
  PreviewPublish: { materialId: string };
};
