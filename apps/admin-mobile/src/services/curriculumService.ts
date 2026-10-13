import AsyncStorage from '@react-native-async-storage/async-storage';
import { SchoolClass, Subject, Chapter, Section } from '../types/curriculum';
import { INITIAL_CLASSES } from '../constants/curriculumConfig';

const CURRICULUM_STORAGE_KEY = '@vidya_admin_curriculum_classes_v1';

export const loadCurriculumClasses = async (): Promise<SchoolClass[]> => {
  try {
    const raw = await AsyncStorage.getItem(CURRICULUM_STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
    // Initialize with seed data
    await AsyncStorage.setItem(CURRICULUM_STORAGE_KEY, JSON.stringify(INITIAL_CLASSES));
    return INITIAL_CLASSES;
  } catch (err) {
    console.error('Failed to load curriculum classes:', err);
    return INITIAL_CLASSES;
  }
};

export const saveCurriculumClasses = async (classes: SchoolClass[]): Promise<void> => {
  await AsyncStorage.setItem(CURRICULUM_STORAGE_KEY, JSON.stringify(classes));
};

export const resetCurriculumToDefaults = async (): Promise<SchoolClass[]> => {
  await AsyncStorage.setItem(CURRICULUM_STORAGE_KEY, JSON.stringify(INITIAL_CLASSES));
  return INITIAL_CLASSES;
};

export const getClasses = async (): Promise<SchoolClass[]> => {
  return loadCurriculumClasses();
};

export const getClassById = async (classId: string): Promise<SchoolClass | undefined> => {
  const classes = await loadCurriculumClasses();
  return classes.find((c) => c.id === classId);
};

export const getSubjectsByClassId = async (classId: string): Promise<Subject[]> => {
  const targetClass = await getClassById(classId);
  return targetClass ? targetClass.subjects : [];
};

export const addSubjectToClass = async (
  classId: string,
  subjectData: Omit<Subject, 'id' | 'chapters'>
): Promise<Subject> => {
  const classes = await loadCurriculumClasses();
  const classIndex = classes.findIndex((c) => c.id === classId);
  if (classIndex === -1) throw new Error('Class not found');

  const newSubject: Subject = {
    ...subjectData,
    id: `subj-${Date.now()}`,
    chapters: [],
  };

  classes[classIndex].subjects.push(newSubject);
  await saveCurriculumClasses(classes);
  return newSubject;
};

export const updateSubject = async (
  classId: string,
  subjectId: string,
  updatedData: Partial<Subject>
): Promise<Subject> => {
  const classes = await loadCurriculumClasses();
  const cIndex = classes.findIndex((c) => c.id === classId);
  if (cIndex === -1) throw new Error('Class not found');

  const sIndex = classes[cIndex].subjects.findIndex((s) => s.id === subjectId);
  if (sIndex === -1) throw new Error('Subject not found');

  classes[cIndex].subjects[sIndex] = {
    ...classes[cIndex].subjects[sIndex],
    ...updatedData,
  };

  await saveCurriculumClasses(classes);
  return classes[cIndex].subjects[sIndex];
};

export const toggleArchiveSubject = async (
  classId: string,
  subjectId: string
): Promise<boolean> => {
  const classes = await loadCurriculumClasses();
  const cIndex = classes.findIndex((c) => c.id === classId);
  if (cIndex === -1) return false;

  const sIndex = classes[cIndex].subjects.findIndex((s) => s.id === subjectId);
  if (sIndex === -1) return false;

  const currentStatus = classes[cIndex].subjects[sIndex].isArchived;
  classes[cIndex].subjects[sIndex].isArchived = !currentStatus;
  await saveCurriculumClasses(classes);
  return !currentStatus;
};

export const deleteSubject = async (classId: string, subjectId: string): Promise<void> => {
  const classes = await loadCurriculumClasses();
  const cIndex = classes.findIndex((c) => c.id === classId);
  if (cIndex === -1) throw new Error('Class not found');

  const subject = classes[cIndex].subjects.find((s) => s.id === subjectId);
  if (subject && subject.chapters.length > 0) {
    throw new Error(
      `Cannot delete '${subject.name}' because it contains ${subject.chapters.length} chapter(s). Please archive it instead or remove dependent chapters.`
    );
  }

  classes[cIndex].subjects = classes[cIndex].subjects.filter((s) => s.id !== subjectId);
  await saveCurriculumClasses(classes);
};

export const addChapterToSubject = async (
  classId: string,
  subjectId: string,
  chapterData: Omit<Chapter, 'id' | 'sections'>
): Promise<Chapter> => {
  const classes = await loadCurriculumClasses();
  const cIndex = classes.findIndex((c) => c.id === classId);
  if (cIndex === -1) throw new Error('Class not found');

  const sIndex = classes[cIndex].subjects.findIndex((s) => s.id === subjectId);
  if (sIndex === -1) throw new Error('Subject not found');

  const newChapter: Chapter = {
    ...chapterData,
    id: `chap-${Date.now()}`,
    sections: [],
  };

  classes[cIndex].subjects[sIndex].chapters.push(newChapter);
  await saveCurriculumClasses(classes);
  return newChapter;
};

export const updateChapter = async (
  classId: string,
  subjectId: string,
  chapterId: string,
  updatedData: Partial<Chapter>
): Promise<Chapter> => {
  const classes = await loadCurriculumClasses();
  const cIndex = classes.findIndex((c) => c.id === classId);
  if (cIndex === -1) throw new Error('Class not found');

  const sIndex = classes[cIndex].subjects.findIndex((s) => s.id === subjectId);
  if (sIndex === -1) throw new Error('Subject not found');

  const chIndex = classes[cIndex].subjects[sIndex].chapters.findIndex((ch) => ch.id === chapterId);
  if (chIndex === -1) throw new Error('Chapter not found');

  classes[cIndex].subjects[sIndex].chapters[chIndex] = {
    ...classes[cIndex].subjects[sIndex].chapters[chIndex],
    ...updatedData,
  };

  await saveCurriculumClasses(classes);
  return classes[cIndex].subjects[sIndex].chapters[chIndex];
};

export const deleteChapter = async (
  classId: string,
  subjectId: string,
  chapterId: string
): Promise<void> => {
  const classes = await loadCurriculumClasses();
  const cIndex = classes.findIndex((c) => c.id === classId);
  if (cIndex === -1) throw new Error('Class not found');

  const sIndex = classes[cIndex].subjects.findIndex((s) => s.id === subjectId);
  if (sIndex === -1) throw new Error('Subject not found');

  classes[cIndex].subjects[sIndex].chapters = classes[cIndex].subjects[sIndex].chapters.filter(
    (ch) => ch.id !== chapterId
  );

  await saveCurriculumClasses(classes);
};

export const addSectionToChapter = async (
  classId: string,
  subjectId: string,
  chapterId: string,
  sectionData: Omit<Section, 'id'>
): Promise<Section> => {
  const classes = await loadCurriculumClasses();
  const cIndex = classes.findIndex((c) => c.id === classId);
  if (cIndex === -1) throw new Error('Class not found');

  const sIndex = classes[cIndex].subjects.findIndex((s) => s.id === subjectId);
  if (sIndex === -1) throw new Error('Subject not found');

  const chIndex = classes[cIndex].subjects[sIndex].chapters.findIndex((ch) => ch.id === chapterId);
  if (chIndex === -1) throw new Error('Chapter not found');

  const newSection: Section = {
    ...sectionData,
    id: `sec-${Date.now()}`,
  };

  classes[cIndex].subjects[sIndex].chapters[chIndex].sections.push(newSection);
  await saveCurriculumClasses(classes);
  return newSection;
};

export const updateSection = async (
  classId: string,
  subjectId: string,
  chapterId: string,
  sectionId: string,
  updatedData: Partial<Section>
): Promise<Section> => {
  const classes = await loadCurriculumClasses();
  const cIndex = classes.findIndex((c) => c.id === classId);
  if (cIndex === -1) throw new Error('Class not found');

  const sIndex = classes[cIndex].subjects.findIndex((s) => s.id === subjectId);
  if (sIndex === -1) throw new Error('Subject not found');

  const chIndex = classes[cIndex].subjects[sIndex].chapters.findIndex((ch) => ch.id === chapterId);
  if (chIndex === -1) throw new Error('Chapter not found');

  const secIndex = classes[cIndex].subjects[sIndex].chapters[chIndex].sections.findIndex(
    (sec) => sec.id === sectionId
  );
  if (secIndex === -1) throw new Error('Section not found');

  classes[cIndex].subjects[sIndex].chapters[chIndex].sections[secIndex] = {
    ...classes[cIndex].subjects[sIndex].chapters[chIndex].sections[secIndex],
    ...updatedData,
  };

  await saveCurriculumClasses(classes);
  return classes[cIndex].subjects[sIndex].chapters[chIndex].sections[secIndex];
};

export const deleteSection = async (
  classId: string,
  subjectId: string,
  chapterId: string,
  sectionId: string
): Promise<void> => {
  const classes = await loadCurriculumClasses();
  const cIndex = classes.findIndex((c) => c.id === classId);
  if (cIndex === -1) throw new Error('Class not found');

  const sIndex = classes[cIndex].subjects.findIndex((s) => s.id === subjectId);
  if (sIndex === -1) throw new Error('Subject not found');

  const chIndex = classes[cIndex].subjects[sIndex].chapters.findIndex((ch) => ch.id === chapterId);
  if (chIndex === -1) throw new Error('Chapter not found');

  classes[cIndex].subjects[sIndex].chapters[chIndex].sections = classes[cIndex].subjects[
    sIndex
  ].chapters[chIndex].sections.filter((sec) => sec.id !== sectionId);

  await saveCurriculumClasses(classes);
};
