# Implementation Plan: Admin Catalog Management

**Branch**: `011-admin-catalog-management` | **Date**: 2025-10-18 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/011-admin-catalog-management/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

This feature implements a comprehensive admin dashboard for managing catalog entities in Glasify Lite. Admins will be able to perform CRUD operations on 7 core entities: Models (window/door products), Glass Types (with solutions and characteristics), Services, Profile Suppliers, Glass Suppliers, Glass Solutions, and Glass Characteristics. The implementation follows a phased approach starting with foundation entities (suppliers and taxonomies), then core products (glass types and models), and finally supplementary features (services and cost breakdowns). All operations are restricted to admin users only, with full audit trails, referential integrity enforcement, and automatic price history tracking.

## Technical Context

**Language/Version**: TypeScript 5.8.2 (strict mode), Node.js (ES2022 target)  
**Primary Dependencies**: 
  - Next.js 15.2.3 (App Router, React Server Components 19.0.0)
  - tRPC 11.0.0 (type-safe API layer)
  - Prisma 6.16.2 (PostgreSQL ORM)
  - React Hook Form 7.63.0 + Zod 4.1.1 (form validation)
  - TanStack Query 5.69.0 (React Query for client state)
  - Shadcn/ui + Radix UI (component library)
  - TailwindCSS 4.0.15 (styling)

**Storage**: PostgreSQL via Prisma ORM (existing schema in `prisma/schema.prisma`)  
**Testing**: 
  - Vitest 3.2.4 (unit/integration tests with jsdom)
  - Playwright 1.55.1 (E2E tests)
  
**Target Platform**: Server-side rendering (Next.js 15 App Router) with client interactivity where needed  
**Project Type**: Full-stack web application (Next.js monolith with tRPC API layer)  
**Performance Goals**: 
  - Admin list pages load with pagination in <2s for 500 records
  - Form submissions complete in <1s (excluding network latency)
  - Real-time validation feedback <100ms
  
**Constraints**: 
  - Admin-only access (enforce UserRole.admin at middleware, tRPC, and UI layers)
  - Referential integrity (prevent deletion of entities with dependencies)
  - Automatic audit trails (price history, Winston logging of CRUD operations)
  - Spanish (es-LA) UI text, English code/comments
  
**Scale/Scope**: 
  - 7 entity types with CRUD operations (21 tRPC routers total)
  - ~15-20 admin pages (list + create/edit forms)
  - Expected catalog size: 50-200 models, 100-500 glass types, 10-30 services
  - Single admin user initially, multi-admin capable

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

This feature must align with Glasify Lite Constitution v2.0.1 principles:

### Single Responsibility (SRP)
- [x] Each component/module has ONE clear responsibility
  - Pages: Server Components for data fetching + metadata
  - Content Components: Client Components for form interactivity
  - tRPC Routers: API procedures with single responsibility per endpoint
  - Services: Business logic isolation (e.g., price history creation)
- [x] Business logic is separated from UI and data access
  - tRPC procedures handle business logic + validation
  - Prisma for data access (no raw SQL in components)
  - UI components only handle presentation + user input
- [x] Tests and docs exist for each public abstraction
  - Unit tests for tRPC procedures (validation, authorization)
  - E2E tests for CRUD workflows
  - JSDoc for complex procedures

### Open/Closed (OCP)
- [x] New features use extension patterns (hooks, procedures, adapters)
  - New tRPC routers for each entity type (no modification of existing routers)
  - Reusable form components with composition (not modification)
  - Custom hooks for shared logic (e.g., `useAdminListFilters`)
- [x] No modification of stable modules unless documented with migration plan
  - Existing auth/RBAC patterns reused (no breaking changes)
  - Database schema already supports all required fields (Prisma schema stable)
- [x] Breaking API changes include MAJOR version bump + migration guide
  - N/A (no breaking changes to existing APIs)

### Pragmatic Testing Discipline
- [x] Tests MAY be written before/during/after implementation
  - Unit tests written during tRPC procedure development
  - E2E tests written after UI implementation for validation
- [x] Tests MUST cover happy paths and critical edge cases before merge
  - Happy path: Create/read/update for each entity
  - Edge cases: Delete prevention with dependencies, duplicate validation, authorization failures
- [x] Unit tests run in CI
  - Vitest suite for tRPC procedures
- [x] Integration/contract tests for cross-service changes
  - Contract tests for tRPC API schemas (Zod validation)
  - Integration tests for price history auto-creation

### Server-First Architecture (Next.js 15)
- [x] Pages are Server Components by default (`page.tsx`)
  - All admin list pages are Server Components (no metadata needed for admin routes)
  - Data fetching with tRPC server-side API calls
- [x] Client Components (`'use client'`) ONLY for: React hooks, browser APIs, event handlers, client-required libraries
  - Form pages: Client Components for React Hook Form
  - List pages: Client Components for search/filter state (debounce, pagination)
