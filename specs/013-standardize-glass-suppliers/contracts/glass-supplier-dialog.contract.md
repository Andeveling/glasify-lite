# Component API Contract: GlassSupplierDialog

**Component**: `GlassSupplierDialog`  
**Path**: `src/app/(dashboard)/admin/glass-suppliers/_components/glass-supplier-dialog.tsx`  
**Type**: Client Component  
**Date**: 2025-01-21

## Overview

This contract defines the public API for the `GlassSupplierDialog` component, which provides a dialog-based interface for creating and editing glass suppliers. This component is part of the standardization effort to provide consistent CRUD UX across all admin modules.

---

## Component Signature

```typescript
interface GlassSupplierDialogProps {
  /**
   * Controls dialog visibility
   */
  open: boolean;
  
  /**
   * Callback fired when dialog should close
   * Parent component controls open state
   */
  onOpenChange: (open: boolean) => void;
  
  /**
   * Operation mode: create new supplier or edit existing
   */
  mode: 'create' | 'edit';
  
  /**
   * Default values for form fields
   * - Required when mode='edit'
   * - Ignored when mode='create'
   */
  defaultValues?: GlassSupplier;
}

export function GlassSupplierDialog(props: GlassSupplierDialogProps): JSX.Element;
```

---

## Props API

### `open: boolean`

**Required**: Yes  
**Default**: N/A  
**Description**: Controls whether the dialog is visible. Managed by parent component state.

**Example**:
```typescript
const [dialogOpen, setDialogOpen] = useState(false);
<GlassSupplierDialog open={dialogOpen} onOpenChange={setDialogOpen} />
```

**Validation**: Must be boolean

---

### `onOpenChange: (open: boolean) => void`

**Required**: Yes  
**Default**: N/A  
**Description**: Callback function invoked when dialog should close (user clicks cancel, overlay, or successfully submits form).

**Example**:
```typescript
<GlassSupplierDialog 
  open={dialogOpen} 
  onOpenChange={(open) => {
    setDialogOpen(open);
    if (!open) {
      // Dialog closed, reset selection state
      setSelectedSupplier(null);
    }
  }} 
/>
```

**Validation**: Must be function

**When Called**:
- User clicks "Cancel" button
- User clicks dialog overlay
- User presses Escape key
- Form submission succeeds (after showing success toast)

---

### `mode: 'create' | 'edit'`

**Required**: Yes  
**Default**: N/A  
**Description**: Determines dialog behavior and form initialization.

**Values**:
- `'create'`: New supplier form with empty fields (except isActive=true)
- `'edit'`: Edit existing supplier with pre-populated fields from `defaultValues`

**Example**:
```typescript
// Create mode
<GlassSupplierDialog 
  open={true} 
  onOpenChange={setOpen} 
  mode="create" 
/>

// Edit mode
<GlassSupplierDialog 
  open={true} 
  onOpenChange={setOpen} 
  mode="edit" 
  defaultValues={selectedSupplier}
/>
```

**Validation**: Must be literal string 'create' or 'edit'

**Impact on UI**:
- Create mode: Dialog title "Crear Proveedor", submit button "Crear Proveedor"
- Edit mode: Dialog title "Editar Proveedor", submit button "Guardar Cambios"

---

### `defaultValues?: GlassSupplier`

**Required**: Conditional (required when mode='edit', ignored when mode='create')  
**Default**: N/A  
**Description**: Initial form values when editing existing supplier.

**Type**:
```typescript
interface GlassSupplier {
  id: string;
  name: string;
  code: string;
  country: string;
  website: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  notes: string | null;
  isActive: boolean;
  tenantId: string;
  createdAt: Date;
  updatedAt: Date;
}
```

**Example**:
```typescript
<GlassSupplierDialog 
  open={true} 
  onOpenChange={setOpen} 
  mode="edit" 
  defaultValues={{
    id: "clx123abc",
    name: "Vitro",
    code: "VIT",
    country: "México",
    website: "https://www.vitro.com",
    contactEmail: "ventas@vitro.com",
    contactPhone: "+52 81 8888 8888",
    notes: "Principal proveedor de cristal templado",
    isActive: true,
    tenantId: "tenant123",
    createdAt: new Date("2024-01-15"),
    updatedAt: new Date("2024-06-20"),
  }}
/>
```

**Validation**: 
- Must be valid GlassSupplier object when mode='edit'
- Runtime error thrown if mode='edit' and defaultValues is undefined

---

## Behavior Contracts

