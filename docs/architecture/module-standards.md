# Module Architecture Standards

**Version**: 1.0  
**Last Updated**: 2025-11-08  
**Status**: Mandatory for all new modules

## Philosophy

All API modules MUST follow **Clean Architecture** + **SOLID Principles** to ensure:
- **Maintainability**: Easy to understand and modify
- **Testability**: Each layer can be tested independently
- **Scalability**: Easy to add features without breaking existing code
- **Consistency**: Same patterns across the entire codebase

---

## Standard Module Structure

```
src/server/api/routers/{module-name}/
├── index.ts                           # Router entry point (thin composition)
├── {module}.queries.ts                # tRPC read operations (GET)
├── {module}.mutations.ts              # tRPC write operations (POST/PUT/DELETE)
├── {module}.schemas.ts                # Zod validation schemas (input/output)
├── {module}.service.ts                # Business logic orchestration
├── {module}.utils.ts                  # Serialization, calculations, formatters
├── README.md                          # Module documentation
├── repositories/
│   └── {module}-repository.ts         # Data access layer (Drizzle ORM)
└── utils/
    └── {module}-logger.ts             # Structured logging (Winston)
```

---

## Layer Responsibilities

### 1. Router Entry Point (`index.ts`)

**Purpose**: Compose queries and mutations into a single router.

**Rules**:
- ✅ **DO**: Merge routers using spread syntax
- ✅ **DO**: Export schemas for external use
- ❌ **DON'T**: Include any business logic
- ❌ **DON'T**: Import repositories directly

**Template**:
```typescript
/**
 * {Module} Router - Thin composition
 * @module server/api/routers/{module}
 */
import { createTRPCRouter } from "@/server/api/trpc";
import { {module}Queries } from "./{module}.queries";
import { {module}Mutations } from "./{module}.mutations";

export const {module}Router = createTRPCRouter({
  ...{module}Queries._def.procedures,
  ...{module}Mutations._def.procedures,
});

// Export schemas for form validation
export * from "./{module}.schemas";
```

---

### 2. tRPC Procedures (`*.queries.ts`, `*.mutations.ts`)

**Purpose**: Define HTTP API endpoints with validation.

**Rules**:
- ✅ **DO**: Keep procedures thin (1-3 lines)
- ✅ **DO**: Delegate all logic to service layer
- ✅ **DO**: Use appropriate procedure type:
  - `publicProcedure` - No auth required
  - `protectedProcedure` - Requires auth
  - `adminProcedure` - Admin-only
  - `sellerProcedure` - Seller or Admin
- ✅ **DO**: Validate input with `.input(schema)`
- ✅ **DO**: Validate output with `.output(schema)`
- ❌ **DON'T**: Access database directly
- ❌ **DON'T**: Include business logic

**Template** (`{module}.queries.ts`):
```typescript
/**
 * {Module} Queries - Read Operations
 * @module server/api/routers/{module}/{module}.queries
 */
import { createTRPCRouter, publicProcedure, protectedProcedure } from "@/server/api/trpc";
import { z } from "zod";
import { getListInput, getByIdInput, itemOutput } from "./{module}.schemas";
import { getItemById, getItemsList } from "./{module}.service";

export const {module}Queries = createTRPCRouter({
  /**
   * Get single item by ID
   */
  getById: publicProcedure
    .input(getByIdInput)
    .output(itemOutput)
    .query(async ({ ctx, input }) => 
      getItemById(ctx.db, input.id)
    ),

  /**
   * Get paginated list
   */
  list: publicProcedure
    .input(getListInput)
    .output(z.object({
      items: z.array(itemOutput),
      total: z.number(),
      page: z.number(),
      totalPages: z.number(),
    }))
    .query(async ({ ctx, input }) =>
      getItemsList(ctx.db, input)
    ),
});
```

**Template** (`{module}.mutations.ts`):
```typescript
/**
 * {Module} Mutations - Write Operations
 * @module server/api/routers/{module}/{module}.mutations
 */
import { createTRPCRouter, protectedProcedure, adminProcedure } from "@/server/api/trpc";
import { z } from "zod";
import { createInput, updateInput, deleteInput, itemOutput } from "./{module}.schemas";
import { createItem, updateItem, deleteItem } from "./{module}.service";

export const {module}Mutations = createTRPCRouter({
  /**
   * Create new item
   */
  create: adminProcedure
    .input(createInput)
    .output(itemOutput)
    .mutation(async ({ ctx, input }) =>
      createItem(ctx.db, ctx.session.user.id, input)
    ),

  /**
   * Update existing item
   */
  update: adminProcedure
    .input(updateInput)
    .output(itemOutput)
    .mutation(async ({ ctx, input }) =>
      updateItem(ctx.db, ctx.session.user.id, input)
    ),

  /**
   * Delete item
   */
  delete: adminProcedure
    .input(deleteInput)
    .output(z.void())
    .mutation(async ({ ctx, input }) =>
      deleteItem(ctx.db, input.id)
    ),
});
```

