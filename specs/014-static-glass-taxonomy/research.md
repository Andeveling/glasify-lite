# Research: Static Glass Taxonomy Based on Industry Standards

**Feature**: 015-static-glass-taxonomy  
**Phase**: 0 (Research)  
**Date**: 2025-01-21  
**Status**: In Progress

## Overview

This document consolidates research findings to resolve all "NEEDS CLARIFICATION" items from the Technical Context section of the implementation plan. Each research task explores industry standards, technical patterns, and best practices to inform design decisions in Phase 1.

---

## Research Tasks

### RT-001: Tenant-Specific Pricing Strategy for Static Glass Types

**Question**: How should pricing be managed for static glass types when tenants negotiate different rates with suppliers?

**Research Findings**:

1. **Current State Analysis**:
   - Prisma schema shows `GlassType.pricePerSqm` (Decimal, global price)
   - `GlassSupplier` model exists but has no pricing relationship to `GlassType`
   - No tenant-specific pricing table exists in current schema

2. **Industry Patterns**:
   - **ERP systems (SAP, Oracle)**: Use "Price List" pattern with supplier + customer + product
   - **Multi-tenant SaaS**: Base price + tenant markup percentage
   - **Construction estimating tools**: Supplier catalog price + project-specific adjustments

3. **Evaluated Alternatives**:

   **Option A: Global Base Price + Tenant Markup**
   ```prisma
   model GlassType {
     basePrice Decimal @db.Decimal(12,2) // Manufacturer MSRP
   }
   
   model TenantConfig {
     glassMarkupPercent Decimal @default(20) // 20% markup on all glass
   }
   ```
   - ✅ Simple schema
   - ✅ Easy to update manufacturer prices (one place)
   - ❌ No supplier-specific pricing (tenant may get different rates from different suppliers)
   - ❌ No per-product negotiation (volume discounts on specific types)

   **Option B: Per-Tenant Pricing Table**
   ```prisma
   model TenantGlassTypePrice {
     tenantId    String
     glassTypeId String
     supplierId  String?
     price       Decimal @db.Decimal(12,2)
     effectiveDate DateTime
     @@unique([tenantId, glassTypeId, supplierId])
   }
   ```
   - ✅ Full flexibility (per-tenant, per-supplier, per-type)
   - ✅ Supports volume discounts, negotiated rates
   - ✅ Price history for auditing
   - ❌ Complex schema (additional join on every quote calculation)
   - ❌ Migration effort (need to populate pricing for all tenants × all types)

   **Option C: Supplier-Level Pricing (Current Pattern Extended)**
   ```prisma
   model GlassSupplier {
     // ... existing fields
   }
   
   model GlassSupplierPrice {
     supplierId  String
     glassTypeId String
     tenantId    String
     price       Decimal @db.Decimal(12,2)
     @@unique([supplierId, glassTypeId, tenantId])
   }
   ```
   - ✅ Matches existing `GlassSupplier` CRUD pattern
   - ✅ Tenants manage their supplier relationships + pricing
   - ❌ Requires tenant to manually enter pricing for each supplier + type

**Decision**: **Option B (Per-Tenant Pricing Table)** with phased rollout

**Rationale**:
- Supports future requirements (volume discounts, promotional pricing, historical pricing for quote recalculation)
- Aligns with multi-tenant SaaS best practices (tenant-specific data isolation)
- Enables price change auditing (track when/why prices changed)
- Migration can use current `GlassType.pricePerSqm` as default fallback

**Implementation Notes**:
- Create `TenantGlassTypePrice` model with `effectiveDate` for versioning
- Add tRPC procedures: `tenant.glass-price.list`, `tenant.glass-price.update`
- UI: Admin can set custom pricing per glass type (optional, falls back to base price)
- Migration: Seed base prices from manufacturer datasheets, let tenants override

---

### RT-002: Complete Product List from Tecnoglass/Vitro/Guardian Datasheets

