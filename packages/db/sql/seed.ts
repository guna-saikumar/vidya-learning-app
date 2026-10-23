import { randomBytes } from "node:crypto";
import bcrypt from "bcrypt";
import { Pool, type PoolClient } from "pg";
import { getClasses } from "../../curriculum/src/curriculum.service";

/**
 * Student-focused seed using plain `pg` (no Prisma).
 *
 * Seeds: students + student profiles, curriculum (classes → subjects →
 * chapters → sections + chapter quizzes), demo materials, quizzes, tasks,
 * notifications, exam schedule/results, chapter progress and study sessions.
 *
 * Only a single admin row (admin@vidya.edu.in) is created, solely to satisfy
 * the Material.authorId foreign key.
 *
 * Shared demo passwords (documented in seed console output):
 *   Students → StudentDemo1!
 *   Admin    → AdminDemo1!
 */
const STUDENT_PASSWORD = "StudentDemo1!";
const ADMIN_PASSWORD = "AdminDemo1!";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is not set");
}

const pool = new Pool({ connectionString });

/** Minimal cuid-like id: "c" + time (base36) + counter + random. */
let idCounter = 0;
function newId(): string {
  idCounter = (idCounter + 1) % 1_679_616; // 36^4
  return (
    "c" +
    Date.now().toString(36) +
    idCounter.toString(36).padStart(4, "0") +
    randomBytes(6).toString("hex").slice(0, 8)
  );
}

type SeedStudent = {
  email: string;
  name: string;
  activeClassId: string;
  streakDays: number;
  studyGoalMinutes: number;
};

type SeedUser = { id: string; email: string };

const SEED_STUDENTS: SeedStudent[] = [
  {
    email: "student@vidya.test",
    name: "Demo Student",
    activeClassId: "class-8",
    streakDays: 5,
    studyGoalMinutes: 45,
  },
  {
    email: "ananya.reddy@vidya.test",
    name: "Ananya Reddy",
    activeClassId: "class-8",
    streakDays: 12,
    studyGoalMinutes: 60,
  },
  {
    email: "karthik.nair@vidya.test",
    name: "Karthik Nair",
    activeClassId: "class-9",
    streakDays: 3,
    studyGoalMinutes: 40,
  },
  {
    email: "priya.suresh@vidya.test",
    name: "Priya Suresh",
    activeClassId: "class-7",
    streakDays: 8,
    studyGoalMinutes: 35,
  },
  {
    email: "arjun.patel@vidya.test",
    name: "Arjun Patel",
    activeClassId: "class-10",
    streakDays: 21,
    studyGoalMinutes: 75,
  },
  {
    email: "meera.iyer@vidya.test",
    name: "Meera Iyer",
    activeClassId: "class-6",
    streakDays: 2,
    studyGoalMinutes: 30,
  },
];

const VIDYA_ADMIN = {
  email: "admin@vidya.edu.in",
  name: "Dr. Ramesh Sharma",
  role: "ADMIN",
  department: "Academic Director · AP SCERT Division",
} as const;

const iso = (d: Date) => d.toISOString();

async function upsertUser(
  db: PoolClient,
  u: {
    email: string;
    name: string;
    role: "STUDENT" | "ADMIN" | "SUPER_ADMIN";
    department?: string | null;
    passwordHash: string;
  }
): Promise<SeedUser> {
  const { rows } = await db.query<SeedUser>(
    `INSERT INTO "User"
       ("id", "email", "name", "role", "department", "passwordHash", "emailVerifiedAt")
     VALUES ($1, $2, $3, $4::"UserRole", $5, $6, $7::timestamp)
     ON CONFLICT ("email") DO UPDATE SET
       "name" = EXCLUDED."name",
       "role" = EXCLUDED."role",
       "department" = EXCLUDED."department",
       "passwordHash" = EXCLUDED."passwordHash",
       "emailVerifiedAt" = EXCLUDED."emailVerifiedAt",
       "emailOtpHash" = NULL,
       "emailOtpExpiresAt" = NULL,
       "emailOtpPurpose" = NULL
     RETURNING "id", "email"`,
    [
      newId(),
      u.email,
      u.name,
      u.role,
      u.department ?? null,
      u.passwordHash,
      iso(new Date()),
    ]
  );
  return rows[0]!;
}

