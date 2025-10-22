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

## Task Organization

Tasks are organized into **7 phases** following dependency order:

1. **Phase 1: Setup** - Prepare schema and seed data structure
2. **Phase 2: Foundational** - Apply schema migration and create seed infrastructure
3. **Phase 3: US4 - Data Migration (P1)** - Migrate tenant data with legacy preservation
4. **Phase 4: US1 - Standardized Glass Types (P1)** - Block CRUD, enable read-only catalog
5. **Phase 5: US2 - Universal Glass Solutions (P1)** - Block CRUD, enable read-only catalog
6. **Phase 6: US3 - Tenant-Specific Suppliers (P2)** - Add tenant isolation to suppliers
7. **Phase 7: Polish** - Testing, documentation, deployment readiness

**Parallel Execution**: After Phase 3 (US4) completes, US1/US2/US3 can proceed in parallel.

---

## Phase 1: Setup (Schema & Seed Structure)

### TK-015-001 [P1] [Setup] Modify GlassType schema with new fields
**File**: `prisma/schema.prisma`

**Description**:
Add new fields to GlassType model:
- `code` (String, unique) - Manufacturer product code (e.g., "N70/38")
- `series` (String?, optional) - Product line grouping (e.g., "Serie-N")
- `manufacturer` (String?, optional) - Manufacturer name (e.g., "Tecnoglass")
- `isSeeded` (Boolean, default false) - Flag for seed-generated types
- `seedVersion` (String?, optional) - Seed data version (e.g., "1.0")
- Make `name` unique
- Remove `glassSupplierId` FK (moved to pricing table)
- Add indexes for `code`, `series`, `manufacturer`, `isSeeded`

**Dependencies**: None

**Acceptance Criteria**:
- [X] Schema compiles without errors
- [X] `pnpm prisma format` validates schema
- [X] `pnpm typecheck` passes with new fields
- [X] Indexes added for search/filter performance

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

### TK-015-005 [P1] [Setup] Create Prisma migration file
**File**: `prisma/migrations/YYYYMMDDHHMMSS_static_glass_taxonomy/migration.sql`

**Description**:
Generate Prisma migration for all schema changes:
```bash
pnpm prisma migrate dev --name static_glass_taxonomy --create-only
```
Review generated SQL to ensure:
- All columns added with correct types and constraints
- Indexes created for performance
- No data loss for deprecated fields

**Dependencies**: TK-015-001, TK-015-002, TK-015-003, TK-015-004

**Acceptance Criteria**:
- [X] Migration file generated successfully
- [X] SQL reviewed for correctness (updated to handle existing data)
- [X] No breaking changes to existing data (code column populated from SKU or generated)
- [X] Deprecated fields preserved with @deprecated JSDoc comments

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

## Phase 3: US4 - Data Migration (P1)

**User Story**: US4 - As a system administrator, I need existing tenant-created glass types to be preserved with clear "legacy" labeling, so that historical quotes remain accurate while new quotes use standardized types.

### TK-015-019 [P1] [US4] Create migrate-glass-taxonomy.ts script skeleton
**File**: `scripts/migrate-glass-taxonomy.ts`

**Description**:
Create migration script structure:
- CLI flags: `--dry-run`, `--tenant-id` (optional for single tenant)
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
- [ ] Types hidden from new quote creation
- [ ] Migration reversible (see rollback script)

---

### TK-015-022 [P1] [US4] Implement quote reference verification
**File**: `scripts/migrate-glass-taxonomy.ts`

**Description**:
Verify all QuoteItem records still reference valid GlassType IDs:
- Query all QuoteItem.glassTypeId values
- LEFT JOIN GlassType to detect orphaned references
- Report any broken references as CRITICAL errors
- Halt migration if orphans detected

**Dependencies**: TK-015-021

**Acceptance Criteria**:
- [ ] 100% of quote references validated
- [ ] Zero orphaned references post-migration
- [ ] Broken references logged with quote ID
- [ ] Migration halts on validation failure

---

### TK-015-023 [P1] [US4] Implement pricing data migration
**File**: `scripts/migrate-glass-taxonomy.ts`

**Description**:
Migrate pricing from GlassType.pricePerSqm to TenantGlassTypePrice:
- For each tenant + glass type, create pricing record
- Set `effectiveDate` to migration date
- Copy `pricePerSqm` to TenantGlassTypePrice.price
- Preserve supplier relationship (if available)

**Dependencies**: TK-015-021

**Acceptance Criteria**:
- [ ] All pricing data migrated
- [ ] Tenant isolation correct (no cross-tenant pricing)
- [ ] Effective dates set to migration timestamp
- [ ] No data loss from old pricing field

---

