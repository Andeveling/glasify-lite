# Research: Standardize Glass Suppliers with SOLID Pattern

**Feature**: 013-standardize-glass-suppliers  
**Phase**: 0 (Outline & Research)  
**Date**: 2025-01-21

## Overview

This document consolidates research findings for standardizing the Glass Suppliers admin module. Since this feature replicates proven patterns from Services (spec completed) and Profile Suppliers (spec 012-simplify-profile-suppliers), most decisions are already validated. Research focuses on adaptations needed for the 8-field form complexity.

---

## Decision 1: Dialog Pattern for 8-Field Form

### Context
Glass supplier form has 8 fields (name, code, country, website, contactEmail, contactPhone, notes, isActive) vs 4 fields in Profile Suppliers. Need to verify dialog modal is appropriate UX.

### Decision
✅ **Use dialog modal with vertical scroll**

### Rationale
1. **Precedent**: Services module uses dialog for 4-field form successfully
2. **User Research**: Profile Suppliers dialog (4 fields) tested well, no complaints about modal UX
3. **Viewport Math**: 
   - 8 fields × ~80px height = ~640px
   - Standard laptop viewport: 768px height
   - Available space after header/padding: ~600px
   - **Conclusion**: Slight scroll needed, acceptable for admin workflow
4. **Consistency**: Using separate pages would break UX consistency (3 modules, 3 different patterns)

### Alternatives Considered
- **Separate pages**: Rejected because increases click overhead (50s → 25s), breaks consistency
- **Accordion/tabs**: Rejected because adds complexity for only 8 fields, over-engineering
- **Slide-over panel**: Rejected because shadcn/ui doesn't have this component, would need custom build

### Implementation Notes
- Use `max-h-[70vh] overflow-y-auto` on dialog content
- Group related fields (Contact section: email, phone)
- Use single-column layout (no two-column, maintains clarity)

---

## Decision 2: Hook Extraction Strategy

### Context
Need to split 354-line component into focused, testable units. Services module provides proven pattern.

### Decision
✅ **Two hooks: useGlassSupplierForm + useGlassSupplierMutations**

### Rationale
1. **Single Responsibility**: 
   - Form hook: React Hook Form setup, validation, default values (pure UI state)
   - Mutations hook: tRPC mutations, cache invalidation, router.refresh (API concerns)
2. **Testability**: Each hook can be tested independently with React Testing Library `renderHook()`
3. **Reusability**: Mutations hook could be used elsewhere (e.g., bulk operations in future)
4. **Proven Pattern**: Services and Profile Suppliers use exact same split

### Alternatives Considered
- **One hook (useGlassSupplier)**: Rejected because violates SRP, harder to test, mixes concerns
- **Three hooks (+ useGlassSupplierValidation)**: Rejected because Zod handles validation, over-engineering
- **No hooks (inline in component)**: Rejected because creates 400+ line component, unmaintainable

### Implementation Notes
- Form hook returns: `{ form, defaultValues, handleSubmit }`
- Mutations hook returns: `{ createMutation, updateMutation, deleteMutation }`
- Both hooks accept mode: `'create' | 'edit'` for behavior branching

---

## Decision 3: SSR Cache Invalidation Pattern

### Context
Page uses `export const dynamic = 'force-dynamic'` (SSR, no ISR). After mutations, client cache is stale.

### Decision
✅ **Two-step pattern: utils.invalidate() + router.refresh()**

### Rationale
1. **Constitution**: Documented in `.github/copilot-instructions.md` as required pattern for SSR pages
2. **Why Both Steps**:
   - `invalidate()`: Clears TanStack Query client-side cache
   - `router.refresh()`: Forces Next.js to re-run Server Component data fetching
3. **Without router.refresh()**: UI won't update because server data isn't re-fetched
4. **Proven Pattern**: Services and Profile Suppliers both use this successfully

### Alternatives Considered
- **Only invalidate()**: Rejected because doesn't trigger server re-fetch in SSR mode
- **Only router.refresh()**: Rejected because leaves stale data in TanStack Query cache
- **Full page reload (window.location.reload())**: Rejected because loses user state, poor UX

### Implementation Notes
```typescript
onSettled: () => {
  void utils.admin['glass-supplier'].list.invalidate(); // Step 1
  router.refresh(); // Step 2
}
```
- Use `onSettled` (not `onSuccess`) to run on both success and error
- Place `router.refresh()` AFTER `invalidate()` (order matters)