---

### 3. Service Layer (`{module}.service.ts`)

**Purpose**: Business logic orchestration, error handling, validation.

**Rules**:
- ✅ **DO**: Orchestrate repository calls
- ✅ **DO**: Handle all errors (throw TRPCError with Spanish messages)
- ✅ **DO**: Log operations using logger utils
- ✅ **DO**: Serialize data (decimals, dates, etc.)
- ✅ **DO**: Validate business rules
- ✅ **DO**: Use descriptive function names (`getItemById`, not `get`)
- ✅ **DO**: Document complex operations with JSDoc
- ❌ **DON'T**: Build SQL queries directly
- ❌ **DON'T**: Import from Prisma

**Template**:
```typescript
/**
 * {Module} Service - Business Logic Layer
 *
 * Orchestrates data access and applies business rules.
 *
 * @module server/api/routers/{module}/{module}.service
 */
import { TRPCError } from "@trpc/server";
import type { db } from "@/server/db/drizzle";
import { findItemById, createItem as createItemRepo } from "./repositories/{module}-repository";
import { serializeItem } from "./{module}.utils";
import { logItemFetchStart, logItemFetchSuccess, logItemFetchError } from "./utils/{module}-logger";

// Type inference from Drizzle db instance
type DbClient = typeof db;

/**
 * Get item by ID
 *
 * @param client - Drizzle client instance
 * @param itemId - Item ID
 * @returns Serialized item
 * @throws TRPCError if not found
 */
export async function getItemById(client: DbClient, itemId: string) {
  try {
    logItemFetchStart(itemId);

    const item = await findItemById(client, itemId);

    if (!item) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Elemento no encontrado",
      });
    }

    logItemFetchSuccess(itemId);

    return serializeItem(item);
  } catch (error) {
    if (error instanceof TRPCError) {
      throw error;
    }
    logItemFetchError(itemId, error);
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Error al obtener el elemento",
    });
  }
}

/**
 * Create new item
 *
 * @param client - Drizzle client instance
 * @param userId - User ID (for audit)
 * @param data - Item data
 * @returns Created item
 * @throws TRPCError if validation fails
 */
export async function createItem(
  client: DbClient,
  userId: string,
  data: { name: string; description: string }
) {
  try {
    // Business rule validation
    if (data.name.length < 3) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "El nombre debe tener al menos 3 caracteres",
      });
    }

    const item = await createItemRepo(client, data);

    return serializeItem(item);
  } catch (error) {
    if (error instanceof TRPCError) {
      throw error;
    }
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Error al crear el elemento",
    });
  }
}
```

---

### 4. Repository Layer (`repositories/{module}-repository.ts`)

**Purpose**: Pure data access using Drizzle ORM.

**Rules**:
- ✅ **DO**: Build SQL queries with Drizzle query builder
- ✅ **DO**: Use type-safe schema imports
- ✅ **DO**: Return raw Drizzle types (strings for decimals)
- ✅ **DO**: Use descriptive function names (`findItemById`, not `getItem`)
- ✅ **DO**: Document complex joins with comments
- ✅ **DO**: Use `client` as parameter name (not `db` - avoids shadowing)
- ❌ **DON'T**: Include business logic
- ❌ **DON'T**: Throw errors (let them propagate)
- ❌ **DON'T**: Serialize data (service layer's job)
- ❌ **DON'T**: Log operations (service layer's job)

