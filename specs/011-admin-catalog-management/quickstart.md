# Quick Start Guide - Admin Catalog Management

**Feature**: Admin Catalog Management  
**Audience**: Developers implementing this feature  
**Prerequisites**: Glasify Lite project cloned, Node.js 18+, PostgreSQL running

---

## Table of Contents

1. [Development Environment Setup](#development-environment-setup)
2. [Implementation Checklist](#implementation-checklist)
3. [Phase-by-Phase Implementation](#phase-by-phase-implementation)
4. [Testing Strategy](#testing-strategy)
5. [Common Patterns](#common-patterns)
6. [Troubleshooting](#troubleshooting)

---

## Development Environment Setup

### 1. Branch & Dependencies

```bash
# Already on feature branch
git checkout 011-admin-catalog-management

# Install dependencies (if not already installed)
pnpm install

# Verify Prisma schema is up-to-date
pnpm db:generate

# Start database (if using Docker)
./start-database.sh

# Run existing migrations
pnpm db:push
```

### 2. Verify Existing Schema

All entities already exist in `prisma/schema.prisma`:
- ✅ Model
- ✅ GlassType
- ✅ Service
- ✅ ProfileSupplier
- ✅ GlassSupplier
- ✅ GlassSolution
- ✅ GlassCharacteristic
- ✅ ModelCostBreakdown
- ✅ GlassTypeSolution (pivot)
- ✅ GlassTypeCharacteristic (pivot)

**No schema changes required** - proceed directly to implementation.

### 3. Seed Test Data

```bash
# Seed development data (if needed)
pnpm db:seed

# Open Prisma Studio to verify data
pnpm db:studio
```

---

## Implementation Checklist

### Phase 1: Foundation Entities (Suppliers & Taxonomies)

#### 1.1 ProfileSupplier CRUD
- [ ] Create Zod schema: `lib/validations/admin/profile-supplier.schema.ts`
- [ ] Create tRPC router: `server/api/routers/admin/profile-supplier.ts`
- [ ] Register in `server/api/root.ts`
- [ ] Create list page: `app/(dashboard)/admin/profile-suppliers/page.tsx`
- [ ] Create list component: `app/(dashboard)/admin/profile-suppliers/_components/profile-supplier-list.tsx`
- [ ] Create form component: `app/(dashboard)/admin/profile-suppliers/_components/profile-supplier-form.tsx`
- [ ] Create new page: `app/(dashboard)/admin/profile-suppliers/new/page.tsx`
- [ ] Create edit page: `app/(dashboard)/admin/profile-suppliers/[id]/page.tsx`
- [ ] Write unit tests: `tests/unit/admin/profile-supplier.test.ts`
- [ ] Write E2E tests: `e2e/admin/profile-supplier-management.spec.ts`

#### 1.2 GlassSupplier CRUD
- [ ] Same structure as ProfileSupplier (schema, router, pages, tests)

#### 1.3 GlassSolution CRUD
- [ ] Same structure as ProfileSupplier (schema, router, pages, tests)

#### 1.4 GlassCharacteristic CRUD
- [ ] Same structure as ProfileSupplier (schema, router, pages, tests)

### Phase 2: Core Products

#### 2.1 GlassType CRUD (with Solutions & Characteristics)
- [ ] Create Zod schema: `lib/validations/admin/glass-type.schema.ts`
- [ ] Create tRPC router: `server/api/routers/admin/glass-type.ts`
- [ ] Create price history service: `server/services/glass-price-history.service.ts`
- [ ] Create list page + component
- [ ] Create form with solution/characteristic selectors
- [ ] Create solution selector component: `_components/solution-selector.tsx`
- [ ] Create characteristic selector component: `_components/characteristic-selector.tsx`
- [ ] Write unit tests
- [ ] Write E2E tests

#### 2.2 Model CRUD (with Compatible Glass Types)
- [ ] Create Zod schema: `lib/validations/admin/model.schema.ts`
- [ ] Create tRPC router: `server/api/routers/admin/model.ts`
- [ ] Create price history service: `server/services/model-price-history.service.ts`
- [ ] Create referential integrity service: `server/services/referential-integrity.service.ts`
- [ ] Create list page + component
- [ ] Create form with Accordion sections
- [ ] Create cost breakdown component: `_components/model-cost-breakdown.tsx`
- [ ] Write unit tests
- [ ] Write E2E tests

### Phase 3: Supplementary

#### 3.1 Service CRUD
- [ ] Same structure as ProfileSupplier (schema, router, pages, tests)

#### 3.2 Update Admin Navigation
- [ ] Update `app/_components/admin-nav.tsx` with all entity links

#### 3.3 Documentation
- [ ] Update `README.md` with admin features
- [ ] Update `CHANGELOG.md` with feature details

---

## Phase-by-Phase Implementation

### Phase 1.1: ProfileSupplier Example (Template for Others)

#### Step 1: Create Zod Schema

**File**: `src/lib/validations/admin/profile-supplier.schema.ts`

```typescript
import { z } from 'zod';
import { MaterialType } from '@prisma/client';

export const createProfileSupplierSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido').max(100, 'El nombre es muy largo'),
  materialType: z.nativeEnum(MaterialType),
  isActive: z.boolean().default(true),
  notes: z.string().max(500, 'Las notas son muy largas').nullable(),
});

export const updateProfileSupplierSchema = createProfileSupplierSchema.partial().extend({
  id: z.string().cuid(),
});

export const listProfileSuppliersSchema = z.object({
  page: z.number().int().positive().optional().default(1),
  limit: z.number().int().positive().max(100).optional().default(20),
  materialType: z.nativeEnum(MaterialType).optional(),
  isActive: z.enum(['all', 'active', 'inactive']).optional().default('all'),
  search: z.string().optional(),
  sortBy: z.enum(['name', 'createdAt']).optional().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});

export const deleteProfileSupplierSchema = z.object({
  id: z.string().cuid(),
});
```

#### Step 2: Create tRPC Router

**File**: `src/server/api/routers/admin/profile-supplier.ts`

```typescript
import { z } from 'zod';
import { createTRPCRouter, adminProcedure } from '../../trpc';
import { TRPCError } from '@trpc/server';
import { logger } from '@/lib/logger';
import {
  createProfileSupplierSchema,
  updateProfileSupplierSchema,
  listProfileSuppliersSchema,
  deleteProfileSupplierSchema,
} from '@/lib/validations/admin/profile-supplier.schema';

export const profileSupplierRouter = createTRPCRouter({
  list: adminProcedure
    .input(listProfileSuppliersSchema)
    .query(async ({ ctx, input }) => {
      const { page, limit, materialType, isActive, search, sortBy, sortOrder } = input;
      
      const where = {
        ...(materialType && { materialType }),
        ...(isActive !== 'all' && { isActive: isActive === 'active' }),
        ...(search && {
          name: { contains: search, mode: 'insensitive' as const },
        }),
      };
      
      const [items, total] = await Promise.all([
        ctx.db.profileSupplier.findMany({
          where,
          skip: (page - 1) * limit,
          take: limit,
          orderBy: { [sortBy]: sortOrder },
        }),
        ctx.db.profileSupplier.count({ where }),
      ]);
      
      return {
        items,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    }),
  
  getById: adminProcedure
    .input(z.object({ id: z.string().cuid() }))
    .query(async ({ ctx, input }) => {
      const supplier = await ctx.db.profileSupplier.findUnique({
        where: { id: input.id },
      });
      
      if (!supplier) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Proveedor de perfiles no encontrado',
        });
      }
      
      return supplier;
    }),
  
  create: adminProcedure
    .input(createProfileSupplierSchema)
    .mutation(async ({ ctx, input }) => {
      const supplier = await ctx.db.profileSupplier.create({
        data: input,
      });
      
      logger.info('Profile supplier created', {
        userId: ctx.session.user.id,
        supplierId: supplier.id,
        supplierName: supplier.name,
        action: 'create',
      });
      
      return supplier;
    }),
  
  update: adminProcedure
    .input(updateProfileSupplierSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      
      const supplier = await ctx.db.profileSupplier.update({
        where: { id },
        data,
      });
      
      logger.info('Profile supplier updated', {
        userId: ctx.session.user.id,
        supplierId: supplier.id,
        supplierName: supplier.name,
        action: 'update',
      });
      
      return supplier;
    }),
  
  delete: adminProcedure
    .input(deleteProfileSupplierSchema)
    .mutation(async ({ ctx, input }) => {
      // Check referential integrity
      const modelCount = await ctx.db.model.count({
        where: { profileSupplierId: input.id },
      });
      
      if (modelCount > 0) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: `No se puede eliminar el proveedor porque tiene ${modelCount} modelos asociados`,
        });
      }
      
      await ctx.db.profileSupplier.delete({
        where: { id: input.id },
      });
      
      logger.info('Profile supplier deleted', {
        userId: ctx.session.user.id,
        supplierId: input.id,
        action: 'delete',
      });
      
      return { success: true };
    }),
});
```

#### Step 3: Register Router

**File**: `src/server/api/root.ts`

```typescript
import { profileSupplierRouter } from './routers/admin/profile-supplier';

export const appRouter = createTRPCRouter({
  // ... existing routers
  admin: createTRPCRouter({
    profileSupplier: profileSupplierRouter,
    // ... other admin routers will be added here
  }),
});
```

#### Step 4: Create List Page (Server Component)

**File**: `src/app/(dashboard)/admin/profile-suppliers/page.tsx`

```typescript
import { api } from '@/trpc/server';
import { ProfileSupplierList } from './_components/profile-supplier-list';

export const dynamic = 'force-dynamic';

export default async function ProfileSuppliersPage() {
  const initialData = await api.admin.profileSupplier.list({});
  
  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Proveedores de Perfiles</h1>
        <Link href="/admin/profile-suppliers/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Crear Proveedor
          </Button>
        </Link>
      </div>
      
      <ProfileSupplierList initialData={initialData} />
    </div>
  );
}
```

#### Step 5: Create List Component (Client Component)

**File**: `src/app/(dashboard)/admin/profile-suppliers/_components/profile-supplier-list.tsx`

```typescript
'use client';

import { useState } from 'react';
import { api } from '@/trpc/react';
import { DataTable } from '@/components/ui/data-table';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { useDebounce } from '@/hooks/use-debounce';

export function ProfileSupplierList({ initialData }) {
  const [search, setSearch] = useState('');
  const [materialType, setMaterialType] = useState('all');
  const [isActive, setIsActive] = useState('all');
  
  const debouncedSearch = useDebounce(search, 300);
  
  const { data } = api.admin.profileSupplier.list.useQuery(
    { search: debouncedSearch, materialType, isActive },
    { initialData }
  );
  
  return (
    <div>
      <div className="flex gap-4 mb-4">
        <Input
          placeholder="Buscar por nombre..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
        <Select value={materialType} onValueChange={setMaterialType}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Material" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="PVC">PVC</SelectItem>
            <SelectItem value="ALUMINUM">Aluminio</SelectItem>
            <SelectItem value="WOOD">Madera</SelectItem>
            <SelectItem value="MIXED">Mixto</SelectItem>
          </SelectContent>
        </Select>
        <Select value={isActive} onValueChange={setIsActive}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="active">Activos</SelectItem>
            <SelectItem value="inactive">Inactivos</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <DataTable
        columns={columns}
        data={data?.items ?? []}
        pageCount={data?.totalPages ?? 0}
      />
    </div>
  );
}

const columns = [
  // Define columns for DataTable...
];
```

---

## Testing Strategy

### Unit Tests (Vitest)

**File**: `tests/unit/admin/profile-supplier.test.ts`

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { appRouter } from '@/server/api/root';
import { createInnerTRPCContext } from '@/server/api/trpc';

describe('ProfileSupplier tRPC Router', () => {
  it('should create a profile supplier', async () => {
    const ctx = createInnerTRPCContext({
      session: { user: { id: '1', role: 'admin' } },
    });
    const caller = appRouter.createCaller(ctx);
    
    const result = await caller.admin.profileSupplier.create({
      name: 'Test Supplier',
      materialType: 'PVC',
      isActive: true,
      notes: null,
    });
    
    expect(result.name).toBe('Test Supplier');
    expect(result.materialType).toBe('PVC');
  });
  
  it('should prevent deletion if models exist', async () => {
    // Test referential integrity check...
  });
});
```

### E2E Tests (Playwright)

**File**: `e2e/admin/profile-supplier-management.spec.ts`

```typescript
import { test, expect } from '@playwright/test';

test.describe('Profile Supplier Management', () => {
  test('should create a new profile supplier', async ({ page }) => {
    await page.goto('/admin/profile-suppliers');
    await page.click('text=Crear Proveedor');
    
    await page.fill('input[name="name"]', 'Test Supplier');
    await page.selectOption('select[name="materialType"]', 'PVC');
    
    await page.click('button[type="submit"]');
    
    await expect(page).toHaveURL(/\/admin\/profile-suppliers$/);
    await expect(page.locator('text=Test Supplier')).toBeVisible();
  });
});
```

---

## Common Patterns

### Pattern 1: Server Page + Client Content

```typescript
// page.tsx (Server Component)
export default async function EntityPage() {
  const data = await api.entity.list({});
  return <EntityContent initialData={data} />;
}

// _components/entity-content.tsx (Client Component)
'use client';
export function EntityContent({ initialData }) {
  const { data } = api.entity.list.useQuery({}, { initialData });
  // ... interactivity
}
```

### Pattern 2: Form with React Hook Form + Zod

```typescript
'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

export function EntityForm() {
  const form = useForm({
    resolver: zodResolver(createEntitySchema),
    defaultValues: { /* ... */ },
  });
  
  const createMutation = api.entity.create.useMutation({
    onSuccess: () => {
      toast.success('Entidad creada');
      router.push('/admin/entities');
    },
  });
  
  const onSubmit = (data) => {
    createMutation.mutate(data);
  };
  
  return <Form {...form}>...</Form>;
}
```

### Pattern 3: Referential Integrity Check

```typescript
export const entityRouter = createTRPCRouter({
  delete: adminProcedure
    .input(z.object({ id: z.string().cuid() }))
    .mutation(async ({ ctx, input }) => {
      const dependencyCount = await ctx.db.dependency.count({
        where: { entityId: input.id },
      });
      
      if (dependencyCount > 0) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: `No se puede eliminar porque tiene ${dependencyCount} dependencias`,
        });
      }
      
      await ctx.db.entity.delete({ where: { id: input.id } });
      return { success: true };
    }),
});
```

---

## Troubleshooting

### Issue: "Winston is not defined" in Client Component

**Cause**: Trying to use Winston logger in Client Component  
**Solution**: Remove Winston import, use `console` or `toast` instead

### Issue: "FORBIDDEN: No admin role" in tRPC

**Cause**: Using `protectedProcedure` instead of `adminProcedure`  
**Solution**: Change to `adminProcedure` for admin-only endpoints

### Issue: Form validation not showing errors

**Cause**: Missing `@hookform/resolvers` integration  
**Solution**: Use `zodResolver(schema)` in `useForm` resolver option

### Issue: List page not updating after mutation

**Cause**: Cache not invalidated  
**Solution**: Use `utils.entity.list.invalidate()` in mutation `onSuccess`

---

## Next Steps

1. **Start with Phase 1.1** (ProfileSupplier) - use as template for other entities
2. **Parallelize Phase 1** - All foundation entities can be developed simultaneously
3. **Sequential Phase 2** - GlassType first (depends on suppliers), then Model (depends on GlassType)
4. **Complete Phase 3** - Services and cost breakdown (independent)
5. **Integration Testing** - Test full workflows across entities
6. **Documentation** - Update README and CHANGELOG

---

**Questions?** Check:
- Spec: `specs/011-admin-catalog-management/spec.md`
- Plan: `specs/011-admin-catalog-management/plan.md`
- Research: `specs/011-admin-catalog-management/research.md`
- Data Model: `specs/011-admin-catalog-management/data-model.md`
- API Contracts: `specs/011-admin-catalog-management/contracts/api-contracts.md`
