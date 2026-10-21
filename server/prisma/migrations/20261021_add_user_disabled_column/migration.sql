BEGIN;

-- ==============================================================================
-- Hutty Migration: 20261021_add_user_disabled_column
-- Adds missing account status and verification columns to the User table
--
-- Safety Invariants:
-- - All operations run within an atomic transaction (BEGIN/COMMIT).
-- - All operations use IF NOT EXISTS or safe conditional blocks.
-- - No tables, columns, or records are dropped or deleted.
-- - Preserves existing user accounts with safe default disabled = false.
-- ==============================================================================

-- 1. Add "disabled" column if not exists with safe default false
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "disabled" BOOLEAN DEFAULT false;

-- Ensure all existing records have disabled = false
UPDATE "User" SET "disabled" = false WHERE "disabled" IS NULL;

-- Enforce NOT NULL and DEFAULT false to match schema.prisma
ALTER TABLE "User" ALTER COLUMN "disabled" SET DEFAULT false;
ALTER TABLE "User" ALTER COLUMN "disabled" SET NOT NULL;

-- 2. Add "disabledAt" timestamp column if not exists (nullable)
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "disabledAt" TIMESTAMP(3);

-- 3. Add "disabledReason" text column if not exists (nullable)
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "disabledReason" TEXT;

-- 4. Add "phoneVerifiedAt" timestamp column if not exists (nullable)
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "phoneVerifiedAt" TIMESTAMP(3);

-- 5. Add index on "disabled" for query performance matching schema.prisma @@index([disabled])
CREATE INDEX IF NOT EXISTS "User_disabled_idx" ON "User"("disabled");

COMMIT;