**Template**:
```typescript
/**
 * {Module} Repository - Data Access Layer
 *
 * Pure database operations using Drizzle ORM.
 * No business logic, no error handling, no logging.
 *
 * @module server/api/routers/{module}/repositories/{module}-repository
 */
import { eq, and, or, sql, count, desc } from "drizzle-orm";
import type { db } from "@/server/db/drizzle";
import { items, relatedItems } from "@/server/db/schema";

// Type inference from Drizzle db instance
type DbClient = typeof db;

/**
 * Find item by ID with relations
 *
 * @param client - Drizzle client instance
 * @param itemId - Item ID
 * @returns Item with relations or null
 */
export async function findItemById(client: DbClient, itemId: string) {
  return await client
    .select({
      // Item fields
      id: items.id,
      name: items.name,
      description: items.description,
      price: items.price, // string (NUMERIC type)
      createdAt: items.createdAt,
      // Related item fields
      relatedName: relatedItems.name,
    })
    .from(items)
    .leftJoin(relatedItems, eq(items.relatedId, relatedItems.id))
    .where(eq(items.id, itemId))
    .then((rows) => rows[0] ?? null);
}

/**
 * Count items matching filters
 *
 * @param client - Drizzle client instance
 * @param filters - Search filters
 * @returns Total count
 */
export async function countItems(
  client: DbClient,
  filters: { search?: string; isActive?: boolean }
) {
  const conditions = [];

  if (filters.search) {
    conditions.push(sql`LOWER(${items.name}) LIKE LOWER(${'%' + filters.search + '%'})`);
  }

  if (filters.isActive !== undefined) {
    conditions.push(eq(items.isActive, filters.isActive));
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  return await client
    .select({ count: count() })
    .from(items)
    .where(whereClause)
    .then((rows) => rows[0]?.count ?? 0);
}

/**
 * Create new item
 *
 * @param client - Drizzle client instance
 * @param data - Item data
 * @returns Created item
 */
export async function createItem(
  client: DbClient,
  data: { name: string; description: string }
) {
  const [item] = await client.insert(items).values(data).returning();
  return item;
}

/**
 * Update item
 *
 * @param client - Drizzle client instance
 * @param itemId - Item ID
 * @param data - Update data
 * @returns Updated item or null
 */
export async function updateItem(
  client: DbClient,
  itemId: string,
  data: Partial<{ name: string; description: string }>
) {
  const [item] = await client
    .update(items)
    .set(data)
    .where(eq(items.id, itemId))
    .returning();
  return item ?? null;
}

/**
 * Delete item
 *
 * @param client - Drizzle client instance
 * @param itemId - Item ID
 * @returns Deleted item or null
 */
export async function deleteItem(client: DbClient, itemId: string) {
  const [item] = await client
    .delete(items)
    .where(eq(items.id, itemId))
    .returning();
  return item ?? null;
}
```

---

### 5. Schemas Layer (`{module}.schemas.ts`)

**Purpose**: Zod validation for inputs and outputs.

**Rules**:
- ✅ **DO**: Use `createSelectSchema` and `createInsertSchema` from `drizzle-zod`
- ✅ **DO**: Define separate schemas for create/update/list/detail
- ✅ **DO**: Export TypeScript types with `z.infer<>`
- ✅ **DO**: Document complex validations
- ❌ **DON'T**: Include business logic in schemas

**Template**:
```typescript
/**
 * {Module} Schemas - Zod Validation
 *
 * Input/output schemas for tRPC procedures.
 * Based on Drizzle schemas with extensions.
 *
 * @module server/api/routers/{module}/{module}.schemas
 */
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { items } from "@/server/db/schema";

// ============================================================================
// DATABASE SCHEMAS
// ============================================================================

export const SelectItemSchema = createSelectSchema(items);
export const InsertItemSchema = createInsertSchema(items);

// ============================================================================
// INPUT SCHEMAS
// ============================================================================

export const getByIdInput = z.object({
  id: z.string().cuid2(),
});

export const getListInput = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
  search: z.string().optional(),
  isActive: z.boolean().optional(),
  sortBy: z.enum(["name", "createdAt"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export const createInput = InsertItemSchema.pick({
  name: true,
  description: true,
}).extend({
  // Additional validations
  name: z.string().min(3, "Nombre debe tener al menos 3 caracteres"),
});

export const updateInput = InsertItemSchema.pick({
  name: true,
  description: true,
}).partial().extend({
  id: z.string().cuid2(),
});

export const deleteInput = z.object({
  id: z.string().cuid2(),
});

// ============================================================================
// OUTPUT SCHEMAS
// ============================================================================

export const itemOutput = SelectItemSchema.extend({
  // Convert NUMERIC to number
  price: z.number(),
  // Add computed fields
  relatedName: z.string().nullable(),
});

export const itemListOutput = z.object({
  items: z.array(itemOutput),
  total: z.number().int(),
  page: z.number().int(),
  limit: z.number().int(),
  totalPages: z.number().int(),
});

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type GetByIdInput = z.infer<typeof getByIdInput>;
export type GetListInput = z.infer<typeof getListInput>;
export type CreateInput = z.infer<typeof createInput>;
export type UpdateInput = z.infer<typeof updateInput>;
export type DeleteInput = z.infer<typeof deleteInput>;
export type ItemOutput = z.infer<typeof itemOutput>;
export type ItemListOutput = z.infer<typeof itemListOutput>;
```

