import { CURRICULUM_DATA } from '../data/curriculum';

export const getClasses = () => CURRICULUM_DATA;

export const getClassById = (classId) => {
  if (!classId) return CURRICULUM_DATA[0];
  return CURRICULUM_DATA.find((c) => c.id === classId) || CURRICULUM_DATA[0];
};

export const getSubjectsByClass = (classId) => {
  const schoolClass = getClassById(classId);
  return schoolClass ? schoolClass.subjects : [];
};

export const getSubjectById = (classId, subjectId) => {
  const schoolClass = getClassById(classId);
  return schoolClass?.subjects.find((s) => s.id === subjectId);
};

export const getChapterById = (classId, subjectId, chapterId) => {
  const schoolClass = getClassById(classId);
  const subject = schoolClass?.subjects.find((s) => s.id === subjectId);
  const chapter = subject?.chapters.find((c) => c.id === chapterId);
  return { schoolClass, subject, chapter };
};

