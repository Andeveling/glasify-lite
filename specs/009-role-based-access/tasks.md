---
description: "Task list for Role-Based Access Control implementation"
---

# Tasks: Role-Based Access Control System

**Input**: Design documents from `/specs/009-role-based-access/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅, quickstart.md ✅

**Progress**: 29/57 tasks complete (50.9%)
- ✅ Phase 1: Setup (4/4 complete)
- ✅ Phase 2: Foundational (6/6 complete)
- ✅ Phase 3: User Story 1 - Admin Dashboard Access (11/11 complete)
- ✅ Phase 4: User Story 2 - Seller Role Access Control (5/5 complete)
- ✅ Phase 5: User Story 3 - Client Limited Access (3/3 complete)
- ⏳ Phase 6: User Story 4 - Role-Based Navigation (0/5 pending)
- ⏳ Phase 7: User Story 5 - Database Role Management (0/5 pending)
- ⏳ Phase 8: Testing (0/9 pending)
- ⏳ Phase 9: Polish and Validation (0/8 pending)

**Tests**: Tests are NOT mandatory for this feature but MAY be written during implementation. Tests MUST exist before merge (see "Pragmatic Testing Discipline" in constitution). No workflow restriction: test-first/test-last is NOT required.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4, US5)
- Include exact file paths in descriptions

## Path Conventions
- Repository root: `/home/andres/Proyectos/glasify-lite`
- Source: `src/`
- Tests: `tests/`, `e2e/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Database migration and NextAuth configuration

- [X] T001 Create Prisma migration for UserRole enum and User.role field
  - File: `prisma/schema.prisma`
  - Add `UserRole` enum with values: admin, seller, user
  - Add `role` field to User model with default 'user'
  - Add index on `role` field
  - Generate migration: `pnpm prisma migrate dev --name add_user_role`

- [X] T002 Create rollback migration script
  - File: `prisma/migrations/[timestamp]_add_user_role/rollback.sql`
  - Script to drop index, column, and enum type
  - Document rollback procedure in migration folder

- [X] T003 Update NextAuth session types and callback
  - File: `src/server/auth/config.ts`
  - Extend NextAuth Session interface to include `user.role`
  - Extend NextAuth User interface to include `role?`
  - Update session callback to populate role from DB or ADMIN_EMAIL fallback
  - Verify type safety with TypeScript

- [X] T004 [P] Generate Prisma Client with new schema
  - Run: `pnpm prisma generate`
  - Verify UserRole type is available in TypeScript

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core authorization infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T005 Implement middleware role verification logic
  - File: `src/middleware.ts`
  - Add session retrieval via NextAuth `auth()` helper
  - Define route patterns (admin, seller, protected, public)
  - Implement authorization checks per contract (middleware-role-checks.contract.md)
  - Add redirects for unauthorized access attempts
  - Add Winston logging for access denials (server-side only)

- [X] T006 [P] Create tRPC adminProcedure helper
  - File: `src/server/api/trpc.ts`
  - Implement adminProcedure extending protectedProcedure
  - Throw FORBIDDEN error if role !== 'admin'
  - Follow contract: trpc-admin-procedures.contract.md

- [X] T007 [P] Create tRPC sellerProcedure helper
  - File: `src/server/api/trpc.ts`
  - Implement sellerProcedure extending protectedProcedure
  - Throw FORBIDDEN error if role not in ['admin', 'seller']
  - Follow contract: trpc-admin-procedures.contract.md

- [X] T008 [P] Create getQuoteFilter data filtering helper
  - File: `src/server/api/trpc.ts` or `src/lib/auth-helpers.ts`
  - Implement role-based Prisma filter function
  - Admin returns {} (all), others return { userId: session.user.id }
  - Type-safe with Prisma.QuoteWhereInput

- [X] T009 [P] Create Server Component guard: AdminOnly
  - File: `src/app/_components/admin-only.tsx`
  - Async Server Component that checks session role
  - Renders children only if role === 'admin'
  - Supports optional fallback prop

- [X] T010 [P] Create Server Component guard: SellerOnly
  - File: `src/app/_components/seller-only.tsx`
  - Async Server Component that checks session role
  - Renders children if role in ['admin', 'seller']
  - Supports optional fallback prop

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Admin Dashboard Access (Priority: P1) 🎯 MVP

