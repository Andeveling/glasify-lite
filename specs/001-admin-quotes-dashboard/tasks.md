# Tasks: Admin Quotes Dashboard

**Feature**: 001-admin-quotes-dashboard  
**Input**: Design documents from `/specs/001-admin-quotes-dashboard/`  
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅

**Constitution Compliance**: Tasks follow principles from `.specify/memory/constitution.md`:
- **Server-First Performance**: Admin routes use `force-dynamic`, no ISR
- **One Job, One Place**: Components < 100 lines, constants extracted, no business logic in UI
- **Security From the Start**: Middleware + tRPC auth, Zod validation
- **Track Everything Important**: Winston logger server-side only (NEVER in Client Components)
- **Flexible Testing**: Tests created for critical paths before merge

**Tests**: Not explicitly requested in spec, but E2E tests for critical paths are REQUIRED before merge

**Organization**: Tasks grouped by user story to enable independent implementation and testing

---

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3...)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and folder structure

- [X] T001 Create feature branch `001-admin-quotes-dashboard` from develop
- [X] T002 [P] Create folder structure `src/app/(dashboard)/admin/quotes/_components/`
- [X] T003 [P] Create folder structure `src/app/(dashboard)/admin/quotes/_constants/`
- [X] T004 [P] Create folder structure `src/app/(dashboard)/admin/quotes/_types/`
- [X] T005 [P] Create folder structure `src/app/(dashboard)/admin/quotes/[quoteId]/_components/`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story implementation

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T006 [P] Create TypeScript types in `src/app/(dashboard)/admin/quotes/_types/quote-list.types.ts`
  - QuoteListItem type (from data-model.md)
  - QuoteListFilters type
  - UserContactInfo type
- [X] T007 [P] Create status constants in `src/app/(dashboard)/admin/quotes/_constants/quote-status.constants.ts`
  - QUOTE_STATUS_CONFIG with labels, variants, icons
  - Spanish labels: Borrador, Enviada, Cancelada
  - Icons from lucide-react: Clock, Send, X
- [X] T008 [P] Create filter constants in `src/app/(dashboard)/admin/quotes/_constants/quote-filters.constants.ts`
  - FILTER_OPTIONS array
  - DEFAULT_PAGE_LIMIT constant
  - SORT_OPTIONS array
- [X] T009 Update tRPC router in `src/server/api/routers/quote.ts`
  - ✅ user.name search already exists in list-all (lines 764-770)
  - ✅ Added user select to get-by-id (id, name, email, role)
  - Note: contactPhone comes from Quote.contactPhone, not User.phone
- [X] T010 Run typecheck (`pnpm typecheck`) to verify all changes

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - View All Quotes (Priority: P1) 🎯 MVP

**Goal**: Admin can view complete list of all system quotes in new `/admin/quotes` route

**Independent Test**: Navigate to `/admin/quotes` as admin → see quotes from multiple users, not just own quotes

### Implementation for User Story 1

- [X] T011 [P] [US1] Create main list Server Component in `src/app/(dashboard)/admin/quotes/page.tsx`
  - ✅ Export `dynamic = 'force-dynamic'` (SSR for admin routes)
  - ✅ Fetch data via `api.quote['list-all']` with filters from searchParams
  - ✅ Pass initialData to client components
  - ✅ Header with title "Cotizaciones" and description
- [X] T012 [P] [US1] Create quote list container in `src/app/(dashboard)/admin/quotes/_components/quote-list.tsx`
  - ✅ Accept quotes array as prop
  - ✅ Map over quotes, render QuoteListItem for each
  - ✅ Handle empty state
- [X] T013 [P] [US1] Create quote list item component in `src/app/(dashboard)/admin/quotes/_components/quote-list-item.tsx`
  - ✅ Display: projectName, total, createdAt, user name
  - ✅ Link to detail page: `/admin/quotes/[quoteId]`
  - ✅ UI-only component (58 lines)
