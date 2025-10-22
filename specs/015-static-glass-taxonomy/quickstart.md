# Quickstart: Static Glass Taxonomy Migration

**Feature**: 015-static-glass-taxonomy  
**Phase**: 1 (Design)  
**Date**: 2025-01-21  

## Overview

This quickstart guide provides step-by-step instructions for running seed scripts and migration scripts to convert glass types and solutions from tenant-managed dynamic records to static, system-seeded taxonomy.

**Target Audience**: DevOps engineers, database administrators, backend developers  
**Prerequisites**: PostgreSQL database access, Node.js runtime, pnpm package manager  
**Estimated Time**: 30-60 minutes for full migration (varies by database size)

---

## Pre-Migration Checklist

### 1. Environment Validation

```bash
# Verify Node.js version
node --version  # Should be >= 18.x

# Verify pnpm version
pnpm --version  # Should be >= 8.x

# Verify database connection
pnpm db:studio  # Opens Prisma Studio

# Check current data state
psql $DATABASE_URL -c "SELECT COUNT(*) FROM \"GlassType\";"
psql $DATABASE_URL -c "SELECT COUNT(*) FROM \"GlassSolution\";"
psql $DATABASE_URL -c "SELECT COUNT(*) FROM \"QuoteItem\";"
```

### 2. Database Backup

**CRITICAL**: Always create a backup before running migration

```bash
# Create backup directory
mkdir -p backups/$(date +%Y%m%d)

# Backup database
pg_dump $DATABASE_URL > backups/$(date +%Y%m%d)/pre_migration_backup.sql

# Verify backup file exists and is not empty
ls -lh backups/$(date +%Y%m%d)/pre_migration_backup.sql
```

### 3. Code Preparation

```bash
# Checkout feature branch
git checkout 015-static-glass-taxonomy

# Install dependencies
pnpm install

# Generate Prisma client with new schema
pnpm db:generate

# Run type checking
pnpm typecheck

# Run unit tests
pnpm test
```

---

## Migration Workflow

### Phase 1: Schema Migration

Apply Prisma schema changes to database

```bash
# Review migration SQL (dry run)
pnpm prisma migrate dev --name static_glass_taxonomy --create-only

# Review generated SQL in prisma/migrations/YYYYMMDDHHMMSS_static_glass_taxonomy/migration.sql

# Apply migration
pnpm prisma migrate deploy

# Verify schema changes
pnpm db:studio
# Check: GlassType has new columns (code, series, manufacturer, isSeeded, seedVersion)
# Check: GlassSolution has new columns (isSeeded, seedVersion)
# Check: TenantGlassTypePrice table exists
# Check: GlassSupplier has tenantId column
```

### Phase 2: Seed Standard Data

Load standardized glass types and solutions

```bash
# Seed glass solutions (must run first due to FK dependencies)
pnpm seed:glass-solutions

# Expected output:
# ✓ Seeded 6 glass solutions (solar_control, energy_efficiency, security, acoustic, privacy, hurricane_resistance)
# ✓ Seed version: 1.0

# Seed glass types (Tecnoglass Serie-N/Serie-R)
pnpm seed:glass-types

# Expected output:
# ✓ Seeded 30 glass types (N44/28, N55/40, N70/38, R12/20, etc.)
# ✓ Created 45 glass type-solution associations
# ✓ Seed version: 1.0

# Verify seed data
pnpm db:studio
# Check: GlassType has 30 records with isSeeded=true
# Check: GlassSolution has 6 records with isSeeded=true
```

### Phase 3: Migrate Tenant Data

**Warning**: This step modifies production data. Run on staging environment first.

```bash
# Run migration script with dry-run flag (no changes)
pnpm migrate:glass-taxonomy --dry-run

# Expected output:
# [DRY RUN] Would process 5 tenants
# [DRY RUN] Would migrate 15 glass types
# [DRY RUN] Would preserve 3 legacy types
# [DRY RUN] Would update 120 quote references

# Review dry-run report
cat logs/migration-dry-run-$(date +%Y%m%d).json

# Run actual migration
pnpm migrate:glass-taxonomy

# Expected output:
# ✓ Step 1/8: Seed glass types [completed]
# ✓ Step 2/8: Seed glass solutions [completed]
# ✓ Step 3/8: Migrate tenant ABC123 [completed] (10 types migrated, 2 preserved)
# ✓ Step 4/8: Migrate tenant DEF456 [completed] (8 types migrated, 1 preserved)
# ✓ Step 5/8: Migrate pricing data [completed]
# ✓ Step 6/8: Verify quote references [completed] (150 quotes verified, 0 broken)
# ✓ Step 7/8: Update indexes [completed]
# ✓ Step 8/8: Cleanup checkpoints [completed]
# 
# Migration completed in 5m 32s

# View migration report
cat logs/migration-report-$(date +%Y%m%d).json
```

### Phase 4: Verification

Validate migration success

