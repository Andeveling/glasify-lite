# Quick Start Guide: Enhanced Catalog Model Sidebar

**Feature**: 007-enhanced-catalog-model  
**Developer Setup Time**: ~10 minutes  
**Last Updated**: 2025-10-14

## Overview

This guide helps developers set up their environment to work on the enhanced catalog sidebar feature. You'll add material-specific information and technical specifications to the model detail page.

**What You'll Build**: Enhanced sidebar cards showing ProfileSupplier info, material benefits, and technical specs.

---

## Prerequisites

✅ **Required**:
- Node.js 18+ installed (`node --version`)
- pnpm 8+ installed (`pnpm --version`)
- PostgreSQL database running (local or remote)
- Git branch `007-enhanced-catalog-model` checked out

✅ **Recommended**:
- VS Code with Prisma extension
- Prisma Studio for database inspection
- Chrome DevTools for debugging

---

## Quick Setup (5 minutes)

### 1. Install Dependencies

```bash
cd /home/andres/Proyectos/glasify-lite

# Install packages (if not already done)
pnpm install

# Generate Prisma client (includes MaterialType enum)
pnpm db:generate
```

### 2. Verify Database Schema

```bash
# Open Prisma Studio to inspect data
pnpm db:studio
```

**Check**:
- [ ] `ProfileSupplier` table exists
- [ ] `ProfileSupplier.materialType` column populated (should be PVC/ALUMINUM)
- [ ] At least one `Model` has `profileSupplierId` set

**If materialType is NULL** for any supplier:
```sql
-- Quick fix: Update manually in Prisma Studio
-- Or run seeder (create if needed):
-- pnpm db:seed:suppliers
```

### 3. Start Development Server

```bash
# Terminal 1: Next.js dev server with Turbo
pnpm dev

# Terminal 2 (optional): Type checking watch mode
pnpm typecheck --watch
```

**Verify**: Navigate to http://localhost:3000/catalog/[any-model-id]

---

## Project Structure Tour

### Files You'll Modify

```
src/
├── server/api/routers/catalog/
│   ├── catalog.queries.ts          # ⚠️ MODIFY: Add materialType to select
│   └── catalog.schemas.ts          # ⚠️ MODIFY: Extend modelDetailOutput
│
├── app/(public)/catalog/[modelId]/
│   ├── _components/
│   │   ├── model-sidebar.tsx       # ⚠️ MODIFY: Add new cards
│   │   ├── model-specifications.tsx    # ✅ CREATE: Technical specs card
│   │   └── profile-supplier-card.tsx   # ✅ CREATE: Supplier info card
│   │
│   ├── _types/
│   │   └── model.types.ts          # ⚠️ MODIFY: Add ProfileSupplier type
│   │
│   └── _utils/
│       ├── adapters.ts             # ⚠️ MODIFY: Map materialType
│       └── material-benefits.ts    # ✅ CREATE: Material → Benefits mapping
│
tests/
├── unit/catalog/
│   └── material-benefits.test.ts   # ✅ CREATE: Test utilities
└── integration/catalog/
    └── get-model-enhanced.test.ts  # ✅ CREATE: Test tRPC query
```

### Files You'll Create

1. **`material-benefits.ts`** (utility)
2. **`model-specifications.tsx`** (component)
3. **`profile-supplier-card.tsx`** (component)
4. **`material-benefits.test.ts`** (unit test)
5. **`get-model-enhanced.test.ts`** (integration test)

---

## Development Workflow

### Step 1: Backend Enhancement (30 min)

#### 1.1 Extend tRPC Output Schema

**File**: `src/server/api/routers/catalog/catalog.schemas.ts`

```typescript
// Find: export const modelDetailOutput = z.object({
// Add materialType to profileSupplier:

profileSupplier: z
  .object({
    id: z.string(),
    name: z.string(),
    materialType: z.enum(['PVC', 'ALUMINUM', 'WOOD', 'MIXED']), // ✅ ADD THIS LINE
  })
  .nullable(),
```

**Test**: TypeScript should compile without errors

#### 1.2 Update Prisma Query

**File**: `src/server/api/routers/catalog/catalog.queries.ts`

```typescript
// Find: 'get-model-by-id': publicProcedure
// In the Prisma select, add:

profileSupplier: {
  select: {
    id: true,
    name: true,
    materialType: true, // ✅ ADD THIS LINE
  },
},
```

**Test**: Run query in browser, check Network tab for materialType in response

#### 1.3 Verify with API Call

```bash
# Open browser console on model detail page
# Run:
const data = await window.__NEXT_DATA__.props.pageProps.trpcState.json.queries[0].state.data;
console.log(data.profileSupplier.materialType); // Should log "PVC" or "ALUMINUM"
```

