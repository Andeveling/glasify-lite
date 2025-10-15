# Design: Catalog Admin Management

**Change ID**: `add-catalog-admin-management`  
**Status**: Draft  
**Last Updated**: 2025-10-15

## Architecture Overview

This feature implements a full-stack admin management system for catalog entities using Next.js 15 App Router with Server Components, tRPC for type-safe APIs, and Prisma for database operations.

### System Layers

```
┌─────────────────────────────────────────────────────────┐
│  UI Layer (Next.js 15 App Router)                       │
│  /dashboard/{entity}/                                   │
│  - page.tsx (Server Component)                          │
│  - {entity}-content.tsx (Client Component)              │
│  - _components/ (Forms, Tables, Dialogs)                │
└─────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│  API Layer (tRPC)                                        │
│  /server/api/routers/admin/{entity}.ts                  │
│  - Procedures: create, update, delete, list, get-by-id  │
│  - Authorization: adminProcedure                         │
│  - Validation: Zod schemas                              │
└─────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│  Service Layer (Business Logic)                          │
│  /server/services/{entity}.service.ts                   │
│  - Validation logic                                      │
│  - Referential integrity checks                         │
│  - Audit logging                                         │
└─────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│  Data Layer (Prisma ORM)                                 │
│  Database Transactions                                   │
│  - CRUD operations                                       │
│  - Cascade rules                                         │
│  - Indexes for performance                              │
└─────────────────────────────────────────────────────────┘
```

## Component Architecture

### 1. Models Management

**Route**: `/dashboard/models`

#### API Procedures (tRPC)
```typescript
// src/server/api/routers/admin/model.ts
export const modelRouter = createTRPCRouter({
  'create': adminProcedure
    .input(createModelInput)
    .mutation(async ({ ctx, input }) => { /* ... */ }),
  
  'update': adminProcedure
    .input(updateModelInput)
    .mutation(async ({ ctx, input }) => { /* ... */ }),
  
  'delete': adminProcedure
    .input(z.object({ id: z.string().cuid() }))
    .mutation(async ({ ctx, input }) => { /* ... */ }),
  
  'list': adminProcedure
    .input(listModelsInput)
    .query(async ({ ctx, input }) => { /* ... */ }),
  
  'get-by-id': adminProcedure
    .input(z.object({ id: z.string().cuid() }))
    .query(async ({ ctx, input }) => { /* ... */ }),
  
  'publish': adminProcedure
    .input(z.object({ id: z.string().cuid() }))
    .mutation(async ({ ctx, input }) => { /* ... */ }),
  
  'unpublish': adminProcedure
    .input(z.object({ id: z.string().cuid() }))
    .mutation(async ({ ctx, input }) => { /* ... */ }),
});
```

#### Data Validation
```typescript
// Zod schema for model creation
export const createModelInput = z.object({
  name: z.string().min(1, 'Nombre requerido').max(100),
  profileSupplierId: z.string().cuid().optional().nullable(),
  status: z.enum(['draft', 'published']).default('draft'),
  
  // Dimensions
  minWidthMm: z.number().int().min(1),
  maxWidthMm: z.number().int().min(1),
  minHeightMm: z.number().int().min(1),
  maxHeightMm: z.number().int().min(1),
  
  // Pricing
  basePrice: z.number().min(0),
  costPerMmWidth: z.number().min(0),
  costPerMmHeight: z.number().min(0),
  accessoryPrice: z.number().min(0).optional().nullable(),
  
  // Glass configuration
  compatibleGlassTypeIds: z.array(z.string().cuid()).min(1),
  glassDiscountWidthMm: z.number().int().min(0).default(0),
  glassDiscountHeightMm: z.number().int().min(0).default(0),
  
  // Optional metadata
  profitMarginPercentage: z.number().min(0).max(100).optional().nullable(),
  costNotes: z.string().optional().nullable(),
}).refine(
  (data) => data.minWidthMm < data.maxWidthMm,
  { message: 'Ancho mínimo debe ser menor al máximo', path: ['minWidthMm'] }
).refine(
  (data) => data.minHeightMm < data.maxHeightMm,
  { message: 'Alto mínimo debe ser menor al máximo', path: ['minHeightMm'] }
);
```

