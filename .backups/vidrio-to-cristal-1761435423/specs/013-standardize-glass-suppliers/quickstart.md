# Quickstart: Standardize Glass Suppliers

**Feature**: 013-standardize-glass-suppliers  
**Branch**: `013-standardize-glass-suppliers`  
**Date**: 2025-01-21

## Overview

This quickstart guide helps developers implement the Glass Suppliers standardization. Follow these steps to refactor the existing page-based implementation into a dialog-based CRUD pattern consistent with Services and Profile Suppliers modules.

**Goal**: Replace 354-line monolithic form with focused, testable hooks and a composable dialog UI.

---

## Prerequisites

- [x] Feature branch `013-standardize-glass-suppliers` checked out
- [x] All dependencies installed (`pnpm install`)
- [x] Database seeded with test data (`pnpm db:seed`)
- [x] Spec, plan, research, and data-model documents read

---

## Implementation Checklist

### Phase 1: Create Custom Hooks (1-2 hours)

#### 1.1 Create `useGlassSupplierForm` Hook

**File**: `src/app/(dashboard)/admin/glass-suppliers/_hooks/use-glass-supplier-form.ts`

**Reference**: `src/app/(dashboard)/admin/services/_hooks/use-service-form.ts`

**Responsibilities**:
- Setup React Hook Form with Zod validation
- Provide default values (create vs edit mode)
- Return form instance and submit handler

**Key Points**:
- Use `zodResolver(createGlassSupplierSchema)`
- Handle mode: `'create' | 'edit'`
- Default values: empty for create, populated from `defaultValues` prop for edit
- Target: <120 lines

**Test Coverage**:
- [ ] Initializes with empty values in create mode
- [ ] Initializes with defaultValues in edit mode
- [ ] Validates required fields
- [ ] Validates optional field formats (email, URL)

---

#### 1.2 Create `useGlassSupplierMutations` Hook

**File**: `src/app/(dashboard)/admin/glass-suppliers/_hooks/use-glass-supplier-mutations.ts`

**Reference**: `src/app/(dashboard)/admin/services/_hooks/use-service-mutations.ts`

**Responsibilities**:
- Setup tRPC mutations (create, update, delete)
- Handle success/error toasts
- Invalidate cache + router.refresh (SSR pattern)
- Provide loading states

**Key Points**:
- Use `api.admin['glass-supplier'].create/update/delete.useMutation()`
- Two-step cache invalidation: `utils.invalidate()` + `router.refresh()`
- Toast messages in Spanish
- Target: <120 lines

**Test Coverage**:
- [ ] Calls createMutation with correct data
- [ ] Calls updateMutation with id + data
- [ ] Invalidates cache on success
- [ ] Calls router.refresh on success
- [ ] Shows toasts for success/error

---

### Phase 2: Create Dialog Component (2-3 hours)

#### 2.1 Create `GlassSupplierDialog` Component

**File**: `src/app/(dashboard)/admin/glass-suppliers/_components/glass-supplier-dialog.tsx`

**Reference**: `src/app/(dashboard)/admin/services/_components/service-dialog.tsx`

**Responsibilities**:
- Render shadcn/ui Dialog with form
- Compose hooks (useGlassSupplierForm, useGlassSupplierMutations)
- Handle dialog open/close state
- Provide 8-field form UI

**Key Points**:
- Props: `open`, `onOpenChange`, `mode`, `defaultValues`
- Use hooks for logic, component only for UI composition
- Form sections: Basic Info, Contact Info, Additional
- Use `max-h-[70vh] overflow-y-auto` for scrollable content
- Target: <250 lines

**Form Structure**:
```tsx
<DialogContent className="max-h-[70vh] overflow-y-auto">
  <DialogHeader>
    <DialogTitle>{mode === 'create' ? 'Crear Proveedor' : 'Editar Proveedor'}</DialogTitle>
  </DialogHeader>
  
  <Form {...form}>
    {/* Basic Information Section */}
    <FormField name="name" />
    <FormField name="code" />
    <FormField name="country" />
    
    <hr className="my-4" />
    
    {/* Contact Information Section */}
    <FormField name="website" />
    <FormField name="contactEmail" />
    <FormField name="contactPhone" />
    
    <hr className="my-4" />
    
    {/* Additional Section */}
    <FormField name="notes" />
    <FormField name="isActive" render={Checkbox} />
  </Form>
  
  <DialogFooter>
    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
    <Button onClick={handleSubmit} disabled={isPending}>
      {isPending ? <Loader2 className="animate-spin" /> : null}
      {mode === 'create' ? 'Crear Proveedor' : 'Guardar Cambios'}
    </Button>
  </DialogFooter>
</DialogContent>
```

