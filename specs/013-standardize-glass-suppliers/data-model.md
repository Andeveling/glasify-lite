# Data Model: Standardize Glass Suppliers

**Feature**: 013-standardize-glass-suppliers  
**Phase**: 1 (Design & Contracts)  
**Date**: 2025-01-21

## Overview

This document defines the data model for the Glass Suppliers refactor. Since this is a UI refactoring (not a data migration), the Prisma schema remains unchanged. This document focuses on the **in-memory data structures** used by the new dialog-based implementation.

---

## Entities

### GlassSupplier (Existing Prisma Model)

**Source**: `prisma/schema.prisma`

**Description**: Represents a manufacturer of glass products (e.g., Vitro, Guardian, AGC, Saint-Gobain). Used in glass type management and product pricing.

**Schema** (Reference Only - No Changes):
```prisma
model GlassSupplier {
  id           String      @id @default(cuid())
  name         String      // e.g., "Vitro", "Guardian Glass"
  code         String      // e.g., "VIT", "GUA"
  country      String      // e.g., "México", "Estados Unidos"
  website      String?     // e.g., "https://www.vitro.com"
  contactEmail String?     // e.g., "ventas@vitro.com"
  contactPhone String?     // e.g., "+52 81 8888 8888"
  notes        String?     // Additional information
  isActive     Boolean     @default(true)
  
  // Multi-tenant isolation
  tenantId     String
  tenant       Tenant      @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  
  // Relationships
  glassTypes   GlassType[] // One-to-many
  
  // Audit timestamps
  createdAt    DateTime    @default(now())
  updatedAt    DateTime    @updatedAt
  
  @@unique([tenantId, name]) // Unique name per tenant
  @@index([tenantId])
  @@index([name])
  @@index([country])
  @@index([isActive])
}
```

**Validation Rules** (Zod Schema):
- `name`: 3-100 characters, required, unique per tenant
- `code`: 2-20 characters, required, alphanumeric only
- `country`: 2-50 characters, required
- `website`: Optional, must be valid URL format
- `contactEmail`: Optional, must be valid email format
- `contactPhone`: Optional, 7-20 characters
- `notes`: Optional, max 500 characters
- `isActive`: Boolean, default true

**State Transitions**: N/A (no workflow states, just active/inactive toggle)

**Relationships**:
- `GlassSupplier` → `GlassType` (one-to-many): A supplier provides multiple glass types
- **Referential Integrity**: Cannot delete supplier if glass types exist (onDelete: Restrict in application logic)

---

## Component State Models

### DialogState (UI State)

**Description**: Manages dialog visibility and mode for create/edit operations.

**TypeScript Interface**:
```typescript
type DialogMode = 'create' | 'edit';

interface DialogState {
  open: boolean;
  mode: DialogMode;
  selectedSupplier: GlassSupplier | null; // null for create, populated for edit
}
```

**State Transitions**:
1. **Closed → Create Mode**: User clicks "New Supplier" button
   - `open: true, mode: 'create', selectedSupplier: null`
2. **Closed → Edit Mode**: User clicks edit icon on table row
   - `open: true, mode: 'edit', selectedSupplier: <supplier data>`
3. **Open → Closed**: User clicks cancel, submits form, or clicks overlay
   - `open: false, mode: unchanged, selectedSupplier: unchanged`

**Validation**: N/A (UI state, no server validation needed)

---

### FormState (React Hook Form)

**Description**: Manages form field values and validation state.

**TypeScript Interface**:
```typescript
interface GlassSupplierFormValues {
  name: string;
  code: string;
  country: string;
  website?: string;
  contactEmail?: string;
  contactPhone?: string;
  notes?: string;
  isActive: boolean;
}
```

**Default Values**:
- **Create Mode**: All fields empty except `isActive: true`
- **Edit Mode**: Populate from `selectedSupplier` data

**Validation** (React Hook Form + Zod):
- Handled by `zodResolver(createGlassSupplierSchema)`
- Server-side validation happens in tRPC procedure (double-check)
- Client-side validation provides immediate feedback

**Field Dependencies**: None (all fields are independent)

---

### MutationState (TanStack Query)

**Description**: Tracks the state of create/update/delete operations.

**TypeScript Interface** (TanStack Query Mutation State):
```typescript
interface MutationState<TData, TError, TVariables> {
  status: 'idle' | 'pending' | 'error' | 'success';
  isPending: boolean;
  isError: boolean;
  isSuccess: boolean;
  error: TError | null;
  data: TData | undefined;
}
```

**State Transitions**:
1. **idle → pending**: User submits form
   - Show loading spinner on submit button
   - Disable all form fields
2. **pending → success**: Server responds with success
   - Show success toast
   - Close dialog
   - Invalidate cache + router.refresh()
3. **pending → error**: Server responds with error
   - Show error toast with message
   - Keep dialog open
   - Re-enable form fields
4. **success/error → idle**: User opens dialog again
   - Reset mutation state

---

### ListQueryState (TanStack Query)

**Description**: Manages the state of the paginated suppliers list.

**TypeScript Interface**:
```typescript
interface GlassSupplierListQueryState {
  data: {
    items: GlassSupplier[];
    total: number;
    page: number;
    totalPages: number;
    itemsPerPage: number;
  } | undefined;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
}
```

**Query Parameters**:
```typescript
interface ListQueryParams {
  page: number;          // Current page (1-indexed)
  limit: number;         // Items per page (default: 20)
  search?: string;       // Search query (name, code, country)
  isActive: 'all' | 'active' | 'inactive'; // Filter by status
  sortBy: 'name' | 'createdAt' | 'updatedAt'; // Sort field
  sortOrder: 'asc' | 'desc'; // Sort direction
}
```

