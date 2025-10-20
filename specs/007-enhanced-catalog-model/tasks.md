---
description: "Task breakdown for Enhanced Catalog Model Sidebar Information"
---

# Tasks: Enhanced Catalog Model Sidebar Information

**Input**: Design documents from `/specs/007-enhanced-catalog-model/`
**Prerequisites**: ✅ plan.md, ✅ spec.md, ✅ research.md, ✅ data-model.md, ✅ contracts/

**Tests**: Tests are included for all user stories following "Pragmatic Testing Discipline" (constitution). Tests MAY be written during or after implementation but MUST exist before merge. Test-first approach is NOT mandatory.

**Organization**: Tasks are grouped by user story (P1-P3) to enable independent implementation and testing of each increment.

## Format: `[ID] [P?] [Story] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3, US4, US5)
- Exact file paths included in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Verify existing infrastructure and prepare for feature development

- [x] T001 [P] Verify ProfileSupplier.materialType is populated in database via Prisma Studio (`pnpm db:studio`)
- [x] T002 [P] Verify TenantConfig singleton exists and has valid currency configuration
- [x] T003 [P] Start development server and verify existing catalog page loads (`pnpm dev`, navigate to `/catalog/[modelId]`)

**Checkpoint**: Environment ready - no data quality issues blocking development

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core schema and type changes that ALL user stories depend on

**⚠️ CRITICAL**: No user story implementation can begin until this phase is complete

- [x] T004 Extend `modelDetailOutput` Zod schema to include `materialType` in `profileSupplier` object in `src/server/api/routers/catalog/catalog.schemas.ts`
- [x] T005 Update tRPC `get-model-by-id` query to select `materialType` from ProfileSupplier in `src/server/api/routers/catalog/catalog.queries.ts`
- [x] T006 [P] Create `MaterialType` type and `ProfileSupplier` type in `src/app/(public)/catalog/[modelId]/_types/model.types.ts`
- [x] T007 [P] Create material benefits mapping utilities in `src/app/(public)/catalog/[modelId]/_utils/material-benefits.ts` (MATERIAL_BENEFITS, MATERIAL_PERFORMANCE, formatPerformanceRating)
- [x] T008 Update `Model` type to use `ProfileSupplier` object instead of string in `src/app/(public)/catalog/[modelId]/_types/model.types.ts`
- [x] T009 Update `adaptModelFromServer` to map `profileSupplier` object with `materialType` in `src/app/(public)/catalog/[modelId]/_utils/adapters.ts`

**Checkpoint**: Foundation ready - schema extended, types updated, utilities available for all user stories

---

## Phase 3: User Story 1 - View Technical Specifications (Priority: P1) 🎯 MVP

**Goal**: Display technical specifications card showing material type, profile series, and performance characteristics

**Independent Test**: Navigate to any model detail page, verify sidebar displays "Especificaciones Técnicas" card with material type, insulation ratings (stars + Spanish labels), and dimensional constraints

### Tests for User Story 1

- [x] T010 [P] [US1] Unit test for material benefits lookup in `tests/unit/catalog/material-benefits.test.ts` (test MATERIAL_BENEFITS mapping, formatPerformanceRating function)
- [x] T011 [P] [US1] Integration test for enhanced tRPC query with ProfileSupplier.materialType in `tests/integration/catalog/get-model-enhanced.test.ts`

### Implementation for User Story 1

- [x] T012 [US1] Create `ModelSpecifications` component in `src/app/(public)/catalog/[modelId]/_components/model-specifications.tsx` (Client Component: displays material badge, performance ratings with stars, technical specs)
- [x] T013 [US1] Add `ModelSpecifications` card to `ModelSidebar` orchestrator in `src/app/(public)/catalog/[modelId]/_components/model-sidebar.tsx`
- [x] T014 [US1] Update `adaptModelFromServer` to include material-based features in features array using MATERIAL_BENEFITS utility

**Checkpoint**: Technical specifications card displays with material type, performance ratings, and dimensional info

---

## Phase 4: User Story 2 - Understand Profile Supplier Details (Priority: P1) 🎯 MVP

**Goal**: Display profile supplier name, material type, and supplier characteristics prominently in sidebar

**Independent Test**: View model detail page with assigned ProfileSupplier, verify "Proveedor de Perfiles" card shows supplier name, material badge, and material-specific benefits. Test with NULL supplier shows "Proveedor no especificado"

### Tests for User Story 2

- [x] T015 [P] [US2] E2E test for ProfileSupplierCard rendering in `e2e/catalog/model-detail-sidebar.spec.ts` (test with supplier present, test with supplier NULL)

### Implementation for User Story 2

