# tRPC API Contracts - Admin Catalog Management

**Version**: 1.0.0  
**Base Router**: `api.admin.*`  
**Authorization**: All procedures require `adminProcedure` (admin role only)

## Overview

This document defines the tRPC API contracts for admin catalog management. All procedures follow these conventions:

- **Input Validation**: Zod schemas in `lib/validations/admin/*.schema.ts`
- **Authorization**: `adminProcedure` middleware (UserRole.admin required)
- **Error Handling**: TRPCError with Spanish user messages
- **Audit Logging**: Winston logger for all mutations (create/update/delete)
- **Naming Convention**: Kebab-case procedures (e.g., `'list-models'`, `'create-model'`)

---

## Common Types

```typescript
// Pagination
type PaginationInput = {
  page?: number;      // Default: 1
  limit?: number;     // Default: 20, max: 100
};

type PaginationOutput<T> = {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

// Sort
type SortInput = {
  field: string;
  order: 'asc' | 'desc';
};

// Status filters
type ModelStatusFilter = 'all' | 'draft' | 'published';
type ActiveFilter = 'all' | 'active' | 'inactive';
```

---

## Router Structure

```typescript
// src/server/api/root.ts
export const appRouter = createTRPCRouter({
  // ... existing routers
  admin: createTRPCRouter({
    model: modelRouter,
    glassType: glassTypeRouter,
    service: serviceRouter,
    profileSupplier: profileSupplierRouter,
    glassSupplier: glassSupplierRouter,
    glassSolution: glassSolutionRouter,
    glassCharacteristic: glassCharacteristicRouter,
  }),
});
```

---

## Entity Routers

### 1. Model Router

**File**: `src/server/api/routers/admin/model.ts`

#### Procedures

##### `list`
**Type**: Query  
**Description**: List models with filtering, search, and pagination

```typescript
Input: z.object({
  // Pagination
  page: z.number().int().positive().optional().default(1),
  limit: z.number().int().positive().max(100).optional().default(20),
  
  // Filters
  status: z.enum(['all', 'draft', 'published']).optional().default('all'),
  profileSupplierId: z.string().cuid().optional(),
  
  // Search
  search: z.string().optional(), // Search by name
  
  // Sort
  sortBy: z.enum(['name', 'createdAt', 'updatedAt', 'basePrice']).optional().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
})

Output: z.object({
  items: z.array(z.object({
    id: z.string(),
    name: z.string(),
    status: z.enum(['draft', 'published']),
    profileSupplier: z.object({
      id: z.string(),
      name: z.string(),
      materialType: z.enum(['PVC', 'ALUMINUM', 'WOOD', 'MIXED']),
    }).nullable(),
    basePrice: z.number(),
    minWidthMm: z.number(),
    maxWidthMm: z.number(),
    minHeightMm: z.number(),
    maxHeightMm: z.number(),
    compatibleGlassTypeIds: z.array(z.string()),
    createdAt: z.date(),
    updatedAt: z.date(),
  })),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
  totalPages: z.number(),
})
```

##### `get-by-id`
**Type**: Query  
**Description**: Get model details by ID

```typescript
Input: z.object({
  id: z.string().cuid(),
})

Output: z.object({
  id: z.string(),
  profileSupplierId: z.string().nullable(),
  profileSupplier: z.object({
    id: z.string(),
    name: z.string(),
    materialType: z.enum(['PVC', 'ALUMINUM', 'WOOD', 'MIXED']),
  }).nullable(),
  name: z.string(),
  status: z.enum(['draft', 'published']),
  minWidthMm: z.number(),
  maxWidthMm: z.number(),
  minHeightMm: z.number(),
  maxHeightMm: z.number(),
  basePrice: z.number(),
  costPerMmWidth: z.number(),
  costPerMmHeight: z.number(),
  accessoryPrice: z.number().nullable(),
  glassDiscountWidthMm: z.number(),
  glassDiscountHeightMm: z.number(),
  compatibleGlassTypeIds: z.array(z.string()),
  profitMarginPercentage: z.number().nullable(),
  lastCostReviewDate: z.date().nullable(),
  costNotes: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
  costBreakdown: z.array(z.object({
    id: z.string(),
    component: z.string(),
    costType: z.enum(['fixed', 'per_mm_width', 'per_mm_height', 'per_sqm']),
    unitCost: z.number(),
    notes: z.string().nullable(),
  })),
  priceHistory: z.array(z.object({
    id: z.string(),
    basePrice: z.number(),
    costPerMmWidth: z.number(),
    costPerMmHeight: z.number(),
    reason: z.string().nullable(),
    effectiveFrom: z.date(),
    createdBy: z.string().nullable(),
    createdAt: z.date(),
  })),
})
```