```bash
# Run verification script
pnpm verify:glass-taxonomy

# Expected checks:
# ✓ All quote items reference valid glass types
# ✓ No orphaned glass type records
# ✓ Seed version matches across all records
# ✓ Legacy types have isActive=false
# ✓ Tenant pricing data migrated correctly

# Manual verification queries
psql $DATABASE_URL <<EOF
-- Check seeded types
SELECT COUNT(*) FROM "GlassType" WHERE "isSeeded" = true;
-- Expected: 30

-- Check legacy types
SELECT COUNT(*) FROM "GlassType" WHERE "isSeeded" = false AND "name" LIKE 'Legacy -%';
-- Expected: varies by tenant data

-- Check quote references
SELECT COUNT(*) FROM "QuoteItem" qi
LEFT JOIN "GlassType" gt ON qi."glassTypeId" = gt.id
WHERE gt.id IS NULL;
-- Expected: 0 (no broken references)

-- Check tenant pricing
SELECT COUNT(*) FROM "TenantGlassTypePrice";
-- Expected: > 0
EOF
```

---

## Rollback Procedures

### Scenario 1: Migration Failed Mid-Process

If migration script fails (e.g., database timeout, constraint violation):

```bash
# Check last completed checkpoint
pnpm migrate:glass-taxonomy --status

# Resume migration from last checkpoint
pnpm migrate:glass-taxonomy --resume

# If resumption fails, restore from backup
psql $DATABASE_URL < backups/$(date +%Y%m%d)/pre_migration_backup.sql

# Re-run Prisma migration
pnpm prisma migrate deploy
```

### Scenario 2: Data Integrity Issues Post-Migration

If quote references are broken or data is corrupted:

```bash
# Run integrity check
pnpm verify:glass-taxonomy --fix

# If auto-fix fails, manual rollback:
# 1. Restore database backup
psql $DATABASE_URL < backups/$(date +%Y%m%d)/pre_migration_backup.sql

# 2. Revert Prisma schema changes
git checkout develop -- prisma/schema.prisma

# 3. Re-generate Prisma client
pnpm prisma generate

# 4. Restart application
pnpm dev
```

### Scenario 3: Performance Degradation

If query performance degrades after migration:

```bash
# Rebuild indexes
psql $DATABASE_URL <<EOF
REINDEX TABLE "GlassType";
REINDEX TABLE "TenantGlassTypePrice";
ANALYZE "GlassType";
ANALYZE "TenantGlassTypePrice";
EOF

# Run query performance tests
pnpm test:performance
```

---

## Seed Script Usage

### Glass Types Seeder

**Location**: `prisma/seeders/glass-types.seeder.ts`

**Usage**:
```bash
# Seed all glass types
pnpm seed:glass-types

# Seed specific series
pnpm seed:glass-types --series=Serie-N

# Seed with custom version
pnpm seed:glass-types --version=1.1

# Re-run seed (idempotent - updates existing records)
pnpm seed:glass-types --force
```

**Data Source**: `prisma/data/glass-types-tecnoglass.json`

**Sample Data Structure**:
```json
{
  "version": "1.0",
  "manufacturer": "Tecnoglass",
  "glassTypes": [
    {
      "code": "N70/38",
      "name": "High Light Low-E, 70% visible transmission",
      "series": "Serie-N",
      "thicknessMm": 6,
      "uValue": 1.8,
      "solarFactor": 0.43,
      "lightTransmission": 0.70,
      "solutions": [
        { "key": "energy_efficiency", "performanceRating": "very_good", "isPrimary": true }
      ]
    }
  ]
}
```

### Glass Solutions Seeder

**Location**: `prisma/seeders/glass-solutions.seeder.ts`

**Usage**:
```bash
# Seed all solutions
pnpm seed:glass-solutions

# Re-run seed (idempotent)
pnpm seed:glass-solutions --force
```

**Data Source**: `prisma/data/glass-solutions.json`

**Sample Data Structure**:
```json
{
  "version": "1.0",
  "glassSolutions": [
    {
      "key": "solar_control",
      "name": "Solar Control",
      "nameEs": "Control Solar",
      "description": "Reduces solar heat gain and glare...",
      "icon": "Sun",
      "sortOrder": 1
    }
  ]
}
```

---

## Migration Script Usage

### Main Migration Script

**Location**: `scripts/migrate-glass-taxonomy.ts`

**Usage**:
```bash
# Dry run (no changes)
pnpm migrate:glass-taxonomy --dry-run

# Full migration
pnpm migrate:glass-taxonomy

# Resume from last checkpoint
pnpm migrate:glass-taxonomy --resume

# Migrate specific tenant only
pnpm migrate:glass-taxonomy --tenant=abc123

# Check migration status
pnpm migrate:glass-taxonomy --status

# View detailed logs
tail -f logs/migration-$(date +%Y%m%d).log
```

**Flags**:
- `--dry-run`: Preview changes without committing
- `--resume`: Resume from last successful checkpoint
- `--tenant=<id>`: Migrate single tenant only
- `--status`: Show current migration state
- `--force`: Skip confirmation prompts (use with caution)

### Validation Script

**Location**: `scripts/validate-seed-data.ts`

