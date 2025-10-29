# Implementation Tasks: Static Glass Taxonomy

**Feature**: 015-static-glass-taxonomy  
**Generated**: 2025-01-21  
**Status**: Ready for Implementation

## Overview

This document breaks down the implementation of static glass taxonomy into actionable tasks organized by user story. Each task includes:
- **Task ID**: Unique identifier (e.g., `TK-015-001`)
- **Priority**: P1 (Critical) or P2 (Important)
- **Story**: User story reference (US1, US2, US3, US4)
- **Description**: What to do with file path
- **Dependencies**: Blocking tasks that must complete first
- **Acceptance Criteria**: Checklist to validate completion

---

## ⚠️ Clarifications (Session 2025-10-22) - CRITICAL CHANGES

**MAJOR REVISIONS from original spec**:

1. **✅ Hybrid Model (NOT fully static)**:
   - Seed 30 initial types from Tecnoglass
   - **Admin KEEPS full CRUD** for custom types
   - `isSeeded` field distinguishes base types from custom types
   - **NO API blocking needed** (original plan to block CRUD is CANCELED)

2. **🗑️ Delete Deprecated Fields (NOT preserve)**:
   - Remove from schema: `isTempered`, `isLaminated`, `isLowE`, `isTripleGlazed`, `purpose`, `glassSupplierId`, `pricePerSqm`, `sku`
   - App not in production = clean schema for v1.0
   - No backward compatibility needed

3. **🧹 Clean Slate Migration (NOT preserve legacy)**:
   - Delete all existing glass types
   - Start fresh with 30 seeded types
   - **NO legacy prefix/preservation needed** (original plan to preserve tenant types is CANCELED)

4. **🔒 Admin-Only CRUD**:
   - Only role='admin' can manage GlassType, GlassCharacteristic, GlassTypeSolution
   - Sellers/users have read-only access for quote creation
   - tRPC routers already have `adminProcedure` - just verify authorization

5. **📦 Seed GlassCharacteristic**:
   - Create ~10-15 standard characteristics (tempered, laminated, low-e, triple-glazed, acoustic, hurricane-resistant)
   - Seed GlassTypeSolution relationships for 30 types
   - Admin can assign to custom types via CRUD

**Impact on Tasks**:
- ❌ REMOVE: All tasks about blocking CRUD endpoints (TK-015-027 to TK-015-029, TK-015-035 to TK-015-037)
- ❌ REMOVE: All tasks about legacy prefix/preservation (TK-015-020, TK-015-021)
- ❌ REMOVE: All tasks about removing edit/delete buttons (TK-015-032)
- ✅ KEEP: Schema changes, seed infrastructure, pricing migration
- ✅ ADD: GlassCharacteristic seed data and factory
- ✅ MODIFY: Migration script to delete (not preserve) existing types

---

## Task Organization

Tasks are organized into **5 phases** following dependency order (revised):

1. **Phase 1: Setup** - Prepare schema (delete deprecated fields) and seed data structure
2. **Phase 2: Foundational** - Apply schema migration and create seed infrastructure (GlassType + GlassCharacteristic + GlassSolution)
3. **Phase 3: US4 - Clean Slate Migration (P1)** - Delete existing data, seed 30 types, migrate pricing
4. **Phase 4: US1/US2 - Verify CRUD & Catalog (P1)** - Verify admin CRUD works, test read-only access for sellers
5. **Phase 5: US3 - Tenant-Specific Suppliers (P2)** - Add tenant isolation to suppliers (existing feature, verify only)

**Parallel Execution**: After Phase 2 completes, US4/US1/US2 can proceed in parallel.

**Phases Removed**:
- ~~Phase 4: Block CRUD~~ (CANCELED - admin keeps CRUD)
- ~~Phase 5: Block Solutions CRUD~~ (CANCELED - admin keeps CRUD)
- ~~Phase 7: Polish~~ (merged into other phases)

---

## Phase 1: Setup (Schema & Seed Structure)

### TK-015-001 [P1] [Setup] Modify GlassType schema - Add new fields & DELETE deprecated
**File**: `prisma/schema.prisma`

**Description**:
**ADD** new fields to GlassType model:
- `code` (String, unique) - Manufacturer product code (e.g., "N70/38")
- `series` (String?, optional) - Product line grouping (e.g., "Serie-N")
- `manufacturer` (String?, optional) - Manufacturer name (e.g., "Tecnoglass")
- `isSeeded` (Boolean, default false) - Flag for seed-generated types
- `seedVersion` (String?, optional) - Seed data version (e.g., "1.0")
- Make `name` unique
- Add indexes for `code`, `series`, `manufacturer`, `isSeeded`

**DELETE** deprecated fields (⚠️ BREAKING CHANGE):
- `isTempered` (Boolean) - moved to GlassCharacteristic
- `isLaminated` (Boolean) - moved to GlassCharacteristic
- `isLowE` (Boolean) - moved to GlassCharacteristic
- `isTripleGlazed` (Boolean) - moved to GlassCharacteristic
- `purpose` (String) - replaced by GlassSolution many-to-many
- `glassSupplierId` (FK) - removed (suppliers are tenant-specific, not type-specific)
- `pricePerSqm` (Decimal) - moved to TenantGlassTypePrice
- `sku` (String) - replaced by `code`

**Dependencies**: None

**Acceptance Criteria**:
- [X] Schema compiles without errors
- [X] `pnpm prisma format` validates schema
- [X] `pnpm typecheck` passes with new fields
- [X] Indexes added for search/filter performance
- [X] All deprecated fields removed (no @deprecated comments needed)

---

### TK-015-002 [P1] [Setup] Create TenantGlassTypePrice model
**File**: `prisma/schema.prisma`

**Description**:
Create new model for per-tenant, per-supplier pricing:
- Foreign keys: `tenantId`, `glassTypeId`, `supplierId` (optional)
- Pricing fields: `price` (Decimal), `effectiveDate`, `expiryDate` (optional), `notes`
- Metadata: `createdAt`, `updatedAt`
- Unique constraint: `[tenantId, glassTypeId, supplierId, effectiveDate]`
- Indexes: `[tenantId, glassTypeId]`, `[effectiveDate]`, `[supplierId]`

**Dependencies**: TK-015-001

**Acceptance Criteria**:
- [X] Model defined with all required fields
- [X] Relationships to TenantConfig, GlassType, GlassSupplier configured
- [X] Unique constraint prevents duplicate pricing records
- [X] Indexes optimize price lookup queries

---

### TK-015-003 [P1] [Setup] Modify GlassSolution schema with seed tracking
**File**: `prisma/schema.prisma`

**Description**:
Add seed tracking fields to GlassSolution model:
- `isSeeded` (Boolean, default false)
- `seedVersion` (String?, optional)
- Add index for `isSeeded`

**Dependencies**: TK-015-001

**Acceptance Criteria**:
- [X] Schema compiles with new fields
- [X] Index added for filtering seeded vs custom solutions
- [X] No breaking changes to existing relationships

---

### TK-015-004 [P1] [Setup] Add tenantId to GlassSupplier model
**File**: `prisma/schema.prisma`

**Description**:
Add tenant isolation to GlassSupplier:
- Add `tenantId` (String, FK to Tenant)
- Add index for `[tenantId]`
- Add relationship to Tenant model

**Dependencies**: TK-015-001

**Acceptance Criteria**:
- [X] Schema includes tenantConfigId FK (using TenantConfig for single-tenant compatibility)
- [X] Relationship to TenantConfig configured with onDelete: SetNull
- [X] Index added for tenant filtering

---

### TK-015-004B [P1] [Setup] Create GlassCharacteristic model and relationships
**File**: `prisma/schema.prisma`

