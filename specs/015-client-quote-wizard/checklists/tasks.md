---
description: "Task validation checklist for Client Quote Wizard"
---

# Task Validation Checklist

**Feature**: Client Quote Wizard  
**Date**: 2025-10-28  
**Branch**: `015-client-quote-wizard`

---

## Completeness Checks

- [x] All user stories from spec.md have corresponding tasks
  - US1 (P1): Complete Simple Quotation → Phase 3 (T012-T025)
  - US2 (P2): Navigate Backward → Phase 5 (T034-T037)
  - US3 (P3): Auto-save Progress → Phase 6 (T038-T043)
  - US4 (P2): Mobile-Optimized → Phase 4 (T026-T033)

- [x] Tasks organized by user story for independent implementation
  - Each phase clearly labeled with user story number
  - Checkpoints mark completion of each story
  - Tasks can be tested independently per story

- [x] All entities from data-model.md have creation tasks
  - WizardFormData interface → T009 (_utils/wizard-form.utils.ts)
  - RoomLocation type → T002 (_constants/room-locations.constants.ts)
  - WizardStep configuration → T003 (_constants/wizard-config.constants.ts)
  - Zod schemas → T010, T011 (_schemas/)

- [x] All endpoints from contracts/wizard-api.md have tasks
  - catalog.get-model-by-id verification → T006
  - quote.calculate-item-price update → T007 (add serviceIds param)
  - budget.add-item update → T008 (add roomLocation param)
  - Add-to-budget mutation hook → T015

- [x] Foundational phase blocks user story work
  - Phase 2 marked as BLOCKING
  - Checkpoint confirms foundation ready before US implementation
  - Database schema, tRPC procedures, types/schemas all in Phase 2

- [x] Each task has clear file path in description
  - All tasks specify exact file location
  - File paths follow Next.js 15 App Router conventions
  - SOLID organization enforced (_components/, _hooks/, _schemas/, _utils/, _constants/)

---

## SOLID Architecture Compliance

- [x] Constants extracted to dedicated files
  - T002: room-locations.constants.ts
  - T003: wizard-config.constants.ts (MIN_DIMENSION, MAX_DIMENSION, DEBOUNCE_DELAY)
  - T004: glass-solution-icons.constants.ts

- [x] Schemas extracted to _schemas/ folder
  - T010: wizard-form.schema.ts (main form validation)
  - T011: wizard-steps.schema.ts (per-step validation)

- [x] Mutations in hooks, not UI components
  - T015: use-add-to-budget.ts (mutation + cache invalidation + toasts)
  - No mutation logic in step components

- [x] Business logic separated from UI
  - T013: use-wizard-form.ts (form state management)
  - T014: use-wizard-navigation.ts (step navigation logic)
  - T038: use-wizard-persistence.ts (localStorage operations)

- [x] Utility functions for transformations/defaults
  - T009: wizard-form.utils.ts (getWizardDefaults, transformWizardToQuoteItem)
  - T012: wizard-validation.utils.ts (validateDimensions, validateRoomLocation)

- [x] Components under 150 lines target
  - T023: quote-wizard.tsx (<150 lines, orchestration only)
  - Step components (T016-T020) designed as simple UI renderers

---

## Constitution Compliance

- [x] **Clarity Over Complexity**: Descriptive task names with clear file paths
  - Example: "Create Step 1 component `_components/quote-wizard/steps/location-step.tsx`"
  - All tasks follow format: `[ID] [P?] [Story] Description with file path`

- [x] **Server-First Performance**: Caching and SSR patterns included
  - T024: Integration task ensures Server Component structure preserved
  - T015: Mutation includes router.refresh() for SSR cache invalidation

- [x] **One Job, One Place**: Single responsibility per task
  - Each task targets one file or one focused operation
  - No tasks try to implement multiple components/hooks/schemas

- [x] **Flexible Testing**: Tests included but marked as during implementation
  - E2E tests: T025 (US1), T033 (US4), T043 (US3)
  - Integration test: T037 (US2)
  - Unit tests: T042 (US3 persistence)

- [x] **Extend, Don't Modify**: New code, existing preserved
  - T024: Explicit note "Do NOT modify existing ModelFormWrapper"
  - Wizard as separate component with conditional rendering

- [x] **Security From the Start**: Validation in all entry points
  - T007, T008: Update tRPC procedures with Zod validation
  - T010, T011: Schema validation for all form inputs
  - T012: Validation utilities for dimension/location checks

- [x] **Track Everything Important**: Logging strategy followed
  - No Winston in Client Components (wizard is client-side)
  - Spanish error messages in UI (T015, T040, T045)
  - English console logs for debugging only

---

## Language & Communication Checks

- [x] Code/comments in English
  - All function names in English: useWizardForm, goToNextStep, validateDimensions
  - Component names in English: QuoteWizard, LocationStep, DimensionsStep

