# Phase 0: Research & Decisions

**Feature**: Admin Catalog Management  
**Date**: 2025-10-18  
**Status**: Complete ✅

## Research Tasks & Findings

### 1. Form Architecture for Complex Models

**Research Question**: How to handle Model form with 15+ fields, nested arrays (compatible glass types, cost breakdown), and price history tracking?

**Decision**: Single-page form with collapsible sections (Shadcn/ui Accordion)

**Rationale**:
- Model entity has manageable complexity (all fields in one Prisma model except cost breakdown)
- `compatibleGlassTypeIds` is a simple string array (not Many-to-Many relation)
- Cost breakdown can be managed as a separate sub-form (React Hook Form `useFieldArray`)
- Single-page form with sections matches existing project patterns (quote forms)
- Allows saving as "draft" status for incremental completion

**Alternatives Considered**:
- ❌ **Multi-step wizard**: Adds unnecessary complexity for admin users (not end users)
- ❌ **Separate pages for cost breakdown**: Breaks flow, requires extra navigation
- ✅ **Accordion sections**: Best UX for admin efficiency (expand only needed sections)

**Implementation Details**:
```tsx
// Form Structure:
<Form>
  <Accordion type="multiple">
    <AccordionItem value="basic">        // Name, supplier, status
    <AccordionItem value="dimensions">   // Min/max width/height
    <AccordionItem value="pricing">      // Base price, cost per mm, margin
    <AccordionItem value="glass">        // Compatible glass types (multi-select)
    <AccordionItem value="cost-breakdown"> // Dynamic array of components
  </Accordion>
</Form>
```

---

### 2. Glass Type Solutions & Characteristics Assignment

**Research Question**: Should solutions/characteristics be assigned during glass type creation or after?

**Decision**: Assign during creation with dynamic form arrays (inline management)

**Rationale**:
- UX: Better flow to configure everything in one session (admin completes task fully)
- Technical: `GlassTypeSolution` and `GlassTypeCharacteristic` are Many-to-Many pivot tables
- React Hook Form supports nested arrays with `useFieldArray`
- Prisma supports creating relations in a single transaction with `create.data.solutions.create`

**Alternatives Considered**:
- ❌ **Separate management pages**: Requires extra navigation, fragmented workflow
- ✅ **Inline multi-select with additional fields**: Matches pattern used in quote items (services)

**Implementation Details**:
```tsx
// Glass Type Form Structure:
<Form>
  <BasicFields />  // Name, thickness, price, supplier, SKU, etc.
  
  <SolutionSelector>
    // Multi-select dropdown of GlassSolution entities
    // For each selected: performance rating (dropdown), isPrimary (checkbox), notes (textarea)
    {solutionsFieldArray.map((field, index) => (
      <SolutionRow key={field.id}>
        <Select name={`solutions.${index}.solutionId`} />
        <Select name={`solutions.${index}.performanceRating`} />
        <Checkbox name={`solutions.${index}.isPrimary`} />
        <Textarea name={`solutions.${index}.notes`} />
      </SolutionRow>
    ))}
  </SolutionSelector>
  
  <CharacteristicSelector>
    // Multi-select dropdown of GlassCharacteristic entities
    // For each selected: value (text), certification (text), notes (textarea)
    {characteristicsFieldArray.map((field, index) => (
      <CharacteristicRow key={field.id}>
        <Select name={`characteristics.${index}.characteristicId`} />
        <Input name={`characteristics.${index}.value`} placeholder="e.g., 6.38mm" />
        <Input name={`characteristics.${index}.certification`} placeholder="e.g., EN 12150" />
        <Textarea name={`characteristics.${index}.notes`} />
      </CharacteristicRow>
    ))}
  </CharacteristicSelector>
</Form>
```

---

### 3. Suppliers Pre-requisite vs On-the-Fly Creation

**Research Question**: Should profile/glass suppliers exist before creating models/glass types, or allow inline creation?

**Decision**: Pre-requisite with "Create New" link (opens in new tab/modal)

