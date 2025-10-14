# Data Model: Enhanced Catalog Model Sidebar Information

**Feature**: 007-enhanced-catalog-model  
**Date**: 2025-10-14  
**Status**: ✅ Complete

## Overview

This document describes the data model changes required to support enhanced sidebar information display. The primary change is extending the tRPC output schema to include `ProfileSupplier.materialType` for deriving material-specific benefits.

**Key Principle**: No Prisma schema changes required - we leverage existing relationships and add a single field to the query selection.

## Entity Changes

### 1. Model (Prisma) - No Changes

**Status**: ✅ No modifications needed

The `Model` entity already has the `profileSupplier` relationship:

```prisma
model Model {
  id                String           @id @default(cuid())
  profileSupplierId String?
  profileSupplier   ProfileSupplier? @relation(fields: [profileSupplierId], references: [id], onDelete: SetNull)
  name              String
  // ... other fields unchanged
}
```

**Relationship**: `Model.profileSupplier` → `ProfileSupplier` (optional, 1:1)

---

### 2. ProfileSupplier (Prisma) - No Changes

**Status**: ✅ Already contains required field

```prisma
model ProfileSupplier {
  id           String       @id @default(cuid())
  name         String       @unique
  materialType MaterialType  // ✅ This is what we need!
  isActive     Boolean      @default(true)
  notes        String?
  createdAt    DateTime     @default(now())
  updatedAt    DateTime     @updatedAt
  models       Model[]
}

enum MaterialType {
  PVC
  ALUMINUM
  WOOD
  MIXED
}
```

**Key Field**: `materialType` enum - maps to material-specific benefits in UI

---

### 3. ModelDetailOutput (tRPC Schema) - Extended

**Status**: 🔄 Modified (add materialType to profileSupplier selection)

**Current Schema** (src/server/api/routers/catalog/catalog.schemas.ts):

```typescript
export const modelDetailOutput = z.object({
  accessoryPrice: z.number().nullable(),
  basePrice: z.number(),
  compatibleGlassTypeIds: z.array(z.string()),
  costPerMmHeight: z.number(),
  costPerMmWidth: z.number(),
  createdAt: z.date(),
  id: z.string(),
  maxHeightMm: z.number(),
  maxWidthMm: z.number(),
  minHeightMm: z.number(),
  minWidthMm: z.number(),
  name: z.string(),
  profileSupplier: z
    .object({
      id: z.string(),
      name: z.string(),
      // ❌ materialType MISSING
    })
    .nullable(),
  status: z.enum(['draft', 'published']),
  updatedAt: z.date(),
});
```

**New Schema** (after enhancement):

```typescript
export const modelDetailOutput = z.object({
  accessoryPrice: z.number().nullable(),
  basePrice: z.number(),
  compatibleGlassTypeIds: z.array(z.string()),
  costPerMmHeight: z.number(),
  costPerMmWidth: z.number(),
  createdAt: z.date(),
  id: z.string(),
  maxHeightMm: z.number(),
  maxWidthMm: z.number(),
  minHeightMm: z.number(),
  minWidthMm: z.number(),
  name: z.string(),
  profileSupplier: z
    .object({
      id: z.string(),
      name: z.string(),
      materialType: z.enum(['PVC', 'ALUMINUM', 'WOOD', 'MIXED']), // ✅ NEW FIELD
    })
    .nullable(),
  status: z.enum(['draft', 'published']),
  updatedAt: z.date(),
});

export type ModelDetailOutput = z.infer<typeof modelDetailOutput>;
```

**TypeScript Type** (inferred):

```typescript
type ModelDetailOutput = {
  // ... existing fields
  profileSupplier: {
    id: string;
    name: string;
    materialType: 'PVC' | 'ALUMINUM' | 'WOOD' | 'MIXED'; // ✅ NEW
  } | null;
};
```

---

### 4. Model Type (Client) - Extended

**Status**: 🔄 Modified (src/app/(public)/catalog/[modelId]/_types/model.types.ts)

**Current Type**:

```typescript
export type Model = {
  id: string;
  name: string;
  /** @deprecated Use profileSupplier instead */
  manufacturer?: string;
  profileSupplier?: string; // ❌ Only name, no material type
  description: string;
  basePrice: number;
  currency: string;
  imageUrl: string;
  dimensions: ModelDimensions;
  features: string[];
};
```

**New Type**:

```typescript
export type MaterialType = 'PVC' | 'ALUMINUM' | 'WOOD' | 'MIXED';

export type ProfileSupplier = {
  id: string;
  name: string;
  materialType: MaterialType; // ✅ NEW
};

export type Model = {
  id: string;
  name: string;
  /** @deprecated Use profileSupplier object instead */
  manufacturer?: string;
  profileSupplier: ProfileSupplier | null; // ✅ CHANGED: Full object, not string
  description: string;
  basePrice: number;
  currency: string;
  imageUrl: string;
  dimensions: ModelDimensions;
  features: string[]; // Will be enhanced with material-based benefits
};
```