---

### Step 2: Create Material Benefits Utility (15 min)

**File**: `src/app/(public)/catalog/[modelId]/_utils/material-benefits.ts`

```typescript
import type { MaterialType } from '../_types/model.types';

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

**Test**: Import in browser console and verify lookup works

---

### Step 3: Update Client Types (10 min)

**File**: `src/app/(public)/catalog/[modelId]/_types/model.types.ts`

```typescript
// Add at top:
export type MaterialType = 'PVC' | 'ALUMINUM' | 'WOOD' | 'MIXED';

export type ProfileSupplier = {
  id: string;
  name: string;
  materialType: MaterialType;
};

// Modify Model type:
export type Model = {
  // ... existing fields
  profileSupplier: ProfileSupplier | null; // ✅ CHANGED from string
  // ... rest unchanged
};
```

---

### Step 4: Update Adapter (15 min)

**File**: `src/app/(public)/catalog/[modelId]/_utils/adapters.ts`

```typescript
import { MATERIAL_BENEFITS } from './material-benefits';

export function adaptModelFromServer(serverModel: ModelDetailOutput): Model {
  const profileSupplier = serverModel.profileSupplier
    ? {
        id: serverModel.profileSupplier.id,
        name: serverModel.profileSupplier.name,
        materialType: serverModel.profileSupplier.materialType,
      }
    : null;

  const materialFeatures = profileSupplier
    ? MATERIAL_BENEFITS[profileSupplier.materialType]
    : [];

  return {
    // ... existing mappings
    profileSupplier,
    features: [
      'Fabricación de alta calidad',
      'Garantía del fabricante',
      ...materialFeatures,
    ],
    // ... rest unchanged
  };
}
```

**Test**: Check browser console for adapter output, verify features include material-specific items

---

### Step 5: Create Sidebar Components (45 min)

#### 5.1 Profile Supplier Card

**File**: `src/app/(public)/catalog/[modelId]/_components/profile-supplier-card.tsx`

```typescript
'use client';

import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Building2 } from 'lucide-react';
import type { ProfileSupplier } from '../_types/model.types';

type Props = {
  supplier: ProfileSupplier | null;
};

export function ProfileSupplierCard({ supplier }: Props) {
  if (!supplier) {
    return (
      <Card className="p-6">
        <p className="text-sm text-muted-foreground">
          Proveedor de perfiles no especificado
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="mb-4 flex items-center gap-2">
        <Building2 className="h-5 w-5 text-primary" />
        <h3 className="font-semibold">Proveedor de Perfiles</h3>
      </div>
      <div className="space-y-3">
        <div>
          <p className="text-lg font-medium">{supplier.name}</p>
          <Badge variant="secondary" className="mt-1">
            {supplier.materialType}
          </Badge>
        </div>
      </div>
    </Card>
  );
}
```

#### 5.2 Technical Specifications Card

**File**: `src/app/(public)/catalog/[modelId]/_components/model-specifications.tsx`

```typescript
'use client';

import { Card } from '@/components/ui/card';
import { Gauge } from 'lucide-react';
import type { Model } from '../_types/model.types';
import { MATERIAL_PERFORMANCE, formatPerformanceRating } from '../_utils/material-benefits';

type Props = {
  model: Model;
};

export function ModelSpecifications({ model }: Props) {
  const materialType = model.profileSupplier?.materialType;
  if (!materialType) return null;

  const performance = MATERIAL_PERFORMANCE[materialType];

  return (
    <Card className="p-6">
      <div className="mb-4 flex items-center gap-2">
        <Gauge className="h-5 w-5 text-primary" />
        <h3 className="font-semibold">Especificaciones Técnicas</h3>
      </div>
      <div className="space-y-3 text-sm">
        <PerformanceRow label="Aislamiento Térmico" level={performance.thermal} />
        <PerformanceRow label="Aislamiento Acústico" level={performance.acoustic} />
        <PerformanceRow label="Resistencia Estructural" level={performance.structural} />
      </div>
    </Card>
  );
}

function PerformanceRow({ label, level }: { label: string; level: string }) {
  const { stars, label: rating } = formatPerformanceRating(level as any);

  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}:</span>
      <div className="flex items-center gap-2">
        <span className="text-yellow-500 text-xs">{'⭐'.repeat(stars)}</span>
        <span className="font-medium">{rating}</span>
      </div>
    </div>
  );
}
```

#### 5.3 Update Sidebar Orchestrator

**File**: `src/app/(public)/catalog/[modelId]/_components/model-sidebar.tsx`

```typescript
import { ModelSpecifications } from './model-specifications';
import { ProfileSupplierCard } from './profile-supplier-card';
// ... existing imports

