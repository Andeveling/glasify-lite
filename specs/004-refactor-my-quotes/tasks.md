# Tasks: My Quotes UX Redesign

**Input**: Design documents from `/specs/004-refactor-my-quotes/`  
**Prerequisites**: plan.md ✅, spec.md ✅

**Tests**: Included as per Test-First constitutional requirement (NON-NEGOTIABLE)

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Install dependencies and configure environment for export functionality

- [X] **T001** [P] Install @react-pdf/renderer dependency: `pnpm add @react-pdf/renderer`
- [X] **T002** [P] Install exceljs dependency: `pnpm add exceljs`
- [X] **T003** [P] Add environment variables to `.env`: NEXT_PUBLIC_COMPANY_NAME, NEXT_PUBLIC_COMPANY_LOGO_URL, EXPORT_PDF_PAGE_SIZE, EXPORT_MAX_ITEMS
- [X] **T004** Create TypeScript types in `src/types/export.types.ts` (ExportFormat, ExportOptions, QuotePDFData, QuoteExcelData)
- [X] **T005** Create TypeScript types in `src/types/window.types.ts` (WindowType enum with 20+ types)

**Checkpoint**: Dependencies installed, types defined - can begin feature work

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Create shared utilities and components that ALL user stories will depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] **T006** [P] Create window diagram map utility in `src/lib/utils/window-diagram-map.ts` (maps WindowType → SVG path)
- [X] **T007** [P] Create image utils in `src/lib/utils/image-utils.ts` (CDN helpers, fallback logic)
- [X] **T008** [P] Create SVG diagrams directory structure: `public/diagrams/windows/`
- [X] **T009** Design and export 10 basic SVG window diagrams to `public/diagrams/windows/` (french-2-panel, french-4-panel, sliding-2-panel, sliding-3-panel, fixed-single, awning, casement-left, casement-right, hopper, tilt-turn)
- [ ] **T010** Create shared `WindowDiagram` component in `src/components/quote/window-diagram.tsx` (renders SVG by type)

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Understanding Quote Status at a Glance (Priority: P1) 🎯 MVP

**Goal**: Replace confusing "Borrador" label with clear "En edición" status badges featuring icons and tooltips, eliminating user confusion

**Independent Test**: View /my-quotes page and verify all status labels are self-explanatory with icons, tooltips explain meaning, and CTAs are clear

### Tests for User Story 1 (Test-First - MUST FAIL before implementation)

- [ ] **T011** [P] [US1] Unit test for status config in `tests/unit/utils/status-config.test.ts` (test getStatusLabel, getStatusIcon, getStatusTooltip functions)
- [ ] **T012** [P] [US1] Component test for QuoteStatusBadge in `tests/unit/components/quote-status-badge.test.tsx` (test tooltip, icon, label rendering)
- [ ] **T013** [P] [US1] E2E test for status clarity in `e2e/my-quotes/quote-status-clarity.spec.ts` (test "En edición" displays for draft, tooltips appear on hover)

### Implementation for User Story 1

- [ ] **T014** [P] [US1] Create status configuration utility in `src/app/(public)/my-quotes/_utils/status-config.ts` (define statusConfig object with labels, icons, tooltips, colors, CTAs for draft/sent/canceled)
- [ ] **T015** [P] [US1] Create QuoteStatusBadge component in `src/app/(public)/my-quotes/_components/quote-status-badge.tsx` (use statusConfig, render Badge with icon + tooltip from Radix UI)
- [ ] **T016** [P] [US1] Create shared StatusBadge molecule in `src/components/quote/status-badge.tsx` (reusable version for other pages)
- [ ] **T017** [US1] Modify QuoteListItem component in `src/app/(public)/my-quotes/_components/quote-list-item.tsx` (replace existing badge with QuoteStatusBadge, add CTA button based on status)
- [ ] **T018** [US1] Modify QuoteDetailView component in `src/app/(public)/my-quotes/[quoteId]/_components/quote-detail-view.tsx` (use QuoteStatusBadge)

**Checkpoint**: User Story 1 complete - status labels are now clear and self-explanatory ✅

---

## Phase 4: User Story 2 - Visualizing Quote Items with Product Images (Priority: P1) 🎯 MVP

