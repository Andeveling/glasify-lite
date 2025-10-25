---
description: "Implementation tasks for Model Design Gallery feature"
---

# Tasks: Galería de Diseños 2D para Modelos

**Feature Branch**: `001-model-design-gallery`  
**Input**: Design documents from `/specs/001-model-design-gallery/`  
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/model-design-api.md

**Constitution Compliance**: Tasks follow principles from `.specify/memory/constitution.md`:
- **Flexible Testing**: Tests written before/during/after coding, but ALL features need tests before merge
- **One Job, One Place**: Each task has single responsibility
- **Clarity Over Complexity**: Descriptive task names with clear file paths
- **Security From the Start**: Validation and authorization tasks included
- **Server-First Performance**: Heavy work on server, client rendering only when necessary
- **Winston Logger**: Server-side ONLY (NEVER in Client Components)

**Tests**: Tests are included per constitution requirement. Some marked OPTIONAL can be deferred if time-constrained.

**Organization**: Tasks grouped by user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Install Konva dependencies: `pnpm add konva react-konva`
- [x] T002 Verify react-intersection-observer is installed (for lazy loading)
- [x] T003 Create feature branch `001-model-design-gallery` from develop

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T004 Add ModelType enum to prisma/schema.prisma (fixed_window, sliding_window_horizontal, sliding_window_vertical, casement_window, awning_window, single_door, double_door, sliding_door, other)
- [x] T005 Add ModelDesign model to prisma/schema.prisma (id, name, nameEs, description, type, config, thumbnailUrl, isActive, displayOrder, timestamps)
- [x] T006 Add type and designId fields to Model in prisma/schema.prisma
- [x] T007 Add indexes to schema: ModelDesign(type, isActive), ModelDesign(displayOrder), Model(designId), Model(type)
- [x] T008 Generate and run migration: `pnpm prisma migrate dev --name add_model_designs`
- [x] T009 Verify migration in Prisma Studio: `pnpm prisma studio`
- [x] T010 [P] Create src/lib/design/types.ts with StoredDesignConfig, ShapeDefinition, AdaptedDesign types
- [x] T011 [P] Create src/lib/design/material-colors.ts with MATERIAL_COLORS constant and getMaterialColor function
- [x] T012 [P] Create src/lib/design/validation.ts with Zod schemas (storedDesignConfigSchema, validateDesignConfig, isValidDesignConfig)
- [x] T013 Create prisma/seeders/seed-designs.ts with minimal initial designs (1-2 basic designs)
- [x] T014 Update prisma/seed-cli.ts to include seed-designs execution
- [x] T015 Run seeder to populate initial designs: `pnpm prisma db seed`
- [x] T016 Update .github/copilot-instructions.md with new technologies (Konva 9.x, react-konva 18.x, ModelDesign entity, design rendering patterns)

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Visualizar diseño de modelo en catálogo (Priority: P1) 🎯 MVP

**Goal**: Clientes pueden ver el diseño visual del modelo en cada tarjeta del catálogo para entender el aspecto físico antes de hacer clic en detalles.

**Independent Test**: Navegar a `/catalog` y verificar que cada ModelCard muestra un diseño 2D renderizado o fallback si no tiene diseño asignado.

### Tests for User Story 1

- [x] T017 [P] [US1] Create tests/unit/lib/design/material-colors.test.ts - test getMaterialColor for all MaterialType values
- [x] T018 [P] [US1] Create tests/unit/lib/design/validation.test.ts - test storedDesignConfigSchema validation (valid configs pass, invalid fail)
- [ ] T019 [P] [US1] Create tests/unit/components/design-renderer.test.tsx - test DesignRenderer adaptation logic (mock Konva, verify shapes adapt to dimensions)
- [ ] T020 [P] [US1] Create tests/integration/server/api/routers/catalog.test.ts - verify catalog.list includes design config and material type
- [ ] T021 [US1] Create e2e/catalog/design-rendering.spec.ts - E2E test navigating to catalog and verifying design rendering (OPTIONAL - can defer)

