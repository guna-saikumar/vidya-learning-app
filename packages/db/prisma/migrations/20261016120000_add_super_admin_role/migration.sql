-- AlterEnum: add SUPER_ADMIN to UserRole (idempotent)
DO $$ BEGIN
  ALTER TYPE "UserRole" ADD VALUE IF NOT EXISTS 'SUPER_ADMIN';
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