async function seedUsers(db: PoolClient) {
  const studentHash = await bcrypt.hash(STUDENT_PASSWORD, 10);
  const adminHash = await bcrypt.hash(ADMIN_PASSWORD, 10);

  const students: { user: SeedUser; profile: SeedStudent }[] = [];
  for (const s of SEED_STUDENTS) {
    const user = await upsertUser(db, {
      email: s.email,
      name: s.name,
      role: "STUDENT",
      passwordHash: studentHash,
    });
    students.push({ user, profile: s });
  }

  const admin = await upsertUser(db, {
    ...VIDYA_ADMIN,
    passwordHash: adminHash,
  });

  return { student: students[0]!.user, students, vidyaAdminId: admin.id };
}

async function seedCurriculum(db: PoolClient) {
  const classes = getClasses();

  for (const cls of classes) {
    await db.query(
      `INSERT INTO "SchoolClass"
         ("id", "grade", "title", "subtitle", "badge", "updatedAt")
       VALUES ($1, $2, $3, $4, $5, $6::timestamp)
       ON CONFLICT ("id") DO UPDATE SET
         "grade" = EXCLUDED."grade",
         "title" = EXCLUDED."title",
         "subtitle" = EXCLUDED."subtitle",
         "badge" = EXCLUDED."badge",
         "updatedAt" = EXCLUDED."updatedAt"`,
      [cls.id, cls.grade, cls.title, cls.subtitle, cls.badge, iso(new Date())]
    );

    for (let si = 0; si < cls.subjects.length; si++) {
      const subject = cls.subjects[si]!;
      const category =
        subject.category === "all" ||
        subject.category === "stem" ||
        subject.category === "languages" ||
        subject.category === "social"
          ? subject.category
          : "stem";

      await db.query(
        `INSERT INTO "Subject"
           ("id", "classId", "name", "description", "category", "icon", "bannerUrl", "order", "updatedAt")
         VALUES ($1, $2, $3, $4, $5::"SubjectCategory", $6, $7, $8, $9::timestamp)
         ON CONFLICT ("id") DO UPDATE SET
           "classId" = EXCLUDED."classId",
           "name" = EXCLUDED."name",
           "description" = EXCLUDED."description",
           "category" = EXCLUDED."category",
           "icon" = EXCLUDED."icon",
           "bannerUrl" = EXCLUDED."bannerUrl",
           "order" = EXCLUDED."order",
           "updatedAt" = EXCLUDED."updatedAt"`,
        [
          subject.id,
          cls.id,
          subject.name,
          subject.description ?? null,
          category,
          subject.icon,
          subject.bannerUrl ?? null,
          si,
          iso(new Date()),
        ]
      );

      for (const chapter of subject.chapters) {
        await db.query(
          `INSERT INTO "Chapter"
             ("id", "subjectId", "title", "description", "order", "unitName",
              "durationMinutes", "learningGoals", "bannerUrl", "updatedAt")
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8::text[], $9, $10::timestamp)
           ON CONFLICT ("id") DO UPDATE SET
             "subjectId" = EXCLUDED."subjectId",
             "title" = EXCLUDED."title",
             "description" = EXCLUDED."description",
             "order" = EXCLUDED."order",
             "unitName" = EXCLUDED."unitName",
             "durationMinutes" = EXCLUDED."durationMinutes",
             "learningGoals" = EXCLUDED."learningGoals",
             "bannerUrl" = EXCLUDED."bannerUrl",
             "updatedAt" = EXCLUDED."updatedAt"`,
          [
            chapter.id,
            subject.id,
            chapter.title,
            chapter.description ?? null,
            chapter.order,
            chapter.unitName ?? null,
            chapter.durationMinutes ?? null,
            chapter.learningGoals ?? [],
            chapter.bannerUrl ?? null,
            iso(new Date()),
          ]
        );

        // Inline chapter quiz from curriculum package → Quiz + question
        if (chapter.quiz) {
          const quizId = `quiz-${chapter.id}`;
          await upsertQuiz(db, {
            id: quizId,
            chapterId: chapter.id,
            title: `${chapter.title} Check`,
            description: chapter.quiz.question.slice(0, 120),
            timeLimitMinutes: 10,
          });
          await db.query(`DELETE FROM "QuizQuestion" WHERE "quizId" = $1`, [
            quizId,
          ]);
          await insertQuizQuestion(db, {
            id: `${quizId}-q1`,
            quizId,
            question: chapter.quiz.question,
            options: chapter.quiz.options,
            correctIndex: chapter.quiz.correctIndex,
            explanation: chapter.quiz.explanation,
            order: 0,
          });
        }

        for (const section of chapter.sections) {
          await db.query(
            `INSERT INTO "Section"
               ("id", "chapterId", "title", "content", "order", "durationMinutes",
                "summaryPoint", "keyAxiom", "updatedAt")
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9::timestamp)
             ON CONFLICT ("id") DO UPDATE SET
               "chapterId" = EXCLUDED."chapterId",
               "title" = EXCLUDED."title",
               "content" = EXCLUDED."content",
               "order" = EXCLUDED."order",
               "durationMinutes" = EXCLUDED."durationMinutes",
               "summaryPoint" = EXCLUDED."summaryPoint",
               "keyAxiom" = EXCLUDED."keyAxiom",
               "updatedAt" = EXCLUDED."updatedAt"`,
            [
              section.id,
              chapter.id,
              section.title,
              section.content,
              section.order,
              section.durationMinutes ?? null,
              section.summaryPoint ?? null,
              section.keyAxiom ?? null,
              iso(new Date()),
            ]
          );
        }
      }
    }
  }
  console.log(`Seeded curriculum: ${classes.length} classes`);
}

