import { randomBytes } from "node:crypto";
import bcrypt from "bcrypt";
import { Pool, type PoolClient } from "pg";
import { getClasses } from "../../curriculum/src/curriculum.service";

/**
 * Student-only seed using plain `pg` (no ORM).
 *
 * Seeds: students + student profiles, AP sample schools, curriculum
 * (classes → subjects → chapters → sections), notifications and a little
 * chapter progress. Nothing else (no quizzes/tasks/exams/materials/admin).
 *
 * Shared demo password: StudentDemo1!
 */
const STUDENT_PASSWORD = "StudentDemo1!";

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

const iso = (d: Date) => d.toISOString();

// ---------------------------------------------------------------- schools --

type SeedSchool = {
  id: string;
  name: string;
  udiseCode: string;
  district: string;
  mandal: string;
  address: string;
};

/** Sample Andhra Pradesh schools (UDISE codes are illustrative). */
const SEED_SCHOOLS: SeedSchool[] = [
  {
    id: "school-vzg-001",
    name: "ZPHS Gajuwaka",
    udiseCode: "28010100101",
    district: "Visakhapatnam",
    mandal: "Gajuwaka",
    address: "Main Road, Gajuwaka, Visakhapatnam - 530026",
  },
  {
    id: "school-vzg-002",
    name: "MPPS Pendurthi",
    udiseCode: "28010200202",
    district: "Visakhapatnam",
    mandal: "Pendurthi",
    address: "Bazaar Street, Pendurthi, Visakhapatnam - 531173",
  },
  {
    id: "school-gnt-001",
    name: "ZPHS Tenali",
    udiseCode: "28150100303",
    district: "Guntur",
    mandal: "Tenali",
    address: "Station Road, Tenali, Guntur - 522201",
  },
  {
    id: "school-gnt-002",
    name: "AP Model School Mangalagiri",
    udiseCode: "28150200404",
    district: "Guntur",
    mandal: "Mangalagiri",
    address: "NH-16, Mangalagiri, Guntur - 522503",
  },
  {
    id: "school-krs-001",
    name: "ZPHS Gudivada",
    udiseCode: "28120100505",
    district: "Krishna",
    mandal: "Gudivada",
    address: "Bus Stand Road, Gudivada, Krishna - 521301",
  },
  {
    id: "school-ctr-001",
    name: "ZPHS Tirupati Rural",
    udiseCode: "28220100606",
    district: "Tirupati",
    mandal: "Tirupati Rural",
    address: "Renigunta Road, Tirupati - 517502",
  },
  {
    id: "school-knl-001",
    name: "ZPHS Nandyal",
    udiseCode: "28180100707",
    district: "Nandyal",
    mandal: "Nandyal",
    address: "Gandhi Chowk, Nandyal - 518501",
  },
  {
    id: "school-atp-001",
    name: "ZPHS Dharmavaram",
    udiseCode: "28200100808",
    district: "Sri Sathya Sai",
    mandal: "Dharmavaram",
    address: "Silk Market Road, Dharmavaram - 515671",
  },
  {
    id: "school-egd-001",
    name: "ZPHS Rajahmundry Urban",
    udiseCode: "28050100909",
    district: "East Godavari",
    mandal: "Rajahmundry Urban",
    address: "Danavaipeta, Rajahmundry - 533103",
  },
  {
    id: "school-nlr-001",
    name: "ZPHS Kavali",
    udiseCode: "28170101010",
    district: "Nellore",
    mandal: "Kavali",
    address: "Trunk Road, Kavali, Nellore - 524201",
  },
];

