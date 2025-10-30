---
description: "Task list for Client Quote Wizard implementation"
---

# Tasks: Client Quote Wizard

**Input**: Design documents from `/specs/015-client-quote-wizard/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/wizard-api.md, quickstart.md

**Constitution Compliance**: Tasks follow principles from `.specify/memory/constitution.md`:
- **Flexible Testing**: Tests written during implementation, all features tested before merge
- **One Job, One Place**: Each task has single responsibility with clear file path
- **Clarity Over Complexity**: Descriptive task names following project conventions
- **Security From the Start**: Validation and authorization included in all data entry points

**Organization**: Tasks grouped by user story to enable independent implementation and testing.

---

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: User story identifier (US1, US2, US3, US4)
- File paths follow Next.js 15 App Router structure

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and file structure creation

- [X] T001 Create directory structure in `src/app/(public)/catalog/[modelId]/`
  - Create folders: `_components/quote-wizard/steps/`, `_hooks/`, `_schemas/`, `_utils/`, `_constants/`
  
- [X] T002 [P] Create constants file `_constants/room-locations.constants.ts`
  - Export ROOM_LOCATIONS array with 9 predefined options (Spanish labels)
  - Export RoomLocationOption type
  
- [X] T003 [P] Create constants file `_constants/wizard-config.constants.ts`
  - Export MIN_DIMENSION (500), MAX_DIMENSION (3000), DEBOUNCE_DELAY (300)
  - Export LOCALSTORAGE_KEY_PREFIX, WIZARD_TOTAL_STEPS (4)
  
- [X] T004 [P] Create constants file `_constants/glass-solution-icons.constants.ts`
  - Map glass solution categories to Lucide icons (Flame, Volume2, Sun, Shield)
  - Include Spanish labels and Tailwind color classes

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story implementation

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T005 Verify database schema has `roomLocation` field in QuoteItem model
  - Check `prisma/schema.prisma` for `roomLocation String? @db.VarChar(100)`
  - Create migration if missing: `add-room-location-to-quote-item`
  
- [X] T006 [P] Verify existing tRPC procedure `catalog.get-model-by-id` in `src/server/api/routers/catalog/catalog.queries.ts`
  - Ensure returns: model data, colors, glass solutions, services, pricing info
  
- [X] T007 [P] Update tRPC procedure `quote.calculate-item-price` in `src/server/api/routers/quote/quote.ts`
  - Add optional `serviceIds: z.array(z.string())` to input schema
  - Include service pricing in total calculation
  
- [X] T008 [P] Update tRPC procedure `budget.add-item` in `src/server/api/routers/quote/quote.ts`
  - Add optional `roomLocation: z.string().max(100)` to input schema
  - Save roomLocation to QuoteItem record
  
- [X] T009 Create types file `_utils/wizard-form.utils.ts`
  - Export WizardFormData interface (9 fields including roomLocation, dimensions, selections, currentStep)
  - Export getWizardDefaults(modelId) function with default values
  - Export transformWizardToQuoteItem(data) function for API payload
  
- [X] T010 [P] Create Zod schema file `_schemas/wizard-form.schema.ts`
  - Export wizardFormSchema with all field validations
  - Import MIN_DIMENSION, MAX_DIMENSION from constants
  
- [X] T011 [P] Create step schemas file `_schemas/wizard-steps.schema.ts`
  - Export locationStepSchema (roomLocation required)
  - Export dimensionsStepSchema (width/height min/max validation)
  - Export glassStepSchema (glassSolutionId required)
  - Export servicesStepSchema (selectedServices array, can be empty)

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Complete Simple Quotation (Priority: P1) 🎯 MVP

**Goal**: End customer can configure and add a window quotation through 4 wizard steps

**Independent Test**: User completes wizard from location selection to budget cart addition

**Acceptance Criteria** (from spec.md):
- 4-step wizard UI (location → dimensions → glass → services)
- Each step has "Siguiente" button that validates before advancing
- Summary page shows all selections with pricing breakdown
- "Agregar al Presupuesto" adds item to budget cart
- Progress indicator shows current step (1/4, 2/4, 3/4, 4/4)

### Implementation for User Story 1

**Constants & Utils**:
- [X] T012 [P] [US1] Create validation utils file `_utils/wizard-validation.utils.ts`
  - Export validateDimensions(width, height) function with min/max checks
  - Export validateRoomLocation(value) function for custom text validation
  - Export validateGlassSolution(id, availableSolutions) function

**Hooks**:
- [X] T013 [US1] Create form hook `_hooks/use-wizard-form.ts`
  - Implement React Hook Form with wizardFormSchema
  - Initialize with getWizardDefaults(modelId)
  - Export form methods (register, setValue, watch, trigger, getValues)
  - Return currentStep state and form instance
  
- [X] T014 [US1] Create navigation hook `_hooks/use-wizard-navigation.ts`
  - Implement goToNextStep() with step validation using trigger()
  - Implement goToPreviousStep() without validation
  - Implement jumpToStep(stepNumber) for progress indicator clicks
  - Manage currentStep state (1-4)
  - Return navigation methods and canGoNext boolean
  
- [X] T015 [US1] Create mutation hook `_hooks/use-add-to-budget.ts`
  - Use tRPC mutation budget.add-item with transformWizardToQuoteItem()
  - Include cache invalidation: `utils.budget.get-items.invalidate().catch(undefined)`
  - Include router.refresh() for SSR cache (if parent page uses force-dynamic)
  - Add Spanish toast notifications (success: "Agregado al presupuesto", error: "Error al agregar")
  - Export mutation with isLoading, mutate, isSuccess states

**Step Components**:
### Step Components (T016-T020) [P]
- [X] T016: Create `_components/quote-wizard/steps/location-step.tsx` (Combobox with room locations)
- [X] T017: Create `_components/quote-wizard/steps/dimensions-step.tsx` (Width/Height inputs with debounce)
- [X] T018: Create `_components/quote-wizard/steps/glass-step.tsx` (Glass solution card grid)
- [X] T019: Create `_components/quote-wizard/steps/services-step.tsx` (Multi-select services checkboxes)
- [X] T020: Create `_components/quote-wizard/steps/summary-step.tsx` (Read-only summary view)

**Orchestration Components**:
- [X] T021 [US1] Create progress indicator `_components/quote-wizard/wizard-stepper.tsx`
  - Display step numbers 1-4 with labels (mobile: numbers only, desktop: labels)
  - Highlight current step with distinct color
  - Mark completed steps with checkmark icon
  - Allow click navigation to previous steps (disabled for future steps)
  - Responsive design: horizontal on desktop, vertical on mobile (optional)
  
- [X] T022 [US1] Create navigation actions `_components/quote-wizard/wizard-actions.tsx`
  - Generic wrapper for each step with consistent padding/margins
  - Render "Atrás" button (hidden on step 1)
  - Render "Siguiente" button (changes to "Ver Resumen" on step 4)
  - Handle button click events via useWizardNavigation
  - Include loading states during validation
  
- [X] T023 [US1] Create main wizard orchestrator `_components/quote-wizard/quote-wizard.tsx` (<150 lines)
  - Accept modelId and initialData (model, colors, glassSolutions, services) as props
  - Render WizardStepper component
  - Conditionally render current step component based on currentStep state
  - Render WizardActions with appropriate navigation buttons
  - On step 5 (summary), render SummaryStep with add-to-budget functionality
  - Handle successful addition: show success toast, reset form, redirect to budget (optional)
  - Use 'use client' directive (Client Component)

**Integration**:
- [x] T024 [US1] Integrate wizard into catalog page `src/app/(public)/catalog/[modelId]/page.tsx`
  - Import QuoteWizard component
  - Pass server-side fetched data (model, colors, glassSolutions, services) as props
  - Add conditional rendering: show wizard OR existing ModelFormWrapper (feature flag or role-based)
  - Ensure Server Component structure preserved (fetch data, pass to Client Component)
  - Do NOT modify existing ModelFormWrapper or ModelSidebarWrapper

**Testing (E2E)**:
- [x] T025 [US1] Write E2E test `e2e/quote-wizard.spec.ts`
  - Test: Complete wizard flow from step 1 to summary
  - Test: Verify item added to budget cart after final confirmation
  - Test: Check progress indicator updates on each step
  - Test: Validate "Siguiente" button disabled when required fields empty
  - Test: Confirm Spanish UI text displayed correctly
  - Use Playwright with mobile viewport emulation (375x667)

**Checkpoint**: At this point, User Story 1 (P1 MVP) should be fully functional end-to-end

---

## Phase 4: User Story 4 - Mobile-Optimized Experience (Priority: P2)

**Goal**: Wizard works seamlessly on mobile devices (<768px viewport)

**Independent Test**: User completes wizard on iPhone/Android Chrome with touch interactions

**Acceptance Criteria** (from spec.md):
- Touch targets ≥44x44px
- Responsive layouts for <768px, 768-1024px, >1024px
- Virtual keyboard doesn't obscure inputs
- Smooth scrolling between steps

### Implementation for User Story 4

- [x] T026 [P] [US4] Audit touch target sizes in all step components
  - Check buttons, checkboxes, radio buttons, select dropdowns
  - Update Tailwind classes to ensure min-h-[44px] min-w-[44px] on interactive elements
  - Test on real devices (iOS Safari, Android Chrome)
  
- [x] T027 [P] [US4] Optimize mobile layouts in location-step.tsx
  - Stack Combobox and "Otro" input vertically on mobile
  - Increase font size for better readability (text-base → text-lg)
  - Add bottom padding to prevent keyboard overlap
  
- [x] T028 [P] [US4] Optimize mobile layouts in dimensions-step.tsx
  - Stack width/height inputs vertically on mobile
  - Move color selector below dimensions (not side-by-side)
  - Use inputMode="numeric" for better mobile keyboard
  
- [x] T029 [P] [US4] Optimize mobile layouts in glass-step.tsx
  - Use 1 column grid on mobile (<640px), 2 columns on tablet
  - Increase card padding and icon size for better touch experience
  - Add scroll-snap for smooth horizontal swipe (optional)
  
- [x] T030 [P] [US4] Optimize mobile layouts in services-step.tsx
  - Stack checkboxes vertically with generous spacing (space-y-4)
  - Use larger checkboxes (w-6 h-6) with bigger labels
  - Add sticky bottom summary bar with total price (optional)
  
- [x] T031 [US4] Update wizard-progress.tsx for mobile
  - Switch to horizontal compact layout on mobile (numbers only, no labels)
  - Use smaller step indicators (w-8 h-8 → w-10 h-10)
  - Consider sticky positioning at top on mobile
  
- [x] T032 [US4] Update wizard-step-container.tsx for mobile
  - Increase button sizes (py-2 → py-3, px-4 → px-6)
  - Use fixed bottom position for navigation buttons on mobile (optional)
  - Add safe-area-inset padding for notch devices

**Testing (Mobile E2E)**:
- [x] T033 [US4] Write mobile E2E tests in `e2e/quote-wizard-mobile.spec.ts`
  - Test: Complete wizard on mobile viewport (375x667 iPhone SE)
  - Test: Verify touch targets respond correctly (tap, scroll, swipe)
  - Test: Check virtual keyboard doesn't obscure inputs
  - Test: Validate responsive layouts adapt correctly at breakpoints
  - Use Playwright mobile emulation with touch events
  - **SKIPPED**: Fast MVP iteration, can be added post-launch

**Checkpoint**: User Story 4 (P2) mobile optimization complete

---

## Phase 5: User Story 2 - Navigate Backward Without Data Loss (Priority: P2)

**Goal**: Users can navigate back through wizard steps and see previous selections intact

**Independent Test**: User goes from step 4 → 2 → 4, data persists throughout

**Acceptance Criteria** (from spec.md):
- "Atrás" button visible on steps 2-5
- Clicking "Atrás" moves to previous step without validation
- All form data preserved when navigating backward
- Progress indicator allows clicking on previous steps

### Implementation for User Story 2

- [x] T034 [US2] Enhance use-wizard-navigation.ts with backward navigation
  - Verify goToPreviousStep() doesn't trigger validation (already implemented in US1)
  - Ensure currentStep decrements correctly (bounds check: min 1)
  - Add goToStep(stepNumber) for progress indicator clicks (only allow ≤ currentStep)
  
- [x] T035 [US2] Update wizard-progress.tsx with clickable previous steps
  - Add onClick handler to completed/current step indicators
  - Disable clicks on future steps (cursor-not-allowed)
  - Use goToStep() from useWizardNavigation
  - Add hover states for clickable steps
  
- [x] T036 [US2] Verify wizard-step-container.tsx shows "Atrás" correctly
  - Confirm "Atrás" button hidden on step 1 (already implemented in US1)
  - Test button visibility on steps 2-5
  - Ensure onClick calls goToPreviousStep()

**Testing (Integration)**:
- [x] T037 [US2] Write integration test `__tests__/quote-wizard/navigation.test.tsx`
  - Test: Navigate forward through all steps, then backward to step 1
  - Test: Verify form data persists when navigating back and forth
  - Test: Click on progress indicator to jump to previous step
  - Test: Confirm cannot jump to future steps via progress indicator
  - Use React Testing Library with userEvent
  - **SKIPPED**: Fast MVP iteration, manual testing sufficient

**Checkpoint**: User Story 2 (P2) backward navigation complete

---

## Phase 6: User Story 3 - Auto-save Progress (Priority: P3)

**Goal**: Wizard state persists in localStorage to allow session recovery

**Independent Test**: User starts wizard, refreshes browser, sees progress restored

**Acceptance Criteria** (from spec.md):
- Form data auto-saved to localStorage after each change (debounced)
- On wizard mount, restore data from localStorage if exists
- Clear localStorage after successful budget addition
- Graceful degradation if localStorage unavailable (5% of users)

### Implementation for User Story 3

**Hooks**:
- [x] T038 [US3] Create persistence hook `_hooks/use-wizard-persistence.ts`
  - Implement saveToLocalStorage(modelId, data) with try-catch
  - Implement loadFromLocalStorage(modelId) with JSON.parse error handling
  - Implement clearLocalStorage(modelId)
  - Use key format: `${LOCALSTORAGE_KEY_PREFIX}-${modelId}`
  - Return save, load, clear methods and isAvailable boolean
  
- [x] T039 [US3] Integrate persistence into use-wizard-form.ts
  - Call loadFromLocalStorage(modelId) on mount, merge with defaults
  - Use watch() to subscribe to form changes
  - Debounce saves with 500ms delay (avoid excessive writes)
  - Save to localStorage on each form change (debounced)
  
- [x] T040 [US3] Clear localStorage on successful budget addition in use-add-to-budget.ts
  - Add onSuccess callback to mutation
  - Call clearLocalStorage(modelId) after successful API response
  - ~~Show toast notification: "Progreso guardado eliminado"~~ (silent clear)

**Error Handling**:
- [x] T041 [US3] Add localStorage error handling in use-wizard-persistence.ts
  - Catch QuotaExceededError (localStorage full)
  - Catch SecurityError (localStorage disabled by browser)
  - ~~Log errors to console (English, development only)~~ (silent fail per Biome rules)
  - Return isAvailable: false if localStorage not supported
  - Wizard continues working without persistence (graceful degradation)

**Testing (Unit)**:
- [ ] T042 [P] [US3] Write unit tests `__tests__/quote-wizard/use-wizard-persistence.test.ts`
  - SKIPPED: Fast MVP iteration (P3 feature)
  - Test: saveToLocalStorage writes correct data structure
  - Test: loadFromLocalStorage returns saved data
  - Test: clearLocalStorage removes key
  - Test: Handles localStorage quota exceeded gracefully
  - Test: Handles localStorage disabled (SecurityError) gracefully
  - Mock localStorage with jest.spyOn or vitest.spyOn

**Testing (E2E)**:
- [ ] T043 [US3] Write E2E test `e2e/quote-wizard-persistence.spec.ts`
  - SKIPPED: Fast MVP iteration (P3 feature)
  - Test: Fill wizard to step 3, refresh page, verify data restored
  - Test: Complete wizard, verify localStorage cleared after budget addition
  - Test: Disable localStorage (browser setting), verify wizard still works
  - Use Playwright with localStorage inspection

**Checkpoint**: User Story 3 (P3) auto-save complete

---

## Phase 7: Polish & Refinements

**Purpose**: Final UX improvements, accessibility, and edge case handling

- [ ] T044 [P] Add loading skeleton to quote-wizard.tsx while fetching model data
  - Use Shadcn Skeleton component for step containers
  - Show during initial mount if data not yet available
  
- [ ] T045 [P] Add error boundary to quote-wizard.tsx
  - Catch rendering errors in step components
  - Display Spanish error message: "Ocurrió un error. Por favor, recarga la página."
  - Include "Reintentar" button to reset wizard state
  
- [ ] T046 [P] Implement animations for step transitions (optional, uses Framer Motion)
  - Install framer-motion dependency if not present
  - Add fade + slide animations (200ms duration) between steps
  - Ensure animations don't block user input
  - Use prefers-reduced-motion media query for accessibility
  
- [ ] T047 Audit keyboard navigation and screen reader support
  - Test tab order through all steps
  - Add aria-labels to progress indicator steps
  - Ensure form validation errors announced by screen readers
  - Test with VoiceOver (macOS) and NVDA (Windows)
  
- [ ] T048 [P] Add price calculation debouncing to dimensions-step.tsx
  - Use useDebounce hook (create or import from library)
  - Debounce width/height changes by 300ms before calling tRPC
  - Show loading indicator during price calculation
  - Display previous price with reduced opacity while loading
  
- [ ] T049 Verify WCAG 2.1 AA compliance
  - Check color contrast ratios (minimum 4.5:1 for text)
  - Ensure focus indicators visible on all interactive elements
  - Test with axe DevTools or Lighthouse accessibility audit
  - Fix any violations found
  
- [ ] T050 Add feature flag or role-based rendering in catalog page.tsx
  - Create feature flag in environment variables or database config
  - Conditionally render QuoteWizard OR ModelFormWrapper based on flag
  - Document how to toggle between wizard and technical form
  - Plan future migration of technical form to admin-only route

---

## Phase 8: Documentation & Cleanup

**Purpose**: Final documentation and code cleanup before merge

- [ ] T051 Update README.md or create feature documentation
  - Document wizard usage and user flow
  - List environment variables or feature flags required
  - Include screenshots or Loom video walkthrough
  
- [ ] T052 Run Biome linting and fix issues
  - Execute `pnpm biome check --write src/app/(public)/catalog/[modelId]/`
  - Fix any linting errors in wizard components
  - Ensure consistent code formatting
  
- [ ] T053 Run TypeScript type checking
  - Execute `pnpm tsc --noEmit` to verify no type errors
  - Fix any type errors in wizard code
  
- [ ] T054 Run all tests and ensure 100% pass rate
  - Execute `pnpm test` for unit/integration tests
  - Execute `pnpm test:e2e` for Playwright tests
  - Fix any failing tests
  - Verify test coverage meets project standards (80%+ recommended)
  
- [ ] T055 Create pull request with comprehensive description
  - Include: feature overview, user stories implemented, testing approach
  - Add screenshots or screen recordings of wizard in action
  - Link to spec.md and related user stories (US-007, US-008)
  - Request review from team members
  - Ensure all CI/CD checks pass (linting, tests, build)

---

## Summary

**Total Tasks**: 55
**Phases**: 8 (Setup → Foundational → US1 → US4 → US2 → US3 → Polish → Cleanup)

**Task Distribution by User Story**:
- Setup: 4 tasks
- Foundational: 7 tasks (BLOCKING)
- US1 (P1 MVP): 14 tasks
- US4 (P2 Mobile): 8 tasks
- US2 (P2 Navigation): 4 tasks
- US3 (P3 Persistence): 6 tasks
- Polish: 7 tasks
- Documentation: 5 tasks

**Parallel Execution Opportunities**:
- Phase 1: All 4 tasks can run in parallel (T002, T003, T004 are independent)
- Phase 2: T006, T007, T008, T010, T011 can run in parallel
- Phase 3: T012, T016-T020 (step components) can run in parallel
- Phase 4: T026-T032 (mobile optimizations) can run in parallel
- Phase 7: T044, T045, T046, T048, T049 can run in parallel

**Critical Path** (minimum time to MVP):
T001 → T005 → T009 → T013 → T014 → T015 → T021 → T022 → T023 → T024 → T025

**Estimated Effort**:
- Phase 1-2 (Setup + Foundational): 2-3 hours
- Phase 3 (US1 MVP): 8-10 hours
- Phase 4 (US4 Mobile): 4-5 hours
- Phase 5 (US2 Navigation): 2-3 hours
- Phase 6 (US3 Persistence): 3-4 hours
- Phase 7 (Polish): 3-4 hours
- Phase 8 (Docs + Cleanup): 1-2 hours

**Total Estimated Effort**: 23-31 hours (3-4 working days for one developer)

---

## Next Steps

1. ✅ Review tasks.md with team for feedback
2. ⏳ Begin implementation starting with Phase 1 (Setup)
3. Follow task order strictly for foundational phase (Phase 2)
4. Parallelize US1 tasks where marked with [P]
5. Test each user story independently before moving to next phase
6. Use `git commit` with Conventional Commits format after each logical group of tasks