### Implementation for User Story 1

- [x] T022: Create `DesignFallback.tsx` (Client Component, placeholder when no design)
- [x] T023: Create `design-adapter-service.ts` (server-side parametric adaptation)
- [x] T024: Create `DesignRenderer.tsx` (Client Component with Konva rendering + React.memo)
- [x] T025: Extend catalog tRPC procedure `list-models` and `get-model-by-id` to include design config
- [x] T026: Integrate `DesignRenderer` into `ModelCard` component (catalog grid)
- [x] T027 [US1] Add Winston logging in design-adapter-service.ts for adaptation errors (server-side only)
- [x] T028 [US1] Integration complete - catalog updated to pass design and material to ModelCard

**Checkpoint**: User Story 1 complete - catalog shows design renderings independently

---

## Phase 4: User Story 2 - Asignar diseño predefinido a modelo (Priority: P2)

**Goal**: Administradores pueden seleccionar un diseño predefinido de una galería visual al crear/editar un modelo.

**Independent Test**: Acceder a `/admin/models/new` o `/admin/models/[id]`, verificar selector de diseños con preview visual, confirmar asignación persiste.

### Tests for User Story 2

- [ ] T029 [P] [US2] Create tests/integration/server/api/routers/admin/model-design.test.ts - test list, get-by-id, get-by-ids, toggle-active procedures
- [ ] T030 [P] [US2] Create tests/integration/server/api/routers/admin/model.test.ts - test create/update with type and designId validation
- [ ] T031 [US2] Create e2e/admin/model-design-assignment.spec.ts - E2E test creating model with design assignment (OPTIONAL - can defer)

### Implementation for User Story 2

- [x] T032 [P] [US2] Create src/server/api/routers/admin/model-design.ts - tRPC router with adminProcedure for list, get-by-id, get-by-ids, toggle-active
- [x] T033 [US2] Register model-design router in src/server/api/root.ts
- [x] T034 [US2] Modify src/server/api/routers/admin/model.ts - extend create and update procedures to accept type and designId with Zod validation (type compatibility check)
- [x] T035 [US2] Modify src/server/api/routers/admin/model.ts - extend list procedure to include design { id, name, nameEs, type }
- [x] T036 [US2] Modify src/server/api/routers/admin/model.ts - extend get-by-id procedure to include full design with config
- [x] T037 [P] [US2] Create src/app/(dashboard)/admin/models/_components/design-preview.tsx - Client Component showing single design preview with DesignRenderer
- [x] T038 [US2] Create src/app/(dashboard)/admin/models/_components/design-gallery-selector.tsx - Client Component with gallery grid (filter by type, show active designs, preview on hover/click)
- [x] T039 [US2] Modify src/app/(dashboard)/admin/models/_components/model-form.tsx - add ModelType selector (required before design selector appears)
- [x] T040 [US2] Modify src/app/(dashboard)/admin/models/_components/model-form.tsx - integrate design-gallery-selector (conditionally shown if type is selected, filters by type)
- [x] T041 [US2] Add Winston logging in admin/model.ts procedures for design assignment operations (server-side only)
- [x] T042 [US2] Implement SSR cache invalidation pattern: use router.refresh() after utils.admin.model.invalidate() in model-form mutations
- [ ] T043 [US2] Test assignment manually: create model with type, select design, verify it saves and displays in catalog

**Checkpoint**: User Story 2 complete - admins can assign designs to models independently

---

## Phase 5: User Story 3 - Explorar galería de diseños disponibles (Priority: P3)

**Goal**: Administradores pueden explorar la galería completa de diseños con filtros y búsqueda para encontrar rápidamente el diseño apropiado.

**Independent Test**: Acceder al selector de diseños en formulario de modelo y verificar capacidades de búsqueda/filtrado funcionan correctamente.

### Tests for User Story 3 (OPTIONAL)

