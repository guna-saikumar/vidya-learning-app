-- 002_pdf_scope: trim the schema down to the student-only PDF API surface.
--
-- * Drops dashboard/materials/quizzes/tasks/exams/study-session tables.
-- * Adds School + RefreshToken.
-- * Extends StudentProfile with onboarding fields.
-- * Extends Chapter/Section/ChapterProgress with content + progress fields.

-- === Drop removed domains (FK-safe order) ===
DROP TABLE IF EXISTS "QuizQuestion";
DROP TABLE IF EXISTS "QuizAttempt";
DROP TABLE IF EXISTS "Quiz";
DROP TABLE IF EXISTS "Material";
DROP TABLE IF EXISTS "Task";
DROP TABLE IF EXISTS "ExamResult";
DROP TABLE IF EXISTS "ExamScheduleItem";
DROP TABLE IF EXISTS "StudySession";

-- === Drop enums that are no longer referenced ===
DO $$ BEGIN
  DROP TYPE IF EXISTS "MaterialType";
EXCEPTION
  WHEN dependent_objects_still_exist THEN null;
END $$;

DO $$ BEGIN
  DROP TYPE IF EXISTS "PublicationStatus";
EXCEPTION
  WHEN dependent_objects_still_exist THEN null;
END $$;

DO $$ BEGIN
  DROP TYPE IF EXISTS "TaskType";
EXCEPTION
  WHEN dependent_objects_still_exist THEN null;
END $$;

DO $$ BEGIN
  DROP TYPE IF EXISTS "TaskStatus";
EXCEPTION
  WHEN dependent_objects_still_exist THEN null;
END $$;

DO $$ BEGIN
  DROP TYPE IF EXISTS "TaskPriority";
EXCEPTION
  WHEN dependent_objects_still_exist THEN null;
END $$;

-- === School directory ===
CREATE TABLE IF NOT EXISTS "School" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "udiseCode" TEXT NOT NULL,
    "district" TEXT NOT NULL,
    "mandal" TEXT,
    "address" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT (NOW() AT TIME ZONE 'UTC'),
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT (NOW() AT TIME ZONE 'UTC'),

    CONSTRAINT "School_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "School_udiseCode_key" ON "School"("udiseCode");
CREATE INDEX IF NOT EXISTS "School_district_idx" ON "School"("district");
CREATE INDEX IF NOT EXISTS "School_name_idx" ON "School"("name");

-- === Refresh tokens (sha256 hashed) ===
CREATE TABLE IF NOT EXISTS "RefreshToken" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "revokedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT (NOW() AT TIME ZONE 'UTC'),

    CONSTRAINT "RefreshToken_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "RefreshToken_tokenHash_key" ON "RefreshToken"("tokenHash");
CREATE INDEX IF NOT EXISTS "RefreshToken_userId_idx" ON "RefreshToken"("userId");

DO $$ BEGIN
  ALTER TABLE "RefreshToken" ADD CONSTRAINT "RefreshToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- === StudentProfile: onboarding fields ===
ALTER TABLE "StudentProfile"
  ADD COLUMN IF NOT EXISTS "firstName" TEXT,
  ADD COLUMN IF NOT EXISTS "lastName" TEXT,
  ADD COLUMN IF NOT EXISTS "gender" TEXT,
  ADD COLUMN IF NOT EXISTS "dob" DATE,
  ADD COLUMN IF NOT EXISTS "aadharNumber" TEXT,
  ADD COLUMN IF NOT EXISTS "bloodGroup" TEXT,
  ADD COLUMN IF NOT EXISTS "casteCategory" TEXT,
  ADD COLUMN IF NOT EXISTS "doorNo" TEXT,
  ADD COLUMN IF NOT EXISTS "street" TEXT,
  ADD COLUMN IF NOT EXISTS "villageCity" TEXT,
  ADD COLUMN IF NOT EXISTS "mandal" TEXT,
  ADD COLUMN IF NOT EXISTS "district" TEXT,
  ADD COLUMN IF NOT EXISTS "state" TEXT,
  ADD COLUMN IF NOT EXISTS "pincode" TEXT,
  ADD COLUMN IF NOT EXISTS "schoolId" TEXT,
  ADD COLUMN IF NOT EXISTS "schoolName" TEXT,
  ADD COLUMN IF NOT EXISTS "schoolCode" TEXT,
  ADD COLUMN IF NOT EXISTS "grade" TEXT,
  ADD COLUMN IF NOT EXISTS "section" TEXT,
  ADD COLUMN IF NOT EXISTS "medium" TEXT,
  ADD COLUMN IF NOT EXISTS "rollNumber" TEXT,
  ADD COLUMN IF NOT EXISTS "admissionNumber" TEXT,
  ADD COLUMN IF NOT EXISTS "fatherName" TEXT,
  ADD COLUMN IF NOT EXISTS "motherName" TEXT,
  ADD COLUMN IF NOT EXISTS "parentPhone" TEXT,
  ADD COLUMN IF NOT EXISTS "guardianPhone" TEXT,
  ADD COLUMN IF NOT EXISTS "language" TEXT NOT NULL DEFAULT 'en',
  ADD COLUMN IF NOT EXISTS "notificationsEnabled" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS "isOnboarded" BOOLEAN NOT NULL DEFAULT false;

DO $$ BEGIN
  ALTER TABLE "StudentProfile" ADD CONSTRAINT "StudentProfile_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

CREATE INDEX IF NOT EXISTS "StudentProfile_schoolId_idx" ON "StudentProfile"("schoolId");

-- === Curriculum content additions ===
ALTER TABLE "Chapter" ADD COLUMN IF NOT EXISTS "pdfUrl" TEXT;

ALTER TABLE "Section"
  ADD COLUMN IF NOT EXISTS "keyPoints" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN IF NOT EXISTS "diagrams" JSONB NOT NULL DEFAULT '[]'::jsonb;

-- === Progress: last viewed section ===
ALTER TABLE "ChapterProgress" ADD COLUMN IF NOT EXISTS "lastSectionId" TEXT;

-- === Timestamps: store UTC wall-clock regardless of the DB session time zone ===
-- The API reads/writes TIMESTAMP(3) columns as UTC. 001 used CURRENT_TIMESTAMP,
-- which follows the session time zone and drifts from API-written values.
DO $$
DECLARE r record;
BEGIN
  FOR r IN
    SELECT table_name, column_name
      FROM information_schema.columns
     WHERE table_schema = 'public'
       AND data_type = 'timestamp without time zone'
       AND column_default ILIKE 'CURRENT_TIMESTAMP%'
  LOOP
    EXECUTE format(
      'ALTER TABLE %I ALTER COLUMN %I SET DEFAULT (NOW() AT TIME ZONE ''UTC'')',
      r.table_name, r.column_name
    );
  END LOOP;
END $$;