### Form Submission (Create Mode)

**Preconditions**:
- Dialog open with mode='create'
- User fills required fields (name, code, country)
- User clicks "Crear Proveedor" button

**Process**:
1. Validate form with Zod schema (client-side)
2. If invalid: Show inline errors, prevent submission
3. If valid: Call `createMutation.mutate(data)`
4. Show loading spinner on button, disable all fields
5. Wait for server response

**Success Path**:
1. Server creates supplier in database
2. Show success toast: "Proveedor creado correctamente"
3. Call `onOpenChange(false)` to close dialog
4. Invalidate TanStack Query cache
5. Call `router.refresh()` to re-fetch server data
6. User sees new supplier in list

**Error Path**:
1. Server returns error (duplicate name, validation failed)
2. Show error toast with Spanish message
3. Keep dialog open
4. Re-enable form fields
5. User can retry submission

---

### Form Submission (Edit Mode)

**Preconditions**:
- Dialog open with mode='edit' and valid defaultValues
- User modifies one or more fields
- User clicks "Guardar Cambios" button

**Process**:
1. Validate form with Zod schema (client-side)
2. If invalid: Show inline errors, prevent submission
3. If valid: Call `updateMutation.mutate({ id: defaultValues.id, ...data })`
4. Show loading spinner on button, disable all fields
5. Wait for server response

**Success Path**:
1. Server updates supplier in database
2. Show success toast: "Proveedor actualizado correctamente"
3. Call `onOpenChange(false)` to close dialog
4. Invalidate TanStack Query cache
5. Call `router.refresh()` to re-fetch server data
6. User sees updated supplier in list

**Error Path**:
1. Server returns error (duplicate name, not found, validation failed)
2. Show error toast with Spanish message
3. Keep dialog open
4. Re-enable form fields
5. User can retry submission

---

### Dialog Close

**Triggers**:
- User clicks "Cancel" button
- User clicks dialog overlay
- User presses Escape key
- Form submission succeeds

**Process**:
1. Call `onOpenChange(false)`
2. Reset form state (clear validation errors)
3. Close dialog with animation

**No Confirmation**:
- Unsaved changes are discarded without warning (follows web convention for modals)
- Matches behavior of Services and Profile Suppliers dialogs

---

## State Management Contracts

### Internal State (Private)

The component manages these internal states:

```typescript
// From useGlassSupplierForm hook
const form = useForm<GlassSupplierFormValues>({
  resolver: zodResolver(createGlassSupplierSchema),
  defaultValues: mode === 'edit' ? defaultValues : { isActive: true },
});

// From useGlassSupplierMutations hook
const { createMutation, updateMutation } = useGlassSupplierMutations({
  onSuccess: () => {
    onOpenChange(false);
    form.reset();
  },
});
```

**State Contracts**:
- Form state is reset on dialog close
- Mutations are cancelled if component unmounts
- Loading states prevent double submission

---

### External State (Props)

**Parent Component Responsibilities**:
1. Manage `open` state
2. Manage `mode` state
3. Manage `defaultValues` state (for edit mode)
4. Handle `onOpenChange` callback