**Breaking Change Assessment**: 
- ✅ Non-breaking: `profileSupplier` was optional (`?` type)
- ✅ Backwards compatible: Existing code using `model.profileSupplier` will continue to work (truthy check)
- ⚠️ Adapter migration required: `adaptModelFromServer` must map new structure

---

## Data Flow

### 1. Server Query (tRPC)

**File**: `src/server/api/routers/catalog/catalog.queries.ts`

**Current Query**:
```typescript
const model = await ctx.db.model.findUnique({
  select: {
    // ... fields
    profileSupplier: {
      select: {
        id: true,
        name: true,
        // ❌ materialType NOT selected
      },
    },
  },
  where: { id: input.modelId, status: 'published' },
});
```

**Enhanced Query**:
```typescript
const model = await ctx.db.model.findUnique({
  select: {
    // ... existing fields unchanged
    profileSupplier: {
      select: {
        id: true,
        name: true,
        materialType: true, // ✅ ADD THIS LINE
      },
    },
  },
  where: { id: input.modelId, status: 'published' },
});
```

**Performance Impact**: None - `materialType` is a small enum value, no JOIN overhead (already selecting profileSupplier)

---

### 2. Adapter Transformation

**File**: `src/app/(public)/catalog/[modelId]/_utils/adapters.ts`

**Current Adapter**:
```typescript
export function adaptModelFromServer(serverModel: ModelDetailOutput): Model {
  return {
    basePrice: serverModel.basePrice,
    currency: 'USD', // TODO: Pass currency from TenantConfig
    description: 'Modelo de alta calidad...', // TODO: Add description field
    dimensions: {
      maxHeight: serverModel.maxHeightMm,
      maxWidth: serverModel.maxWidthMm,
      minHeight: serverModel.minHeightMm,
      minWidth: serverModel.minWidthMm,
    },
    features: [
      // ❌ Hardcoded generic features
      'Fabricación de alta calidad',
      'Materiales duraderos',
      'Garantía del fabricante',
    ],
    id: serverModel.id,
    imageUrl: '/modern-aluminum-sliding-window.jpg', // TODO: Add imageUrl
    name: serverModel.name,
    profileSupplier: serverModel.profileSupplier?.name ?? 'Proveedor desconocido', // ❌ String only
  };
}
```

**Enhanced Adapter**:
```typescript
import { MATERIAL_BENEFITS } from './material-benefits';

export function adaptModelFromServer(serverModel: ModelDetailOutput): Model {
  const profileSupplier = serverModel.profileSupplier
    ? {
        id: serverModel.profileSupplier.id,
        name: serverModel.profileSupplier.name,
        materialType: serverModel.profileSupplier.materialType, // ✅ NEW
      }
    : null;

  // ✅ Derive features from material type (if available)
  const materialFeatures = profileSupplier
    ? MATERIAL_BENEFITS[profileSupplier.materialType]
    : [];

  // Combine generic + material-specific features
  const features = [
    'Fabricación de alta calidad',
    'Garantía del fabricante',
    ...materialFeatures, // ✅ Dynamic based on material
  ];

  return {
    basePrice: serverModel.basePrice,
    currency: 'USD', // TODO: Pass currency from TenantConfig
    description: 'Modelo de alta calidad con excelentes características',
    dimensions: {
      maxHeight: serverModel.maxHeightMm,
      maxWidth: serverModel.maxWidthMm,
      minHeight: serverModel.minHeightMm,
      minWidth: serverModel.minWidthMm,
    },
    features,
    id: serverModel.id,
    imageUrl: '/modern-aluminum-sliding-window.jpg',
    name: serverModel.name,
    profileSupplier, // ✅ Full object
  };
}
```

---

### 3. Material Benefits Mapping

**File**: `src/app/(public)/catalog/[modelId]/_utils/material-benefits.ts` (NEW)