**Goal**: Add product thumbnail images to quote items with SVG fallback diagrams, enabling visual identification of products in <3 seconds

**Independent Test**: View /my-quotes/[quoteId] and verify each item shows thumbnail image or fallback diagram, clicking opens lightbox with larger view

### Tests for User Story 2 (Test-First - MUST FAIL before implementation)

- [ ] **T019** [P] [US2] Unit test for window diagram fallback in `tests/unit/utils/window-diagram-map.test.ts` (test getWindowDiagram returns correct SVG, falls back to default for unknown types)
- [ ] **T020** [P] [US2] Component test for QuoteItemImage in `tests/unit/components/quote-item-image.test.tsx` (test image loading, fallback rendering, click handler)
- [ ] **T021** [P] [US2] E2E test for image viewer in `e2e/my-quotes/quote-image-viewer.spec.ts` (test clicking thumbnail opens lightbox, shows specifications overlay)

### Implementation for User Story 2

- [ ] **T022** [P] [US2] Create QuoteItemImage component in `src/app/(public)/my-quotes/[quoteId]/_components/quote-item-image.tsx` (lazy-load product image, fallback to WindowDiagram on error, handle sizes sm/md/lg)
- [ ] **T023** [P] [US2] Create ImageViewerDialog component in `src/app/(public)/my-quotes/[quoteId]/_components/image-viewer-dialog.tsx` (lightbox using Radix Dialog, show enlarged image with dimensions overlay)
- [ ] **T024** [P] [US2] Create QuoteItemsGrid component in `src/app/(public)/my-quotes/[quoteId]/_components/quote-items-grid.tsx` (replace table with grid layout, 3-4 cols desktop, 1-2 cols mobile)
- [ ] **T025** [US2] Modify QuoteDetailView component in `src/app/(public)/my-quotes/[quoteId]/_components/quote-detail-view.tsx` (integrate QuoteItemsGrid, add ImageViewerDialog, wire up click handlers)
- [ ] **T026** [P] [US2] Create QuoteItemPreview component in `src/app/(public)/my-quotes/_components/quote-item-preview.tsx` (show first 3 items with thumbnails for list view)
- [ ] **T027** [US2] Modify QuoteListItem component in `src/app/(public)/my-quotes/_components/quote-list-item.tsx` (add QuoteItemPreview below project info)
- [ ] **T028** [P] [US2] Design and export 10 additional SVG window diagrams to `public/diagrams/windows/` (bay-window, picture-window, double-hung, single-hung, transom, louvre, pivot, corner, bow-window, skylight)

**Checkpoint**: User Story 2 complete - products are now visually identifiable ✅

---

## Phase 5: User Story 3 - Exporting Quotes for Sharing and Archival (Priority: P2)

**Goal**: Enable PDF and Excel export with professional formatting, allowing users to share quotes externally

**Independent Test**: Click "Exportar PDF" and "Exportar Excel" on /my-quotes/[quoteId], verify downloads with correct filenames and complete data

### Tests for User Story 3 (Test-First - MUST FAIL before implementation)

- [ ] **T029** [P] [US3] Unit test for filename generation in `tests/unit/utils/export-filename.test.ts` (test generateExportFilename produces "Cotizacion_ProjectName_YYYY-MM-DD.ext")
- [ ] **T030** [P] [US3] Unit test for PDF generation in `tests/unit/export/pdf-generation.test.ts` (test QuotePDFDocument renders all sections: header, items table, footer)
- [ ] **T031** [P] [US3] Unit test for Excel generation in `tests/unit/export/excel-generation.test.ts` (test workbook has 2 sheets, formulas, formatting)
- [ ] **T032** [P] [US3] Contract test for export Server Actions in `tests/contract/export-actions.contract.ts` (validate exportQuoteInputSchema and exportQuoteOutputSchema with Zod)
- [ ] **T033** [P] [US3] Integration test for quote export in `tests/integration/quote-export.test.ts` (test exportQuotePDF and exportQuoteExcel Server Actions end-to-end)
- [ ] **T034** [P] [US3] E2E test for PDF export in `e2e/my-quotes/quote-export-pdf.spec.ts` (test button click, file download, filename format, loading state)
- [ ] **T035** [P] [US3] E2E test for Excel export in `e2e/my-quotes/quote-export-excel.spec.ts` (test button click, file download, filename format)

