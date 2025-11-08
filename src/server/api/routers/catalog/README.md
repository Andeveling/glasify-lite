# Catalog Module - Architecture Documentation

**Last Updated**: 2025-01-XX  
**Migration**: Prisma → Drizzle ORM  
**Architecture**: Clean Architecture + SOLID Principles

## Overview

The **catalog module** handles all READ operations for:
- Models (glass window/door models from manufacturers)
- Glass types and solutions
- Manufacturers (profile suppliers)
- Services (installation, measurement, etc.)

All procedures are **public** (no authentication required) and used by:
- Public catalog pages (`/catalog`)
- Quote parametrization forms
- Glass solutions pages (`/glasses/solutions`)

---

## Directory Structure

```
src/server/api/routers/catalog/
├── index.ts                           # Router entry point (merges all routers)
├── catalog.queries.ts                 # Main catalog tRPC procedures
├── catalog.schemas.ts                 # Zod input/output schemas
├── catalog.service.ts                 # Business logic orchestration
├── catalog.utils.ts                   # Decimal serialization utilities
├── glass-solutions.queries.ts         # Glass solutions tRPC procedures
├── repositories/
│   └── catalog-repository.ts          # Data access layer (Drizzle queries)
└── utils/
    └── catalog-logger.ts              # Structured logging
```

---

## Architecture Layers

### 1. **Presentation Layer** (tRPC Procedures)
- **Files**: `catalog.queries.ts`, `glass-solutions.queries.ts`
- **Responsibility**: HTTP API endpoints, input validation, output serialization
- **Pattern**: Thin controllers that delegate to service layer

**Example**:
```typescript
"get-model-by-id": publicProcedure
  .input(getModelByIdInput)
  .output(modelDetailOutput)
  .query(async ({ ctx, input }) => getModelById(ctx.db, input.modelId))
```

### 2. **Business Logic Layer** (Services)
- **File**: `catalog.service.ts`
- **Responsibility**: Orchestration, error handling, logging, decimal serialization
- **Pattern**: Pure functions that call repository layer

**Example**:
```typescript
export async function getModelById(db: DrizzleDb, modelId: string) {
  logModelFetchStart(modelId);
  const model = await findModelById(db, modelId);
  if (!model) throw new TRPCError({ code: "NOT_FOUND", ... });
  return serializeDecimalFields(model);
}
```

### 3. **Data Access Layer** (Repositories)
- **File**: `repositories/catalog-repository.ts`
- **Responsibility**: Database queries using Drizzle ORM
- **Pattern**: Query builders with type safety

**Example**:
```typescript
export async function findModelById(db: DrizzleDb, modelId: string) {
  return await db
    .select({ /* fields */ })
    .from(models)
    .leftJoin(profileSuppliers, eq(models.profileSupplierId, profileSuppliers.id))
    .where(eq(models.id, modelId))
    .then((rows) => rows[0] ?? null);
}
```

### 4. **Cross-Cutting Concerns** (Utils)
- **Files**: `catalog.utils.ts`, `utils/catalog-logger.ts`
- **Responsibility**: Reusable utilities (logging, serialization)

---

## Drizzle ORM Specifics

### Decimal/Numeric Types
Drizzle stores `NUMERIC`/`DECIMAL` as **strings** for precision. Use `serializeDecimalFields()` to convert to numbers:

```typescript
// catalog.utils.ts
export function serializeDecimalFields<T>(entity: T) {
  return {
    ...entity,
    basePrice: Number.parseFloat(entity.basePrice),
    thicknessMm: Number.parseFloat(entity.thicknessMm),
    // ... all numeric fields
  };
}
```

### Boolean Types
Some tables store booleans as strings (`"true"` / `"false"`):
- `profileSuppliers.isActive` → stored as text
- `glassTypes.isSeeded` → stored as text

Use `serializeDecimalFields()` to convert these too:
```typescript
result.isSeeded = entity.isSeeded === "true";
```

### Join Patterns
Drizzle uses explicit joins (no implicit relations like Prisma):

