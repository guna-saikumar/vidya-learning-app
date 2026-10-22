import bcrypt from "bcrypt";
import { PrismaClient, type Prisma } from "@prisma/client";
import { getClasses } from "../../curriculum/src/curriculum.service";

const prisma = new PrismaClient();

/**
 * Local/demo provisioned accounts (students do not self-register).
 * In production, admins will create/reset student credentials.
 *
 * Shared demo passwords (documented in seed console output):
 *   Students → StudentDemo1!
 *   Admins   → AdminDemo1!
 *   Super    → SuperAdminDemo1!
 */
const STUDENT_PASSWORD = "StudentDemo1!";
const ADMIN_PASSWORD = "AdminDemo1!";
const SUPER_ADMIN_PASSWORD = "SuperAdminDemo1!";

type SeedStudent = {
  email: string;
  name: string;
  activeClassId: string;
  streakDays: number;
  studyGoalMinutes: number;
};

type SeedAdmin = {
  email: string;
  name: string;
  role: "ADMIN" | "SUPER_ADMIN";
  department: string;
  password: string;
};

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

const SEED_ADMINS: SeedAdmin[] = [
  {
    email: "admin@example.com",
    name: "Admin",
    role: "ADMIN",
    department: "Academic Director · AP SCERT Division",
    password: ADMIN_PASSWORD,
  },
  {
    email: "admin@vidya.edu.in",
    name: "Dr. Ramesh Sharma",
    role: "ADMIN",
    department: "Academic Director · AP SCERT Division",
    password: ADMIN_PASSWORD,
  },
  {
    email: "lakshmi.rao@vidya.edu.in",
    name: "Lakshmi Rao",
    role: "ADMIN",
    department: "Curriculum Coordinator · Mathematics & Science",
    password: ADMIN_PASSWORD,
  },
  {
    email: "suresh.kumar@vidya.edu.in",
    name: "Suresh Kumar",
    role: "ADMIN",
    department: "Assessment Lead · FA/SA Examinations",
    password: ADMIN_PASSWORD,
  },
  {
    email: "fatima.begum@vidya.edu.in",
    name: "Fatima Begum",
    role: "ADMIN",
    department: "Language Studies · Telugu & English",
    password: ADMIN_PASSWORD,
  },
  {
    email: "superadmin@vidya.edu.in",
    name: "Super Admin",
    role: "SUPER_ADMIN",
    department: "AP SCERT Division",
    password: SUPER_ADMIN_PASSWORD,
  },
];

async function seedUsers() {
  const studentHash = await bcrypt.hash(STUDENT_PASSWORD, 10);
  const passwordHashes = new Map<string, string>();
  for (const admin of SEED_ADMINS) {
    if (!passwordHashes.has(admin.password)) {
      passwordHashes.set(admin.password, await bcrypt.hash(admin.password, 10));
    }
  }

  const students: { user: { id: string; email: string }; profile: SeedStudent }[] =
    [];

  for (const s of SEED_STUDENTS) {
    const user = await prisma.user.upsert({
      where: { email: s.email },
      update: {
        name: s.name,
        role: "STUDENT",
        passwordHash: studentHash,
        emailVerifiedAt: new Date(),
        emailOtpHash: null,
        emailOtpExpiresAt: null,
        emailOtpPurpose: null,
      },
      create: {
        email: s.email,
        name: s.name,
        role: "STUDENT",
        passwordHash: studentHash,
        emailVerifiedAt: new Date(),
      },
    });
    students.push({ user, profile: s });
  }

  let vidyaAdminId: string | null = null;
  for (const a of SEED_ADMINS) {
    const hash = passwordHashes.get(a.password)!;
    const user = await prisma.user.upsert({
      where: { email: a.email },
      update: {
        name: a.name,
        role: a.role,
        department: a.department,
        passwordHash: hash,
        emailVerifiedAt: new Date(),
        emailOtpHash: null,
        emailOtpExpiresAt: null,
        emailOtpPurpose: null,
      },
      create: {
        email: a.email,
        name: a.name,
        role: a.role,
        department: a.department,
        passwordHash: hash,
        emailVerifiedAt: new Date(),
      },
    });
    if (a.email === "admin@vidya.edu.in") {
      vidyaAdminId = user.id;
    }
  }

  const primaryStudent = students[0]!;
  return {
    student: primaryStudent.user,
    students,
    vidyaAdminId: vidyaAdminId!,
  };
}