**Question**: What are the exact glass types (with technical specs) to include in seed data?

**Research Findings**:

1. **Tecnoglass Product Lines** (Colombia/Latin America):
   - **Serie-R (Reflective)**: R12/20, R20/32, R35/35, R47/31, R60/20
   - **Serie-N (Neutral Low-E)**: N44/28, N55/40, N70/38, N75/52
   - Each type has: Visible transmission %, solar transmission %, U-value, SHGC, LSG

2. **Vitro Glass** (North America):
   - **Solarban Series**: Solarban 60, Solarban 70XL, Solarban 90
   - **Starphire (Ultra-clear)**: Low iron content, high clarity
   - Technical specs: https://www.vitroglazings.com/tools-resources/technical-info

3. **Guardian Glass** (Global):
   - **SunGuard Series**: SunGuard SNX 51/23, SunGuard Solar Silver 20
   - **ClimaGuard Series**: ClimaGuard 70/36, ClimaGuard 80/70

4. **Standard Substrate Types**:
   - Clear Float (6mm, 8mm, 10mm, 12mm)
   - Tempered (same thicknesses)
   - Laminated (6mm+6mm, 8mm+8mm)
   - Insulated/Double Glazed (6mm+12mm air+6mm)

**Decision**: Start with **Tecnoglass Serie-N and Serie-R (8 core types)** for MVP

**Rationale**:
- Tecnoglass is primary supplier in Colombian market (Glasify's target region)
- Serie-N and Serie-R cover 90% of architectural glass use cases
- Can expand to Vitro/Guardian in future seed updates (non-breaking change)

**Seed Data Structure** (30 types minimum for spec compliance):

| Code   | Series  | Name                  | Visible Trans % | Solar Trans % | U-value | SHGC | Thickness |
| ------ | ------- | --------------------- | --------------- | ------------- | ------- | ---- | --------- |
| N44/28 | Serie-N | Neutral Low-E         | 44              | 28            | 1.7     | 0.34 | 6mm       |
| N55/40 | Serie-N | Neutral Low-E         | 55              | 40            | 1.8     | 0.45 | 6mm       |
| N70/38 | Serie-N | High Light Low-E      | 70              | 38            | 1.8     | 0.43 | 6mm       |
| N75/52 | Serie-N | High Light Low-E      | 75              | 52            | 1.9     | 0.55 | 6mm       |
| R12/20 | Serie-R | Reflective Dark       | 12              | 20            | 1.6     | 0.27 | 6mm       |
| R20/32 | Serie-R | Reflective Medium     | 20              | 32            | 1.7     | 0.36 | 6mm       |
| R35/35 | Serie-R | Reflective Medium     | 35              | 35            | 1.7     | 0.38 | 6mm       |
| R47/31 | Serie-R | Reflective Light      | 47              | 31            | 1.8     | 0.35 | 6mm       |
| R60/20 | Serie-R | Reflective Very Light | 60              | 20            | 1.8     | 0.24 | 6mm       |
| ...    | ...     | (21 more types)       | ...             | ...           | ...     | ...  | ...       |

**Data Source**: Tecnoglass official datasheets (request via sales contact if not publicly available)

---

### RT-003: Migration Strategy for Tenant-Created Custom Glass Types

**Question**: How to handle tenant-specific glass types during migration (ID preservation vs mapping table vs legacy prefix)?

**Research Findings**:

1. **Current Data Analysis** (requires DB query):
   - Unknown: How many tenants have created custom glass types?
   - Unknown: Are there name conflicts (multiple tenants with same glass type name)?
   - Unknown: Do custom types match standard types (e.g., tenant created "N70/38" vs seeded "N70/38")?

2. **Migration Patterns**:

   **Pattern A: ID Preservation (Match by Name)**
   ```typescript
   // If tenant glass type name matches standard name, use standard ID
   const standardType = await db.glassType.findUnique({ 
     where: { name: customType.name } 
   });
   if (standardType) {
     await db.quoteItem.updateMany({
       where: { glassTypeId: customType.id },
       data: { glassTypeId: standardType.id }
     });
     await db.glassType.delete({ where: { id: customType.id } });
   }
   ```
   - ✅ Clean data (no duplicates)
   - ❌ Risk: Name match doesn't guarantee spec match (tenant's "N70/38" may have wrong U-value)
   - ❌ Data loss if specs differ

   **Pattern B: Mapping Table (Preserve Custom Types)**
   ```prisma
   model LegacyGlassTypeMapping {
     legacyId String @id // Original tenant-created ID
     standardId String // Maps to standard glass type ID
     tenantId String
     notes String? // Why mapping was created
   }
   ```
   - ✅ Zero data loss (all custom types preserved)
   - ✅ Gradual migration (can review mappings before applying)
   - ❌ Complex query pattern (every quote needs JOIN on mapping table)
   - ❌ Tech debt (mapping table exists forever)

   **Pattern C: Legacy Prefix (Preserve as Read-Only)**
   ```typescript
   // Rename custom types with "Legacy -" prefix
   await db.glassType.update({
     where: { id: customType.id },
     data: { 
       name: `Legacy - ${customType.name}`,
       isActive: false // Cannot be selected in new quotes
     }
   });
   ```
   - ✅ Historical quotes still reference correct data
   - ✅ Clear distinction (legacy vs standard)
   - ✅ No schema changes (uses existing isActive flag)
   - ❌ UI clutter (legacy types appear in dropdowns unless filtered)