async function seedSchools(db: PoolClient) {
  for (const s of SEED_SCHOOLS) {
    await db.query(
      `INSERT INTO "School"
         ("id", "name", "udiseCode", "district", "mandal", "address", "updatedAt")
       VALUES ($1, $2, $3, $4, $5, $6, $7::timestamp)
       ON CONFLICT ("id") DO UPDATE SET
         "name" = EXCLUDED."name",
         "udiseCode" = EXCLUDED."udiseCode",
         "district" = EXCLUDED."district",
         "mandal" = EXCLUDED."mandal",
         "address" = EXCLUDED."address",
         "updatedAt" = EXCLUDED."updatedAt"`,
      [s.id, s.name, s.udiseCode, s.district, s.mandal, s.address, iso(new Date())]
    );
  }
  console.log(`Seeded schools: ${SEED_SCHOOLS.length}`);
}

// ---------------------------------------------------------------- students --

type SeedStudent = {
  email: string;
  firstName: string;
  lastName: string;
  gender: "MALE" | "FEMALE";
  dob: string;
  activeClassId: string;
  grade: string;
  streakDays: number;
  schoolId: string;
  isOnboarded: boolean;
  language: "en" | "te";
};

const SEED_STUDENTS: SeedStudent[] = [
  {
    email: "student@vidya.test",
    firstName: "Demo",
    lastName: "Student",
    gender: "MALE",
    dob: "2012-06-15",
    activeClassId: "class-8",
    grade: "8",
    streakDays: 5,
    schoolId: "school-vzg-001",
    isOnboarded: true,
    language: "en",
  },
  {
    email: "ananya.reddy@vidya.test",
    firstName: "Ananya",
    lastName: "Reddy",
    gender: "FEMALE",
    dob: "2012-03-02",
    activeClassId: "class-8",
    grade: "8",
    streakDays: 12,
    schoolId: "school-gnt-001",
    isOnboarded: true,
    language: "te",
  },
  {
    email: "karthik.nair@vidya.test",
    firstName: "Karthik",
    lastName: "Nair",
    gender: "MALE",
    dob: "2011-11-21",
    activeClassId: "class-9",
    grade: "9",
    streakDays: 3,
    schoolId: "school-krs-001",
    isOnboarded: true,
    language: "en",
  },
  {
    email: "priya.suresh@vidya.test",
    firstName: "Priya",
    lastName: "Suresh",
    gender: "FEMALE",
    dob: "2013-01-09",
    activeClassId: "class-7",
    grade: "7",
    streakDays: 8,
    schoolId: "school-egd-001",
    isOnboarded: true,
    language: "en",
  },
  {
    email: "arjun.patel@vidya.test",
    firstName: "Arjun",
    lastName: "Patel",
    gender: "MALE",
    dob: "2010-08-30",
    activeClassId: "class-10",
    grade: "10",
    streakDays: 21,
    schoolId: "school-nlr-001",
    isOnboarded: true,
    language: "en",
  },
  {
    // Not onboarded on purpose: exercises PUT /students/me/onboarding.
    email: "meera.iyer@vidya.test",
    firstName: "Meera",
    lastName: "Iyer",
    gender: "FEMALE",
    dob: "2014-05-12",
    activeClassId: "class-6",
    grade: "6",
    streakDays: 0,
    schoolId: "school-ctr-001",
    isOnboarded: false,
    language: "en",
  },
];

type SeedUser = { id: string; email: string };

async function upsertStudentUser(
  db: PoolClient,
  u: { email: string; name: string; passwordHash: string }
): Promise<SeedUser> {
  const { rows } = await db.query<SeedUser>(
    `INSERT INTO "User"
       ("id", "email", "name", "role", "passwordHash", "emailVerifiedAt")
     VALUES ($1, $2, $3, 'STUDENT'::"UserRole", $4, $5::timestamp)
     ON CONFLICT ("email") DO UPDATE SET
       "name" = EXCLUDED."name",
       "role" = EXCLUDED."role",
       "passwordHash" = EXCLUDED."passwordHash",
       "emailVerifiedAt" = EXCLUDED."emailVerifiedAt",
       "emailOtpHash" = NULL,
       "emailOtpExpiresAt" = NULL,
       "emailOtpPurpose" = NULL
     RETURNING "id", "email"`,
    [newId(), u.email, u.name, u.passwordHash, iso(new Date())]
  );
  return rows[0]!;
}

