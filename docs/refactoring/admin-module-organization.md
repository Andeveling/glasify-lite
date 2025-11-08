# Admin Module Organization Progress

**Last Updated**: 2025-01-08  
**Branch**: fix/ORM

---

## Overview

Systematic reorganization of `/src/server/api/routers/admin` into clean architecture structure with separation of concerns (queries, mutations, schemas, services, repositories, loggers).

---

## Completion Status

### ✅ Fully Migrated to Drizzle ORM (Clean Architecture)

1. **colors/** (100%)
   - ✅ Drizzle ORM repository
   - ✅ Service layer with business logic
   - ✅ Queries (3 procedures)
   - ✅ Mutations (4 procedures)
   - ✅ Winston logging
   - ✅ Zod schemas
   - ✅ README documentation

2. **glass-supplier/** (100%)
   - ✅ Drizzle ORM repository
   - ✅ Service layer with three-tier deletion
   - ✅ Queries (3 procedures)
   - ✅ Mutations (3 procedures)
   - ✅ Winston logging
   - ✅ Zod schemas
   - ✅ NULL → undefined transformations

3. **profile-supplier/** (100%)
   - ✅ Drizzle ORM repository
   - ✅ Service layer with business validation
   - ✅ Queries (4 procedures)
   - ✅ Mutations (3 procedures)
   - ✅ Winston logging
   - ✅ Zod schemas
   - ✅ README documentation

### ⚠️ Organized (Pending Drizzle Migration)

4. **model-colors/** (50% - Structure Only)
   - ✅ Clean architecture structure
   - ✅ Queries (2 procedures) - using Prisma
   - ✅ Mutations (5 procedures) - using Prisma
   - ✅ Winston logging
   - ✅ Zod schemas with constants
   - ✅ README documentation
   - ⏳ Repository layer (empty)
   - ⏳ Drizzle ORM conversion
   - **Status**: Functional but needs Drizzle migration
   - **Priority**: Medium
   - **Complexity**: Low (straightforward M2M with default logic)

### 🔄 Pending Organization

5. **service.ts** (Single file)
   - ⏳ Not yet organized
   - Uses: Prisma ORM
   - Complexity: Low (~300 lines)
   - Procedures: ~5 operations
   - Priority: Medium

6. **tenant-config.ts** (Single file)
   - ⏳ Not yet organized
   - Uses: Prisma ORM
   - Complexity: Low (~200 lines)
   - Procedures: ~3 operations
   - Priority: Medium

7. **gallery.ts** (Single file)
   - ⏳ Not yet organized
   - Uses: Prisma ORM
   - Complexity: Low (~250 lines)
   - Procedures: Image upload operations
   - Priority: Low

8. **glass-solution.ts** (Single file)
   - ⏳ Not yet organized
   - Uses: Prisma ORM
   - Complexity: Low (~300 lines)
   - Procedures: ~6 operations
   - Priority: Medium

9. **glass-type.ts** (Single file)
   - ⏳ Not yet organized
   - Uses: Prisma ORM
   - Complexity: Medium (~620 lines, M2M relations)
   - Procedures: ~8 operations
   - Priority: High (complex M2M with glass-supplier)

10. **model.ts** (Single file - Currently open in editor)
    - ⏳ Not yet organized
    - Uses: Prisma ORM
    - Complexity: High (~800+ lines, complex relations)
    - Procedures: ~10 operations
    - Priority: High (core business entity)

### 🗑️ Legacy Files (To Remove After Migration)

- **profile-supplier.ts** - Superseded by profile-supplier/ module
- **glass-supplier.ts** - Superseded by glass-supplier/ module (still referenced in glass-type.ts)
- **colors.ts** - Superseded by colors/ module

---

## Architecture Pattern

All organized modules follow this structure:

```
module-name/
├── index.ts                        # Router composition + schema exports
├── module-name.schemas.ts          # Zod validation schemas + types
├── module-name.queries.ts          # Read operations (tRPC procedures)
├── module-name.mutations.ts        # Write operations (tRPC procedures)
├── module-name.service.ts          # Business logic layer
├── repositories/
│   └── module-name-repository.ts   # Drizzle ORM queries
└── utils/
    └── module-name-logger.ts       # Winston logging functions
```

**Key Principles**:
- **Single Responsibility**: Each file has one clear purpose
- **Dependency Inversion**: Procedures → Service → Repository → DB
- **Type Safety**: Zod schemas + TypeScript strict mode
- **Logging**: Winston server-side only (never in Client Components)
- **RBAC**: adminProcedure for all admin operations
- **Testability**: Pure functions, injectable dependencies

---

## Migration Checklist (Per Module)

### Phase 1: Organization
- [ ] Create module folder structure
- [ ] Extract schemas to `.schemas.ts`
- [ ] Separate queries and mutations
- [ ] Create logger utilities
- [ ] Create index.ts with router composition
- [ ] Write README documentation

### Phase 2: Drizzle Migration
- [ ] Create Drizzle repository layer
- [ ] Convert Prisma queries to Drizzle
  * `findMany` → `select().from()`
  * `findUnique` → `select().where(eq())`
  * `create` → `insert().values()`
  * `update` → `update().set().where()`
  * `delete` → `delete().where()`
  * `$transaction` → `db.transaction()`
  * `count` → `count()` aggregation
  * `include` → joins with relations
- [ ] Create service layer functions
- [ ] Update procedures to use service layer
- [ ] Handle NULL → undefined transformations
- [ ] Test CRUD operations
- [ ] Verify transaction rollbacks
- [ ] Run Biome linter/formatter

### Phase 3: Validation
- [ ] Check compilation errors (0 target)
- [ ] Verify type safety
- [ ] Test business logic edge cases
- [ ] Validate RBAC enforcement
- [ ] Confirm Winston logging works
- [ ] Update admin.ts imports

---

## Next Steps (Recommended Priority)

### High Priority (Complex, Core Business Logic)
1. **model.ts** → `model/` module
   - Reason: Core entity with complex relations
   - Lines: ~800+
   - Dependencies: glassType, manufacturer, images
   - Relations: M2M with glassTypes, 1-N with modelColors

2. **glass-type.ts** → `glass-type/` module
   - Reason: M2M relations with glass-supplier
   - Lines: ~620
   - Dependencies: glass-supplier (still uses legacy file)
   - Relations: M2M with models, glassSuppliers

### Medium Priority (Standard CRUD)
3. **service.ts** → `service/` module
   - Reason: Simple CRUD, no complex relations
   - Lines: ~300
   - Quick win, clean patterns

4. **tenant-config.ts** → `tenant-config/` module
   - Reason: Configuration management, singleton pattern
   - Lines: ~200
   - Important for multi-tenancy

5. **glass-solution.ts** → `glass-solution/` module
   - Reason: Standard CRUD with validation
   - Lines: ~300
   - Moderate complexity

6. **model-colors/** Drizzle Migration
   - Reason: Already organized, just needs ORM conversion
   - Lines: ~400 (mutations + queries)
   - Low complexity, clear patterns

### Low Priority (Non-Critical)
7. **gallery.ts** → `gallery/` module
   - Reason: File upload operations, less critical
   - Lines: ~250
   - Can wait

---

## Statistics

- **Total Modules**: 10
- **Fully Migrated**: 3 (30%)
- **Organized (Pending ORM)**: 1 (10%)
- **Pending**: 6 (60%)
- **Lines Migrated**: ~2,400
- **Lines Remaining**: ~3,200

---

## Known Issues

### Current Compilation State
- ✅ No compilation errors in organized modules
- ⚠️ Prisma API errors in legacy files (expected)
- ⚠️ Prisma API errors in model-colors internals (expected, isolated)

### Dependencies to Resolve
- `glass-type.ts` still references `glass-supplier.ts` (legacy)
- `model.ts` has complex M2M that needs careful migration
- Several files use Prisma transactions (need Drizzle conversion)

---

## Commands

```bash
# Check errors in admin folder
npx tsc --noEmit

# Format all organized modules
npx biome check --write src/server/api/routers/admin/colors/
npx biome check --write src/server/api/routers/admin/glass-supplier/
npx biome check --write src/server/api/routers/admin/profile-supplier/
npx biome check --write src/server/api/routers/admin/model-colors/

# Run tests (when available)
npm run test:unit -- admin
```

---

**Progress**: 4/10 modules complete (40% structured, 30% fully migrated)  
**Estimated Remaining**: ~6-8 hours for full migration