**Description**:
Create new GlassCharacteristic model to replace boolean flags:
- Fields: `id`, `key` (String, unique, snake_case), `name`, `nameEs`, `description`, `icon`, `sortOrder`
- `isSeeded` (Boolean, default false) - Flag for seed-generated characteristics
- `seedVersion` (String?, optional)
- Create GlassTypeCharacteristic join table:
  - Foreign keys: `glassTypeId`, `characteristicId`
  - Unique constraint: `[glassTypeId, characteristicId]`
  - Indexes: both FKs

Standard characteristics to seed:
- `tempered` (Templado / Tempered)
- `laminated` (Laminado / Laminated)
- `low_e` (Bajo Emisivo / Low-E)
- `triple_glazed` (Triple Acristalamiento / Triple Glazed)
- `acoustic` (Acústico / Acoustic)
- `hurricane_resistant` (Resistente a Huracanes / Hurricane Resistant)
- `reflective` (Reflectivo / Reflective)
- `tinted` (Tintado / Tinted)
- `clear_float` (Flotado Claro / Clear Float)
- `ultra_clear` (Ultra Claro / Ultra Clear)

**Dependencies**: TK-015-001

**Acceptance Criteria**:
- [ ] GlassCharacteristic model defined with all fields
- [ ] GlassTypeCharacteristic join table configured
- [ ] Relationships to GlassType configured
- [ ] Unique constraint prevents duplicate assignments
- [ ] Indexes optimize characteristic lookup queries

---

### TK-015-005 [P1] [Setup] Create Prisma migration file
**File**: `prisma/migrations/YYYYMMDDHHMMSS_static_glass_taxonomy/migration.sql`

**Description**:
Generate Prisma migration for all schema changes:
```bash
pnpm prisma migrate dev --name static_glass_taxonomy --create-only
```
⚠️ **BREAKING CHANGE**: This migration will:
- DELETE deprecated fields (data loss expected)
- Require clean slate (delete all existing GlassType records before applying)

Review generated SQL to ensure:
- All new columns added with correct types and constraints
- Deprecated columns dropped (DROP COLUMN statements)
- Indexes created for performance
- New tables (GlassCharacteristic, GlassTypeCharacteristic, TenantGlassTypePrice) created

**Dependencies**: TK-015-001, TK-015-002, TK-015-003, TK-015-004, TK-015-004B

**Acceptance Criteria**:
- [X] Migration file generated successfully
- [X] SQL includes DROP COLUMN for deprecated fields
- [X] SQL creates new tables
- [X] Migration tested in staging environment
- [X] Rollback plan documented

---

### TK-015-006 [P1] [Setup] Create glass-type-seed.schema.json validation contract
**File**: `specs/015-static-glass-taxonomy/contracts/glass-type-seed.schema.json`

**Description**:
JSON Schema for validating glass type seed data structure:
- Required fields: `code`, `name`, `thicknessMm`
- Optional fields: `series`, `manufacturer`, `uValue`, `solarFactor`, `lightTransmission`, `description`
- Technical spec constraints: `uValue` (0.5-3.0), `solarFactor` (0-1), `lightTransmission` (0-1)

**Dependencies**: None (already created in Phase 1)

**Acceptance Criteria**:
- [X] Schema validates example seed data
- [X] Required fields enforced
- [X] Numeric constraints match engineering standards

---

### TK-015-007 [P1] [Setup] Create glass-solution-seed.schema.json validation contract
**File**: `specs/015-static-glass-taxonomy/contracts/glass-solution-seed.schema.json`

**Description**:
JSON Schema for validating glass solution seed data:
- Required fields: `key`, `name`, `nameEs`
- Optional fields: `description`, `icon`, `sortOrder`
- Key format: snake_case (e.g., "solar_control")

**Dependencies**: None (already created in Phase 1)

**Acceptance Criteria**:
- [X] Schema validates example solution data
- [X] Key format validation enforced
- [X] Icon field accepts Lucide icon names

---

### TK-015-008 [P1] [Setup] Create migration-report.schema.json contract
**File**: `specs/015-static-glass-taxonomy/contracts/migration-report.schema.json`

**Description**:
JSON Schema for migration script output validation:
- Report sections: `summary`, `tenants`, `errors`, `warnings`
- Metrics: `typesSeeded`, `typesMigrated`, `typesPreserved`, `quotesVerified`
- Error tracking: `errorType`, `errorMessage`, `affectedEntity`

**Dependencies**: None (already created in Phase 1)

**Acceptance Criteria**:
- [X] Schema validates migration output JSON
- [X] All required metrics included
- [X] Error tracking structure documented

---

### TK-015-009 [P1] [Setup] Create Tecnoglass seed data JSON
**File**: `prisma/data/glass-types-tecnoglass.json`

**Description**:
Create JSON file with 30+ Tecnoglass glass types:
- Serie-N: N44/28, N55/40, N70/38, N75/52 (4 types)
- Serie-R: R12/20, R20/32, R35/35, R47/31, R60/20 (5 types)
- Standard substrates: Clear Float, Tempered, Laminated (varying thicknesses)
- Each type includes: code, name, series, manufacturer, thicknessMm, uValue, solarFactor, lightTransmission

**Data Source**: Tecnoglass official datasheets

**Dependencies**: TK-015-006

**Acceptance Criteria**:
- [X] JSON validates against glass-type-seed.schema.json
- [X] Minimum 30 types included (30 types added)
- [X] Technical specs accurate per manufacturer datasheets
- [X] All codes unique

---

### TK-015-010 [P1] [Setup] Create glass solutions seed data JSON
**File**: `prisma/data/glass-solutions.json`

**Description**:
Create JSON file with 6 core glass solutions:
- `solar_control` (Control Solar / Solar Control)
- `energy_efficiency` (Eficiencia Energética / Energy Efficiency)
- `security` (Seguridad / Security)
- `acoustic` (Acústico / Acoustic)
- `privacy` (Privacidad / Privacy)
- `hurricane_resistance` (Resistencia a Huracanes / Hurricane Resistance)

Each includes: key, name (English), nameEs (Spanish), description, icon (Lucide), sortOrder

**Dependencies**: TK-015-007

**Acceptance Criteria**:
- [X] JSON validates against glass-solution-seed.schema.json
- [X] All 6 solutions included
- [X] Spanish translations accurate
- [X] Icons selected from Lucide library

---

### TK-015-010B [P1] [Setup] Create glass characteristics seed data JSON
**File**: `prisma/data/glass-characteristics.json`

**Description**:
Create JSON file with 10-15 standard glass characteristics:
- `tempered` (Templado / Tempered Glass) - Heat-treated for safety
- `laminated` (Laminado / Laminated Glass) - PVB interlayer for security
- `low_e` (Bajo Emisivo / Low-E Coating) - Energy efficiency coating
- `triple_glazed` (Triple Acristalamiento / Triple Glazing) - Three glass panes
- `acoustic` (Acústico / Acoustic Insulation) - Sound reduction
- `hurricane_resistant` (Resistente a Huracanes / Hurricane Resistant) - Impact-rated
- `reflective` (Reflectivo / Reflective Coating) - Solar control
- `tinted` (Tintado / Tinted Glass) - Color-tinted substrate
- `clear_float` (Flotado Claro / Clear Float) - Standard clear glass
- `ultra_clear` (Ultra Claro / Ultra Clear / Low Iron) - High transparency

Each includes: key (snake_case), name (English), nameEs (Spanish), description, icon (Lucide), sortOrder

**Dependencies**: None

**Acceptance Criteria**:
- [ ] JSON file created with all 10 characteristics
- [ ] Keys follow snake_case convention
- [ ] Spanish translations accurate
- [ ] Icons selected from Lucide library (Shield, Waves, Sparkles, etc.)
- [ ] Sort order logical (common characteristics first)

---

### TK-015-010C [P1] [Setup] Create glass-characteristic-seed.schema.json validation contract
**File**: `specs/015-static-glass-taxonomy/contracts/glass-characteristic-seed.schema.json`