- [x] Public pages export `metadata` for SEO
  - N/A (admin routes not public, no SEO needed)
- [x] Dynamic rendering uses `export const dynamic = 'force-dynamic'`
  - Admin pages use dynamic rendering (session-based authorization)
- [x] Pattern: Server Page + Client Content (interactivity in `_components/*-content.tsx`)
  - `page.tsx`: Server Component for initial data fetch
  - `_components/*-form.tsx`: Client Components for form interactivity

### Integration & Contract Testing
- [x] Contract tests for shared schemas/API contracts
  - Zod schemas in tRPC procedures serve as contracts
  - Unit tests validate schema parsing for all input shapes
- [x] Integration tests for service boundaries (DB, external APIs, client-server)
  - Integration tests for Prisma queries (referential integrity)
  - Price history auto-creation tested with real DB transactions
- [x] Contracts are explicit and versioned
  - tRPC procedures are versioned via Git (feature branch)
  - Prisma schema migrations track database contract changes

### Observability & Versioning
- [x] Structured logging with correlation IDs
  - Winston logger for all CRUD operations (server-side only)
  - Log entries include userId, entityId, operation type
- [x] **Winston logger ONLY in server-side code** (Server Components, Server Actions, API routes, tRPC, middleware)
  - All Winston calls in tRPC procedures (server-side)
  - No Winston in Client Components (use toast for user feedback)
- [x] **NO Winston in Client Components** (use console, toast, error boundaries)
  - Client Components use toast notifications for success/error feedback
- [x] Semantic versioning: MAJOR.MINOR.PATCH
  - Feature branch follows project versioning (no breaking changes)
- [x] Authorization checks + audit logging for sensitive operations
  - All admin procedures use `adminProcedure` (tRPC middleware)
  - Winston logs all create/update/delete operations

### Technology Stack Compliance
- [x] Next.js 15 App Router with React Server Components
- [x] TypeScript (strict), Zod 4, tRPC, Prisma
- [x] React Hook Form + @hookform/resolvers
- [x] shadcn/ui + Radix + TailwindCSS
- [x] Biome/Ultracite for formatting/linting
- [x] UI text in Spanish (es-LA); code/comments/commits in English

### Security & Compliance
- [x] All inputs validated server-side (Zod schemas in tRPC `.input()`)
  - Every tRPC procedure has `.input(zodSchema)` validation
- [x] No secrets committed (use env variables + @t3-oss/env-nextjs)
  - N/A (no new secrets required)
- [x] Sensitive operations include authorization + audit logging
  - `adminProcedure` enforces admin-only access
  - Winston logs all mutations

### Development Workflow
- [x] Conventional commits format
  - Follow project convention: `feat(admin): add model CRUD endpoints`
- [x] PR descriptions reference affected principles
  - PR will reference SRP (tRPC routers), Server-First (page structure), Security (RBAC)
- [x] CI gates: typecheck, lint, unit tests, E2E tests (if user flows affected)
  - All gates will pass before merge
- [x] Code review: 1 approver (2 for large/risky changes)
  - This is a large feature (7 entity types), will request 2 reviewers

---

**Notes**:
- All constitution checks pass ✅
- No exceptions required
- Feature follows established patterns from existing codebase (RBAC, tRPC, Prisma)
- Re-validation after Phase 1 design: PASSED ✅

## Project Structure

### Documentation (this feature)