- [x] UI text in Spanish (es-LA)
  - Room locations: "Alcoba principal", "Sala / Comedor" (T002)
  - Button labels: "Siguiente", "Atrás", "Agregar al Presupuesto" (mentioned in tasks)
  - Error messages: Spanish (T015, T041, T045)

- [x] File names follow kebab-case convention
  - Components: quote-wizard.tsx, location-step.tsx, dimensions-step.tsx
  - Hooks: use-wizard-form.ts, use-wizard-navigation.ts
  - Utils: wizard-form.utils.ts, wizard-validation.utils.ts

---

## Parallel Execution Opportunities

- [x] Tasks marked with [P] can run independently
  - Phase 1: T002, T003, T004 (all constants files)
  - Phase 2: T006, T007, T008, T010, T011 (API verification, schemas)
  - Phase 3: T012, T016-T020 (validation utils, step components)
  - Phase 4: T026-T032 (mobile optimizations)
  - Phase 7: T044, T045, T046, T048, T049 (polish tasks)

- [x] Parallel markers accurate (no hidden dependencies)
  - T016-T020 (step components) truly independent
  - T026-T032 (mobile tasks) update different files
  - T002-T004 (constants) have zero dependencies

---

## Testing Coverage

- [x] E2E tests for complete user journeys
  - T025: Full wizard flow (location → summary → budget)
  - T033: Mobile wizard flow with touch interactions
  - T043: Persistence (refresh page, verify data restored)

- [x] Integration tests for complex interactions
  - T037: Navigation back/forth, form data persistence

- [x] Unit tests for critical utilities
  - T042: localStorage operations (save, load, clear, error handling)

- [x] Accessibility testing included
  - T047: Keyboard navigation and screen reader audit
  - T049: WCAG 2.1 AA compliance verification

---

## Edge Cases & Error Handling

- [x] localStorage unavailable scenario covered
  - T041: Error handling for QuotaExceededError, SecurityError
  - T038: isAvailable flag for graceful degradation

- [x] Network failure handling
  - T015: use-add-to-budget.ts includes error toast notifications
  - T045: Error boundary for rendering errors

- [x] Validation edge cases
  - T012: Dimension validation (min 500, max 3000)
  - T012: Room location validation for custom text input

- [x] Mobile-specific edge cases
  - T032: Safe-area-inset for notch devices
  - T027: Keyboard overlap prevention with bottom padding

---

## Dependencies & Prerequisites

- [x] Database schema changes identified
  - T005: Verify/add roomLocation field to QuoteItem model

- [x] tRPC procedure updates documented
  - T007: Add serviceIds param to quote.calculate-item-price
  - T008: Add roomLocation param to budget.add-item

- [x] External library needs specified
  - T046: Framer Motion (optional, for animations)
  - React Hook Form, Zod (already in project)

- [x] Existing components/APIs not modified unnecessarily
  - T024: Preserve existing ModelFormWrapper and ModelSidebarWrapper
  - T006: Verify existing catalog.get-model-by-id (no changes needed)

---

## Documentation & Cleanup

- [x] Documentation tasks included
  - T051: Update README.md with feature documentation
  - Screenshots/video walkthrough mentioned

- [x] Code quality tasks included
  - T052: Biome linting
  - T053: TypeScript type checking
  - T054: Run all tests

- [x] PR preparation task
  - T055: Create PR with comprehensive description, screenshots, links

---

## Risk Mitigation

- [x] Tasks address risks from spec.md
  - Price calculation performance → T048 (debouncing)
  - Mobile UX standards → Phase 4 (T026-T033)
  - localStorage quota → T041 (error handling)
  - Browser compatibility → T046 (prefers-reduced-motion)

- [x] Integration testing prevents breaking existing features
  - T024: Conditional rendering preserves existing catalog page
  - T025: E2E test verifies budget cart integration

---

## Estimation & Planning

- [x] Estimated effort documented
  - Total: 23-31 hours (3-4 days for one developer)
  - Breakdown by phase provided

- [x] Critical path identified
  - T001 → T005 → T009 → T013 → T014 → T015 → T021 → T022 → T023 → T024 → T025

- [x] Task distribution balanced
  - Setup: 4 tasks
  - Foundational: 7 tasks
  - US1 MVP: 14 tasks
  - US4 Mobile: 8 tasks
  - US2 Navigation: 4 tasks
  - US3 Persistence: 6 tasks
  - Polish: 7 tasks
  - Cleanup: 5 tasks

---

## Final Validation

- [x] All 55 tasks have unique IDs (T001-T055)
- [x] No duplicate file paths or task descriptions
- [x] Checkpoints mark completion of each major phase
- [x] Task order follows logical dependency chain
- [x] Format consistent: `[ID] [P?] [Story] Description`

---

## Status

✅ **TASKS READY FOR IMPLEMENTATION**

- All checklist items passed
- Tasks aligned with spec.md user stories
- SOLID architecture enforced
- Constitution compliance verified
- Testing strategy comprehensive
- Documentation planned

**Next Step**: Begin Phase 1 (Setup) with T001