- [ ] T044 [P] [US3] Create tests/unit/components/design-gallery-selector.test.tsx - test filter by type, search functionality (OPTIONAL - defer if time-constrained)

### Implementation for User Story 3

- [ ] T045 [US3] Enhance src/app/(dashboard)/admin/models/_components/design-gallery-selector.tsx - add search input with debounced filtering (300ms delay)
- [ ] T046 [US3] Enhance src/app/(dashboard)/admin/models/_components/design-gallery-selector.tsx - add type filter dropdown (show counts per type)
- [ ] T047 [US3] Enhance src/app/(dashboard)/admin/models/_components/design-gallery-selector.tsx - add hover tooltip with design info (name, description, recommended dimensions)
- [ ] T048 [US3] Add loading states and skeleton loaders to design-gallery-selector.tsx for better UX during data fetching
- [ ] T049 [US3] Test search and filters manually: verify real-time filtering works with multiple designs

**Checkpoint**: User Story 3 complete - admins have enhanced gallery exploration tools

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [x] T050 [P] Update CHANGELOG.md with feature entry (Added: Galería de diseños 2D para modelos con rendering Konva)
- [x] T051 [P] Add JSDoc comments to exported functions in src/lib/design/ (types, material-colors, validation)
- [ ] T052 Code cleanup: remove console.logs, ensure proper error handling in all Client Components
- [x] T053 Performance optimization: verify React.memo is applied to DesignRenderer and DesignPreview
- [ ] T054 Performance optimization: verify Intersection Observer lazy loading works correctly in catalog grid
- [ ] T055 Security hardening: verify all admin procedures use adminProcedure (not publicProcedure)
- [x] T056 Security hardening: verify Zod validation on all inputs (type, designId, config JSON)
- [ ] T057 [P] Create docs/features/model-design-gallery.md with user-facing documentation (Spanish UI text)
- [ ] T058 Run quickstart.md validation: follow all steps in fresh environment to ensure completeness
- [ ] T059 [P] Add unit tests for design-adapter-service.ts constraint-based adaptation logic (OPTIONAL - enhance test coverage)
- [ ] T060 Final manual testing: full workflow from admin assigning design to customer viewing in catalog
- [ ] T061 Prepare PR: ensure all tests pass, Biome formatting applied, no TypeScript errors

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-5)**: All depend on Foundational phase completion
  - US1 (P1): Can start after Foundational - No dependencies on other stories
  - US2 (P2): Can start after Foundational - Integrates with US1 (DesignRenderer) but independently testable
  - US3 (P3): Depends on US2 (enhances design-gallery-selector from US2)
- **Polish (Phase 6)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Independent - Can complete and deploy alone (MVP!)
  - Delivers: Design rendering in catalog
  - Blocks: None
  - Blocked by: Foundational phase only

- **User Story 2 (P2)**: Mostly independent - Uses DesignRenderer from US1
  - Delivers: Design assignment in admin
  - Blocks: User Story 3 (enhances selector)
  - Blocked by: Foundational + US1 (needs DesignRenderer for preview)

- **User Story 3 (P3)**: Depends on US2
  - Delivers: Enhanced search/filter in gallery
  - Blocks: None
  - Blocked by: Foundational + US2 (enhances existing selector)

### Within Each User Story

**User Story 1**:
1. Tests can run in parallel (T017, T018, T019, T020)
2. Core libraries in parallel (T022 design-fallback, T023 design-adapter-service)
3. Then DesignRenderer (T024) depends on adapter service
4. Then API modification (T025) and UI integration (T026)
5. Then logging and manual testing (T027, T028)

**User Story 2**:
1. Tests in parallel (T029, T030)
2. API routers in parallel (T032 model-design router, T034-T036 model router mods)
3. Register router (T033)
4. UI components in parallel (T037 preview, T038 gallery selector)
5. Form integration (T039-T040 model-form modifications)
6. Then logging, invalidation, testing (T041-T043)

