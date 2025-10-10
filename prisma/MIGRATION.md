# Seed System Migration Guide

## Overview

This guide explains how to migrate from the old monolithic `seed.ts` to the new Factory Pattern-based seeding system.

## Why Migrate?

**Old System Problems:**
- ❌ Hardcoded data mixed with database operations
- ❌ No validation before insertion
- ❌ Difficult to maintain and extend
- ❌ No reusable data patterns
- ❌ Hard to test different scenarios

**New System Benefits:**
- ✅ Type-safe data creation with Zod validation
- ✅ Reusable market data catalogs
- ✅ Multiple preset configurations (minimal, demo, full)
- ✅ CLI for easy preset selection
- ✅ Better error handling and logging
- ✅ Easy to extend with new data

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                   Seed CLI                          │
│                (seed-cli.ts)                        │
│   • Parses command-line arguments                  │
│   • Validates preset selection                     │
│   • Displays help and options                      │
└──────────────────┬──────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────┐
│              Seed Orchestrator                      │
│          (seeders/seed-orchestrator.ts)             │
│   • Coordinates seeding process                    │
│   • Handles entity relationships                   │
│   • Manages transactions                           │
│   • Logs progress and errors                       │
└──────────────────┬──────────────────────────────────┘
                   │
                   ├──────────────────┬──────────────┐
                   ▼                  ▼              ▼
          ┌────────────────┐  ┌──────────┐  ┌──────────┐
          │    Presets     │  │Factories │  │ Catalogs │
          │ (data/presets) │  │(factories)│  │(data/cat)│
          └────────────────┘  └──────────┘  └──────────┘
```

## Step-by-Step Migration

### 1. Understanding the New Structure

```
prisma/
├── data/
│   ├── catalog/              # Market data catalogs
│   │   ├── glass-types.catalog.ts
│   │   ├── models.catalog.ts
│   │   ├── profile-suppliers.catalog.ts
│   │   └── services.catalog.ts
│   └── presets/              # Preset configurations
│       ├── minimal.preset.ts
│       ├── demo-client.preset.ts
│       ├── full-catalog.preset.ts
│       └── README.md
├── factories/                # Factory functions
│   ├── types.ts
│   ├── utils.ts
│   ├── glass-type.factory.ts
│   ├── model.factory.ts
│   ├── profile-supplier.factory.ts
│   └── service.factory.ts
├── seeders/
│   └── seed-orchestrator.ts # Orchestration logic
├── seed-cli.ts               # CLI entry point
└── seed.ts                   # Legacy (keep for Prisma)
```

### 2. Using the CLI

**Basic Usage:**

```bash
# Seed with minimal preset (default)
pnpm seed

# Seed with demo-client preset
pnpm seed --preset=demo-client

# Seed with full catalog
pnpm seed --preset=full-catalog

# Verbose logging
pnpm seed --preset=demo-client --verbose

# Skip validation (faster, but risky)
pnpm seed --skip-validation

# Continue even if some entities fail
pnpm seed --continue-on-error
```

**NPM Scripts (shortcuts):**

```bash
pnpm seed:minimal     # Same as --preset=minimal
pnpm seed:demo        # Same as --preset=demo-client
pnpm seed:full        # Same as --preset=full-catalog
```

### 3. Choosing the Right Preset

| Preset           | Records | Use Case                     | Seed Time |
| ---------------- | ------- | ---------------------------- | --------- |
| **minimal**      | 10      | CI/CD, unit tests, quick dev | ~500ms    |
| **demo-client**  | 30      | Client demos, presentations  | ~1.5s     |
| **full-catalog** | 57      | Production, complete catalog | ~3s       |

**When to use each:**

- **minimal**: Fast tests, CI pipelines, development iteration
- **demo-client**: Realistic demos, MVP presentations, integration tests
- **full-catalog**: Production-like data, E2E tests, staging environment

### 4. Creating Custom Presets

**Example: Regional Preset**

```typescript
// prisma/data/presets/bogota.preset.ts

import type { SeedPreset } from '../../seeders/seed-orchestrator';
import { temperedGlass6mm, doubleGlazedLowE6_12_6 } from '../catalog/glass-types.catalog';
import { deceuninckColombia, aluminaColombia } from '../catalog/profile-suppliers.catalog';
import { deceuninckInouticS5500, aluminaKoncept100 } from '../catalog/models.catalog';
import { standardInstallation, perimeterSealing } from '../catalog/services.catalog';

export const bogotaPreset: SeedPreset = {
  name: 'Bogotá Market',
  description: 'Regional preset for Bogotá - popular models and services',
  
  glassTypes: [
    temperedGlass6mm,
    doubleGlazedLowE6_12_6,
  ],
  
  profileSuppliers: [
    deceuninckColombia,
    aluminaColombia,
  ],
  
  models: [
    deceuninckInouticS5500,
    aluminaKoncept100,
  ],
  
  services: [
    standardInstallation,
    perimeterSealing,
  ],
};
```

**Register in CLI:**

```typescript
// prisma/seed-cli.ts

import { bogotaPreset } from './data/presets/bogota.preset';

const PRESETS: Record<string, SeedPreset> = {
  'minimal': minimalPreset,
  'demo-client': demoClientPreset,
  'full-catalog': fullCatalogPreset,
  'bogota': bogotaPreset,  // Add here
};
```

### 5. Adding New Market Data

**Example: New Glass Type**

```typescript
// prisma/data/catalog/glass-types.catalog.ts