async function upsertQuiz(
  db: PoolClient,
  q: {
    id: string;
    chapterId: string;
    title: string;
    description: string;
    timeLimitMinutes: number;
  }
) {
  await db.query(
    `INSERT INTO "Quiz"
       ("id", "chapterId", "title", "description", "timeLimitMinutes", "updatedAt")
     VALUES ($1, $2, $3, $4, $5, $6::timestamp)
     ON CONFLICT ("id") DO UPDATE SET
       "chapterId" = EXCLUDED."chapterId",
       "title" = EXCLUDED."title",
       "description" = EXCLUDED."description",
       "timeLimitMinutes" = EXCLUDED."timeLimitMinutes",
       "updatedAt" = EXCLUDED."updatedAt"`,
    [q.id, q.chapterId, q.title, q.description, q.timeLimitMinutes, iso(new Date())]
  );
}

async function insertQuizQuestion(
  db: PoolClient,
  q: {
    id: string;
    quizId: string;
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
    order: number;
  }
) {
  await db.query(
    `INSERT INTO "QuizQuestion"
       ("id", "quizId", "question", "options", "correctIndex", "explanation", "order")
     VALUES ($1, $2, $3, $4::text[], $5, $6, $7)
     ON CONFLICT ("id") DO UPDATE SET
       "quizId" = EXCLUDED."quizId",
       "question" = EXCLUDED."question",
       "options" = EXCLUDED."options",
       "correctIndex" = EXCLUDED."correctIndex",
       "explanation" = EXCLUDED."explanation",
       "order" = EXCLUDED."order"`,
    [q.id, q.quizId, q.question, q.options, q.correctIndex, q.explanation, q.order]
  );
}

