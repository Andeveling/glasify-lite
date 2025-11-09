# Module Architecture Standards

**Version**: 2.0 (drizzle-zod)  
**Last Updated**: 2025-11-08  
**Status**: Mandatory for all new modules

## Quick Win: drizzle-zod Plugin

🎯 **Single Source of Truth** for database schemas + validation:
- ✅ **42% fewer lines** (glass-solution: 174→101 lines)
- ✅ **Zero duplication** - schemas auto-sync with Drizzle tables
- ✅ **Full type safety** - `z.infer<>` from generated schemas
- ✅ **Automatic validation** - Database types always match API contracts

**Before** (Manual duplication):
```typescript
// Manual schema replication = maintenance burden
const glassItemSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  thickness: z.number().positive(),
  // ... many more fields to keep in sync
});
```

**After** (drizzle-zod):
```typescript
// Auto-generated = always in sync
export const SelectGlassItemSchema = createSelectSchema(glassItems);
export const InsertGlassItemSchema = createInsertSchema(glassItems);

// Add custom validations only where needed
export const createInput = InsertGlassItemSchema.pick({
  name: true,
  thickness: true,
}).extend({
  name: z.string().min(3, "Nombre debe tener al menos 3 caracteres"),
});
```

## Philosophy

All API modules follow **Clean Architecture** + **SOLID** with **drizzle-zod** as validation core:
- **Single Schema Source**: One Drizzle table definition → auto-generated Zod schemas
- **Type Safety**: Full end-to-end typing from DB to API response
- **Maintainability**: Changes to schema automatically propagate
- **Testability**: Each layer independently testable

---

## Module Structure

```
src/server/api/routers/{module-name}/
├── index.ts                      # Router composition (thin)
├── {module}.queries.ts           # tRPC read procedures
├── {module}.mutations.ts         # tRPC write procedures
├── {module}.schemas.ts           # Zod + drizzle-zod (core)
├── {module}.service.ts           # Business logic
├── {module}.utils.ts             # Serialization/calculations
├── repositories/
│   └── {module}-repository.ts    # Drizzle queries
└── utils/
    └── {module}-logger.ts        # Winston logging
```

---

## Core Pattern: Drizzle → Zod → tRPC

### 1. Drizzle Table (Source of Truth)

```typescript
// src/server/db/schema.ts
export const glassItems = pgTable("glass_items", {
  id: text("id").primaryKey().default(sql`gen_id()`),
  name: text("name").notNull(),
  thickness: numeric("thickness", { precision: 5, scale: 2 }).notNull(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
```

### 2. Auto-Generated Schemas (drizzle-zod)

```typescript
// src/server/api/routers/admin/glass-solution/glass-solution.schemas.ts
import { createSelectSchema, createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { glassItems } from "@/server/db/schema";

// ✅ Auto-generated - always in sync with table
export const SelectGlassItemSchema = createSelectSchema(glassItems);
export const InsertGlassItemSchema = createInsertSchema(glassItems);

// ✅ Compose for specific use cases
export const createInput = InsertGlassItemSchema.pick({
  name: true,
  thickness: true,
}).extend({
  // Add business rules only
  name: z.string().min(3, "Nombre debe tener al menos 3 caracteres"),
  thickness: z.number().positive("Espesor debe ser positivo"),
});

export const updateInput = InsertGlassItemSchema.partial().extend({
  id: z.string(), // Add ID for updates
});

// ✅ Output schema with computed fields
export const glassItemOutput = SelectGlassItemSchema.extend({
  thickness: z.number(), // Convert string → number
});

// ✅ Type inference - auto-updated if table changes
export type CreateInput = z.infer<typeof createInput>;
export type UpdateInput = z.infer<typeof updateInput>;
export type GlassItemOutput = z.infer<typeof glassItemOutput>;
```

**Key Benefits**:
1. ❌ No manual type duplication
2. ✅ Table changes auto-sync to validation
3. ✅ Fewer lines (42% reduction in glass-solution)
4. ✅ TypeScript errors if schema breaks contract

### 3. Service Layer (Orchestration)