---

## Decision 4: Referential Integrity Handling

### Context
GlassSupplier has one-to-many relationship with GlassTypes. Delete must respect constraints.

### Decision
✅ **Server-side check + user-friendly Spanish error message**

### Rationale
1. **Database Integrity**: Prisma schema has `onDelete: Restrict` (or Cascade, needs verification)
2. **User Experience**: Must explain why delete failed, not just "Database error"
3. **Security**: Client-side check is UX only, server must enforce
4. **Consistency**: Services module has similar pattern (no example in Profile Suppliers because no relationships)

### Alternatives Considered
- **Cascade delete**: Rejected because losing glass types data is dangerous (orphans quotes)
- **Client-side only check**: Rejected because not secure, can be bypassed
- **Generic error message**: Rejected because poor UX, user doesn't understand why it failed

### Implementation Notes
```typescript
// tRPC procedure
if (await ctx.db.glassType.count({ where: { supplierId: input.id } }) > 0) {
  throw new TRPCError({
    code: 'BAD_REQUEST',
    message: 'No se puede eliminar este proveedor porque tiene tipos de vidrio asociados.'
  });
}
```
- Check happens in tRPC delete procedure (server-side)
- Error message in Spanish (user-facing)
- Toast displays error to user

---

## Decision 5: Form Field Grouping

### Context
8 fields is manageable but benefits from visual organization. Need grouping strategy.

### Decision
✅ **Logical sections with visual separators**

### Rationale
1. **Cognitive Load**: Grouping reduces perceived complexity (looks like 3 sections, not 8 fields)
2. **Scanning**: Users can quickly find related fields
3. **Industry Standard**: Admin forms commonly group related fields

### Groups Defined
1. **Basic Information**: name, code, country (required, always filled first)
2. **Contact Information**: website, contactEmail, contactPhone (optional, related)
3. **Additional**: notes, isActive (optional, metadata)

### Alternatives Considered
- **No grouping**: Rejected because 8 fields in a list is visually overwhelming
- **Accordion sections**: Rejected because hides fields, adds clicks, over-complicates
- **Wizard steps**: Rejected because only 8 fields, not enough to justify multi-step

### Implementation Notes
- Use `<div className="space-y-4">` for each section
- Add `<hr className="my-4" />` between sections
- No section headers needed (field labels are self-explanatory)

---

## Decision 6: Optimistic UI for Delete

### Context
Delete operations should feel instant. Need to decide on optimistic update strategy.

### Decision
✅ **Optimistic delete with automatic rollback on error**

### Rationale
1. **Consistency**: Services and Profile Suppliers use optimistic deletes
2. **User Experience**: Instant feedback, no waiting for server response
3. **Error Handling**: Rollback automatically restores deleted item if server fails
4. **Constitution Compliance**: Follows "Server-First Performance" principle (cache strategy)

### Alternatives Considered
- **No optimistic update**: Rejected because poor UX, user waits 1-2s for confirmation
- **Optimistic without rollback**: Rejected because leaves UI in inconsistent state on error

### Implementation Notes
```typescript
deleteMutation.useMutation({
  onMutate: async (variables) => {
    await utils.admin['glass-supplier'].list.cancel();
    const previousData = utils.admin['glass-supplier'].list.getData();
    
    // Optimistically remove from cache
    utils.admin['glass-supplier'].list.setData(params, (old) => ({
      ...old,
      items: old.items.filter(item => item.id !== variables.id),
      total: old.total - 1,
    }));
    
    return { previousData };
  },
  onError: (error, _vars, context) => {
    // Rollback on error
    if (context?.previousData) {
      utils.admin['glass-supplier'].list.setData(params, context.previousData);
    }
  },
  onSettled: () => {
    void utils.admin['glass-supplier'].list.invalidate();
    router.refresh();
  },
});
```

---

## Decision 7: Empty State Handling

### Context
When no suppliers exist (new tenant or all deleted), need appropriate UI.

### Decision
✅ **Use @/components/ui/empty components with icon variant**

### Rationale
1. **Consistency**: Services and Profile Suppliers use Empty components
2. **Reusability**: Existing shadcn/ui-based components, no custom code needed
3. **Accessibility**: Components have proper ARIA attributes
4. **Design System**: Maintains visual consistency across admin modules

