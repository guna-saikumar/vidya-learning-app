import bcrypt from "bcrypt";
import { PrismaClient, type Prisma } from "@prisma/client";
import { getClasses } from "../../curriculum/src/curriculum.service";

const prisma = new PrismaClient();

/**
 * Local/demo provisioned accounts (students do not self-register).
 * In production, admins will create/reset student credentials.
 */
const STUDENT_EMAIL = "student@vidya.test";
const STUDENT_PASSWORD = "StudentDemo1!";
const ADMIN_EMAIL = "admin@example.com";
const ADMIN_PASSWORD = "AdminDemo1!";
const SUPER_ADMIN_EMAIL = "superadmin@vidya.edu.in";
const SUPER_ADMIN_PASSWORD = "SuperAdminDemo1!";
const VIDYA_ADMIN_EMAIL = "admin@vidya.edu.in";

async function seedUsers() {
  const studentHash = await bcrypt.hash(STUDENT_PASSWORD, 10);
  const adminHash = await bcrypt.hash(ADMIN_PASSWORD, 10);
  const superAdminHash = await bcrypt.hash(SUPER_ADMIN_PASSWORD, 10);

  const student = await prisma.user.upsert({
    where: { email: STUDENT_EMAIL },
    update: {
      name: "Demo Student",
      role: "STUDENT",
      passwordHash: studentHash,
      emailVerifiedAt: new Date(),
      emailOtpHash: null,
      emailOtpExpiresAt: null,
      emailOtpPurpose: null,
    },
    create: {
      email: STUDENT_EMAIL,
      name: "Demo Student",
      role: "STUDENT",
      passwordHash: studentHash,
      emailVerifiedAt: new Date(),
    },
  });

  await prisma.user.upsert({
    where: { email: ADMIN_EMAIL },
    update: {
      name: "Admin",
      role: "ADMIN",
      department: "Academic Director · AP SCERT Division",
      passwordHash: adminHash,
      emailVerifiedAt: new Date(),
    },
    create: {
      email: ADMIN_EMAIL,
      name: "Admin",
      role: "ADMIN",
      department: "Academic Director · AP SCERT Division",
      passwordHash: adminHash,
      emailVerifiedAt: new Date(),
    },
  });

  const vidyaAdmin = await prisma.user.upsert({
    where: { email: VIDYA_ADMIN_EMAIL },
    update: {
      name: "Dr. Ramesh Sharma",
      role: "ADMIN",
      department: "Academic Director · AP SCERT Division",
      passwordHash: adminHash,
      emailVerifiedAt: new Date(),
    },
    create: {
      email: VIDYA_ADMIN_EMAIL,
      name: "Dr. Ramesh Sharma",
      role: "ADMIN",
      department: "Academic Director · AP SCERT Division",
      passwordHash: adminHash,
      emailVerifiedAt: new Date(),
    },
  });

  await prisma.user.upsert({
    where: { email: SUPER_ADMIN_EMAIL },
    update: {
      name: "Super Admin",
      role: "SUPER_ADMIN",
      department: "AP SCERT Division",
      passwordHash: superAdminHash,
      emailVerifiedAt: new Date(),
    },
    create: {
      email: SUPER_ADMIN_EMAIL,
      name: "Super Admin",
      role: "SUPER_ADMIN",
      department: "AP SCERT Division",
      passwordHash: superAdminHash,
      emailVerifiedAt: new Date(),
    },
  });

  return { student, vidyaAdmin };
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

async function seedDemoContent(
  studentId: string,
  authorId: string
) {
  await prisma.studentProfile.upsert({
    where: { userId: studentId },
    update: {
      activeClassId: "class-8",
      streakDays: 5,
      studyGoalMinutes: 45,
      avatarUrl: "",
    },
    create: {
      userId: studentId,
      activeClassId: "class-8",
      streakDays: 5,
      studyGoalMinutes: 45,
    },
  });

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

  // Weekly study minutes for charts
  for (let i = 0; i < 7; i++) {
    const day = new Date();
    day.setUTCHours(0, 0, 0, 0);
    day.setUTCDate(day.getUTCDate() - i);
    await prisma.studySession.upsert({
      where: {
        userId_day: { userId: studentId, day },
      },
      update: { minutes: 20 + i * 5 },
      create: {
        userId: studentId,
        day,
        minutes: 20 + i * 5,
      },
    });
  }

  console.log("Seeded demo materials, tasks, notifications, exams, progress");
}

async function main() {
  const { student, vidyaAdmin } = await seedUsers();
  await seedCurriculum();
  await seedDemoContent(student.id, vidyaAdmin.id);

  console.log("Seeded users:");
  console.log(`  student: ${STUDENT_EMAIL} / ${STUDENT_PASSWORD} (verified)`);
  console.log(`  admin:   ${ADMIN_EMAIL} / ${ADMIN_PASSWORD} (verified)`);
  console.log(`  admin:   ${VIDYA_ADMIN_EMAIL} / ${ADMIN_PASSWORD} (verified)`);
  console.log(
    `  super admin: ${SUPER_ADMIN_EMAIL} / ${SUPER_ADMIN_PASSWORD} (verified)`
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