**Rationale**:
- **Data Quality**: Suppliers are foundational entities with important metadata (material type, country, contact info)
- **Admin Workflow**: Admins typically set up suppliers once, then create many products
- **Simplicity**: Avoids nested form complexity (form-within-form)
- **UX Compromise**: Provide visible "Don't see your supplier? Create one here" link that opens supplier form in new tab or modal

**Alternatives Considered**:
- ❌ **Inline modal form**: Complicates React Hook Form state management (nested contexts)
- ❌ **Required order enforcement**: Too rigid if admin wants to create supplier later
- ✅ **Soft guidance + quick link**: Balances flexibility and data quality

**Implementation Details**:
```tsx
// Model Form - Profile Supplier Selection:
<FormField name="profileSupplierId">
  <Label>Proveedor de Perfiles</Label>
  <Select>
    {profileSuppliers.map(s => <SelectItem value={s.id}>{s.name}</SelectItem>)}
  </Select>
  <FormDescription>
    ¿No encuentras el proveedor? 
    <Link href="/admin/profile-suppliers/new" target="_blank" className="text-primary">
      Crear nuevo proveedor
    </Link>
  </FormDescription>
</FormField>
```

---

### 4. Validation of Compatible Glass Types

**Research Question**: What validation rules for `compatibleGlassTypeIds` array in Model?

**Decision**: Only active glass types (`isActive=true`), validated server-side

**Rationale**:
- **Business Rule**: Models should only reference glass types that are available for selection
- **Prisma Schema**: `isActive` boolean exists on GlassType
- **Validation Layer**: 
  - Client-side: Multi-select dropdown only shows active glass types
  - Server-side: tRPC procedure validates all IDs exist and are active

**Alternatives Considered**:
- ❌ **No restriction**: Could lead to orphaned references if glass type deactivated
- ❌ **Additional constraints (thickness, supplier)**: Too restrictive, limits flexibility
- ✅ **Active status only**: Simple, enforceable, aligns with business needs

**Implementation Details**:
```typescript
// Zod Schema (lib/validations/admin/model.schema.ts):
export const createModelSchema = z.object({
  // ... other fields
  compatibleGlassTypeIds: z.array(z.string().cuid()).min(1, 'Selecciona al menos un tipo de cristal'),
});

// tRPC Procedure (server/api/routers/admin/model.ts):
export const modelRouter = router({
  create: adminProcedure
    .input(createModelSchema)
    .mutation(async ({ ctx, input }) => {
      // Validate all glass type IDs exist and are active
      const glassTypes = await ctx.db.glassType.findMany({
        where: { id: { in: input.compatibleGlassTypeIds }, isActive: true },
        select: { id: true },
      });
      
      if (glassTypes.length !== input.compatibleGlassTypeIds.length) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Uno o más tipos de cristal no existen o no están activos',
        });
      }
      
      // Create model
      return await ctx.db.model.create({ data: input });
    }),
});
```

---

### 5. Implementation Order by Dependencies

**Research Question**: Which entities should be implemented first to unblock others?

**Decision**: Three-phase implementation by dependency graph

**Rationale**:
- **Phase 1 (Foundations)**: Entities with no foreign keys (suppliers, solutions, characteristics)
  - Can be developed and tested in parallel
  - Unblocks dependent entities in Phase 2
  
- **Phase 2 (Core Products)**: Entities with foreign keys to Phase 1
  - GlassType depends on: GlassSupplier, GlassSolution, GlassCharacteristic
  - Model depends on: ProfileSupplier, GlassType
  
- **Phase 3 (Supplementary)**: Independent or secondary entities
  - Service has no dependencies
  - ModelCostBreakdown is enhancement, not blocker

**Implementation Order**:

**Phase 1 - Foundations** (can run in parallel):
1. ProfileSupplier CRUD (no dependencies)
2. GlassSupplier CRUD (no dependencies)
3. GlassSolution CRUD (no dependencies)
4. GlassCharacteristic CRUD (no dependencies)