export const acousticGlass8mm: GlassTypeInput = {
  name: 'Vidrio Acústico 8mm',
  description: 'Vidrio acústico con reducción de ruido hasta 40dB',
  thickness: 8,
  pricePerSqm: 180_000, // COP
  isTempered: false,
  isLaminated: true,
  isLowE: false,
  isTripleGlazed: false,
};

// Add to catalog
export const glassTypesCatalog: GlassTypeInput[] = [
  // ... existing
  acousticGlass8mm,
];
```

**No need to update factories** - they already handle all glass types!

### 6. Validation and Error Handling

**Factory Validation:**

```typescript
const result = createGlassType({
  name: 'Invalid Glass',
  thickness: 2,  // ❌ Too thin (min 4mm)
  pricePerSqm: -1000,  // ❌ Negative price
});

if (!result.success) {
  console.error(result.errors);
  // [
  //   { code: 'INVALID_THICKNESS', message: 'Thickness must be between 4mm and 50mm' },
  //   { code: 'INVALID_PRICE', message: 'Price must be positive' }
  // ]
}
```

**Orchestrator Handling:**

```bash
# Stop on first error (default)
pnpm seed --preset=demo-client

# Continue seeding even if some entities fail
pnpm seed --preset=demo-client --continue-on-error
```

### 7. Testing Strategy

**Unit Tests (factories):**

```typescript
// tests/unit/factories/glass-type.factory.test.ts

import { describe, it, expect } from 'vitest';
import { createGlassType } from '@/prisma/factories/glass-type.factory';

describe('createGlassType', () => {
  it('should create valid glass type', () => {
    const result = createGlassType({
      name: 'Test Glass',
      thickness: 6,
      pricePerSqm: 50_000,
      isTempered: true,
      isLaminated: false,
      isLowE: false,
      isTripleGlazed: false,
    });
    
    expect(result.success).toBe(true);
    expect(result.data?.name).toBe('Test Glass');
  });
  
  it('should reject invalid thickness', () => {
    const result = createGlassType({
      name: 'Invalid Glass',
      thickness: 2,  // Too thin
      pricePerSqm: 50_000,
    });
    
    expect(result.success).toBe(false);
    expect(result.errors?.[0]?.code).toBe('INVALID_THICKNESS');
  });
});
```

**Integration Tests (presets):**

```typescript
// tests/integration/seeders/minimal.preset.test.ts

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { PrismaClient } from '@prisma/client';
import { SeedOrchestrator } from '@/prisma/seeders/seed-orchestrator';
import { minimalPreset } from '@/prisma/data/presets/minimal.preset';

describe('Minimal Preset Integration', () => {
  const prisma = new PrismaClient();
  
  beforeAll(async () => {
    // Clean database
    await prisma.service.deleteMany();
    await prisma.model.deleteMany();
    await prisma.glassType.deleteMany();
    await prisma.profileSupplier.deleteMany();
  });
  
  afterAll(async () => {
    await prisma.$disconnect();
  });
  
  it('should seed minimal preset successfully', async () => {
    const orchestrator = new SeedOrchestrator(prisma);
    const stats = await orchestrator.seedWithPreset(minimalPreset);
    
    expect(stats.totalCreated).toBe(10);
    expect(stats.totalFailed).toBe(0);
    
    // Verify database
    const glassTypes = await prisma.glassType.findMany();
    expect(glassTypes.length).toBe(3);
  });
});
```

### 8. Performance Optimization

**Tips:**

1. **Skip Validation for Known-Good Data:**
   ```bash
   pnpm seed --preset=full-catalog --skip-validation
   ```

2. **Use Minimal Preset in CI/CD:**
   ```yaml
   # .github/workflows/test.yml
   - name: Seed test database
     run: pnpm seed:minimal
   ```

3. **Batch Operations in Orchestrator:**
   ```typescript
   // Already implemented in SeedOrchestrator
   await prisma.glassType.createMany({
     data: validatedGlassTypes,
     skipDuplicates: true,
   });
   ```

### 9. Troubleshooting

**Problem: "Supplier not found" error**

```
❌ Supplier not found: Deceuninck Colombia for model Inoutic S5500
```

**Solution:** Ensure suppliers are defined in your preset:

```typescript
export const myPreset: SeedPreset = {
  profileSuppliers: [
    deceuninckColombia,  // Must include this
  ],
  models: [
    deceuninckInouticS5500,  // References Deceuninck Colombia
  ],
};
```

**Problem: Validation errors**

```
❌ Validation failed for: Invalid Glass
  [INVALID_THICKNESS] Thickness must be between 4mm and 50mm
```

**Solution:** Check factory constraints in `factories/*.factory.ts`

### 10. Rollback Plan

If you need to temporarily revert to the old system:

```bash
# Old command still works
tsx prisma/seed.ts

# Prisma's default seed also still works
pnpm prisma db seed
```

The old `seed.ts` file is kept for backward compatibility.

## Next Steps

1. **Start with minimal preset** in development
2. **Use demo-client preset** for client presentations
3. **Create custom presets** for specific regions or scenarios
4. **Add unit tests** for your custom data
5. **Extend catalogs** with new market data as needed

## Additional Resources

- [Factory Pattern Documentation](./factories/README.md)
- [Preset Configuration Guide](./data/presets/README.md)
- [Catalog Data Sources](./data/catalog/README.md)
- [CLI Help](run `pnpm seed --help`)

---

**Questions or Issues?** Check the implementation plan: `/plan/refactor-seeders-factory-pattern-1.md`