**Test Coverage**:
- [ ] Renders with correct title in create/edit mode
- [ ] Pre-populates fields in edit mode
- [ ] Closes dialog on cancel
- [ ] Submits form and closes on success

---

### Phase 3: Update List Component (1 hour)

#### 3.1 Modify `GlassSupplierList` Component

**File**: `src/app/(dashboard)/admin/glass-suppliers/_components/glass-supplier-list.tsx`

**Changes**:
1. Remove `handleCreateClick` and `handleEditClick` (no router.push)
2. Add dialog state management:
   ```typescript
   const [dialogOpen, setDialogOpen] = useState(false);
   const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');
   const [selectedSupplier, setSelectedSupplier] = useState<GlassSupplier | null>(null);
   ```
3. Update button handlers to open dialog instead of navigate
4. Render `<GlassSupplierDialog>` at bottom of component
5. Keep delete confirmation dialog (already implemented)

**Before**:
```typescript
const handleCreateClick = () => {
  router.push('/admin/glass-suppliers/new');
};

const handleEditClick = (id: string) => {
  router.push(`/admin/glass-suppliers/${id}`);
};
```

**After**:
```typescript
const handleCreateClick = () => {
  setDialogMode('create');
  setSelectedSupplier(null);
  setDialogOpen(true);
};

const handleEditClick = (supplier: GlassSupplier) => {
  setDialogMode('edit');
  setSelectedSupplier(supplier);
  setDialogOpen(true);
};
```

**Test Coverage**:
- [ ] Opens dialog in create mode when clicking "New Supplier"
- [ ] Opens dialog in edit mode when clicking edit icon
- [ ] Passes correct supplier data to dialog

---

### Phase 4: Cleanup (30 minutes)

#### 4.1 Remove Deprecated Files

```bash
# Remove separate pages
rm -rf src/app/(dashboard)/admin/glass-suppliers/new
rm -rf src/app/(dashboard)/admin/glass-suppliers/[id]

# Remove old form component
rm src/app/(dashboard)/admin/glass-suppliers/_components/glass-supplier-form.tsx
```

#### 4.2 Remove Unused Imports

Check `glass-supplier-list.tsx` for:
- [ ] Removed `useRouter` import (not needed anymore)
- [ ] Removed any references to old form component

---

### Phase 5: Testing (2-3 hours)

#### 5.1 Unit Tests

**File**: `tests/unit/glass-suppliers/use-glass-supplier-form.test.ts`

```typescript
import { renderHook } from '@testing-library/react';
import { useGlassSupplierForm } from '@/app/(dashboard)/admin/glass-suppliers/_hooks/use-glass-supplier-form';

describe('useGlassSupplierForm', () => {
  it('should initialize with empty values in create mode', () => {
    const { result } = renderHook(() => useGlassSupplierForm({ mode: 'create' }));
    expect(result.current.form.getValues().name).toBe('');
    expect(result.current.form.getValues().isActive).toBe(true);
  });
  
  it('should initialize with defaultValues in edit mode', () => {
    const defaultValues = { name: 'Vitro', code: 'VIT', country: 'México', isActive: true };
    const { result } = renderHook(() => useGlassSupplierForm({ mode: 'edit', defaultValues }));
    expect(result.current.form.getValues().name).toBe('Vitro');
  });
  
  // Add more tests...
});
```

**File**: `tests/unit/glass-suppliers/use-glass-supplier-mutations.test.ts`

```typescript
import { renderHook, waitFor } from '@testing-library/react';
import { useGlassSupplierMutations } from '@/app/(dashboard)/admin/glass-suppliers/_hooks/use-glass-supplier-mutations';

describe('useGlassSupplierMutations', () => {
  it('should call createMutation with form data', async () => {
    const { result } = renderHook(() => useGlassSupplierMutations());
    
    result.current.createMutation.mutate({ name: 'Test', code: 'TST', country: 'Test' });
    
    await waitFor(() => {
      expect(result.current.createMutation.isSuccess).toBe(true);
    });
  });
  
  // Add more tests...
});
```

---

#### 5.2 E2E Tests

**File**: `e2e/admin/glass-suppliers.spec.ts`