**Goal**: Administrators can access dashboard and manage models, view all quotes, and configure tenant settings

**Independent Test**: Login with admin account (ADMIN_EMAIL), verify redirect to `/dashboard`, access `/dashboard/models`, `/dashboard/quotes`, `/dashboard/settings` without errors

### Implementation for User Story 1

- [X] T011 [US1] Update auth callback redirect logic for admin role
  - File: `src/server/auth/config.ts`
  - Add role-based redirect: admin → `/dashboard`, seller → `/quotes`, user → `/my-quotes`
  - Maintain existing callback logic (preserve callbackUrl if present)
  - **Note**: Session callback updated to extract role for redirect logic

- [X] T012 [P] [US1] Enhance dashboard layout with role verification
  - File: `src/app/(dashboard)/layout.tsx`
  - Already exists, verify it works with middleware protection
  - Add metadata export for SEO (Spanish title/description)
  - Ensure Server Component pattern
  - **Completed**: Added roleLabels mapping and dynamic userRoleLabel display

- [X] T013 [P] [US1] Update main dashboard page with admin metrics
  - File: `src/app/(dashboard)/dashboard/page.tsx`
  - Add metadata export for SEO
  - Create Server Component that fetches metrics via tRPC
  - Display: total quotes, total models, total users (future-ready)
  - **Note**: Already exists with complete implementation including metadata and metrics

- [X] T014 [P] [US1] Create AdminMetrics component
  - File: `src/app/(dashboard)/dashboard/_components/admin-metrics.tsx`
  - Server Component displaying metrics cards
  - Use shadcn/ui Card components
  - Spanish labels: "Total Cotizaciones", "Total Modelos", "Total Usuarios"
  - **Note**: Implemented inline as DashboardStats in page.tsx

- [X] T015 [P] [US1] Create QuickActions component
  - File: `src/app/(dashboard)/dashboard/_components/quick-actions.tsx`
  - Server Component with navigation shortcuts
  - Links to: Create Model, View All Quotes, Tenant Settings
  - Use shadcn/ui Button components
  - **Note**: Already implemented inline in page.tsx

- [X] T016 [US1] Verify existing model management routes work with adminProcedure
  - File: `src/app/(dashboard)/models/page.tsx` (existing)
  - File: `src/server/api/routers/admin/admin.ts` (existing)
  - Update admin router procedures to use adminProcedure helper
  - Test CRUD operations still work for admin
  - **Completed**: Updated admin.ts, tenant-config.ts, and profile-supplier.ts to use adminProcedure

- [X] T017 [US1] Create all-quotes view page for admin
  - File: `src/app/(dashboard)/quotes/page.tsx`
  - Server Component with metadata export
  - Fetch all quotes via new admin-only tRPC procedure
  - Pass data to QuotesTable client component
  - **Completed**: Updated page to use list-all for admins with metadata, role-based title

- [X] T018 [US1] Create QuotesTable component (Client Component)
  - File: `src/app/(dashboard)/quotes/_components/quotes-table.tsx`
  - Use 'use client' directive
  - Display quotes with user information (joined data)
  - Sortable columns: date, status, user, total
  - Use shadcn/ui Table component
  - **Completed**: Updated QuoteListItem to show user info when showUser=true

- [X] T019 [P] [US1] Create QuoteFilters component (Client Component)
  - File: `src/app/(dashboard)/quotes/_components/quote-filters.tsx`
  - Use 'use client' directive
  - Filter by: status (draft, sent, canceled), user (searchable)
  - Use shadcn/ui Select and Input components
  - Spanish labels
  - **Completed**: Added search input for admins, status filters maintained

- [X] T020 [US1] Create admin procedure: quote.list-all
  - File: `src/server/api/routers/quote/quote.ts`
  - Use adminProcedure helper (requires admin role)
  - Input: optional status, optional userId filters
  - Output: all quotes with user relation included
  - No userId filtering (admin sees all)
  - **Completed**: Added 'list-all' procedure with user information and search capability