##### `create`
**Type**: Mutation  
**Description**: Create new model

```typescript
Input: z.object({
  profileSupplierId: z.string().cuid().nullable(),
  name: z.string().min(1).max(100),
  status: z.enum(['draft', 'published']).default('draft'),
  minWidthMm: z.number().int().positive(),
  maxWidthMm: z.number().int().positive(),
  minHeightMm: z.number().int().positive(),
  maxHeightMm: z.number().int().positive(),
  basePrice: z.number().positive(),
  costPerMmWidth: z.number().nonnegative(),
  costPerMmHeight: z.number().nonnegative(),
  accessoryPrice: z.number().positive().nullable(),
  glassDiscountWidthMm: z.number().int().nonnegative().default(0),
  glassDiscountHeightMm: z.number().int().nonnegative().default(0),
  compatibleGlassTypeIds: z.array(z.string().cuid()).min(1),
  profitMarginPercentage: z.number().min(0).max(100).nullable(),
  lastCostReviewDate: z.date().nullable(),
  costNotes: z.string().max(500).nullable(),
}).refine(
  (data) => data.minWidthMm <= data.maxWidthMm,
  { message: 'El ancho mínimo debe ser menor o igual al ancho máximo', path: ['minWidthMm'] }
).refine(
  (data) => data.minHeightMm <= data.maxHeightMm,
  { message: 'El alto mínimo debe ser menor o igual al alto máximo', path: ['minHeightMm'] }
)

Output: z.object({
  id: z.string(),
  name: z.string(),
  status: z.enum(['draft', 'published']),
  createdAt: z.date(),
})
```

##### `update`
**Type**: Mutation  
**Description**: Update existing model (triggers price history if price fields changed)

```typescript
Input: z.object({
  id: z.string().cuid(),
  profileSupplierId: z.string().cuid().nullable().optional(),
  name: z.string().min(1).max(100).optional(),
  status: z.enum(['draft', 'published']).optional(),
  minWidthMm: z.number().int().positive().optional(),
  maxWidthMm: z.number().int().positive().optional(),
  minHeightMm: z.number().int().positive().optional(),
  maxHeightMm: z.number().int().positive().optional(),
  basePrice: z.number().positive().optional(),
  costPerMmWidth: z.number().nonnegative().optional(),
  costPerMmHeight: z.number().nonnegative().optional(),
  accessoryPrice: z.number().positive().nullable().optional(),
  glassDiscountWidthMm: z.number().int().nonnegative().optional(),
  glassDiscountHeightMm: z.number().int().nonnegative().optional(),
  compatibleGlassTypeIds: z.array(z.string().cuid()).min(1).optional(),
  profitMarginPercentage: z.number().min(0).max(100).nullable().optional(),
  lastCostReviewDate: z.date().nullable().optional(),
  costNotes: z.string().max(500).nullable().optional(),
  priceChangeReason: z.string().max(200).optional(), // Required if price fields changed >10%
})

Output: z.object({
  id: z.string(),
  name: z.string(),
  updatedAt: z.date(),
})
```

##### `delete`
**Type**: Mutation  
**Description**: Delete model (only if no associated quote items)

```typescript
Input: z.object({
  id: z.string().cuid(),
})

Output: z.object({
  success: z.boolean(),
  message: z.string(),
})

// Possible Errors:
// - TRPCError(CONFLICT): "No se puede eliminar el modelo porque tiene X items de cotización asociados"
```

##### `add-cost-breakdown`
**Type**: Mutation  
**Description**: Add cost breakdown component to model

```typescript
Input: z.object({
  modelId: z.string().cuid(),
  component: z.string().min(1).max(100),
  costType: z.enum(['fixed', 'per_mm_width', 'per_mm_height', 'per_sqm']),
  unitCost: z.number().positive(),
  notes: z.string().max(500).nullable(),
})

Output: z.object({
  id: z.string(),
  modelId: z.string(),
  component: z.string(),
  createdAt: z.date(),
})
```

##### `update-cost-breakdown`
**Type**: Mutation  
**Description**: Update cost breakdown component

```typescript
Input: z.object({
  id: z.string().cuid(),
  component: z.string().min(1).max(100).optional(),
  costType: z.enum(['fixed', 'per_mm_width', 'per_mm_height', 'per_sqm']).optional(),
  unitCost: z.number().positive().optional(),
  notes: z.string().max(500).nullable().optional(),
})

Output: z.object({
  id: z.string(),
  updatedAt: z.date(),
})
```

##### `delete-cost-breakdown`
**Type**: Mutation  
**Description**: Delete cost breakdown component

```typescript
Input: z.object({
  id: z.string().cuid(),
})

Output: z.object({
  success: z.boolean(),
})
```

---

### 2. GlassType Router