- [x] T016 [US2] Create `ProfileSupplierCard` component in `src/app/(public)/catalog/[modelId]/_components/profile-supplier-card.tsx` (Client Component: displays supplier name, material badge, material benefits list, handles NULL gracefully)
- [x] T017 [US2] Add `ProfileSupplierCard` to `ModelSidebar` orchestrator in `src/app/(public)/catalog/[modelId]/_components/model-sidebar.tsx`

**Checkpoint**: Profile supplier information displays with material characteristics, gracefully handles missing data

---

## Phase 5: User Story 3 - Review Product Features and Benefits (Priority: P2)

**Goal**: Display practical benefits and features beyond raw specs to help users understand product value

**Independent Test**: Navigate to model page, verify "Características Destacadas" section shows 4-8 feature bullets describing practical benefits derived from material type and performance characteristics

### Tests for User Story 3

- [x] T018 [P] [US3] Unit test for adapter features enhancement in `tests/unit/catalog/model-adapters.test.ts` (verify features include material-specific benefits)

### Implementation for User Story 3

- [x] T019 [US3] Enhance `ModelFeatures` component to display material-derived benefits in `src/app/(public)/catalog/[modelId]/_components/model-features.tsx` (add material-specific feature bullets, highlight strengths based on performance ratings)
- [x] T020 [US3] Update features mapping in `adaptModelFromServer` to include use-case descriptions (e.g., "Ideal para climas fríos" for PVC)

**Checkpoint**: Features section shows enriched, material-aware benefits that connect specs to user needs

---

## Phase 6: User Story 4 - Access Dimensional Guidelines (Priority: P2)

**Goal**: Display min/max width/height constraints in sidebar while user configures dimensions

**Independent Test**: View model detail page, verify "Dimensiones Permitidas" card shows clear min/max values in millimeters, easy to reference while filling quote form

### Tests for User Story 4

- [x] T021 [P] [US4] E2E test for dimensional guidelines visibility in `e2e/catalog/model-detail-sidebar.spec.ts` (verify dimensions card shows constraints, test on mobile viewport)

### Implementation for User Story 4

- [x] T022 [US4] Enhance `ModelDimensions` component with contextual labels and visual clarity in `src/app/(public)/catalog/[modelId]/_components/model-dimensions.tsx` (add "Permitido" range display, highlight unusual capacities like 6700mm sliding doors)

**Checkpoint**: Dimensional constraints clearly visible, reduces form validation errors

---

## Phase 7: User Story 5 - Compare Material Types (Priority: P3)

**Goal**: Help users understand key differences between PVC and Aluminum window systems via material-specific sidebar content

**Independent Test**: Compare sidebar info between PVC model and Aluminum model, verify material-specific characteristics displayed (PVC = thermal insulation focus, Aluminum = structural strength focus)

### Tests for User Story 5

- [x] T023 [P] [US5] Contract test for modelDetailOutput schema validation in `tests/contract/catalog-model-detail.test.ts` (validate materialType enum values, verify profileSupplier nullable)

### Implementation for User Story 5

- [x] T024 [US5] Add material comparison logic to ensure material-specific benefits are distinct and educative in `src/app/(public)/catalog/[modelId]/_utils/material-benefits.ts` (enhance MATERIAL_BENEFITS with comparison-friendly descriptions)
- [x] T025 [US5] Update `ProfileSupplierCard` to emphasize material-specific advantages clearly in `src/app/(public)/catalog/[modelId]/_components/profile-supplier-card.tsx`

**Checkpoint**: Users can understand material differences by navigating between PVC and Aluminum models

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Final improvements and validation affecting multiple user stories

- [X] T026 [P] Add responsive layout tests for mobile viewports in `e2e/catalog/model-detail-sidebar.spec.ts` (verify cards reflow vertically on <768px)
- [X] T027 [P] Performance audit: Verify sidebar initial render < 100ms using React DevTools Profiler
- [X] T028 [P] Accessibility audit: Verify keyboard navigation, screen reader compatibility, color contrast (WCAG AA)
- [X] T029 Update component README in `src/app/(public)/catalog/[modelId]/_components/README.md` documenting new sidebar cards (ModelSpecifications, ProfileSupplierCard, enhanced ModelFeatures/ModelDimensions)
- [X] T030 Validate quickstart.md setup guide accuracy in `specs/007-enhanced-catalog-model/quickstart.md`
- [X] T031 [P] Code cleanup: Remove any unused imports, console.logs, TODO comments
- [X] T032 Final integration test: Run full E2E suite and verify all user stories work together

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - verify environment immediately
- **Foundational (Phase 2)**: Depends on Setup completion - **BLOCKS all user stories**
- **User Stories (Phase 3-7)**: All depend on Foundational phase completion
  - US1 (Technical Specs) + US2 (Supplier Info) are P1 and should complete first (MVP)
  - US3 (Features) + US4 (Dimensions) are P2 - depend on US1/US2 patterns
  - US5 (Material Comparison) is P3 - builds on all previous stories
