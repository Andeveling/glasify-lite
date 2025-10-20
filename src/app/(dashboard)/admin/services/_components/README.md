# Service Dialog - SOLID Architecture

## Overview

This component has been refactored following **SOLID principles**, specifically focusing on **Single Responsibility Principle (SRP)** by extracting business logic into custom hooks.

## Architecture

```
service-dialog.tsx (UI Composition)
    ├── useServiceForm (Form State Management)
    └── useServiceMutations (API Mutations & Cache Invalidation)
```

### Before Refactoring (Anti-pattern)

**Single Component doing everything**:
- ❌ Form state management (React Hook Form)
- ❌ Mutation logic (create/update)
- ❌ Cache invalidation (TanStack Query)
- ❌ Server refresh (Next.js Router)
- ❌ Toast notifications
- ❌ Auto-assignment logic (type → unit)
- ❌ UI rendering

**Problems**:
- Hard to test individual concerns
- Hard to reuse logic in other components
- Violates Single Responsibility Principle
- Component is too large (~200 lines)

### After Refactoring (SOLID)

#### 1. `service-dialog.tsx` (UI Composition)

**Responsibility**: User interaction and UI composition

**What it does**:
- Renders the dialog with form fields
- Handles user interactions (submit, cancel)
- Composes hooks and UI elements
- Delegates all business logic to hooks

**Lines of code**: ~100 (50% reduction)

#### 2. `use-service-form.ts` (Form State)

**Responsibility**: Form state management

**What it does**:
- Initializes React Hook Form with validation
- Manages form reset logic
- Auto-assigns unit when type changes
- Provides form methods to component

**Why separate**:
- Can be tested independently
- Can be reused in other forms
- Clear separation of form concerns

#### 3. `use-service-mutations.ts` (API Layer)

**Responsibility**: API mutations and cache management

**What it does**:
- Handles create mutation with toast notifications
- Handles update mutation with toast notifications
- Invalidates TanStack Query cache
- Triggers Next.js Server Component refresh
- Provides submit handlers to component

**Why separate**:
- Can be tested independently
- Can be reused in other components (bulk operations, inline editing)
- Encapsulates SSR cache invalidation pattern
- Clear separation of data concerns

## Benefits

### 1. **Single Responsibility Principle (SRP)**
Each module has ONE reason to change:
- Form hook changes when form logic changes
- Mutation hook changes when API contract changes
- Component changes when UI changes

### 2. **Testability**
Easy to write unit tests:
```typescript
// Test form logic in isolation
describe('useServiceForm', () => {
  it('should auto-assign unit when type changes', () => {
    const { result } = renderHook(() => useServiceForm({ mode: 'create', open: true }));
    act(() => result.current.handleTypeChange('area'));
    expect(result.current.form.getValues('unit')).toBe('sqm');
  });
});

// Test mutation logic in isolation
describe('useServiceMutations', () => {
  it('should invalidate cache and refresh router on success', async () => {
    const { result } = renderHook(() => useServiceMutations());
    await act(() => result.current.handleCreate({ name: 'Test', type: 'fixed', rate: 100 }));
    expect(mockInvalidate).toHaveBeenCalled();
    expect(mockRouterRefresh).toHaveBeenCalled();
  });
});
```

### 3. **Reusability**
Hooks can be used in other components:
- `useServiceMutations` → Bulk delete, inline editing
- `useServiceForm` → Separate service creation page
- Both → Multi-step wizard

### 4. **Open/Closed Principle (OCP)**
Easy to extend without modifying:
```typescript
// Add new mutation type without changing existing code
export function useServiceMutations() {
  // ... existing mutations

  // NEW: Bulk delete
  const bulkDeleteMutation = api.admin.service.bulkDelete.useMutation({
    // ... same pattern
  });

  return { /* ... existing, */ bulkDelete: bulkDeleteMutation };
}
```

### 5. **Dependency Inversion Principle (DIP)**
Component depends on abstractions (hooks), not implementations:
```typescript
// Component doesn't know about tRPC, TanStack Query, or Next.js Router
// It only knows about high-level operations: handleCreate, handleUpdate
const { handleCreate, handleUpdate } = useServiceMutations();
```

## File Structure

```
src/app/(dashboard)/admin/services/
├── _components/
│   ├── service-dialog.tsx          # UI Composition (~100 lines)
│   └── README.md                   # This file
├── _hooks/
│   ├── use-service-form.ts         # Form State Management
│   └── use-service-mutations.ts    # API Mutations & Cache
```

## Usage Example

```typescript
export function ServiceDialog({ mode, open, onOpenChange, defaultValues }: Props) {
  // Hook 1: Form state management
  const { form, handleTypeChange } = useServiceForm({ 
    mode, 
    open, 
    defaultValues 
  });

  // Hook 2: Mutation logic
  const { handleCreate, handleUpdate, isPending } = useServiceMutations({
    onSuccess: () => {
      onOpenChange(false);
      form.reset();
    },
  });

  // Component only handles UI and routing
  const handleSubmit = (data) => {
    mode === 'create' 
      ? handleCreate(data) 
      : handleUpdate(defaultValues.id, data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* UI only - no business logic */}
    </Dialog>
  );
}
```

## Testing Strategy

### Unit Tests (Hooks)
- `use-service-form.test.ts`: Form initialization, validation, auto-assignment
- `use-service-mutations.test.ts`: Mutations, cache invalidation, error handling

### Integration Tests (Component)
- `service-dialog.test.tsx`: User interactions, form submission, dialog state

### E2E Tests (User Flows)
- `e2e/admin/services.spec.ts`: Create service, update service, see changes in table

## Related Patterns

- **Custom Hooks**: Extract reusable logic from components
- **SSR Cache Invalidation**: `invalidate()` + `router.refresh()` pattern
- **Optimistic UI**: Show immediate feedback, rollback on error
- **Toast Notifications**: User feedback for async operations

## Further Reading

- [Constitution: One Job, One Place](.specify/memory/constitution.md#one-job-one-place)
- [Copilot Instructions: SOLID Patterns](.github/copilot-instructions.md#solid-patterns-in-practice)
- [SSR Cache Invalidation Pattern](.github/copilot-instructions.md#ssr-cache-invalidation-pattern)