- [X] T014 [P] [US1] Create empty state component in `src/app/(dashboard)/admin/quotes/_components/quotes-empty-state.tsx`
  - ✅ Spanish message: "No hay cotizaciones"
  - ✅ Icon from lucide-react (FileText)
- [ ] T015 [US1] Test US1: Navigate to `/admin/quotes` as admin, verify all system quotes visible

**Checkpoint**: User Story 1 complete - admin can view all quotes in new route

---

## Phase 4: User Story 2 - Differentiate by Status (Priority: P1)

**Goal**: Visual differentiation of quote states via color-coded badges

**Independent Test**: View quotes list → identify each quote's status by badge color/icon without reading text

### Implementation for User Story 2

- [X] T016 [P] [US2] Create status badge component in `src/app/(dashboard)/admin/quotes/_components/quote-status-badge.tsx`
  - ✅ Accept status prop: 'draft' | 'sent' | 'canceled'
  - ✅ Map to QUOTE_STATUS_CONFIG (constants)
  - ✅ Render Shadcn Badge with variant + icon + Spanish label
  - ✅ Component < 50 lines (33 lines)
- [X] T017 [P] [US2] Create expiration badge component in `src/app/(dashboard)/admin/quotes/_components/quote-expiration-badge.tsx`
  - ✅ Accept validUntil prop (Date | null)
  - ✅ Compute isExpired: validUntil < now
  - ✅ Render warning badge if expired
  - ✅ Spanish label: "Expirada"
- [X] T018 [US2] Integrate badges into QuoteListItem component
  - ✅ Import QuoteStatusBadge and QuoteExpirationBadge
  - ✅ Render status badge for all quotes
  - ✅ Render expiration badge conditionally
- [ ] T019 [US2] Test US2: View quotes → identify status by badge color in < 2 seconds

**Checkpoint**: User Story 2 complete - quotes visually differentiated by status

---

## Phase 5: User Story 3 - Filter by Status (Priority: P2)

**Goal**: Allow filtering quotes by specific status (draft/sent/canceled)

**Independent Test**: Click "Solo Borradores" filter → see only draft quotes, counter updates

### Implementation for User Story 3

- [X] T020 [P] [US3] Create filters component in `src/app/(dashboard)/admin/quotes/_components/quotes-filters.tsx`
  - ✅ Use FILTER_OPTIONS from constants
  - ✅ Update URL searchParams on filter change
  - ✅ Highlight active filter
  - ✅ Spanish labels from constants
- [X] T021 [US3] Integrate filters into main page.tsx
  - ✅ Place filters below header, above list
  - ✅ Pass current status from searchParams as active
- [ ] T022 [US3] Test US3: Apply status filter → only matching quotes shown, pagination updates

**Checkpoint**: User Story 3 complete - quotes filterable by status

---

## Phase 6: User Story 4 - View Owner with Role (Priority: P2)

**Goal**: Display quote creator name + role badge (Admin/Seller only)

**Independent Test**: View quotes → see creator name + role badge for admin/seller users

### Implementation for User Story 4

- [X] T023 [P] [US4] Create role badge component in `src/app/(dashboard)/admin/quotes/_components/quote-role-badge.tsx`
  - ✅ Accept role prop: 'admin' | 'seller' | 'user'
  - ✅ Show badge ONLY for admin/seller (return null for user)
  - ✅ Spanish labels: "Admin", "Vendedor"
  - ✅ Different variant for each role
- [X] T024 [US4] Integrate role badge into QuoteListItem
  - ✅ Display user.name (or email fallback if name null)
  - ✅ Display QuoteRoleBadge next to name
- [ ] T025 [US4] Test US4: View quotes → see creator name + role badge for admin/seller, no badge for user role

**Checkpoint**: User Story 4 complete - quote ownership visible with role

---

## Phase 7: User Story 5 - Sort by Metrics (Priority: P3)

**Goal**: Allow sorting quotes by creation date, total amount, or expiration date

**Independent Test**: Change sort to "Mayor Monto" → quotes reorder with highest total first

### Implementation for User Story 5