**File**: `src/server/api/routers/admin/glass-type.ts`

#### Procedures

##### `list`
**Type**: Query  
**Description**: List glass types with filtering, search, and pagination

```typescript
Input: z.object({
  // Pagination
  page: z.number().int().positive().optional().default(1),
  limit: z.number().int().positive().max(100).optional().default(20),
  
  // Filters
  isActive: z.enum(['all', 'active', 'inactive']).optional().default('all'),
  glassSupplierId: z.string().cuid().optional(),
  thicknessMm: z.number().int().positive().optional(),
  
  // Search
  search: z.string().optional(), // Search by name or SKU
  
  // Sort
  sortBy: z.enum(['name', 'thicknessMm', 'pricePerSqm', 'createdAt']).optional().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
})

Output: z.object({
  items: z.array(z.object({
    id: z.string(),
    name: z.string(),
    thicknessMm: z.number(),
    pricePerSqm: z.number(),
    glassSupplier: z.object({
      id: z.string(),
      name: z.string(),
    }).nullable(),
    sku: z.string().nullable(),
    isActive: z.boolean(),
    createdAt: z.date(),
    updatedAt: z.date(),
    solutions: z.array(z.object({
      solutionId: z.string(),
      solutionKey: z.string(),
      solutionName: z.string(),
      isPrimary: z.boolean(),
    })),
  })),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
  totalPages: z.number(),
})
```

##### `get-by-id`
**Type**: Query  
**Description**: Get glass type details by ID

```typescript
Input: z.object({
  id: z.string().cuid(),
})

Output: z.object({
  id: z.string(),
  name: z.string(),
  purpose: z.enum(['general', 'insulation', 'security', 'decorative']), // Deprecated
  thicknessMm: z.number(),
  pricePerSqm: z.number(),
  uValue: z.number().nullable(),
  isTempered: z.boolean(), // Deprecated
  isLaminated: z.boolean(), // Deprecated
  isLowE: z.boolean(), // Deprecated
  isTripleGlazed: z.boolean(), // Deprecated
  glassSupplierId: z.string().nullable(),
  glassSupplier: z.object({
    id: z.string(),
    name: z.string(),
    code: z.string().nullable(),
  }).nullable(),
  sku: z.string().nullable(),
  description: z.string().nullable(),
  solarFactor: z.number().nullable(),
  lightTransmission: z.number().nullable(),
  isActive: z.boolean(),
  lastReviewDate: z.date().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
  solutions: z.array(z.object({
    id: z.string(),
    solutionId: z.string(),
    solution: z.object({
      id: z.string(),
      key: z.string(),
      name: z.string(),
      nameEs: z.string(),
    }),
    performanceRating: z.enum(['basic', 'standard', 'good', 'very_good', 'excellent']),
    isPrimary: z.boolean(),
    notes: z.string().nullable(),
  })),
  characteristics: z.array(z.object({
    id: z.string(),
    characteristicId: z.string(),
    characteristic: z.object({
      id: z.string(),
      key: z.string(),
      name: z.string(),
      nameEs: z.string(),
      category: z.string(),
    }),
    value: z.string().nullable(),
    certification: z.string().nullable(),
    notes: z.string().nullable(),
  })),
  priceHistory: z.array(z.object({
    id: z.string(),
    pricePerSqm: z.number(),
    reason: z.string().nullable(),
    effectiveFrom: z.date(),
    createdBy: z.string().nullable(),
    createdAt: z.date(),
  })),
})
```

##### `create`
**Type**: Mutation  
**Description**: Create new glass type with solutions and characteristics

```typescript
Input: z.object({
  name: z.string().min(1).max(100),
  purpose: z.enum(['general', 'insulation', 'security', 'decorative']).default('general'), // Deprecated, legacy field
  thicknessMm: z.number().int().positive().min(3).max(50),
  pricePerSqm: z.number().positive(),
  uValue: z.number().positive().nullable(),
  glassSupplierId: z.string().cuid().nullable(),
  sku: z.string().max(50).nullable(),
  description: z.string().max(500).nullable(),
  solarFactor: z.number().min(0).max(1).nullable(),
  lightTransmission: z.number().min(0).max(1).nullable(),
  isActive: z.boolean().default(true),
  lastReviewDate: z.date().nullable(),
  
  // Solutions (Many-to-Many)
  solutions: z.array(z.object({
    solutionId: z.string().cuid(),
    performanceRating: z.enum(['basic', 'standard', 'good', 'very_good', 'excellent']),
    isPrimary: z.boolean().default(false),
    notes: z.string().max(500).nullable(),
  })).optional().default([]),
  
  // Characteristics (Many-to-Many)
  characteristics: z.array(z.object({
    characteristicId: z.string().cuid(),
    value: z.string().max(100).nullable(),
    certification: z.string().max(100).nullable(),
    notes: z.string().max(500).nullable(),
  })).optional().default([]),
}).refine(
  (data) => data.solutions.filter(s => s.isPrimary).length <= 1,
  { message: 'Solo una solución puede ser primaria', path: ['solutions'] }
)

Output: z.object({
  id: z.string(),
  name: z.string(),
  isActive: z.boolean(),
  createdAt: z.date(),
})
```

