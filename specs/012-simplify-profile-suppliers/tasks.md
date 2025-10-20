# Tasks: Simplify Profile Suppliers with SOLID Pattern

**Input**: Design documents from `/specs/012-simplify-profile-suppliers/`  
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md  
**Branch**: `012-simplify-profile-suppliers`

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

---

## Format: `[ID] [P?] [Story] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Validate existing infrastructure and prepare for refactoring

- [x] T001 Verify branch `012-simplify-profile-suppliers` is checked out
- [x] T002 Run `pnpm install` to ensure all dependencies are installed
- [x] T003 [P] Verify PostgreSQL is running and database is accessible
- [x] T004 [P] Run `pnpm db:generate` to generate Prisma Client
- [x] T005 [P] Run `pnpm typecheck` to verify TypeScript setup
- [x] T006 Create `_hooks/` directory in `src/app/(dashboard)/admin/profile-suppliers/`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Review reference implementation and existing code before starting user stories

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T007 Review Services module pattern in `src/app/(dashboard)/admin/services/_components/`
- [x] T008 Review Services hooks in `src/app/(dashboard)/admin/services/_hooks/`
- [x] T009 Review existing tRPC procedures in `src/server/api/routers/admin/profile-supplier.ts`
- [x] T010 Review existing validation schema in `src/lib/validations/admin/profile-supplier.schema.ts`
- [x] T011 Review current profile-supplier-form.tsx implementation (247 lines)
- [x] T012 Review DeleteConfirmationDialog component in `src/app/_components/delete-confirmation-dialog.tsx`
- [x] T013 Review Empty state components in `src/components/ui/empty.tsx`

**Checkpoint**: Foundation reviewed - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Quick Profile Supplier Management (Priority: P1) 🎯 MVP

**Goal**: Enable CRUD operations via dialog modals without page navigation, reducing create time from 45s to <20s

**Independent Test**: Admin can create, edit, and delete profile suppliers entirely from the list page using dialog modals, completing all operations in under 30 seconds each

### Implementation for User Story 1

- [x] T014 [P] [US1] Create `useProfileSupplierForm` hook in `src/app/(dashboard)/admin/profile-suppliers/_hooks/use-profile-supplier-form.ts` (form state management with React Hook Form + Zod)
- [x] T015 [P] [US1] Create `useProfileSupplierMutations` hook in `src/app/(dashboard)/admin/profile-suppliers/_hooks/use-profile-supplier-mutations.ts` (create, update, delete mutations with SSR cache invalidation)
- [x] T016 [US1] Create `ProfileSupplierDialog` component in `src/app/(dashboard)/admin/profile-suppliers/_components/profile-supplier-dialog.tsx` (dialog modal with form, <200 lines)
- [x] T017 [US1] Update `profile-supplier-list.tsx` to use dialog modal instead of navigation (add dialog state, remove navigation functions)
- [x] T018 [US1] Implement optimistic delete with rollback in `useProfileSupplierMutations` hook
- [x] T019 [US1] Add Empty state UI using `@/components/ui/empty` when list is empty
- [x] T020 [US1] Test create operation - dialog opens, form submits, supplier appears in list without navigation
- [x] T021 [US1] Test edit operation - dialog opens with pre-filled data, updates reflect immediately
- [x] T022 [US1] Test delete operation with confirmation dialog - supplier removed with optimistic update
- [x] T023 [US1] Verify SSR cache invalidation (invalidate + router.refresh) after mutations
- [x] T024 [US1] Verify loading states and toast notifications work correctly

**Checkpoint**: At this point, User Story 1 should be fully functional - all CRUD operations work via dialog modals

**✅ REFACTORING COMPLETADO**: Se implementó exitosamente el patrón server-optimized siguiendo el estándar de Services:
- ✅ page.tsx: SSR con `force-dynamic` y lectura de searchParams (Next.js 15 Promise pattern)
- ✅ profile-supplier-content.tsx: Wrapper client para manejo de estado de dialogs
- ✅ profile-supplier-filters.tsx: Componente de filtros con URL sync via TableSearch/TableFilters
- ✅ profile-supplier-list.tsx: Tabla con optimistic delete, URL-based pagination
- ✅ profile-supplier-empty.tsx: Empty state con mensajes condicionales
- ✅ TypeScript: 0 errores en modo strict
- ✅ Patrón URL: Todos los filtros se reflejan en searchParams (page, search, materialType, isActive)
- ✅ SSR Cache: Invalidación two-step (invalidate + router.refresh)
- ✅ Mutations: Delete con optimistic UI y rollback en error
- ✅ Dialog: Create/Edit manejado en Content, no navegación a páginas separadas