- [X] T026 [P] [US5] Create sort controls component in `src/app/(dashboard)/admin/quotes/_components/quote-sort-controls.tsx`
  - ✅ Use SORT_OPTIONS from constants
  - ✅ Update URL searchParams: sortBy + sortOrder
  - ✅ Dropdown UI with Select component
  - ✅ Spanish labels: "Más Recientes", "Mayor Monto", etc.
- [X] T027 [US5] Integrate sort controls into main page.tsx
  - ✅ Place near filters (same row)
  - ✅ Pass current sortBy/sortOrder from searchParams
- [ ] T028 [US5] Test US5: Change sort option → quotes reorder correctly

**Checkpoint**: User Story 5 complete - quotes sortable by multiple criteria

---

## Phase 8: User Story 7 - Contact Info in Detail (Priority: P2)

**Goal**: Display user contact information (email + phone) in quote detail view

**Independent Test**: Open quote detail → see "Información del Creador" section with email (clickable) and phone

### Implementation for User Story 7

- [X] T029 [P] [US7] Create contact info component in `src/app/(dashboard)/admin/quotes/[quoteId]/_components/user-contact-info.tsx`
  - ✅ Accept user prop (UserContactInfo | null)
  - ✅ Display name (or email fallback)
  - ✅ Mailto link for email
  - ✅ Tel link for phone (if available)
  - ✅ Role badge
  - ✅ Handle deleted user: "Usuario desconocido"
- [X] T030 [P] [US7] Create quote detail page in `src/app/(dashboard)/admin/quotes/[quoteId]/page.tsx`
  - ✅ Export `dynamic = 'force-dynamic'`
  - ✅ Fetch quote via `api.quote['get-by-id']`
  - ✅ Updated tRPC schema to include user + projectName
  - ✅ Render UserContactInfo component
  - ✅ Render basic quote details
- [ ] T031 [US7] Test US7: Open quote detail → see contact section with email + phone, click email opens mailto

**Checkpoint**: User Story 7 complete - user contact info visible in detail view

---

## Phase 9: User Story 8 - Search by Project/User (Priority: P3)

**Goal**: Search quotes by project name OR user name

**Independent Test**: Type "Torre" in search → see quotes with "Torre" in project name OR user name

### Implementation for User Story 8

- [X] T032 [P] [US8] Create search component in `src/app/(dashboard)/admin/quotes/_components/quotes-search.tsx`
  - ✅ Debounced input (300ms) to reduce server load
  - ✅ Update URL searchParams on change
  - ✅ Clear button when search active
  - ✅ Spanish placeholder: "Buscar por proyecto o usuario"
- [X] T033 [US8] Integrate search into main page.tsx
  - ✅ Place search below header
  - ✅ Pass current search value from searchParams
- [ ] T034 [US8] Test US8: Type search term → results filter to matching project names OR user names

**Checkpoint**: User Story 8 complete - quotes searchable by project/user

---

## Phase 10: Pagination & Polish

**Goal**: Pagination controls with result counter, migration redirects, performance optimization

**Independent Test**: Navigate pages → URL updates, filters/search persist, counter shows "1-10 de 45"

### Implementation

- [X] T035 [P] Create pagination component in `src/app/(dashboard)/admin/quotes/_components/quotes-pagination.tsx`
  - ✅ Accept pagination metadata (total, totalPages, page, hasNext, hasPrev)
  - ✅ Previous/Next buttons
  - ✅ Page number display
  - ✅ Result counter: "Mostrando 1-10 de 45 cotizaciones"
  - ✅ Update URL searchParams on page change
- [X] T036 Integrate pagination into main page.tsx
  - ✅ Place at bottom of page
  - ✅ Pass pagination data from tRPC response
- [X] T037 [P] Create redirect page in `src/app/(public)/quotes/page.tsx`
  - ✅ Import redirect from 'next/navigation'
  - ✅ Redirect to '/admin/quotes'
  - ✅ Preserve search params if any (page, search, status)
- [X] T038 [P] Create redirect page in `src/app/(dashboard)/quotes/page.tsx`
  - ✅ Same as T037 (redirect to '/admin/quotes')
  - ✅ Preserves search params