Update existing tests to use dialog pattern:

```typescript
import { test, expect } from '@playwright/test';

test.describe('Glass Suppliers CRUD', () => {
  test('should create glass supplier via dialog', async ({ page }) => {
    await page.goto('/admin/glass-suppliers');
    
    // Open create dialog
    await page.getByRole('button', { name: /nuevo proveedor/i }).click();
    
    // Fill form
    await page.getByLabel(/nombre/i).fill('Test Supplier');
    await page.getByLabel(/código/i).fill('TST');
    await page.getByLabel(/país/i).fill('Test Country');
    await page.getByLabel(/sitio web/i).fill('https://test.com');
    await page.getByLabel(/email de contacto/i).fill('test@test.com');
    
    // Submit
    await page.getByRole('button', { name: /crear proveedor/i }).click();
    
    // Verify success
    await expect(page.getByText(/proveedor creado correctamente/i)).toBeVisible();
    await expect(page.getByRole('row', { name: /test supplier/i })).toBeVisible();
  });
  
  test('should edit glass supplier via dialog', async ({ page }) => {
    await page.goto('/admin/glass-suppliers');
    
    // Open edit dialog (assume Vitro exists)
    await page.getByRole('button', { name: /editar.*vitro/i }).first().click();
    
    // Modify field
    await page.getByLabel(/nombre/i).fill('Vitro Updated');
    
    // Submit
    await page.getByRole('button', { name: /guardar cambios/i }).click();
    
    // Verify success
    await expect(page.getByText(/proveedor actualizado correctamente/i)).toBeVisible();
    await expect(page.getByRole('row', { name: /vitro updated/i })).toBeVisible();
  });
  
  test('should delete glass supplier with confirmation', async ({ page }) => {
    await page.goto('/admin/glass-suppliers');
    
    // Click delete (assume Test Supplier exists)
    await page.getByRole('button', { name: /eliminar.*test supplier/i }).first().click();
    
    // Confirm deletion
    await page.getByRole('button', { name: /eliminar/i }).click();
    
    // Verify success
    await expect(page.getByText(/proveedor eliminado correctamente/i)).toBeVisible();
    await expect(page.getByRole('row', { name: /test supplier/i })).not.toBeVisible();
  });
  
  test('should show error when deleting supplier with glass types', async ({ page }) => {
    await page.goto('/admin/glass-suppliers');
    
    // Try to delete supplier with relationships (e.g., Vitro)
    await page.getByRole('button', { name: /eliminar.*vitro/i }).first().click();
    await page.getByRole('button', { name: /eliminar/i }).click();
    
    // Verify error
    await expect(page.getByText(/tiene tipos de vidrio asociados/i)).toBeVisible();
    await expect(page.getByRole('row', { name: /vitro/i })).toBeVisible();
  });
});
```

---

### Phase 6: Manual QA (1 hour)

#### 6.1 Functional Testing

- [ ] **Create Flow**
  - [ ] Open dialog via "Nuevo Proveedor" button
  - [ ] Fill all required fields (name, code, country)
  - [ ] Fill optional fields (website, email, phone, notes)
  - [ ] Submit form
  - [ ] Verify success toast
  - [ ] Verify new supplier appears in list
  - [ ] Verify dialog closes after submission

- [ ] **Edit Flow**
  - [ ] Click edit icon on existing supplier
  - [ ] Verify form pre-populates with correct data
  - [ ] Modify fields
  - [ ] Submit form
  - [ ] Verify success toast
  - [ ] Verify changes appear in list
  - [ ] Verify dialog closes after submission

- [ ] **Delete Flow (No Relationships)**
  - [ ] Create test supplier with no glass types
  - [ ] Click delete icon
  - [ ] Verify confirmation dialog
  - [ ] Confirm deletion
  - [ ] Verify success toast
  - [ ] Verify supplier disappears from list

- [ ] **Delete Flow (With Relationships)**
  - [ ] Try to delete supplier with glass types (e.g., Vitro)
  - [ ] Verify error toast with referential integrity message
  - [ ] Verify supplier remains in list

- [ ] **Validation**
  - [ ] Try to submit with empty required fields → see inline errors
  - [ ] Try invalid email format → see "Email inválido" error
  - [ ] Try invalid URL format → see "URL inválida" error
  - [ ] Try duplicate supplier name → see "Ya existe un proveedor" error