**Cache Invalidation Triggers**:
- After create: Invalidate list query → router.refresh()
- After update: Invalidate list query → router.refresh()
- After delete: Optimistic update + invalidate on settled → router.refresh()

---

## Data Flow Diagrams

### Create Flow

```
User Action: Click "New Supplier"
  ↓
Update DialogState: open=true, mode='create', selectedSupplier=null
  ↓
Render Dialog with Empty Form (isActive=true by default)
  ↓
User Fills Form Fields (name, code, country, ...)
  ↓
User Clicks "Create" Button
  ↓
FormState: Validate with Zod (client-side)
  ↓ (if valid)
MutationState: status='pending' (show loading spinner)
  ↓
tRPC: api.admin['glass-supplier'].create.mutate(data)
  ↓
Server: Validate with Zod → Check uniqueness → Insert to DB
  ↓ (on success)
MutationState: status='success'
  ↓
Show Success Toast ("Proveedor creado correctamente")
  ↓
Cache Invalidation: utils.invalidate() + router.refresh()
  ↓
Update DialogState: open=false
  ↓
ListQueryState: Re-fetch with new data from server
  ↓
User Sees New Supplier in Table
```

### Edit Flow

```
User Action: Click Edit Icon on Table Row
  ↓
Update DialogState: open=true, mode='edit', selectedSupplier=<data>
  ↓
Render Dialog with Pre-Populated Form (defaultValues from selectedSupplier)
  ↓
User Modifies Fields
  ↓
User Clicks "Save Changes" Button
  ↓
FormState: Validate with Zod (client-side)
  ↓ (if valid)
MutationState: status='pending' (show loading spinner)
  ↓
tRPC: api.admin['glass-supplier'].update.mutate({ id, ...data })
  ↓
Server: Validate with Zod → Check uniqueness → Update in DB
  ↓ (on success)
MutationState: status='success'
  ↓
Show Success Toast ("Proveedor actualizado correctamente")
  ↓
Cache Invalidation: utils.invalidate() + router.refresh()
  ↓
Update DialogState: open=false
  ↓
ListQueryState: Re-fetch with updated data from server
  ↓
User Sees Updated Supplier in Table
```

### Delete Flow (with Optimistic Update)

```
User Action: Click Delete Icon on Table Row
  ↓
Show Confirmation Dialog ("¿Estás seguro?")
  ↓
User Confirms Deletion
  ↓
MutationState: onMutate → Optimistic Update
  ↓
ListQueryState: Remove item from cache (immediate UI feedback)
  ↓
MutationState: status='pending'
  ↓
tRPC: api.admin['glass-supplier'].delete.mutate({ id })
  ↓
Server: Check referential integrity (has GlassTypes?)
  ↓ (if has relationships)
Server: Throw TRPCError("No se puede eliminar...")
  ↓
MutationState: onError → Rollback Optimistic Update
  ↓
ListQueryState: Restore item to cache
  ↓
Show Error Toast with Spanish message
  ↓ (if no relationships)
Server: Delete from DB
  ↓
MutationState: status='success'
  ↓
Show Success Toast ("Proveedor eliminado correctamente")
  ↓
MutationState: onSettled → Invalidate + router.refresh()
  ↓
ListQueryState: Re-fetch to confirm deletion
```

---

## Indexes & Performance

**Existing Indexes** (no changes needed):
- `@@index([tenantId])` - For tenant isolation filter
- `@@index([name])` - For search queries
- `@@index([country])` - For country filter
- `@@index([isActive])` - For active/inactive filter

**Query Performance Expectations**:
- List query (20 items): <100ms
- Search query: <200ms (full-text search on name/code/country)
- Create/Update: <500ms
- Delete: <300ms (includes referential integrity check)

---

## Error Handling

### Client-Side Errors

**Validation Errors** (Zod):
- Display inline below each field
- Prevent form submission
- Example: "El nombre debe tener entre 3 y 100 caracteres"

**Network Errors**:
- Display toast notification
- Keep dialog open
- Allow retry
- Example: "Error de conexión. Por favor, intenta nuevamente."

### Server-Side Errors

**Business Logic Errors** (TRPCError):
- `BAD_REQUEST`: Validation failed (duplicate name, invalid format)
- `FORBIDDEN`: User lacks admin permissions
- `NOT_FOUND`: Supplier doesn't exist (concurrent delete)
- `CONFLICT`: Referential integrity violation (has related GlassTypes)

**Error Messages** (Spanish):
- Duplicate name: "Ya existe un proveedor con este nombre"
- Referential integrity: "No se puede eliminar este proveedor porque tiene tipos de cristal asociados. Primero elimina o reasigna los tipos de cristal."
- Not found: "Proveedor no encontrado"
- Generic: "Ocurrió un error inesperado. Por favor, intenta nuevamente."

---

## Data Model Summary

This refactor **does not change the database schema**. Changes are limited to:

1. **New TypeScript Interfaces**: DialogState, FormState (internal to hooks)
2. **Enhanced State Management**: TanStack Query optimistic updates
3. **Improved Error Handling**: User-friendly Spanish messages
4. **No Migrations Needed**: Existing Prisma schema works as-is

**Key Takeaway**: This is a **UI architecture refactor**, not a data migration. Focus is on improving code quality, UX consistency, and maintainability.