async function seedUsers(db: PoolClient) {
  // Legacy admin account from earlier seeds (admin surface no longer exists).
  await db.query(`DELETE FROM "User" WHERE "email" = 'admin@vidya.edu.in'`);

  const hash = await bcrypt.hash(STUDENT_PASSWORD, 10);
  const students: { user: SeedUser; profile: SeedStudent }[] = [];
  for (const s of SEED_STUDENTS) {
    const user = await upsertStudentUser(db, {
      email: s.email,
      name: `${s.firstName} ${s.lastName}`,
      passwordHash: hash,
    });
    students.push({ user, profile: s });
  }
  return students;
}

async function seedStudentProfiles(
  db: PoolClient,
  students: { user: SeedUser; profile: SeedStudent }[]
) {
  for (const { user, profile: p } of students) {
    const school = SEED_SCHOOLS.find((s) => s.id === p.schoolId)!;
    const onboarded = p.isOnboarded;
    const idx = SEED_STUDENTS.indexOf(p) + 1;

    await db.query(
      `INSERT INTO "StudentProfile"
         ("id", "userId", "activeClassId", "streakDays", "avatarUrl", "updatedAt",
          "firstName", "lastName", "gender", "dob", "bloodGroup", "casteCategory",
          "doorNo", "street", "villageCity", "mandal", "district", "state", "pincode",
          "schoolId", "schoolName", "schoolCode", "grade", "section", "medium",
          "rollNumber", "admissionNumber", "fatherName", "motherName",
          "parentPhone", "guardianPhone", "language", "notificationsEnabled", "isOnboarded")
       VALUES ($1, $2, $3, $4, '', $5::timestamp,
               $6, $7, $8, $9::date, $10, $11,
               $12, $13, $14, $15, $16, $17, $18,
               $19, $20, $21, $22, $23, $24,
               $25, $26, $27, $28,
               $29, $30, $31, true, $32)
       ON CONFLICT ("userId") DO UPDATE SET
         "activeClassId" = EXCLUDED."activeClassId",
         "streakDays" = EXCLUDED."streakDays",
         "avatarUrl" = '',
         "updatedAt" = EXCLUDED."updatedAt",
         "firstName" = EXCLUDED."firstName",
         "lastName" = EXCLUDED."lastName",
         "gender" = EXCLUDED."gender",
         "dob" = EXCLUDED."dob",
         "bloodGroup" = EXCLUDED."bloodGroup",
         "casteCategory" = EXCLUDED."casteCategory",
         "doorNo" = EXCLUDED."doorNo",
         "street" = EXCLUDED."street",
         "villageCity" = EXCLUDED."villageCity",
         "mandal" = EXCLUDED."mandal",
         "district" = EXCLUDED."district",
         "state" = EXCLUDED."state",
         "pincode" = EXCLUDED."pincode",
         "schoolId" = EXCLUDED."schoolId",
         "schoolName" = EXCLUDED."schoolName",
         "schoolCode" = EXCLUDED."schoolCode",
         "grade" = EXCLUDED."grade",
         "section" = EXCLUDED."section",
         "medium" = EXCLUDED."medium",
         "rollNumber" = EXCLUDED."rollNumber",
         "admissionNumber" = EXCLUDED."admissionNumber",
         "fatherName" = EXCLUDED."fatherName",
         "motherName" = EXCLUDED."motherName",
         "parentPhone" = EXCLUDED."parentPhone",
         "guardianPhone" = EXCLUDED."guardianPhone",
         "language" = EXCLUDED."language",
         "notificationsEnabled" = true,
         "isOnboarded" = EXCLUDED."isOnboarded"`,
      [
        newId(),
        user.id,
        p.activeClassId,
        p.streakDays,
        iso(new Date()),
        p.firstName,
        p.lastName,
        p.gender,
        p.dob,
        onboarded ? "B+" : null,
        onboarded ? ["OC", "BC", "SC", "ST"][idx % 4]! : null,
        onboarded ? `${10 + idx}-${idx}` : null,
        onboarded ? "Temple Street" : null,
        onboarded ? school.mandal : null,
        onboarded ? school.mandal : null,
        onboarded ? school.district : null,
        onboarded ? "Andhra Pradesh" : null,
        onboarded ? "530026" : null,
        p.schoolId,
        school.name,
        school.udiseCode,
        p.grade,
        onboarded ? "A" : null,
        onboarded ? (p.language === "te" ? "TELUGU" : "ENGLISH") : null,
        onboarded ? String(idx).padStart(2, "0") : null,
        onboarded ? `ADM-2026-${String(idx).padStart(4, "0")}` : null,
        onboarded ? `${p.lastName} Sr.` : null,
        onboarded ? `Mrs. ${p.lastName}` : null,
        onboarded ? `98480000${String(idx).padStart(2, "0")}` : null,
        onboarded ? `98490000${String(idx).padStart(2, "0")}` : null,
        p.language,
        onboarded,
      ]
    );
  }
  console.log(`Seeded student profiles: ${students.length}`);
}