---

### 6. Utils Layer (`{module}.utils.ts`)

**Purpose**: Reusable utility functions (serialization, calculations).

**Rules**:
- ✅ **DO**: Keep functions pure (no side effects)
- ✅ **DO**: Convert Drizzle types (strings → numbers for decimals)
- ✅ **DO**: Format dates, currencies, etc.
- ❌ **DON'T**: Access database
- ❌ **DON'T**: Throw TRPCError (return values instead)

**Template**:
```typescript
/**
 * {Module} Utils - Serialization and Formatting
 *
 * Pure utility functions for data transformation.
 *
 * @module server/api/routers/{module}/{module}.utils
 */

/**
 * Serialize item from Drizzle format to API format
 *
 * Converts:
 * - NUMERIC strings to numbers
 * - Dates to ISO strings
 *
 * @param item - Raw item from repository
 * @returns Serialized item for API
 */
export function serializeItem(item: {
  id: string;
  name: string;
  price: string; // NUMERIC as string
  createdAt: Date;
}) {
  return {
    id: item.id,
    name: item.name,
    price: Number.parseFloat(item.price),
    createdAt: item.createdAt.toISOString(),
  };
}

/**
 * Calculate item total with discount
 *
 * @param price - Base price
 * @param quantity - Quantity
 * @param discount - Discount percentage (0-100)
 * @returns Total price
 */
export function calculateTotal(
  price: number,
  quantity: number,
  discount: number = 0
): number {
  const subtotal = price * quantity;
  const discountAmount = (subtotal * discount) / 100;
  return subtotal - discountAmount;
}
```

---

### 7. Logger Utils (`utils/{module}-logger.ts`)

**Purpose**: Structured logging with Winston.

**Rules**:
- ✅ **DO**: Use Winston logger from `@/lib/logger`
- ✅ **DO**: Include context objects (userId, itemId, etc.)
- ✅ **DO**: Create specific log functions (Start/Success/Error pattern)
- ✅ **DO**: Log at appropriate levels (info, warn, error)
- ❌ **DON'T**: Use in Client Components (server-side only)

**Template**:
```typescript
/**
 * {Module} Logger - Structured Logging
 *
 * Winston-based logging for audit and debugging.
 *
 * @module server/api/routers/{module}/utils/{module}-logger
 */
import logger from "@/lib/logger";

/**
 * Log item fetch start
 */
export function logItemFetchStart(itemId: string) {
  logger.info("[{Module}] Fetching item", { itemId });
}

/**
 * Log item fetch success
 */
export function logItemFetchSuccess(itemId: string) {
  logger.info("[{Module}] Item fetched successfully", { itemId });
}

/**
 * Log item fetch error
 */
export function logItemFetchError(itemId: string, error: unknown) {
  logger.error("[{Module}] Failed to fetch item", {
    itemId,
    error: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
  });
}

/**
 * Log item creation
 */
export function logItemCreated(itemId: string, userId: string) {
  logger.info("[{Module}] Item created", { itemId, userId });
}

/**
 * Log item update
 */
export function logItemUpdated(itemId: string, userId: string, changes: Record<string, unknown>) {
  logger.info("[{Module}] Item updated", { itemId, userId, changes });
}

/**
 * Log item deletion
 */
export function logItemDeleted(itemId: string, userId: string) {
  logger.info("[{Module}] Item deleted", { itemId, userId });
}
```

---

## Type System Guidelines

### Type Inference from Drizzle

**DON'T** import non-existent types:
```typescript
// ❌ WRONG - DrizzleDb doesn't exist
import type { DrizzleDb } from "@/server/db/drizzle";
```

**DO** use type inference:
```typescript
// ✅ CORRECT
import type { db } from "@/server/db/drizzle";
type DbClient = typeof db;
```

### Decimal/Numeric Handling

Drizzle stores PostgreSQL `NUMERIC`/`DECIMAL` as **strings** for precision.