```typescript
// src/server/api/routers/admin/glass-solution/glass-solution.service.ts
import type { db } from "@/server/db/drizzle";
import { 
  findGlassItemById, 
  updateGlassItem as updateRepo 
} from "./repositories/glass-solution-repository";
import { glassItemOutput } from "./glass-solution.schemas";

type DbClient = typeof db;

export async function getGlassItemById(
  client: DbClient,
  itemId: string
): Promise<z.infer<typeof glassItemOutput>> {
  const item = await findGlassItemById(client, itemId);
  if (!item) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Elemento no encontrado",
    });
  }
  // Serialize: convert NUMERIC string → number
  return {
    ...item,
    thickness: Number.parseFloat(item.thickness),
  };
}
```

### 4. tRPC Procedures (Thin Layer)

```typescript
// src/server/api/routers/admin/glass-solution/glass-solution.queries.ts
import { createTRPCRouter, adminProcedure } from "@/server/api/trpc";
import { 
  getByIdInput,         // ← from schemas
  glassItemOutput,      // ← from schemas
} from "./glass-solution.schemas";
import { getGlassItemById } from "./glass-solution.service";

export const glassItemQueries = createTRPCRouter({
  getById: adminProcedure
    .input(getByIdInput)           // ✅ Input validation
    .output(glassItemOutput)        // ✅ Output validation
    .query(async ({ ctx, input }) =>
      getGlassItemById(ctx.db, input.id)
    ),
});
```

### 5. Router Composition (Minimal)

```typescript
// src/server/api/routers/admin/glass-solution/index.ts
import { createTRPCRouter } from "@/server/api/trpc";
import { glassItemQueries } from "./glass-solution.queries";
import { glassItemMutations } from "./glass-solution.mutations";

export const glassItemRouter = createTRPCRouter({
  ...glassItemQueries._def.procedures,
  ...glassItemMutations._def.procedures,
});

// Export schemas for external use (forms, etc.)
export * from "./glass-solution.schemas";
```

---

## Detailed Layer Patterns

### Repository: Pure Drizzle, No Business Logic

```typescript
// src/server/api/routers/admin/glass-solution/repositories/glass-solution-repository.ts
import { eq } from "drizzle-orm";
import type { db } from "@/server/db/drizzle";
import { glassItems } from "@/server/db/schema";

type DbClient = typeof db;

/**
 * Find glass item by ID
 * Returns: raw Drizzle types (NUMERIC as string)
 */
export async function findGlassItemById(
  client: DbClient,
  itemId: string
) {
  return await client
    .select()
    .from(glassItems)
    .where(eq(glassItems.id, itemId))
    .then((rows) => rows[0] ?? null);
}

/**
 * Update glass item
 * No business logic - just execute SQL
 */
export async function updateGlassItem(
  client: DbClient,
  itemId: string,
  data: Partial<{ name: string; thickness: string }>
) {
  const [item] = await client
    .update(glassItems)
    .set(data)
    .where(eq(glassItems.id, itemId))
    .returning();
  return item ?? null;
}
```

