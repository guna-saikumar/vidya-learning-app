-- 005_doubts.sql: doubt threads, answers, upvotes and helpful votes
-- Idempotent: safe to run multiple times.

DO $$ BEGIN
  ALTER TYPE "UserRole" ADD VALUE IF NOT EXISTS 'TEACHER';
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS "Doubt" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "chapterId" TEXT NOT NULL,
  "sectionId" TEXT,
  "title" VARCHAR(120) NOT NULL,
  "body" TEXT NOT NULL,
  "isResolved" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Doubt_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "Doubt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE,
  CONSTRAINT "Doubt_chapterId_fkey" FOREIGN KEY ("chapterId") REFERENCES "Chapter"("id") ON DELETE CASCADE,
  CONSTRAINT "Doubt_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "Section"("id") ON DELETE SET NULL,
  CONSTRAINT "Doubt_title_length" CHECK (char_length(TRIM("title")) >= 8 AND char_length("title") <= 120),
  CONSTRAINT "Doubt_body_length" CHECK (char_length(TRIM("body")) >= 10 AND char_length("body") <= 4000)
);

CREATE TABLE IF NOT EXISTS "DoubtAnswer" (
  "id" TEXT NOT NULL,
  "doubtId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "body" TEXT NOT NULL,
  "isAccepted" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "DoubtAnswer_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "DoubtAnswer_doubtId_fkey" FOREIGN KEY ("doubtId") REFERENCES "Doubt"("id") ON DELETE CASCADE,
  CONSTRAINT "DoubtAnswer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE,
  CONSTRAINT "DoubtAnswer_body_length" CHECK (char_length(TRIM("body")) >= 1 AND char_length("body") <= 4000)
);

CREATE TABLE IF NOT EXISTS "DoubtUpvote" (
  "doubtId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "DoubtUpvote_pkey" PRIMARY KEY ("doubtId", "userId"),
  CONSTRAINT "DoubtUpvote_doubtId_fkey" FOREIGN KEY ("doubtId") REFERENCES "Doubt"("id") ON DELETE CASCADE,
  CONSTRAINT "DoubtUpvote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "DoubtAnswerHelpful" (
  "answerId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "DoubtAnswerHelpful_pkey" PRIMARY KEY ("answerId", "userId"),
  CONSTRAINT "DoubtAnswerHelpful_answerId_fkey" FOREIGN KEY ("answerId") REFERENCES "DoubtAnswer"("id") ON DELETE CASCADE,
  CONSTRAINT "DoubtAnswerHelpful_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS "idx_doubt_chapter_created" ON "Doubt" ("chapterId", "createdAt" DESC);
CREATE INDEX IF NOT EXISTS "idx_doubt_user_created" ON "Doubt" ("userId", "createdAt" DESC);
CREATE INDEX IF NOT EXISTS "idx_doubt_answer_doubt_created" ON "DoubtAnswer" ("doubtId", "createdAt");
CREATE INDEX IF NOT EXISTS "idx_doubt_answer_user_created" ON "DoubtAnswer" ("userId", "createdAt");
CREATE UNIQUE INDEX IF NOT EXISTS "idx_doubt_answer_accepted" ON "DoubtAnswer" ("doubtId") WHERE "isAccepted";
