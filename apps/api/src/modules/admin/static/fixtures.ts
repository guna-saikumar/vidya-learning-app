import type { AdminDashboardResponse } from "../../dashboard/dashboard.types";

/** Demo admin used by static login / GET me (no DB). */
export const STATIC_ADMIN = {
  id: "admin-static-1",
  email: "admin@vidya.edu.in",
  name: "Dr. Ramesh Sharma",
  role: "ADMIN" as const,
  department: "Academic Director · AP SCERT Division",
  emailVerifiedAt: "2026-01-01T00:00:00.000Z",
  /** Local demo password — not stored in DB. */
  password: "AdminDemo1!",
};

/** Alternate login email accepted for the same static admin. */
export const STATIC_ADMIN_EMAIL_ALIASES = [
  "admin@vidya.edu.in",
  "admin@example.com",
] as const;

export const STATIC_ADMIN_DASHBOARD: AdminDashboardResponse = {
  generatedAt: "2026-10-22T00:00:00.000Z",
  curriculum: {
    totalClasses: 3,
    totalSubjects: 8,
    totalChapters: 24,
    totalSections: 72,
    classes: [
      {
        id: "class-8",
        grade: 8,
        title: "Class 8",
        subtitle: "AP SCERT · Middle school",
        badge: "VIII",
        subjectCount: 4,
        chapterCount: 12,
        sectionCount: 36,
      },
      {
        id: "class-9",
        grade: 9,
        title: "Class 9",
        subtitle: "AP SCERT · Secondary",
        badge: "IX",
        subjectCount: 2,
        chapterCount: 6,
        sectionCount: 18,
      },
      {
        id: "class-10",
        grade: 10,
        title: "Class 10",
        subtitle: "AP SCERT · Board prep",
        badge: "X",
        subjectCount: 2,
        chapterCount: 6,
        sectionCount: 18,
      },
    ],
  },
  users: {
    total: 12,
    students: 8,
    admins: 3,
    superAdmins: 1,
    verifiedStudents: 8,
    unverifiedStudents: 0,
    byDepartment: [
      { department: "Academic Director · AP SCERT Division", count: 2 },
      { department: "Curriculum Desk", count: 1 },
    ],
  },
  materials: {
    persisted: true,
    total: 6,
    published: 4,
    drafts: 1,
    archived: 1,
  },
  recentUsers: [
    {
      id: "student-static-1",
      name: "Ananya Reddy",
      email: "student@vidya.test",
      role: "STUDENT",
      department: null,
      createdAt: "2026-10-01T08:00:00.000Z",
    },
    {
      id: "admin-static-1",
      name: "Dr. Ramesh Sharma",
      email: "admin@vidya.edu.in",
      role: "ADMIN",
      department: "Academic Director · AP SCERT Division",
      createdAt: "2026-09-15T08:00:00.000Z",
    },
  ],
};

export type StaticMaterial = {
  id: string;
  title: string;
  description: string | null;
  materialType: string;
  classId: string;
  grade: number;
  subjectId: string;
  subjectName: string;
  chapterId: string;
  chapterTitle: string;
  sectionId: string | null;
  sectionTitle: string | null;
  language: string;
  displayOrder: number;
  status: string;
  fileUrl: string | null;
  fileName: string | null;
  fileSizeBytes: number | null;
  videoUrl: string | null;
  thumbnailUrl: string | null;
  notesContent: string | null;
  quizData: unknown;
  authorId: string | null;
  authorName: string | null;
  createdAt: string;
  updatedAt: string;
};

export const STATIC_MATERIALS: StaticMaterial[] = [
  {
    id: "mat-001",
    title: "Integers — Worksheet PDF",
    description: "Practice sheet for Class 8 integers",
    materialType: "pdf",
    classId: "class-8",
    grade: 8,
    subjectId: "c8-maths",
    subjectName: "Mathematics",
    chapterId: "c8-m-ch1",
    chapterTitle: "Integers",
    sectionId: "c8-m-ch1-s1",
    sectionTitle: "Introduction",
    language: "en",
    displayOrder: 1,
    status: "published",
    fileUrl: "https://example.com/materials/mat-001.pdf",
    fileName: "integers-worksheet.pdf",
    fileSizeBytes: 245760,
    videoUrl: null,
    thumbnailUrl: null,
    notesContent: null,
    quizData: null,
    authorId: "admin-static-1",
    authorName: "Dr. Ramesh Sharma",
    createdAt: "2026-10-01T10:00:00.000Z",
    updatedAt: "2026-10-01T10:00:00.000Z",
  },
  {
    id: "mat-002",
    title: "Photosynthesis explainer",
    description: "Short video overview",
    materialType: "video",
    classId: "class-8",
    grade: 8,
    subjectId: "c8-science",
    subjectName: "Science",
    chapterId: "c8-s-ch1",
    chapterTitle: "Crop Production",
    sectionId: null,
    sectionTitle: null,
    language: "en",
    displayOrder: 2,
    status: "published",
    fileUrl: null,
    fileName: null,
    fileSizeBytes: null,
    videoUrl: "https://example.com/videos/photosynthesis.mp4",
    thumbnailUrl: "https://example.com/thumbs/mat-002.jpg",
    notesContent: null,
    quizData: null,
    authorId: "admin-static-1",
    authorName: "Dr. Ramesh Sharma",
    createdAt: "2026-10-02T10:00:00.000Z",
    updatedAt: "2026-10-02T10:00:00.000Z",
  },
  {
    id: "mat-003",
    title: "Draft lesson notes",
    description: "Internal draft",
    materialType: "notes",
    classId: "class-8",
    grade: 8,
    subjectId: "c8-maths",
    subjectName: "Mathematics",
    chapterId: "c8-m-ch1",
    chapterTitle: "Integers",
    sectionId: null,
    sectionTitle: null,
    language: "en",
    displayOrder: 3,
    status: "draft",
    fileUrl: null,
    fileName: null,
    fileSizeBytes: null,
    videoUrl: null,
    thumbnailUrl: null,
    notesContent: "# Draft notes\n\nWork in progress.",
    quizData: null,
    authorId: "admin-static-1",
    authorName: "Dr. Ramesh Sharma",
    createdAt: "2026-10-03T10:00:00.000Z",
    updatedAt: "2026-10-03T10:00:00.000Z",
  },
];

export const STATIC_USERS = [
  {
    id: "student-static-1",
    name: "Ananya Reddy",
    email: "student@vidya.test",
    role: "STUDENT" as const,
    department: null as string | null,
    emailVerifiedAt: "2026-10-01T08:00:00.000Z",
    createdAt: "2026-10-01T08:00:00.000Z",
  },
  {
    id: "admin-static-1",
    name: "Dr. Ramesh Sharma",
    email: "admin@vidya.edu.in",
    role: "ADMIN" as const,
    department: "Academic Director · AP SCERT Division",
    emailVerifiedAt: "2026-09-15T08:00:00.000Z",
    createdAt: "2026-09-15T08:00:00.000Z",
  },
  {
    id: "super-static-1",
    name: "Super Admin",
    email: "superadmin@vidya.edu.in",
    role: "SUPER_ADMIN" as const,
    department: "Platform",
    emailVerifiedAt: "2026-09-01T08:00:00.000Z",
    createdAt: "2026-09-01T08:00:00.000Z",
  },
];