- [ ] **Dialog UX**
  - [ ] Click overlay → dialog closes
  - [ ] Press Escape → dialog closes
  - [ ] Click "Cancelar" → dialog closes
  - [ ] Unsaved changes discarded without warning (expected behavior)

- [ ] **Accessibility**
  - [ ] Tab through form fields → focus order is logical
  - [ ] Press Escape → dialog closes
  - [ ] Screen reader announces dialog title
  - [ ] Error messages are read by screen reader

---

### Phase 7: Code Quality (30 minutes)

#### 7.1 Linting and Formatting

```bash
# Run linter
pnpm lint

# Fix linting issues
pnpm lint:fix

# Type check
pnpm typecheck
```

#### 7.2 Success Criteria Validation

- [ ] **SC-004**: Form hook is <120 lines ✅
- [ ] **SC-005**: Mutations hook is <120 lines ✅
- [ ] **SC-006**: Dialog component is <250 lines (down from 354) ✅
- [ ] **SC-008**: Zero navigation to separate pages ✅
- [ ] **TQC-003**: Component only handles UI composition (no business logic) ✅
- [ ] **TQC-008**: No Winston logger in client components ✅

---

## Common Issues & Solutions

### Issue 1: Form Not Pre-Populating in Edit Mode

**Symptom**: Dialog opens in edit mode but fields are empty

**Solution**: Ensure `defaultValues` prop is passed and `useEffect` resets form when `defaultValues` changes:

```typescript
useEffect(() => {
  if (mode === 'edit' && defaultValues) {
    form.reset(defaultValues);
  }
}, [mode, defaultValues, form]);
```

---

### Issue 2: List Not Updating After Mutation

**Symptom**: Create/update succeeds but list shows stale data

**Solution**: Verify two-step cache invalidation:

```typescript
onSettled: () => {
  void utils.admin['glass-supplier'].list.invalidate(); // Step 1
  router.refresh(); // Step 2
}
```

**Check**: `router` is imported from `next/navigation` (not `next/router`)

---

### Issue 3: Dialog Not Closing After Submit

**Symptom**: Form submits successfully but dialog stays open

**Solution**: Ensure `onOpenChange(false)` is called in mutation's `onSuccess`:

```typescript
const { createMutation, updateMutation } = useGlassSupplierMutations({
  onSuccess: () => {
    onOpenChange(false);
    form.reset();
  },
});
```

---

### Issue 4: Referential Integrity Error Not User-Friendly

**Symptom**: Delete fails with generic "Database error" message

**Solution**: Check tRPC procedure throws Spanish error:

```typescript
if (await ctx.db.glassType.count({ where: { supplierId: input.id } }) > 0) {
  throw new TRPCError({
    code: 'BAD_REQUEST',
    message: 'No se puede eliminar este proveedor porque tiene tipos de vidrio asociados.',
  });
}
```

---

## Timeline Estimate

| Phase            | Time Estimate | Total   |
| ---------------- | ------------- | ------- |
| 1. Create Hooks  | 1-2 hours     | 2h      |
| 2. Create Dialog | 2-3 hours     | 3h      |
| 3. Update List   | 1 hour        | 1h      |
| 4. Cleanup       | 30 minutes    | 0.5h    |
| 5. Testing       | 2-3 hours     | 3h      |
| 6. Manual QA     | 1 hour        | 1h      |
| 7. Code Quality  | 30 minutes    | 0.5h    |
| **Total**        |               | **11h** |

**Recommended Sprint**: 2-3 days (with buffer for unexpected issues)

---

## Next Steps

After implementation:

1. [ ] Create PR with title: `refactor(glass-suppliers): standardize with SOLID pattern`
2. [ ] Reference spec: `specs/013-standardize-glass-suppliers/spec.md`
3. [ ] Include before/after metrics in PR description
4. [ ] Request code review from 1 team member
5. [ ] Merge to develop after approval
6. [ ] Close feature branch
7. [ ] Update CHANGELOG.md

---

## References

- **Spec**: [spec.md](./spec.md)
- **Research**: [research.md](./research.md)
- **Data Model**: [data-model.md](./data-model.md)
- **Component Contract**: [contracts/glass-supplier-dialog.contract.md](./contracts/glass-supplier-dialog.contract.md)
- **Services Reference**: `/src/app/(dashboard)/admin/services/_components/`
- **Profile Suppliers Reference**: `/src/app/(dashboard)/admin/profile-suppliers/_components/`
