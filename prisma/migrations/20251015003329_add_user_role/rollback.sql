-- Rollback script for add_user_role migration
-- This script reverses the changes made in migration.sql

-- Step 1: Drop index
DROP INDEX IF EXISTS "User_role_idx";

-- Step 2: Remove role column
ALTER TABLE "User" DROP COLUMN IF EXISTS "role";

-- Step 3: Drop enum type
DROP TYPE IF EXISTS "UserRole";