### Implementation for User Story 3

#### PDF Export Implementation

- [ ] **T036** [P] [US3] Create PDF styles config in `src/lib/export/pdf/pdf-styles.ts` (define fonts, colors, spacing, table styles)
- [ ] **T037** [P] [US3] Create PDF utils in `src/lib/export/pdf/pdf-utils.ts` (formatCurrency, formatDate, encodeImage helpers)
- [ ] **T038** [US3] Create QuotePDFDocument component in `src/lib/export/pdf/quote-pdf-document.tsx` (React-PDF template with header, project info, items table, totals, footer)
- [ ] **T039** [P] [US3] Create export filename utility in `src/app/(public)/my-quotes/_utils/export-filename.ts` (generateExportFilename function)

#### Excel Export Implementation

- [ ] **T040** [P] [US3] Create Excel styles config in `src/lib/export/excel/excel-styles.ts` (define cell formats, column widths, fonts)
- [ ] **T041** [P] [US3] Create Excel utils in `src/lib/export/excel/excel-utils.ts` (currency formatting, formula helpers)
- [ ] **T042** [US3] Create Excel workbook generator in `src/lib/export/excel/quote-excel-workbook.ts` (create 2 sheets: summary + items, add formulas, apply formatting)

#### Server Actions

- [ ] **T043** [US3] Create export Server Actions in `src/app/_actions/quote-export.actions.ts` (exportQuotePDF and exportQuoteExcel actions with Zod validation, Winston logging, error handling)

#### UI Components

- [ ] **T044** [P] [US3] Create useQuoteExport hook in `src/app/(public)/my-quotes/_hooks/use-quote-export.ts` (wrapper for Server Actions with loading/error states)
- [ ] **T045** [P] [US3] Create QuoteExportButtons component in `src/app/(public)/my-quotes/[quoteId]/_components/quote-export-buttons.tsx` (PDF/Excel buttons with icons, loading states, error handling)
- [ ] **T046** [US3] Modify quote detail page in `src/app/(public)/my-quotes/[quoteId]/page.tsx` (add QuoteExportButtons to header and footer)

**Checkpoint**: User Story 3 complete - quotes can now be exported professionally ✅

---

## Phase 6: User Story 4 - Quick Quote Comparison and Filtering (Priority: P3)

**Goal**: Add filtering, search, and sorting to help users find specific quotes quickly (<20 seconds with 20+ quotes)

**Independent Test**: Apply status filter, search for project name, sort by date on /my-quotes - verify URL updates, results filter correctly

### Tests for User Story 4 (Test-First - MUST FAIL before implementation)

- [ ] **T047** [P] [US4] Unit test for useQuoteFilters hook in `tests/unit/hooks/use-quote-filters.test.ts` (test filter state management, URL sync, debouncing)
- [ ] **T048** [P] [US4] E2E test for filtering in `e2e/my-quotes/quote-filters.spec.ts` (test status filter, search input, sort dropdown, URL params)

### Implementation for User Story 4

- [ ] **T049** [P] [US4] Create useQuoteFilters hook in `src/app/(public)/my-quotes/_hooks/use-quote-filters.ts` (manage filter state, sync with URL searchParams, debounce search)
- [ ] **T050** [P] [US4] Create QuoteFilters component in `src/app/(public)/my-quotes/_components/quote-filters.tsx` (status dropdown, search input with debounce, sort select)
- [ ] **T051** [US4] Modify MyQuotesPage in `src/app/(public)/my-quotes/page.tsx` (add QuoteFilters, pass filters to tRPC query, handle empty filtered state)
- [ ] **T052** [US4] Extend EmptyQuotesState in `src/app/(public)/my-quotes/_components/empty-quotes-state.tsx` (add variant for "no results found" vs "no quotes yet")

**Checkpoint**: User Story 4 complete - users can now efficiently find quotes ✅

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Final improvements affecting multiple user stories