---

## Phase 4: User Story 2 - Improved Code Maintainability (Priority: P1)

**Goal**: Refactor code to follow SOLID principles, reducing component from 247 to <200 lines with testable hooks

**Independent Test**: Form logic, mutation logic, and UI can be tested independently. New developers can understand component structure in under 5 minutes

**Note**: User Story 2 is achieved through the implementation of User Story 1 (the SOLID refactoring IS the maintainability improvement)

### Validation for User Story 2

- [ ] T025 [P] [US2] Verify `useProfileSupplierForm` hook is under 100 lines
- [ ] T026 [P] [US2] Verify `useProfileSupplierMutations` hook is under 100 lines
- [ ] T027 [P] [US2] Verify `ProfileSupplierDialog` component is under 200 lines
- [ ] T028 [US2] Verify component only handles UI composition (no business logic)
- [ ] T029 [US2] Verify TypeScript strict mode passes for all new files
- [ ] T030 [US2] Create architecture documentation in `src/app/(dashboard)/admin/profile-suppliers/_components/README.md`

**Checkpoint**: Code quality metrics verified - architecture is clean and maintainable

---

## Phase 5: User Story 3 - Consistent UX Across Admin Modules (Priority: P2)

**Goal**: Ensure profile suppliers uses same interaction patterns as Services module

**Independent Test**: Admin can perform create/edit/delete operations using exact same interaction pattern as services module

### Implementation for User Story 3

- [ ] T031 [US3] Compare dialog layout between profile-suppliers and services modules
- [ ] T032 [US3] Ensure button positions match Services module (Primary action right, Cancel left)
- [ ] T033 [US3] Ensure form field layout matches Services module conventions
- [ ] T034 [US3] Verify delete confirmation dialog uses identical copy structure as Services
- [ ] T035 [US3] Verify toast messages follow same pattern as Services module
- [ ] T036 [US3] Test complete user flow side-by-side with Services module

**Checkpoint**: UX consistency verified - profile-suppliers matches Services module interaction pattern

---

## Phase 6: Cleanup & Removal (Code Hygiene)

**Purpose**: Remove deprecated code and perform complete cleanup per FR-016

- [ ] T037 Remove `src/app/(dashboard)/admin/profile-suppliers/new/` directory and all contents
- [ ] T038 Remove `src/app/(dashboard)/admin/profile-suppliers/[id]/` directory and all contents
- [ ] T039 Remove `src/app/(dashboard)/admin/profile-suppliers/_components/profile-supplier-form.tsx`
- [ ] T040 Remove navigation-related imports from `profile-supplier-list.tsx` (useRouter, usePathname, etc.)
- [ ] T041 Remove navigation functions/constants from `profile-supplier-list.tsx` (handleEdit, handleCreate paths)
- [ ] T042 Review shared components for exclusive profile-suppliers usage (check if any need removal)
- [ ] T043 Run `pnpm lint:fix` to clean up unused imports across all files
- [ ] T044 Verify no TypeScript errors after cleanup with `pnpm typecheck`

**Checkpoint**: All deprecated code removed - codebase is clean

---

## Phase 7: Testing & Quality Assurance

**Purpose**: Comprehensive testing of the refactored implementation

- [ ] T045 [P] Update E2E tests in `e2e/admin/profile-suppliers.spec.ts` for dialog pattern
- [ ] T046 [P] Test edge case: submit form while network is slow (verify loading state)
- [ ] T047 [P] Test edge case: create/update mutation fails (verify error toast, dialog stays open)
- [ ] T048 [P] Test edge case: close dialog with unsaved changes (verify no confirmation)
- [ ] T049 [P] Test edge case: edit supplier deleted by another admin (verify error + list refresh)
- [ ] T050 [P] Test edge case: form validation fails (verify inline errors, prevent submission)
- [ ] T051 [P] Test edge case: delete last supplier (verify empty state with message + CTA)
- [ ] T052 Test form validation: name (3-100 chars, required)
- [ ] T053 Test form validation: materialType (required, valid enum)
- [ ] T054 Test form validation: notes (max 500 chars, optional)
- [ ] T055 Verify no console errors or warnings in browser during all operations
- [ ] T056 Verify no Winston logger usage in client components (use grep search)

**Checkpoint**: All tests passing - implementation is production-ready

---

## Phase 8: Polish & Documentation

**Purpose**: Final improvements and documentation