**Description**:
JSON Schema for validating glass characteristic seed data:
- Required fields: `key`, `name`, `nameEs`
- Optional fields: `description`, `icon`, `sortOrder`
- Key format: snake_case validation

**Dependencies**: None

**Acceptance Criteria**:
- [ ] Schema validates glass-characteristics.json
- [ ] Required fields enforced
- [ ] Key format validation (lowercase, underscores only)

---

## Phase 2: Foundational (Schema Migration & Seed Infrastructure)

### TK-015-011 [P1] [Foundational] Apply Prisma migration to database
**Command**: `pnpm prisma migrate dev`

**Description**:
Execute schema migration in staging environment:
- Run pre-migration backup (see quickstart.md)
- Apply migration
- Verify schema changes in Prisma Studio
- Run rollback test in separate DB instance

**Dependencies**: TK-015-005

**Acceptance Criteria**:
- [X] Migration applied without errors
- [X] All new columns exist with correct types
- [X] Indexes created successfully
- [X] Rollback procedure tested and documented

---

### TK-015-012 [P1] [Foundational] Create glass-type.factory.ts seed factory
**File**: `prisma/factories/glass-type.factory.ts`

**Description**:
Factory function to generate GlassType records from seed JSON:
- Load JSON from `prisma/data/glass-types-tecnoglass.json`
- Validate against JSON Schema
- Transform to Prisma create input
- Handle upsert logic (skip if `code` already exists)
- Set `isSeeded: true`, `seedVersion: "1.0"`

**Dependencies**: TK-015-009, TK-015-011

**Acceptance Criteria**:
- [X] Factory loads JSON correctly
- [X] Validation errors logged with details
- [X] Upsert prevents duplicate codes
- [X] Seed version tracked for idempotency

---

### TK-015-013 [P1] [Foundational] Create glass-solution.factory.ts seed factory
**File**: `prisma/factories/glass-solution.factory.ts`

**Description**:
Factory function to generate GlassSolution records from seed JSON:
- Load JSON from `prisma/data/glass-solutions.json`
- Validate against JSON Schema
- Transform to Prisma create input
- Handle upsert logic (skip if `key` already exists)
- Set `isSeeded: true`, `seedVersion: "1.0"`

**Dependencies**: TK-015-010, TK-015-011

**Acceptance Criteria**:
- [X] Factory loads JSON correctly
- [X] Validation errors logged
- [X] Upsert prevents duplicate keys
- [X] Seed version tracked

---

### TK-015-014 [P1] [Foundational] Create glass-type-solution.factory.ts link factory
**File**: `prisma/factories/glass-type-solution.factory.ts`

**Description**:
Factory to create GlassTypeSolution many-to-many relationships:
- Map glass type codes to solution keys (e.g., N70/38 → energy_efficiency, solar_control)
- Create join records with `performanceRating` and `isPrimary` flags
- Handle idempotent inserts (skip if relationship exists)

**Dependencies**: TK-015-012, TK-015-013

**Acceptance Criteria**:
- [ ] Mappings defined for all 30 glass types
- [ ] At least one primary solution per glass type
- [ ] Idempotent upsert logic

---

### TK-015-015 [P1] [Foundational] Create glass-types.seeder.ts script
**File**: `prisma/seeders/glass-types.seeder.ts`

**Description**:
Seeder script to run glass type factory:
- Call `glassTypeFactory.seed()`
- Log progress (e.g., "Seeding 30 glass types...")
- Report results (e.g., "✓ Seeded 30 types, skipped 2 existing")
- Handle errors with detailed logging

**Dependencies**: TK-015-012

**Acceptance Criteria**:
- [X] Script runnable via `pnpm seed:glass-types`
- [X] Progress logged to console and Winston
- [X] Errors captured with stack traces
- [X] Idempotent (safe to run multiple times)

---

### TK-015-016 [P1] [Foundational] Create glass-solutions.seeder.ts script
**File**: `prisma/seeders/glass-solutions.seeder.ts`

**Description**:
Seeder script to run glass solution factory:
- Call `glassSolutionFactory.seed()`
- Log progress
- Report results
- Link glass types to solutions via `glassTypeSolutionFactory.seed()`

**Dependencies**: TK-015-013, TK-015-014

**Acceptance Criteria**:
- [X] Script runnable via `pnpm seed:glass-solutions`
- [X] Solutions seeded before linking
- [X] Progress logged
- [X] Idempotent

---

### TK-015-017 [P1] [Foundational] Update prisma/seeders/index.ts with new seeders
**File**: `prisma/seeders/index.ts`

**Description**:
Register new seeders in main seeder index:
- Add `glass-types.seeder.ts` import
- Add `glass-solutions.seeder.ts` import
- Configure execution order (solutions before types due to FK)

**Dependencies**: TK-015-015, TK-015-016

**Acceptance Criteria**:
- [ ] Seeders registered in correct order
- [ ] `pnpm db:seed` runs all seeders
- [ ] Errors in one seeder don't block others

---

### TK-015-018 [P1] [Foundational] Add package.json scripts for seed commands
**File**: `package.json`

**Description**:
Add convenience scripts:
- `"seed:glass-types": "tsx prisma/seeders/glass-types.seeder.ts"`
- `"seed:glass-solutions": "tsx prisma/seeders/glass-solutions.seeder.ts"`
- `"seed:glass-taxonomy": "pnpm seed:glass-solutions && pnpm seed:glass-types"`

**Dependencies**: TK-015-015, TK-015-016

**Acceptance Criteria**:
- [X] Scripts execute correctly
- [X] Dependencies run in correct order
- [X] Commands documented in README.md

---

## Phase 3: US4 - Clean Slate Migration (P1) ⚠️ BREAKING CHANGE

**User Story**: US4 - As a system administrator, I need to execute a clean slate migration that removes all legacy data and starts fresh with 30 seeded Tecnoglass types, ensuring production launch has clean architecture.

**REVISED STRATEGY**: Delete all existing GlassType records (app not in production), seed fresh data. NO legacy preservation needed.

### TK-015-019 [P1] [US4] Create clean-slate-migration.ts script
**File**: `scripts/clean-slate-migration.ts`

**Description**:
Create migration script for clean slate approach:
- CLI flags: `--dry-run`, `--confirm` (requires explicit confirmation)
- Pre-flight checks: Verify no production data exists
- Execution steps:
  1. Delete all GlassType records (CASCADE to QuoteItem references)
  2. Delete all GlassSolution records
  3. Run seed scripts (glass-types, glass-solutions, glass-characteristics)
  4. Verify seed data integrity
- Progress logging with Winston
- Error handling with rollback triggers

**Dependencies**: TK-015-011, TK-015-015, TK-015-016

**Acceptance Criteria**:
- [ ] Script runnable via `pnpm migrate:clean-slate`
- [ ] Dry-run mode logs actions without executing
- [ ] Requires `--confirm` flag to prevent accidental execution
- [ ] Deletes ALL existing glass types and solutions
- [ ] Seeds 30 Tecnoglass types successfully
- [ ] Verifies quote integrity (no orphaned references)
- Checkpoint system for resumable migrations
- Progress logging with Winston
- Error handling with rollback triggers

**Dependencies**: TK-015-011

**Acceptance Criteria**:
- [ ] Script runnable via `pnpm migrate:glass-taxonomy`
- [ ] Dry-run mode logs actions without executing
- [ ] Single-tenant mode for testing
- [ ] Checkpoint system prevents duplicate work

---

### TK-015-020 [P1] [US4] Implement tenant data discovery logic
**File**: `scripts/migrate-glass-taxonomy.ts`

**Description**:
Query and analyze tenant glass types:
- Fetch all GlassType records where `isSeeded = false`
- Group by tenant (via GlassSupplier relationship or quote references)
- Identify potential matches with seeded types (by name/code similarity)
- Flag types with quote references (cannot be deleted)