- **Polish (Phase 8)**: Depends on desired user stories being complete

### User Story Dependencies

- **US1 (P1) - Technical Specs**: Can start after Foundational - No dependencies on other stories
- **US2 (P1) - Supplier Info**: Can start after Foundational - No dependencies on other stories (can run parallel with US1)
- **US3 (P2) - Features**: Depends on US1 (uses MATERIAL_PERFORMANCE) - Should start after US1/US2
- **US4 (P2) - Dimensions**: Independent of other stories - Can run parallel with US3
- **US5 (P3) - Material Comparison**: Benefits from US1+US2+US3 being complete (validates material differences work across all cards)

### Within Each User Story

- Foundational phase MUST complete before any user story
- Tests (T010, T011, T015, etc.) can run in parallel per story
- Component creation before adding to ModelSidebar
- Adapter updates before component consumption
- Story validation before moving to next priority

### Parallel Opportunities

**Phase 1 (Setup)**: All tasks [P] can run in parallel
```bash
# Verify database, config, dev server simultaneously
T001, T002, T003
```

**Phase 2 (Foundational)**: Some tasks can run in parallel
```bash
# After T004+T005 (schema changes), run in parallel:
T006 (types), T007 (utilities)
# Then T008, T009 (adapter) sequentially
```

**Phase 3-7 (User Stories)**: High parallelization after Foundational

**MVP (P1 Stories Only)**:
```bash
# After Foundational phase:
# Parallel: US1 + US2 (different components)
T010, T011 (US1 tests) + T015 (US2 test)
T012 (US1 component) + T016 (US2 component)
T013 (add US1 to sidebar) + T017 (add US2 to sidebar)
T014 (adapter features)
```

**P2 Stories (After MVP)**:
```bash
# After US1+US2 complete:
# Parallel: US3 + US4 (different components)
T018 (US3 test) + T021 (US4 test)
T019 (US3 features) + T022 (US4 dimensions)
T020 (US3 adapter)
```

**Phase 8 (Polish)**: Maximum parallelization
```bash
# All polish tasks can run in parallel:
T026, T027, T028, T029, T030, T031
# Except T032 (final integration) runs last
```

---

## Parallel Example: MVP (User Stories 1 + 2)

```bash
# After completing Foundational Phase (T004-T009):

# Launch US1 + US2 in parallel:
# Developer A (US1 - Technical Specs):
Task T010: Unit test material benefits (tests/unit/catalog/material-benefits.test.ts)
Task T011: Integration test enhanced query (tests/integration/catalog/get-model-enhanced.test.ts)
Task T012: Create ModelSpecifications component (src/app/(public)/catalog/[modelId]/_components/model-specifications.tsx)
Task T013: Add to ModelSidebar (src/app/(public)/catalog/[modelId]/_components/model-sidebar.tsx)
Task T014: Enhance adapter features (src/app/(public)/catalog/[modelId]/_utils/adapters.ts)

# Developer B (US2 - Supplier Info):
Task T015: E2E test ProfileSupplierCard (e2e/catalog/model-detail-sidebar.spec.ts)
Task T016: Create ProfileSupplierCard component (src/app/(public)/catalog/[modelId]/_components/profile-supplier-card.tsx)
Task T017: Add to ModelSidebar (src/app/(public)/catalog/[modelId]/_components/model-sidebar.tsx)

# Note: T013 + T017 both modify model-sidebar.tsx - coordinate to avoid conflicts
# Recommended: Developer A completes US1 first, then Developer B adds US2
# Or: Merge T013 first, then T017 rebases
```

---

## Implementation Strategy

### MVP First (User Stories 1 + 2 Only) - Recommended for Initial Release

1. **Complete Phase 1**: Setup (T001-T003) → ~10 minutes
2. **Complete Phase 2**: Foundational (T004-T009) → ~1-2 hours (critical path)
3. **Complete Phase 3**: US1 - Technical Specs (T010-T014) → ~2-3 hours
4. **Complete Phase 4**: US2 - Supplier Info (T015-T017) → ~1-2 hours
5. **STOP and VALIDATE**: Test US1+US2 independently, verify technical specs and supplier cards work
6. **Deploy/Demo MVP**: Users can now see material type, technical specs, and supplier info

**Total MVP Time**: ~1 day (with 1 developer) or ~4-6 hours (with 2 developers in parallel)

### Incremental Delivery (Add Features Post-MVP)

