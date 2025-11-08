# Migration Plan: admin/colors Module

**Target**: Migrate `admin/colors.ts` to follow module standards  
**Reference**: `docs/architecture/module-standards.md`  
**Current State**: Monolithic file using Prisma (465 lines)  
**Target State**: Clean architecture with Drizzle

---

## Current Analysis

**File**: `src/server/api/routers/admin/colors.ts` (465 lines)

**Current Structure**:
- ❌ Single monolithic file
- ❌ Uses Prisma Client (`ctx.db.color.findMany`, etc.)
- ❌ Business logic mixed with tRPC procedures
- ❌ No repository layer
- ❌ No structured logging
- ✅ Spanish error messages
- ✅ Good procedure organization

**Current Procedures**:
1. `list` - Paginated list with filters
2. `getById` - Single color with usage stats
3. `create` - Create new color with duplicate check
4. `update` - Update color with duplicate check
5. `delete` - Three-tier deletion strategy (hard/soft/prevent)
6. `checkUsage` - Check usage before deletion

---

## Target Structure

```
src/server/api/routers/admin/colors/
├── index.ts                           # Router entry point
├── colors.queries.ts                  # Read operations (list, getById, checkUsage)
├── colors.mutations.ts                # Write operations (create, update, delete)
├── colors.schemas.ts                  # Zod validation (already exists: @/lib/validations/color)
├── colors.service.ts                  # Business logic orchestration
├── colors.utils.ts                    # Decimal serialization (if needed)
├── README.md                          # Module documentation
├── repositories/
│   └── colors-repository.ts           # Data access layer (Drizzle)
└── utils/
    └── colors-logger.ts               # Structured logging
```

---

## Migration Steps

### Phase 1: Preparation
- [ ] Create directory `src/server/api/routers/admin/colors/`
- [ ] Move existing validation schemas to module (or keep in `@/lib/validations/color`)
- [ ] Create stub files with TODOs

### Phase 2: Repository Layer
- [ ] Create `repositories/colors-repository.ts`
- [ ] Convert Prisma queries to Drizzle:
  - [ ] `findColors(filters, pagination)` → replaces `findMany`
  - [ ] `countColors(filters)` → replaces `count`
  - [ ] `findColorById(id)` → replaces `findUnique`
  - [ ] `findColorByNameAndHex(name, hex)` → replaces duplicate check
  - [ ] `createColor(data)` → replaces `create`
  - [ ] `updateColor(id, data)` → replaces `update`
  - [ ] `deleteColor(id)` → replaces `delete`
  - [ ] `countModelColorsByColorId(colorId)` → for usage check
  - [ ] `countQuoteItemsByColorId(colorId)` → for usage check

### Phase 3: Logger Utils
- [ ] Create `utils/colors-logger.ts`
- [ ] Add logging functions:
  - [ ] `logColorListStart/Success/Error`
  - [ ] `logColorFetchStart/Success/Error`
  - [ ] `logColorCreateStart/Success/Error`
  - [ ] `logColorUpdateStart/Success/Error`
  - [ ] `logColorDeleteStart/Success/Error`
  - [ ] `logColorUsageCheckStart/Success/Error`
  - [ ] `logDuplicateColorAttempt`

### Phase 4: Service Layer
- [ ] Create `colors.service.ts`
- [ ] Implement service functions:
  - [ ] `getColorsList(client, filters, pagination)`
  - [ ] `getColorById(client, colorId)`
  - [ ] `createColor(client, userId, data)`
  - [ ] `updateColor(client, userId, colorId, data)`
  - [ ] `deleteColor(client, userId, colorId)` - Three-tier strategy
  - [ ] `checkColorUsage(client, colorId)`
- [ ] Add error handling (Spanish TRPCError messages)
- [ ] Add logging calls
- [ ] Add decimal serialization if needed

### Phase 5: tRPC Layer
- [ ] Create `colors.queries.ts`:
  - [ ] `list` procedure → `getColorsList`
  - [ ] `getById` procedure → `getColorById`
  - [ ] `checkUsage` procedure → `checkColorUsage`
- [ ] Create `colors.mutations.ts`:
  - [ ] `create` procedure → `createColor`
  - [ ] `update` procedure → `updateColor`
  - [ ] `delete` procedure → `deleteColor`
- [ ] Create `index.ts` to merge routers

### Phase 6: Integration
- [ ] Update `admin/admin.ts` to import from `colors/index.ts`
- [ ] Test all procedures
- [ ] Verify no regressions
- [ ] Delete old `colors.ts` file

### Phase 7: Documentation
- [ ] Create `README.md` with:
  - [ ] Module overview
  - [ ] Three-tier deletion strategy explanation
  - [ ] Usage examples
  - [ ] Testing guidelines

