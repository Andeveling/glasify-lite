# Tasks: Standardize Glass Suppliers with SOLID Pattern

**Branch**: `013-standardize-glass-suppliers`  
**Input**: Design documents from `/specs/013-standardize-glass-suppliers/`  
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅, quickstart.md ✅

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

**Tests**: Test tasks are included as optional checkpoints. Per Pragmatic Testing Discipline, tests MAY be written before, during, or after implementation. However, tests MUST exist and pass before merging.

## Format: `[ID] [P?] [Story] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions
- Single Next.js Web Application
- Source: `src/app/(dashboard)/admin/glass-suppliers/`
- Hooks: `src/app/(dashboard)/admin/glass-suppliers/_hooks/`
- Unit tests: `tests/unit/glass-suppliers/`
- E2E tests: `e2e/admin/glass-suppliers.spec.ts`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Prepare workspace and verify prerequisites before refactoring

- [ ] T001 Verify existing tRPC procedures work correctly in `src/server/api/routers/admin/glass-supplier.ts`
- [ ] T002 Verify existing Zod schemas in `src/lib/validations/admin/glass-supplier.schema.ts`
- [ ] T003 [P] Review Services module pattern in `src/app/(dashboard)/admin/services/_components/` as primary reference
- [ ] T004 [P] Review Profile Suppliers module pattern in `src/app/(dashboard)/admin/profile-suppliers/_components/` as secondary reference
- [ ] T005 Create `_hooks/` directory in `src/app/(dashboard)/admin/glass-suppliers/_hooks/`

**Checkpoint**: Prerequisites verified - ready to extract hooks and create dialog component

---

## Phase 2: Foundational (No Blocking Prerequisites)

**Purpose**: N/A - This is a refactor of existing functionality, no new foundational work needed

**Note**: Skip this phase - all infrastructure (tRPC, Prisma, validation schemas) already exists

---

## Phase 3: User Story 1 - Quick Glass Supplier Management (Priority: P1) 🎯 MVP

**Goal**: Replace separate create/edit pages with dialog-based CRUD operations. Admin users can create, edit, and delete glass suppliers entirely from the list page using modals.

**Independent Test**: Admin can create a new supplier, edit an existing supplier, and delete a supplier (without relationships) entirely from the list page using dialog modals. Each operation completes in under 30 seconds with immediate list updates.

### Implementation for User Story 1

#### Step 1: Extract Form Hook

- [ ] T006 [US1] Create `useGlassSupplierForm` hook in `src/app/(dashboard)/admin/glass-suppliers/_hooks/use-glass-supplier-form.ts`
  - Setup React Hook Form with zodResolver
  - Handle mode: 'create' | 'edit'
  - Provide default values (empty for create, from props for edit)
  - Return form instance and submit handler
  - Target: <120 lines

#### Step 2: Extract Mutations Hook

- [ ] T007 [US1] Create `useGlassSupplierMutations` hook in `src/app/(dashboard)/admin/glass-suppliers/_hooks/use-glass-supplier-mutations.ts`
  - Setup tRPC mutations (create, update, delete)
  - Implement two-step cache invalidation (utils.invalidate + router.refresh)
  - Handle success/error toasts in Spanish
  - Implement optimistic delete with rollback on error
  - Provide loading states
  - Target: <120 lines

#### Step 3: Create Dialog Component

- [ ] T008 [US1] Create `GlassSupplierDialog` component in `src/app/(dashboard)/admin/glass-suppliers/_components/glass-supplier-dialog.tsx`
  - Props: open, onOpenChange, mode, defaultValues
  - Use shadcn/ui Dialog component
  - Compose useGlassSupplierForm and useGlassSupplierMutations hooks
  - Render 8-field form with sections: Basic Info, Contact Info, Additional
  - Use `max-h-[70vh] overflow-y-auto` for scrollable content
  - Handle dialog close (cancel, overlay click, Escape key, form success)
  - Target: <250 lines

#### Step 4: Update List Component

- [ ] T009 [US1] Modify `GlassSupplierList` component in `src/app/(dashboard)/admin/glass-suppliers/_components/glass-supplier-list.tsx`
  - Remove `handleCreateClick` and `handleEditClick` navigation logic
  - Add dialog state management (dialogOpen, dialogMode, selectedSupplier)
  - Update "New Supplier" button to open dialog in create mode
  - Update edit icons to open dialog in edit mode with supplier data
  - Render `<GlassSupplierDialog>` at bottom of component
  - Keep existing delete confirmation dialog