**Usage**:
```bash
# Validate seed data files against JSON schema
pnpm validate:seed-data

# Expected output:
# ✓ glass-types-tecnoglass.json is valid
# ✓ glass-solutions.json is valid
# ✓ All glass solution keys referenced in glass types exist
# ✓ All performance ratings are valid enum values
```

---

## Common Issues & Troubleshooting

### Issue 1: Duplicate Key Constraint Error

**Symptom**: `ERROR: duplicate key value violates unique constraint "GlassType_code_key"`

**Cause**: Existing custom glass type has same code as seeded type

**Solution**:
```bash
# Identify conflicting records
psql $DATABASE_URL -c "SELECT id, code, name FROM \"GlassType\" WHERE code IN (SELECT code FROM \"GlassType\" GROUP BY code HAVING COUNT(*) > 1);"

# Migration script should auto-resolve by renaming custom type
# Manual fix if needed:
psql $DATABASE_URL -c "UPDATE \"GlassType\" SET code = 'LEGACY-' || code WHERE \"isSeeded\" = false AND code IN (SELECT code FROM \"GlassType\" GROUP BY code HAVING COUNT(*) > 1);"
```

### Issue 2: Quote References Break After Migration

**Symptom**: Quotes show "Unknown glass type" in UI

**Cause**: QuoteItem.glassTypeId points to deleted custom type

**Solution**:
```bash
# Find broken references
psql $DATABASE_URL -c "SELECT qi.id, qi.\"glassTypeId\" FROM \"QuoteItem\" qi LEFT JOIN \"GlassType\" gt ON qi.\"glassTypeId\" = gt.id WHERE gt.id IS NULL;"

# Migration should prevent this, but manual fix:
# Restore from backup and re-run migration with --preserve-all flag
pnpm migrate:glass-taxonomy --preserve-all
```

### Issue 3: Tenant Pricing Not Applied

**Symptom**: All quotes show same price (base price) regardless of tenant

**Cause**: TenantGlassTypePrice not populated during migration

**Solution**:
```bash
# Check pricing data
psql $DATABASE_URL -c "SELECT COUNT(*) FROM \"TenantGlassTypePrice\";"

# Re-run pricing migration step
pnpm migrate:glass-taxonomy --step=pricing-only

# Or manually populate pricing
pnpm seed:tenant-pricing --tenant=abc123
```

---

## Post-Migration Tasks

### 1. Update Application Code

```bash
# Block CRUD endpoints
# File: src/server/api/routers/admin/glass-type.ts
# - Remove create/update/delete procedures
# - Replace with 403 Forbidden errors

# Update UI
# File: src/app/(dashboard)/admin/glass-types/page.tsx
# - Remove "Create Glass Type" button
# - Remove edit/delete actions from table
# - Add read-only banner

# Run E2E tests
pnpm test:e2e
```

### 2. Monitor Production

```bash
# Watch logs for blocked CRUD attempts
tail -f logs/combined.log | grep "Glass type CRUD attempt blocked"

# Monitor query performance
psql $DATABASE_URL -c "SELECT query, mean_exec_time, calls FROM pg_stat_statements WHERE query LIKE '%GlassType%' ORDER BY mean_exec_time DESC LIMIT 10;"

# Check error rates
# (Use APM tool or custom logging dashboard)
```

### 3. Documentation Updates

- [ ] Update API documentation (remove glass type/solution CRUD endpoints)
- [ ] Update user manual (explain standardized catalog, how to request custom types)
- [ ] Update CHANGELOG.md (breaking changes in v2.0.0)
- [ ] Create migration guide for API consumers

---

## FAQ

**Q: Can I add new glass types after migration?**  
A: No. Glass types are now system-managed. Contact support to request additions. New types will be added via seed data updates.

**Q: What happens to my tenant's custom glass types?**  
A: Custom types that match standard types (by name and specs) are migrated to standard types. Non-matching types are preserved as "Legacy - [name]" and marked inactive. Historical quotes still reference legacy types correctly.

**Q: How do I update technical specs for a glass type?**  
A: Seed data must be updated via code change (PR to update `prisma/data/glass-types-tecnoglass.json`), then re-run seed script. This ensures specs match manufacturer datasheets.

**Q: Can I rollback the migration?**  
A: Yes, restore database from pre-migration backup. Note: any new data created after migration will be lost.

**Q: How long does migration take?**  
A: Depends on database size. Estimated: 5-10 minutes for 1000 quotes, 30-60 minutes for 10,000 quotes.

**Q: Is there downtime during migration?**  
A: Minimal. Schema migration requires brief table lock (<5s). Data migration runs in background with checkpoints (resumable if interrupted).

---

## Support

For issues during migration:
1. Check logs: `logs/migration-$(date +%Y%m%d).log`
2. Run verification: `pnpm verify:glass-taxonomy`
3. Contact: [DevOps team email/Slack channel]

For post-migration questions:
1. See documentation: `docs/glass-taxonomy.md`
2. API reference: `docs/api/glass-catalog.md`
3. User guide: `docs/user-guide/glass-types.md`