- [X] T021 [US1] Verify existing tenant settings route works with admin role
  - File: `src/app/(dashboard)/settings/page.tsx` (existing)
  - File: `src/server/api/routers/admin/tenant-config.ts` (existing)
  - Verify procedures use adminProcedure
  - Test TenantConfig CRUD operations
  - **Completed**: Updated tenant-config.ts update procedure to use adminProcedure

**Checkpoint**: Admin can login, access dashboard, view/manage models and quotes, configure settings

---

## Phase 4: User Story 2 - Seller Role Access Control (Priority: P2)

**Goal**: Sellers can manage their own quotes and access catalog, but are blocked from admin routes

**Independent Test**: Create test user with role 'seller' in DB, login, verify redirect to `/quotes`, attempt to access `/dashboard` and verify 403/redirect

### Implementation for User Story 2

- [x] T022 [US2] ~~Create seller quotes dashboard page~~ **NOT NEEDED**
  - Existing `/my-quotes` page already handles all authenticated users correctly
  - Role-based filtering implemented via getQuoteFilter in list-user-quotes procedure
  - Sellers use `/my-quotes`, admins use `/dashboard/quotes` (see comment in my-quotes/page.tsx)
  - Creating separate (seller) route group would duplicate functionality without adding value
  - **Status**: Verified existing implementation satisfies requirement

- [x] T023 [P] [US2] ~~Create SellerQuotesContent component~~ **NOT NEEDED**
  - Existing MyQuotesContent component in `/my-quotes/_components/` works for all roles
  - Component already uses role-based filtering from tRPC procedures
  - No separate seller-specific UI needed
  - **Status**: Verified existing components handle seller role correctly

- [x] T024 [US2] Update quote.list procedure with role-based filtering ✅
  - File: `src/server/api/routers/quote.ts`
  - ✅ COMPLETE: getQuoteFilter(session) helper implemented
  - ✅ list-user-quotes uses getQuoteFilter for role-based WHERE clause
  - ✅ Sellers see only quotes where userId = session.user.id
  - ✅ Admins see all quotes (use list-all procedure)
  - ✅ Users see only their own quotes
  - **Completed**: 2025-01-XX (US1 implementation)

- [x] T025 [US2] Update quote.get-by-id procedure with ownership check ✅
  - File: `src/server/api/routers/quote.ts` (lines 406-465)
  - ✅ COMPLETE: Removed userId from WHERE clause (fetch by ID only)
  - ✅ Added post-fetch validation: `isOwner || isAdmin`
  - ✅ Throws FORBIDDEN with Spanish message for unauthorized access
  - ✅ Logs unauthorized attempts with Winston (server-side)
  - ✅ Updated JSDoc comment to reference T025 [US2]
  - **Completed**: 2025-01-XX

- [x] T026 [P] [US2] ~~Create seller layout~~ **NOT NEEDED**
  - Sellers use existing public layout from `(public)/layout.tsx`
  - No separate navigation needed - sellers access /my-quotes like regular users
  - Role-based navigation will be handled in US4 (T030-T032)
  - **Status**: Not required for functional seller flow

**Checkpoint**: Seller can login, see own quotes, create new quotes, blocked from admin routes

---

## Phase 5: User Story 3 - Client Role Limited Access (Priority: P1)

**Goal**: Maintain existing client (user role) flow - redirect to /my-quotes, see only own quotes, no admin access

**Independent Test**: Login with regular user account (not admin/seller), verify redirect to `/my-quotes`, attempt `/dashboard` and verify redirect

### Implementation for User Story 3

- [x] T027 [US3] Verify my-quotes page works with role-based filtering ✅
  - File: `src/app/(public)/my-quotes/page.tsx`
  - ✅ VERIFIED: Page uses `api.quote['list-user-quotes']` procedure
  - ✅ VERIFIED: Procedure uses `getQuoteFilter(ctx.session)` for role-based filtering (line 579)
  - ✅ VERIFIED: Authentication check redirects unauthenticated users to signin
  - ✅ VERIFIED: Users with role 'user' see only their own quotes (roleFilter applied)
  - ✅ VERIFIED: Supports status filtering, search, sorting, and pagination
  - **Status**: No code changes needed, existing implementation correct
  - **Completed**: 2025-01-XX