#### Step 5: Cleanup Deprecated Files

- [ ] T010 [US1] Remove deprecated create page directory `src/app/(dashboard)/admin/glass-suppliers/new/`
- [ ] T011 [US1] Remove deprecated edit page directory `src/app/(dashboard)/admin/glass-suppliers/[id]/`
- [ ] T012 [US1] Remove old form component `src/app/(dashboard)/admin/glass-suppliers/_components/glass-supplier-form.tsx`
- [ ] T013 [US1] Remove unused imports from `glass-supplier-list.tsx` (useRouter navigation, old form references)

### Tests for User Story 1 (Optional Checkpoints)

**Note**: Tests can be written during or after implementation. Must pass before merge.

#### Unit Tests

- [ ] T014 [P] [US1] Test `useGlassSupplierForm` hook in `tests/unit/glass-suppliers/use-glass-supplier-form.test.ts`
  - Test: Initializes with empty values in create mode
  - Test: Initializes with defaultValues in edit mode
  - Test: Validates required fields (name, code, country)
  - Test: Validates optional field formats (email, URL, phone)
  - Test: Prevents submission when form is invalid

- [ ] T015 [P] [US1] Test `useGlassSupplierMutations` hook in `tests/unit/glass-suppliers/use-glass-supplier-mutations.test.ts`
  - Test: Calls createMutation with correct data
  - Test: Calls updateMutation with id + data
  - Test: Invalidates cache on success
  - Test: Calls router.refresh on success
  - Test: Shows toasts for success/error

#### E2E Tests

- [ ] T016 [US1] Update E2E tests in `e2e/admin/glass-suppliers.spec.ts`
  - Test: Create glass supplier via dialog (open dialog, fill form, submit, verify success toast and list update)
  - Test: Edit glass supplier via dialog (open edit dialog, modify fields, submit, verify changes)
  - Test: Delete glass supplier with no relationships (click delete, confirm, verify removal)
  - Test: Show error when deleting supplier with related glass types (verify referential integrity error message)
  - Test: Close dialog with unsaved changes (no confirmation needed, form resets)
  - Test: Form validation errors (empty required fields, invalid email, invalid URL)

**Checkpoint User Story 1**: Dialog-based CRUD is fully functional. All operations work from list page. No separate pages needed.

---

## Phase 4: User Story 2 - Improved Code Maintainability (Priority: P1)

**Goal**: Ensure code follows SOLID principles with clean separation of concerns. Hooks are testable independently, component is focused on UI composition only.

**Independent Test**: New developers can understand the component structure in under 5 minutes by reading hook names. Form hook, mutations hook, and dialog component can each be tested independently. All three match the exact pattern used in Services and Profile Suppliers modules.

### Implementation for User Story 2

**Note**: Most implementation is already covered in User Story 1 (extracting hooks, creating dialog). This phase focuses on code quality validation.

#### Code Quality Checks

- [ ] T017 [US2] Validate `useGlassSupplierForm` hook is <120 lines
- [ ] T018 [US2] Validate `useGlassSupplierMutations` hook is <120 lines
- [ ] T019 [US2] Validate `GlassSupplierDialog` component is <250 lines (down from 354)
- [ ] T020 [US2] Verify dialog component has no business logic (only UI composition)
- [ ] T021 [US2] Verify hooks have single responsibility (form state vs mutations)
- [ ] T022 [US2] Verify no Winston logger usage in client components/hooks
- [ ] T023 [US2] Add JSDoc comments to exported hook functions

#### Pattern Consistency Checks

- [ ] T024 [US2] Compare glass-supplier-dialog.tsx with service-dialog.tsx structure
- [ ] T025 [US2] Compare useGlassSupplierForm with useServiceForm pattern
- [ ] T026 [US2] Compare useGlassSupplierMutations with useServiceMutations pattern
- [ ] T027 [US2] Verify dialog props match pattern (open, onOpenChange, mode, defaultValues)

#### Linting and Type Checking

- [ ] T028 [US2] Run `pnpm lint` and fix any issues
- [ ] T029 [US2] Run `pnpm typecheck` and fix any TypeScript errors
- [ ] T030 [US2] Run `pnpm lint:fix` for automatic formatting