- [ ] T039 Test pagination: Navigate pages → filters/search persist, counter updates correctly
- [ ] T040 Test redirects: Visit old routes → redirects to `/admin/quotes` with params preserved
  - Page number display
  - Result counter: "Mostrando 1-10 de 45 cotizaciones"
  - Update URL searchParams on page change
- [ ] T036 Integrate pagination into main page.tsx
  - Place at bottom of page
  - Pass pagination data from tRPC response
- [ ] T037 [P] Create redirect page in `src/app/(public)/quotes/page.tsx`
  - Import redirect from 'next/navigation'
  - Redirect to '/admin/quotes'
  - Preserve search params if any
- [ ] T038 [P] Create redirect page in `src/app/(dashboard)/quotes/page.tsx`
  - Same as T037 (redirect to '/admin/quotes')
- [ ] T039 Test pagination: Navigate pages → filters/search persist, counter updates correctly
- [ ] T040 Test redirects: Visit old routes → redirects to `/admin/quotes` with params preserved

**Checkpoint**: All user stories complete with pagination and migration handled

---

## Phase 11: Testing & Validation

**Purpose**: E2E tests for critical paths, final validation

**Tests REQUIRED before merge**

- [ ] T041 [P] Create E2E test file in `e2e/admin-quotes-dashboard.spec.ts`
- [ ] T042 [P] E2E Test: Admin can view all quotes
  - Login as admin
  - Navigate to /admin/quotes
  - Verify heading "Cotizaciones" visible
  - Verify quotes from multiple users shown
- [ ] T043 [P] E2E Test: Admin can filter by status
  - Navigate to /admin/quotes
  - Click "Enviada" filter
  - Verify URL contains `?status=sent`
  - Verify only sent quotes visible
- [ ] T044 [P] E2E Test: Admin can search by project name
  - Navigate to /admin/quotes
  - Type "Torre" in search
  - Verify URL contains `?search=Torre`
  - Verify results contain "Torre" in project or user name
- [ ] T045 [P] E2E Test: Pagination works correctly
  - Navigate to /admin/quotes with 20+ quotes
  - Click "Siguiente" button
  - Verify URL contains `?page=2`
  - Verify different quotes shown
  - Verify counter updates
- [ ] T046 [P] E2E Test: Quote detail shows contact info
  - Navigate to /admin/quotes
  - Click on a quote
  - Verify redirected to /admin/quotes/[quoteId]
  - Verify "Información del Creador" section visible
  - Verify email and phone (if available) shown
- [ ] T047 [P] E2E Test: Redirects from old routes work
  - Navigate to /quotes
  - Verify redirected to /admin/quotes
  - Navigate to /dashboard/quotes
  - Verify redirected to /admin/quotes
- [ ] T048 Run all E2E tests: `pnpm test:e2e`
- [ ] T049 Verify typecheck passes: `pnpm run typecheck`
- [ ] T050 Verify linting passes: `pnpm run lint`

**Checkpoint**: All tests passing, feature ready for code review

---

## Phase 12: Documentation & Deployment Prep

**Purpose**: Update changelog, documentation, prepare for merge

- [ ] T051 [P] Update CHANGELOG.md with feature entry
  - Version/date TBD
  - Entry: "feat: refactor quotes dashboard to /admin/quotes with enhanced filtering, search, and visual differentiation"
  - Link to spec: specs/001-admin-quotes-dashboard/
- [ ] T052 [P] Update user documentation (if exists in docs/)
  - Document new /admin/quotes route
  - Document filter/search/sort features
  - Document contact info in detail view
- [ ] T053 Verify all tasks.md checkboxes marked [X]
- [ ] T054 Create pull request from `001-admin-quotes-dashboard` to `develop`
  - Title: "feat: admin quotes dashboard with status differentiation"
  - Description: Link to spec.md, list user stories implemented
  - Request code review
- [ ] T055 Address code review feedback
- [ ] T056 Merge to develop after approval

**Checkpoint**: Feature merged to develop, ready for staging deployment