**Dependencies**: TK-015-019

**Acceptance Criteria**:
- [ ] All tenant glass types discovered
- [ ] Match detection finds 80%+ standard type matches
- [ ] Quote reference count accurate per type
- [ ] Tenant grouping correct in multi-tenant scenarios

---

### TK-015-021 [P1] [US4] Implement legacy prefix renaming logic
**File**: `scripts/migrate-glass-taxonomy.ts`

**Description**:
Rename tenant-created types that don't match standard types:
- Prepend "Legacy - " to `name` field
- Set `isActive: false` (hide from catalog)
- Preserve `isSeeded: false` (mark as custom)
- Add admin notes: "Migrated from tenant-created type on [date]"

**Dependencies**: TK-015-020

**Acceptance Criteria**:
- [ ] Only non-matching types renamed
- [ ] Quote references remain valid (IDs unchanged)
- [ ] Requires `--confirm` flag to prevent accidental execution
- [ ] Deletes ALL existing glass types and solutions
- [ ] Seeds 30 Tecnoglass types successfully
- [ ] Verifies quote integrity (no orphaned references)

---

### TK-015-020 [P1] [US4] Implement pre-flight validation checks
**File**: `scripts/clean-slate-migration.ts`

**Description**:
Validate environment before executing destructive operations:
- Check if database is production (halt if true)
- Verify backup exists or create one
- Check for active user sessions (warn if any)
- Verify seed data files exist and are valid
- Display summary of what will be deleted

**Dependencies**: TK-015-019

**Acceptance Criteria**:
- [ ] Production environment check prevents execution
- [ ] Backup created automatically if missing
- [ ] Active sessions warning displayed
- [ ] Seed files validated before proceeding
- [ ] User confirms deletion after seeing summary

---

### TK-015-021 [P1] [US4] Implement clean slate deletion logic
**File**: `scripts/clean-slate-migration.ts`

**Description**:
Delete all existing taxonomy data:
- Delete GlassTypeSolution records (junction table)
- Delete GlassType records (CASCADE to QuoteItem)
- Delete GlassSolution records
- Delete GlassCharacteristic records (if any exist)
- Delete TenantGlassTypePrice records (if any exist)
- Log deletion counts for audit

⚠️ **CRITICAL**: This operation is DESTRUCTIVE and cannot be undone without backup restoration.

**Dependencies**: TK-015-020

**Acceptance Criteria**:
- [ ] All glass taxonomy tables truncated
- [ ] Deletion counts logged (e.g., "Deleted 4 GlassType records")
- [ ] No orphaned references remain
- [ ] Operation completes in transaction (all-or-nothing)

---

### TK-015-022 [P1] [US4] Implement seed data execution
**File**: `scripts/clean-slate-migration.ts`

**Description**:
Execute seed scripts in correct order:
1. Seed GlassCharacteristic (10-15 records)
2. Seed GlassSolution (6 records)
3. Seed GlassType (30 Tecnoglass records)
4. Seed GlassTypeSolution relationships
5. Seed GlassTypeCharacteristic relationships

**Dependencies**: TK-015-021

**Acceptance Criteria**:
- [ ] All seed scripts execute successfully
- [ ] 30 GlassType records created
- [ ] 6 GlassSolution records created
- [ ] 10+ GlassCharacteristic records created
- [ ] Relationships created correctly
- [ ] All records marked with `isSeeded: true`

---

### TK-015-023 [P1] [US4] Implement post-migration verification
**File**: `scripts/clean-slate-migration.ts`

**Description**:
Verify migration success:
- Count seeded records per table
- Verify unique constraints (no duplicate codes/keys)
- Verify foreign key integrity
- Test sample queries (list glass types, filter by series)
- Generate migration report JSON

**Dependencies**: TK-015-022

**Acceptance Criteria**:
- [ ] All counts match expected values
- [ ] No constraint violations
- [ ] Sample queries return correct results
- [ ] Report saved to `logs/clean-slate-migration-report-YYYYMMDD.json`
- [ ] Summary printed to console with success/failure status

---

### TK-015-024 [P1] [US4] Create rollback script for clean slate migration
**File**: `scripts/rollback-clean-slate.ts`

**Description**:
Emergency rollback script to restore from backup:
- Restore database from pre-migration backup
- Verify restoration success
- Log rollback actions for audit
- Verify QuoteItem references still valid

**Dependencies**: TK-015-011

**Acceptance Criteria**:
- [ ] Script runnable via `pnpm rollback:clean-slate`
- [ ] Backup file validation before restore
- [ ] Rollback actions logged with Winston
- [ ] Database state restored to pre-migration
- [ ] Quote integrity verified post-rollback
- [ ] Database state restored to pre-migration

---

### TK-015-026 [P1] [US4] Create validate-seed-data.ts validation script
**File**: `scripts/validate-seed-data.ts`

**Description**:
Validate seed data JSON files against schemas:
- Load JSON files
- Validate against JSON Schema contracts
- Check for duplicate codes/keys
- Verify technical specs within valid ranges

**Dependencies**: TK-015-006, TK-015-007, TK-015-009, TK-015-010

**Acceptance Criteria**:
- [ ] Script runnable via `pnpm validate:seed-data`
- [ ] All validation errors reported with line numbers
- [ ] Warnings for unusual values (e.g., U-value > 2.5)
- [ ] Exit code 0 only if all files valid

---

## Phase 4: US1/US2 - Verify CRUD & Catalog (P1) ✅ HYBRID MODEL

**REVISED STRATEGY**: Admin KEEPS full CRUD capabilities. This phase verifies existing functionality works with new schema + seeds.

**User Story US1**: Standardized catalog with 30 seeded types + admin can create custom types  
**User Story US2**: Universal solutions catalog + admin can create custom solutions

### TK-015-027 [P1] [US1] Verify glass-type tRPC router authorization
**File**: `src/server/api/routers/admin/glass-type.ts`

**Description**:
Verify existing CRUD procedures have correct authorization:
- Verify `create`, `update`, `delete` use `adminProcedure` (admin-only)
- Verify `list`, `getById` accessible to all authenticated users
- Test role='seller' cannot create/update/delete
- Test role='admin' has full CRUD access

**Dependencies**: TK-015-022 (seed data must exist)

**Acceptance Criteria**:
- [ ] All CRUD procedures use `adminProcedure` wrapper
- [ ] Sellers can list/view but not modify
- [ ] Admins have full CRUD access
- [ ] E2E tests verify authorization

---

### TK-015-028 [P1] [US1] Update glass-type list endpoint with new filters
**File**: `src/server/api/routers/admin/glass-type.ts`

**Description**:
Enhance `list` procedure to support new schema fields:
- Add `isSeeded` filter (true/false/all)
- Add `series` filter (Serie-N, Serie-R, etc.)
- Add `manufacturer` filter (Tecnoglass, Vitro, Guardian)
- Add search by code, name, series, manufacturer
- Keep existing pagination (10 items per page)

**Dependencies**: TK-015-027

**Acceptance Criteria**:
- [ ] Filters work correctly for seeded and custom types
- [ ] Search includes new fields (code, series, manufacturer)
- [ ] Pagination works with filters
- [ ] Empty state handled correctly

---

### TK-015-029 [P1] [US1] Update glass-types admin page with seeded badge
**File**: `src/app/(dashboard)/admin/glass-types/page.tsx`

**Description**:
Enhance page to distinguish seeded vs custom types:
- Keep "Create Glass Type" button (admin-only)
- Add seed version info banner (e.g., "Catalog includes 30 Tecnoglass types (v1.0)")
- Add badge to seeded types in table ("Seeded" badge)
- Add filter toggle: "Show seeded types", "Show custom types", "Show all"

**Dependencies**: TK-015-028

