---
goal: Refactor Data Tables to Server-Optimized Pattern with Next.js 15 + tRPC + Prisma
version: 1.0
date_created: 2025-10-18
last_updated: 2025-01-21
owner: Development Team
status: 'In Progress'
tags: [refactor, architecture, performance, data-tables, server-components, next-js-15]
---

# Introduction

![Status: In Progress](https://img.shields.io/badge/status-In%20Progress-yellow)

Refactor existing DataTable components to use a fully server-optimized pattern that leverages Next.js 15 App Router's Server Components, tRPC procedures, and Prisma query optimization. Replace client-heavy TanStack Table with reusable server-first components that handle filtering, sorting, pagination, and search using URL search params for deep linking and optimal performance.

## 1. Requirements & Constraints

### Functional Requirements
- **REQ-001**: All filtering, sorting, and pagination must be server-side via URL search params
- **REQ-002**: Search input must use debounced URL updates (300ms delay)
- **REQ-003**: Deep linking support - all table states must be shareable via URL
- **REQ-004**: Backward compatibility - existing admin pages must not break during migration
- **REQ-005**: Mobile responsive design with proper touch interactions
- **REQ-006**: Accessibility (WCAG AA) - keyboard navigation and screen reader support

### Performance Requirements
- **PERF-001**: Initial page load < 1s (Server Component rendering)
- **PERF-002**: Filter/sort operations < 300ms (server processing + network)
- **PERF-003**: Search debounce at 300ms to avoid excessive server requests
- **PERF-004**: Cursor-based pagination for tables with > 1000 records
- **PERF-005**: Database queries must use indexed fields for WHERE/ORDER BY clauses

### Technical Requirements
- **TECH-001**: Next.js 15.5.4 Server Components as default
- **TECH-002**: tRPC 11.0.0 procedures for type-safe server data fetching
- **TECH-003**: Prisma 6.17.0 with optimized queries (select, include, indexing)
- **TECH-004**: Zod 4.1.1 for input validation schemas
- **TECH-005**: TailwindCSS 4.0.15 for styling
- **TECH-006**: React 19.2.0 with `use()` hook for async unwrapping

### Security Requirements
- **SEC-001**: All tRPC procedures must validate inputs with Zod schemas
- **SEC-002**: Role-based access control (RBAC) via middleware
- **SEC-003**: SQL injection prevention via Prisma parameterized queries
- **SEC-004**: No sensitive data exposure in URL params (IDs only, no PII)

### Constraints
- **CON-001**: Must work without JavaScript (progressive enhancement)
- **CON-002**: Cannot break existing API contracts during migration
- **CON-003**: Must maintain current URL structure for SEO
- **CON-004**: Limited to 100 items per page (MAX_PAGE_LIMIT)
- **CON-005**: Browser history must not be polluted (use replaceState for search)

### Guidelines
- **GUD-001**: Server Components by default, Client Components only for interactivity
- **GUD-002**: Follow SOLID principles (Single Responsibility, Dependency Inversion)
- **GUD-003**: Use Atomic Design pattern (atoms, molecules, organisms)
- **GUD-004**: Prefer composition over configuration
- **GUD-005**: Keep components under 200 lines, extract subcomponents
- **GUD-006**: Use TypeScript strict mode with explicit return types

### Patterns to Follow
- **PAT-001**: Server Component fetches data → passes to Client Component for interactivity
- **PAT-002**: URL as single source of truth for table state
- **PAT-003**: Optimistic UI updates with tRPC mutations
- **PAT-004**: Error boundaries for graceful degradation
- **PAT-005**: Suspense boundaries for loading states
- **PAT-006**: Schema-driven development (Zod → tRPC → Prisma)

## 2. Implementation Steps

### Implementation Phase 1: Core Architecture & Reusable Components

- **GOAL-001**: Create foundational server-optimized table components and utilities

| Task     | Description                                                                                                                  | Completed | Date       |
| -------- | ---------------------------------------------------------------------------------------------------------------------------- | --------- | ---------- |
| TASK-001 | Create `useServerParams` hook for URL state management in Client Components (`src/hooks/use-server-params.ts`)               | ✅         | 2025-01-21 |
| TASK-002 | Create `useDebouncedCallback` hook for search input debouncing (300ms) (`src/hooks/use-debounced-callback.ts`)               | ✅         | 2025-01-21 |
| TASK-003 | Create `ServerTable` organism component (`src/app/_components/server-table/index.tsx`) - renders table rows from server data | ✅         | 2025-01-21 |
| TASK-004 | Create `TableHeader` molecule with sortable columns (`src/app/_components/server-table/table-header.tsx`)                    | ✅         | 2025-01-21 |
| TASK-005 | Create `TableFilters` molecule for URL-based filtering (`src/app/_components/server-table/table-filters.tsx`)                | ✅         | 2025-01-21 |
| TASK-006 | Create `TableSearch` molecule with debounced input (`src/app/_components/server-table/table-search.tsx`)                     | ✅         | 2025-01-21 |
| TASK-007 | Create `TablePagination` molecule with Next/Prev controls (`src/app/_components/server-table/table-pagination.tsx`)          | ✅         | 2025-01-21 |
| TASK-008 | Create `buildTableWhereClause` utility for dynamic Prisma filters (`src/lib/utils/table-query-builder.ts`)                   | ✅         | 2025-01-21 |
| TASK-009 | Create `buildTableOrderByClause` utility for dynamic Prisma sorting (`src/lib/utils/table-query-builder.ts`)                 | ✅         | 2025-01-21 |
| TASK-010 | Create `parseTableSearchParams` utility to extract & validate URL params (`src/lib/utils/table-params-parser.ts`)            | ✅         | 2025-01-21 |

### Implementation Phase 2: Prisma Query Optimization

- **GOAL-002**: Optimize database schema and queries for table operations

| Task     | Description                                                                                                                                | Completed | Date       |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------ | --------- | ---------- |
| TASK-011 | Add database indexes for Model table: `name`, `status`, `profileSupplierId`, `createdAt` (`prisma/schema.prisma`)                          | ✅         | 2025-01-21 |
| TASK-012 | Add database indexes for GlassType table: `name`, `purpose`, `glassSupplierId`, `isActive` (`prisma/schema.prisma`)                        | ✅         | 2025-01-21 |
| TASK-013 | Add database indexes for Quote table: `projectName`, `status`, `userId`, `createdAt` (`prisma/schema.prisma`)                              | ✅         | 2025-01-21 |
| TASK-014 | Run `pnpm db:migrate` to apply index changes                                                                                               | ✅         | 2025-01-21 |
| TASK-015 | Update `admin.model.list` tRPC procedure with optimized Prisma query (select only needed fields) (`src/server/api/routers/admin/model.ts`) | ✅         | 2025-01-21 |
| TASK-016 | Add `@prisma/client` query logging to verify index usage (`src/server/db.ts`)                                                              | ✅         | 2025-01-21 |
| TASK-017 | Implement cursor-based pagination helper for large datasets (`src/lib/utils/cursor-pagination.ts`)                                         | ✅         | 2025-01-21 |

### Implementation Phase 3: Models Table Migration

- **GOAL-003**: Migrate Models admin table to new server-optimized pattern

| Task     | Description                                                                                                                                         | Completed | Date       |
| -------- | --------------------------------------------------------------------------------------------------------------------------------------------------- | --------- | ---------- |
| TASK-018 | Create new `models/page.tsx` with async searchParams prop (`src/app/(dashboard)/admin/models/page.tsx`)                                             | ✅         | 2025-01-21 |
| TASK-019 | Create `ModelsServerFilters` component with status & supplier selects (`src/app/(dashboard)/admin/models/_components/server-filters.tsx`)           | ✅         | 2025-01-21 |
| TASK-020 | Create `ModelsTableHeader` with sortable columns (name, status, price, createdAt) (`src/app/(dashboard)/admin/models/_components/table-header.tsx`) | ✅         | 2025-01-21 |
| TASK-021 | Create `ModelsTableRow` component for rendering model data (`src/app/(dashboard)/admin/models/_components/table-row.tsx`)                           | ✅         | 2025-01-21 |
| TASK-022 | Update `admin.model.list` input schema with filter/sort/search params (`src/lib/validations/admin/model.schema.ts`)                                 | ✅         | 2025-01-21 |
| TASK-023 | Replace `model-list.tsx` with new ServerTable composition                                                                                           | ✅         | 2025-01-21 |
| TASK-024 | Remove `data-table.tsx` and `columns.tsx` (TanStack Table dependencies)                                                                             | ⏸️         | Deferred   |
| TASK-025 | Add E2E tests for Models table filtering/sorting/search (`e2e/admin/models-table.spec.ts`)                                                          | ✅         | 2025-01-21 |

### Implementation Phase 4: Glass Types Table Migration

- **GOAL-004**: Apply server-optimized pattern to Glass Types admin table

| Task     | Description                                                                                                                             | Completed | Date       |
| -------- | --------------------------------------------------------------------------------------------------------------------------------------- | --------- | ---------- |
| TASK-026 | Update `glass-types/page.tsx` with searchParams (`src/app/(dashboard)/admin/glass-types/page.tsx`)                                      | ✅         | 2025-01-21 |
| TASK-027 | Create `GlassTypesServerFilters` (purpose, supplier, isActive) (`src/app/(dashboard)/admin/glass-types/_components/server-filters.tsx`) | ✅         | 2025-01-21 |
| TASK-028 | Create `GlassTypesTableHeader` with sortable columns                                                                                    | ✅         | 2025-01-21 |
| TASK-029 | Create `GlassTypesTableRow` component                                                                                                   | ✅         | 2025-01-21 |
| TASK-030 | Update `admin.glass-type.list` with optimized query                                                                                     | ✅         | 2025-01-21 |
| TASK-031 | Remove old DataTable implementation                                                                                                     | ⏸️         | Deferred   |
| TASK-032 | Add E2E tests for Glass Types table (`e2e/admin/glass-types-table.spec.ts`)                                                             | ✅         | 2025-01-21 |

### Implementation Phase 5: Quotes Table Migration

- **GOAL-005**: Migrate user quotes table with role-based filtering

| Task     | Description                                                  | Completed | Date       |
| -------- | ------------------------------------------------------------ | --------- | ---------- |
| TASK-033 | Update `/my-quotes/page.tsx` with searchParams               | ✅         | 2025-01-21 |
| TASK-034 | Create `QuotesServerFilters` (status, date range)            | ✅         | 2025-01-21 |
| TASK-035 | Create `QuotesTableHeader` with sortable columns             | ✅         | 2025-01-21 |
| TASK-036 | Create `QuotesTableRow` component                            | ✅         | 2025-01-21 |
| TASK-037 | Update `quote.list-user-quotes` with role-based WHERE clause | ✅         | 2025-01-21 |
| TASK-038 | Add E2E tests for Quotes table with RBAC scenarios           | ✅         | 2025-01-21 |

### Implementation Phase 6: Performance Testing & Optimization

- **GOAL-006**: Validate performance metrics and optimize bottlenecks

| Task     | Description                                                              | Completed | Date       |
| -------- | ------------------------------------------------------------------------ | --------- | ---------- |
| TASK-039 | Run Lighthouse CI on all migrated table pages (target: Performance > 90) | ⏳         | Deferred   |
| TASK-040 | Measure Core Web Vitals (LCP < 2.5s, FID < 100ms, CLS < 0.1)             | ⏳         | Deferred   |
| TASK-041 | Profile Prisma queries with `prisma.$executeRawUnsafe` and EXPLAIN       | ✅         | 2025-01-21 |
| TASK-042 | Add monitoring for slow queries (> 500ms) with Winston logging           | ✅         | 2025-01-21 |
| TASK-043 | Implement Redis caching for frequently accessed tables (optional)        | ⏳         | Deferred   |
| TASK-044 | Document performance benchmarks in `docs/performance-tables.md`          | ✅         | 2025-01-21 |

**Note**: Tasks marked as "Deferred" (⏳) require production deployment infrastructure (Vercel + Redis) and are documented with implementation guides in `docs/performance-tables.md`.

### Implementation Phase 7: Documentation & Cleanup

- **GOAL-007**: Document new patterns and remove deprecated code

| Task     | Description                                                                           | Completed | Date       |
| -------- | ------------------------------------------------------------------------------------- | --------- | ---------- |
| TASK-045 | Create architecture documentation (`docs/architecture-server-tables.md`)              | ✅         | 2025-01-21 |
| TASK-046 | Create developer guide for creating new tables (`docs/guides/create-server-table.md`) | ⏸️         | Deferred   |
| TASK-047 | Update `.github/copilot-instructions.md` with new table patterns                      | ✅         | 2025-01-21 |
| TASK-048 | Remove unused TanStack Table dependencies from `package.json`                         | ⏸️         | Deferred   |
| TASK-049 | Run `pnpm lint:fix` and `pnpm typecheck` on all changes                               | ✅         | 2025-01-21 |
| TASK-050 | Create PR with migration summary and performance comparison                           | ✅         | 2025-01-21 |

## 3. Alternatives

- **ALT-001**: **Keep TanStack Table with Server Actions** - Considered using TanStack Table with Server Actions instead of full Server Component refactor. Rejected because it still requires client-side hydration and doesn't leverage Next.js streaming.

- **ALT-002**: **Use SWR instead of tRPC** - Evaluated using SWR for data fetching. Rejected due to loss of end-to-end type safety and schema validation that tRPC provides.

- **ALT-003**: **Offset-based pagination for all tables** - Considered using offset (`skip`) for all pagination. Rejected for tables with > 1000 records due to performance degradation; cursor-based pagination chosen for scalability.

- **ALT-004**: **Client-side URL management with Next.js router** - Evaluated `useRouter().push()` for all URL updates. Rejected because `window.history.replaceState` prevents browser history pollution for search/filter changes.

- **ALT-005**: **GraphQL with Relay-style pagination** - Considered GraphQL instead of tRPC. Rejected due to increased complexity, lack of type inference, and team unfamiliarity.

- **ALT-006**: **Server-side debouncing** - Evaluated debouncing on the server. Rejected because it adds latency; client-side debouncing reduces network requests more effectively.

## 4. Dependencies

- **DEP-001**: Next.js 15.5.4 - Server Components with async `searchParams` prop
- **DEP-002**: tRPC 11.0.0 - Type-safe server procedures
- **DEP-003**: Prisma 6.17.0 - ORM with query optimization
- **DEP-004**: Zod 4.1.1 - Schema validation for inputs
- **DEP-005**: React 19.2.0 - `use()` hook for promise unwrapping
- **DEP-006**: TailwindCSS 4.0.15 - Styling framework
- **DEP-007**: Winston 3.17.0 - Server-side logging (already installed)
- **DEP-008**: Playwright 1.55.1 - E2E testing (already installed)

### Breaking Changes
- **DEP-009**: Remove `@tanstack/react-table` ^8.21.3 from dependencies
- **DEP-010**: Remove unused table utilities from `src/app/_components/data-table/`

## 5. Files

### New Files (To Create)
- **FILE-001**: `src/hooks/use-server-params.ts` - Client hook for URL param management
- **FILE-002**: `src/hooks/use-debounced-callback.ts` - Debouncing utility hook
- **FILE-003**: `src/app/_components/server-table/index.tsx` - Main ServerTable component
- **FILE-004**: `src/app/_components/server-table/table-header.tsx` - Sortable header
- **FILE-005**: `src/app/_components/server-table/table-filters.tsx` - Filter controls
- **FILE-006**: `src/app/_components/server-table/table-search.tsx` - Debounced search
- **FILE-007**: `src/app/_components/server-table/table-pagination.tsx` - Pagination controls
- **FILE-008**: `src/lib/utils/table-query-builder.ts` - Prisma query helpers
- **FILE-009**: `src/lib/utils/table-params-parser.ts` - URL param parser
- **FILE-010**: `src/lib/utils/cursor-pagination.ts` - Cursor pagination helper
- **FILE-011**: `docs/architecture-server-tables.md` - Architecture documentation
- **FILE-012**: `docs/guides/create-server-table.md` - Developer guide
- **FILE-013**: `e2e/admin/models-table.spec.ts` - Models E2E tests
- **FILE-014**: `e2e/admin/glass-types-table.spec.ts` - Glass Types E2E tests

### Modified Files
- **FILE-015**: `src/app/(dashboard)/admin/models/page.tsx` - Add async searchParams
- **FILE-016**: `src/app/(dashboard)/admin/models/_components/model-list.tsx` - Refactor to ServerTable
- **FILE-017**: `src/server/api/routers/admin/model.ts` - Optimize list procedure
- **FILE-018**: `src/lib/validations/admin/model.schema.ts` - Add filter/sort schema
- **FILE-019**: `prisma/schema.prisma` - Add database indexes
- **FILE-020**: `src/server/db.ts` - Add query logging
- **FILE-021**: `.github/copilot-instructions.md` - Document new patterns
- **FILE-022**: `package.json` - Remove TanStack Table dependency

### Deleted Files
- **FILE-023**: `src/app/(dashboard)/admin/models/_components/data-table.tsx` - Replaced by ServerTable
- **FILE-024**: `src/app/(dashboard)/admin/models/_components/columns.tsx` - No longer needed
- **FILE-025**: `src/app/(dashboard)/admin/models/_hooks/use-server-filters.ts` - Replaced by use-server-params

## 6. Testing

### Unit Tests (Vitest)
- **TEST-001**: `use-server-params.test.ts` - Test URL param updates and parsing
- **TEST-002**: `use-debounced-callback.test.ts` - Test debouncing behavior
- **TEST-003**: `table-query-builder.test.ts` - Test Prisma WHERE/ORDER BY generation
- **TEST-004**: `table-params-parser.test.ts` - Test URL param validation
- **TEST-005**: `cursor-pagination.test.ts` - Test cursor encoding/decoding

### Integration Tests (Vitest + MSW)
- **TEST-006**: `admin.model.list.test.ts` - Test tRPC procedure with filters/sort
- **TEST-007**: `admin.glass-type.list.test.ts` - Test glass types procedure
- **TEST-008**: `quote.list-user-quotes.test.ts` - Test RBAC filtering

### E2E Tests (Playwright)
- **TEST-009**: `models-table.spec.ts` - Test filtering, sorting, search, pagination
- **TEST-010**: `glass-types-table.spec.ts` - Test all table interactions
- **TEST-011**: `quotes-table-rbac.spec.ts` - Test role-based access and filtering
- **TEST-012**: `table-deep-linking.spec.ts` - Test URL sharing and state persistence
- **TEST-013**: `table-performance.spec.ts` - Test Core Web Vitals metrics
- **TEST-014**: `table-accessibility.spec.ts` - Test keyboard navigation and ARIA

### Performance Tests
- **TEST-015**: Lighthouse CI on `/admin/models` (target: Performance > 90)
- **TEST-016**: Measure LCP for initial table render (target: < 2.5s)
- **TEST-017**: Measure debounce delay accuracy (target: 300ms ± 50ms)
- **TEST-018**: Database query profiling with EXPLAIN (target: < 100ms)

## 7. Risks & Assumptions

### Risks
- **RISK-001**: **Migration complexity** - Refactoring all tables is a large effort; mitigate by migrating one table at a time with rollback plan
- **RISK-002**: **Performance regression** - Server-side rendering may be slower for small datasets; mitigate with caching and monitoring
- **RISK-003**: **Browser compatibility** - `window.history.replaceState` may not work in older browsers; mitigate with progressive enhancement
- **RISK-004**: **Database load** - Increased server queries may strain database; mitigate with connection pooling and read replicas
- **RISK-005**: **Breaking changes** - URL structure changes may break bookmarks; mitigate by maintaining backward compatibility via redirects
- **RISK-006**: **User confusion** - Debounced search may feel laggy; mitigate with loading indicators and immediate visual feedback

### Assumptions
- **ASSUMPTION-001**: Users have JavaScript enabled (graceful degradation for accessibility)
- **ASSUMPTION-002**: Database indexes will improve query performance by > 50%
- **ASSUMPTION-003**: 300ms debounce delay is acceptable UX trade-off
- **ASSUMPTION-004**: Current page limit of 100 items is sufficient for most use cases
- **ASSUMPTION-005**: Cursor-based pagination is only needed for Quotes table (> 1000 records expected)
- **ASSUMPTION-006**: Server Components hydration overhead is negligible for table rendering

## 8. Related Specifications / Further Reading

### Internal Documentation
- [Next.js Server Components Guide](https://nextjs.org/docs/app/building-your-application/rendering/server-components)
- [tRPC Best Practices](https://trpc.io/docs/server/procedures)
- [Prisma Query Optimization](https://www.prisma.io/docs/orm/prisma-client/queries/query-optimization-performance)

### External Resources
- [Next.js 15 searchParams Documentation](https://nextjs.org/docs/app/api-reference/file-conventions/page#searchparams-optional)
- [Web Performance Metrics (Core Web Vitals)](https://web.dev/vitals/)
- [WCAG 2.1 AA Accessibility Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

### Related PRs/Issues
- [PR #10: Admin Catalog Management](https://github.com/Andeveling/glasify-lite/pull/10) - Current branch
- [Issue: Improve table performance](https://github.com/Andeveling/glasify-lite/issues/TBD) - To be created

### Repository Wiki
- [Deep Dive: tRPC Server-Side Filtering](https://deepwiki.com/search/how-to-implement-efficient-ser_9e03149b-94e5-463e-bb5c-f12018f1e16e)
- [Deep Dive: Next.js 15 searchParams Best Practices](https://deepwiki.com/search/what-are-the-best-practices-fo_4f454d58-21a8-4df3-9faf-25e5b92f89a1)
- [Deep Dive: Prisma Query Optimization](https://deepwiki.com/search/what-are-the-best-practices-fo_f398fd4f-fc0e-42cb-8b11-9391e4afa539)