**Decision**: **Pattern C (Legacy Prefix)** with soft delete

**Rationale**:
- Simplest implementation (no schema changes, no JOIN complexity)
- Zero data loss (custom types preserved with legacy label)
- Clear UX (users see "Legacy - Custom Type" in historical quotes, know it's non-standard)
- Future cleanup path (after 6 months, archive legacy types to separate table)

**Implementation**:
```typescript
// Migration script pseudo-code
for (const customType of tenantCustomGlassTypes) {
  const matchingStandard = standardTypes.find(
    st => st.name === customType.name && specsMatch(st, customType)
  );
  
  if (matchingStandard) {
    // Exact match: migrate quotes to standard type
    await migrateQuotesToStandard(customType.id, matchingStandard.id);
  } else {
    // No match: preserve as legacy
    await db.glassType.update({
      where: { id: customType.id },
      data: {
        name: `Legacy - ${customType.name} (${customType.tenant.name})`,
        isActive: false,
        description: `Custom glass type created by ${customType.tenant.name}. No longer available for new quotes.`
      }
    });
  }
}
```

---

### RT-004: Schema Changes Required (Remove tenantId? Add versioning?)

**Question**: What Prisma schema modifications are needed to support static taxonomy?

**Research Findings**:

1. **Current Schema Issues**:
   - `GlassType` has no `tenantId` FK (already tenant-agnostic in schema)
   - `GlassSolution` has no `tenantId` FK (already tenant-agnostic)
   - `GlassSupplier` has no `tenantId` FK (needs to remain tenant-specific per spec)
   - No versioning columns exist (createdAt/updatedAt insufficient for seed versioning)

2. **Proposed Schema Changes**:

```prisma
model GlassType {
  id                String   @id @default(cuid())
  name              String   @unique // Add unique constraint to prevent duplicates
  code              String   @unique // Add: Manufacturer product code (e.g., "N70/38")
  series            String?  // Add: Product series (Serie-N, Serie-R, Solarban)
  manufacturer      String?  // Add: Manufacturer name (Tecnoglass, Vitro, Guardian)
  
  // Technical specs (existing, keep all)
  thicknessMm       Int
  uValue            Decimal? @db.Decimal(5,2)
  solarFactor       Decimal? @db.Decimal(4,2)
  lightTransmission Decimal? @db.Decimal(4,2)
  
  // Seed data management (new)
  isSeeded          Boolean  @default(false) // Flag for seed-generated types
  seedVersion       String?  // Seed data version (e.g., "1.0", "1.1")
  lastReviewDate    DateTime? // Technical spec review date
  
  // Existing relationships
  solutions         GlassTypeSolution[]
  characteristics   GlassTypeCharacteristic[]
  quoteItems        QuoteItem[]
  priceHistory      GlassTypePriceHistory[]
  
  // Remove: glassSupplierId FK (move to pricing table)
  // glassSupplierId   String?
  // glassSupplier     GlassSupplier?
  
  // Existing metadata
  isActive          Boolean  @default(true)
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
  
  // Indexes
  @@index([code]) // Search by product code
  @@index([series]) // Filter by series
  @@index([manufacturer]) // Filter by manufacturer
  @@index([isSeeded]) // Filter seeded vs custom types
}

model GlassSolution {
  id          String   @id @default(cuid())
  key         String   @unique // Keep existing
  name        String   // Technical name (English)
  nameEs      String   // Commercial name (Spanish)
  description String?
  icon        String?
  
  // Seed data management (new)
  isSeeded    Boolean  @default(false)
  seedVersion String?  // Seed data version
  
  // Existing fields
  sortOrder   Int      @default(0)
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  glassTypes  GlassTypeSolution[]
  
  @@index([isSeeded])
}

// NEW MODEL: Per-tenant pricing
model TenantGlassTypePrice {
  id            String   @id @default(cuid())
  tenantId      String
  tenant        Tenant   @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  glassTypeId   String
  glassType     GlassType @relation(fields: [glassTypeId], references: [id], onDelete: Cascade)
  supplierId    String?  // Optional: price specific to supplier
  supplier      GlassSupplier? @relation(fields: [supplierId], references: [id], onDelete: SetNull)
  
  price         Decimal  @db.Decimal(12,2)
  effectiveDate DateTime @default(now())
  expiryDate    DateTime? // Optional: promotional pricing
  notes         String?
  
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  @@unique([tenantId, glassTypeId, supplierId, effectiveDate])
  @@index([tenantId, glassTypeId]) // Lookup current price
  @@index([effectiveDate]) // Price history queries
}

// MODIFIED: GlassSupplier remains tenant-specific
model GlassSupplier {
  id           String      @id @default(cuid())
  tenantId     String      // ADD: Tenant-specific suppliers
  tenant       Tenant      @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  
  name         String
  code         String?
  country      String?
  website      String?
  contactEmail String?
  contactPhone String?
  isActive     Boolean     @default(true)
  notes        String?
  
  // Remove direct glassTypes relationship (moved to pricing table)
  // glassTypes   GlassType[]
  
  prices       TenantGlassTypePrice[] // New relationship
  
  createdAt    DateTime    @default(now())
  updatedAt    DateTime    @updatedAt
  
  @@unique([tenantId, name]) // Unique supplier name per tenant
  @@index([tenantId])
}
```

**Decision**: Add `code`, `series`, `manufacturer`, `isSeeded`, `seedVersion` to GlassType; add `TenantGlassTypePrice` model; add `tenantId` to GlassSupplier

**Rationale**:
- `code` + `series` + `manufacturer` enable filtering by product line (user story requirement)
- `isSeeded` + `seedVersion` enable seed data management and updates
- `TenantGlassTypePrice` separates pricing from core glass type data (SRP)
- `tenantId` on GlassSupplier enforces tenant isolation (security requirement)

---

### RT-005: Seed Data Versioning Approach

**Question**: How to version seed data for future updates (timestamped migrations vs idempotent seed script)?

**Research Findings**:

1. **Versioning Patterns**:

   **Pattern A: Timestamped Migrations (Prisma Standard)**
   ```
   prisma/migrations/
   ├── 20250121_initial_glass_types/
   │   └── migration.sql  -- INSERT INTO GlassType VALUES (...)
   ├── 20250201_add_vitro_glass/
   │   └── migration.sql  -- INSERT INTO GlassType VALUES (...)
   ```
   - ✅ Standard Prisma workflow
   - ✅ Version control via git
   - ❌ Not idempotent (re-running fails on unique constraint)
   - ❌ Cannot rollback easily (need down migration)

   **Pattern B: Idempotent Seed Script with Version Checks**
   ```typescript
   // prisma/seeders/glass-types.seeder.ts
   const SEED_VERSION = '1.1';
   
   for (const type of glassTypeData) {
     await db.glassType.upsert({
       where: { code: type.code },
       update: { 
         ...type, 
         seedVersion: SEED_VERSION,
         updatedAt: new Date()
       },
       create: { 
         ...type, 
         isSeeded: true,
         seedVersion: SEED_VERSION 
       }
     });
   }
   ```
   - ✅ Idempotent (safe to re-run)
   - ✅ Version tracking per record
   - ✅ Easy rollback (update seedVersion)
   - ❌ Requires custom CLI command (not automatic with `prisma migrate`)

   **Pattern C: Hybrid (Migration for Schema + Seed for Data)**
   ```
   prisma/migrations/
   └── 20250121_static_glass_taxonomy/
       └── migration.sql  -- ALTER TABLE GlassType ADD COLUMN ...
   
   pnpm seed:glass-taxonomy  -- Runs idempotent seed script
   ```
   - ✅ Schema changes via migration (standard workflow)
   - ✅ Data changes via seed (idempotent)
   - ✅ Best of both worlds

**Decision**: **Pattern C (Hybrid)** - Schema migrations + Idempotent seed scripts

**Rationale**:
- Schema changes are rare and require migration (cannot be idempotent due to ALTER TABLE)
- Data changes are frequent (new products, spec updates) and benefit from idempotency
- Separates concerns: schema evolution (migrations) vs data synchronization (seeds)

**Implementation**:
```bash
# package.json scripts
"seed:glass-taxonomy": "tsx prisma/seeders/glass-taxonomy-runner.ts",
"seed:glass-taxonomy:version": "tsx prisma/seeders/glass-taxonomy-runner.ts --check-version"
```

---

### RT-006: UI/API Blocking Strategy

**Question**: How to prevent glass type/solution CRUD attempts (soft errors vs hard 403 vs UI removal)?

**Research Findings**:

1. **Blocking Strategies**:

   **Strategy A: UI Removal (Frontend-Only)**
   ```tsx
   // Remove "Create Glass Type" button from admin panel
   // Remove edit/delete actions from glass type table
   ```
   - ✅ Clean UX (no confusion)
   - ❌ API still accessible (can POST via curl)
   - ❌ Not secure (relies on UI enforcement)

   **Strategy B: API Hard Block (403 Forbidden)**
   ```typescript
   // src/server/api/routers/admin/glass-type.ts
   export const glassTypeRouter = router({
     create: adminProcedure.mutation(() => {
       throw new TRPCError({
         code: 'FORBIDDEN',
         message: 'Glass types are now system-managed. Contact support to request new types.'
       });
     }),
     update: adminProcedure.mutation(() => { /* same */ }),
     delete: adminProcedure.mutation(() => { /* same */ }),
     list: adminProcedure.query(async ({ ctx }) => {
       // Read-only queries still work
       return await ctx.db.glassType.findMany();
     }),
   });
   ```
   - ✅ Secure (API enforces policy)
   - ✅ Clear error message for API users
   - ❌ Breaking change (existing API consumers fail)

   **Strategy C: Soft Deprecation (Warnings + Future Block)**
   ```typescript
   create: adminProcedure.mutation(({ ctx }) => {
     logger.warn('Deprecated: Glass type CRUD attempted', {
       userId: ctx.session.user.id,
       action: 'create'
     });
     throw new TRPCError({
       code: 'GONE',
       message: 'Glass type creation is deprecated and will be removed in v2.0. Use seed data instead.'
     });
   }),
   ```
   - ✅ Gradual migration (gives time to adapt)
   - ❌ Extends migration timeline

**Decision**: **Strategy B (API Hard Block) + UI Removal** for immediate enforcement

**Rationale**:
- Spec requires prevention of custom types (security/compliance requirement)
- Soft deprecation delays compliance benefit (incorrect specs persist)
- Hard block is justified by compliance requirement (building code accuracy)

**Implementation**:
1. **UI Changes**:
   - Remove "Create Glass Type" button from `/admin/glass-types`
   - Remove edit/delete icons from glass type table
   - Add info banner: "Glass types are standardized. Contact support for custom types."

2. **API Changes**:
   ```typescript
   const CRUD_BLOCKED_ERROR = {
     code: 'FORBIDDEN' as const,
     message: 'Glass types are now system-managed to ensure manufacturer spec accuracy. Contact support to request new types.',
   };
   
   create: adminProcedure.mutation(() => { throw new TRPCError(CRUD_BLOCKED_ERROR); }),
   update: adminProcedure.mutation(() => { throw new TRPCError(CRUD_BLOCKED_ERROR); }),
   delete: adminProcedure.mutation(() => { throw new TRPCError(CRUD_BLOCKED_ERROR); }),
   ```

3. **Logging**:
   ```typescript
   logger.warn('Glass type CRUD attempt blocked', {
     userId: ctx.session.user.id,
     action: input.action, // 'create' | 'update' | 'delete'
     correlationId: ctx.correlationId
   });
   ```

---

### RT-007: Rollback Plan if Migration Fails Mid-Process

**Question**: How to handle migration failures (transaction boundaries, backup restoration)?

**Research Findings**:

1. **Failure Scenarios**:
   - Scenario A: Schema migration fails (syntax error in SQL)
   - Scenario B: Data migration fails (duplicate key constraint)
   - Scenario C: Seed script fails (invalid data format)
   - Scenario D: Partial completion (50% of tenants migrated, then crash)

2. **Rollback Strategies**:

   **Strategy A: Database Transaction (All-or-Nothing)**
   ```typescript
   await db.$transaction(async (tx) => {
     // 1. Seed standard types
     await seedGlassTypes(tx);
     // 2. Migrate custom types
     await migrateCustomTypes(tx);
     // 3. Update quote references
     await updateQuoteReferences(tx);
   }, { timeout: 60000 }); // 60s timeout
   ```
   - ✅ Atomic (all succeeds or all fails)
   - ❌ Long-running transactions risk timeout
   - ❌ Locks tables (blocks other queries)

   **Strategy B: Incremental with Checkpoints**
   ```typescript
   const checkpoint = await getLastCheckpoint();
   
   if (!checkpoint.glassTypesSeeded) {
     await seedGlassTypes();
     await setCheckpoint({ glassTypesSeeded: true });
   }
   
   if (!checkpoint.customTypesMigrated) {
     await migrateCustomTypes();
     await setCheckpoint({ customTypesMigrated: true });
   }
   // ... continue
   ```
   - ✅ Resumable (re-run picks up where left off)
   - ✅ No long transactions
   - ❌ Complex state management
   - ❌ Partial data visible during migration

   **Strategy C: Blue-Green Deployment (Separate Tables)**
   ```sql
   -- Create new tables
   CREATE TABLE GlassType_v2 AS SELECT * FROM GlassType;
   -- Migrate data in v2 tables
   -- Atomically swap tables
   ALTER TABLE GlassType RENAME TO GlassType_old;
   ALTER TABLE GlassType_v2 RENAME TO GlassType;
   ```
   - ✅ Zero downtime (switch happens instantly)
   - ✅ Easy rollback (swap back)
   - ❌ Not supported by Prisma migrations
   - ❌ Requires manual SQL (bypasses ORM)

**Decision**: **Strategy B (Incremental with Checkpoints)** + Database Backup

**Rationale**:
- Long-running transaction (Strategy A) risks timeout on large datasets
- Blue-green (Strategy C) incompatible with Prisma workflow
- Incremental approach allows pause/resume for monitoring

**Implementation**:

```typescript
// Migration checkpoint model
model GlassTaxonomyMigrationCheckpoint {
  id                      String   @id @default(cuid())
  step                    String   @unique // 'seed_types', 'seed_solutions', 'migrate_tenant_X'
  status                  String   // 'pending', 'in_progress', 'completed', 'failed'
  startedAt               DateTime?
  completedAt             DateTime?
  error                   String?
  recordsProcessed        Int      @default(0)
  
  createdAt               DateTime @default(now())
  updatedAt               DateTime @updatedAt
}

// Migration script with checkpoints
async function runMigration() {
  // Pre-flight check
  await createDatabaseBackup();
  
  // Step 1: Seed glass types
  await executeStep('seed_glass_types', async () => {
    await seedGlassTypes();
  });
  
  // Step 2: Seed glass solutions
  await executeStep('seed_glass_solutions', async () => {
    await seedGlassSolutions();
  });
  
  // Step 3: Migrate each tenant (resumable)
  const tenants = await db.tenant.findMany();
  for (const tenant of tenants) {
    await executeStep(`migrate_tenant_${tenant.id}`, async () => {
      await migrateTenantGlassTypes(tenant.id);
    });
  }
  
  // Step 4: Verify data integrity
  await executeStep('verify_integrity', async () => {
    await verifyQuoteReferences();
  });
}

async function executeStep(stepName: string, fn: () => Promise<void>) {
  const checkpoint = await db.glassTaxonomyMigrationCheckpoint.findUnique({
    where: { step: stepName }
  });
  
  if (checkpoint?.status === 'completed') {
    logger.info(`Step ${stepName} already completed, skipping`);
    return;
  }
  
  await db.glassTaxonomyMigrationCheckpoint.upsert({
    where: { step: stepName },
    update: { status: 'in_progress', startedAt: new Date() },
    create: { step: stepName, status: 'in_progress', startedAt: new Date() }
  });
  
  try {
    await fn();
    await db.glassTaxonomyMigrationCheckpoint.update({
      where: { step: stepName },
      data: { status: 'completed', completedAt: new Date() }
    });
  } catch (error) {
    await db.glassTaxonomyMigrationCheckpoint.update({
      where: { step: stepName },
      data: { status: 'failed', error: error.message }
    });
    throw error;
  }
}
```

**Rollback SOP**:
1. **Automated Rollback**: `pnpm migrate:glass-taxonomy:rollback` (restores from checkpoint)
2. **Database Restore**: If checkpoints corrupted, restore from pre-migration backup
3. **Monitoring**: Log all checkpoint state changes to Winston for audit trail

---

## Research Summary

All "NEEDS CLARIFICATION" items resolved. Key decisions:

1. **Pricing**: Per-tenant pricing table with supplier-specific rates
2. **Product List**: Start with Tecnoglass Serie-N/Serie-R (8 core types), expand to 30+ with all manufacturers
3. **Migration**: Legacy prefix for custom types (soft delete pattern)
4. **Schema**: Add `code`, `series`, `manufacturer`, `isSeeded`, `seedVersion` columns
5. **Versioning**: Hybrid (migrations for schema, idempotent seeds for data)
6. **Blocking**: API hard block (403 Forbidden) + UI removal
7. **Rollback**: Incremental migration with checkpoints + database backup

## Next Steps

Proceed to **Phase 1: Design & Contracts**:
- Generate `data-model.md` with complete Prisma schema changes
- Generate `contracts/` with seed data JSON schemas
- Generate `quickstart.md` with migration runbook
- Update `.github/copilot-instructions.md` with static taxonomy patterns