**Checkpoint User Story 2**: Code quality validated. All files under target line counts. Pattern consistency confirmed.

---

## Phase 5: User Story 3 - Consistent UX Across Admin Modules (Priority: P2)

**Goal**: Ensure glass suppliers dialog provides identical UX to Services and Profile Suppliers modules. Visual consistency in layout, buttons, styling, and interaction patterns.

**Independent Test**: Admin users who have used Services or Profile Suppliers dialogs can use Glass Suppliers dialog without any learning curve. All button positions, form layouts, confirmation flows, and visual styling are identical.

### Implementation for User Story 3

**Note**: Visual consistency is achieved through reusing shadcn/ui components and following established patterns. This phase focuses on UX validation.

#### Visual Consistency Checks

- [ ] T031 [P] [US3] Verify dialog title format matches Services/Profile Suppliers ("Crear Proveedor" vs "Editar Proveedor")
- [ ] T032 [P] [US3] Verify button positions match pattern (Cancel left, Submit right in DialogFooter)
- [ ] T033 [P] [US3] Verify form field styling matches pattern (same Label, Input, FormMessage components)
- [ ] T034 [P] [US3] Verify loading state uses same spinner pattern (Loader2 icon in button)
- [ ] T035 [P] [US3] Verify toast notifications use same copy structure and position

#### Interaction Pattern Checks

- [ ] T036 [US3] Verify "New Supplier" button opens dialog (not page navigation)
- [ ] T037 [US3] Verify edit action opens dialog (not page navigation)
- [ ] T038 [US3] Verify delete confirmation uses DeleteConfirmationDialog component
- [ ] T039 [US3] Verify dialog closes on cancel/overlay/Escape (no unsaved changes warning)
- [ ] T040 [US3] Verify form submission closes dialog and shows success toast

#### Search and Filter Consistency

- [ ] T041 [P] [US3] Verify search input position matches Services/Profile Suppliers list pages
- [ ] T042 [P] [US3] Verify filter controls position matches pattern
- [ ] T043 [P] [US3] Verify empty state uses Empty component with icon variant

#### Manual QA

- [ ] T044 [US3] Perform side-by-side comparison with Services dialog (create flow)
- [ ] T045 [US3] Perform side-by-side comparison with Profile Suppliers dialog (edit flow)
- [ ] T046 [US3] Verify delete flow with referential integrity matches pattern (Spanish error message)

**Checkpoint User Story 3**: UX consistency validated. Glass Suppliers matches Services and Profile Suppliers in all visual and interaction patterns.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final improvements, documentation, and edge case handling

### Documentation

- [ ] T047 [P] Update CHANGELOG.md with refactor summary
- [ ] T048 [P] Add inline comments for complex logic in hooks
- [ ] T049 [P] Verify quickstart.md matches actual implementation

### Edge Case Handling

- [ ] T050 Verify slow network loading states (button spinner, disabled fields)
- [ ] T051 Verify error handling for mutation failures (toast with error message, dialog stays open)
- [ ] T052 Verify referential integrity error message in Spanish
- [ ] T053 Verify empty state when no suppliers exist ("No hay proveedores registrados")
- [ ] T054 Verify empty search results ("No se encontraron proveedores")
- [ ] T055 Verify optional fields display "—" when null in list

### Accessibility

- [ ] T056 [P] Test keyboard navigation (Tab, Shift+Tab, Escape, Enter)
- [ ] T057 [P] Test screen reader announcements (dialog title, form labels, error messages)
- [ ] T058 [P] Test focus management (trap in dialog, return to trigger on close)

### Performance

- [ ] T059 Verify dialog open time <200ms
- [ ] T060 Verify form submission time <1s (network dependent)
- [ ] T061 Verify list refresh time <500ms (SSR cache invalidation)

### Final Validation

- [ ] T062 Run full E2E test suite (`pnpm test:e2e`)
- [ ] T063 Run unit test suite (`pnpm test`)
- [ ] T064 Verify all CI gates pass (typecheck, lint, tests)
- [ ] T065 Create PR with title: `refactor(glass-suppliers): standardize with SOLID pattern`
- [ ] T066 Reference spec in PR description: `specs/013-standardize-glass-suppliers/spec.md`
- [ ] T067 Include before/after metrics in PR (354 lines → 3 files <250/<120/<120 lines)
- [ ] T068 Request code review from 1 team member