**Acceptance Criteria**:
- [ ] Create button visible for admin role
- [ ] Seed version banner displayed
- [ ] Seeded types have visual distinction (badge)
- [ ] Filter toggle works correctly

---

### TK-015-030 [P1] [US1] Update glass-type form to prevent editing seeded types
**File**: `src/app/(dashboard)/admin/glass-types/_components/glass-type-form.tsx`

**Description**:
Modify form to make seeded types read-only:
- If `isSeeded: true`, disable all form fields
- Display warning: "Seeded types cannot be edited. Create a custom type instead."
- Allow viewing technical specs but not editing
- Custom types (`isSeeded: false`) remain fully editable

**Dependencies**: TK-015-029

**Acceptance Criteria**:
- [ ] Seeded types open in read-only mode
- [ ] Warning message displayed for seeded types
- [ ] Custom types fully editable
- [ ] "Save" button hidden for seeded types

---

### TK-015-031 [P1] [US1] Update glass-type table with new columns
**File**: `src/app/(dashboard)/admin/glass-types/_components/glass-type-table.tsx`

**Description**:
Add new columns to display schema changes:
- Add "Code" column (e.g., "N70/38")
- Add "Series" column (e.g., "Serie-N")
- Add "Manufacturer" column (e.g., "Tecnoglass")
- Add "Type" badge column ("Seeded" or "Custom")
- Keep existing "Edit" and "Delete" actions (with authorization check)

**Dependencies**: TK-015-028

**Acceptance Criteria**:
- [ ] New columns display correctly
- [ ] Type badge visually distinct
- [ ] Edit/Delete hidden for non-admin users
- [ ] Seeded types cannot be deleted (show tooltip explaining why)

---

### TK-015-032 [P1] [US1] Add series/manufacturer filters to glass-type filters
**File**: `src/app/(dashboard)/admin/glass-types/_components/glass-type-filters.tsx`

**Description**:
Add new filter options:
- Series dropdown (Serie-N, Serie-R, Solarban, etc.)
- Manufacturer dropdown (Tecnoglass, Vitro, Guardian)
- Thickness slider (4mm-12mm)
- Type toggle (Seeded/Custom/All)
- Series dropdown (Serie-N, Serie-R, etc.)
- Manufacturer dropdown (Tecnoglass, Vitro, Guardian)
- Thickness slider (6mm-12mm)
- Seeded/Legacy toggle

**Dependencies**: TK-015-030

**Acceptance Criteria**:
- [ ] Filters sync with URL params
- [ ] Multiple filters combinable
- [ ] Reset filters button works
- [ ] Filter state persists on page reload

---

### TK-015-033 [P1] [US2] Verify glass-solution tRPC router authorization
**File**: `src/server/api/routers/admin/glass-solution.ts`

**Description**:
Verify existing CRUD procedures have correct authorization:
- Verify `create`, `update`, `delete` use `adminProcedure`
- Verify `list`, `getById` accessible to all authenticated users
- Test role-based access control

**Dependencies**: TK-015-022 (seed data must exist)

**Acceptance Criteria**:
- [ ] All CRUD procedures use `adminProcedure` wrapper
- [ ] Sellers can list/view but not modify
- [ ] Admins have full CRUD access
- [ ] E2E tests verify authorization

---

### TK-015-034 [P1] [US2] Update glass-solution list endpoint with isSeeded filter
**File**: `src/server/api/routers/admin/glass-solution.ts`

**Description**:
Enhance `list` procedure to support new schema:
- Add `isSeeded` filter (true/false/all)
- Add search by name/nameEs/description
- Sort by `sortOrder` by default

**Dependencies**: TK-015-033

**Acceptance Criteria**:
- [ ] Filters work correctly for seeded and custom solutions
- [ ] Search works in both English and Spanish
- [ ] Sort order respected
- [ ] Empty state handled

---

### TK-015-035 [P1] [US2] Update glass-solutions page with seeded badge
**File**: `src/app/(dashboard)/admin/glass-solutions/page.tsx`

**Description**:
Enhance page to distinguish seeded vs custom solutions:
- Keep "Create Solution" button (admin-only)
- Add seed version info banner
- Add badge to seeded solutions ("Seeded" badge)
- Add filter toggle for seeded/custom/all

**Dependencies**: TK-015-034

**Acceptance Criteria**:
- [ ] Create button visible for admin role
- [ ] Seed version banner displayed
- [ ] Seeded solutions have visual distinction
- [ ] Filter toggle works

---

### TK-015-036 [P1] [US2] Update glass-solution form to prevent editing seeded solutions
**File**: `src/app/(dashboard)/admin/glass-solutions/_components/glass-solution-form.tsx`

**Description**:
Modify form to make seeded solutions read-only:
- If `isSeeded: true`, disable all form fields
- Display warning for seeded solutions
- Custom solutions remain fully editable

**Dependencies**: TK-015-035

**Acceptance Criteria**:
- [ ] Seeded solutions open in read-only mode
- [ ] Warning message displayed
- [ ] Custom solutions fully editable
- [ ] Save button hidden for seeded solutions

---

## Phase 5: US3 - Tenant-Specific Suppliers (P2) ✅ VERIFY ONLY

### TK-015-041 [P1] [US2] Create glass-catalog tRPC router for public access
**File**: `src/server/api/routers/catalog/glass-catalog.ts`

**Description**:
Create new public router for glass catalog:
- `list-glass-types-by-solution` procedure (filter glass types by solution key)
- `list-solutions` procedure (get all active solutions)
- No authentication required (public endpoint)
- Add caching headers (ISR for 1 hour)

**Dependencies**: TK-015-038

**Acceptance Criteria**:
- [ ] Public procedures accessible without auth
- [ ] Filtering by solution works correctly
- [ ] Caching headers set for performance

---

### TK-015-042 [P1] [US2] Create glass-taxonomy.service.ts business logic layer
**File**: `src/server/services/glass-taxonomy.service.ts`

**Description**:
Service layer for seed data operations:
- `getSolutionsForGlassType(glassTypeId)` - Get linked solutions
- `getGlassTypesForSolution(solutionKey)` - Get compatible glass types
- `getSeedVersion()` - Get current seed data version
- Cache results for performance

**Dependencies**: TK-015-041

**Acceptance Criteria**:
- [ ] Service methods typed with Zod
- [ ] Caching implemented (Redis or in-memory)
- [ ] Unit tests cover all methods

---

## Phase 6: US3 - Tenant-Specific Supplier Management (P2)

**User Story**: US3 - As a tenant administrator, I can manage my glass suppliers and their pricing separately from other tenants, so that my supplier relationships and negotiated rates remain confidential.

### TK-015-043 [P2] [US3] Add tenantId to GlassSupplier tRPC create procedure
**File**: `src/server/api/routers/admin/glass-supplier.ts`

**Description**:
Modify `create` procedure to include tenant isolation:
- Auto-populate `tenantId` from session context
- Prevent manual tenant ID override (security)
- Validate tenant exists before creating supplier

**Dependencies**: TK-015-004 (schema change)

**Acceptance Criteria**:
- [ ] TenantId set from session, not input
- [ ] Non-admin users cannot create suppliers for other tenants
- [ ] Admin users can create for any tenant (with explicit flag)

---

### TK-015-044 [P2] [US3] Add tenantId filter to GlassSupplier list procedure
**File**: `src/server/api/routers/admin/glass-supplier.ts`

**Description**:
Modify `list` procedure to filter by tenant:
- Auto-filter by session.tenantId for non-admin users
- Admin users see all suppliers (with tenant grouping)
- Add tenant name to supplier list response

**Dependencies**: TK-015-043

**Acceptance Criteria**:
- [ ] Users see only their tenant's suppliers
- [ ] Admins see all suppliers with tenant labels
- [ ] No cross-tenant data leakage

---