async function seedStudentProfiles(
  db: PoolClient,
  students: { user: SeedUser; profile: SeedStudent }[]
) {
  for (const { user, profile } of students) {
    await db.query(
      `INSERT INTO "StudentProfile"
         ("id", "userId", "activeClassId", "streakDays", "studyGoalMinutes", "avatarUrl", "updatedAt")
       VALUES ($1, $2, $3, $4, $5, '', $6::timestamp)
       ON CONFLICT ("userId") DO UPDATE SET
         "activeClassId" = EXCLUDED."activeClassId",
         "streakDays" = EXCLUDED."streakDays",
         "studyGoalMinutes" = EXCLUDED."studyGoalMinutes",
         "avatarUrl" = '',
         "updatedAt" = EXCLUDED."updatedAt"`,
      [
        newId(),
        user.id,
        profile.activeClassId,
        profile.streakDays,
        profile.studyGoalMinutes,
        iso(new Date()),
      ]
    );
  }
}

type SeedMaterial = {
  id: string;
  title: string;
  description: string;
  materialType: "pdf" | "video" | "presentation";
  grade: number;
  subjectName: string;
  chapterTitle: string;
  sectionTitle?: string;
  language: string;
  displayOrder: number;
  status: "draft" | "published";
  fileName?: string;
  fileSizeBytes?: number;
  fileUrl?: string;
  videoUrl?: string;
  authorName: string;
  classId: string;
  subjectId: string;
  chapterId: string;
  sectionId?: string;
};