#### Referential Integrity
```typescript
// Service layer: Check dependencies before deletion
async function checkModelDependencies(ctx: Context, modelId: string) {
  const quoteItemsCount = await ctx.db.quoteItem.count({
    where: { modelId },
  });
  
  if (quoteItemsCount > 0) {
    throw new TRPCError({
      code: 'CONFLICT',
      message: `No se puede eliminar el modelo. Está en uso en ${quoteItemsCount} cotización(es)`,
    });
  }
}
```

### 2. Glass Types Management

**Route**: `/dashboard/glass-types`

#### API Procedures
```typescript
// src/server/api/routers/admin/glass-type.ts
export const glassTypeRouter = createTRPCRouter({
  'create': adminProcedure.input(createGlassTypeInput).mutation(...),
  'update': adminProcedure.input(updateGlassTypeInput).mutation(...),
  'delete': adminProcedure.input(deleteInput).mutation(...),
  'list': adminProcedure.input(listGlassTypesInput).query(...),
  'get-by-id': adminProcedure.input(getByIdInput).query(...),
  'activate': adminProcedure.input(deleteInput).mutation(...),
  'deactivate': adminProcedure.input(deleteInput).mutation(...),
  
  // Nested resource management
  'add-characteristic': adminProcedure.input(addCharacteristicInput).mutation(...),
  'remove-characteristic': adminProcedure.input(removeCharacteristicInput).mutation(...),
  'add-solution': adminProcedure.input(addSolutionInput).mutation(...),
  'remove-solution': adminProcedure.input(removeSolutionInput).mutation(...),
});
```

#### Complex Form Design
```typescript
// Glass Type Form Structure
type GlassTypeFormData = {
  // Basic info
  name: string;
  description?: string;
  sku?: string;
  glassSupplierId?: string;
  
  // Technical specs
  thicknessMm: number;
  pricePerSqm: number;
  uValue?: number;
  solarFactor?: number;
  lightTransmission?: number;
  
  // Relationships (Many-to-Many)
  solutions: Array<{
    solutionId: string;
    performanceRating: PerformanceRating;
    isPrimary: boolean;
    notes?: string;
  }>;
  
  characteristics: Array<{
    characteristicId: string;
    value?: string;
    certification?: string;
    notes?: string;
  }>;
  
  // Status
  isActive: boolean;
  lastReviewDate?: Date;
};
```

### 3. Glass Solutions Management

**Route**: `/dashboard/glass-solutions`

#### API Procedures
```typescript
// src/server/api/routers/admin/glass-solution.ts
export const glassSolutionRouter = createTRPCRouter({
  'create': adminProcedure.input(createGlassSolutionInput).mutation(...),
  'update': adminProcedure.input(updateGlassSolutionInput).mutation(...),
  'delete': adminProcedure.input(deleteInput).mutation(...),
  'list': adminProcedure.input(listInput).query(...),
  'get-by-id': adminProcedure.input(getByIdInput).query(...),
  'reorder': adminProcedure.input(reorderInput).mutation(...), // For sortOrder
});
```

#### Data Structure
```typescript
export const createGlassSolutionInput = z.object({
  key: z.string().min(1).max(50).regex(/^[a-z0-9_-]+$/),
  name: z.string().min(1).max(100),
  nameEs: z.string().min(1).max(100),
  description: z.string().optional().nullable(),
  icon: z.string().optional().nullable(), // Lucide icon name
  sortOrder: z.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
});
```

### 4. Glass Characteristics Management

**Route**: `/dashboard/glass-characteristics`

Similar structure to Glass Solutions with extensible key-value system.

### 5. Glass Suppliers Management

**Route**: `/dashboard/glass-suppliers`

#### API Procedures
```typescript
export const glassSupplierRouter = createTRPCRouter({
  'create': adminProcedure.input(createGlassSupplierInput).mutation(...),
  'update': adminProcedure.input(updateGlassSupplierInput).mutation(...),
  'delete': adminProcedure.input(deleteInput).mutation(...),
  'list': adminProcedure.input(listInput).query(...),
  'get-by-id': adminProcedure.input(getByIdInput).query(...),
});
```