**Phase 2 - Core Products** (sequential within phase):
5. GlassType CRUD (depends on: GlassSupplier, GlassSolution, GlassCharacteristic)
6. Model CRUD (depends on: ProfileSupplier, GlassType)

**Phase 3 - Supplementary** (can run in parallel):
7. Service CRUD (no dependencies)
8. ModelCostBreakdown management (optional enhancement, managed from Model detail page)

**Alternatives Considered**:
- ❌ **Top-down (Model first)**: Would require mocking all dependencies
- ❌ **Random order**: Would cause constant context switching and blocked work
- ✅ **Dependency graph**: Minimizes blockers, enables parallel work where possible

---

### 6. Automatic Price History Tracking

**Research Question**: How to automatically create price history records when prices change?

**Decision**: Service layer middleware (not database triggers)

**Rationale**:
- **Prisma Best Practice**: Use application-level middleware for business logic (not DB triggers)
- **Auditability**: Need to capture `createdBy` (current user ID) in history record
- **Flexibility**: Can add validation rules, notifications, etc. in application code
- **Testability**: Service layer is easier to unit test than database triggers

**Implementation Details**:

```typescript
// server/services/price-history.service.ts
export async function createModelPriceHistory(
  db: PrismaClient,
  modelId: string,
  oldData: ModelPriceSnapshot,
  newData: ModelPriceSnapshot,
  userId: string,
  reason?: string,
) {
  // Only create history if price fields changed
  const priceChanged = 
    oldData.basePrice !== newData.basePrice ||
    oldData.costPerMmWidth !== newData.costPerMmWidth ||
    oldData.costPerMmHeight !== newData.costPerMmHeight;
  
  if (!priceChanged) return;
  
  await db.modelPriceHistory.create({
    data: {
      modelId,
      basePrice: newData.basePrice,
      costPerMmWidth: newData.costPerMmWidth,
      costPerMmHeight: newData.costPerMmHeight,
      reason: reason || 'Actualización manual',
      effectiveFrom: new Date(),
      createdBy: userId,
    },
  });
}

// Usage in tRPC procedure:
export const modelRouter = router({
  update: adminProcedure
    .input(updateModelSchema)
    .mutation(async ({ ctx, input }) => {
      const oldModel = await ctx.db.model.findUnique({ where: { id: input.id } });
      const updatedModel = await ctx.db.model.update({
        where: { id: input.id },
        data: input,
      });
      
      // Auto-create price history
      await createModelPriceHistory(
        ctx.db,
        input.id,
        oldModel,
        updatedModel,
        ctx.session.user.id,
        input.priceChangeReason,
      );
      
      return updatedModel;
    }),
});
```

**Alternatives Considered**:
- ❌ **PostgreSQL triggers**: Harder to test, can't access session context (userId)
- ❌ **Manual admin input**: Error-prone, admins might forget to create history records
- ✅ **Service layer middleware**: Best balance of automation, testability, and auditability

---

### 7. Referential Integrity Enforcement

**Research Question**: How to prevent deletion of entities with dependent records?

**Decision**: Pre-delete check service + informative error messages

**Rationale**:
- **Prisma Schema**: Already has `onDelete: Restrict` for critical foreign keys (Model → QuoteItem, GlassType → QuoteItem)
- **User Experience**: Need to show clear error messages (not generic DB constraint violations)
- **Business Logic**: Some entities can be soft-deleted (set `isActive=false` instead)

**Implementation Details**:

```typescript
// server/services/referential-integrity.service.ts
export async function checkModelDeletionSafety(db: PrismaClient, modelId: string) {
  const quoteItemCount = await db.quoteItem.count({
    where: { modelId },
  });
  
  if (quoteItemCount > 0) {
    throw new TRPCError({
      code: 'CONFLICT',
      message: `No se puede eliminar el modelo porque tiene ${quoteItemCount} items de cotización asociados. Considera cambiar el estado a "draft" en su lugar.`,
    });
  }
}

// Usage in tRPC procedure:
export const modelRouter = router({
  delete: adminProcedure
    .input(z.object({ id: z.string().cuid() }))
    .mutation(async ({ ctx, input }) => {
      // Pre-delete safety check
      await checkModelDeletionSafety(ctx.db, input.id);
      
      // Safe to delete
      return await ctx.db.model.delete({ where: { id: input.id } });
    }),
});
```