### TK-015-045 [P2] [US3] Add tenantId validation to GlassSupplier update procedure
**File**: `src/server/api/routers/admin/glass-supplier.ts`

**Description**:
Modify `update` procedure to validate tenant ownership:
- Check supplier.tenantId matches session.tenantId
- Prevent cross-tenant updates
- Allow admin override with explicit flag

**Dependencies**: TK-015-043

**Acceptance Criteria**:
- [ ] Users cannot update other tenants' suppliers
- [ ] Validation error message clear
- [ ] Admin override functional

---

### TK-015-046 [P2] [US3] Add tenantId validation to GlassSupplier delete procedure
**File**: `src/server/api/routers/admin/glass-supplier.ts`

**Description**:
Modify `delete` procedure to validate tenant ownership:
- Check supplier.tenantId matches session.tenantId
- Prevent cross-tenant deletes
- Cascade delete pricing records (via FK)

**Dependencies**: TK-015-043

**Acceptance Criteria**:
- [ ] Users cannot delete other tenants' suppliers
- [ ] Cascade delete works correctly
- [ ] Admin override functional

---

### TK-015-047 [P2] [US3] Create tenant-glass-price tRPC router
**File**: `src/server/api/routers/admin/tenant-glass-price.ts`

**Description**:
New router for pricing management:
- `list` - Get pricing for tenant's glass types
- `update` - Set custom pricing for glass type + supplier
- `history` - Get price history for auditing
- Procedures protected with `adminProcedure` or `sellerProcedure`

**Dependencies**: TK-015-002 (TenantGlassTypePrice model)

**Acceptance Criteria**:
- [ ] List shows current prices only (active effectiveDate)
- [ ] Update creates new record (immutable history)
- [ ] History sorted by effectiveDate descending

---

### TK-015-048 [P2] [US3] Create tenant pricing management UI page
**File**: `src/app/(dashboard)/admin/pricing/page.tsx`

**Description**:
Admin page for managing glass type pricing:
- Table showing all seeded glass types
- Current price column (editable)
- Supplier dropdown (optional)
- Effective date picker
- Save triggers `tenant-glass-price.update` mutation

**Dependencies**: TK-015-047

**Acceptance Criteria**:
- [ ] Table loads current pricing
- [ ] Edits saved correctly
- [ ] Optimistic UI updates
- [ ] SSR cache invalidation (invalidate + router.refresh)

---

### TK-015-049 [P2] [US3] Create pricing history modal component
**File**: `src/app/(dashboard)/admin/pricing/_components/pricing-history-modal.tsx`

**Description**:
Modal to display price history for a glass type:
- Table with columns: Price, Supplier, Effective Date, Expiry Date, Notes
- Sort by effective date descending
- Show who created each record (audit trail)

**Dependencies**: TK-015-047

**Acceptance Criteria**:
- [ ] History loads correctly
- [ ] Sorting functional
- [ ] Empty state for new glass types

---

### TK-015-050 [P2] [US3] Update GlassSupplier form to hide tenantId field
**File**: `src/app/(dashboard)/admin/glass-suppliers/_components/glass-supplier-form.tsx`

**Description**:
Modify supplier form UI:
- Remove tenantId input field (auto-populated server-side)
- For admin users, show tenant selector dropdown
- Display read-only tenant name for non-admin users

**Dependencies**: TK-015-043

**Acceptance Criteria**:
- [ ] Non-admin users don't see tenant field
- [ ] Admin users can select tenant
- [ ] Form validation passes

---

## Phase 7: Polish (Testing, Docs, Deployment)

### TK-015-051 [P1] [Polish] Create unit tests for glass-type.factory.ts
**File**: `tests/unit/factories/glass-type.factory.test.ts`

**Description**:
Test factory logic:
- Test JSON loading and parsing
- Test validation error handling
- Test upsert idempotency
- Test seed version tracking

**Dependencies**: TK-015-012

**Acceptance Criteria**:
- [ ] 100% code coverage for factory
- [ ] All edge cases tested
- [ ] Tests runnable via `pnpm test`

---

### TK-015-052 [P1] [Polish] Create unit tests for glass-solution.factory.ts
**File**: `tests/unit/factories/glass-solution.factory.test.ts`

**Description**:
Test factory logic:
- Test JSON loading
- Test validation
- Test upsert idempotency

**Dependencies**: TK-015-013

**Acceptance Criteria**:
- [ ] 100% code coverage
- [ ] Edge cases tested

---

### TK-015-053 [P1] [Polish] Create unit tests for glass-taxonomy.service.ts
**File**: `tests/unit/services/glass-taxonomy.service.test.ts`

**Description**:
Test service methods:
- Test getSolutionsForGlassType with mock data
- Test getGlassTypesForSolution with filters
- Test getSeedVersion caching

**Dependencies**: TK-015-042

**Acceptance Criteria**:
- [ ] 100% code coverage
- [ ] Mocked DB calls
- [ ] Cache invalidation tested

---

### TK-015-054 [P1] [Polish] Create integration tests for migration script
**File**: `tests/integration/migrations/glass-taxonomy.migration.test.ts`

**Description**:
Test migration script end-to-end:
- Set up test database with tenant data
- Run migration in dry-run mode
- Run migration in actual mode
- Verify all data transformed correctly
- Test rollback script

**Dependencies**: TK-015-024

**Acceptance Criteria**:
- [ ] Test runs in isolated DB instance
- [ ] All migration steps verified
- [ ] Rollback tested
- [ ] Report JSON validated

---

### TK-015-055 [P1] [Polish] Create E2E test for blocked glass-type CRUD
**File**: `e2e/admin/glass-types-readonly.spec.ts`

**Description**:
Playwright test for UI restrictions:
- Verify "Create" button not visible
- Verify edit action blocked with error toast
- Verify delete action blocked with error toast
- Verify View Details modal read-only

**Dependencies**: TK-015-032

**Acceptance Criteria**:
- [ ] Test passes in CI pipeline
- [ ] All user flows covered
- [ ] Error messages validated

---

### TK-015-056 [P1] [Polish] Create E2E test for blocked glass-solution CRUD
**File**: `e2e/admin/glass-solutions-readonly.spec.ts`

**Description**:
Playwright test for UI restrictions:
- Verify "Create" button not visible
- Verify edit/delete blocked
- Verify read-only display

**Dependencies**: TK-015-040

**Acceptance Criteria**:
- [ ] Test passes in CI
- [ ] All user flows covered

---

### TK-015-057 [P1] [Polish] Create E2E test for tenant pricing management
**File**: `e2e/admin/tenant-pricing.spec.ts`

**Description**:
Playwright test for pricing UI:
- Create custom pricing for glass type
- Verify pricing saved correctly
- View pricing history
- Update pricing (creates new version)

**Dependencies**: TK-015-048

**Acceptance Criteria**:
- [ ] Test passes in CI
- [ ] All CRUD operations tested
- [ ] History modal tested

---

### TK-015-058 [P1] [Polish] Update README.md with migration instructions
**File**: `README.md`

**Description**:
Add section "Glass Taxonomy Migration":
- Link to quickstart.md
- List required scripts and commands
- Document seed version update process
- Document rollback procedures

**Dependencies**: All previous tasks

**Acceptance Criteria**:
- [ ] README updated with clear instructions
- [ ] Links to relevant documentation
- [ ] Commands copy-pasteable

---

### TK-015-059 [P1] [Polish] Create MIGRATION_RUNBOOK.md operational guide
**File**: `docs/MIGRATION_RUNBOOK.md`

**Description**:
Detailed operational runbook:
- Pre-migration checklist (backup, verification)
- Step-by-step migration commands
- Troubleshooting guide (common errors and fixes)
- Rollback procedures
- Contact information for support

**Dependencies**: All previous tasks

**Acceptance Criteria**:
- [ ] Runbook covers all scenarios
- [ ] Troubleshooting section comprehensive
- [ ] Rollback steps tested