### 6. Services Management

**Route**: `/dashboard/services`

#### API Procedures
```typescript
export const serviceRouter = createTRPCRouter({
  'create': adminProcedure.input(createServiceInput).mutation(...),
  'update': adminProcedure.input(updateServiceInput).mutation(...),
  'delete': adminProcedure.input(deleteInput).mutation(...),
  'list': adminProcedure.input(listInput).query(...),
  'get-by-id': adminProcedure.input(getByIdInput).query(...),
});
```

## UI Design Patterns

### Server Component + Client Content Pattern

```typescript
// src/app/(dashboard)/models/page.tsx (Server Component)
export const metadata: Metadata = {
  title: 'Gestión de Modelos | Glasify Admin',
};

export default async function ModelsPage({ searchParams }: Props) {
  // Server-side data fetching
  const models = await api.admin.model.list({
    page: searchParams.page ? Number(searchParams.page) : 1,
    search: searchParams.search,
  });
  
  return <ModelsPageContent initialData={models} />;
}

// src/app/(dashboard)/models/_components/models-page-content.tsx (Client Component)
'use client';

export function ModelsPageContent({ initialData }: Props) {
  const [searchQuery, setSearchQuery] = useState('');
  const { data, refetch } = api.admin.model.list.useQuery(
    { search: searchQuery },
    { initialData }
  );
  
  return (
    <div>
      <ModelsDataTable data={data.items} onRefetch={refetch} />
      <CreateModelDialog onSuccess={refetch} />
    </div>
  );
}
```

### Form Component Pattern

```typescript
// src/app/(dashboard)/models/_components/model-form.tsx
'use client';

export function ModelForm({ modelData, onSuccess }: Props) {
  const form = useForm<ModelFormData>({
    resolver: zodResolver(modelFormSchema),
    defaultValues: modelData,
  });
  
  const createMutation = api.admin.model.create.useMutation({
    onSuccess: () => {
      toast.success('Modelo creado exitosamente');
      onSuccess?.();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
  
  const handleSubmit = form.handleSubmit(async (data) => {
    await createMutation.mutateAsync(data);
  });
  
  return (
    <Form {...form}>
      <form onSubmit={handleSubmit}>
        {/* Form fields */}
      </form>
    </Form>
  );
}
```

### Data Table Pattern

```typescript
// src/app/(dashboard)/models/_components/models-data-table.tsx
'use client';

export function ModelsDataTable({ data, onRefetch }: Props) {
  const columns: ColumnDef<Model>[] = [
    { accessorKey: 'name', header: 'Nombre' },
    { accessorKey: 'status', header: 'Estado' },
    { accessorKey: 'basePrice', header: 'Precio Base' },
    {
      id: 'actions',
      cell: ({ row }) => <ModelActions model={row.original} onRefetch={onRefetch} />,
    },
  ];
  
  return <DataTable columns={columns} data={data} />;
}
```

## Database Transactions

### Transaction Pattern for Complex Operations

```typescript
// Creating a glass type with solutions and characteristics
async function createGlassTypeWithRelations(input: CreateGlassTypeInput) {
  return await db.$transaction(async (tx) => {
    // 1. Create glass type
    const glassType = await tx.glassType.create({
      data: {
        name: input.name,
        thicknessMm: input.thicknessMm,
        pricePerSqm: input.pricePerSqm,
        // ... other fields
      },
    });
    
    // 2. Create price history record
    await tx.glassTypePriceHistory.create({
      data: {
        glassTypeId: glassType.id,
        pricePerSqm: input.pricePerSqm,
        reason: 'Precio inicial',
        effectiveFrom: new Date(),
        createdBy: ctx.session.user.id,
      },
    });
    
    // 3. Create solution relationships
    if (input.solutions?.length > 0) {
      await tx.glassTypeSolution.createMany({
        data: input.solutions.map(s => ({
          glassTypeId: glassType.id,
          solutionId: s.solutionId,
          performanceRating: s.performanceRating,
          isPrimary: s.isPrimary,
          notes: s.notes,
        })),
      });
    }
    
    // 4. Create characteristic relationships
    if (input.characteristics?.length > 0) {
      await tx.glassTypeCharacteristic.createMany({
        data: input.characteristics.map(c => ({
          glassTypeId: glassType.id,
          characteristicId: c.characteristicId,
          value: c.value,
          certification: c.certification,
          notes: c.notes,
        })),
      });
    }
    
    return glassType;
  });
}
```