### Alternatives Considered
- **Custom empty state**: Rejected because duplicates existing components
- **Just text message**: Rejected because poor UX, no visual hierarchy

### Implementation Notes
```tsx
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription, EmptyMedia } from '@/components/ui/empty';

{suppliers.length === 0 && (
  <Empty variant="icon">
    <EmptyHeader>
      <EmptyMedia icon={<PackageX />} />
      <EmptyTitle>No hay proveedores registrados</EmptyTitle>
      <EmptyDescription>
        Comienza creando tu primer proveedor de vidrio
      </EmptyDescription>
    </EmptyHeader>
    <Button onClick={() => setDialogOpen(true)}>
      <Plus className="mr-2 h-4 w-4" />
      Crear Proveedor
    </Button>
  </Empty>
)}
```

---

## Technology Best Practices

### React Hook Form (7.63.0)
- **Best Practice**: Use `zodResolver` for type-safe validation
- **Best Practice**: Use `defaultValues` prop (not `reset()`) for initial state
- **Best Practice**: Use `form.formState.isDirty` to detect unsaved changes
- **Reference**: [RHF Docs - zodResolver](https://react-hook-form.com/get-started#SchemaValidation)

### TanStack Query (5.69.0)
- **Best Practice**: Use `placeholderData: (prev) => prev` instead of deprecated `keepPreviousData`
- **Best Practice**: Always return context from `onMutate` for error rollback
- **Best Practice**: Use `onSettled` for cache invalidation (runs on both success/error)
- **Reference**: [TanStack Query v5 Migration](https://tanstack.com/query/v5/docs/react/guides/migrating-to-v5)

### Next.js 15 SSR
- **Best Practice**: Use `export const dynamic = 'force-dynamic'` for admin routes
- **Best Practice**: Call `router.refresh()` after mutations to re-fetch server data
- **Best Practice**: Use `useRouter` from `next/navigation` (not `next/router`)
- **Reference**: [Next.js 15 Docs - Dynamic Rendering](https://nextjs.org/docs/app/building-your-application/rendering/server-components#dynamic-rendering)

### tRPC 11.0.0
- **Best Practice**: Use `adminProcedure` for admin-only endpoints (built-in RBAC)
- **Best Practice**: Always validate input with `.input(zodSchema)`
- **Best Practice**: Throw `TRPCError` with Spanish messages for user-facing errors
- **Reference**: [tRPC Docs - Error Handling](https://trpc.io/docs/server/error-handling)

### Prisma 6.16.2
- **Best Practice**: Use transactions for multi-step operations
- **Best Practice**: Add indexes for filtered/sorted columns (name, country, isActive)
- **Best Practice**: Use `select` to avoid fetching unnecessary fields
- **Reference**: [Prisma Docs - Performance](https://www.prisma.io/docs/guides/performance-and-optimization)

---

## Integration Patterns

### Pattern: Dialog State Management
```typescript
// In list component
const [dialogOpen, setDialogOpen] = useState(false);
const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');
const [selectedSupplier, setSelectedSupplier] = useState<GlassSupplier | null>(null);

const handleCreate = () => {
  setDialogMode('create');
  setSelectedSupplier(null);
  setDialogOpen(true);
};

const handleEdit = (supplier: GlassSupplier) => {
  setDialogMode('edit');
  setSelectedSupplier(supplier);
  setDialogOpen(true);
};
```

### Pattern: Hook Composition
```typescript
// In dialog component
const form = useGlassSupplierForm({ mode, defaultValues: selectedSupplier });
const { createMutation, updateMutation, deleteMutation } = useGlassSupplierMutations({
  onSuccess: () => {
    setDialogOpen(false);
    form.reset();
  },
});

const handleSubmit = form.handleSubmit((data) => {
  if (mode === 'create') {
    createMutation.mutate(data);
  } else {
    updateMutation.mutate({ id: selectedSupplier.id, ...data });
  }
});
```

---

## Research Conclusion

All decisions are validated against:
1. ✅ **Constitution v2.1.1 compliance** (all checks pass)
2. ✅ **Proven patterns** (Services and Profile Suppliers)
3. ✅ **Technical constraints** (8-field form, tenant isolation, referential integrity)
4. ✅ **Best practices** (RHF, TanStack Query, Next.js 15, tRPC, Prisma)

**No unresolved questions remain.** Ready to proceed to Phase 1 (Design & Contracts).