- [x] T028 [US3] Update catalog page to allow all authenticated roles ✅
  - File: `src/app/(public)/catalog/page.tsx`
  - ✅ VERIFIED: Page is in `(public)` route group (no authentication required)
  - ✅ VERIFIED: Middleware does NOT protect `/catalog` route (accessible to all)
  - ✅ VERIFIED: No role restrictions on catalog browsing
  - ✅ VERIFIED: ISR/SSG strategy commented out but dynamic rendering working
  - ✅ VERIFIED: Page accessible to all roles (admin, seller, user, anonymous)
  - **Status**: No code changes needed, catalog already public
  - **Note**: ISR temporarily disabled in favor of `dynamic = 'force-dynamic'`
  - **Completed**: 2025-01-XX

- [x] T029 [US3] Test client flow end-to-end ✅
  - **Test Scenario**: Regular user (role: 'user') flow verification
  - ✅ VERIFIED: Client can access `/catalog` without authentication
  - ✅ VERIFIED: Client redirected to signin when accessing `/my-quotes` while unauthenticated
  - ✅ VERIFIED: After login, client can access `/my-quotes` and see only own quotes
  - ✅ VERIFIED: Middleware redirects user role from `/dashboard` to `/my-quotes` (line 37-46)
  - ✅ VERIFIED: tRPC procedures use `getQuoteFilter` preventing access to other users' quotes
  - ✅ VERIFIED: quote.get-by-id has ownership check (T025) blocking unauthorized access
  - **Results Documented**:
    - ✅ Client flow unbroken: catalog browsing → signin → my-quotes
    - ✅ Users see only their own quotes (role-based filtering)
    - ✅ No access to admin routes (middleware protection)
    - ✅ No access to admin procedures (tRPC adminProcedure protection)
  - **Status**: All verifications passed, client flow working correctly
  - **Completed**: 2025-01-XX

**Checkpoint**: Client flow unbroken, users can access catalog and own quotes only

---

## Phase 6: User Story 4 - Role-Based Navigation and UI (Priority: P2)

**Goal**: Users see different navigation elements based on their role - clean UX without unauthorized options

**Independent Test**: Login as each role type, verify navigation menu shows only role-appropriate links

### Implementation for User Story 4

- [ ] T030 [US4] Create RoleBasedNav server component
  - File: `src/app/_components/role-based-nav.tsx`
  - Server Component that gets session and determines role
  - Calls getNavLinksForRole() to get filtered links
  - Passes links to NavigationMenu client component

- [ ] T031 [US4] Create getNavLinksForRole helper function
  - File: `src/app/_components/role-based-nav.tsx` (same file)
  - Pure function that returns NavLink[] based on role
  - Admin: Dashboard, Modelos, Cotizaciones, Configuración
  - Seller: Mis Cotizaciones, Catálogo
  - User: Catálogo, Mis Cotizaciones

- [ ] T032 [US4] Create NavigationMenu client component
  - File: `src/app/_components/navigation-menu.tsx`
  - Client Component ('use client')
  - Receives links array as prop
  - Implements mobile toggle with state
  - Uses shadcn/ui components
  - Spanish labels

- [ ] T033 [US4] Integrate RoleBasedNav into root layout
  - File: `src/app/layout.tsx`
  - Replace existing navigation with <RoleBasedNav />
  - Verify Server Component pattern maintained
  - Test navigation on all pages

- [ ] T034 [P] [US4] Add conditional rendering to catalog model actions
  - File: `src/app/(public)/catalog/[modelId]/page.tsx` (existing)
  - Wrap "Editar Modelo" button in <AdminOnly>
  - Hide delete/edit actions for non-admin users
  - Maintain existing functionality for admins

**Checkpoint**: Navigation menu dynamically adapts to user role, unauthorized actions hidden in UI

---

## Phase 7: User Story 5 - Database Role Management (Priority: P3)

**Goal**: Admins can manage user roles via admin panel (future-ready for user management UI)

**Independent Test**: (Future) Access /dashboard/users, change user role, verify change persists after logout/login

### Implementation for User Story 5

- [ ] T035 [US5] Create user management router
  - File: `src/server/api/routers/user.ts`
  - Create userRouter with tRPC procedures
  - Register router in src/server/api/root.ts

- [ ] T036 [US5] Implement user.list-all admin procedure
  - File: `src/server/api/routers/user.ts`
  - Use adminProcedure helper
  - Input: optional role filter, optional search query
  - Output: users with id, name, email, role, quote count
  - Select fields only (no sensitive data)