**In Repository**: Return as string
```typescript
export async function findItem(client: DbClient, itemId: string) {
  return await client
    .select({
      price: items.price, // string
    })
    .from(items)
    .where(eq(items.id, itemId))
    .then((rows) => rows[0] ?? null);
}
```

**In Service**: Convert to number
```typescript
export async function getItem(client: DbClient, itemId: string) {
  const item = await findItem(client, itemId);
  return {
    ...item,
    price: Number.parseFloat(item.price), // string → number
  };
}
```

### Avoiding Shadowing Warnings

Use `client` as parameter name instead of `db`:
```typescript
// ❌ Causes shadowing warning
export async function findItem(db: DbClient, itemId: string) {
  return await db.select()... // shadows import { db }
}

// ✅ No shadowing warning
export async function findItem(client: DbClient, itemId: string) {
  return await client.select()...
}
```

---

## Error Handling

### Spanish Error Messages

All user-facing errors MUST be in Spanish:
```typescript
throw new TRPCError({
  code: "NOT_FOUND",
  message: "Elemento no encontrado", // ✅ Spanish
});

// ❌ WRONG
throw new TRPCError({
  code: "NOT_FOUND",
  message: "Item not found", // English
});
```

### Error Codes

Use semantic tRPC error codes:
- `NOT_FOUND` - Resource doesn't exist
- `BAD_REQUEST` - Invalid input
- `CONFLICT` - Duplicate/constraint violation
- `FORBIDDEN` - Not authorized (wrong role)
- `UNAUTHORIZED` - Not authenticated
- `PRECONDITION_FAILED` - Business rule violation
- `INTERNAL_SERVER_ERROR` - Unexpected errors

---

## Testing Strategy

### Unit Tests

Test each layer independently:

```typescript
// Service tests (mock repository)
describe("{module}.service", () => {
  it("should throw NOT_FOUND when item doesn't exist", async () => {
    const mockDb = {} as DbClient;
    vi.spyOn(repository, "findItemById").mockResolvedValue(null);
    
    await expect(getItemById(mockDb, "123"))
      .rejects.toThrow("Elemento no encontrado");
  });
});

// Repository tests (use test database)
describe("{module}-repository", () => {
  it("should find item by ID", async () => {
    const item = await findItemById(testDb, "existing-id");
    expect(item).toBeDefined();
    expect(item.id).toBe("existing-id");
  });
});
```

### Integration Tests

Test full tRPC procedure flow:

```typescript
describe("{module} procedures", () => {
  it("should create item", async () => {
    const caller = appRouter.createCaller({ db: testDb, session });
    const item = await caller.{module}.create({
      name: "Test Item",
      description: "Test Description",
    });
    
    expect(item.id).toBeDefined();
    expect(item.name).toBe("Test Item");
  });
});
```

---

## Migration Checklist

When migrating an existing module to this standard:

- [ ] Create directory structure (`repositories/`, `utils/`)
- [ ] Split monolith into layers (queries, mutations, service, repository)
- [ ] Remove all Prisma imports and queries
- [ ] Convert Prisma queries to Drizzle
- [ ] Create logger utils (Start/Success/Error functions)
- [ ] Add serialization utils (decimals, dates)
- [ ] Update schemas to use `drizzle-zod`
- [ ] Use `client` parameter name (not `db`)
- [ ] Add Spanish error messages
- [ ] Create README.md with module documentation
- [ ] Add unit tests for service layer
- [ ] Add integration tests for procedures
- [ ] Update `root.ts` to include new router

---

## Examples

Reference implementations:
- ✅ **cart**: `/src/server/api/routers/cart/` (Complete)
- ✅ **catalog**: `/src/server/api/routers/catalog/` (Complete)
- ⏳ **admin/colors**: `/src/server/api/routers/admin/colors.ts` (Needs migration)
- ⏳ **quote**: `/src/server/api/routers/quote/` (Needs migration)

---

## FAQs

**Q: Why `client` instead of `db` for parameter name?**  
A: To avoid shadowing the imported `db` singleton, which causes lint warnings.

**Q: Why return strings for decimals in repository?**  
A: Drizzle returns them as strings. Service layer converts to numbers for API.

**Q: Can I use Prisma alongside Drizzle?**  
A: No. We're fully migrated to Drizzle. Remove all `@prisma/client` imports.

**Q: Where do I put price calculations?**  
A: In `{module}.utils.ts` as pure functions. Service layer calls them.

**Q: When should I use Winston logger?**  
A: In service layer only (server-side). Never in Client Components.

---

**Status**: This document is the source of truth for all module architecture decisions.
