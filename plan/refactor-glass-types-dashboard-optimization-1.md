---
goal: Optimize Glass Types Admin Page with SSR, Standard Formatters, and Optimistic UI
version: 1.0
date_created: 2025-01-19
last_updated: 2025-01-19
owner: Development Team
status: 'Planned'
tags: [refactor, optimization, dashboard, ssr, ui-ux]
---

# Refactor: Glass Types Dashboard Optimization

![Status: Planned](https://img.shields.io/badge/status-Planned-blue)

Optimize the Glass Types admin page (`/admin/glass-types`) to follow dashboard standards: SSR data fetching (no ISR for private routes), fix duplicate filter blocks, ensure filters stay outside Suspense, use standardized formatters from `@lib/format`, implement optimistic UI patterns, and fix persistent loading bar issue. This will establish the standard pattern for all dashboard routes.

## 1. Requirements & Constraints

### Requirements

- **REQ-001**: Use SSR (Server-Side Rendering) for data fetching, not ISR (no `revalidate` export for private routes)
- **REQ-002**: Remove duplicate filter blocks (one in `glass-types-filters.tsx`, one in `glass-types-table.tsx`)
- **REQ-003**: Keep filter components outside Suspense boundaries to prevent disappearing during loading
- **REQ-004**: Use standardized formatters from `@lib/format` instead of ad-hoc formatting
- **REQ-005**: Implement optimistic UI updates for delete operations
- **REQ-006**: Fix persistent loading bar issue in Next.js navigation
- **REQ-007**: Use `dynamic = 'force-dynamic'` to ensure fresh data on every request
- **REQ-008**: Maintain type safety with proper serialization of Prisma Decimal fields
- **REQ-009**: Follow SOLID principles and Atomic Design patterns
- **REQ-010**: Ensure consistent behavior across all dashboard routes

### Security Requirements

- **SEC-001**: Admin-only access (already enforced by middleware)
- **SEC-002**: Validate all user inputs via Zod schemas in tRPC procedures
- **SEC-003**: Prevent deletion of glass types with active dependencies

### Constraints

- **CON-001**: Must maintain compatibility with existing ServerTable components
- **CON-002**: Cannot break existing tRPC procedures
- **CON-003**: Must preserve URL-based state management
- **CON-004**: Must maintain 300ms debounce on search inputs
- **CON-005**: Database queries must remain performant with proper indexes

### Guidelines

- **GUD-001**: Follow Next.js 15 App Router patterns (Server Components first)
- **GUD-002**: Use Client Components only for interactivity
- **GUD-003**: Implement Suspense boundaries for streaming
- **GUD-004**: Keep business logic in tRPC procedures, not components
- **GUD-005**: Use Spanish for UI text, English for code/comments

### Patterns

- **PAT-001**: Server Component page with async searchParams
- **PAT-002**: Lightweight queries outside Suspense, heavy queries inside
- **PAT-003**: Template literal Suspense keys for proper re-suspension
- **PAT-004**: Single filter block outside Suspense
- **PAT-005**: Optimistic updates with `useMutation` + `onMutate`
- **PAT-006**: Centralized formatters from `@lib/format` with tenant context

## 2. Implementation Steps

### Implementation Phase 1: Fix SSR Configuration and Suspense Key

- GOAL-001: Remove ISR configuration and add SSR with `dynamic = 'force-dynamic'`, fix Suspense key

| Task     | Description                                                                   | Completed | Date |
| -------- | ----------------------------------------------------------------------------- | --------- | ---- |
| TASK-001 | Remove `export const revalidate = 30;` from `page.tsx`                        |           |      |
| TASK-002 | Add `export const dynamic = 'force-dynamic';` to `page.tsx`                   |           |      |
| TASK-003 | Update JSDoc comment to reflect SSR instead of ISR                            |           |      |
| TASK-004 | Verify Suspense key includes all relevant parameters for proper re-suspension |           |      |
| TASK-005 | Test that page re-fetches data on every navigation (no caching)               |           |      |

### Implementation Phase 2: Consolidate Filter Blocks

- GOAL-002: Remove duplicate filter definitions and consolidate into single block outside Suspense

| Task     | Description                                                                             | Completed | Date |
| -------- | --------------------------------------------------------------------------------------- | --------- | ---- |
| TASK-006 | Remove filter block and TableFilters call from `glass-types-table.tsx` (lines ~280-318) |           |      |
| TASK-007 | Keep only search input, table, and pagination in `glass-types-table.tsx`                |           |      |
| TASK-008 | Update `GlassTypesFilters` component to include all filter logic                        |           |      |
| TASK-009 | Ensure filters remain visible during Suspense loading states                            |           |      |
| TASK-010 | Update component props to remove filter-related state from table                        |           |      |

### Implementation Phase 3: Standardize Formatters

- GOAL-003: Replace ad-hoc formatting with centralized formatters from `@lib/format`

| Task     | Description                                                                        | Completed | Date |
| -------- | ---------------------------------------------------------------------------------- | --------- | ---- |
| TASK-011 | Import formatters from `@lib/format` instead of local `formatCurrency`             |           |      |
| TASK-012 | Use `formatCurrency()` with tenant context for price formatting                    |           |      |
| TASK-013 | Use `formatDate()` or `formatDateShort()` for date columns if needed               |           |      |
| TASK-014 | Remove any inline formatting logic (e.g., `${item.thicknessMm}mm` → use formatter) |           |      |
| TASK-015 | Create thickness formatter if needed: `formatThickness(mm: number) => string`      |           |      |
| TASK-016 | Ensure all formatters receive tenant context from `useTenantConfig()`              |           |      |

### Implementation Phase 4: Implement Optimistic UI

- GOAL-004: Add optimistic updates for delete operations to improve perceived performance

| Task     | Description                                                              | Completed | Date |
| -------- | ------------------------------------------------------------------------ | --------- | ---- |
| TASK-017 | Add `onMutate` handler to delete mutation for optimistic updates         |           |      |
| TASK-018 | Optimistically remove deleted item from cache before server response     |           |      |
| TASK-019 | Implement rollback logic in `onError` to restore item if deletion fails  |           |      |
| TASK-020 | Add loading state to individual row being deleted (disable actions menu) |           |      |
| TASK-021 | Update toast notifications to show immediate feedback                    |           |      |
| TASK-022 | Test rollback behavior with simulated errors                             |           |      |

### Implementation Phase 5: Fix Loading Bar Issue

- GOAL-005: Resolve persistent loading bar in Next.js navigation

| Task     | Description                                                                          | Completed | Date |
| -------- | ------------------------------------------------------------------------------------ | --------- | ---- |
| TASK-023 | Investigate loading bar persistence (check `layout.tsx` or global loading component) |           |      |
| TASK-024 | Ensure Suspense boundaries have proper fallback states                               |           |      |
| TASK-025 | Verify `key` prop changes trigger proper re-renders                                  |           |      |
| TASK-026 | Test navigation between glass types and other admin routes                           |           |      |
| TASK-027 | Add explicit loading states for mutations (delete, etc.)                             |           |      |

### Implementation Phase 6: Clean Up Component Architecture

- GOAL-006: Refactor components to follow SOLID principles and remove redundancy

| Task     | Description                                                               | Completed | Date |
| -------- | ------------------------------------------------------------------------- | --------- | ---- |
| TASK-028 | Update `GlassTypesTable` to be a pure presentation component (no filters) |           |      |
| TASK-029 | Move all filter state management to `GlassTypesFilters`                   |           |      |
| TASK-030 | Simplify component props (remove redundant searchParams in table)         |           |      |
| TASK-031 | Extract badge components to separate files if reused elsewhere            |           |      |
| TASK-032 | Update JSDoc comments to reflect new architecture                         |           |      |
| TASK-033 | Ensure Single Responsibility Principle: filters ≠ table logic             |           |      |

### Implementation Phase 7: Documentation and Testing

- GOAL-007: Document the standard pattern and validate with tests

| Task     | Description                                                   | Completed | Date |
| -------- | ------------------------------------------------------------- | --------- | ---- |
| TASK-034 | Update `docs/architecture.md` with dashboard SSR pattern      |           |      |
| TASK-035 | Create E2E test for glass types page with all filters         |           |      |
| TASK-036 | Add E2E test for optimistic delete behavior                   |           |      |
| TASK-037 | Test persistent loading bar fix across multiple scenarios     |           |      |
| TASK-038 | Document formatter usage in `.github/copilot-instructions.md` |           |      |
| TASK-039 | Create dashboard route checklist for future pages             |           |      |

## 3. Alternatives

- **ALT-001**: Keep ISR with short revalidation time instead of SSR
  - **Rejected**: Private dashboard routes don't need caching; fresh data is more important
  
- **ALT-002**: Use client-side filtering instead of server-side
  - **Rejected**: Scalability issues; must support large datasets with server-side pagination
  
- **ALT-003**: Keep duplicate filter blocks for flexibility
  - **Rejected**: Violates DRY principle and causes confusion; single source of truth is better
  
- **ALT-004**: Implement custom formatting functions per component
  - **Rejected**: Centralized formatters ensure consistency and tenant-aware internationalization
  
- **ALT-005**: Skip optimistic UI for simplicity
  - **Rejected**: Optimistic UI significantly improves perceived performance for admin workflows

## 4. Dependencies

- **DEP-001**: `@lib/format` module with tenant-aware formatters (already exists)
- **DEP-002**: `useTenantConfig()` hook for accessing tenant context (already exists)
- **DEP-003**: Next.js 15 App Router with Server Components
- **DEP-004**: tRPC procedures for glass types CRUD operations (already exists)
- **DEP-005**: TanStack Query (React Query) for optimistic updates
- **DEP-006**: ServerTable components (`TableSearch`, `TableFilters`, `TablePagination`)

## 5. Files

### Modified Files

- **FILE-001**: `src/app/(dashboard)/admin/glass-types/page.tsx`
  - Remove ISR config, add SSR config
  - Simplify GlassTypesTableContent props
  - Update JSDoc comments
  
- **FILE-002**: `src/app/(dashboard)/admin/glass-types/_components/glass-types-table.tsx`
  - Remove duplicate filter block
  - Implement optimistic UI for delete
  - Replace ad-hoc formatters with `@lib/format`
  - Simplify component responsibilities
  
- **FILE-003**: `src/app/(dashboard)/admin/glass-types/_components/glass-types-filters.tsx`
  - Consolidate all filter logic
  - Update component to handle all filter interactions
  - Ensure proper UX during loading states

### New Files

- **FILE-004**: `src/lib/format/glass.ts` (optional)
  - Add glass-specific formatters (e.g., `formatThickness`)
  - Export from main `@lib/format/index.ts`

### Documentation Files

- **FILE-005**: `docs/dashboard-route-standard.md` (new)
  - Standard pattern for all dashboard routes
  - SSR configuration checklist
  - Filter and Suspense architecture
  - Optimistic UI patterns
  
- **FILE-006**: `.github/copilot-instructions.md`
  - Add dashboard route standards section
  - Document formatter usage patterns

## 6. Testing

### Unit Tests

- **TEST-001**: Test `formatThickness()` formatter with various inputs
- **TEST-002**: Test optimistic update logic (add/remove from cache)
- **TEST-003**: Test rollback behavior on mutation error

### Integration Tests

- **TEST-004**: Test tRPC delete procedure with referential integrity checks
- **TEST-005**: Test ServerTable component with glass types data

### E2E Tests

- **TEST-006**: Navigate to glass types page and verify SSR behavior
  - Test file: `e2e/admin/glass-types/list.spec.ts`
  - Verify data fetches on every navigation (no stale cache)
  
- **TEST-007**: Apply all filters and verify URL updates
  - Test search, purpose, supplier, active status filters
  - Verify pagination resets on filter change
  
- **TEST-008**: Delete glass type and verify optimistic UI
  - Verify immediate UI update (item removed)
  - Verify rollback on error
  - Verify loading states
  
- **TEST-009**: Verify no persistent loading bar after navigation
  - Navigate between glass types and other routes
  - Verify loading bar disappears after page load

### Performance Tests

- **TEST-010**: Measure page load time with various dataset sizes
- **TEST-011**: Verify debounced search doesn't cause excessive requests
- **TEST-012**: Verify Suspense streaming behavior (filters visible during loading)

## 7. Risks & Assumptions

### Risks

- **RISK-001**: Optimistic UI rollback may cause UI flicker on slow connections
  - **Mitigation**: Use proper loading states and error boundaries
  
- **RISK-002**: Removing ISR may increase database load on high-traffic periods
  - **Mitigation**: Dashboard routes are admin-only (low traffic); database indexes handle load
  
- **RISK-003**: Consolidating filters may break existing URL-based deep links
  - **Mitigation**: Maintain backward compatibility with URL parameter names
  
- **RISK-004**: Loading bar fix may require changes to global layout
  - **Mitigation**: Isolate changes to specific routes; test thoroughly

### Assumptions

- **ASSUMPTION-001**: Database has proper indexes for sortable/filterable columns
- **ASSUMPTION-002**: Admin users expect fresh data on every page load (no caching)
- **ASSUMPTION-003**: Tenant config is always available for formatters
- **ASSUMPTION-004**: Delete operations are relatively rare (optimistic UI won't cause frequent rollbacks)
- **ASSUMPTION-005**: All dashboard routes will follow this pattern going forward

## 8. Related Specifications / Further Reading

- [Server-Optimized Data Tables Architecture](../docs/architecture-server-tables.md)
- [Next.js 15 App Router Documentation](https://nextjs.org/docs/app)
- [TanStack Query Optimistic Updates](https://tanstack.com/query/latest/docs/framework/react/guides/optimistic-updates)
- [Glasify Architecture Documentation](../docs/architecture.md)
- [GitHub Copilot Instructions](.github/copilot-instructions.md)
- [SOLID Principles in Practice](../docs/architecture.md#solid-patterns-in-practice)