- [ ] **T053** [P] Add accessibility attributes to all new components (aria-labels for icons, alt text for images, ARIA roles for dialogs)
- [ ] **T054** [P] Add Winston logging to all export operations in `src/app/_actions/quote-export.actions.ts` (log quote ID, format, duration, errors with correlation IDs)
- [ ] **T055** [P] Verify WCAG AA color contrast for status badges (use contrast checker, adjust colors in status-config.ts if needed)
- [ ] **T056** [P] Optimize SVG diagrams for file size (minify, remove unnecessary paths, ensure <5KB each)
- [ ] **T057** Run full E2E test suite in CI (all 8 spec files: status clarity, PDF export, Excel export, filters, image viewer)
- [ ] **T058** Performance audit: verify quote list loads <2s with 50 quotes, quote detail <1.5s with 30 items, export <10s
- [ ] **T059** Create documentation in `specs/004-refactor-my-quotes/quickstart.md` (how to add new window diagrams, customize PDF/Excel templates, add export formats)
- [ ] **T060** Update CHANGELOG.md with feature summary and migration notes (if any)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup (T001-T005) completion - BLOCKS all user stories
- **User Story 1 (Phase 3)**: Depends on Foundational (T006-T010) - Can start immediately after
- **User Story 2 (Phase 4)**: Depends on Foundational (T006-T010) - Can start immediately after (parallel with US1)
- **User Story 3 (Phase 5)**: Depends on Foundational (T006-T010) - Can start immediately after (parallel with US1/US2)
- **User Story 4 (Phase 6)**: Depends on Foundational (T006-T010) - Can start immediately after (parallel with US1/US2/US3)
- **Polish (Phase 7)**: Depends on desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Independent - only needs Foundational phase
- **User Story 2 (P1)**: Independent - only needs Foundational phase (window diagrams)
- **User Story 3 (P2)**: Independent - only needs Foundational phase
  - *Optional enhancement*: Can integrate with US2 (images in PDF) but works without
- **User Story 4 (P3)**: Independent - only needs Foundational phase
  - Enhances all stories but doesn't depend on them

### Within Each User Story (TDD Order)

1. **Tests FIRST** - Must write and verify they FAIL
2. **Utils/Config** - Pure functions (can parallelize if different files)
3. **Components** - UI implementation (sequential if same file, parallel if different)
4. **Integration** - Wire components together
5. **Verify tests PASS**

### Parallel Opportunities

**Setup Phase**:
```
T001 (install @react-pdf/renderer) [P]
T002 (install exceljs) [P]
T003 (add env vars) [P]
```

**Foundational Phase**:
```
T006 (window-diagram-map.ts) [P]
T007 (image-utils.ts) [P]
T008 (create diagrams dir) [P]
T009 (design SVGs) [P]
T010 (WindowDiagram component) [P]
```

**User Story 1 Tests**:
```
T011 (status-config.test.ts) [P]
T012 (quote-status-badge.test.tsx) [P]
T013 (quote-status-clarity.spec.ts) [P]
```

**User Story 1 Implementation**:
```
T014 (status-config.ts) [P]
T015 (quote-status-badge.tsx) [P]
T016 (status-badge.tsx shared) [P]
```

**User Story 2 Tests**:
```
T019 (window-diagram-map.test.ts) [P]
T020 (quote-item-image.test.tsx) [P]
T021 (quote-image-viewer.spec.ts) [P]
```

**User Story 2 Implementation**:
```
T022 (quote-item-image.tsx) [P]
T023 (image-viewer-dialog.tsx) [P]
T024 (quote-items-grid.tsx) [P]
T026 (quote-item-preview.tsx) [P]
```

**User Story 3 Tests** (all parallel):
```
T029-T035 [P] (7 test files in different locations)
```

**User Story 3 Implementation** (PDF and Excel in parallel):
```
PDF Track:
T036 (pdf-styles.ts) [P]
T037 (pdf-utils.ts) [P]
T038 (quote-pdf-document.tsx) [P]

Excel Track:
T040 (excel-styles.ts) [P]
T041 (excel-utils.ts) [P]
T042 (quote-excel-workbook.ts) [P]

Shared:
T039 (export-filename.ts) [P]
```

**Cross-Story Parallelization**:

Once Foundational (Phase 2) completes, ALL 4 user stories can proceed in parallel:

```
Team Member A: User Story 1 (Status Labels) - T011 → T018
Team Member B: User Story 2 (Images) - T019 → T028
Team Member C: User Story 3 (Exports) - T029 → T046
Team Member D: User Story 4 (Filters) - T047 → T052
```

