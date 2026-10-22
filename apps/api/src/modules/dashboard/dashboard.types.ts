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

export type UsersOverview = {
  total: number;
  students: number;
  admins: number;
  superAdmins: number;
  verifiedStudents: number;
  unverifiedStudents: number;
  byDepartment: Array<{ department: string; count: number }>;
};

export type MaterialsOverview = {
  /** Materials are not yet persisted in Postgres; always zero until that lands. */
  persisted: false;
  total: number;
  published: number;
  drafts: number;
  archived: number;
};

export type RecentUserActivity = {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string | null;
  createdAt: string;
};

export type AdminDashboardResponse = {
  generatedAt: string;
  curriculum: CurriculumOverview;
  users: UsersOverview;
  materials: MaterialsOverview;
  recentUsers: RecentUserActivity[];
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