async function seedCurriculum() {
  const classes = getClasses();
  for (const cls of classes) {
    await prisma.schoolClass.upsert({
      where: { id: cls.id },
      update: {
        grade: cls.grade,
        title: cls.title,
        subtitle: cls.subtitle,
        badge: cls.badge,
      },
      create: {
        id: cls.id,
        grade: cls.grade,
        title: cls.title,
        subtitle: cls.subtitle,
        badge: cls.badge,
      },
    });

    for (let si = 0; si < cls.subjects.length; si++) {
      const subject = cls.subjects[si]!;
      const category =
        subject.category === "all" ||
        subject.category === "stem" ||
        subject.category === "languages" ||
        subject.category === "social"
          ? subject.category
          : "stem";

      await prisma.subject.upsert({
        where: { id: subject.id },
        update: {
          classId: cls.id,
          name: subject.name,
          description: subject.description ?? null,
          category,
          icon: subject.icon,
          bannerUrl: subject.bannerUrl ?? null,
          order: si,
        },
        create: {
          id: subject.id,
          classId: cls.id,
          name: subject.name,
          description: subject.description ?? null,
          category,
          icon: subject.icon,
          bannerUrl: subject.bannerUrl ?? null,
          order: si,
        },
      });

      for (const chapter of subject.chapters) {
        await prisma.chapter.upsert({
          where: { id: chapter.id },
          update: {
            subjectId: subject.id,
            title: chapter.title,
            description: chapter.description ?? null,
            order: chapter.order,
            unitName: chapter.unitName ?? null,
            durationMinutes: chapter.durationMinutes ?? null,
            learningGoals: chapter.learningGoals ?? [],
            bannerUrl: chapter.bannerUrl ?? null,
          },
          create: {
            id: chapter.id,
            subjectId: subject.id,
            title: chapter.title,
            description: chapter.description ?? null,
            order: chapter.order,
            unitName: chapter.unitName ?? null,
            durationMinutes: chapter.durationMinutes ?? null,
            learningGoals: chapter.learningGoals ?? [],
            bannerUrl: chapter.bannerUrl ?? null,
          },
        });

        // Inline chapter quiz from curriculum package → Quiz + questions
        if (chapter.quiz) {
          const quizId = `quiz-${chapter.id}`;
          await prisma.quiz.upsert({
            where: { id: quizId },
            update: {
              chapterId: chapter.id,
              title: `${chapter.title} Check`,
              description: chapter.quiz.question.slice(0, 120),
              timeLimitMinutes: 10,
            },
            create: {
              id: quizId,
              chapterId: chapter.id,
              title: `${chapter.title} Check`,
              description: chapter.quiz.question.slice(0, 120),
              timeLimitMinutes: 10,
            },
          });
          await prisma.quizQuestion.deleteMany({ where: { quizId } });
          await prisma.quizQuestion.create({
            data: {
              id: `${quizId}-q1`,
              quizId,
              question: chapter.quiz.question,
              options: chapter.quiz.options,
              correctIndex: chapter.quiz.correctIndex,
              explanation: chapter.quiz.explanation,
              order: 0,
            },
          });
        }

        for (const section of chapter.sections) {
          await prisma.section.upsert({
            where: { id: section.id },
            update: {
              chapterId: chapter.id,
              title: section.title,
              content: section.content,
              order: section.order,
              durationMinutes: section.durationMinutes ?? null,
              summaryPoint: section.summaryPoint ?? null,
              keyAxiom: section.keyAxiom ?? null,
            },
            create: {
              id: section.id,
              chapterId: chapter.id,
              title: section.title,
              content: section.content,
              order: section.order,
              durationMinutes: section.durationMinutes ?? null,
              summaryPoint: section.summaryPoint ?? null,
              keyAxiom: section.keyAxiom ?? null,
            },
          });
        }
      }
    }
  }
  console.log(`Seeded curriculum: ${classes.length} classes`);
}

async function seedStudentProfiles(
  students: { user: { id: string }; profile: SeedStudent }[]
) {
  for (const { user, profile } of students) {
    await prisma.studentProfile.upsert({
      where: { userId: user.id },
      update: {
        activeClassId: profile.activeClassId,
        streakDays: profile.streakDays,
        studyGoalMinutes: profile.studyGoalMinutes,
        avatarUrl: "",
      },
      create: {
        userId: user.id,
        activeClassId: profile.activeClassId,
        streakDays: profile.streakDays,
        studyGoalMinutes: profile.studyGoalMinutes,
      },
    });
  }
}

