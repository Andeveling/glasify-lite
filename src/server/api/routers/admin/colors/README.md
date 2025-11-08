# Colors Module

**Module**: `admin/colors`  
**Architecture**: Clean Architecture + SOLID Principles  
**ORM**: Drizzle (PostgreSQL)  
**Status**: ✅ Complete (migrated from Prisma)

---

## Overview

Admin CRUD operations for Color catalog management. Colors are used in glass models and quote items to specify finish/appearance options.

### Key Features

- **Three-Tier Deletion Strategy**: Smart deletion based on usage
- **Duplicate Prevention**: Unique constraint on name+hexCode
- **Usage Tracking**: Counts references in models and quote items
- **Soft Delete Support**: Preserve colors used in models
- **Admin-Only Access**: All procedures require admin role

---

## Architecture

### Directory Structure

```
src/server/api/routers/admin/colors/
├── index.ts                           # Router entry point (thin composition)
├── colors.queries.ts                  # tRPC read operations (4 procedures)
├── colors.mutations.ts                # tRPC write operations (3 procedures)
├── colors.schemas.ts                  # Zod validation schemas (input/output)
├── colors.service.ts                  # Business logic (6 functions)
├── repositories/
│   └── colors-repository.ts           # Data access layer (10 functions)
├── utils/
│   └── colors-logger.ts               # Structured logging (Winston)
└── README.md                          # This file
```

### Layer Responsibilities

**Repository Layer** (`colors-repository.ts`)
- Pure data access using Drizzle ORM
- No business logic, no error handling, no logging
- 10 functions: find, count, create, update, delete, usage counts

**Service Layer** (`colors.service.ts`)
- Business logic orchestration
- Error handling with Spanish messages
- Audit logging with Winston
- Three-tier deletion strategy implementation
- 6 main functions: list, getById, getDetail, create, update, delete, checkUsage

**tRPC Layer** (`colors.queries.ts`, `colors.mutations.ts`)
- Thin procedures (1-3 lines each)
- Input/output validation with Zod
- Admin-only access control
- 7 total procedures (4 queries, 3 mutations)

---

## Database Schema

### `colors` Table (Drizzle)

```typescript
{
  id: string (UUID, primary key)
  name: string (e.g., "Blanco", "Nogal Europeo")
  ralCode: string | null (e.g., "RAL 9010", optional)
  hexCode: string (e.g., "#FFFFFF", required)
  isActive: boolean (soft delete flag, default true)
  createdAt: Date
  updatedAt: Date
}
```

### Unique Constraints

- `name + hexCode` (prevents duplicate colors)

### Indexes

- `isActive` (filter active/inactive)
- `name` (search by name)

### Relations

- `modelColors` → Many-to-many with `models` table
- `quoteItems` → One-to-many with quote items

---

## Three-Tier Deletion Strategy

The delete operation uses intelligent logic based on color usage:

### Tier 1: Prevent Deletion (Hard Constraint)
**Condition**: Color is used in quote items (`quoteItemCount > 0`)  
**Action**: Throw error `PRECONDITION_FAILED`  
**Message**: "No se puede eliminar. Color usado en X cotización(es)"  
**Reason**: Quotes are immutable historical records

### Tier 2: Soft Delete (Preserve History)
**Condition**: Color is used in models (`modelCount > 0` and `quoteItemCount === 0`)  
**Action**: Update `isActive = false`  
**Message**: "Color desactivado. Usado en X modelo(s)"  
**Reason**: Models need historical color references, but new assignments should be prevented

### Tier 3: Hard Delete (Clean Removal)
**Condition**: No references exist (`modelCount === 0` and `quoteItemCount === 0`)  
**Action**: Delete from database  
**Message**: "Color eliminado exitosamente"  
**Reason**: Safe to remove completely

### Usage Check Endpoint

Before attempting deletion, use `checkUsage` query to determine:
- `canDelete`: true if no quote items (allows soft or hard delete)
- `canHardDelete`: true if no references at all (allows hard delete)

---

## API Reference

### Queries (Read Operations)

#### `list`
**Input**: Pagination + filters  
**Output**: Paginated colors with usage counts  
**Use**: Display color catalog in admin table