```
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```
src/
├── app/
│   ├── (dashboard)/                    # Route group: admin-only area
│   │   ├── dashboard/
│   │   │   └── page.tsx                # Dashboard home (existing)
│   │   ├── admin/
│   │   │   ├── models/
│   │   │   │   ├── _components/
│   │   │   │   │   ├── model-form.tsx           # Client Component: form interactivity
│   │   │   │   │   ├── model-list.tsx           # Client Component: search/filter/pagination
│   │   │   │   │   └── model-cost-breakdown.tsx # Client Component: cost components management
│   │   │   │   ├── page.tsx                     # Server Component: list page
│   │   │   │   ├── new/
│   │   │   │   │   └── page.tsx                 # Server Component: create page
│   │   │   │   └── [id]/
│   │   │   │       ├── page.tsx                 # Server Component: view/edit page
│   │   │   │       └── loading.tsx              # Loading state
│   │   │   │
│   │   │   ├── glass-types/
│   │   │   │   ├── _components/
│   │   │   │   │   ├── glass-type-form.tsx       # Client Component: form with solutions/characteristics
│   │   │   │   │   ├── glass-type-list.tsx       # Client Component: search/filter
│   │   │   │   │   ├── solution-selector.tsx     # Client Component: multi-select with ratings
│   │   │   │   │   └── characteristic-selector.tsx # Client Component: multi-select with values
│   │   │   │   ├── page.tsx                      # Server Component: list page
│   │   │   │   ├── new/page.tsx                  # Server Component: create page
│   │   │   │   └── [id]/page.tsx                 # Server Component: view/edit page
│   │   │   │
│   │   │   ├── services/
│   │   │   │   ├── _components/
│   │   │   │   │   ├── service-form.tsx          # Client Component: form
│   │   │   │   │   └── service-list.tsx          # Client Component: list
│   │   │   │   ├── page.tsx                      # Server Component: list page
│   │   │   │   ├── new/page.tsx
│   │   │   │   └── [id]/page.tsx
│   │   │   │
│   │   │   ├── profile-suppliers/
│   │   │   │   ├── _components/
│   │   │   │   │   ├── profile-supplier-form.tsx
│   │   │   │   │   └── profile-supplier-list.tsx
│   │   │   │   ├── page.tsx
│   │   │   │   ├── new/page.tsx
│   │   │   │   └── [id]/page.tsx
│   │   │   │
│   │   │   ├── glass-suppliers/
│   │   │   │   ├── _components/
│   │   │   │   │   ├── glass-supplier-form.tsx
│   │   │   │   │   └── glass-supplier-list.tsx
│   │   │   │   ├── page.tsx
│   │   │   │   ├── new/page.tsx
│   │   │   │   └── [id]/page.tsx
│   │   │   │
│   │   │   ├── glass-solutions/
│   │   │   │   ├── _components/
│   │   │   │   │   ├── glass-solution-form.tsx
│   │   │   │   │   └── glass-solution-list.tsx
│   │   │   │   ├── page.tsx
│   │   │   │   ├── new/page.tsx
│   │   │   │   └── [id]/page.tsx
│   │   │   │
│   │   │   └── glass-characteristics/
│   │   │       ├── _components/
│   │   │       │   ├── glass-characteristic-form.tsx
│   │   │       │   └── glass-characteristic-list.tsx
│   │   │       ├── page.tsx
│   │   │       ├── new/page.tsx
│   │   │       └── [id]/page.tsx
│   │   │
│   │   └── layout.tsx                  # Admin layout (existing, with nav)
│   │
│   └── _components/
│       ├── admin-nav.tsx               # Admin navigation (update with new links)
│       └── delete-confirmation-dialog.tsx # Reusable delete dialog
│
├── server/
│   ├── api/
│   │   └── routers/
│   │       ├── admin/
│   │       │   ├── model.ts             # tRPC router: model CRUD + cost breakdown
│   │       │   ├── glass-type.ts        # tRPC router: glass type CRUD + solutions/characteristics
│   │       │   ├── service.ts           # tRPC router: service CRUD
│   │       │   ├── profile-supplier.ts  # tRPC router: profile supplier CRUD
│   │       │   ├── glass-supplier.ts    # tRPC router: glass supplier CRUD
│   │       │   ├── glass-solution.ts    # tRPC router: glass solution CRUD
│   │       │   └── glass-characteristic.ts # tRPC router: glass characteristic CRUD
│   │       │
│   │       └── root.ts                  # Update to include admin routers
│   │
│   └── services/
│       ├── price-history.service.ts     # Business logic: auto-create price history
│       └── referential-integrity.service.ts # Business logic: check dependencies before delete
│
├── lib/
│   └── validations/
│       ├── admin/
│       │   ├── model.schema.ts          # Zod schemas for model CRUD
│       │   ├── glass-type.schema.ts     # Zod schemas for glass type CRUD
│       │   ├── service.schema.ts        # Zod schemas for service CRUD
│       │   ├── profile-supplier.schema.ts
│       │   ├── glass-supplier.schema.ts
│       │   ├── glass-solution.schema.ts
│       │   └── glass-characteristic.schema.ts
│       │
│       └── shared.schema.ts             # Shared validation utilities (e.g., positive integers)
│
└── middleware.ts                         # Update admin route protection (existing)

tests/
├── unit/
│   ├── admin/
│   │   ├── model.test.ts                # Unit tests: tRPC model procedures
│   │   ├── glass-type.test.ts           # Unit tests: tRPC glass type procedures
│   │   ├── service.test.ts
│   │   ├── profile-supplier.test.ts
│   │   ├── glass-supplier.test.ts
│   │   ├── glass-solution.test.ts
│   │   └── glass-characteristic.test.ts
│   │
│   └── services/
│       ├── price-history.test.ts        # Unit tests: price history service
│       └── referential-integrity.test.ts # Unit tests: referential integrity checks
│
└── integration/
    └── admin/
        ├── model-crud.test.ts           # Integration tests: full CRUD flow with DB
        └── glass-type-crud.test.ts      # Integration tests: glass type with relations