```typescript
// BEFORE (Prisma)
prisma.model.findUnique({
  where: { id },
  include: { profileSupplier: true },
});

// AFTER (Drizzle)
db.select({
  ...models,
  profileSupplier: { id: profileSuppliers.id, name: profileSuppliers.name },
})
.from(models)
.leftJoin(profileSuppliers, eq(models.profileSupplierId, profileSuppliers.id))
.where(eq(models.id, id));
```

---

## SOLID Principles Applied

### Single Responsibility Principle (SRP)
- **Repository**: Only database queries
- **Service**: Only business logic orchestration
- **Queries**: Only HTTP/tRPC interface
- **Utils**: Only reusable helpers

### Open/Closed Principle (OCP)
- Services are open for extension (add new functions) but closed for modification (existing functions don't change)
- Serialization utilities are generic and reusable

### Dependency Inversion Principle (DIP)
- High-level modules (services) don't depend on low-level modules (repositories)
- Both depend on abstractions (DrizzleDb type, function contracts)

### Interface Segregation Principle (ISP)
- Functions have specific, minimal interfaces
- Example: `findModelById` only needs `db` and `modelId`, not entire context

### Liskov Substitution Principle (LSP)
- Any Drizzle client (node-postgres or neon-http) can be used interchangeably

---

## Error Handling

All services throw `TRPCError` with Spanish messages:

```typescript
throw new TRPCError({
  code: "NOT_FOUND",
  message: "El modelo solicitado no existe o no está disponible.",
});
```

Error codes:
- `NOT_FOUND`: Resource doesn't exist
- `INTERNAL_SERVER_ERROR`: Database or unexpected errors

---

## Testing Strategy

### Unit Tests
Test services with mocked repositories:

```typescript
describe("getModelById", () => {
  it("should throw NOT_FOUND when model doesn't exist", async () => {
    const mockDb = { /* mock findModelById to return null */ };
    await expect(getModelById(mockDb, "invalid-id")).rejects.toThrow("NOT_FOUND");
  });
});
```

### Integration Tests
Test repositories with real Drizzle client (test database):

```typescript
describe("findModelById", () => {
  it("should return model with profile supplier", async () => {
    const model = await findModelById(testDb, seedModelId);
    expect(model).toBeDefined();
    expect(model.profileSupplier).toBeDefined();
  });
});
```

---

## Migration Notes (Prisma → Drizzle)

### What Changed

1. **No more Prisma Client**
   - BEFORE: `prisma.model.findUnique()`
   - AFTER: `db.select().from(models).where(eq(...))`

2. **Explicit Joins**
   - BEFORE: `include: { profileSupplier: true }`
   - AFTER: `.leftJoin(profileSuppliers, eq(...))`

3. **Decimal Serialization**
   - BEFORE: `Decimal.toNumber()`
   - AFTER: `Number.parseFloat(stringValue)`

4. **Boolean Conversion**
   - BEFORE: `isActive: boolean`
   - AFTER: `isActive: "true" | "false"` → convert with `=== "true"`

5. **No Relation Filtering**
   - BEFORE: `where: { profileSupplier: { isActive: true } }`
   - AFTER: Explicit join + `and(eq(models.status, "published"), eq(profileSuppliers.isActive, "true"))`

### Files Removed
- `catalog.mutations.ts` - Empty stub file
- `catalog.migration-utils.ts` - Deprecated Prisma migration utilities

---

## Future Improvements

1. **Caching**: Add Redis caching for catalog queries (TTL: 1 hour)
2. **Pagination**: Implement cursor-based pagination for large datasets
3. **Search**: Add full-text search using PostgreSQL `ts_vector`
4. **Filtering**: Add advanced filters (price range, dimensions, glass type)
5. **Sorting**: Support more sort options (popularity, newest, etc.)

---

## Related Documentation

- **Domain Layer**: `src/domain/pricing/` - Money, MarginCalculator
- **Database Schema**: `src/server/db/schema/` - Drizzle table definitions
- **Quote Module**: `src/server/api/routers/quote/` - Similar clean architecture

---

## Maintainers

- **Architecture**: Clean Architecture + SOLID
- **ORM**: Drizzle ORM (not Prisma)
- **Logging**: Winston (server-side only)
- **Validation**: Zod schemas

For questions, see: `.github/copilot-instructions.md`