##### `update`
**Type**: Mutation  
**Description**: Update glass type (triggers price history if pricePerSqm changed)

```typescript
Input: z.object({
  id: z.string().cuid(),
  name: z.string().min(1).max(100).optional(),
  thicknessMm: z.number().int().positive().min(3).max(50).optional(),
  pricePerSqm: z.number().positive().optional(),
  uValue: z.number().positive().nullable().optional(),
  glassSupplierId: z.string().cuid().nullable().optional(),
  sku: z.string().max(50).nullable().optional(),
  description: z.string().max(500).nullable().optional(),
  solarFactor: z.number().min(0).max(1).nullable().optional(),
  lightTransmission: z.number().min(0).max(1).nullable().optional(),
  isActive: z.boolean().optional(),
  lastReviewDate: z.date().nullable().optional(),
  priceChangeReason: z.string().max(200).optional(), // Required if pricePerSqm changed >10%
  
  // Solutions (Replace all)
  solutions: z.array(z.object({
    solutionId: z.string().cuid(),
    performanceRating: z.enum(['basic', 'standard', 'good', 'very_good', 'excellent']),
    isPrimary: z.boolean(),
    notes: z.string().max(500).nullable(),
  })).optional(),
  
  // Characteristics (Replace all)
  characteristics: z.array(z.object({
    characteristicId: z.string().cuid(),
    value: z.string().max(100).nullable(),
    certification: z.string().max(100).nullable(),
    notes: z.string().max(500).nullable(),
  })).optional(),
})

Output: z.object({
  id: z.string(),
  name: z.string(),
  updatedAt: z.date(),
})
```

##### `delete`
**Type**: Mutation  
**Description**: Delete glass type (only if no associated quote items)

```typescript
Input: z.object({
  id: z.string().cuid(),
})

Output: z.object({
  success: z.boolean(),
  message: z.string(),
})

// Possible Errors:
// - TRPCError(CONFLICT): "No se puede eliminar el tipo de vidrio porque tiene X items de cotización asociados"
```

---

### 3. Service Router

**File**: `src/server/api/routers/admin/service.ts`

#### Procedures

##### `list`
**Type**: Query

```typescript
Input: z.object({
  page: z.number().int().positive().optional().default(1),
  limit: z.number().int().positive().max(100).optional().default(20),
  type: z.enum(['area', 'perimeter', 'fixed', 'all']).optional().default('all'),
  search: z.string().optional(),
  sortBy: z.enum(['name', 'type', 'rate', 'createdAt']).optional().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
})

Output: PaginationOutput<Service>
```

##### `get-by-id`
**Type**: Query

```typescript
Input: z.object({
  id: z.string().cuid(),
})

Output: Service (with full details)
```

##### `create`
**Type**: Mutation

```typescript
Input: z.object({
  name: z.string().min(1).max(100),
  type: z.enum(['area', 'perimeter', 'fixed']),
  unit: z.enum(['unit', 'sqm', 'ml']),
  rate: z.number().positive(),
})

Output: z.object({ id: z.string(), name: z.string() })
```

##### `update`
**Type**: Mutation

```typescript
Input: z.object({
  id: z.string().cuid(),
  name: z.string().min(1).max(100).optional(),
  type: z.enum(['area', 'perimeter', 'fixed']).optional(),
  unit: z.enum(['unit', 'sqm', 'ml']).optional(),
  rate: z.number().positive().optional(),
})

Output: z.object({ id: z.string(), updatedAt: z.date() })
```

##### `delete`
**Type**: Mutation

```typescript
Input: z.object({ id: z.string().cuid() })
Output: z.object({ success: z.boolean() })
// Error: TRPCError(CONFLICT) if used in quote item services
```

---

## Summary

**Total Procedures Defined**: 21 core procedures across 7 routers

**Next Steps**:
1. Implement Zod schemas in `lib/validations/admin/*.schema.ts`
2. Implement tRPC routers in `server/api/routers/admin/*.ts`
3. Create service layer utilities in `server/services/*.service.ts`
4. Implement forms in `app/(dashboard)/admin/*/\_components/*.tsx`
5. Write unit tests for all procedures
6. Write E2E tests for full CRUD workflows

**Contract Validation**: All schemas follow Prisma database constraints and business rules documented in `data-model.md`