```typescript
api.admin.colors.list.useQuery({
  page: 1,
  limit: 20,
  search: "Blanco",
  isActive: true,
  sortBy: "name",
  sortOrder: "asc",
})
```

#### `getById`
**Input**: `{ id: string }`  
**Output**: Color with usage counts  
**Use**: Basic color details

```typescript
api.admin.colors.getById.useQuery({ id: "color-uuid" })
```

#### `getDetail`
**Input**: `{ id: string }`  
**Output**: Color with usage + first 10 related models  
**Use**: Detail view showing which models use this color

```typescript
api.admin.colors.getDetail.useQuery({ id: "color-uuid" })
```

#### `checkUsage`
**Input**: `{ id: string }`  
**Output**: Usage statistics + deletion flags  
**Use**: Determine safe deletion strategy before attempting delete

```typescript
const { data } = api.admin.colors.checkUsage.useQuery({ id: "color-uuid" });
// data: { modelCount, quoteItemCount, canDelete, canHardDelete }
```

---

### Mutations (Write Operations)

#### `create`
**Input**: Color data  
**Output**: Created color  
**Validation**: Checks for duplicate name+hexCode

```typescript
api.admin.colors.create.useMutation({
  onSuccess: (data) => {
    toast.success(`Color ${data.name} creado`);
  },
})
.mutate({
  name: "Blanco Mate",
  ralCode: "RAL 9010",
  hexCode: "#FFFFFF",
  isActive: true,
})
```

#### `update`
**Input**: Color ID + partial data  
**Output**: Updated color  
**Validation**: Checks for duplicate if name/hexCode changed

```typescript
api.admin.colors.update.useMutation()
.mutate({
  id: "color-uuid",
  name: "Blanco Brillante", // Optional
  isActive: false,           // Optional
})
```

#### `delete`
**Input**: `{ id: string }`  
**Output**: Deletion result (soft or hard)  
**Logic**: Three-tier strategy (see above)

```typescript
api.admin.colors.delete.useMutation({
  onSuccess: (data) => {
    if (data.action === "soft_delete") {
      toast.warning(data.message); // "Color desactivado. Usado en X modelo(s)"
    } else {
      toast.success(data.message); // "Color eliminado exitosamente"
    }
  },
  onError: (error) => {
    toast.error(error.message); // "No se puede eliminar. Color usado en X cotización(es)"
  },
})
.mutate({ id: "color-uuid" })
```

---

## Error Handling

All errors are in Spanish with semantic tRPC codes:

- `NOT_FOUND` - "Color no encontrado"
- `CONFLICT` - "Ya existe un color con este nombre y código hexadecimal"
- `PRECONDITION_FAILED` - "No se puede eliminar. Color usado en X cotización(es)"
- `INTERNAL_SERVER_ERROR` - "Error al [operación] el color"

---

## Logging

All operations are logged with Winston (server-side only):

### Log Patterns
- **Start**: Before database operation
- **Success**: After successful operation
- **Error**: On exception with stack trace

### Log Context
```typescript
{
  userId: string,
  colorId?: string,
  colorName?: string,
  hexCode?: string,
  changes?: Record<string, unknown>,
  modelCount?: number,
  quoteItemCount?: number,
  error?: string,
  stack?: string,
}
```

---

## Testing Strategy

### Unit Tests (Service Layer)