---

### TK-015-060 [P1] [Polish] Update .github/copilot-instructions.md with static taxonomy patterns
**File**: `.github/copilot-instructions.md`

**Description**:
Document new patterns for AI assistant:
- "GlassType/GlassSolution are now read-only, seeded data"
- "Use TenantGlassTypePrice for pricing management"
- "GlassSupplier requires tenantId (tenant isolation)"
- "Seed version tracking pattern for idempotent seeds"

**Dependencies**: All previous tasks

**Acceptance Criteria**:
- [ ] Instructions updated
- [ ] Examples added for common tasks
- [ ] Agent context includes new models

---

### TK-015-061 [P2] [Polish] Create seed data update workflow documentation
**File**: `docs/SEED_DATA_UPDATES.md`

**Description**:
Document process for updating seed data:
- How to add new glass types to JSON
- How to increment seed version
- How to run incremental seed update
- How to test seed changes in staging

**Dependencies**: TK-015-009, TK-015-010

**Acceptance Criteria**:
- [ ] Workflow documented step-by-step
- [ ] Version bumping explained
- [ ] Testing strategy included

---

### TK-015-062 [P2] [Polish] Add seed version check to application startup
**File**: `src/server/db.ts` or `src/lib/startup-checks.ts`

**Description**:
Add startup validation:
- Check if seed data exists (count GlassType where isSeeded=true)
- Check seed version matches expected version (warn if outdated)
- Log warnings if seed data missing or outdated

**Dependencies**: TK-015-015

**Acceptance Criteria**:
- [ ] Validation runs on app startup
- [ ] Warnings logged with Winston
- [ ] Non-blocking (app still starts)

---

### TK-015-063 [P2] [Polish] Create monitoring alerts for seed data issues
**File**: `src/server/monitoring/seed-data-monitor.ts`

**Description**:
Monitoring checks for production:
- Alert if seed data count drops below threshold
- Alert if seed version mismatches expected
- Alert if glass types with isSeeded=true are deleted
- Integrate with existing alerting system (if available)

**Dependencies**: TK-015-062

**Acceptance Criteria**:
- [ ] Alerts configured
- [ ] Test alerts trigger correctly
- [ ] Alert recipients configured

---

## Dependency Graph

```
Phase 1 (Setup)
├── TK-015-001 (GlassType schema) ─┬─> TK-015-002 (TenantGlassTypePrice)
│                                   ├─> TK-015-003 (GlassSolution schema)
│                                   ├─> TK-015-004 (GlassSupplier tenantId)
│                                   └─> TK-015-005 (Migration file)
├── TK-015-006 (glass-type schema)  ─> TK-015-009 (Tecnoglass JSON)
├── TK-015-007 (glass-solution schema) ─> TK-015-010 (Solutions JSON)
└── TK-015-008 (migration-report schema)

Phase 2 (Foundational)
├── TK-015-011 (Apply migration) ───> TK-015-012 (glass-type factory)
│                                     TK-015-013 (glass-solution factory)
├── TK-015-012 + TK-015-013 ─────> TK-015-014 (link factory)
├── TK-015-012 ──────────────────> TK-015-015 (glass-types seeder)
├── TK-015-013 + TK-015-014 ─────> TK-015-016 (glass-solutions seeder)
├── TK-015-015 + TK-015-016 ─────> TK-015-017 (seeders index)
└── TK-015-015 + TK-015-016 ─────> TK-015-018 (package.json scripts)

Phase 3 (US4 - Data Migration) - BLOCKING FOR ALL OTHER USER STORIES
├── TK-015-019 (migration skeleton) ─> TK-015-020 (discovery)
├── TK-015-020 ──────────────────────> TK-015-021 (legacy prefix)
├── TK-015-021 ──────────────────────> TK-015-022 (quote verification)
├── TK-015-021 ──────────────────────> TK-015-023 (pricing migration)
├── TK-015-022 + TK-015-023 ─────────> TK-015-024 (report generation)
├── TK-015-025 (rollback script)
└── TK-015-026 (validation script)

Phase 4 (US1 - Glass Types) - CAN PARALLEL AFTER US4
├── TK-015-027 (block create) ──> TK-015-028 (block update)
├── TK-015-028 ─────────────────> TK-015-029 (block delete)
├── TK-015-027 ─────────────────> TK-015-030 (list read-only)
├── TK-015-030 ─────────────────> TK-015-031 (admin page)
├── TK-015-031 ─────────────────> TK-015-032 (table component)
├── TK-015-032 ─────────────────> TK-015-033 (details modal)
└── TK-015-030 ─────────────────> TK-015-034 (filters)

Phase 5 (US2 - Glass Solutions) - CAN PARALLEL AFTER US4
├── TK-015-035 (block create) ──> TK-015-036 (block update)
├── TK-015-036 ─────────────────> TK-015-037 (block delete)
├── TK-015-035 ─────────────────> TK-015-038 (list read-only)
├── TK-015-038 ─────────────────> TK-015-039 (admin page)
├── TK-015-039 ─────────────────> TK-015-040 (list component)
├── TK-015-038 ─────────────────> TK-015-041 (glass-catalog router)
└── TK-015-041 ─────────────────> TK-015-042 (taxonomy service)

Phase 6 (US3 - Suppliers) - CAN PARALLEL AFTER US4
├── TK-015-043 (create with tenantId) ──> TK-015-044 (list filter)
├── TK-015-043 ──────────────────────> TK-015-045 (update validation)
├── TK-015-043 ──────────────────────> TK-015-046 (delete validation)
├── TK-015-047 (pricing router) ─────> TK-015-048 (pricing UI)
├── TK-015-047 ──────────────────────> TK-015-049 (pricing history modal)
└── TK-015-043 ──────────────────────> TK-015-050 (supplier form)

Phase 7 (Polish) - AFTER ALL USER STORIES
├── Unit Tests: TK-015-051, TK-015-052, TK-015-053
├── Integration Tests: TK-015-054
├── E2E Tests: TK-015-055, TK-015-056, TK-015-057
├── Documentation: TK-015-058, TK-015-059, TK-015-060, TK-015-061
└── Monitoring: TK-015-062, TK-015-063
```

---

## Implementation Strategy

### MVP Scope (Weeks 1-2)

**Goal**: Migrate data and enable read-only catalog for glass types

**Tasks**: Phase 1 + Phase 2 + Phase 3 + Phase 4 (US4 + US1)

**Success Criteria**:
- [ ] All tenant data migrated with zero data loss
- [ ] Quote references validated (100% integrity)
- [ ] Glass types catalog read-only in UI
- [ ] Legacy types hidden from new quotes
- [ ] E2E tests pass for CRUD blocking

### Iteration 2 (Week 3)

**Goal**: Add glass solutions catalog and linking

**Tasks**: Phase 5 (US2)

**Success Criteria**:
- [ ] Glass solutions seeded
- [ ] Glass type-solution linking functional
- [ ] Public catalog API accessible
- [ ] E2E tests pass

### Iteration 3 (Week 4)

**Goal**: Tenant-specific supplier management and pricing

**Tasks**: Phase 6 (US3)

**Success Criteria**:
- [ ] GlassSupplier isolated by tenant
- [ ] Pricing management UI functional
- [ ] Price history auditing works
- [ ] E2E tests pass

### Final Polish (Week 5)

**Goal**: Testing, documentation, deployment readiness

**Tasks**: Phase 7 (Polish)

**Success Criteria**:
- [ ] 100% test coverage for critical paths
- [ ] All documentation complete
- [ ] Monitoring alerts configured
- [ ] Runbook validated in staging

---

## Parallel Execution Examples

### Example 1: After US4 Completes, Parallelize US1/US2/US3

