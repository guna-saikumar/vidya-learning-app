export type CurriculumOverview = {
  totalClasses: number;
  totalSubjects: number;
  totalChapters: number;
  totalSections: number;
  classes: Array<{
    id: string;
    grade: number;
    title: string;
    subtitle: string;
    badge: string;
    subjectCount: number;
    chapterCount: number;
    sectionCount: number;
  }>;
};

export type StudentDashboardResponse = {
  generatedAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  curriculum: Omit<CurriculumOverview, "classes"> & {
    classes: CurriculumOverview["classes"];
  };
};