export function ModelSidebar({ model }: Props) {
  return (
    <div className="space-y-4">
      <ProfileSupplierCard supplier={model.profileSupplier} />
      <ModelSpecifications model={model} />
      <ModelInfo model={model} />
      <ModelDimensionsCard dimensions={model.dimensions} />
      <ModelFeatures features={model.features} />
    </div>
  );
}
```

---

### Step 6: Manual Testing (10 min)

1. **Start dev server**: `pnpm dev`
2. **Navigate to model page**: http://localhost:3000/catalog/[model-id]
3. **Check sidebar**:
   - [ ] ProfileSupplierCard shows supplier name + material badge
   - [ ] ModelSpecifications shows performance ratings with stars
   - [ ] Features include material-specific benefits
   - [ ] No UI errors when supplier is null

4. **Test edge cases**:
   - Model WITH supplier: http://localhost:3000/catalog/[id-with-supplier]
   - Model WITHOUT supplier: http://localhost:3000/catalog/[id-without-supplier]

---

### Step 7: Unit Tests (20 min)

**File**: `tests/unit/catalog/material-benefits.test.ts`

```typescript
import { describe, expect, it } from 'vitest';
import { MATERIAL_BENEFITS, formatPerformanceRating } from '@/app/(public)/catalog/[modelId]/_utils/material-benefits';

describe('Material Benefits', () => {
  it('returns benefits for PVC material', () => {
    const benefits = MATERIAL_BENEFITS.PVC;
    expect(benefits).toContain('Excelente aislamiento térmico');
    expect(benefits.length).toBeGreaterThan(0);
  });

  it('returns benefits for all material types', () => {
    expect(MATERIAL_BENEFITS.PVC).toBeDefined();
    expect(MATERIAL_BENEFITS.ALUMINUM).toBeDefined();
    expect(MATERIAL_BENEFITS.WOOD).toBeDefined();
    expect(MATERIAL_BENEFITS.MIXED).toBeDefined();
  });

  it('formats excellent rating correctly', () => {
    const result = formatPerformanceRating('excellent');
    expect(result.stars).toBe(5);
    expect(result.label).toBe('Excelente');
  });
});
```

**Run**: `pnpm test material-benefits`

---

## Common Issues & Solutions

### Issue: "materialType is undefined"

**Cause**: Query not selecting field  
**Fix**: Verify `profileSupplier.materialType: true` in Prisma select

### Issue: "MATERIAL_BENEFITS is not defined"

**Cause**: Import path incorrect  
**Fix**: Check relative path from component to `_utils/material-benefits.ts`

### Issue: "Supplier is null for all models"

**Cause**: ProfileSupplier not assigned to models  
**Fix**: Run Prisma Studio, manually assign suppliers to models

### Issue: TypeScript error on materialType enum

**Cause**: Zod schema not regenerated  
**Fix**: Run `pnpm db:generate && pnpm typecheck`

---

## Next Steps

1. ✅ **Verify Setup**: All checks above passed
2. ⏳ **Run Tests**: `pnpm test` (unit tests pass)
3. ⏳ **E2E Tests**: `pnpm test:e2e catalog` (optional)
4. ⏳ **Create PR**: Follow conventional commit format
5. ⏳ **Review**: Request code review from team

---

## Useful Commands

```bash
# Development
pnpm dev                 # Start Next.js dev server
pnpm typecheck          # Check TypeScript errors
pnpm lint               # Run Ultracite linter
pnpm lint:fix           # Auto-fix linting issues

# Database
pnpm db:studio          # Open Prisma Studio
pnpm db:generate        # Regenerate Prisma Client
pnpm db:push            # Push schema changes (dev only)

# Testing
pnpm test               # Run unit tests
pnpm test:watch         # Watch mode
pnpm test:e2e           # Run E2E tests (Playwright)
pnpm test:e2e:ui        # E2E with UI

# Build
pnpm build              # Production build (checks for errors)
```

---

## Resources

- [Spec Document](../spec.md)
- [Data Model](../data-model.md)
- [API Contract](../contracts/enhanced-model-detail.md)
- [Research Decisions](../research.md)
- [Prisma Schema](../../../../prisma/schema.prisma)
- [Constitution](../../../../.specify/memory/constitution.md)

---

**Setup Complete!** 🎉  
You're ready to implement the enhanced catalog sidebar.

**Estimated Implementation Time**: 2-3 hours  
**Files to Create**: 5  
**Files to Modify**: 5

**Questions?** Check the spec document or constitution for architectural guidance.