### TK-015-024 [P1] [US4] Implement migration report generation
**File**: `scripts/migrate-glass-taxonomy.ts`

**Description**:
Generate JSON report conforming to migration-report.schema.json:
- Summary metrics (types seeded, migrated, preserved, quotes verified)
- Per-tenant details (types processed, errors encountered)
- Errors and warnings arrays
- Execution time and checkpoint status

**Dependencies**: TK-015-022, TK-015-023

**Acceptance Criteria**:
- [ ] Report validates against JSON schema
- [ ] All metrics accurate
- [ ] Report saved to `logs/migration-report-YYYYMMDD.json`
- [ ] Human-readable summary printed to console

---

### TK-015-025 [P1] [US4] Create rollback-glass-taxonomy.ts script
**File**: `scripts/rollback-glass-taxonomy.ts`

**Description**:
Emergency rollback script:
- Restore database from backup (requires `--backup-file` flag)
- Revert legacy prefix renames
- Delete TenantGlassTypePrice records created during migration
- Log rollback actions for audit

**Dependencies**: TK-015-011

**Acceptance Criteria**:
- [ ] Script runnable via `pnpm rollback:glass-taxonomy`
- [ ] Backup file validation before restore
- [ ] Rollback actions logged
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

## Phase 4: US1 - Standardized Glass Types (P1)

**User Story**: US1 - As a tenant administrator, I can only view and select from a standardized catalog of glass types from major manufacturers (Tecnoglass, Vitro, Guardian), so that quotes are based on accurate technical specifications without manual data entry.

### TK-015-027 [P1] [US1] Block create endpoint in glass-type tRPC router
**File**: `src/server/api/routers/admin/glass-type.ts`

**Description**:
Remove or disable `create` procedure:
- Throw `TRPCError` with code `FORBIDDEN` and message "Glass types are now managed via seed data. Contact support to request custom types."
- Log blocked attempts with Winston (user ID, tenant ID)
- Return error in Spanish for UI display

**Dependencies**: TK-015-015 (seed data must exist before blocking CRUD)

**Acceptance Criteria**:
- [ ] `create` procedure returns 403 Forbidden
- [ ] Error message in Spanish
- [ ] Blocked attempts logged for audit
- [ ] E2E test verifies CRUD blocked

---

### TK-015-028 [P1] [US1] Block update endpoint in glass-type tRPC router
**File**: `src/server/api/routers/admin/glass-type.ts`

**Description**:
Remove or disable `update` procedure:
- Throw `TRPCError` with code `FORBIDDEN`
- Log blocked attempts
- Return Spanish error message

**Dependencies**: TK-015-027

**Acceptance Criteria**:
- [ ] `update` procedure returns 403 Forbidden
- [ ] Error handling consistent with create block
- [ ] E2E test verifies block

---

### TK-015-029 [P1] [US1] Block delete endpoint in glass-type tRPC router
**File**: `src/server/api/routers/admin/glass-type.ts`

**Description**:
Remove or disable `delete` procedure:
- Throw `TRPCError` with code `FORBIDDEN`
- Log blocked attempts
- Return Spanish error message

**Dependencies**: TK-015-027

**Acceptance Criteria**:
- [ ] `delete` procedure returns 403 Forbidden
- [ ] Error handling consistent
- [ ] E2E test verifies block

---

### TK-015-030 [P1] [US1] Keep list endpoint in glass-type tRPC router (read-only)
**File**: `src/server/api/routers/admin/glass-type.ts`

**Description**:
Modify `list` procedure to filter glass types:
- Add `isSeeded` filter (default: show only seeded types)
- Add `includeActive` filter (hide legacy types by default)
- Add search by code, name, series, manufacturer
- Add pagination (10 items per page)

**Dependencies**: TK-015-027

**Acceptance Criteria**:
- [ ] List shows only seeded types by default
- [ ] Legacy types hidden unless explicitly requested
- [ ] Search/filter functional
- [ ] Pagination correct

---

### TK-015-031 [P1] [US1] Update glass-types admin page to read-only catalog
**File**: `src/app/(dashboard)/admin/glass-types/page.tsx`

**Description**:
Modify page to display read-only catalog:
- Remove "Create Glass Type" button
- Display banner: "Glass types are now standardized. Contact support for custom requests."
- Show seed version info (e.g., "Catalog version: 1.0")

**Dependencies**: TK-015-030

**Acceptance Criteria**:
- [ ] No create button visible
- [ ] Banner explains read-only mode
- [ ] Seed version displayed
- [ ] Page loads without errors

---

### TK-015-032 [P1] [US1] Update glass-type-table component to remove actions
**File**: `src/app/(dashboard)/admin/glass-types/_components/glass-type-table.tsx`