async function seedDemoContent(
  studentId: string,
  authorId: string,
  extraStudents: { id: string; classId: string }[] = []
) {

  const materials: Prisma.MaterialCreateInput[] = [
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
      class: { connect: { id: "class-8" } },
      subject: { connect: { id: "c8-maths" } },
      chapter: { connect: { id: "c8-m-ch1" } },
      section: { connect: { id: "c8-m-ch1-s1" } },
      author: { connect: { id: authorId } },
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
      class: { connect: { id: "class-8" } },
      subject: { connect: { id: "c8-maths" } },
      chapter: { connect: { id: "c8-m-ch1" } },
      author: { connect: { id: authorId } },
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
      class: { connect: { id: "class-8" } },
      subject: { connect: { id: "c8-maths" } },
      chapter: { connect: { id: "c8-m-ch2" } },
      author: { connect: { id: authorId } },
    },
  ];

  for (const m of materials) {
    const id = m.id as string;
    await prisma.material.upsert({
      where: { id },
      update: {
        title: m.title,
        description: m.description,
        status: m.status,
        fileUrl: m.fileUrl,
        videoUrl: m.videoUrl,
      },
      create: m,
    });
  }

  // Multi-question demo quiz matching student mock
  const demoQuizId = "quiz-c8-m-ch1";
  await prisma.quiz.upsert({
    where: { id: demoQuizId },
    update: {
      chapterId: "c8-m-ch1",
      title: "Rational Numbers Quiz",
      description: "Test your understanding of rational number properties.",
      timeLimitMinutes: 10,
    },
    create: {
      id: demoQuizId,
      chapterId: "c8-m-ch1",
      title: "Rational Numbers Quiz",
      description: "Test your understanding of rational number properties.",
      timeLimitMinutes: 10,
    },
  });
  await prisma.quizQuestion.deleteMany({ where: { quizId: demoQuizId } });
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
    await prisma.quizQuestion.create({
      data: { ...q, quizId: demoQuizId },
    });
  }

  const now = Date.now();
  const DAY = 86400000;
  const tasks = [
    {
      id: "task-quiz-1",
      title: "Rational Numbers Quiz",
      description: "Test your understanding of properties of rational numbers.",
      type: "quiz" as const,
      status: "pending" as const,
      priority: "high" as const,
      subjectId: "c8-maths",
      subjectName: "Mathematics",
      classId: "class-8",
      chapterId: "c8-m-ch1",
      chapterTitle: "Rational Numbers",
      assigneeUserId: studentId,
      dueDate: new Date(now + DAY * 2),
      estimatedMinutes: 15,
      totalQuestions: 10,
      icon: "quiz",
    },
    {
      id: "task-assign-1",
      title: "Force & Pressure Worksheet",
      description: "Complete the worksheet on types of forces and pressure.",
      type: "assignment" as const,
      status: "pending" as const,
      priority: "medium" as const,
      subjectId: "c8-pscience",
      subjectName: "Physical Science",
      classId: "class-8",
      chapterId: "c8-ps-ch1",
      chapterTitle: "Force and Pressure",
      assigneeUserId: studentId,
      dueDate: new Date(now + DAY * 3),
      estimatedMinutes: 30,
      totalQuestions: 15,
      icon: "assignment",
    },
    {
      id: "task-practice-1",
      title: "Daily Practice: Linear Equations",
      description: "Solve 5 practice problems on linear equations.",
      type: "practice" as const,
      status: "in_progress" as const,
      priority: "medium" as const,
      subjectId: "c8-maths",
      subjectName: "Mathematics",
      classId: "class-8",
      chapterId: "c8-m-ch2",
      chapterTitle: "Linear Equations in One Variable",
      assigneeUserId: studentId,
      dueDate: new Date(now + DAY),
      estimatedMinutes: 20,
      completedQuestions: 2,
      totalQuestions: 5,
      icon: "fitness-center",
    },
  ];

  for (const t of tasks) {
    await prisma.task.upsert({
      where: { id: t.id },
      update: {
        title: t.title,
        status: t.status,
        dueDate: t.dueDate,
      },
      create: t,
    });
  }

  await prisma.notification.deleteMany({ where: { userId: studentId } });
  await prisma.notification.createMany({
    data: [
      {
        id: "notif-1",
        userId: studentId,
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
        userId: studentId,
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
        userId: studentId,
        title: "AP SCERT Board: SA-1 Examination Timetable Released",
        message: "Official timetable for Summative Assessment-1 announced.",
        detailedBody: "Examination window: November 16–24, 2026.",
        type: "announcement",
        icon: "campaign",
        actionRoute: "ExamSchedule",
        actionLabel: "View Exam Schedule",
      },
    ],
  });

  await prisma.examScheduleItem.deleteMany({ where: { classId: "class-8" } });
  await prisma.examScheduleItem.createMany({
    data: [
      {
        id: "exam-sa1-math",
        classId: "class-8",
        subjectName: "Mathematics",
        title: "SA-1 Mathematics",
        examDate: new Date("2026-11-16T09:30:00Z"),
        startTime: "09:30",
        endTime: "12:15",
        venue: "Main Hall",
        notes: "Units 1–5",
      },
      {
        id: "exam-sa1-science",
        classId: "class-8",
        subjectName: "Physical Science",
        title: "SA-1 Physical Science",
        examDate: new Date("2026-11-18T09:30:00Z"),
        startTime: "09:30",
        endTime: "12:15",
        venue: "Lab Block",
      },
    ],
  });

  await prisma.examResult.deleteMany({ where: { userId: studentId } });
  await prisma.examResult.createMany({
    data: [
      {
        id: "result-fa1-math",
        userId: studentId,
        subjectName: "Mathematics",
        examTitle: "FA-1 Mathematics",
        marksObtained: 18,
        marksMax: 20,
        grade: "A1",
        remarks: "Excellent",
      },
      {
        id: "result-fa1-eng",
        userId: studentId,
        subjectName: "English",
        examTitle: "FA-1 English",
        marksObtained: 16,
        marksMax: 20,
        grade: "A2",
      },
    ],
  });

  await prisma.chapterProgress.upsert({
    where: {
      userId_chapterId: { userId: studentId, chapterId: "c8-m-ch1" },
    },
    update: {
      completedSections: ["c8-m-ch1-s1", "c8-m-ch1-s2"],
      progressPercent: 50,
      completed: false,
      lastAccessed: new Date(),
    },
    create: {
      userId: studentId,
      chapterId: "c8-m-ch1",
      subjectId: "c8-maths",
      classId: "class-8",
      completedSections: ["c8-m-ch1-s1", "c8-m-ch1-s2"],
      progressPercent: 50,
    },
  });

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
      await prisma.studySession.upsert({
        where: {
          userId_day: { userId, day },
        },
        update: { minutes: base + i * 5 },
        create: {
          userId,
          day,
          minutes: base + i * 5,
        },
      });
    }
  }

  // Light progress for other students so dashboards look inhabited
  for (const extra of extraStudents) {
    const chapterByClass: Record<string, { chapterId: string; subjectId: string }> = {
      "class-6": { chapterId: "c6-m-ch1", subjectId: "c6-maths" },
      "class-7": { chapterId: "c7-m-ch1", subjectId: "c7-maths" },
      "class-8": { chapterId: "c8-m-ch1", subjectId: "c8-maths" },
      "class-9": { chapterId: "c9-m-ch1", subjectId: "c9-maths" },
      "class-10": { chapterId: "c10-m-ch1", subjectId: "c10-maths" },
    };
    const target = chapterByClass[extra.classId];
    if (!target) continue;

    // Only upsert if the chapter exists (curriculum seed may not have every id)
    const chapter = await prisma.chapter.findUnique({
      where: { id: target.chapterId },
    });
    if (!chapter) continue;

    await prisma.chapterProgress.upsert({
      where: {
        userId_chapterId: {
          userId: extra.id,
          chapterId: target.chapterId,
        },
      },
      update: {
        progressPercent: 25,
        completed: false,
        lastAccessed: new Date(),
      },
      create: {
        userId: extra.id,
        chapterId: target.chapterId,
        subjectId: target.subjectId,
        classId: extra.classId,
        progressPercent: 25,
      },
    });
  }

  console.log("Seeded demo materials, tasks, notifications, exams, progress");
}

async function main() {
  const { student, students, vidyaAdminId } = await seedUsers();
  await seedCurriculum();
  await seedStudentProfiles(students);
  const extras = students.slice(1).map(({ user, profile }) => ({
    id: user.id,
    classId: profile.activeClassId,
  }));
  await seedDemoContent(student.id, vidyaAdminId, extras);

  console.log("\nSeeded login accounts (all email-verified):\n");
  console.log("Students (password: StudentDemo1!):");
  for (const { profile } of students) {
    console.log(
      `  ${profile.email.padEnd(32)}  ${profile.name.padEnd(16)}  ${profile.activeClassId}`
    );
  }
  console.log("\nAdmins (password: AdminDemo1!):");
  for (const a of SEED_ADMINS.filter((x) => x.role === "ADMIN")) {
    console.log(`  ${a.email.padEnd(32)}  ${a.name}`);
  }
  console.log("\nSuper admin (password: SuperAdminDemo1!):");
  for (const a of SEED_ADMINS.filter((x) => x.role === "SUPER_ADMIN")) {
    console.log(`  ${a.email.padEnd(32)}  ${a.name}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