**User Story 3**:
1. Enhancements to existing selector (T045-T048 sequential or parallel)
2. Manual testing (T049)

### Parallel Opportunities

**Within Setup (Phase 1)**:
- All 3 tasks are sequential (install deps → verify → create branch)

**Within Foundational (Phase 2)**:
- Database tasks sequential: T004-T009 (schema → migration → verify)
- Then types/libs in parallel: T010 (types), T011 (colors), T012 (validation)
- Then seeder tasks: T013-T015 (create seeder → update CLI → run)
- Then agent context update: T016

**Within User Story 1**:
- Tests (T017-T020) can ALL run in parallel [P]
- Components (T022 fallback, T023 adapter service) can run in parallel [P]
- After adapter service done: T024 DesignRenderer → T025 API → T026 UI

**Within User Story 2**:
- Tests (T029, T030) in parallel [P]
- API work (T032, T034-T036) mostly parallel [P] (different files)
- UI components (T037, T038) in parallel [P]
- Form integration (T039-T040) sequential

**Within Polish (Phase 6)**:
- Documentation (T050, T057) in parallel [P]
- Comments (T051) parallel [P]
- Tests (T059) parallel [P]

---

## Parallel Example: User Story 1

```bash
# Launch all tests for User Story 1 together:
- Task T017: tests/unit/lib/design/material-colors.test.ts
- Task T018: tests/unit/lib/design/validation.test.ts
- Task T019: tests/unit/components/design-renderer.test.tsx
- Task T020: tests/integration/server/api/routers/catalog.test.ts

# Launch initial components together:
- Task T022: src/app/_components/design/design-fallback.tsx
- Task T023: src/server/services/design-adapter-service.ts
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T003)
2. Complete Phase 2: Foundational (T004-T016) - CRITICAL
3. Complete Phase 3: User Story 1 (T017-T028)
4. **STOP and VALIDATE**: Test catalog independently
5. Deploy MVP if ready - customers can see designs!

### Incremental Delivery

1. Foundation (Phase 1-2) → Infrastructure ready
2. **User Story 1 (Phase 3)** → Deploy (MVP: catalog rendering) ✅
3. **User Story 2 (Phase 4)** → Deploy (admins can assign) ✅
4. **User Story 3 (Phase 5)** → Deploy (enhanced gallery) ✅
5. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together (T001-T016)
2. Once Foundational done:
   - **Developer A**: User Story 1 (T017-T028) - Focus on catalog rendering
   - **Developer B**: Wait for US1 DesignRenderer, then start User Story 2 (T029-T043)
   - **Developer C**: After US2, start User Story 3 (T044-T049)
3. Or all stories sequentially if solo developer

---

## Total Task Count: 61 Tasks

- **Phase 1 (Setup)**: 3 tasks
- **Phase 2 (Foundational)**: 13 tasks ⚠️ CRITICAL PATH
- **Phase 3 (User Story 1 - P1)**: 12 tasks 🎯 MVP
- **Phase 4 (User Story 2 - P2)**: 15 tasks
- **Phase 5 (User Story 3 - P3)**: 6 tasks
- **Phase 6 (Polish)**: 12 tasks

### Parallel Tasks Identified: 22 tasks marked [P]

**Suggested MVP Scope**: Phase 1 + Phase 2 + Phase 3 (User Story 1 only)
- **MVP Tasks**: 28 tasks (Setup + Foundational + US1)
- **MVP Deliverable**: Customers can view 2D designs in catalog
- **Time Estimate**: 2-3 days for experienced developer

---

## Notes

- [P] tasks = different files, no dependencies within phase
- [Story] label maps task to specific user story for traceability
- Each user story independently completable and testable
- Verify tests fail before implementing (TDD optional but recommended)
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- **Winston logger**: Server-side ONLY (tasks T027, T041) - NEVER in Client Components
- **SSR cache invalidation**: Task T042 implements two-step pattern (invalidate + router.refresh)
- Follow `.github/copilot-instructions.md` for naming conventions and patterns