async function seedDemoContent(
  db: PoolClient,
  studentId: string,
  authorId: string,
  extraStudents: { id: string; classId: string }[] = []
) {
  const materials: SeedMaterial[] = [
    {
      id: "mat-001",
      title: "Rational Numbers - Chapter Reference Notes",
      description:
        "SCERT textbook notes covering closure, commutative and distributive properties.",
      materialType: "pdf",
      grade: 8,
      subjectName: "Mathematics",
      chapterTitle: "Rational Numbers",
      sectionTitle: "Properties of Rational Numbers",
      language: "English",
      displayOrder: 1,
      status: "published",
      fileName: "Class8_Maths_Ch1_RationalNumbers.pdf",
      fileSizeBytes: 2450000,
      fileUrl: "https://cdn.vidya.edu.in/materials/c8/maths/ch1_notes.pdf",
      authorName: "Dr. Ramesh Sharma",
      classId: "class-8",
      subjectId: "c8-maths",
      chapterId: "c8-m-ch1",
      sectionId: "c8-m-ch1-s1",
    },
    {
      id: "mat-002",
      title: "Distributive Law Animation",
      description: "Visual proof of a(b + c) = ab + ac with geometry tiles.",
      materialType: "video",
      grade: 8,
      subjectName: "Mathematics",
      chapterTitle: "Rational Numbers",
      language: "English",
      displayOrder: 2,
      status: "published",
      videoUrl: "https://www.youtube.com/watch?v=demo-distributive-law",
      authorName: "S. K. Verma",
      classId: "class-8",
      subjectId: "c8-maths",
      chapterId: "c8-m-ch1",
    },
    {
      id: "mat-003",
      title: "Linear Equations Lecture Slides",
      description: "Classroom deck on transposing and word problems.",
      materialType: "presentation",
      grade: 8,
      subjectName: "Mathematics",
      chapterTitle: "Linear Equations in One Variable",
      language: "English",
      displayOrder: 1,
      status: "draft",
      fileUrl: "https://cdn.vidya.edu.in/materials/c8/maths/ch2_slides.pptx",
      authorName: "Dr. Ramesh Sharma",
      classId: "class-8",
      subjectId: "c8-maths",
      chapterId: "c8-m-ch2",
    },
  ];

  for (const m of materials) {
    await db.query(
      `INSERT INTO "Material"
         ("id", "title", "description", "materialType", "classId", "grade",
          "subjectId", "subjectName", "chapterId", "chapterTitle", "sectionId",
          "sectionTitle", "language", "displayOrder", "status", "fileUrl",
          "fileName", "fileSizeBytes", "videoUrl", "authorId", "authorName", "updatedAt")
       VALUES ($1, $2, $3, $4::"MaterialType", $5, $6, $7, $8, $9, $10, $11, $12,
               $13, $14, $15::"PublicationStatus", $16, $17, $18, $19, $20, $21, $22::timestamp)
       ON CONFLICT ("id") DO UPDATE SET
         "title" = EXCLUDED."title",
         "description" = EXCLUDED."description",
         "status" = EXCLUDED."status",
         "fileUrl" = EXCLUDED."fileUrl",
         "videoUrl" = EXCLUDED."videoUrl",
         "updatedAt" = EXCLUDED."updatedAt"`,
      [
        m.id,
        m.title,
        m.description,
        m.materialType,
        m.classId,
        m.grade,
        m.subjectId,
        m.subjectName,
        m.chapterId,
        m.chapterTitle,
        m.sectionId ?? null,
        m.sectionTitle ?? null,
        m.language,
        m.displayOrder,
        m.status,
        m.fileUrl ?? null,
        m.fileName ?? null,
        m.fileSizeBytes ?? null,
        m.videoUrl ?? null,
        authorId,
        m.authorName,
        iso(new Date()),
      ]
    );
  }

  // Multi-question demo quiz matching student mock
  const demoQuizId = "quiz-c8-m-ch1";
  await upsertQuiz(db, {
    id: demoQuizId,
    chapterId: "c8-m-ch1",
    title: "Rational Numbers Quiz",
    description: "Test your understanding of rational number properties.",
    timeLimitMinutes: 10,
  });
  await db.query(`DELETE FROM "QuizQuestion" WHERE "quizId" = $1`, [demoQuizId]);
  const demoQuestions = [
    {
      id: "q1",
      question:
        "Which property states that a × (b + c) = a × b + a × c for rational numbers?",
      options: ["Commutative", "Associative", "Distributive", "Closure"],
      correctIndex: 2,
      explanation:
        "The Distributive Property states that multiplication distributes over addition.",
      order: 0,
    },
    {
      id: "q2",
      question: "What is the additive identity for rational numbers?",
      options: ["1", "0", "-1", "½"],
      correctIndex: 1,
      explanation: "Zero (0) is the additive identity.",
      order: 1,
    },
    {
      id: "q3",
      question: "The multiplicative inverse of -3/7 is:",
      options: ["3/7", "-7/3", "7/3", "-3/7"],
      correctIndex: 1,
      explanation: "The reciprocal of -3/7 is -7/3.",
      order: 2,
    },
  ];
  for (const q of demoQuestions) {
    await insertQuizQuestion(db, { ...q, quizId: demoQuizId });
  }

  const now = Date.now();
  const DAY = 86400000;
  const tasks = [
    {
      id: "task-quiz-1",
      title: "Rational Numbers Quiz",
      description: "Test your understanding of properties of rational numbers.",
      type: "quiz",
      status: "pending",
      priority: "high",
      subjectId: "c8-maths",
      subjectName: "Mathematics",
      classId: "class-8",
      chapterId: "c8-m-ch1",
      chapterTitle: "Rational Numbers",
      dueDate: new Date(now + DAY * 2),
      estimatedMinutes: 15,
      totalQuestions: 10,
      completedQuestions: null as number | null,
      icon: "quiz",
    },
    {
      id: "task-assign-1",
      title: "Force & Pressure Worksheet",
      description: "Complete the worksheet on types of forces and pressure.",
      type: "assignment",
      status: "pending",
      priority: "medium",
      subjectId: "c8-pscience",
      subjectName: "Physical Science",
      classId: "class-8",
      chapterId: "c8-ps-ch1",
      chapterTitle: "Force and Pressure",
      dueDate: new Date(now + DAY * 3),
      estimatedMinutes: 30,
      totalQuestions: 15,
      completedQuestions: null as number | null,
      icon: "assignment",
    },
    {
      id: "task-practice-1",
      title: "Daily Practice: Linear Equations",
      description: "Solve 5 practice problems on linear equations.",
      type: "practice",
      status: "in_progress",
      priority: "medium",
      subjectId: "c8-maths",
      subjectName: "Mathematics",
      classId: "class-8",
      chapterId: "c8-m-ch2",
      chapterTitle: "Linear Equations in One Variable",
      dueDate: new Date(now + DAY),
      estimatedMinutes: 20,
      totalQuestions: 5,
      completedQuestions: 2 as number | null,
      icon: "fitness-center",
    },
  ];

  for (const t of tasks) {
    await db.query(
      `INSERT INTO "Task"
         ("id", "title", "description", "type", "status", "priority", "subjectId",
          "subjectName", "classId", "chapterId", "chapterTitle", "assigneeUserId",
          "dueDate", "estimatedMinutes", "totalQuestions", "completedQuestions",
          "icon", "updatedAt")
       VALUES ($1, $2, $3, $4::"TaskType", $5::"TaskStatus", $6::"TaskPriority",
               $7, $8, $9, $10, $11, $12, $13::timestamp, $14, $15, $16, $17, $18::timestamp)
       ON CONFLICT ("id") DO UPDATE SET
         "title" = EXCLUDED."title",
         "status" = EXCLUDED."status",
         "dueDate" = EXCLUDED."dueDate",
         "updatedAt" = EXCLUDED."updatedAt"`,
      [
        t.id,
        t.title,
        t.description,
        t.type,
        t.status,
        t.priority,
        t.subjectId,
        t.subjectName,
        t.classId,
        t.chapterId,
        t.chapterTitle,
        studentId,
        iso(t.dueDate),
        t.estimatedMinutes,
        t.totalQuestions,
        t.completedQuestions,
        t.icon,
        iso(new Date()),
      ]
    );
  }

  await db.query(`DELETE FROM "Notification" WHERE "userId" = $1`, [studentId]);
  const notifications = [
    {
      id: "notif-1",
      title: "New Quiz Available: Rational Numbers",
      message:
        "Test your understanding on Rational Numbers properties before this Friday.",
      detailedBody: "Chapter-end formative assessment is now open.",
      type: "reminder",
      icon: "quiz",
      actionRoute: "Tasks",
      actionLabel: "Go to Quiz in Tasks",
    },
    {
      id: "notif-2",
      title: "5-Day Learning Streak Unlocked!",
      message: "You have completed 5 consecutive days of study!",
      detailedBody: "Keep up the brilliant pace.",
      type: "achievement",
      icon: "emoji-events",
      actionRoute: "Progress",
      actionLabel: "View Streak on Progress Page",
    },
    {
      id: "notif-3",
      title: "AP SCERT Board: SA-1 Examination Timetable Released",
      message: "Official timetable for Summative Assessment-1 announced.",
      detailedBody: "Examination window: November 16–24, 2026.",
      type: "announcement",
      icon: "campaign",
      actionRoute: "ExamSchedule",
      actionLabel: "View Exam Schedule",
    },
  ];
  for (const n of notifications) {
    await db.query(
      `INSERT INTO "Notification"
         ("id", "userId", "title", "message", "detailedBody", "type", "icon",
          "actionRoute", "actionLabel")
       VALUES ($1, $2, $3, $4, $5, $6::"NotificationType", $7, $8, $9)
       ON CONFLICT ("id") DO UPDATE SET
         "userId" = EXCLUDED."userId",
         "title" = EXCLUDED."title",
         "message" = EXCLUDED."message",
         "detailedBody" = EXCLUDED."detailedBody",
         "type" = EXCLUDED."type",
         "icon" = EXCLUDED."icon",
         "actionRoute" = EXCLUDED."actionRoute",
         "actionLabel" = EXCLUDED."actionLabel"`,
      [
        n.id,
        studentId,
        n.title,
        n.message,
        n.detailedBody,
        n.type,
        n.icon,
        n.actionRoute,
        n.actionLabel,
      ]
    );
  }

  await db.query(`DELETE FROM "ExamScheduleItem" WHERE "classId" = $1`, [
    "class-8",
  ]);
  const exams = [
    {
      id: "exam-sa1-math",
      subjectName: "Mathematics",
      title: "SA-1 Mathematics",
      examDate: new Date("2026-11-16T09:30:00Z"),
      startTime: "09:30",
      endTime: "12:15",
      venue: "Main Hall",
      notes: "Units 1–5" as string | null,
    },
    {
      id: "exam-sa1-science",
      subjectName: "Physical Science",
      title: "SA-1 Physical Science",
      examDate: new Date("2026-11-18T09:30:00Z"),
      startTime: "09:30",
      endTime: "12:15",
      venue: "Lab Block",
      notes: null as string | null,
    },
  ];
  for (const e of exams) {
    await db.query(
      `INSERT INTO "ExamScheduleItem"
         ("id", "classId", "subjectName", "title", "examDate", "startTime",
          "endTime", "venue", "notes", "updatedAt")
       VALUES ($1, $2, $3, $4, $5::timestamp, $6, $7, $8, $9, $10::timestamp)
       ON CONFLICT ("id") DO UPDATE SET
         "classId" = EXCLUDED."classId",
         "subjectName" = EXCLUDED."subjectName",
         "title" = EXCLUDED."title",
         "examDate" = EXCLUDED."examDate",
         "startTime" = EXCLUDED."startTime",
         "endTime" = EXCLUDED."endTime",
         "venue" = EXCLUDED."venue",
         "notes" = EXCLUDED."notes",
         "updatedAt" = EXCLUDED."updatedAt"`,
      [
        e.id,
        "class-8",
        e.subjectName,
        e.title,
        iso(e.examDate),
        e.startTime,
        e.endTime,
        e.venue,
        e.notes,
        iso(new Date()),
      ]
    );
  }

  await db.query(`DELETE FROM "ExamResult" WHERE "userId" = $1`, [studentId]);
  const results = [
    {
      id: "result-fa1-math",
      subjectName: "Mathematics",
      examTitle: "FA-1 Mathematics",
      marksObtained: 18,
      marksMax: 20,
      grade: "A1",
      remarks: "Excellent" as string | null,
    },
    {
      id: "result-fa1-eng",
      subjectName: "English",
      examTitle: "FA-1 English",
      marksObtained: 16,
      marksMax: 20,
      grade: "A2",
      remarks: null as string | null,
    },
  ];
  for (const r of results) {
    await db.query(
      `INSERT INTO "ExamResult"
         ("id", "userId", "subjectName", "examTitle", "marksObtained", "marksMax",
          "grade", "remarks")
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT ("id") DO UPDATE SET
         "userId" = EXCLUDED."userId",
         "subjectName" = EXCLUDED."subjectName",
         "examTitle" = EXCLUDED."examTitle",
         "marksObtained" = EXCLUDED."marksObtained",
         "marksMax" = EXCLUDED."marksMax",
         "grade" = EXCLUDED."grade",
         "remarks" = EXCLUDED."remarks"`,
      [
        r.id,
        studentId,
        r.subjectName,
        r.examTitle,
        r.marksObtained,
        r.marksMax,
        r.grade,
        r.remarks,
      ]
    );
  }

  await db.query(
    `INSERT INTO "ChapterProgress"
       ("id", "userId", "chapterId", "subjectId", "classId", "completedSections",
        "progressPercent", "updatedAt")
     VALUES ($1, $2, $3, $4, $5, $6::text[], $7, $8::timestamp)
     ON CONFLICT ("userId", "chapterId") DO UPDATE SET
       "completedSections" = EXCLUDED."completedSections",
       "progressPercent" = EXCLUDED."progressPercent",
       "completed" = false,
       "lastAccessed" = CURRENT_TIMESTAMP,
       "updatedAt" = EXCLUDED."updatedAt"`,
    [
      newId(),
      studentId,
      "c8-m-ch1",
      "c8-maths",
      "class-8",
      ["c8-m-ch1-s1", "c8-m-ch1-s2"],
      50,
      iso(new Date()),
    ]
  );

  // Weekly study minutes for charts (primary + a couple classmates)
  const studyUsers = [
    { userId: studentId, base: 20 },
    ...extraStudents.slice(0, 2).map((s, idx) => ({
      userId: s.id,
      base: 15 + idx * 8,
    })),
  ];
  for (const { userId, base } of studyUsers) {
    for (let i = 0; i < 7; i++) {
      const day = new Date();
      day.setUTCHours(0, 0, 0, 0);
      day.setUTCDate(day.getUTCDate() - i);
      await db.query(
        `INSERT INTO "StudySession" ("id", "userId", "minutes", "day")
         VALUES ($1, $2, $3, $4::date)
         ON CONFLICT ("userId", "day") DO UPDATE SET
           "minutes" = EXCLUDED."minutes"`,
        [newId(), userId, base + i * 5, day.toISOString().slice(0, 10)]
      );
    }
  }

  // Light progress for other students so dashboards look inhabited
  const chapterByClass: Record<string, { chapterId: string; subjectId: string }> =
    {
      "class-6": { chapterId: "c6-m-ch1", subjectId: "c6-maths" },
      "class-7": { chapterId: "c7-m-ch1", subjectId: "c7-maths" },
      "class-8": { chapterId: "c8-m-ch1", subjectId: "c8-maths" },
      "class-9": { chapterId: "c9-m-ch1", subjectId: "c9-maths" },
      "class-10": { chapterId: "c10-m-ch1", subjectId: "c10-maths" },
    };
  for (const extra of extraStudents) {
    const target = chapterByClass[extra.classId];
    if (!target) continue;

    // Only insert if the chapter exists (curriculum may not have every id)
    const exists = await db.query(`SELECT 1 FROM "Chapter" WHERE "id" = $1`, [
      target.chapterId,
    ]);
    if (exists.rowCount === 0) continue;

    await db.query(
      `INSERT INTO "ChapterProgress"
         ("id", "userId", "chapterId", "subjectId", "classId", "progressPercent", "updatedAt")
       VALUES ($1, $2, $3, $4, $5, 25, $6::timestamp)
       ON CONFLICT ("userId", "chapterId") DO UPDATE SET
         "progressPercent" = 25,
         "completed" = false,
         "lastAccessed" = CURRENT_TIMESTAMP,
         "updatedAt" = EXCLUDED."updatedAt"`,
      [
        newId(),
        extra.id,
        target.chapterId,
        target.subjectId,
        extra.classId,
        iso(new Date()),
      ]
    );
  }

  console.log("Seeded demo materials, tasks, notifications, exams, progress");
}

async function main() {
  const db = await pool.connect();
  try {
    await db.query("BEGIN");

    const { student, students, vidyaAdminId } = await seedUsers(db);
    await seedCurriculum(db);
    await seedStudentProfiles(db, students);
    const extras = students.slice(1).map(({ user, profile }) => ({
      id: user.id,
      classId: profile.activeClassId,
    }));
    await seedDemoContent(db, student.id, vidyaAdminId, extras);

    await db.query("COMMIT");

    console.log("\nSeeded login accounts (all email-verified):\n");
    console.log("Students (password: StudentDemo1!):");
    for (const { profile } of students) {
      console.log(
        `  ${profile.email.padEnd(32)}  ${profile.name.padEnd(16)}  ${profile.activeClassId}`
      );
    }
    console.log("\nAdmin (password: AdminDemo1!):");
    console.log(`  ${VIDYA_ADMIN.email.padEnd(32)}  ${VIDYA_ADMIN.name}`);
  } catch (e) {
    await db.query("ROLLBACK").catch(() => undefined);
    throw e;
  } finally {
    db.release();
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });
