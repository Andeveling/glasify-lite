# Seed Orchestrator Migration Plan - Prisma → Drizzle

**Date**: 2025-11-09  
**Status**: Planning  
**Related**: Phase 2-3 Complete (ProfileSupplier + GlassSupplier seeders ready)

## Current State Analysis

### Existing Architecture (Prisma-Based)

**File**: `/prisma/seeders/seed-orchestrator.ts` (761 lines)

**Structure**:
```typescript
SeedOrchestrator class {
  - Uses PrismaClient directly
  - Uses old Prisma factories (createProfileSupplier, createGlassType, etc.)
  - Pattern: Validate with factory → Upsert with Prisma
  - Methods:
    * seedProfileSuppliers(): Map<name, id>
    * seedGlassTypes(): Map<code, id>
    * seedModels(): void
    * seedServices(): void
    * seedGlassSolutions(): Map<key, id>
    * assignSolutionsToGlassTypes(): void
}
```

**Current Flow**:
```
1. cleanDatabase() - Delete all data (Prisma deleteMany)
2. seedTenant() - TenantConfig singleton
3. seedProfileSuppliers() - Factory validation + Prisma upsert
4. seedGlassTypes() - Factory validation + Prisma upsert
5. seedModels() - Factory validation + Prisma upsert (needs suppliers + glass types)
6. seedServices() - Factory validation + Prisma upsert
7. seedGlassSolutions() - Factory validation + Prisma upsert
8. assignSolutionsToGlassTypes() - Create junction records
```

**Issues**:
- ❌ Tightly coupled to Prisma Client
- ❌ Uses old factory pattern (returns `{success, data, errors}`)
- ❌ No use of new Drizzle seeders (BaseSeeder pattern)
- ❌ Missing GlassSupplier support
- ❌ No batch processing optimization
- ❌ Manual upsert logic repeated across methods

### New Architecture (Drizzle-Based)

**Available Seeders**:
- ✅ ProfileSupplierSeeder (Phase 2)
- ✅ GlassSupplierSeeder (Phase 3)

**Pattern**:
```typescript
XyzSeeder extends BaseSeeder<T> {
  insertBatch(data: T[]): Promise<number>
  upsert(data: T[], options?): Promise<SeederResult>
  clear(): Promise<number>
  clearInactive(): Promise<number>
}
```

**Benefits**:
- ✅ ORM-agnostic (can swap Drizzle/Prisma)
- ✅ Consistent batch processing
- ✅ Detailed SeederResult with inserted/updated/failed counts
- ✅ Testable (interfaces, dependency injection)
- ✅ Error handling built-in

## Migration Strategy

### Option A: Hybrid Approach (Phased Migration) ⭐ RECOMMENDED

**Phase 1**: Add GlassSupplier support with Prisma (quick win)
- Add `glassSuppliers?: GlassSupplierInput[]` to `SeedPreset`
- Create `seedGlassSuppliers()` method using Prisma
- Update presets to include glass suppliers
- **Timeline**: 1-2 hours
- **Risk**: Low (no breaking changes)

**Phase 2**: Migrate ProfileSupplier to new seeder
- Replace `seedProfileSuppliers()` logic with ProfileSupplierSeeder
- Test with minimal + vitro-rojas presets
- **Timeline**: 2-3 hours
- **Risk**: Medium (first migration, pattern validation)

**Phase 3**: Migrate GlassSupplier to new seeder
- Replace `seedGlassSuppliers()` logic with GlassSupplierSeeder
- **Timeline**: 1-2 hours
- **Risk**: Low (pattern established)

**Phase 4+**: Migrate remaining entities as seeders are created
- GlassType, Service, Model, GlassSolution (Phases 4-8)

### Option B: Full Rewrite (All at Once)

**Approach**: Rewrite entire orchestrator to use Drizzle + new seeders
- **Pros**: Clean slate, no technical debt
- **Cons**: High risk, blocks preset work, no MVP delivery
- **Timeline**: 8-12 hours
- **NOT RECOMMENDED**: User wants "enfoquemosnos en terminar los seeders con presets"

## Recommended Implementation: Option A - Phase 1

### Task Breakdown

#### Task 1: Update Type Definitions
**File**: `/prisma/seeders/seed-orchestrator.ts`

```typescript
// Add to imports
import type { GlassSupplierInput } from "../factories/glass-supplier.factory";

// Update SeedPreset type
export type SeedPreset = {
  name: string;
  description: string;
  glassTypes: GlassTypeInput[];
  glassSuppliers?: GlassSupplierInput[]; // NEW
  profileSuppliers: ProfileSupplierInput[];
  models: ModelInput[];
  services: ServiceInput[];
  glassSolutions: GlassSolutionInput[];
  glassTypeSolutionMappings?: GlassTypeSolutionMapping[];
};

// Update SeedStats type
export type SeedStats = {
  glassTypes: { created: number; failed: number };
  glassSuppliers: { created: number; failed: number }; // NEW
  profileSuppliers: { created: number; failed: number };
  models: { created: number; failed: number };
  services: { created: number; failed: number };
  glassSolutions: { created: number; failed: number };
  glassTypeSolutions: { created: number; failed: number };
  totalCreated: number;
  totalFailed: number;
  durationMs: number;
};
```

#### Task 2: Add seedGlassSuppliers() Method
**File**: `/prisma/seeders/seed-orchestrator.ts`

```typescript
/**
 * Seed glass suppliers
 */
private async seedGlassSuppliers(
  suppliers: GlassSupplierInput[]
): Promise<Map<string, string>> {
  const supplierIdMap = new Map<string, string>();

  this.logger.info(`Seeding ${suppliers.length} glass suppliers...`);

  for (const supplierInput of suppliers) {
    try {
      const result = createGlassSupplier(supplierInput, {
        skipValidation: this.options.skipValidation,
      });

      if (!(result.success && result.data)) {
        this.handleValidationErrors(supplierInput.name, result.errors);
        this.stats.glassSuppliers.failed++;
        if (!this.options.continueOnError) {
          throw new Error("Validation failed");
        }
        continue;
      }

      // Check if supplier already exists
      const existing = await this.prisma.glassSupplier.findUnique({
        where: { name: result.data.name },
      });

      // Create or update
      const supplier = existing
        ? await this.prisma.glassSupplier.update({
            data: result.data,
            where: { id: existing.id },
          })
        : await this.prisma.glassSupplier.create({
            data: result.data,
          });

      supplierIdMap.set(supplier.name, supplier.id);
      this.stats.glassSuppliers.created++;
      this.logger.debug(`Created: ${supplier.name} (${supplier.id})`);
    } catch (error) {
      this.logger.error(
        `Failed to create glass supplier: ${supplierInput.name}`,
        error
      );
      this.stats.glassSuppliers.failed++;
      if (!this.options.continueOnError) {
        throw error;
      }
    }
  }

  this.logger.success(
    `Glass suppliers: ${this.stats.glassSuppliers.created} created, ${this.stats.glassSuppliers.failed} failed`
  );

  return supplierIdMap;
}
```

#### Task 3: Integrate into seedWithPreset() Flow
**File**: `/prisma/seeders/seed-orchestrator.ts`

Add after Step 1 (Profile Suppliers):
```typescript
// Step 1.5: Seed glass suppliers (if provided, no dependencies)
if (preset.glassSuppliers && preset.glassSuppliers.length > 0) {
  this.logger.section("Step 2.5/8: Glass Suppliers");
  await this.seedGlassSuppliers(preset.glassSuppliers);
}
```

#### Task 4: Update Stats Initialization
**File**: `/prisma/seeders/seed-orchestrator.ts`

```typescript
this.stats = {
  durationMs: 0,
  glassSolutions: { created: 0, failed: 0 },
  glassTypeSolutions: { created: 0, failed: 0 },
  glassTypes: { created: 0, failed: 0 },
  glassSuppliers: { created: 0, failed: 0 }, // NEW
  models: { created: 0, failed: 0 },
  profileSuppliers: { created: 0, failed: 0 },
  services: { created: 0, failed: 0 },
  totalCreated: 0,
  totalFailed: 0,
};
```

#### Task 5: Update Stats Calculation
**File**: `/prisma/seeders/seed-orchestrator.ts`

```typescript
this.stats.totalCreated =
  this.stats.glassTypes.created +
  this.stats.glassSuppliers.created + // NEW
  this.stats.profileSuppliers.created +
  this.stats.models.created +
  this.stats.services.created +
  this.stats.glassSolutions.created +
  this.stats.glassTypeSolutions.created;

this.stats.totalFailed =
  this.stats.glassTypes.failed +
  this.stats.glassSuppliers.failed + // NEW
  this.stats.profileSuppliers.failed +
  this.stats.models.failed +
  this.stats.services.failed +
  this.stats.glassSolutions.failed +
  this.stats.glassTypeSolutions.failed;
```

#### Task 6: Create GlassSupplier Factory (Prisma) - TEMPORARY
**File**: `/prisma/factories/glass-supplier.factory.ts` (NEW)

This is a temporary Prisma factory to maintain consistency with existing orchestrator pattern. Will be removed in Phase 2-3 migration.

```typescript
import type { Prisma } from "@prisma/client";
import { z } from "zod";

/**
 * Glass Supplier Factory Input
 */
export type GlassSupplierInput = {
  name: string;
  code?: string;
  country?: string;
  website?: string;
  contactEmail?: string;
  contactPhone?: string;
  isActive?: boolean;
  notes?: string;
};

/**
 * Factory result type
 */
export type GlassSupplierFactoryResult = {
  success: boolean;
  data: Prisma.GlassSupplierCreateInput | null;
  errors: Array<{ field: string; message: string }>;
};

/**
 * Validation schema
 */
const glassSupplierSchema = z.object({
  name: z.string().min(1).max(100),
  code: z.string().max(20).optional(),
  country: z.string().max(100).optional(),
  website: z.string().url().optional().or(z.literal("")),
  contactEmail: z.string().email().optional().or(z.literal("")),
  contactPhone: z.string().max(30).optional(),
  isActive: z.boolean().optional(),
  notes: z.string().max(500).optional(),
});

/**
 * Create Glass Supplier with validation
 */
export function createGlassSupplier(
  input: GlassSupplierInput,
  options?: { skipValidation?: boolean }
): GlassSupplierFactoryResult {
  if (!options?.skipValidation) {
    const validation = glassSupplierSchema.safeParse(input);
    if (!validation.success) {
      return {
        success: false,
        data: null,
        errors: validation.error.errors.map((err) => ({
          field: err.path.join("."),
          message: err.message,
        })),
      };
    }
  }

  return {
    success: true,
    data: {
      name: input.name,
      code: input.code ?? null,
      country: input.country ?? null,
      website: input.website ?? null,
      contactEmail: input.contactEmail ?? null,
      contactPhone: input.contactPhone ?? null,
      isActive: input.isActive ?? true,
      notes: input.notes ?? null,
    },
    errors: [],
  };
}
```

#### Task 7: Update Presets with Glass Suppliers

**File**: `/prisma/data/presets/minimal.preset.ts`

Add after profileSuppliers:
```typescript
// ==========================================
// GLASS SUPPLIERS (2 essential)
// ==========================================

/**
 * Essential glass suppliers
 */
export const minimalGlassSuppliers: GlassSupplierInput[] = [
  {
    name: "Vidriera Local",
    isActive: true,
    notes: "Proveedor local de vidrio para desarrollo y pruebas",
  },
  {
    name: "Guardian Glass",
    code: "GRD",
    country: "International",
    website: "https://www.guardianglass.com",
    isActive: true,
    notes: "Proveedor internacional de vidrio de alta calidad",
  },
];

// Update preset export
export const minimalPreset = {
  // ... existing fields
  glassSuppliers: minimalGlassSuppliers,
  stats: {
    // ... existing stats
    glassSuppliers: minimalGlassSuppliers.length,
    total: // ... + minimalGlassSuppliers.length,
  },
} as const;
```

**File**: `/prisma/data/presets/vitro-rojas-panama.preset.ts`

Already has data file, just import:
```typescript
import { vitroRojasGlassSuppliers } from "../vitro-rojas/glass-suppliers.data";

export const vitroRojasPanamaPreset: SeedPreset = {
  // ... existing fields
  glassSuppliers: vitroRojasGlassSuppliers,
};
```

**File**: `/prisma/data/vitro-rojas/glass-suppliers.data.ts`

Update type import:
```typescript
import type { GlassSupplierInput } from "../../factories/glass-supplier.factory";
```

## Testing Plan

### Unit Tests (Optional - Skipped per user directive)
- Test `seedGlassSuppliers()` method in isolation
- Mock Prisma client responses

### Integration Tests
1. **Minimal Preset Test**:
   ```bash
   pnpm seed --preset=minimal
   ```
   - Verify 2 glass suppliers created
   - Check database records
   - Validate stats output

2. **Vitro Rojas Preset Test**:
   ```bash
   pnpm seed --preset=vitro-rojas-panama
   ```
   - Verify 2 glass suppliers created
   - Validate "Vidriera Nacional S.A." and "Guardian Glass Panamá"
   - Check relationships (future: GlassType → GlassSupplier)

### Validation Checklist
- [ ] SeedPreset type includes glassSuppliers
- [ ] SeedStats includes glassSuppliers counters
- [ ] seedGlassSuppliers() method created
- [ ] Integrated into seedWithPreset() flow
- [ ] Stats calculation includes glass suppliers
- [ ] GlassSupplier factory created (temporary Prisma version)
- [ ] minimal.preset.ts includes glass suppliers
- [ ] vitro-rojas-panama.preset.ts imports glass suppliers
- [ ] pnpm seed:minimal runs successfully
- [ ] pnpm seed:vitro-rojas runs successfully
- [ ] Database contains expected glass suppliers

## Future Phases

### Phase 2: Migrate ProfileSupplier to Drizzle Seeder
**When**: After Phase 1 validated
**Changes**:
- Replace `seedProfileSuppliers()` implementation
- Use ProfileSupplierSeeder instead of Prisma + factory
- Pattern for other entities

### Phase 3: Migrate GlassSupplier to Drizzle Seeder
**When**: After Phase 2 validated
**Changes**:
- Replace `seedGlassSuppliers()` implementation
- Use GlassSupplierSeeder instead of Prisma + factory
- Remove temporary Prisma factory

### Phase 4-8: Complete Migration
**When**: As other entity seeders are created
**Entities**: GlassType, Service, Model, GlassSolution, GlassTypeCharacteristic

## Risk Assessment

### Low Risk ✅
- Adding optional field to SeedPreset (backward compatible)
- Adding stats counters (no breaking changes)
- Creating new method (additive change)

### Medium Risk ⚠️
- Factory pattern consistency (need to match existing style)
- Preset data validation (schema compatibility)

### High Risk ❌
- None identified for Phase 1

## Success Criteria

1. ✅ GlassSupplier support added to orchestrator
2. ✅ Both presets include glass suppliers
3. ✅ Seeding runs without errors
4. ✅ Database contains correct glass supplier data
5. ✅ Stats report accurate counts
6. ✅ Zero breaking changes to existing functionality
7. ✅ User can run `pnpm seed:minimal` and `pnpm seed:vitro-rojas` successfully

## Timeline

**Phase 1 (This Session)**:
- Tasks 1-7: 2-3 hours
- Testing: 30 minutes
- Documentation: 15 minutes
- **Total**: ~3 hours

**Ready for**: MVP delivery with working presets