// -------------------------------------------------------------- curriculum --

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

        for (const section of chapter.sections) {
          const keyPoints = [section.summaryPoint, section.keyAxiom].filter(
            (v): v is string => typeof v === "string" && v.length > 0
          );
          await db.query(
            `INSERT INTO "Section"
               ("id", "chapterId", "title", "content", "order", "durationMinutes",
                "summaryPoint", "keyAxiom", "keyPoints", "updatedAt")
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9::text[], $10::timestamp)
             ON CONFLICT ("id") DO UPDATE SET
               "chapterId" = EXCLUDED."chapterId",
               "title" = EXCLUDED."title",
               "content" = EXCLUDED."content",
               "order" = EXCLUDED."order",
               "durationMinutes" = EXCLUDED."durationMinutes",
               "summaryPoint" = EXCLUDED."summaryPoint",
               "keyAxiom" = EXCLUDED."keyAxiom",
               "keyPoints" = EXCLUDED."keyPoints",
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
              keyPoints,
              iso(new Date()),
            ]
          );
        }
      }
    }
  }
  console.log(`Seeded curriculum: ${classes.length} classes`);
}

// ----------------------------------------------------- notifications/progress --

async function seedNotifications(
  db: PoolClient,
  students: { user: SeedUser; profile: SeedStudent }[]
) {
  // Legacy notifications from earlier seeds (linked to removed Tasks/Exams screens).
  await db.query(
    `DELETE FROM "Notification" WHERE "id" IN ('notif-1', 'notif-2', 'notif-3')`
  );

  const notifications = [
    {
      key: "welcome",
      title: "Welcome to Vidya",
      message: "Your learning journey starts here.",
      detailedBody:
        "Browse your class subjects, open a chapter and keep track of your progress.",
      type: "system",
      icon: "school",
      actionRoute: "Learn",
      actionLabel: "Start learning",
      read: false,
    },
    {
      key: "streak",
      title: "Learning streak unlocked!",
      message: "You are on a roll — keep studying every day.",
      detailedBody: "Consistent daily study builds long-term understanding.",
      type: "achievement",
      icon: "emoji-events",
      actionRoute: "Progress",
      actionLabel: "View progress",
      read: false,
    },
    {
      key: "announcement",
      title: "AP SCERT: new textbook content added",
      message: "Fresh chapter notes are now available in your curriculum.",
      detailedBody: "Open Learn to explore the latest chapters and sections.",
      type: "announcement",
      icon: "campaign",
      actionRoute: "Learn",
      actionLabel: "Open Learn",
      read: true,
    },
  ] as const;

  for (const { user } of students) {
    for (const n of notifications) {
      await db.query(
        `INSERT INTO "Notification"
           ("id", "userId", "title", "message", "detailedBody", "type", "icon",
            "actionRoute", "actionLabel", "readAt")
         VALUES ($1, $2, $3, $4, $5, $6::"NotificationType", $7, $8, $9, $10::timestamp)
         ON CONFLICT ("id") DO UPDATE SET
           "title" = EXCLUDED."title",
           "message" = EXCLUDED."message",
           "detailedBody" = EXCLUDED."detailedBody",
           "type" = EXCLUDED."type",
           "icon" = EXCLUDED."icon",
           "actionRoute" = EXCLUDED."actionRoute",
           "actionLabel" = EXCLUDED."actionLabel",
           "readAt" = EXCLUDED."readAt"`,
        [
          `notif-${n.key}-${user.id}`,
          user.id,
          n.title,
          n.message,
          n.detailedBody,
          n.type,
          n.icon,
          n.actionRoute,
          n.actionLabel,
          n.read ? iso(new Date()) : null,
        ]
      );
    }
  }
  console.log(`Seeded notifications: ${students.length * notifications.length}`);
}

async function seedChapterProgress(
  db: PoolClient,
  students: { user: SeedUser; profile: SeedStudent }[]
) {
  let count = 0;
  for (const { user, profile } of students) {
    // First two chapters of the first subject in the student's class.
    const { rows: chapters } = await db.query<{
      id: string;
      subjectId: string;
      firstSectionId: string | null;
    }>(
      `SELECT c."id", c."subjectId",
              (SELECT se."id" FROM "Section" se
                WHERE se."chapterId" = c."id"
                ORDER BY se."order" ASC LIMIT 1) AS "firstSectionId"
         FROM "Chapter" c
         JOIN "Subject" s ON s."id" = c."subjectId"
        WHERE s."classId" = $1
        ORDER BY s."order" ASC, c."order" ASC
        LIMIT 2`,
      [profile.activeClassId]
    );

    for (let i = 0; i < chapters.length; i++) {
      const ch = chapters[i]!;
      const completed = i === 0 && profile.streakDays >= 5;
      const percent = completed ? 100 : 25 + i * 10;
      await db.query(
        `INSERT INTO "ChapterProgress"
           ("id", "userId", "chapterId", "subjectId", "classId", "completed",
            "completedSections", "progressPercent", "lastSectionId", "updatedAt")
         VALUES ($1, $2, $3, $4, $5, $6, $7::text[], $8, $9, $10::timestamp)
         ON CONFLICT ("userId", "chapterId") DO UPDATE SET
           "completed" = EXCLUDED."completed",
           "completedSections" = EXCLUDED."completedSections",
           "progressPercent" = EXCLUDED."progressPercent",
           "lastSectionId" = EXCLUDED."lastSectionId",
           "lastAccessed" = (NOW() AT TIME ZONE 'UTC'),
           "updatedAt" = EXCLUDED."updatedAt"`,
        [
          newId(),
          user.id,
          ch.id,
          ch.subjectId,
          profile.activeClassId,
          completed,
          ch.firstSectionId ? [ch.firstSectionId] : [],
          percent,
          ch.firstSectionId,
          iso(new Date()),
        ]
      );
      count++;
    }
  }
  console.log(`Seeded chapter progress rows: ${count}`);
}

async function main() {
  const db = await pool.connect();
  try {
    await db.query("BEGIN");

    await seedSchools(db);
    const students = await seedUsers(db);
    await seedCurriculum(db);
    await seedStudentProfiles(db, students);
    await seedNotifications(db, students);
    await seedChapterProgress(db, students);

    await db.query("COMMIT");

    console.log("\nSeeded student accounts (password: StudentDemo1!):\n");
    for (const { profile } of students) {
      console.log(
        `  ${profile.email.padEnd(32)}  ${`${profile.firstName} ${profile.lastName}`.padEnd(16)}  ${profile.activeClassId}${
          profile.isOnboarded ? "" : "  (not onboarded)"
        }`
      );
    }
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