```bash
# Terminal 1 - Work on US1 (Glass Types)
git checkout -b feat/015-us1-glass-types
# Implement TK-015-027 through TK-015-034

# Terminal 2 - Work on US2 (Glass Solutions)
git checkout -b feat/015-us2-glass-solutions
# Implement TK-015-035 through TK-015-042

# Terminal 3 - Work on US3 (Suppliers)
git checkout -b feat/015-us3-suppliers
# Implement TK-015-043 through TK-015-050

# All branches merge to main after completion
```

### Example 2: Frontend and Backend Split

```bash
# Developer A - Backend (tRPC routers, services)
# TK-015-027, TK-015-028, TK-015-029, TK-015-030 (Glass Types API)
# TK-015-035, TK-015-036, TK-015-037, TK-015-038 (Glass Solutions API)

# Developer B - Frontend (UI components, pages)
# TK-015-031, TK-015-032, TK-015-033, TK-015-034 (Glass Types UI)
# TK-015-039, TK-015-040 (Glass Solutions UI)

# Developer C - Pricing feature (full-stack)
# TK-015-047, TK-015-048, TK-015-049 (Pricing management)
```

---

## Notes for Developers

### Critical Path
**US4 (Data Migration) MUST complete before any other user story** because:
- US1 depends on seeded glass types existing
- US2 depends on seeded glass solutions existing
- US3 depends on pricing migration completing
- Without migration, existing quotes will break

### Testing Strategy
- **Unit tests**: Run in parallel with development (TDD approach)
- **Integration tests**: Run after each phase completes
- **E2E tests**: Run after UI changes merge to main
- **Migration script testing**: MUST test in staging with production-like data volume

### Rollback Plan
- Keep `rollback-glass-taxonomy.ts` script updated with each migration change
- Test rollback in staging before every production deployment
- Document rollback time estimate (should be < 10 minutes for emergency revert)

### Performance Considerations
- Add database indexes BEFORE running migration (already in schema)
- Use transaction batching for large datasets (10,000+ records)
- Monitor migration script progress via checkpoints (resume if interrupted)
- Cache seed data in Redis for faster catalog queries

### Security Considerations
- Validate tenant isolation in ALL tRPC procedures (use `getQuoteFilter` pattern)
- Log all CRUD blocking attempts (audit trail)
- Encrypt database backups (sensitive pricing data)
- Rate-limit public catalog API (prevent abuse)

---

## Task Summary

**Total Tasks**: 63  
**Priority Breakdown**:
- P1 (Critical): 52 tasks
- P2 (Important): 11 tasks

**Estimated Effort**:
- Phase 1 (Setup): 3 days
- Phase 2 (Foundational): 2 days
- Phase 3 (US4 Migration): 5 days
- Phase 4 (US1 Glass Types): 3 days
- Phase 5 (US2 Glass Solutions): 3 days
- Phase 6 (US3 Suppliers): 4 days
- Phase 7 (Polish): 5 days

**Total**: ~25 working days (5 weeks with 1-2 developers)

---

## Completion Checklist

### Phase 1: Setup
- [ ] All schema changes applied (TK-015-001 to TK-015-005)
- [ ] Seed data JSON files created and validated (TK-015-009, TK-015-010)
- [ ] JSON Schema contracts created (TK-015-006, TK-015-007, TK-015-008)

### Phase 2: Foundational
- [ ] Migration applied to staging database (TK-015-011)
- [ ] Seed factories created and tested (TK-015-012, TK-015-013, TK-015-014)
- [ ] Seeders runnable via package.json scripts (TK-015-015, TK-015-016, TK-015-018)

### Phase 3: US4 - Data Migration
- [ ] Migration script tested in staging with production-like data (TK-015-019 to TK-015-024)
- [ ] Rollback script tested (TK-015-025)
- [ ] Quote reference integrity validated (100% pass rate)

### Phase 4: US1 - Standardized Glass Types
- [ ] CRUD endpoints blocked with proper error messages (TK-015-027 to TK-015-029)
- [ ] Admin UI updated to read-only catalog (TK-015-031 to TK-015-034)
- [ ] E2E tests pass (TK-015-055)

### Phase 5: US2 - Universal Glass Solutions
- [ ] CRUD endpoints blocked (TK-015-035 to TK-015-037)
- [ ] Public catalog API functional (TK-015-041)
- [ ] E2E tests pass (TK-015-056)

### Phase 6: US3 - Tenant-Specific Suppliers
- [ ] Tenant isolation enforced in all endpoints (TK-015-043 to TK-015-046)
- [ ] Pricing management UI functional (TK-015-048, TK-015-049)
- [ ] E2E tests pass (TK-015-057)

### Phase 7: Polish
- [ ] All unit tests pass with >80% coverage (TK-015-051 to TK-015-053)
- [ ] Integration tests pass (TK-015-054)
- [ ] Documentation complete (TK-015-058 to TK-015-061)
- [ ] Monitoring configured (TK-015-062, TK-015-063)

---

**Last Updated**: 2025-10-22 (REVISED with Session 2025-10-22 clarifications)  
**Next Review**: After Phase 2 completion (end of Week 1)

---

## 📋 Revision Summary (2025-10-22)

### Major Changes from Original Spec

**1. Hybrid Model Adopted** ✅
- **BEFORE**: Fully static, CRUD blocked for all users
- **AFTER**: Seeded catalog + Admin CRUD for custom types
- **Impact**: Removed 12 tasks about blocking CRUD endpoints
- **New Tasks**: Added verification tasks for authorization (TK-015-027, TK-015-033)

**2. Deprecated Fields Deleted** 🗑️
- **BEFORE**: Preserve with @deprecated comments
- **AFTER**: Delete immediately (clean schema for v1.0)
- **Impact**: Updated TK-015-001, TK-015-005
- **Reason**: App not in production = no backward compatibility needed

**3. Clean Slate Migration** 🧹
- **BEFORE**: Preserve tenant types with "Legacy -" prefix
- **AFTER**: Delete all existing types, start fresh
- **Impact**: Removed 6 tasks about legacy preservation (TK-015-020, TK-015-021)
- **New Tasks**: Added clean slate script (TK-015-019 to TK-015-024)

**4. GlassCharacteristic Model Added** 📦
- **NEW**: Replaces boolean flags (isTempered, isLaminated, etc.)
- **Impact**: Added 3 new tasks (TK-015-004B, TK-015-010B, TK-015-010C)
- **Benefit**: More flexible, supports future characteristics

**5. Phase Count Reduced** ⚡
- **BEFORE**: 7 phases (Setup, Foundational, US4, US1, US2, US3, Polish)
- **AFTER**: 5 phases (Setup, Foundational, US4, US1/US2, US3)
- **Reason**: No CRUD blocking = phases 4 and 5 merged into verification

### Task Count Changes

| Category             | Before | After  | Change                      |
| -------------------- | ------ | ------ | --------------------------- |
| Setup                | 10     | 13     | +3 (GlassCharacteristic)    |
| Migration            | 7      | 6      | -1 (no legacy preservation) |
| Glass Types CRUD     | 8      | 6      | -2 (no blocking)            |
| Glass Solutions CRUD | 6      | 4      | -2 (no blocking)            |
| **TOTAL**            | **63** | **56** | **-7 tasks**                |

### Documentation Updates Needed

- [ ] Update `data-model.md` with GlassCharacteristic schema
- [ ] Update `quickstart.md` with clean slate migration steps
- [ ] Update `research.md` with clarification decisions
- [ ] Update `.github/copilot-instructions.md` with hybrid model patterns

### Risk Mitigation

✅ **Resolved Risks**:
- Legacy data preservation complexity (eliminated)
- CRUD blocking breaking existing workflows (admin keeps CRUD)
- Backward compatibility burden (clean slate approach)

⚠️ **New Risks**:
- Admins may create incorrect custom types (mitigated by clear UI warnings)
- Clean slate migration is destructive (mitigated by pre-flight checks + backups)