1. **Foundation**: Setup + Foundational → Schema ready
2. **MVP Release**: US1 + US2 → Technical specs + Supplier info → Deploy ✅
3. **Enhancement 1**: US3 (Features) → Material-aware benefits → Deploy ✅
4. **Enhancement 2**: US4 (Dimensions) → Clearer constraints → Deploy ✅
5. **Enhancement 3**: US5 (Material Comparison) → Educational material differences → Deploy ✅
6. **Polish**: Phase 8 → Performance, accessibility, docs → Final Release ✅

Each increment adds value without breaking previous functionality.

### Parallel Team Strategy (Multiple Developers)

**Single Developer**: 
- Sequential: Phase 1 → Phase 2 → Phase 3 → Phase 4 → Phase 5 → Phase 6 → Phase 7 → Phase 8
- Focus on MVP first (US1+US2), then add P2/P3 stories incrementally

**Two Developers**:
- Both: Phase 1 + Phase 2 (collaborate on foundation)
- Dev A: US1 (Technical Specs) | Dev B: US2 (Supplier Info) [Parallel]
- Dev A: US3 (Features) | Dev B: US4 (Dimensions) [Parallel]
- Both: US5 (Material Comparison) + Phase 8 (Polish)

**Three+ Developers**:
- All: Phase 1 + Phase 2 (foundation together)
- Dev A: US1 | Dev B: US2 | Dev C: Setup tests infrastructure [Parallel]
- Dev A: US3 | Dev B: US4 | Dev C: US5 [Parallel after MVP]
- All: Phase 8 polish tasks in parallel

---

## Task Execution Estimates

| Phase                     | Tasks         | Time (1 Dev)  | Time (2 Devs) | Priority |
| ------------------------- | ------------- | ------------- | ------------- | -------- |
| Phase 1: Setup            | T001-T003     | 10 min        | 10 min        | Required |
| Phase 2: Foundational     | T004-T009     | 2 hours       | 1.5 hours     | Required |
| Phase 3: US1 (Technical)  | T010-T014     | 3 hours       | 2 hours       | P1 (MVP) |
| Phase 4: US2 (Supplier)   | T015-T017     | 2 hours       | 1.5 hours     | P1 (MVP) |
| Phase 5: US3 (Features)   | T018-T020     | 1.5 hours     | 1 hour        | P2       |
| Phase 6: US4 (Dimensions) | T021-T022     | 1 hour        | 45 min        | P2       |
| Phase 7: US5 (Comparison) | T023-T025     | 1.5 hours     | 1 hour        | P3       |
| Phase 8: Polish           | T026-T032     | 2 hours       | 1 hour        | Required |
| **Total (MVP: P1 only)**  | **T001-T017** | **~8 hours**  | **~5 hours**  | **MVP**  |
| **Total (MVP + P2)**      | **T001-T022** | **~11 hours** | **~7 hours**  |          |
| **Total (All features)**  | **T001-T032** | **~14 hours** | **~9 hours**  |          |

---

## Success Validation Checklist

After completing all tasks, verify:

- [ ] **Performance**: Sidebar initial render < 100ms (use React DevTools Profiler)
- [ ] **Data Quality**: ProfileSupplier.materialType populated for 80%+ of models
- [ ] **Null Handling**: Models without ProfileSupplier show "Proveedor no especificado" gracefully
- [ ] **Material Benefits**: PVC models show thermal insulation focus, Aluminum shows structural strength
- [ ] **Responsive**: Sidebar cards reflow vertically on mobile (<768px)
- [ ] **Accessibility**: Keyboard navigation works, screen readers announce star ratings
- [ ] **Type Safety**: No TypeScript errors, MaterialType enum enforced
- [ ] **Testing**: All tests pass (unit, integration, contract, E2E)
- [ ] **Documentation**: quickstart.md validated, component README updated
- [ ] **Constitution Compliance**: No Winston logger in Client Components, Server Components for pages

---

## Notes

- **[P] tasks**: Different files, can run in parallel
- **[Story] labels**: Map tasks to user stories for traceability (US1-US5)
- **Independent Stories**: Each user story delivers value independently
- **Test Strategy**: Tests MUST exist before merge (constitution), may be written during/after implementation
- **Commit Strategy**: Commit after each task or logical group (e.g., T004+T005 schema changes together)
- **Checkpoints**: Stop at each checkpoint to validate story independently before proceeding
- **MVP Focus**: Prioritize US1+US2 (P1) for fastest value delivery
- **No Barrels**: Do NOT create index.ts barrel files (constitution rule)
- **Spanish UI**: All user-facing text in Spanish (es-LA), code/comments in English

---

**Generated**: 2025-10-14  
**Feature**: Enhanced Catalog Model Sidebar Information  
**Total Tasks**: 32  
**MVP Tasks**: 17 (Phase 1-4: Setup + Foundational + US1 + US2)  
**Estimated MVP Time**: 5-8 hours (depending on team size)