```typescript
import type { MaterialType } from '../_types/model.types';

/**
 * Material-specific benefits in Spanish for user display
 * Maps MaterialType enum to user-friendly feature descriptions
 */
export const MATERIAL_BENEFITS: Record<MaterialType, string[]> = {
  PVC: [
    'Excelente aislamiento térmico',
    'Bajo mantenimiento - No requiere pintura',
    'Resistente a la corrosión y humedad',
    'Alta reducción de ruido exterior',
  ],
  ALUMINUM: [
    'Máxima resistencia estructural',
    'Perfiles delgados y estética moderna',
    'Durabilidad excepcional',
    'Ideal para grandes dimensiones',
  ],
  WOOD: [
    'Calidez natural y estética clásica',
    'Excelente aislamiento térmico',
    'Renovable y ecológico',
    'Personalizable con acabados',
  ],
  MIXED: [
    'Combina ventajas de múltiples materiales',
    'Versatilidad en aplicaciones',
    'Balance entre estética y rendimiento',
  ],
};

/**
 * Performance ratings by material type (Phase 1 defaults)
 * Future: Replace with per-supplier ratings from database
 */
export const MATERIAL_PERFORMANCE: Record<
  MaterialType,
  {
    thermal: 'excellent' | 'good' | 'standard';
    acoustic: 'excellent' | 'good' | 'standard';
    structural: 'excellent' | 'good' | 'standard';
  }
> = {
  PVC: { thermal: 'excellent', acoustic: 'excellent', structural: 'good' },
  ALUMINUM: { thermal: 'standard', acoustic: 'good', structural: 'excellent' },
  WOOD: { thermal: 'excellent', acoustic: 'good', structural: 'good' },
  MIXED: { thermal: 'good', acoustic: 'good', structural: 'good' },
};

/**
 * Convert performance level to stars + Spanish label
 */
export function formatPerformanceRating(
  level: 'excellent' | 'good' | 'standard'
): {
  stars: 1 | 2 | 3 | 4 | 5;
  label: string;
} {
  const ratings = {
    standard: { stars: 3 as const, label: 'Estándar' },
    good: { stars: 4 as const, label: 'Bueno' },
    excellent: { stars: 5 as const, label: 'Excelente' },
  };
  return ratings[level];
}
```

---

## Validation Rules

### Server-Side (tRPC)

**Input Validation** (unchanged):
```typescript
export const getModelByIdInput = z.object({
  modelId: z.string().cuid(),
});
```

**Output Validation** (enhanced):
```typescript
// Zod automatically validates materialType enum on query return
// If Prisma returns unexpected value, Zod throws error before client receives data
```

### Client-Side (Components)

**Null Safety**:
```typescript
// Components MUST handle null profileSupplier
if (!model.profileSupplier) {
  return <p>Proveedor de perfiles no especificado</p>;
}

// Type guard ensures materialType exists
const { materialType } = model.profileSupplier;
const benefits = MATERIAL_BENEFITS[materialType];
```

---

## Migration Checklist

### Phase 1 (Implementation)

- [ ] Extend `modelDetailOutput` Zod schema with `materialType`
- [ ] Update Prisma query to select `profileSupplier.materialType`
- [ ] Create `material-benefits.ts` utility with lookup tables
- [ ] Modify `adaptModelFromServer` to map new structure
- [ ] Update `Model` type to use `ProfileSupplier` object
- [ ] Update components to consume new `profileSupplier` structure

### Data Quality (Pre-launch)

- [ ] Verify all active ProfileSupplier records have `materialType` populated
- [ ] Create seeder script if NULL values found (backfill from supplier names)
- [ ] Test edge case: Model with `profileSupplier: null` renders gracefully

### Testing

- [ ] Unit test: `material-benefits.ts` returns correct benefits for each MaterialType
- [ ] Unit test: `adaptModelFromServer` maps materialType correctly
- [ ] Integration test: tRPC query includes materialType in response
- [ ] E2E test: Sidebar displays material-specific benefits

---

## Future Enhancements (Out of Scope)

### Phase 2: Supplier-Specific Ratings

**Prisma Schema Extension** (future):
```prisma
model ProfileSupplier {
  // ... existing fields
  thermalRating      PerformanceRating? // NEW
  acousticRating     PerformanceRating? // NEW
  waterResistanceClass Int?              // NEW (1-6)
  airPermeabilityClass Int?              // NEW (1-6)
}

enum PerformanceRating {
  basic
  standard
  good
  very_good
  excellent
}
```

**Migration Path**:
1. Add nullable fields to ProfileSupplier
2. Backfill with material-based defaults
3. Update tRPC query to select new fields
4. Enhance UI to display supplier-specific ratings
5. Admin UI to manage ratings per supplier

---

## Dependencies

**Existing Entities** (no changes):
- ✅ `Model` (Prisma)
- ✅ `ProfileSupplier` (Prisma)
- ✅ `MaterialType` enum (Prisma)

**New Entities**:
- ✅ `MATERIAL_BENEFITS` constant (TypeScript)
- ✅ `MATERIAL_PERFORMANCE` constant (TypeScript)
- ✅ Enhanced `ModelDetailOutput` type (Zod)
- ✅ Enhanced `Model` client type (TypeScript)

**No Database Migrations Required** ✅

---

**Data Model Complete**: 2025-10-14  
**Next Artifact**: contracts/enhanced-model-detail.yaml