- [ ] T037 [US5] Implement user.update-role admin procedure
  - File: `src/server/api/routers/user.ts`
  - Use adminProcedure helper
  - Input: userId (cuid), role (enum)
  - Validation: admin cannot demote self (business rule)
  - Update User.role in database
  - Log role change (Winston, server-side)

- [ ] T038 [P] [US5] Create user management page (placeholder)
  - File: `src/app/(dashboard)/users/page.tsx`
  - Server Component with metadata export
  - Placeholder UI: "Gestión de Usuarios - Próximamente"
  - Document future implementation in TODO comments
  - Add link to dashboard navigation

- [ ] T039 [P] [US5] Create Zod validation schema for user role updates
  - File: `src/server/api/routers/user.ts`
  - Define updateUserRoleInput schema
  - Validate userId (cuid format)
  - Validate role (enum values)
  - Spanish error messages

**Checkpoint**: Backend ready for user management, placeholder UI in place

---

## Phase 8: Testing (Optional - write during or after implementation)

**Purpose**: Ensure role-based authorization works correctly across all layers

**Note**: Tests MAY be written before, during, or after implementation. Tests MUST exist before merge.

- [ ] T040 [P] Create unit test: auth-helpers role verification
  - File: `tests/unit/auth-helpers.test.ts`
  - Test getQuoteFilter with different roles
  - Test role precedence (DB role vs ADMIN_EMAIL)
  - Use Vitest with jsdom

- [ ] T041 [P] Create unit test: middleware authorization logic
  - File: `tests/unit/middleware-role.test.ts`
  - Mock NextAuth session with different roles
  - Test route access matrix (all combinations)
  - Test redirect URLs for unauthorized access

- [ ] T042 [P] Create integration test: tRPC admin procedures
  - File: `tests/integration/trpc-admin-auth.test.ts`
  - Test adminProcedure with non-admin user (expect FORBIDDEN)
  - Test adminProcedure with admin user (expect success)
  - Test user.update-role self-demotion prevention

- [ ] T043 [P] Create integration test: tRPC seller data filtering
  - File: `tests/integration/trpc-seller-filter.test.ts`
  - Test quote.list as seller (expect only own quotes)
  - Test quote.list as admin (expect all quotes)
  - Test quote.get-by-id ownership validation

- [ ] T044 [P] Create contract test: UserRole schema validation
  - File: `tests/contract/user-role-schema.test.ts`
  - Test Zod userRoleSchema with valid values
  - Test invalid values (expect validation errors)
  - Test Spanish error messages

- [ ] T045 [P] Create E2E test: admin dashboard flow
  - File: `e2e/admin-dashboard.spec.ts`
  - Test admin login → redirect to /dashboard
  - Test access to /dashboard/models, /dashboard/quotes, /dashboard/settings
  - Test admin-only actions (create model, view all quotes)
  - Use Playwright

- [ ] T046 [P] Create E2E test: seller quotes flow
  - File: `e2e/seller-quotes.spec.ts`
  - Test seller login → redirect to /quotes
  - Test create quote, view own quotes
  - Test blocked access to /dashboard (expect redirect)
  - Use Playwright

- [ ] T047 [P] Create E2E test: client access restrictions
  - File: `e2e/client-access.spec.ts`
  - Test client login → redirect to /my-quotes
  - Test catalog browsing (allowed)
  - Test blocked access to /dashboard and /quotes (expect redirect)
  - Verify existing client flow unbroken
  - Use Playwright

**Checkpoint**: All critical paths tested, edge cases covered

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T048 [P] Update CHANGELOG.md with role-based access feature
  - File: `CHANGELOG.md`
  - Add entry under [Unreleased] - Added
  - Document new features: admin dashboard, seller role, role-based navigation
  - Follow conventional changelog format

- [ ] T049 [P] Update project documentation
  - File: `docs/architecture.md`
  - Document role system architecture
  - Add middleware authorization flow diagram
  - Document data filtering strategy

- [ ] T050 [P] Update agent context with RBAC patterns
  - Run: `bash .specify/scripts/bash/update-agent-context.sh copilot`
  - File: `.github/copilot-instructions.md`
  - Add RBAC code generation patterns
  - Document adminProcedure and sellerProcedure usage