---

## Dependencies

### User Story Completion Order

```text
Phase 1: Setup (T001-T005)
   ↓
Phase 2: Foundational (T006-T010) ← BLOCKING FOR ALL USER STORIES
   ↓
   ├─→ US1: View All Quotes (T011-T015) ← MVP, can deploy alone
   │      ↓
   ├─→ US2: Status Badges (T016-T019) ← Depends on US1 (uses QuoteListItem)
   │      ↓
   ├─→ US3: Filters (T020-T022) ← Depends on US1 (filters the list)
   │
   ├─→ US4: Owner + Role (T023-T025) ← Depends on US1 (adds to QuoteListItem)
   │
   ├─→ US5: Sorting (T026-T028) ← Depends on US1 (reorders list)
   │
   ├─→ US7: Contact Info (T029-T031) ← Independent (detail page)
   │
   └─→ US8: Search (T032-T034) ← Depends on US1 (searches list)
        ↓
   Pagination & Polish (T035-T040) ← Depends on all list features
        ↓
   Testing (T041-T050) ← Validates all features
        ↓
   Documentation (T051-T056) ← Final steps
```

**Key Insights**:
- **US1 is the foundation**: All list-based user stories depend on it
- **US7 is independent**: Detail page can be implemented in parallel with list features
- **Foundational phase is blocking**: MUST complete before any user story work
- **MVP = US1 alone**: Could deploy just the list view as first increment

### Parallel Execution Opportunities

**After Phase 2 (Foundation)**:
- US1 (T011-T015) can start immediately
- US7 (T029-T031) can run in parallel with US1 (different files)

**After US1 Complete**:
- US2, US3, US4, US5, US8 can all run in parallel (different component files)
- Badge components (T016-T017, T023) are fully parallelizable
- Filters (T020), Sort (T026), Search (T032) are parallelizable

**Testing Phase**:
- All E2E tests (T042-T047) can run in parallel (different test scenarios)
- Documentation tasks (T051-T052) can run in parallel with tests

---

## Implementation Strategy

### MVP Scope (Minimal Viable Product)

**Recommendation**: Deliver US1 + US2 first (View All + Status Badges)

This provides immediate value:
- ✅ Admin can see all system quotes (not just own)
- ✅ Quotes visually differentiated by status
- ✅ New admin route established
- ✅ Migration path from old route

**MVP Tasks**: T001-T019 (19 tasks, ~4-6 hours for experienced dev)

### Incremental Delivery

**Iteration 1** (MVP): US1 + US2  
**Iteration 2**: US3 + US4 (Filters + Ownership)  
**Iteration 3**: US5 + US8 (Sorting + Search)  
**Iteration 4**: US7 + Pagination (Contact Info + Polish)  
**Iteration 5**: Testing + Documentation  

Each iteration delivers working, testable functionality.

---

## Summary

**Total Tasks**: 56  
**Task Distribution**:
- Setup: 5 tasks
- Foundational: 5 tasks (BLOCKING)
- US1 (P1): 5 tasks
- US2 (P1): 4 tasks
- US3 (P2): 3 tasks
- US4 (P2): 3 tasks
- US5 (P3): 3 tasks
- US7 (P2): 3 tasks
- US8 (P3): 3 tasks
- Pagination & Polish: 6 tasks
- Testing: 10 tasks
- Documentation: 6 tasks

**Parallel Opportunities**:
- 35 tasks marked [P] (62% parallelizable)
- After Foundation: 6 user stories can be worked on concurrently
- Testing phase: All 6 E2E tests can run in parallel

**Estimated Time** (experienced developer):
- Setup + Foundation: 1-2 hours
- User Stories (all): 6-8 hours
- Testing: 2-3 hours
- Documentation: 1 hour
- **Total**: 10-14 hours (or 2-3 days with reviews/breaks)

**Critical Path**: Setup → Foundation → US1 → (US2|US3|US4|US5|US8 in parallel) → Pagination → Testing → Docs

**Next Steps**: Run `/speckit.implement` to begin execution, or start manually with T001