**Alternatives Considered**:
- ❌ **Let DB handle errors**: Poor UX (cryptic error messages)
- ❌ **Force cascade delete**: Dangerous, could delete quote history
- ✅ **Pre-check + soft delete suggestion**: Best UX and data safety

---

## Technology Stack Decisions

### Forms: React Hook Form + Zod

**Decision**: Continue using existing pattern (React Hook Form + @hookform/resolvers/zod)

**Rationale**:
- Already used throughout the project (quote forms, auth forms)
- Excellent TypeScript support
- Seamless Zod integration (shared validation between client/server)
- Good performance with large forms (debounced validation)

**Key Libraries**:
- `react-hook-form@7.63.0` - Form state management
- `@hookform/resolvers@3.x` - Zod resolver
- `zod@4.1.1` - Schema validation

---

### UI Components: Shadcn/ui + Radix

**Decision**: Use existing component library (no new dependencies)

**Rationale**:
- Already installed and configured
- Accessible components (WCAG AA compliance)
- Composable primitives (build complex forms from atoms)

**Key Components for Admin**:
- `Form` + `FormField` + `FormItem` - Form structure
- `Select` - Dropdowns (suppliers, glass types)
- `Accordion` - Collapsible form sections
- `DataTable` - List pages with sorting/filtering
- `Dialog` - Delete confirmations
- `Badge` - Status indicators (draft/published, active/inactive)
- `Tabs` - Navigation between entity types (optional)

---

### State Management: TanStack Query (React Query)

**Decision**: Use tRPC's built-in TanStack Query integration

**Rationale**:
- Already configured in project (`@tanstack/react-query@5.69.0`)
- Automatic cache invalidation via tRPC mutations
- Optimistic updates for better UX
- No additional state management library needed

**Patterns**:
```typescript
// List page with auto-refresh:
const { data: models } = api.admin.model.list.useQuery({ status: 'published' });

// Create with optimistic update:
const createMutation = api.admin.model.create.useMutation({
  onSuccess: () => {
    toast.success('Modelo creado exitosamente');
    utils.admin.model.list.invalidate(); // Refresh list
    router.push('/admin/models');
  },
});
```

---

### Authorization: Existing RBAC Patterns

**Decision**: Reuse existing `adminProcedure` and middleware patterns

**Rationale**:
- Project already has robust RBAC implementation (UserRole enum, adminProcedure, middleware)
- Three-layer authorization (middleware, tRPC, UI) already established
- No new patterns needed

**Implementation**:
```typescript
// All admin procedures use existing adminProcedure:
export const modelRouter = router({
  list: adminProcedure.query(async ({ ctx }) => { /* ... */ }),
  create: adminProcedure.input(createModelSchema).mutation(async ({ ctx, input }) => { /* ... */ }),
  // ... etc
});

// Middleware already protects /admin/* routes:
// src/middleware.ts handles admin role check
```

---

### Logging: Winston (Server-Side Only)

**Decision**: Use existing Winston logger for audit trails

**Rationale**:
- Already configured (`winston@3.17.0`)
- Server-side only (safe from browser webpack issues)
- Structured logging with JSON format

**Implementation**:
```typescript
// All CRUD operations logged:
export const modelRouter = router({
  create: adminProcedure
    .input(createModelSchema)
    .mutation(async ({ ctx, input }) => {
      const model = await ctx.db.model.create({ data: input });
      
      logger.info('Model created', {
        userId: ctx.session.user.id,
        modelId: model.id,
        modelName: model.name,
        action: 'create',
      });
      
      return model;
    }),
});
```

---

## Summary of Key Decisions