- [ ] T057 [P] Review all Spanish UI text for consistency (es-LA)
- [ ] T058 [P] Verify all code comments and variable names are in English
- [ ] T059 Update `CHANGELOG.md` with refactoring summary
- [ ] T060 Verify quickstart.md instructions work end-to-end
- [ ] T061 Run full test suite: `pnpm test && pnpm test:e2e`
- [ ] T062 Performance check: measure create/edit/delete times (should meet SC-001, SC-002, SC-003)
- [ ] T063 Final code review: verify SOLID principles, SSR patterns, constitution compliance

**Checkpoint**: Feature complete and ready for PR

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Story 1 (Phase 3)**: Depends on Foundational phase - Core implementation
- **User Story 2 (Phase 4)**: Achieved through US1 implementation - Validation only
- **User Story 3 (Phase 5)**: Depends on US1 completion - Consistency checks
- **Cleanup (Phase 6)**: Depends on US1 completion - Safe to remove old code
- **Testing (Phase 7)**: Depends on US1 + Cleanup completion
- **Polish (Phase 8)**: Depends on all previous phases

### User Story Dependencies

- **User Story 1 (P1)**: Independent - Can start after Foundational phase
- **User Story 2 (P1)**: Dependent on US1 - Validation tasks only (no additional implementation)
- **User Story 3 (P2)**: Dependent on US1 - Consistency verification only

### Critical Path

1. Setup (T001-T006)
2. Foundational (T007-T013)
3. **User Story 1 Implementation** (T014-T024) ← CRITICAL MVP
4. User Story 2 Validation (T025-T030)
5. Cleanup (T037-T044)
6. Testing (T045-T056)
7. Polish (T057-T063)

### Parallel Opportunities

**Phase 1 Setup**:
- T003, T004, T005 can run in parallel

**Phase 2 Foundational**:
- All review tasks (T007-T013) can run in parallel

**Phase 3 User Story 1**:
- T014 and T015 can run in parallel (different hooks)
- T020, T021, T022 can run in parallel (different test scenarios)

**Phase 4 User Story 2**:
- T025, T026, T027 can run in parallel (different files to check)

**Phase 5 User Story 3**:
- All comparison tasks (T031-T036) can be done in parallel

**Phase 6 Cleanup**:
- T037, T038, T039 can run in parallel (different directories)

**Phase 7 Testing**:
- All edge case tests (T046-T051) can run in parallel
- All validation tests (T052-T054) can run in parallel

**Phase 8 Polish**:
- T057, T058 can run in parallel (different types of text review)

---

## Parallel Example: User Story 1 Core Implementation

```bash
# Launch hook implementations in parallel:
- Task T014: Create useProfileSupplierForm hook
- Task T015: Create useProfileSupplierMutations hook

# Then create dialog (depends on both hooks):
- Task T016: Create ProfileSupplierDialog component

# Then update list and run tests in parallel:
- Task T017: Update profile-supplier-list.tsx
- Task T020: Test create operation
- Task T021: Test edit operation
- Task T022: Test delete operation
```

---

## Implementation Strategy

### MVP First (Recommended)

**Minimum Viable Product**: User Story 1 only (Phase 3)
- Tasks: T001-T024
- Delivers: Full CRUD via dialog modals
- Time estimate: 5-7 hours (from research.md)
- Value: Immediately improves UX (45s → 20s create time)

**After MVP**:
- Phase 4: Validate code quality metrics (30 minutes)
- Phase 5: Verify UX consistency (1 hour)
- Phase 6: Cleanup (1 hour)
- Phase 7: Testing (2 hours)
- Phase 8: Polish (1 hour)

**Total estimate**: 10-12 hours for complete feature

### Incremental Delivery

1. **Week 1**: Phases 1-3 (Setup + Foundational + US1) → MVP ready
2. **Week 1**: Phases 4-6 (Validation + Consistency + Cleanup) → Code quality complete
3. **Week 2**: Phases 7-8 (Testing + Polish) → Production ready

### Success Metrics

- [ ] Admin can create supplier in <20 seconds (SC-001)
- [ ] Admin can edit supplier in <15 seconds (SC-002)
- [ ] Admin can delete supplier in <10 seconds (SC-003)
- [ ] Form hook is <100 lines (SC-004)
- [ ] Mutations hook is <100 lines (SC-005)
- [ ] Dialog component is <200 lines (SC-006)
- [ ] List updates immediately after mutations (SC-007)
- [ ] Zero navigation to separate pages (SC-008)
- [ ] 100% consistency with Services module (SC-009)
- [ ] New developers understand structure in <5 minutes (SC-010)

---

**Total Tasks**: 63  
**MVP Tasks**: 24 (T001-T024)  
**Parallel Opportunities**: 18 tasks marked [P]  
**Estimated Time**: 10-12 hours total, 5-7 hours for MVP
