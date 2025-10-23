---
goal: Refactor Glass Solutions from CRUD to Static Content with Dynamic Routes
version: 1.1
date_created: 2025-10-22
last_updated: 2025-10-22
owner: Andres
status: 'Planned'
tags: [refactor, architecture, data, feature]
---

# Introduction

![Status: Planned](https://img.shields.io/badge/status-Planned-blue)

Transform GlassSolutions from a database-driven CRUD entity to static content consumed through dynamic Next.js routes. GlassSolutions will become read-only educational content pages that showcase glass compositions and their applications, while maintaining the Many-to-Many relationship with GlassTypes for filtering and categorization purposes.

## Context

Currently, GlassSolutions are managed as a full CRUD entity with:
- Admin dashboard pages (`/admin/glass-solutions`)
- tRPC router with create/update/delete procedures
- Database seeding from JSON files
- UI components for managing solutions

**Problem**: GlassSolutions are essentially static content that describe glass capabilities (security, thermal insulation, acoustic, etc.). They don't need admin CRUD operations—they should be treated as educational/marketing content that's managed through seed files and consumed as static pages.

**Desired State**: 
- GlassSolutions become static content consumed via `/glasses/solutions/[slug]` routes
- Only the Many-to-Many assignment (GlassType ↔ GlassSolution) remains editable through admin
- Content is ISR-cached for performance
- Spanish-language educational pages for public browsing

---

## 1. Requirements & Constraints

- **REQ-001**: GlassSolutions must remain in database for Many-to-Many relationships with GlassTypes
- **REQ-002**: Admin CRUD for GlassSolutions must be removed (create/update/delete UI and API)
- **REQ-003**: GlassSolutions must be accessible via public dynamic routes: `/glasses/solutions/[slug]`
- **REQ-004**: Solution pages must display all GlassTypes assigned to that solution with performance ratings
- **REQ-005**: Content must support ISR (Incremental Static Regeneration) for performance
- **REQ-006**: Admin can still assign/unassign GlassTypes to Solutions through GlassType form
- **REQ-007**: Solution slug must be derived from `key` field (e.g., `solar_control` → `/vidrios/soluciones/solar-control`)
- **REQ-008**: All UI text must be in Spanish (es-LA)
- **REQ-009**: Preserve existing seed infrastructure for GlassSolutions
- **REQ-010**: Solutions listing page must be static/ISR, not SSR
- **CON-001**: Maintain database schema integrity (do NOT remove GlassSolution or GlassTypeSolution models)
- **CON-002**: Do NOT delete seeder files—they remain the source of truth
- **CON-003**: Must follow Next.js 15 App Router patterns
- **CON-004**: Must maintain RBAC patterns for admin operations
- **CON-005**: Winston logger only in server-side code (no client components)
- **PAT-001**: Use server-first architecture with React Server Components
- **PAT-002**: Follow Atomic Design principles
- **PAT-003**: Use tRPC for API communication
- **PAT-004**: Spanish UI text, English code/comments
- **SEC-001**: Public routes must be accessible without authentication
- **SEC-002**: Admin-only operations must use `adminProcedure`

---

## 2. Implementation Steps

### Implementation Phase 1: Data Layer Adjustments

**GOAL-001**: Prepare database schema and add slug support for dynamic routes

| Task     | Description                                                                                          | Completed | Date |
| -------- | ---------------------------------------------------------------------------------------------------- | --------- | ---- |
| TASK-001 | Add optional `slug` field to `GlassSolution` model in `prisma/schema.prisma` (VARCHAR(100), indexed) |           |      |
| TASK-002 | Create migration to add `slug` column: `pnpm prisma migrate dev --name add-glass-solution-slug`      |           |      |
| TASK-003 | Update `glass-solution.factory.ts` to generate slug from `key` (replace underscores with hyphens)    |           |      |
| TASK-004 | Run glass-solutions seeder to backfill `slug` values: `pnpm seed:glass-solutions`                    |           |      |
| TASK-005 | Add `slug` validation to `GlassSolutionInput` Zod schema (kebab-case format)                         |           |      |
| TASK-006 | Verify all GlassSolution records have unique slugs in database                                       |           |      |

### Implementation Phase 2: Public tRPC Router

**GOAL-002**: Create public tRPC procedures for read-only access to GlassSolutions

| Task     | Description                                                                                       | Completed | Date |
| -------- | ------------------------------------------------------------------------------------------------- | --------- | ---- |
| TASK-007 | Create `src/server/api/routers/catalog/glass-solutions.queries.ts` router file                    |           |      |
| TASK-008 | Add `list-glass-solutions` procedure (public, ISR-cacheable, active solutions only)               |           |      |
| TASK-009 | Add `get-glass-solution-by-slug` procedure (returns solution + assigned glass types with ratings) |           |      |
| TASK-010 | Add Zod schemas for inputs/outputs in `src/server/api/routers/catalog/catalog.schemas.ts`         |           |      |
| TASK-011 | Register new router in `src/server/api/routers/catalog/index.ts`                                  |           |      |
| TASK-012 | Add cache headers for ISR (revalidate: 3600) in procedure metadata                                |           |      |

### Implementation Phase 3: Public Routes (Server Components)

**GOAL-003**: Create Next.js dynamic routes for GlassSolutions consumption

| Task     | Description                                                                                  | Completed | Date |
| -------- | -------------------------------------------------------------------------------------------- | --------- | ---- |
| TASK-013 | Create directory: `src/app/(public)/glasses/solutions/`                                      |           |      |
| TASK-014 | Create `page.tsx` (Server Component) for `/glasses/solutions` (lists all solutions as cards) |           |      |
| TASK-015 | Create `[slug]/page.tsx` (Server Component) for individual solution pages                    |           |      |
| TASK-016 | Add `generateStaticParams()` to `[slug]/page.tsx` for SSG (fetch all solution slugs)         |           |      |
| TASK-017 | Set `export const dynamic = 'force-static'` in both pages for ISR                            |           |      |
| TASK-018 | Set `export const revalidate = 3600` (1 hour ISR) in both pages                              |           |      |
| TASK-019 | Add metadata with Spanish titles/descriptions for SEO                                        |           |      |

### Implementation Phase 4: UI Components (Client Components)

**GOAL-004**: Create reusable UI components for GlassSolutions display

| Task     | Description                                                                                                     | Completed | Date |
| -------- | --------------------------------------------------------------------------------------------------------------- | --------- | ---- |
| TASK-020 | Create `src/app/(public)/glasses/solutions/_components/solution-card.tsx` (displays solution as card with icon) |           |      |
| TASK-021 | Create `src/app/(public)/glasses/solutions/_components/solution-grid.tsx` (grid layout for solutions)           |           |      |
| TASK-022 | Create `src/app/(public)/glasses/solutions/_components/solution-hero.tsx` (hero section with solution details)  |           |      |
| TASK-023 | Create `src/app/(public)/glasses/solutions/_components/glass-type-card.tsx` (displays assigned glass types)     |           |      |
| TASK-024 | Create `src/app/(public)/glasses/solutions/_components/performance-badge.tsx` (shows rating: 1-5 stars)         |           |      |
| TASK-025 | Use Lucide icons for solution icons (shield, snowflake, sun, etc.)                                              |           |      |
| TASK-026 | Add Spanish labels for all UI text ("Soluciones de Vidrio", "Ver Detalles", etc.)                               |           |      |

### Implementation Phase 5: Remove Admin CRUD

**GOAL-005**: Deprecate and remove admin CRUD UI and API for GlassSolutions

| Task     | Description                                                                                                  | Completed | Date |
| -------- | ------------------------------------------------------------------------------------------------------------ | --------- | ---- |
| TASK-027 | Remove admin router procedures: `create`, `update`, `delete` from `glass-solution.ts`                        |           |      |
| TASK-028 | Keep only `list` and `getById` procedures in admin router (for reference/debugging)                          |           |      |
| TASK-029 | Mark admin router procedures as `@deprecated` in JSDoc comments                                              |           |      |
| TASK-030 | Remove directory: `src/app/(dashboard)/admin/glass-solutions/` (all pages and components)                    |           |      |
| TASK-031 | Remove Zod schemas: `createGlassSolutionSchema`, `updateGlassSolutionSchema` from `glass-solution.schema.ts` |           |      |
| TASK-032 | Remove navigation link to glass-solutions from admin sidebar/navigation                                      |           |      |
| TASK-033 | Remove references to glass-solution admin routes from spec files and documentation                           |           |      |

### Implementation Phase 6: Update GlassType Admin Form

**GOAL-006**: Ensure GlassType admin form allows assigning GlassSolutions

| Task     | Description                                                                             | Completed | Date |
| -------- | --------------------------------------------------------------------------------------- | --------- | ---- |
| TASK-034 | Verify `glass-type-form.tsx` includes multi-select for GlassSolutions                   |           |      |
| TASK-035 | Update GlassType form to show solution name (nameEs) and icon in dropdown               |           |      |
| TASK-036 | Add performance rating selector (1-5) for each assigned solution                        |           |      |
| TASK-037 | Add "primary solution" checkbox for each assignment                                     |           |      |
| TASK-038 | Update validation to require at least one solution per GlassType                        |           |      |
| TASK-039 | Update form submit to handle `solutions` array with `performanceRating` and `isPrimary` |           |      |

### Implementation Phase 7: Navigation & Discovery

**GOAL-007**: Add navigation links and discovery features for GlassSolutions

| Task     | Description                                                              | Completed | Date |
| -------- | ------------------------------------------------------------------------ | --------- | ---- |
| TASK-040 | Add "Soluciones" link to public navigation header (`/glasses/solutions`) |           |      |
| TASK-041 | Create breadcrumb component for solution detail pages                    |           |      |
| TASK-042 | Add "Ver Soluciones" CTA button in catalog pages                         |           |      |
| TASK-043 | Add solution filter chips in glass catalog page (filter by solution)     |           |      |
| TASK-044 | Add "Related Solutions" section in GlassType detail pages                |           |      |

### Implementation Phase 8: Testing & Validation

**GOAL-008**: Comprehensive testing of new static content architecture

| Task     | Description                                                                         | Completed | Date |
| -------- | ----------------------------------------------------------------------------------- | --------- | ---- |
| TASK-045 | Verify all solution pages generate correctly with `generateStaticParams()`          |           |      |
| TASK-046 | Test ISR revalidation (update seed data, verify cache invalidation after 1 hour)    |           |      |
| TASK-047 | Test 404 handling for invalid solution slugs                                        |           |      |
| TASK-048 | Verify GlassType admin form solution assignment works correctly                     |           |      |
| TASK-049 | Test solution filtering in public catalog                                           |           |      |
| TASK-050 | Verify no console errors on solution pages                                          |           |      |
| TASK-051 | Run Lighthouse audit on solution pages (target: 90+ performance)                    |           |      |
| TASK-052 | Test mobile responsiveness of solution cards and detail pages                       |           |      |
| TASK-053 | Create unit tests for solution-related tRPC procedures                              |           |      |
| TASK-054 | Create E2E tests for solution pages: `e2e/glass-solutions/solutions-public.spec.ts` |           |      |

### Implementation Phase 9: Documentation & Migration

**GOAL-009**: Update documentation and create migration guide

| Task     | Description                                                                   | Completed | Date |
| -------- | ----------------------------------------------------------------------------- | --------- | ---- |
| TASK-055 | Update `.github/copilot-instructions.md` with new GlassSolutions architecture |           |      |
| TASK-056 | Update `docs/architecture.md` to reflect static content pattern               |           |      |
| TASK-057 | Update `docs/prd.md` to document new public routes                            |           |      |
| TASK-058 | Create `docs/migrations/glass-solutions-static-content.md` migration guide    |           |      |
| TASK-059 | Update README.md with new public routes and seeding instructions              |           |      |
| TASK-060 | Add JSDoc comments to deprecate old admin endpoints                           |           |      |
| TASK-061 | Update CHANGELOG.md with breaking changes notice                              |           |      |

---

## 3. Alternatives

- **ALT-001**: **Full Static JSON Files**: Store GlassSolutions as JSON in `/public/data/` and fetch client-side
  - ❌ **Rejected**: Loses database relationship for filtering GlassTypes by solution, breaks referential integrity
  
- **ALT-002**: **Keep Full CRUD with "Locked" Flag**: Add `isLocked` field to prevent editing seeded solutions
  - ❌ **Rejected**: Adds unnecessary complexity, admin still sees CRUD UI for content that shouldn't be edited
  
- **ALT-003**: **Use CMS (Contentful, Sanity)**: Move GlassSolutions to headless CMS
  - ❌ **Rejected**: Adds external dependency, breaks seeder workflow, complex setup for simple content
  
- **ALT-004**: **Markdown Files with Frontmatter**: Store solutions as `.md` files in `/content/solutions/`
  - ❌ **Rejected**: Loses database relationships, requires custom parsing logic, harder to query

---

## 4. Dependencies

- **DEP-001**: Next.js 15.5.4 (App Router with `generateStaticParams`)
- **DEP-002**: Prisma 6.17.0 (database ORM)
- **DEP-003**: tRPC 11.6.0 (API layer)
- **DEP-004**: Zod 4.1.12 (schema validation)
- **DEP-005**: React 19.0.0 (Server Components)
- **DEP-006**: Lucide React (icons for solutions)
- **DEP-007**: Existing `glass-solutions.json` seed data file
- **DEP-008**: Existing `GlassSolution`, `GlassTypeSolution` Prisma models

---

## 5. Files

### New Files

- **FILE-001**: `src/server/api/routers/catalog/glass-solutions.queries.ts` - Public tRPC router for solutions
- **FILE-002**: `src/app/(public)/glasses/solutions/page.tsx` - Solutions listing page (Server Component)
- **FILE-003**: `src/app/(public)/glasses/solutions/[slug]/page.tsx` - Solution detail page (Server Component)
- **FILE-004**: `src/app/(public)/glasses/solutions/_components/solution-card.tsx` - Solution card component
- **FILE-005**: `src/app/(public)/glasses/solutions/_components/solution-grid.tsx` - Grid layout component
- **FILE-006**: `src/app/(public)/glasses/solutions/_components/solution-hero.tsx` - Hero section component
- **FILE-007**: `src/app/(public)/glasses/solutions/_components/glass-type-card.tsx` - Glass type display component
- **FILE-008**: `src/app/(public)/glasses/solutions/_components/performance-badge.tsx` - Rating badge component
- **FILE-009**: `docs/migrations/glass-solutions-static-content.md` - Migration guide

### Modified Files

- **FILE-010**: `prisma/schema.prisma` - Add `slug` field to GlassSolution model
- **FILE-011**: `prisma/factories/glass-solution.factory.ts` - Add slug generation logic
- **FILE-012**: `src/server/api/routers/catalog/catalog.schemas.ts` - Add solution query schemas
- **FILE-013**: `src/server/api/routers/catalog/index.ts` - Register new router
- **FILE-014**: `src/server/api/routers/admin/glass-solution.ts` - Deprecate create/update/delete procedures
- **FILE-015**: `src/app/(dashboard)/admin/glass-types/_components/glass-type-form.tsx` - Update solution assignment UI
- **FILE-016**: `.github/copilot-instructions.md` - Update architecture guidance
- **FILE-017**: `docs/architecture.md` - Document static content pattern
- **FILE-018**: `docs/prd.md` - Update API contracts
- **FILE-019**: `README.md` - Add new public routes documentation
- **FILE-020**: `CHANGELOG.md` - Document breaking changes

### Deleted Files

- **FILE-021**: `src/app/(dashboard)/admin/glass-solutions/page.tsx` - Admin list page
- **FILE-022**: `src/app/(dashboard)/admin/glass-solutions/new/page.tsx` - Admin create page
- **FILE-023**: `src/app/(dashboard)/admin/glass-solutions/[id]/page.tsx` - Admin edit page
- **FILE-024**: `src/app/(dashboard)/admin/glass-solutions/_components/glass-solution-form.tsx` - Admin form component
- **FILE-025**: `src/app/(dashboard)/admin/glass-solutions/_components/glass-solution-list.tsx` - Admin list component

---

## 6. Testing

- **TEST-001**: Unit test `list-glass-solutions` tRPC procedure (verify active solutions only)
- **TEST-002**: Unit test `get-glass-solution-by-slug` tRPC procedure (with glass types)
- **TEST-003**: Unit test slug generation in `glass-solution.factory.ts`
- **TEST-004**: Integration test solution seeding with slug backfill
- **TEST-005**: E2E test solutions listing page loads all solutions
- **TEST-006**: E2E test solution detail page renders correctly with glass types
- **TEST-007**: E2E test 404 handling for invalid solution slugs
- **TEST-008**: E2E test solution filtering in public catalog
- **TEST-009**: E2E test GlassType admin form solution assignment
- **TEST-010**: Visual regression test solution cards and detail pages
- **TEST-011**: Performance test ISR revalidation timing
- **TEST-012**: Accessibility test solution pages (ARIA labels, keyboard navigation)

---

## 7. Risks & Assumptions

- **RISK-001**: Breaking change for existing admin workflows (mitigated by clear migration guide)
- **RISK-002**: ISR cache stale data if seed data updated frequently (mitigated by 1-hour revalidation)
- **RISK-003**: Slug collisions if seed data has duplicate keys (mitigated by unique constraint + validation)
- **RISK-004**: Performance issues if too many glass types assigned to one solution (mitigated by pagination)
- **RISK-005**: SEO issues if solution pages not properly indexed (mitigated by metadata + sitemap)

- **ASSUMPTION-001**: GlassSolutions content will be updated infrequently (primarily through seed files)
- **ASSUMPTION-002**: Admins understand solutions are now read-only and managed through seeds
- **ASSUMPTION-003**: Solution slugs will follow kebab-case convention
- **ASSUMPTION-004**: No need for versioning/history tracking for solution content
- **ASSUMPTION-005**: Spanish is the only required language for solution content

---

## 8. Related Specifications / Further Reading

- [Next.js 15 Incremental Static Regeneration (ISR)](https://nextjs.org/docs/app/building-your-application/data-fetching/incremental-static-regeneration)
- [Next.js Dynamic Routes with generateStaticParams](https://nextjs.org/docs/app/api-reference/functions/generate-static-params)
- [Prisma Schema Reference](https://www.prisma.io/docs/orm/reference/prisma-schema-reference)
- [tRPC Public Procedures](https://trpc.io/docs/server/procedures)
- [011-admin-catalog-management spec](../specs/011-admin-catalog-management/plan.md)
- [015-static-glass-taxonomy spec](../specs/015-static-glass-taxonomy/plan.md)
- [Atomic Design Methodology](https://atomicdesign.bradfrost.com/)
