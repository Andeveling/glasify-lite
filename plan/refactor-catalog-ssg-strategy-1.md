---
goal: Implement SSG (Static Site Generation) strategy for catalog page to improve performance
version: 1.0
date_created: 2025-10-11
last_updated: 2025-10-11
owner: Andeveling
status: 'Planned'
tags: ['refactor', 'performance', 'nextjs', 'ssg']
---

# Introduction

![Status: Planned](https://img.shields.io/badge/status-Planned-blue)

Implement Static Site Generation (SSG) with Incremental Static Regeneration (ISR) for the catalog page since the data changes infrequently. This will significantly improve page load performance, reduce server load, and maintain fresh content through periodic revalidation.

Currently, the catalog page uses `force-dynamic` rendering, which means every request triggers a server-side render. Since catalog data (models and manufacturers) changes rarely, we can pre-render the page at build time and revalidate periodically.

## 1. Requirements & Constraints

**Performance Requirements:**
- **REQ-001**: Page must be statically generated at build time with all available models
- **REQ-002**: Static pages must revalidate every 3600 seconds (1 hour) to reflect data changes
- **REQ-003**: Client-side filtering and search must work with statically generated data
- **REQ-004**: Initial page load must be < 2s (FCP), LCP < 2.5s

**SEO Requirements:**
- **SEO-001**: All catalog content must be crawlable and indexable by search engines
- **SEO-002**: Must include proper metadata (title, description, Open Graph)
- **SEO-003**: Static HTML must contain all model data for search engine indexing

**Technical Constraints:**
- **CON-001**: Must maintain compatibility with Next.js 15.2.3 App Router
- **CON-002**: Must work with existing tRPC 11.0.0 infrastructure
- **CON-003**: Client-side interactivity (search, filters, pagination) must remain functional
- **CON-004**: Must not break existing Prisma 6.16.2 database queries

**Next.js 15 Guidelines:**
- **GUD-001**: Use `export const revalidate = 3600` for ISR instead of deprecated `getStaticProps`
- **GUD-002**: Server Components by default, Client Components only for interactivity
- **GUD-003**: Use `unstable_cache` from Next.js for granular caching when needed
- **GUD-004**: Leverage React `cache()` function for request deduplication

**Architecture Patterns:**
- **PAT-001**: Follow Next.js 15 App Router SSG patterns documented at https://nextjs.org/docs/app/getting-started/fetching-data
- **PAT-002**: Maintain SOLID principles (Single Responsibility, Open/Closed, etc.)
- **PAT-003**: Keep Atomic Design structure (atoms, molecules, organisms, templates, pages)
- **PAT-004**: Server Components for data fetching, Client Components for UI interactivity

## 2. Implementation Steps

### Implementation Phase 1: Enable ISR on Catalog Page

**GOAL-001**: Configure catalog page for Static Site Generation with Incremental Static Regeneration

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-001 | Remove `export const dynamic = 'force-dynamic'` from `src/app/(public)/catalog/page.tsx` | | |
| TASK-002 | Add `export const revalidate = 3600` to enable ISR with 1-hour revalidation | | |
| TASK-003 | Add metadata export for SEO (title, description, Open Graph tags) | | |
| TASK-004 | Verify that page builds statically with `pnpm build` (check `.next/server/app` for static HTML) | | |
| TASK-005 | Test that page serves cached HTML on first request and revalidates after 3600s | | |

### Implementation Phase 2: Optimize Data Fetching with React cache()

**GOAL-002**: Deduplicate data fetching requests using React cache() to prevent multiple identical database queries

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-006 | Create cached version of `list-manufacturers` tRPC call in `src/app/(public)/catalog/_utils/cached-catalog-data.ts` | | |
| TASK-007 | Create cached version of `list-models` tRPC call for initial data load | | |
| TASK-008 | Wrap database queries with React `cache()` function to ensure single execution per request | | |
| TASK-009 | Update `CatalogPage` component to use cached data fetching functions | | |
| TASK-010 | Verify with logging that database queries are deduplicated (single query per request) | | |

### Implementation Phase 3: Maintain Client-Side Interactivity

**GOAL-003**: Ensure search, filtering, and pagination continue to work with statically generated pages

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-011 | Verify that `CatalogSearch` client component maintains instant search functionality | | |
| TASK-012 | Verify that `ManufacturerFilter` dropdown works with static initial data | | |
| TASK-013 | Verify that `SortSelect` component updates URL params correctly | | |
| TASK-014 | Test pagination component navigates between static pages properly | | |
| TASK-015 | Ensure all Client Components (`'use client'`) maintain their interactivity | | |

### Implementation Phase 4: Build-Time Optimization

**GOAL-004**: Optimize build process to pre-render catalog with all current data

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-016 | Run production build: `pnpm build` and verify catalog page is statically generated | | |
| TASK-017 | Check build output for static HTML generation in `.next/server/app/(public)/catalog` | | |
| TASK-018 | Verify build includes all current models from database seed | | |
| TASK-019 | Test production server (`pnpm start`) serves static HTML on first load | | |
| TASK-020 | Measure and document performance improvements (Lighthouse scores, Core Web Vitals) | | |

### Implementation Phase 5: Testing & Validation

**GOAL-005**: Comprehensive testing to ensure SSG works correctly without breaking functionality

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-021 | Write E2E test in `e2e/catalog/catalog-ssg.spec.ts` to verify static page loads | | |
| TASK-022 | Test that search filter works on statically generated page | | |
| TASK-023 | Test that manufacturer filter updates results correctly | | |
| TASK-024 | Test that pagination navigates between pages | | |
| TASK-025 | Test that adding new model to database reflects after revalidation period (3600s) | | |
| TASK-026 | Verify SEO metadata is present in static HTML source | | |
| TASK-027 | Run Lighthouse audit and ensure Performance score > 90, SEO score > 95 | | |

## 3. Alternatives

**ALT-001**: **Client-Side Rendering (CSR) with SWR/React Query**
- **Rejected**: Poor SEO, slower initial page load, requires JavaScript execution before content appears
- **Why not chosen**: Catalog is a public-facing page where SEO and first load performance are critical

**ALT-002**: **Server-Side Rendering (SSR) with force-dynamic**
- **Current approach**: Every request triggers database query and server render
- **Why not chosen**: Unnecessary server load for data that changes infrequently, slower TTFB (Time To First Byte)

**ALT-003**: **Static Site Generation WITHOUT revalidation (pure SSG)**
- **Rejected**: Requires manual rebuild and deployment every time data changes
- **Why not chosen**: Not practical for catalog that occasionally receives updates

**ALT-004**: **On-Demand Revalidation with revalidatePath**
- **Considered**: Only revalidate when admin updates catalog via CMS/admin panel
- **Why not chosen**: Requires admin integration not yet implemented; ISR provides good balance of freshness and performance

**ALT-005**: **Hybrid: SSG for main catalog, CSR for filters**
- **Partially adopted**: We use SSG for initial render, Client Components maintain filter interactivity
- **Best of both worlds**: Static HTML for SEO and performance, client-side filtering for UX

## 4. Dependencies

**External Dependencies:**
- **DEP-001**: Next.js 15.2.3 - Must support `revalidate` export in App Router (documented feature)
- **DEP-002**: React 19.0.0 - Must support `cache()` function for request deduplication
- **DEP-003**: tRPC 11.0.0 - Server-side data fetching must work in static generation context
- **DEP-004**: Prisma 6.16.2 - Database queries must execute at build time

**Internal Dependencies:**
- **DEP-005**: `src/server/api/routers/catalog/catalog.queries.ts` - tRPC procedures for data fetching
- **DEP-006**: `src/app/(public)/catalog/_components/` - All catalog organisms, molecules, atoms
- **DEP-007**: `src/trpc/server-client.ts` - Server-side tRPC client for SSG data fetching
- **DEP-008**: `prisma/seed.ts` - Database must be seeded before build for static generation

**Build Dependencies:**
- **DEP-009**: Database must be accessible during `pnpm build` (seed must run first)
- **DEP-010**: Environment variables must be available at build time

## 5. Files

**Modified Files:**
- **FILE-001**: `src/app/(public)/catalog/page.tsx` - Enable ISR, add metadata, remove force-dynamic
- **FILE-002**: `src/app/(public)/catalog/_utils/cached-catalog-data.ts` - NEW: Cached data fetching functions

**Potentially Affected Files:**
- **FILE-003**: `src/app/(public)/catalog/_components/organisms/catalog-content.tsx` - May need minor updates for cached data
- **FILE-004**: `src/app/(public)/catalog/_components/organisms/catalog-filter-bar.tsx` - Ensure works with static initial data
- **FILE-005**: `src/app/(public)/catalog/_components/organisms/catalog-grid.tsx` - Already pure presentational, no changes needed

**Configuration Files:**
- **FILE-006**: `next.config.js` - Verify no conflicts with ISR configuration (should work out of box)

**Documentation:**
- **FILE-007**: `docs/architecture.md` - Update to document SSG strategy for catalog
- **FILE-008**: `README.md` - Update build instructions to mention static generation

## 6. Testing

**E2E Tests (Playwright):**
- **TEST-001**: `e2e/catalog/catalog-ssg.spec.ts` - Verify static page loads without JavaScript
- **TEST-002**: `e2e/catalog/catalog-ssg.spec.ts` - Test search filter works on static page
- **TEST-003**: `e2e/catalog/catalog-ssg.spec.ts` - Test manufacturer filter updates results
- **TEST-004**: `e2e/catalog/catalog-ssg.spec.ts` - Test pagination navigation

**Unit Tests (Vitest):**
- **TEST-005**: `tests/unit/catalog/cached-catalog-data.test.ts` - Test React cache() deduplication
- **TEST-006**: `tests/unit/catalog/catalog-page.test.ts` - Verify metadata generation

**Integration Tests:**
- **TEST-007**: `tests/integration/catalog/catalog-ssg-build.test.ts` - Test build produces static HTML

**Performance Tests:**
- **TEST-008**: Lighthouse audit - Performance score > 90
- **TEST-009**: Lighthouse audit - SEO score > 95
- **TEST-010**: Core Web Vitals - FCP < 1.8s, LCP < 2.5s, CLS < 0.1

**Manual Tests:**
- **TEST-011**: Build project (`pnpm build`) and verify `.next/server/app/(public)/catalog/page.html` exists
- **TEST-012**: Start production server (`pnpm start`) and inspect network tab - first load should serve cached HTML
- **TEST-013**: Wait 3600 seconds (1 hour), modify database, verify page reflects changes after revalidation

## 7. Risks & Assumptions

**Risks:**
- **RISK-001**: **Build Time**: If database has 1000+ models, build time may increase significantly
  - **Mitigation**: Monitor build performance, consider pagination limits for static generation
  - **Severity**: Medium
  
- **RISK-002**: **Stale Data**: Users may see data up to 1 hour old due to ISR revalidation period
  - **Mitigation**: Document acceptable data freshness SLA, consider shorter revalidation for critical updates
  - **Severity**: Low (catalog data changes infrequently)
  
- **RISK-003**: **Next.js 15 Compatibility**: ISR behavior may differ from documented examples due to version changes
  - **Mitigation**: Test thoroughly in development, review Next.js 15 release notes
  - **Severity**: Medium
  
- **RISK-004**: **Client Component Hydration**: Client components may fail to hydrate correctly on static pages
  - **Mitigation**: Ensure proper use of `'use client'` directive, test with JavaScript disabled first
  - **Severity**: Low (Next.js handles this well)

**Assumptions:**
- **ASSUMPTION-001**: Database will be seeded before `pnpm build` in CI/CD pipeline
- **ASSUMPTION-002**: Catalog data (models, manufacturers) changes less than once per hour on average
- **ASSUMPTION-003**: Next.js 15 ISR works as documented for App Router with `revalidate` export
- **ASSUMPTION-004**: Current server infrastructure can handle periodic revalidation requests
- **ASSUMPTION-005**: Users accept up to 1-hour delay for new catalog items to appear

## 8. Related Specifications / Further Reading

**Next.js Official Documentation:**
- [Fetching Data - Next.js 15](https://nextjs.org/docs/app/getting-started/fetching-data)
- [Caching and Revalidating - Next.js 15](https://nextjs.org/docs/app/getting-started/caching-and-revalidating)
- [Route Segment Config - revalidate](https://nextjs.org/docs/app/api-reference/file-conventions/route-segment-config#revalidate)
- [React cache() function](https://react.dev/reference/react/cache)

**Project Documentation:**
- [Architecture Documentation](../docs/architecture.md)
- [GitHub Copilot Instructions](../.github/copilot-instructions.md)
- [Next.js Data Fetching Instructions](../.github/instructions/next-data-fetching.instructions.md)

**Related Issues:**
- Issue #002-ui-ux-requirements - Minimalist catalog design inspired by Saleor Storefront

**Performance Benchmarks:**
- [Web.dev - Core Web Vitals](https://web.dev/vitals/)
- [Next.js - Performance Best Practices](https://nextjs.org/docs/app/guides/production-checklist)
