-- 003_bookmark_uniqueness: enforce one bookmark per user/target/type.
--
-- The API used a check-then-insert, which allowed duplicate rows under
-- concurrent requests. Deduplicate existing rows first, then add a unique
-- index so PostgreSQL is the final guard.

-- Keep the oldest bookmark for each (user, chapter, section, type) target.
WITH ranked AS (
  SELECT
    "id",
    ROW_NUMBER() OVER (
      PARTITION BY
        "userId",
        "chapterId",
        COALESCE("sectionId", ''),
        "type"
      ORDER BY "dateAdded" ASC, "id" ASC
    ) AS rn
  FROM "Bookmark"
)
DELETE FROM "Bookmark" b
USING ranked r
WHERE b."id" = r."id" AND r.rn > 1;

-- COALESCE is required because NULLs are distinct in a regular UNIQUE index.
CREATE UNIQUE INDEX IF NOT EXISTS "Bookmark_user_target_type_key"
  ON "Bookmark" (
    "userId",
    "chapterId",
    COALESCE("sectionId", ''),
    "type"
  );

-- Bookmarks are listed newest-first per user.
CREATE INDEX IF NOT EXISTS "Bookmark_userId_dateAdded_idx"
  ON "Bookmark" ("userId", "dateAdded" DESC);