**Key Rules**:
- Use `client` parameter name (not `db` - avoids shadowing)
- Return raw Drizzle types (strings for NUMERIC)
- No error handling (let exceptions propagate)
- No logging (service layer's responsibility)

### Service: Business Logic + Error Handling

```typescript
// Complexity Reduction Pattern ⭐
export async function updateGlassItemService(
  client: DbClient,
  itemId: string,
  data: UpdateInput
) {
  try {
    // 1. Fetch existing
    const existing = await findGlassItemById(client, itemId);
    if (!existing) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Elemento no encontrado",
      });
    }

    // 2. Extract helper (reduces cognitive complexity 16→<15)
    const updateData = buildUpdateValues(existing, data);

    // 3. Update
    const updated = await updateGlassItem(client, itemId, updateData);

    logger.info("[GlassSolution] Item updated", { itemId });
    
    return serialize(updated);
  } catch (error) {
    if (error instanceof TRPCError) throw error;
    logger.error("[GlassSolution] Update failed", { itemId, error });
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Error al actualizar elemento",
    });
  }
}

// Helper to reduce complexity
function buildUpdateValues(
  existing: any,
  data: UpdateInput
): Partial<{ name: string; thickness: string }> {
  const updates: Record<string, string> = {};
  if (data.name && data.name !== existing.name) updates.name = data.name;
  if (data.thickness && data.thickness !== existing.thickness) {
    updates.thickness = String(data.thickness);
  }
  return updates;
}
```

**Key Rules**:
- Orchestrate repo + validation
- Convert types (string → number for decimals)
- Log all operations
- Throw `TRPCError` with Spanish messages
- Extract helpers when complexity > 15

### Schemas: drizzle-zod as Foundation

```typescript
// ✅ Pattern 1: Simple input - pick relevant fields
export const createInput = InsertGlassItemSchema.pick({
  name: true,
  thickness: true,
}).extend({
  name: z.string().min(3), // Business rule validation
});

// ✅ Pattern 2: Partial for updates
export const updateInput = InsertGlassItemSchema.partial().extend({
  id: z.string().cuid2(), // Add required fields
});

// ✅ Pattern 3: Output with type conversion
export const glassItemOutput = SelectGlassItemSchema.extend({
  thickness: z.number(), // NUMERIC string → number
  createdAt: z.string().datetime(), // Date → ISO string
});

// ✅ Pattern 4: List responses
export const glassItemListOutput = z.object({
  items: z.array(glassItemOutput),
  total: z.number().int(),
  page: z.number().int(),
  totalPages: z.number().int(),
});
```

---

## Error Handling Guide

### TRPCError Codes (Spanish Messages)

```typescript
throw new TRPCError({
  code: "NOT_FOUND",
  message: "Elemento no encontrado", // ✅ Spanish
});

throw new TRPCError({
  code: "BAD_REQUEST",
  message: "Nombre debe tener al menos 3 caracteres",
});

throw new TRPCError({
  code: "CONFLICT",
  message: "El nombre ya existe",
});

throw new TRPCError({
  code: "FORBIDDEN",
  message: "No tienes permisos para esta acción",
});
```

---

## Type System: Decimals & Dates

### NUMERIC Handling

Drizzle returns PostgreSQL `NUMERIC` as **strings** for precision:

```typescript
// Repository: Return string (raw Drizzle)
const item = {
  id: "123",
  price: "19.99",  // string
  createdAt: Date,
};

// Service: Convert to number for API
return {
  ...item,
  price: Number.parseFloat(item.price),  // string → number
  createdAt: item.createdAt.toISOString(),
};

// Schema: Validate as number (output)
export const itemOutput = SelectItemSchema.extend({
  price: z.number(),
  createdAt: z.string().datetime(),
});
```

---

### Unit Tests

```typescript
describe("{module}.service", () => {
  it("should throw NOT_FOUND when item doesn't exist", async () => {
    vi.spyOn(repository, "findItemById").mockResolvedValue(null);
    
    await expect(getItemById(mockDb, "123"))
      .rejects.toThrow("Elemento no encontrado");
  });
});
```

### Integration Tests

```typescript
describe("{module} procedures", () => {
  it("should create item", async () => {
    const caller = appRouter.createCaller({ db: testDb });
    const item = await caller.{module}.create({
      name: "Test Item",
    });
    
    expect(item.id).toBeDefined();
  });
});
```

---

## Quick Checklist: New Module

1. ✅ Create `/src/server/api/routers/{module}/` directory
2. ✅ Create `repositories/{module}-repository.ts` with Drizzle queries
3. ✅ Create `{module}.schemas.ts` using `createSelectSchema` + `createInsertSchema`
4. ✅ Create `{module}.service.ts` with business logic
5. ✅ Create `{module}.queries.ts` with read procedures
6. ✅ Create `{module}.mutations.ts` with write procedures
7. ✅ Create `index.ts` combining both routers + exporting schemas
8. ✅ Run `biome check --fix` to ensure zero errors
9. ✅ Import router in `/src/server/api/routers/admin.ts` or `root.ts`

**References**:
- ✅ glass-solution: `/src/server/api/routers/admin/glass-solution/` (Production-ready)
- ✅ address: `/src/server/api/routers/admin/address/` (Production-ready)

---

## Key Rules at a Glance

| Layer                 | Focus                   | Tools              |
| --------------------- | ----------------------- | ------------------ |
| **Repository**        | SQL queries only        | Drizzle ORM        |
| **Schemas**           | Validation + types      | drizzle-zod + Zod  |
| **Service**           | Business logic + errors | Winston, TRPCError |
| **Queries/Mutations** | tRPC procedures         | tRPC procedures    |
| **Router**            | Thin composition        | _def.procedures    |

**drizzle-zod Benefits**:
- Single source of truth (table → schemas auto-sync)
- 42% fewer lines (glass-solution: 174 → 101)
- Type safety with `z.infer<>`
- Zero manual duplication

---

**Status**: Mandatory for all new modules. Reference: glass-solution & address implementations.
