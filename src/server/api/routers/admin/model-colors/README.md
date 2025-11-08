# Model Colors Module

## Status: Organized ⚠️ (Pending Drizzle ORM Migration)

Clean architecture structure implemented, but still using Prisma ORM.

---

## Structure

```
model-colors/
├── index.ts                        # Router composition
├── model-colors.schemas.ts         # Zod validation schemas
├── model-colors.queries.ts         # Read operations (2 procedures)
├── model-colors.mutations.ts       # Write operations (5 procedures)
├── utils/
│   └── model-colors-logger.ts      # Winston logging utilities
└── repositories/                   # (Empty, pending migration)
```

---

## API Surface

### Queries
- `listByModel`: Get all colors assigned to a model (ordered by default first)
- `getAvailableColors`: Get colors not yet assigned to a model

### Mutations
- `assign`: Assign color to model with custom surcharge percentage
- `updateSurcharge`: Update surcharge percentage for existing assignment
- `setDefault`: Set a color as the default for a model
- `unassign`: Remove color assignment (auto-promotes next if default removed)
- `bulkAssign`: Assign multiple colors at once with idempotency

---

## Business Rules

1. **Default Color Logic**
   - Each model can have multiple colors
   - Only one color can be marked as default per model
   - First assigned color automatically becomes default
   - Removing default color auto-promotes next available color (by createdAt)

2. **Surcharge Percentage**
   - Range: 0-100%
   - Applied to model base price only
   - Can be updated independently per color-model assignment

3. **Validation**
   - Cannot assign inactive colors
   - Prevents duplicate color assignments (unique constraint)
   - Tenant validation via model ownership

---

## Migration Status

### ✅ Completed
- Clean architecture structure (queries, mutations, schemas, utils)
- Winston logging integration
- Schema validation with Zod
- Business logic separation
- Router composition

### ⚠️ Pending (Drizzle ORM Migration)
- Repository layer creation
- Prisma → Drizzle query conversion
  * `ctx.db.modelColor.findMany` → Drizzle select with joins
  * `ctx.db.$transaction` → `ctx.db.transaction`
  * `ctx.db.color.findMany` → Drizzle select
  * `ctx.db.model.findUnique` → Drizzle select with `where eq`
  * `updateMany` → Drizzle batch updates
  * `createMany` → Drizzle insert with `values([...])`
- Type conversions (Prisma types → Drizzle inferred types)
- Transaction handling updates
- Include/select → Drizzle joins

### Known Compilation Errors (Expected)
```
Property 'modelColor' does not exist on type 'DrizzleDB'
Property '$transaction' does not exist on type 'DrizzleDB' (use 'transaction')
Property 'color' does not exist on type 'DrizzleDB'
Property 'model' does not exist on type 'DrizzleDB'
```

These errors will be resolved during the Drizzle migration phase.

---

## Usage Example

```typescript
// Assign first color to model (becomes default automatically)
await trpc.admin.modelColors.assign.mutate({
  modelId: "model_123",
  colorId: "color_456",
  surchargePercentage: 15, // 15% surcharge
  isDefault: false, // Overridden to true if first color
});

// Get available colors for dropdown
const availableColors = await trpc.admin.modelColors.getAvailableColors.query({
  modelId: "model_123",
});

// Bulk assign multiple colors
await trpc.admin.modelColors.bulkAssign.mutate({
  modelId: "model_123",
  assignments: [
    { colorId: "color_789", surchargePercentage: 10 },
    { colorId: "color_101", surchargePercentage: 20 },
  ],
});
```

---

## Next Steps

1. Create `repositories/model-colors-repository.ts` with Drizzle queries
2. Convert Prisma transactions to Drizzle `db.transaction()`
3. Update queries/mutations to use repository layer
4. Add unit tests for repository functions
5. Verify transaction rollback behavior
6. Test default color promotion logic with Drizzle

---

## Dependencies

- `@/server/db/schemas/model-color.schema.ts` (Drizzle table definition)
- `@/server/db/schemas/color.schema.ts` (for joins)
- `@/server/db/schemas/model.schema.ts` (for validation)
- Winston logger (server-side only)
- tRPC `adminProcedure` (RBAC)

---

**Last Updated**: 2025-01-08  
**Migration Priority**: Medium (functional but needs Drizzle for consistency)