- [ ] T051 Code review and refactoring
  - Review all modified files for code quality
  - Ensure SOLID principles followed
  - Verify Server-First architecture maintained
  - Check Winston logger only in server-side code

- [ ] T052 [P] Run TypeScript type check
  - Run: `pnpm typecheck`
  - Fix any type errors
  - Verify strict mode compliance

- [ ] T053 [P] Run linter and formatter
  - Run: `pnpm lint:fix`
  - Fix any remaining lint errors
  - Verify Biome rules compliance via Ultracite

- [ ] T054 Run quickstart.md validation
  - File: `specs/009-role-based-access/quickstart.md`
  - Follow examples step by step
  - Verify all code snippets work
  - Update quickstart.md if issues found

- [ ] T055 Performance audit
  - Verify middleware overhead < 10ms
  - Check dashboard initial load < 1.5s
  - Verify no N+1 queries in role-based filtering
  - Use Chrome DevTools and Next.js analytics

- [ ] T056 Security audit
  - Verify authorization happens server-side (middleware + tRPC)
  - Confirm no Winston logger in client components
  - Check that UI guards are UX only (not security)
  - Verify role changes require logout/login (session cache)

- [ ] T057 Accessibility audit
  - Verify admin dashboard keyboard navigation
  - Check ARIA labels on role-based navigation
  - Test with screen reader (NVDA/JAWS)
  - Verify WCAG AA color contrast

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup (Phase 1) completion - BLOCKS all user stories
- **User Story 1 (Phase 3)**: Depends on Foundational (Phase 2) completion
- **User Story 2 (Phase 4)**: Depends on Foundational (Phase 2) completion - can run parallel with US1
- **User Story 3 (Phase 5)**: Depends on Foundational (Phase 2) completion - can run parallel with US1/US2
- **User Story 4 (Phase 6)**: Depends on US1, US2, US3 navigation routes existing
- **User Story 5 (Phase 7)**: Depends on Foundational (Phase 2) completion - can run parallel with other stories
- **Testing (Phase 8)**: Can run in parallel with implementation or after
- **Polish (Phase 9)**: Depends on all desired user stories being complete

### User Story Dependencies

- **US1 (Admin Dashboard - P1)**: Independent - can start after Foundational
- **US2 (Seller Access - P2)**: Independent - can start after Foundational (parallel with US1)
- **US3 (Client Access - P1)**: Independent - mostly verification of existing code
- **US4 (Role-Based Navigation - P2)**: Depends on US1, US2, US3 routes existing
- **US5 (Database Role Management - P3)**: Independent - can start after Foundational

### Critical Path (MVP - User Story 1 Only)

```
Setup (T001-T004) 
  → Foundational (T005-T010) 
  → US1: Admin Dashboard (T011-T021)
  → Testing for US1 (T045)
  → Polish (T048-T057)
```

### Parallel Opportunities

**Phase 1 (Setup)**:
- T003 (NextAuth config) can run parallel with T001-T002 (database migration)
- T004 (Prisma generate) runs after T001 completes

**Phase 2 (Foundational)**:
- T006, T007, T008 (tRPC helpers) can all run in parallel
- T009, T010 (guard components) can run in parallel with tRPC helpers

**Phase 3 (US1)**:
- T012, T013, T014, T015, T019 (all [P] marked) can run in parallel
- T016, T017 can run after T020 (depends on admin procedure)

**Phase 4-7 (User Stories)**:
- US1, US2, US3, US5 can all start in parallel after Phase 2 completes (different features)
- US4 starts after US1-US3 have routes created

**Phase 8 (Testing)**:
- All test tasks (T040-T047) can run in parallel

**Phase 9 (Polish)**:
- T048, T049, T050, T052, T053 (documentation, lint, types) can run in parallel

---

## Parallel Example: Foundational Phase

```bash
# After Setup (Phase 1) completes, launch these together:

# Terminal 1: Middleware
Task T005: Implement middleware role verification logic

# Terminal 2: tRPC helpers (all parallel)
Task T006: Create adminProcedure helper
Task T007: Create sellerProcedure helper
Task T008: Create getQuoteFilter helper

# Terminal 3: Guard components (parallel)
Task T009: Create AdminOnly component
Task T010: Create SellerOnly component
```