**Description**:
Remove edit/delete action buttons:
- Remove "Edit" button from table rows
- Remove "Delete" button from table rows
- Add "View Details" button (opens read-only modal)

**Dependencies**: TK-015-031

**Acceptance Criteria**:
- [ ] No edit/delete buttons visible
- [ ] View Details modal shows all specs
- [ ] Modal is read-only (no form fields)

---

### TK-015-033 [P1] [US1] Create glass-type-details modal component
**File**: `src/app/(dashboard)/admin/glass-types/_components/glass-type-details.tsx`

**Description**:
Create read-only modal to display glass type details:
- Show all technical specs (U-value, SHGC, transmission)
- Show manufacturer info (series, code)
- Show linked solutions
- Show seed version and last review date

**Dependencies**: TK-015-032

**Acceptance Criteria**:
- [ ] Modal displays all fields
- [ ] Technical specs formatted correctly (units shown)
- [ ] Solutions displayed as badges
- [ ] No form fields or edit actions

---

### TK-015-034 [P1] [US1] Update glass-type list filters to include series/manufacturer
**File**: `src/app/(dashboard)/admin/glass-types/_components/glass-type-filters.tsx`

**Description**:
Add new filter options:
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

## Phase 5: US2 - Universal Glass Solutions (P1)

**User Story**: US2 - As a seller creating quotes, I can select from predefined glass solutions (solar control, energy efficiency, security, etc.) that are linked to compatible glass types, so that I can quickly find the right glass for my client's needs without technical expertise.

### TK-015-035 [P1] [US2] Block create endpoint in glass-solution tRPC router
**File**: `src/server/api/routers/admin/glass-solution.ts`

**Description**:
Remove or disable `create` procedure:
- Throw `TRPCError` with code `FORBIDDEN`
- Return Spanish error message
- Log blocked attempts

**Dependencies**: TK-015-016 (seed data must exist)

**Acceptance Criteria**:
- [ ] `create` procedure returns 403 Forbidden
- [ ] Error message in Spanish
- [ ] Blocked attempts logged

---

### TK-015-036 [P1] [US2] Block update endpoint in glass-solution tRPC router
**File**: `src/server/api/routers/admin/glass-solution.ts`

**Description**:
Remove or disable `update` procedure:
- Throw `TRPCError` with code `FORBIDDEN`
- Return Spanish error message
- Log blocked attempts

**Dependencies**: TK-015-035

**Acceptance Criteria**:
- [ ] `update` procedure returns 403 Forbidden
- [ ] Error handling consistent

---

### TK-015-037 [P1] [US2] Block delete endpoint in glass-solution tRPC router
**File**: `src/server/api/routers/admin/glass-solution.ts`

**Description**:
Remove or disable `delete` procedure:
- Throw `TRPCError` with code `FORBIDDEN`
- Return Spanish error message
- Log blocked attempts

**Dependencies**: TK-015-035

**Acceptance Criteria**:
- [ ] `delete` procedure returns 403 Forbidden
- [ ] Error handling consistent

---

### TK-015-038 [P1] [US2] Keep list endpoint in glass-solution tRPC router (read-only)
**File**: `src/server/api/routers/admin/glass-solution.ts`

**Description**:
Modify `list` procedure to filter solutions:
- Add `isSeeded` filter (show only seeded solutions by default)
- Add search by name/nameEs/description
- Add sort by `sortOrder`

**Dependencies**: TK-015-035

**Acceptance Criteria**:
- [ ] List shows only seeded solutions by default
- [ ] Search works for both English and Spanish names
- [ ] Solutions sorted by sortOrder

---

### TK-015-039 [P1] [US2] Update glass-solutions admin page to read-only catalog
**File**: `src/app/(dashboard)/admin/glass-solutions/page.tsx`

**Description**:
Modify page to display read-only catalog:
- Remove "Create Solution" button
- Display banner explaining read-only mode
- Show seed version info

**Dependencies**: TK-015-038

**Acceptance Criteria**:
- [ ] No create button visible
- [ ] Banner displayed
- [ ] Seed version shown

---

### TK-015-040 [P1] [US2] Update glass-solution-list component to remove actions
**File**: `src/app/(dashboard)/admin/glass-solutions/_components/glass-solution-list.tsx`

**Description**:
Remove CRUD action buttons:
- Remove "Edit" button
- Remove "Delete" button
- Add "View Details" button

**Dependencies**: TK-015-039

**Acceptance Criteria**:
- [ ] No edit/delete buttons visible
- [ ] View Details modal functional

---

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

**Last Updated**: 2025-01-21  
**Next Review**: After MVP completion (end of Week 2)