```typescript
describe("colors.service", () => {
  it("should throw NOT_FOUND when color doesn't exist", async () => {
    const mockDb = {} as DbClient;
    vi.spyOn(repository, "findColorById").mockResolvedValue(null);
    
    await expect(getColorById(mockDb, "user-id", "invalid-id"))
      .rejects.toThrow("Color no encontrado");
  });

  it("should prevent deletion if color is used in quotes", async () => {
    vi.spyOn(repository, "findColorByIdWithUsage").mockResolvedValue({
      id: "color-1",
      modelCount: 5,
      quoteItemCount: 3,
      // ...other fields
    });
    
    await expect(deleteColor(mockDb, "user-id", "color-1"))
      .rejects.toThrow("No se puede eliminar. Color usado en 3 cotización(es)");
  });

  it("should soft delete if color is used in models only", async () => {
    vi.spyOn(repository, "findColorByIdWithUsage").mockResolvedValue({
      id: "color-1",
      modelCount: 5,
      quoteItemCount: 0,
      // ...other fields
    });
    
    const result = await deleteColor(mockDb, "user-id", "color-1");
    
    expect(result.action).toBe("soft_delete");
    expect(result.message).toContain("5 modelo(s)");
  });

  it("should hard delete if no references exist", async () => {
    vi.spyOn(repository, "findColorByIdWithUsage").mockResolvedValue({
      id: "color-1",
      modelCount: 0,
      quoteItemCount: 0,
      // ...other fields
    });
    
    const result = await deleteColor(mockDb, "user-id", "color-1");
    
    expect(result.action).toBe("hard_delete");
    expect(result.color).toBeNull();
  });
});
```

### Integration Tests (tRPC Procedures)

```typescript
describe("colors procedures", () => {
  it("should create color", async () => {
    const caller = appRouter.createCaller({ db: testDb, session: adminSession });
    
    const color = await caller.admin.colors.create({
      name: "Test Color",
      hexCode: "#123456",
      ralCode: "RAL 0000",
      isActive: true,
    });
    
    expect(color.id).toBeDefined();
    expect(color.name).toBe("Test Color");
  });

  it("should reject duplicate name+hexCode", async () => {
    const caller = appRouter.createCaller({ db: testDb, session: adminSession });
    
    await caller.admin.colors.create({
      name: "Duplicate",
      hexCode: "#AABBCC",
    });
    
    await expect(
      caller.admin.colors.create({
        name: "Duplicate",
        hexCode: "#AABBCC",
      })
    ).rejects.toThrow("Ya existe un color con este nombre y código hexadecimal");
  });
});
```

---

## Migration Notes

### From Prisma to Drizzle

**Completed**: 2025-11-08  
**Original File**: `src/server/api/routers/admin/colors.ts` (465 lines, monolith)  
**New Structure**: 8 files (1,200+ lines, modular)

### Key Changes

1. **Type System**: No `Prisma.QuoteWhereInput`, use Drizzle SQL builders
2. **Relations**: Changed from `include` to explicit joins with `innerJoin()`
3. **Counts**: Changed from `_count` to manual `count()` aggregations
4. **Decimals**: `surchargePercentage` returned as string, converted to number in service
5. **Where Clauses**: Changed from Prisma objects to Drizzle `and()`, `eq()`, `ilike()`

### Query Conversions

**Prisma**:
```typescript
await ctx.db.color.findMany({
  where: {
    name: { contains: search, mode: "insensitive" },
    isActive: true,
  },
  include: {
    _count: {
      select: { modelColors: true, quoteItems: true },
    },
  },
  orderBy: { name: "asc" },
  skip: 0,
  take: 20,
})
```

**Drizzle**:
```typescript
const colors = await client
  .select()
  .from(colors)
  .where(and(
    ilike(colors.name, `%${search}%`),
    eq(colors.isActive, true)
  ))
  .orderBy(colors.name)
  .limit(20)
  .offset(0);

// Separate count queries for each color
const modelCount = await client
  .select({ count: count() })
  .from(modelColors)
  .where(eq(modelColors.colorId, color.id));
```

---

## Future Improvements

- [ ] Add bulk operations (activate/deactivate multiple colors)
- [ ] Add color preview images (optional upload)
- [ ] Add color categories/families (e.g., "Maderas", "Sólidos")
- [ ] Add audit log endpoint (show who created/modified colors)
- [ ] Add import/export functionality (CSV/JSON)
- [ ] Add color picker UI component with live preview
- [ ] Cache frequently-used colors in Redis
- [ ] Add color usage analytics (most used in quotes)

---

## Related Modules

- **Models** (`admin/model`): Uses colors via `modelColors` junction table
- **Quote Items** (`quote-item`): References colors for pricing and display
- **Model Colors** (`admin/model-colors`): Manages model-color associations

---

**Last Updated**: 2025-11-08  
**Maintainer**: Admin Team  
**Status**: Production Ready ✅