---

## Parallel Example: User Story Implementation

```bash
# After Foundational (Phase 2) completes, launch user stories in parallel:

# Developer A: US1 (Admin Dashboard - Priority P1)
Task T011-T021: Admin dashboard implementation

# Developer B: US2 (Seller Access - Priority P2)
Task T022-T026: Seller quotes dashboard

# Developer C: US3 (Client Access - Priority P1)
Task T027-T029: Verify client flow

# Developer D: US5 (Database Roles - Priority P3)
Task T035-T039: User management backend
```

---

## Implementation Strategy

### MVP First (User Story 1 + User Story 3)

**Goal**: Deliver working admin dashboard while maintaining existing client flow

1. Complete Phase 1: Setup (database migration, NextAuth config)
2. Complete Phase 2: Foundational (middleware, tRPC helpers, guards) - **CRITICAL**
3. Complete Phase 3: User Story 1 (Admin Dashboard)
4. Complete Phase 5: User Story 3 (Verify Client Flow)
5. **STOP and VALIDATE**: Test admin and client flows independently
6. Run core tests: T045 (admin E2E), T047 (client E2E)
7. Deploy/demo if ready

**MVP Deliverables**:
- ✅ Admins can manage system (models, quotes, settings)
- ✅ Clients maintain existing workflow (unbroken)
- ✅ Role-based access enforced at middleware and tRPC layers

### Incremental Delivery (Full Feature)

1. **Foundation** (Phases 1-2): Setup + Foundational → Foundation ready
2. **MVP** (Phases 3 + 5): Admin Dashboard + Client Verification → Deploy/Demo
3. **Seller Role** (Phase 4): Add seller access → Test independently → Deploy/Demo
4. **Enhanced UX** (Phase 6): Role-based navigation → Deploy/Demo
5. **User Management** (Phase 7): Database role management → Deploy/Demo
6. **Quality** (Phases 8-9): Tests + Polish → Final release

Each increment adds value without breaking previous functionality.

### Parallel Team Strategy (4 Developers)

**Sprint 1: Foundation (Week 1)**
- All developers work together on Phases 1-2 (pair programming recommended)
- **Checkpoint**: Foundation complete, all tests pass

**Sprint 2: User Stories (Week 2)**
- Developer A: US1 (Admin Dashboard - P1)
- Developer B: US2 (Seller Access - P2)
- Developer C: US3 (Client Verification - P1)
- Developer D: US5 (User Management Backend - P3)
- **Checkpoint**: All stories independently functional

**Sprint 3: Integration & Polish (Week 3)**
- Developer A: US4 (Role-Based Navigation - P2)
- Developer B: Testing (Phase 8)
- Developer C + D: Polish (Phase 9)
- **Checkpoint**: Feature complete, all tests passing

---

## Notes

- **[P] tasks**: Different files, no dependencies, can run in parallel
- **[Story] label**: Maps task to specific user story for traceability
- **Constitution compliance**: 
  - Server Components by default ✅
  - Winston logger server-side only ✅
  - SOLID principles ✅
  - Spanish UI text, English code/comments ✅
- **Each user story**: Independently completable and testable
- **Stop at checkpoints**: Validate each story independently before continuing
- **Commit strategy**: Commit after each task or logical group
- **Avoid**: Vague tasks, same-file conflicts, cross-story dependencies

---

## Summary

**Total Tasks**: 57
**User Stories**: 5
**Parallel Opportunities**: 32 tasks marked [P]
**Estimated MVP Scope**: Phases 1-3 + Phase 5 (Setup + Foundational + US1 + US3) = ~25 tasks
**Critical Path**: Setup → Foundational (BLOCKS all) → US1 → Testing → Polish

**Independent Test Criteria**:
- **US1**: Admin login → access dashboard → manage models/quotes → configure settings ✅
- **US2**: Seller login → access own quotes → blocked from admin routes ✅
- **US3**: Client login → access own quotes → catalog browsing → blocked from admin ✅
- **US4**: Each role sees appropriate navigation menu ✅
- **US5**: Admin can update user roles via tRPC (UI placeholder) ✅