| Topic                          | Decision                                                | Rationale                                         |
| ------------------------------ | ------------------------------------------------------- | ------------------------------------------------- |
| Model Form Architecture        | Single-page with collapsible sections (Accordion)       | Best UX for admin efficiency                      |
| Glass Type Relations           | Inline management during creation (useFieldArray)       | Complete configuration in one session             |
| Supplier Creation              | Pre-requisite with quick "Create New" link              | Data quality + flexibility                        |
| Glass Type Validation          | Only active glass types (`isActive=true`)               | Business rule alignment, simple validation        |
| Implementation Order           | 3-phase by dependency graph                             | Minimize blockers, enable parallel work           |
| Price History Tracking         | Service layer middleware (not DB triggers)              | Testability, auditability, flexibility            |
| Referential Integrity          | Pre-delete checks + informative errors                  | Better UX, data safety                            |
| Forms                          | React Hook Form + Zod (existing pattern)                | Already used, excellent TypeScript support        |
| UI Components                  | Shadcn/ui + Radix (existing library)                    | Accessible, composable, already configured        |
| State Management               | TanStack Query via tRPC (existing integration)          | Auto cache management, optimistic updates         |
| Authorization                  | Existing RBAC (adminProcedure + middleware)             | Three-layer security, already implemented         |
| Logging                        | Winston (server-side only)                              | Structured audit trails, safe from browser issues |
| Testing Strategy               | Unit (tRPC) + Integration (DB) + E2E (Playwright)       | Comprehensive coverage at three levels            |
| Database Transactions          | Prisma transactions for multi-step operations           | ACID guarantees for complex creates               |
| Error Handling                 | tRPC errors + Spanish messages + toast notifications    | Consistent UX, user-friendly feedback             |
| Pagination                     | Server-side pagination via tRPC (limit/offset)          | Performance for large datasets                    |
| Search/Filter                  | Debounced client state + server-side query              | Responsive UX, reduced API calls                  |
| Soft Delete vs Hard Delete     | Hard delete with pre-check, suggest soft delete on fail | Balance safety and data hygiene                   |
| Price Change Reason Validation | Optional for minor changes, required for major changes  | Pragmatic audit trail                             |

---

## Risks & Mitigations

| Risk                                                  | Likelihood | Impact | Mitigation                                                                                   |
| ----------------------------------------------------- | ---------- | ------ | -------------------------------------------------------------------------------------------- |
| Form complexity causes performance issues             | Low        | Medium | Use React Hook Form's `mode: 'onBlur'` to reduce validation calls                            |
| Admin accidentally deletes critical entity            | Medium     | High   | Confirmation dialogs + referential integrity checks                                          |
| Price history grows too large                         | Medium     | Low    | Add pagination to history views, archive old records (future enhancement)                    |
| Admin forgets to activate new entities                | Medium     | Low    | Show warning badges on draft/inactive entities in list views                                 |
| Glass type with many solutions causes UI clutter      | Low        | Low    | Use collapsible sections, limit to 5-10 solutions per glass type (business rule)             |
| Concurrent admin edits cause conflicts                | Low        | Medium | Use optimistic locking (check `updatedAt` timestamp before update)                           |
| Supplier name changes break historical data           | Low        | High   | Never cascade supplier updates, show historical name in quote views                          |
| Admin creates duplicate entities (typos in names)     | Medium     | Low    | Add fuzzy search warnings "Similar name exists: [X]. Continue?"                              |
| Performance degradation with 500+ glass types in form | Low        | Medium | Add server-side search/pagination to glass type selector (virtualized dropdown)              |
| Price history reason field ignored by admins          | Medium     | Low    | Make reason required for price changes >10% (Zod refinement), optional for minor adjustments |

---

## Open Questions (None - All Resolved)

All research questions have been answered with concrete decisions. Ready to proceed to Phase 1 (Design).

---

**Phase 0 Status**: ✅ Complete  
**Next Phase**: Phase 1 - Data Model & Contracts  
**Blockers**: None