**Checkpoint Final**: All user stories complete and validated. Feature ready to merge.

---

## Dependencies & Execution Strategy

### Story Dependencies

```
Phase 1 (Setup)
  ↓
User Story 1 (P1) ← MVP: Dialog-based CRUD ← BLOCKS User Story 2 & 3
  ↓
User Story 2 (P1) ← Code Quality (validates US1 implementation)
  ↓
User Story 3 (P2) ← UX Consistency (validates US1 visual design)
  ↓
Phase 6 (Polish)
```

**Dependency Rules**:
- **User Story 1** must be complete before User Story 2 or 3 (US2 and US3 validate US1)
- **User Story 2** and **User Story 3** can run in parallel (different concerns)
- **Phase 6** runs last (cross-cutting concerns)

### Parallel Execution Opportunities

#### Within User Story 1 (Phase 3)
After T005 (create _hooks/ directory):
- T006 (form hook) + T007 (mutations hook) can run in parallel
- T014 (form tests) + T015 (mutations tests) can run in parallel

After T008 (dialog component created):
- T010, T011, T012, T013 (cleanup tasks) can all run in parallel

After T009 (list component updated):
- T014 (form tests) + T015 (mutations tests) + T016 (E2E tests) can run in parallel

#### Within User Story 2 (Phase 4)
After US1 complete:
- T017-T023 (code quality checks) can run in parallel
- T024-T027 (pattern consistency checks) can run in parallel

#### Within User Story 3 (Phase 5)
After US1 complete:
- T031-T035 (visual checks) can run in parallel
- T041-T043 (search/filter checks) can run in parallel

#### Within Phase 6 (Polish)
- T047-T049 (documentation) can run in parallel
- T050-T055 (edge cases) can run in parallel
- T056-T058 (accessibility) can run in parallel

### Suggested MVP Scope

**Minimum Viable Product** = User Story 1 only (T001-T016)

**Rationale**:
- Delivers core value: dialog-based CRUD replaces page navigation
- Independently testable: all acceptance scenarios in US1 can be verified
- User Story 2 and 3 are code quality/UX validations (important but not blocking MVP)

**MVP Timeline**: ~8-10 hours
- Setup: 1 hour (T001-T005)
- Hook extraction: 2 hours (T006-T007)
- Dialog component: 3 hours (T008)
- List update: 1 hour (T009)
- Cleanup: 0.5 hours (T010-T013)
- Tests: 2-3 hours (T014-T016)

**Post-MVP**: User Story 2 + 3 + Polish: ~3 hours additional

**Total Timeline**: 11-13 hours (matches quickstart.md estimate)

---

## Task Metrics

**Total Tasks**: 68
- Phase 1 (Setup): 5 tasks
- Phase 2 (Foundational): 0 tasks (skip)
- Phase 3 (User Story 1): 11 implementation + 3 test tasks = 14 tasks
- Phase 4 (User Story 2): 14 tasks
- Phase 5 (User Story 3): 16 tasks
- Phase 6 (Polish): 22 tasks

**Task Distribution by User Story**:
- User Story 1 (P1): 14 tasks (MVP)
- User Story 2 (P1): 14 tasks (Code Quality)
- User Story 3 (P2): 16 tasks (UX Consistency)
- Cross-cutting: 24 tasks (Setup + Polish)

**Parallelizable Tasks**: 31 tasks marked with [P]

**Independent Test Criteria**:
- User Story 1: Admin can create, edit, delete suppliers via dialog from list page
- User Story 2: Developers can understand code structure in <5 minutes, hooks testable independently
- User Story 3: Glass Suppliers UX identical to Services and Profile Suppliers modules

---

## Format Validation

✅ All tasks follow required format: `- [ ] [ID] [P?] [Story?] Description with file path`
✅ All user story tasks include [US1], [US2], or [US3] labels
✅ All parallelizable tasks marked with [P]
✅ All task IDs sequential (T001-T068)
✅ All tasks include file paths where applicable
✅ Independent test criteria defined for each user story
✅ MVP scope clearly identified (User Story 1)
✅ Dependencies documented
✅ Parallel execution opportunities identified

**Status**: Ready for implementation ✅
