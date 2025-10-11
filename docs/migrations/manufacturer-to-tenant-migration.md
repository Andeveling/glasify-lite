# Migration Guide: Manufacturer → TenantConfig + ProfileSupplier

**Migration Date**: October 2025  
**Version**: v1.0  
**Database Schema Version**: `20251010151508_refactor_manufacturer_to_tenant_config`

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Migration Overview](#migration-overview)
3. [Pre-Migration Checklist](#pre-migration-checklist)
4. [Database Schema Changes](#database-schema-changes)
5. [Data Transformation Logic](#data-transformation-logic)
6. [Application Code Updates](#application-code-updates)
7. [Step-by-Step Migration Procedure](#step-by-step-migration-procedure)
8. [Validation & Testing](#validation--testing)
9. [Rollback Procedure](#rollback-procedure)
10. [Post-Migration Verification](#post-migration-verification)

---

## Executive Summary

### Problem Statement

The original `Manufacturer` model incorrectly represented **two distinct concepts**:

1. **Tenant Configuration** (the carpentry shop owner using the application)
2. **Profile Suppliers** (window/door profile manufacturers like Rehau, Deceuninck)

This violated the **Single Responsibility Principle** and created semantic confusion in the codebase.

### Solution

Refactored into two separate entities:

- **TenantConfig**: Singleton representing business configuration (currency, locale, quote validity)
- **ProfileSupplier**: Multiple records representing window/door profile manufacturers

### Impact

✅ **Benefits**:
- Clear separation of concerns (SOLID principles)
- Semantic clarity in domain model
- Easier to extend with tenant-specific features
- Better test isolation and seed data management

⚠️ **Breaking Changes**:
- Database schema migration required
- All manufacturer references updated to tenant/supplier
- Seed scripts completely refactored

---

## Migration Overview

### Architecture Change

#### Before (❌ Incorrect)

```
Manufacturer (multipurpose entity)
  ├─ id: "1" → "Carpintería El Sol" (tenant)
  ├─ id: "2" → "Rehau" (profile supplier)
  ├─ id: "3" → "Deceuninck" (profile supplier)
  └─ id: "4" → "Azembla" (profile supplier)
```

**Problem**: Single entity with dual responsibility

#### After (✅ Correct)

```
TenantConfig (singleton)
  └─ id: "1" → "Carpintería El Sol" (business configuration)

ProfileSupplier (many records)
  ├─ id: "abc123" → "Rehau" (PVC)
  ├─ id: "def456" → "Deceuninck" (PVC)
  └─ id: "ghi789" → "Azembla" (Aluminum)

Model (window/door products)
  └─ profileSupplierId: "abc123" (links to Rehau)
```

**Benefits**: Clear separation, SOLID principles, semantic clarity

### Migration Phases

1. **Phase 1-2**: Database schema design and migration execution ✅
2. **Phase 3-4**: tRPC routers and service layer updates ✅
3. **Phase 5**: UI component refactoring ✅
4. **Phase 6**: Type definitions and validation ✅
5. **Phase 7**: Testing and E2E validation ✅
6. **Phase 8**: Seed scripts and documentation ✅ (current)
7. **Phase 9**: Deployment and rollback strategy (upcoming)

---

## Pre-Migration Checklist

### Environment Preparation

- [ ] **Backup Production Database**
  ```bash
  pg_dump glasify_lite > backup_$(date +%Y%m%d_%H%M%S).sql
  ```

- [ ] **Verify Database Connection**
  ```bash
  pnpm prisma db pull
  ```

- [ ] **Check Current Schema Version**
  ```bash
  pnpm prisma migrate status
  ```

- [ ] **Review Current Manufacturer Data**
  ```sql
  SELECT id, name, currency, "quoteValidityDays" FROM "Manufacturer" ORDER BY "createdAt";
  ```

### Dependencies

- Prisma ORM: `^6.17.0`
- PostgreSQL: `14.x` or higher
- Node.js: `20.x` or higher
- TypeScript: `^5.8.2`

---

## Database Schema Changes

### New Entities

#### TenantConfig (Singleton)

```prisma
model TenantConfig {
  id                 String   @id @default("1")
  businessName       String
#### TenantConfig (NEW - Singleton Pattern)

```prisma
model TenantConfig {
  id String @id @default("1")  // Fixed ID enforces singleton
  
  // Business info
  businessName    String
  currency        String   @db.Char(3)
  locale          String   @default("es-CO")
  timezone        String   @default("America/Bogota")
  quoteValidityDays Int    @default(15)
  
  // Optional contact info
  contactEmail    String?
  contactPhone    String?
  businessAddress String?
  
  // Timestamps
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([currency])
}
```

**Singleton Enforcement**:
- **Schema Level**: `@default("1")` ensures ID is always "1"
- **Seed Level**: `upsert({ where: { id: "1" } })` safe to run multiple times
- **Application Level**: Protected from deletion

**Environment Configuration** (`.env` + `src/env-seed.ts`):
```bash
TENANT_BUSINESS_NAME="Glasify Demo"       # Required
TENANT_CURRENCY="COP"                      # Required (ISO 4217)
TENANT_LOCALE="es-CO"                      # Required (BCP 47)
TENANT_TIMEZONE="America/Bogota"           # Required (IANA)
TENANT_QUOTE_VALIDITY_DAYS="15"            # Required
TENANT_CONTACT_EMAIL="demo@glasify.com"    # Optional
TENANT_CONTACT_PHONE="+57 300 123 4567"    # Optional
TENANT_BUSINESS_ADDRESS="Calle 123..."     # Optional
```

**Validation with @t3-oss/env-nextjs**:
- Zod schemas validate all TENANT_* variables before seeding
- Clear error messages for missing/invalid values
- Prevents runtime errors from misconfiguration
- See: `src/env-seed.ts` and https://env.t3.gg/docs/core

#### ProfileSupplier

```prisma
model ProfileSupplier {
  id           String       @id @default(cuid())
  name         String       @unique
  materialType MaterialType
  isActive     Boolean      @default(true)
  createdAt    DateTime     @default(now())
  updatedAt    DateTime     @updatedAt

  models Model[] @relation("ModelProfileSupplier")
}

enum MaterialType {
  PVC
  ALUMINUM
  WOOD
  MIXED
}
```

**Relationships**:
- One ProfileSupplier → Many Models

### Removed/Updated Fields

#### Model Table

- ❌ Removed: `manufacturerId`
- ✅ Added: `profileSupplierId String?`
- Foreign key: `profileSupplierId → ProfileSupplier.id`

#### GlassType Table

- ❌ Removed: `manufacturerId`
- Glass types are now global catalog items

#### Service Table

- ❌ Removed: `manufacturerId`
- Services are now global catalog items

#### User Table (if exists)

- ❌ Removed: `manufacturerId`
- Users no longer directly reference manufacturer

---

## Data Transformation Logic

### Migration Script (`prisma/migrations/.../migration.sql`)

```sql
-- Step 1: Create TenantConfig table
CREATE TABLE "TenantConfig" (
    "id" TEXT NOT NULL DEFAULT '1',
    "businessName" TEXT NOT NULL,
    "businessAddress" TEXT,
    "contactEmail" TEXT,
    "contactPhone" TEXT,
    "currency" TEXT NOT NULL DEFAULT 'COP',
    "locale" TEXT NOT NULL DEFAULT 'es-CO',
    "timezone" TEXT NOT NULL DEFAULT 'America/Bogota',
    "quoteValidityDays" INTEGER NOT NULL DEFAULT 15,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TenantConfig_pkey" PRIMARY KEY ("id")
);

-- Step 2: Create ProfileSupplier table
CREATE TABLE "ProfileSupplier" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "materialType" "MaterialType" NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProfileSupplier_pkey" PRIMARY KEY ("id")
);

-- Step 3: Create MaterialType enum
CREATE TYPE "MaterialType" AS ENUM ('PVC', 'ALUMINUM', 'WOOD', 'MIXED');

-- Step 4: Data migration (first Manufacturer → TenantConfig)
INSERT INTO "TenantConfig" (id, "businessName", currency, "quoteValidityDays", "createdAt", "updatedAt")
SELECT 
    '1' as id,
    name as "businessName",
    currency,
    "quoteValidityDays",
    "createdAt",
    NOW() as "updatedAt"
FROM "Manufacturer"
ORDER BY "createdAt"
LIMIT 1;

-- Step 5: Data migration (remaining Manufacturers → ProfileSuppliers)
INSERT INTO "ProfileSupplier" (id, name, "materialType", "isActive", "createdAt", "updatedAt")
SELECT 
    id,
    name,
    'PVC'::"MaterialType" as "materialType", -- Default to PVC, adjust manually if needed
    true as "isActive",
    "createdAt",
    NOW() as "updatedAt"
FROM "Manufacturer"
WHERE id != (SELECT id FROM "Manufacturer" ORDER BY "createdAt" LIMIT 1);

-- Step 6: Add profileSupplierId to Model
ALTER TABLE "Model" ADD COLUMN "profileSupplierId" TEXT;

-- Step 7: Migrate Model.manufacturerId → Model.profileSupplierId
UPDATE "Model" m
SET "profileSupplierId" = ps.id
FROM "ProfileSupplier" ps
WHERE m."manufacturerId" = ps.id;

-- Step 8: Drop old foreign keys and columns
ALTER TABLE "Model" DROP CONSTRAINT IF EXISTS "Model_manufacturerId_fkey";
ALTER TABLE "Model" DROP COLUMN "manufacturerId";
ALTER TABLE "GlassType" DROP COLUMN "manufacturerId";
ALTER TABLE "Service" DROP COLUMN "manufacturerId";

-- Step 9: Add new foreign key
ALTER TABLE "Model" ADD CONSTRAINT "Model_profileSupplierId_fkey" 
    FOREIGN KEY ("profileSupplierId") REFERENCES "ProfileSupplier"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Step 10: Create indexes
CREATE UNIQUE INDEX "ProfileSupplier_name_key" ON "ProfileSupplier"("name");
CREATE UNIQUE INDEX "TenantConfig_id_key" ON "TenantConfig"("id");

-- Step 11: Drop old Manufacturer table
DROP TABLE "Manufacturer";
```

### Validation Queries

```sql
-- Verify TenantConfig singleton
SELECT COUNT(*) as tenant_count FROM "TenantConfig"; 
-- Expected: 1

-- Verify ProfileSupplier records
SELECT id, name, "materialType", "isActive" FROM "ProfileSupplier";
-- Expected: Multiple records (Rehau, Deceuninck, etc.)

-- Verify Model relationships
SELECT m.name, ps.name as supplier_name 
FROM "Model" m
LEFT JOIN "ProfileSupplier" ps ON m."profileSupplierId" = ps.id;
-- Expected: All models have valid supplier links
```

---

## Application Code Updates

### 1. Utility Functions (Created)

**File**: `src/server/utils/tenant.ts`

```typescript
import { db } from '@/server/db';

/**
 * Get TenantConfig singleton
 * @param client Optional Prisma client for transactions
 */
export async function getTenantConfig(client = db) {
  const config = await client.tenantConfig.findUnique({
    where: { id: '1' },
  });

  if (!config) {
    throw new Error('TenantConfig not found. Run migrations and seed data.');
  }

  return config;
}

/**
 * Get tenant currency code
 */
export async function getTenantCurrency(client = db) {
  const config = await getTenantConfig(client);
  return config.currency;
}

/**
 * Get quote validity period in days
 */
export async function getQuoteValidityDays(client = db) {
  const config = await getTenantConfig(client);
  return config.quoteValidityDays;
}
```

### 2. tRPC Router Updates

#### Before (❌ Old)

```typescript
// src/server/api/routers/quote/quote.ts
const manufacturer = await db.manufacturer.findUnique({
  where: { id: input.manufacturerId },
});

const validUntil = addDays(new Date(), manufacturer.quoteValidityDays);
```

#### After (✅ New)

```typescript
// src/server/api/routers/quote/quote.ts
import { getTenantCurrency, getQuoteValidityDays } from '@/server/utils/tenant';

const currency = await getTenantCurrency(tx);
const validityDays = await getQuoteValidityDays(tx);
const validUntil = addDays(new Date(), validityDays);
```

### 3. UI Component Updates

#### Model Form (ProfileSupplier Selector)

**File**: `src/app/(dashboard)/_components/model-form.tsx`

```typescript
// Fetch profile suppliers for dropdown
const { data: suppliers } = api.admin['list-profile-suppliers'].useQuery({
  isActive: true,
});

// Form field
<SelectField
  name="profileSupplierId"
  label="Proveedor de Perfiles"
  options={suppliers?.map(s => ({ value: s.id, label: s.name }))}
/>
```

#### Catalog Filter (ProfileSupplier Filter)

**File**: `src/app/(public)/catalog/_components/organisms/model-filter.tsx`

```typescript
// Updated URL parameter: manufacturer → profileSupplier
const [searchParams, setSearchParams] = useSearchParams();
const profileSupplierId = searchParams.get('profileSupplier');

// Filter models by profile supplier
const filteredModels = models?.filter(m => 
  !profileSupplierId || m.profileSupplierId === profileSupplierId
);
```

---

## Step-by-Step Migration Procedure

### Development Environment

```bash
# 1. Pull latest schema
git pull origin 002-budget-cart-workflow

# 2. Install dependencies
pnpm install

# 3. Reset database and run migrations
pnpm prisma migrate reset --force

# 4. Verify seed execution
# Expected output: TenantConfig + 5 ProfileSuppliers + 2 Models
```

### Staging Environment

```bash
# 1. Backup database
pg_dump glasify_staging > staging_backup_$(date +%Y%m%d).sql

# 2. Apply migrations
pnpm prisma migrate deploy

# 3. Verify data integrity
pnpm prisma studio
# Check TenantConfig, ProfileSupplier, Model tables

# 4. Run smoke tests
pnpm test:e2e --project=chromium
```

### Production Environment

```bash
# 1. CRITICAL: Full database backup
pg_dump glasify_production > production_backup_$(date +%Y%m%d_%H%M%S).sql

# 2. Enable maintenance mode (if available)
# Prevents new data during migration

# 3. Apply migrations
pnpm prisma migrate deploy

# 4. Verify TenantConfig singleton
psql glasify_production -c "SELECT * FROM \"TenantConfig\";"

# 5. Verify ProfileSupplier records
psql glasify_production -c "SELECT * FROM \"ProfileSupplier\";"

# 6. Verify Model relationships
psql glasify_production -c "
  SELECT m.name, ps.name as supplier 
  FROM \"Model\" m 
  LEFT JOIN \"ProfileSupplier\" ps ON m.\"profileSupplierId\" = ps.id;
"

# 7. Disable maintenance mode

# 8. Monitor application logs for errors
tail -f /var/log/glasify/app.log
```

---

## Validation & Testing

### Automated Tests

```bash
# Unit tests
pnpm test tests/unit/

# Contract tests (tRPC)
pnpm test tests/contract/

# E2E tests
pnpm test:e2e
```

### Manual Validation Checklist

- [ ] **TenantConfig Singleton**
  - Only ONE record exists with id = "1"
  - Business name, currency, locale populated
  - Quote validity days is correct

- [ ] **ProfileSupplier Records**
  - All expected suppliers created (Rehau, Deceuninck, etc.)
  - MaterialType correctly set (PVC, ALUMINUM)
  - isActive flags are correct

- [ ] **Model Relationships**
  - All models have valid `profileSupplierId`
  - Foreign key constraints enforced
  - No orphaned models

- [ ] **Application Functionality**
  - Quote creation uses TenantConfig currency
  - Quote validity calculated from TenantConfig
  - Catalog filtering by ProfileSupplier works
  - Model form shows ProfileSupplier dropdown

### SQL Validation Queries

```sql
-- 1. Verify singleton constraint
SELECT COUNT(*) FROM "TenantConfig";
-- Expected: 1

-- 2. Check all suppliers are active
SELECT name, "materialType", "isActive" FROM "ProfileSupplier";
-- Expected: 4-5 active suppliers

-- 3. Verify Model links
SELECT 
  m.name as model_name,
  ps.name as supplier_name,
  ps."materialType"
FROM "Model" m
LEFT JOIN "ProfileSupplier" ps ON m."profileSupplierId" = ps.id
ORDER BY m.name;
-- Expected: All models have supplier names

-- 4. Check for orphaned records
SELECT COUNT(*) FROM "Model" WHERE "profileSupplierId" IS NULL;
-- Expected: 0
```

---

## Rollback Procedure

### Automatic Rollback (Prisma)

⚠️ **Warning**: Prisma does not support automatic rollback. Use manual procedure below.

### Manual Rollback Steps

```bash
# 1. Restore from backup
pg_restore -d glasify_production production_backup_YYYYMMDD_HHMMSS.sql

# 2. Verify restoration
psql glasify_production -c "\dt"
# Should show old Manufacturer table

# 3. Revert application code
git revert <migration-commit-hash>
git push origin main

# 4. Restart application
pm2 restart glasify-api
```

### Alternative: Reverse Migration Script

**File**: `scripts/rollback-tenant-config.ts`

```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function rollback() {
  await prisma.$transaction(async (tx) => {
    // 1. Recreate Manufacturer table
    await tx.$executeRaw`
      CREATE TABLE "Manufacturer" (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        currency TEXT DEFAULT 'COP',
        "quoteValidityDays" INTEGER DEFAULT 15,
        "createdAt" TIMESTAMP DEFAULT NOW(),
        "updatedAt" TIMESTAMP DEFAULT NOW()
      );
    `;

    // 2. Convert TenantConfig → Manufacturer
    await tx.$executeRaw`
      INSERT INTO "Manufacturer" (id, name, currency, "quoteValidityDays")
      SELECT id, "businessName", currency, "quoteValidityDays"
      FROM "TenantConfig";
    `;

    // 3. Convert ProfileSuppliers → Manufacturers
    await tx.$executeRaw`
      INSERT INTO "Manufacturer" (id, name, currency, "quoteValidityDays")
      SELECT id, name, 'COP', 15
      FROM "ProfileSupplier";
    `;

    // 4. Restore Model.manufacturerId
    await tx.$executeRaw`
      ALTER TABLE "Model" ADD COLUMN "manufacturerId" TEXT;
      UPDATE "Model" SET "manufacturerId" = "profileSupplierId";
      ALTER TABLE "Model" DROP COLUMN "profileSupplierId";
    `;

    // 5. Drop new tables
    await tx.$executeRaw`DROP TABLE "ProfileSupplier";`;
    await tx.$executeRaw`DROP TABLE "TenantConfig";`;
  });

  console.log('✅ Rollback complete');
}

rollback()
  .catch((e) => {
    console.error('❌ Rollback failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
```

**Execute rollback**:
```bash
tsx scripts/rollback-tenant-config.ts
```

---

## Post-Migration Verification

### Application Health Checks

```bash
# 1. API health endpoint
curl https://glasify.com/api/health

# 2. Database connection
pnpm prisma db pull

# 3. Check application logs
tail -f /var/log/glasify/app.log | grep ERROR

# 4. Monitor error rates
# Use application monitoring tools (Sentry, DataDog, etc.)
```

### Business Continuity Checks

- [ ] Quote creation flow works end-to-end
- [ ] Catalog filtering by supplier functional
- [ ] Admin model management operational
- [ ] Email notifications working (use TenantConfig.businessName)
- [ ] PDF quote generation includes correct currency

### Performance Monitoring

```sql
-- Check query performance
EXPLAIN ANALYZE 
SELECT m.*, ps.name as supplier_name
FROM "Model" m
LEFT JOIN "ProfileSupplier" ps ON m."profileSupplierId" = ps.id
WHERE m.status = 'published';

-- Verify indexes
SELECT tablename, indexname, indexdef 
FROM pg_indexes 
WHERE schemaname = 'public' 
  AND tablename IN ('TenantConfig', 'ProfileSupplier', 'Model');
```

---

## Troubleshooting

### Common Issues

#### Issue 1: TenantConfig not found

**Error**: `TenantConfig not found. Run migrations and seed data.`

**Solution**:
```bash
pnpm prisma migrate deploy
pnpm db:seed
```

#### Issue 2: Multiple TenantConfig records

**Error**: Unique constraint violation on TenantConfig

**Solution**:
```sql
-- Delete duplicate records, keep id = "1"
DELETE FROM "TenantConfig" WHERE id != '1';
```

#### Issue 3: Null profileSupplierId in Model

**Error**: Models have null supplier references

**Solution**:
```typescript
// Run data backfill script
import { db } from '@/server/db';

async function backfillSuppliers() {
  const models = await db.model.findMany({
    where: { profileSupplierId: null },
  });

  const defaultSupplier = await db.profileSupplier.findFirst({
    where: { isActive: true },
  });

  if (!defaultSupplier) throw new Error('No active suppliers');

  for (const model of models) {
    await db.model.update({
      where: { id: model.id },
      data: { profileSupplierId: defaultSupplier.id },
    });
  }

  console.log(`✅ Updated ${models.length} models`);
}
```

---

## Related Documentation

- [Architecture Documentation](../architecture.md)
- [PRD - Product Requirements](../prd.md)
- [Implementation Plan](../../plan/refactor-manufacturer-to-tenant-config-1.md)
- [Prisma Schema](../../prisma/schema.prisma)
- [Seed Scripts](../../prisma/seed-tenant.ts)

---

## Changelog

| Version | Date       | Author     | Changes                                  |
| ------- | ---------- | ---------- | ---------------------------------------- |
| 1.0     | 2025-01-19 | Andeveling | Initial migration guide created          |
| 1.1     | 2025-01-19 | Andeveling | Added rollback procedures and validation |

---

**Migration Status**: ✅ Completed  
**Phase**: 8/9 (Seed Scripts & Documentation)  
**Next Steps**: Phase 9 - Deployment & Rollback Strategy
