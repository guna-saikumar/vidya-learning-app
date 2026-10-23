import { CURRICULUM_DATA, BOARD_INFO } from '../data/curriculum';
export { BOARD_INFO };
import { SchoolClass, Subject, Chapter, Section } from '../types/curriculum';

export const getClasses = (): SchoolClass[] => {
  return CURRICULUM_DATA;
};

export const getClassById = (classId: string): SchoolClass | undefined => {
  return CURRICULUM_DATA.find((c) => c.id === classId);
};

export const getSubjectsByClass = (classId: string): Subject[] => {
  const schoolClass = getClassById(classId);
  return schoolClass ? schoolClass.subjects : [];
};

export const getSubjectById = (
  subjectId: string
): { subject: Subject; schoolClass: SchoolClass } | undefined => {
  for (const schoolClass of CURRICULUM_DATA) {
    const subject = schoolClass.subjects.find((s) => s.id === subjectId);
    if (subject) {
      return { subject, schoolClass };
    }
  }
  return undefined;
};

export const getChaptersBySubject = (subjectId: string): Chapter[] => {
  const result = getSubjectById(subjectId);
  return result ? result.subject.chapters : [];
};

export const getChapterById = (
  chapterId: string
): { chapter: Chapter; subject: Subject; schoolClass: SchoolClass } | undefined => {
  for (const schoolClass of CURRICULUM_DATA) {
    for (const subject of schoolClass.subjects) {
      const chapter = subject.chapters.find((ch) => ch.id === chapterId);
      if (chapter) {
        return { chapter, subject, schoolClass };
      }
    }
  }
  return undefined;
};

export const getSectionById = (
  sectionId: string
): { section: Section; chapter: Chapter; subject: Subject; schoolClass: SchoolClass } | undefined => {
  for (const schoolClass of CURRICULUM_DATA) {
    for (const subject of schoolClass.subjects) {
      for (const chapter of subject.chapters) {
        const section = chapter.sections.find((s) => s.id === sectionId);
        if (section) {
          return { section, chapter, subject, schoolClass };
        }
      }
    }
  }
  return undefined;
};

export const getCurriculumStats = () => {
  const totalClasses = CURRICULUM_DATA.length;
  let totalSubjects = 0;
  let totalChapters = 0;

  for (const schoolClass of CURRICULUM_DATA) {
    totalSubjects += schoolClass.subjects.length;
    for (const subject of schoolClass.subjects) {
      totalChapters += subject.chapters.length;
    }
  }

  return {
    totalClasses,
    totalSubjects,
    totalChapters,
  };
};

export const getEnrolledClassStats = (classId?: string) => {
  const schoolClass = (classId ? getClassById(classId) : undefined) || CURRICULUM_DATA[2];
  const totalSubjects = schoolClass.subjects.length;
  let totalChapters = 0;

  for (const subject of schoolClass.subjects) {
    totalChapters += subject.chapters.length;
  }

  return {
    classId: schoolClass.id,
    grade: schoolClass.grade,
    title: schoolClass.title,
    totalSubjects,
    totalChapters,
    schoolClass,
  };
};


export const searchCurriculum = (query: string, classId?: string) => {
  if (!query || query.trim() === '') return [];
  const lowerQuery = query.toLowerCase().trim();

  const results: Array<{
    type: 'subject' | 'chapter';
    id: string;
    title: string;
    subtitle: string;
    classId: string;
    subjectId: string;
    chapterId?: string;
  }> = [];

  const classesToSearch = classId
    ? CURRICULUM_DATA.filter((c) => c.id === classId)
    : CURRICULUM_DATA;

  for (const c of classesToSearch) {
    for (const s of c.subjects) {
      if (s.name.toLowerCase().includes(lowerQuery) || s.description?.toLowerCase().includes(lowerQuery)) {
        results.push({
          type: 'subject',
          id: s.id,
          title: s.name,
          subtitle: `${c.title} • ${s.chapters.length} Chapters`,
          classId: c.id,
          subjectId: s.id,
        });
      }

      for (const ch of s.chapters) {
        if (
          ch.title.toLowerCase().includes(lowerQuery) ||
          ch.description?.toLowerCase().includes(lowerQuery) ||
          ch.sections.some((sec) => sec.title.toLowerCase().includes(lowerQuery))
        ) {
          results.push({
            type: 'chapter',
            id: ch.id,
            title: ch.title,
            subtitle: `${c.title} • ${s.name} • ${ch.unitName || 'Chapter'}`,
            classId: c.id,
            subjectId: s.id,
            chapterId: ch.id,
          });
        }
      }
    }
  }

  return results;
};

export const getBoardInfo = () => BOARD_INFO;