---

## Implementation Strategy

### MVP First (User Stories 1 + 2 Only) - 1 Week

**Why**: These two P1 stories deliver 80% of user value (eliminate confusion + visual recognition)

1. Complete Phase 1: Setup (T001-T005)
2. Complete Phase 2: Foundational (T006-T010)
3. Complete Phase 3: User Story 1 (T011-T018)
4. Complete Phase 4: User Story 2 (T019-T028)
5. **STOP and VALIDATE**: Test both stories independently
6. Deploy/demo if ready

**Deliverable**: Users can now understand quote status AND visually identify products

### Full Feature (All 4 User Stories) - 3-4 Weeks

**Incremental Delivery Strategy**:

1. **Week 1**: Setup + Foundational + US1 + US2 → Deploy MVP
   - Measure: Status comprehension rate, image load times
2. **Week 2**: User Story 3 (Exports) → Deploy
   - Measure: Export success rate, generation time
3. **Week 3**: User Story 4 (Filters) → Deploy
   - Measure: Search usage, time-to-find metrics
4. **Week 4**: Polish (Phase 7) → Final release
   - Measure: All success criteria (SC-001 through SC-008)

### Parallel Team Strategy (If 4 Developers Available)

**Fastest path** (2-3 weeks total):

**Week 1**:
- All: Complete Setup + Foundational together (T001-T010)

**Week 2** (all parallel):
- Dev A: User Story 1 (T011-T018) - 2-3 days
- Dev B: User Story 2 (T019-T028) - 4-5 days
- Dev C: User Story 3 (T029-T046) - 5-7 days
- Dev D: User Story 4 (T047-T052) - 2-3 days

**Week 3**:
- All: Integration testing, bug fixes, Polish (T053-T060)

---

## Task Summary

**Total Tasks**: 60 tasks

### Task Count Per Phase

- **Phase 1 (Setup)**: 5 tasks
- **Phase 2 (Foundational)**: 5 tasks (BLOCKING)
- **Phase 3 (User Story 1 - P1)**: 8 tasks (3 tests + 5 impl)
- **Phase 4 (User Story 2 - P1)**: 10 tasks (3 tests + 7 impl)
- **Phase 5 (User Story 3 - P2)**: 18 tasks (7 tests + 11 impl)
- **Phase 6 (User Story 4 - P3)**: 6 tasks (2 tests + 4 impl)
- **Phase 7 (Polish)**: 8 tasks

### Parallelizable Tasks

- **42 tasks marked [P]** (70% can run in parallel within constraints)
- **4 user stories can proceed in parallel** after Foundational phase

### Test Coverage

- **20 test tasks** (33% of total)
- **Unit tests**: 9 tasks
- **Component tests**: 2 tasks
- **Contract tests**: 1 task
- **Integration tests**: 1 task
- **E2E tests**: 7 tasks

### MVP Scope (Recommended)

**User Stories 1 + 2** = 23 tasks (T001-T028)
- Setup: 5 tasks
- Foundational: 5 tasks
- US1: 8 tasks
- US2: 10 tasks
- Minimal Polish: ~5 tasks (accessibility, logging)

**Total MVP**: ~28 tasks, ~1 week timeline

---

## Notes

- **[P] marker**: Different files, no dependencies - safe to parallelize
- **[Story] label**: Maps task to user story for independent tracking/deployment
- **TDD Order**: All tests before implementation (constitutional requirement)
- **Independent Stories**: Each story is separately testable and deployable
- **Commit Strategy**: Commit after each task or logical group
- **Checkpoints**: Validate story independence at each checkpoint
- **Avoid**: Same-file conflicts, cross-story dependencies that break independence

---

## Validation Checklist

Before marking feature complete:

- [ ] All 60 tasks completed and checked off
- [ ] All 20 test suites passing (unit + integration + E2E)
- [ ] All 4 user stories independently validated
- [ ] Performance benchmarks met (SC-003, SC-006, SC-008)
- [ ] Accessibility audit passed (WCAG AA)
- [ ] 20 SVG diagrams created and optimized
- [ ] Environment variables documented
- [ ] Quickstart.md created for future developers
- [ ] CHANGELOG.md updated
- [ ] Ready for production deployment
