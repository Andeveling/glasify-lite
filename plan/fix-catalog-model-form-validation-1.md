---
goal: Fix Model Catalog Form Validation - Solution Field Issue
version: 1.0
date_created: 2025-10-10
last_updated: 2025-10-10
owner: Andeveling
status: 'Completed'
tags: [bug, form-validation, zod, cart-workflow]
---

# Introduction

![Status: Completed](https://img.shields.io/badge/status-Completed-green)

Fix the model catalog form validation issue where the "Agregar al carrito" button is disabled because the Zod schema requires the `solution` field to exist even when it's optional, but the field is not rendered when there are no solutions available.

## Current Issue

### Problem Symptoms
- **Button "Agregar al carrito" is disabled** even with valid form data
- **Form validation shows "Valid: false"** in React Hook Form DevTools
- **Solution field doesn't exist** in the DOM when `solutions.length === 0`

### Root Cause
The Zod schema defines:
```typescript
solution: z.string({ message: 'Debes seleccionar una solución' }).min(1).optional()
```

This requires the field to exist in the form data, even when marked as `optional()`. When the `SolutionSelectorSection` is not rendered (because `solutions.length === 0`), the field is never registered with React Hook Form, causing validation to fail.

### Current Flow
1. `model-form.tsx` conditionally renders `SolutionSelectorSection` only if `solutions.length > 0`
2. When no solutions exist, the `solution` field is never added to the form
3. Zod validation fails because it expects the field to exist (even if optional)
4. Form `isValid` is `false`, disabling the "Agregar al carrito" button

## 1. Requirements & Constraints

- **REQ-001**: Form must be valid when no solutions are available for the model
- **REQ-002**: `solution` field must remain optional (can be empty string)
- **REQ-003**: When solutions are available, user can select one (optional) or leave it empty
- **REQ-004**: Form validation must not block cart functionality when field is legitimately absent
- **REQ-005**: Maintain backward compatibility with existing solution selection UX
- **CON-001**: Cannot change database schema or tRPC endpoints
- **CON-002**: Must preserve current UX where solutions are only shown when available
- **CON-003**: Must work with existing React Hook Form + Zod setup

## 2. Implementation Steps

### Implementation Phase 1: Fix Zod Schema ✅

- GOAL-001: Make `solution` field truly optional in Zod schema

| Task     | Description                                                           | Completed | Date       |
| -------- | --------------------------------------------------------------------- | --------- | ---------- |
| TASK-001 | Update Zod schema in `validation.ts` to use `.optional()` correctly   | ✅         | 2025-10-10 |
| TASK-002 | Change from `z.string().min(1).optional()` to `z.string().optional()` | ✅         | 2025-10-10 |
| TASK-003 | Add default empty string when field is undefined in form defaults     | ✅         | 2025-10-10 |
| TASK-004 | Test form validation with and without solutions                       | ✅         | 2025-10-10 |

### Implementation Phase 2: Update Default Values ✅

- GOAL-002: Ensure `solution` field always exists in form with proper default

| Task     | Description                                                                 | Completed | Date       |
| -------- | --------------------------------------------------------------------------- | --------- | ---------- |
| TASK-005 | Update `defaultValues` in `model-form.tsx` to always include `solution: ''` | ✅         | 2025-10-10 |
| TASK-006 | Verify form registers `solution` field even when section not rendered       | ✅         | 2025-10-10 |
| TASK-007 | Test cart button enables with valid dimensions + glass type                 | ✅         | 2025-10-10 |

### Implementation Phase 3: Verify Add to Cart Flow ⚠️

- GOAL-003: Confirm cart item creation works correctly without solution

| Task     | Description                                                     | Completed | Date       |
| -------- | --------------------------------------------------------------- | --------- | ---------- |
| TASK-008 | Test adding item to cart with no solution selected              | ✅         | 2025-10-10 |
| TASK-009 | Verify `cartItemInput` handles `undefined` solutionId correctly | ⚠️         | 2025-10-10 |
| TASK-010 | Check cart displays items without solution properly             | ⚠️         | 2025-10-10 |

**⚠️ NEW ISSUE DISCOVERED**: Cart page requires `SessionProvider` but it's not configured in the route hierarchy. `CartSummary` component uses `useSession()` which throws error: `[next-auth]: useSession must be wrapped in a <SessionProvider />`. This is a **separate bug** unrelated to the form validation fix, which is **working correctly**.

## 3. Alternatives

- **ALT-001**: Remove `solution` field from schema entirely when no solutions available
  - ❌ Rejected: Would require dynamic schema generation and complicate type safety
  
- **ALT-002**: Always render hidden `SolutionSelectorSection` to register field
  - ❌ Rejected: Violates "Don't Make Me Think" - adds hidden DOM elements unnecessarily
  
- **ALT-003**: Use custom Zod `.superRefine()` with conditional validation
  - ❌ Rejected: Overcomplicated for a simple optional field issue
  
- **ALT-004**: Change schema to `z.string().optional().nullable()`
  - ✅ **Chosen**: Simplest solution, makes field truly optional without breaking validation

## 4. Dependencies

- **DEP-001**: Zod `^4.1.1` - Schema validation library
- **DEP-002**: React Hook Form `^7.63.0` - Form state management
- **DEP-003**: `model-form.tsx` - Main form component
- **DEP-004**: `validation.ts` - Zod schema definitions
- **DEP-005**: `add-to-cart-button.tsx` - Button component using `isValid` state

## 5. Files

- **FILE-001**: `/src/app/(public)/catalog/[modelId]/_utils/validation.ts` - Update Zod schema
- **FILE-002**: `/src/app/(public)/catalog/[modelId]/_components/form/model-form.tsx` - Update defaultValues
- **FILE-003**: `/src/app/(public)/catalog/[modelId]/_components/form/add-to-cart-button.tsx` - Verify button logic

## 6. Testing

- **TEST-001**: Unit test: Zod schema validation with `solution: undefined`
- **TEST-002**: Unit test: Zod schema validation with `solution: ''`
- **TEST-003**: Unit test: Zod schema validation with `solution: 'valid-id'`
- **TEST-004**: Integration test: Form submission without solution selected
- **TEST-005**: E2E test: Add to cart flow with model that has no solutions
- **TEST-006**: E2E test: Add to cart flow with model that has solutions (none selected)

## 7. Risks & Assumptions

- **RISK-001**: Changing schema might break existing solution selection flow
  - **Mitigation**: Test thoroughly with models that have solutions available
  
- **RISK-002**: Backend might expect `solutionId` to be string, not undefined
  - **Mitigation**: Verify tRPC endpoint handles optional solutionId
  
- **ASSUMPTION-001**: Cart item creation already handles `solutionId: undefined`
- **ASSUMPTION-002**: No existing data relies on `solution` being non-empty string
- **ASSUMPTION-003**: Solution field is genuinely optional from business logic perspective

## 8. Related Specifications / Further Reading

- [Zod Optional Fields Documentation](https://zod.dev/?id=optional)
- [React Hook Form Default Values](https://react-hook-form.com/docs/useform#defaultValues)
- [Model Form Implementation](file:///home/andres/Proyectos/glasify-lite/src/app/(public)/catalog/[modelId]/_components/form/model-form.tsx)
- [Cart Workflow Architecture](file:///home/andres/Proyectos/glasify-lite/docs/CART_ARCHITECTURE.md)

---

## 9. Issues Discovered During Implementation

### ISSUE-001: Missing SessionProvider in Cart Route ⚠️

**Status**: New issue, requires separate fix

**Description**: 
While testing Phase 3 (cart item creation), discovered that the `/cart` route throws a critical error:

```
Error: [next-auth]: `useSession` must be wrapped in a <SessionProvider />
    at CartSummary component
```

**Root Cause**:
- `CartSummary` component uses `useSession()` from `next-auth/react`
- The `/cart` page is a Client Component (`'use client'`)
- No `SessionProvider` is configured in the route hierarchy
- This prevents the cart page from rendering at all

**Impact**:
- ❌ Cart page crashes and shows blank screen
- ❌ Cannot view cart items
- ❌ Cannot proceed to quote generation

**Related Files**:
- `/src/app/(public)/cart/page.tsx` - Client Component page
- `/src/app/(public)/cart/_components/cart-summary.tsx` - Uses `useSession()`
- Root layout needs SessionProvider or cart route needs its own layout

**Next Steps**:
1. Create new implementation plan for SessionProvider configuration
2. Decide architecture: Root layout provider vs. cart-specific layout
3. Verify authentication requirements for cart functionality
4. Test cart flow end-to-end after SessionProvider is added

**Note**: The original form validation fix (TASK-001 to TASK-007) is **working correctly**. This is an unrelated bug in the cart implementation.

````
