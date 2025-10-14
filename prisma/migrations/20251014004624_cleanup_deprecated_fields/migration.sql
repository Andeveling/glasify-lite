-- Migration: Cleanup deprecated fields and redundancies
-- This migration removes deprecated fields that have been replaced by new architecture

-- Step 1: Drop deprecated indexes on GlassType
DROP INDEX IF EXISTS "GlassType_manufacturerId_purpose_idx";

-- Step 2: Drop deprecated columns from GlassType
-- Note: purpose enum is kept for backward compatibility (marked as deprecated in schema)
-- manufacturerId is removed as currency is now in TenantConfig
ALTER TABLE "GlassType" DROP COLUMN IF EXISTS "manufacturerId";

-- Step 3: Drop deprecated columns from Model
-- manufacturerId replaced by profileSupplierId
ALTER TABLE "Model" DROP COLUMN IF EXISTS "manufacturerId";

-- Step 4: Drop deprecated columns from Service
-- Services are now global (TenantConfig level)
ALTER TABLE "Service" DROP COLUMN IF EXISTS "manufacturerId";

-- Step 5: Drop deprecated columns from Quote
-- Currency and validity now come from TenantConfig
ALTER TABLE "Quote" DROP COLUMN IF EXISTS "manufacturerId";

-- Step 6: Clean up any orphaned indexes
DROP INDEX IF EXISTS "Service_manufacturerId_type_idx";
DROP INDEX IF EXISTS "Model_manufacturerId_status_idx";
DROP INDEX IF EXISTS "GlassType_manufacturerId_idx";

-- Note: Manufacturer table is kept for now (marked as @deprecated)
-- It will be fully removed in a future migration after full data migration
-- and confirmation that no legacy code depends on it