e2e/
└── admin/
    ├── model-management.spec.ts         # E2E: create, edit, delete model
    ├── glass-type-management.spec.ts    # E2E: create glass type with solutions/characteristics
    ├── service-management.spec.ts       # E2E: service CRUD
    ├── profile-supplier-management.spec.ts
    ├── glass-supplier-management.spec.ts
    ├── glass-solution-management.spec.ts
    └── glass-characteristic-management.spec.ts
```

**Structure Decision**: 

This feature follows the **Next.js 15 App Router monolith pattern** with strict Server-First architecture:

1. **Route Organization**: All admin pages under `app/(dashboard)/admin/*` route group (enforces admin-only access via middleware)
2. **Component Split**: 
   - `page.tsx` files are Server Components for data fetching and metadata
   - `_components/*` files are Client Components for form interactivity (React Hook Form)
3. **API Layer**: tRPC routers in `server/api/routers/admin/*` (one router per entity type)
4. **Business Logic**: Extracted to `server/services/*` for reusability (price history, referential integrity)
5. **Validation**: Zod schemas in `lib/validations/admin/*` (shared between client and server)
6. **Testing**: Three-layer testing strategy (unit for tRPC procedures, integration for DB operations, E2E for full workflows)

## Complexity Tracking

*Fill ONLY if Constitution Check has violations that must be justified*

| Violation | Why Needed | Simpler Alternative Rejected Because |
| --------- | ---------- | ------------------------------------ |
| N/A       | N/A        | N/A                                  |

**Notes**: No constitution violations detected. Feature follows all established patterns and principles.

---

## Implementation Phases Summary

### Phase 0: Research & Decisions ✅ COMPLETE
**Status**: All research questions resolved  
**Output**: `research.md`  
**Key Decisions**:
- Form architecture: Single-page with collapsible sections (Accordion)
- Glass type relations: Inline management during creation (useFieldArray)
- Supplier creation: Pre-requisite with quick "Create New" link
- Glass type validation: Only active glass types
- Implementation order: 3-phase by dependency graph
- Price history: Service layer middleware (not DB triggers)
- Referential integrity: Pre-delete checks + informative errors

### Phase 1: Design & Contracts ✅ COMPLETE
**Status**: Data model and API contracts defined  
**Output**: `data-model.md`, `contracts/api-contracts.md`, `quickstart.md`  
**Deliverables**:
- ✅ 10 entities documented with validation rules
- ✅ Entity relationship diagram (Mermaid)
- ✅ State transition diagrams (Model status, GlassType activation)
- ✅ tRPC API contracts for all CRUD operations (21 procedures)
- ✅ Zod schema specifications
- ✅ Quick start guide with code examples
- ✅ Agent context updated (GitHub Copilot)

### Phase 2: Tasks Breakdown (NOT STARTED)
**Command**: Run `/speckit.tasks` to generate `tasks.md`  
**Expected Output**: Detailed task list with:
- Individual implementation tasks for each entity
- Testing tasks (unit, integration, E2E)
- Documentation tasks
- Time estimates per task
- Dependencies between tasks

---

## Plan Status

| Phase          | Status      | Progress | Blockers |
| -------------- | ----------- | -------- | -------- |
| Phase 0        | ✅ Complete  | 100%     | None     |
| Phase 1        | ✅ Complete  | 100%     | None     |
| Phase 2 (Next) | Not Started | 0%       | None     |

---

## Next Steps for Implementation

1. **Run `/speckit.tasks` command** to generate detailed task breakdown
2. **Start with Phase 1.1**: ProfileSupplier CRUD (use as template for other entities)
3. **Parallelize Phase 1 entities**: All foundation entities can be developed simultaneously
4. **Sequential Phase 2**: GlassType (depends on suppliers), then Model (depends on GlassType)
5. **Complete Phase 3**: Services and cost breakdown (independent)

---

## Key Artifacts Generated

- ✅ `plan.md` - This file (implementation plan)
- ✅ `research.md` - Phase 0 research and decisions
- ✅ `data-model.md` - Entity definitions and relationships
- ✅ `contracts/api-contracts.md` - tRPC API contracts
- ✅ `quickstart.md` - Developer quick start guide
- ⏳ `tasks.md` - Detailed task breakdown (pending `/speckit.tasks`)

---

## Plan Validation

**Constitution Compliance**: ✅ All checks passed  
**Technical Context**: ✅ All fields filled (no NEEDS CLARIFICATION)  
**Research Completion**: ✅ All unknowns resolved  
**Design Completion**: ✅ Data model and contracts defined  
**Agent Context**: ✅ Updated with feature details

**Plan Status**: ✅ **READY FOR IMPLEMENTATION**

---

**Generated by**: `/speckit.plan` command  
**Plan Version**: 1.0.0  
**Last Updated**: 2025-10-18