**Example Parent State**:
```typescript
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

---

## Accessibility Contracts

### Keyboard Navigation
- **Tab**: Navigate between form fields
- **Shift+Tab**: Navigate backwards
- **Escape**: Close dialog (calls onOpenChange(false))
- **Enter**: Submit form (when focus is on submit button)

### Screen Readers
- Dialog has `role="dialog"` and `aria-labelledby` pointing to title
- Form fields have associated labels with `htmlFor` attributes
- Error messages have `aria-describedby` linking to field
- Loading states announced via `aria-live="polite"`

### Focus Management
- Focus trapped within dialog when open
- Focus returns to trigger button when closed
- First field auto-focused on dialog open

---

## Performance Contracts

### Bundle Size
- Component + hooks: <50KB gzipped
- No heavy dependencies (uses existing shadcn/ui, RHF, TanStack Query)

### Render Performance
- Dialog open: <200ms (includes animation)
- Form render: <100ms (8 fields)
- No unnecessary re-renders (React.memo not needed, form state is local)

### Network Performance
- Form submission: <1s (network dependent)
- Cache invalidation: <500ms (includes router.refresh)

---

## Error Handling Contracts

### Client-Side Errors

**Validation Errors**:
```typescript
// Example Zod error
{
  name: "El nombre debe tener entre 3 y 100 caracteres",
  code: "El código debe tener entre 2 y 20 caracteres",
  country: "El país debe tener entre 2 y 50 caracteres",
  contactEmail: "Email inválido",
  website: "URL inválida",
}
```

**Display**: Inline below each field with red text

---

### Server-Side Errors

**TRPCError Codes**:
- `BAD_REQUEST`: Validation failed or business rule violated
- `FORBIDDEN`: User lacks admin permissions
- `NOT_FOUND`: Supplier doesn't exist (concurrent delete)
- `INTERNAL_SERVER_ERROR`: Unexpected server error

**Error Messages (Spanish)**:
```typescript
{
  BAD_REQUEST: "Ya existe un proveedor con este nombre",
  FORBIDDEN: "No tienes permisos para realizar esta acción",
  NOT_FOUND: "Proveedor no encontrado",
  INTERNAL_SERVER_ERROR: "Ocurrió un error inesperado. Por favor, intenta nuevamente.",
}
```

**Display**: Toast notification with error message

---

## Testing Contracts

### Unit Tests (Hooks)

**useGlassSupplierForm**:
- ✅ Initializes with empty values in create mode
- ✅ Initializes with defaultValues in edit mode
- ✅ Validates required fields (name, code, country)
- ✅ Validates optional field formats (email, URL, phone)
- ✅ Prevents submission when form is invalid

**useGlassSupplierMutations**:
- ✅ Calls createMutation with form data in create mode
- ✅ Calls updateMutation with id + form data in edit mode
- ✅ Invalidates cache on success
- ✅ Calls router.refresh on success
- ✅ Shows success toast on success
- ✅ Shows error toast on error
- ✅ Calls onSuccess callback when provided

---

### Integration Tests (Component)

- ✅ Renders with correct title in create mode
- ✅ Renders with correct title in edit mode
- ✅ Pre-populates form fields in edit mode
- ✅ Submits form and closes dialog on success
- ✅ Shows error message and keeps dialog open on error
- ✅ Closes dialog when user clicks cancel
- ✅ Closes dialog when user clicks overlay
- ✅ Closes dialog when user presses Escape

---

### E2E Tests (Full Flow)

**Create Flow**:
```typescript
test('should create glass supplier via dialog', async ({ page }) => {
  await page.goto('/admin/glass-suppliers');
  await page.getByRole('button', { name: /nuevo proveedor/i }).click();
  
  // Fill form
  await page.getByLabel(/nombre/i).fill('Test Supplier');
  await page.getByLabel(/código/i).fill('TST');
  await page.getByLabel(/país/i).fill('Test Country');
  
  // Submit
  await page.getByRole('button', { name: /crear proveedor/i }).click();
  
  // Verify success
  await expect(page.getByText(/proveedor creado correctamente/i)).toBeVisible();
  await expect(page.getByRole('row', { name: /test supplier/i })).toBeVisible();
});
```

**Edit Flow**:
```typescript
test('should edit glass supplier via dialog', async ({ page }) => {
  await page.goto('/admin/glass-suppliers');
  await page.getByRole('button', { name: /editar.*vitro/i }).click();
  
  // Modify field
  await page.getByLabel(/nombre/i).fill('Vitro Updated');
  
  // Submit
  await page.getByRole('button', { name: /guardar cambios/i }).click();
  
  // Verify success
  await expect(page.getByText(/proveedor actualizado correctamente/i)).toBeVisible();
  await expect(page.getByRole('row', { name: /vitro updated/i })).toBeVisible();
});
```

---

## Breaking Changes

### From Old Implementation

**Removed**:
- `/admin/glass-suppliers/new` route (replaced by dialog)
- `/admin/glass-suppliers/[id]` route (replaced by dialog)
- `GlassSupplierForm` component (replaced by `GlassSupplierDialog`)

**Migration Path**:
- Update all links/navigation to use dialog state instead of router.push()
- Update E2E tests to interact with dialog instead of separate pages

---

## Version History

| Version | Date       | Changes                     |
| ------- | ---------- | --------------------------- |
| 1.0.0   | 2025-01-21 | Initial contract definition |

---

## References

- **Services Dialog**: `/src/app/(dashboard)/admin/services/_components/service-dialog.tsx`
- **Profile Suppliers Dialog**: `/src/app/(dashboard)/admin/profile-suppliers/_components/profile-supplier-dialog.tsx`
- **Spec**: `/specs/013-standardize-glass-suppliers/spec.md`
- **Data Model**: `/specs/013-standardize-glass-suppliers/data-model.md`