---

## Drizzle Query Conversions

### Example: List with Filters

**Prisma**:
```typescript
const colors = await ctx.db.color.findMany({
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
  skip: (page - 1) * limit,
  take: limit,
});
```

**Drizzle**:
```typescript
import { eq, and, sql, count } from "drizzle-orm";
import { colors, modelColors, quoteItems } from "@/server/db/schema";

// In repository
export async function findColors(
  client: DbClient,
  filters: { search?: string; isActive?: boolean },
  pagination: { page: number; limit: number }
) {
  const conditions = [];

  if (filters.search) {
    conditions.push(
      sql`LOWER(${colors.name}) LIKE LOWER(${'%' + filters.search + '%'})`
    );
  }

  if (filters.isActive !== undefined) {
    conditions.push(eq(colors.isActive, filters.isActive));
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  // Subquery for modelColors count
  const modelColorsCount = client
    .select({ colorId: modelColors.colorId, count: count() })
    .from(modelColors)
    .groupBy(modelColors.colorId)
    .as("model_colors_count");

  // Subquery for quoteItems count
  const quoteItemsCount = client
    .select({ colorId: quoteItems.colorId, count: count() })
    .from(quoteItems)
    .groupBy(quoteItems.colorId)
    .as("quote_items_count");

  return await client
    .select({
      id: colors.id,
      name: colors.name,
      ralCode: colors.ralCode,
      hexCode: colors.hexCode,
      isActive: colors.isActive,
      createdAt: colors.createdAt,
      updatedAt: colors.updatedAt,
      modelColorsCount: sql<number>`COALESCE(${modelColorsCount.count}, 0)`,
      quoteItemsCount: sql<number>`COALESCE(${quoteItemsCount.count}, 0)`,
    })
    .from(colors)
    .leftJoin(modelColorsCount, eq(colors.id, modelColorsCount.colorId))
    .leftJoin(quoteItemsCount, eq(colors.id, quoteItemsCount.colorId))
    .where(whereClause)
    .orderBy(colors.name)
    .limit(pagination.limit)
    .offset((pagination.page - 1) * pagination.limit);
}
```

### Example: Duplicate Check

**Prisma**:
```typescript
const existing = await ctx.db.color.findUnique({
  where: {
    name_hexCode: { name: input.name, hexCode: input.hexCode },
  },
});
```

**Drizzle**:
```typescript
import { eq, and } from "drizzle-orm";

export async function findColorByNameAndHex(
  client: DbClient,
  name: string,
  hexCode: string
) {
  return await client
    .select()
    .from(colors)
    .where(and(eq(colors.name, name), eq(colors.hexCode, hexCode)))
    .then((rows) => rows[0] ?? null);
}
```

---

## Testing Plan

### Unit Tests
- [ ] Test `colors.service.ts` functions with mocked repository
- [ ] Test three-tier deletion logic
- [ ] Test duplicate detection logic
- [ ] Test error handling

### Integration Tests
- [ ] Test full tRPC procedure flow
- [ ] Test pagination
- [ ] Test filtering
- [ ] Test soft/hard delete scenarios

---

## Risk Assessment

**Low Risk**:
- ✅ Module is well-isolated
- ✅ Clear procedure boundaries
- ✅ Good test coverage possible

**Medium Risk**:
- ⚠️ Complex deletion logic (three-tier strategy)
- ⚠️ Usage counting with subqueries

**Mitigation**:
- Implement carefully with tests
- Preserve exact business logic
- Test all deletion scenarios

---

## Timeline Estimate

- Phase 1 (Preparation): 15 minutes
- Phase 2 (Repository): 1 hour
- Phase 3 (Logger): 30 minutes
- Phase 4 (Service): 1 hour
- Phase 5 (tRPC): 45 minutes
- Phase 6 (Integration): 30 minutes
- Phase 7 (Documentation): 30 minutes

**Total**: ~4-5 hours

---

## Success Criteria

- [ ] All Prisma imports removed
- [ ] All queries using Drizzle ORM
- [ ] Clean architecture layers implemented
- [ ] Structured logging in place
- [ ] All procedures working (no regressions)
- [ ] Tests passing
- [ ] Documentation complete
- [ ] No TypeScript errors
- [ ] No lint warnings (except acceptable shadowing)

---

## Next Steps

1. Get approval for migration approach
2. Create branch `feature/migrate-colors-module`
3. Execute phases 1-7
4. Create PR with detailed testing evidence
5. Deploy to staging for integration testing

---

**Status**: Plan ready for execution  
**Approval Required**: Yes  
**Dependencies**: None (can start immediately)