## Logging Strategy

### Server-Side Audit Logging

```typescript
// All mutations must log actions
import logger from '@/lib/logger';

async function deleteModel(ctx: Context, modelId: string) {
  logger.info('[Admin] Model deletion attempt', {
    userId: ctx.session.user.id,
    modelId,
  });
  
  try {
    // Check dependencies
    await checkModelDependencies(ctx, modelId);
    
    // Perform deletion
    await ctx.db.model.delete({ where: { id: modelId } });
    
    logger.info('[Admin] Model deleted successfully', {
      userId: ctx.session.user.id,
      modelId,
    });
  } catch (error) {
    logger.error('[Admin] Model deletion failed', {
      userId: ctx.session.user.id,
      modelId,
      error: error.message,
    });
    throw error;
  }
}
```

## Performance Considerations

### Database Indexes

```prisma
// Ensure proper indexes for admin queries
model Model {
  // ... fields
  
  @@index([profileSupplierId, status]) // For filtered lists
  @@index([name]) // For search
  @@index([createdAt(sort: Desc)]) // For recent items
}

model GlassType {
  // ... fields
  
  @@index([glassSupplierId])
  @@index([isActive])
  @@index([thicknessMm])
  @@index([sku])
}
```

### Pagination Strategy

```typescript
// Standard pagination input
export const paginationInput = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});
```

## Error Handling

### Standardized Error Messages

```typescript
// Spanish error messages for user feedback
const ERROR_MESSAGES = {
  NOT_FOUND: 'Recurso no encontrado',
  ALREADY_EXISTS: 'Ya existe un registro con ese nombre',
  HAS_DEPENDENCIES: 'No se puede eliminar porque tiene dependencias',
  VALIDATION_FAILED: 'Error de validación',
  UNAUTHORIZED: 'No tienes permisos para realizar esta acción',
  INTERNAL_ERROR: 'Error interno del servidor',
} as const;
```

## Testing Strategy

### Unit Tests (Vitest)
- Zod schema validation
- Helper functions
- Service layer logic

### Integration Tests (Vitest)
- tRPC procedure execution
- Database transactions
- Referential integrity checks

### E2E Tests (Playwright)
- Admin login → Create model → Publish model
- Admin login → Create glass type → Assign characteristics
- Admin login → Delete entity with dependencies (should fail)
- Admin login → Bulk import catalog data

## Migration Strategy

### Backward Compatibility
- Existing `model-upsert` procedure remains functional
- New procedures follow kebab-case naming convention
- Existing public catalog queries unaffected

### Data Migration
- No schema changes required (all tables already exist)
- Optional: Seed initial glass characteristics and solutions
- Optional: Migrate deprecated fields to new structure

## Open Technical Decisions

1. **Soft Delete Implementation**: Add `deletedAt` field vs `isDeleted` boolean?
   - **Recommendation**: `deletedAt DateTime?` for timestamp + filter capability

2. **Optimistic UI Updates**: Should we use optimistic updates for mutations?
   - **Recommendation**: No for MVP (simpler error handling); add later if UX demands

3. **Form State Management**: React Hook Form vs Tanstack Form?
   - **Recommendation**: React Hook Form (already in use, team familiarity)

4. **Real-time Updates**: WebSockets for multi-admin scenarios?
   - **Out of Scope**: Polling/manual refresh for MVP

5. **Bulk Operations API**: Single endpoint vs batch mutations?
   - **Recommendation**: Batch mutations (more flexible, reuses validation)
