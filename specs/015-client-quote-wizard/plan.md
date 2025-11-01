# Implementation Plan: Client Quote Wizard

**Branch**: `015-client-quote-wizard` | **Date**: 2025-10-28 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/015-client-quote-wizard/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Implement a simplified 4-step wizard for end customers to create window quotations without technical complexity. The wizard guides users through: (1) room location selection, (2) dimensions and color, (3) glass solution selection with visual cards, and (4) optional services. The implementation will be a separate component alongside the existing technical form for commercial users, with localStorage persistence, responsive mobile design, and real-time price updates using the existing pricing engine.

## Technical Context

**Language/Version**: TypeScript 5.8.2 (strict mode), Node.js (ES2022 target via Next.js 15.2.3)  
**Primary Dependencies**: Next.js 15.2.3 (App Router), React 19.0.0 (Server Components), tRPC 11.0.0, Prisma 6.16.2, React Hook Form 7.63.0, Zod 4.1.1  
**Storage**: PostgreSQL via Prisma ORM (existing multi-tenant schema with Model, GlassSolution, Service, Color, QuoteItem models)  
**Testing**: Vitest 3.2.4 (unit/integration), Playwright 1.55.1 (E2E)  
**Target Platform**: Web (desktop + mobile browsers, responsive design for <768px, 768-1024px, >1024px)  
**Project Type**: Web application (Next.js 15 App Router with Server Components + Client Components)  
**Performance Goals**: 
- Price calculation updates <200ms (debounced)
- Initial wizard load <1 second
- Step transitions <100ms (with animations)
- localStorage operations <50ms

**Constraints**: 
- WCAG 2.1 AA accessibility compliance
- Touch targets ≥44x44px on mobile
- Keyboard navigation support
- localStorage graceful degradation (5% of users may not have it)
- Browser support: last 2 versions of Chrome, Firefox, Safari, Edge

**Scale/Scope**: 
- 4 wizard steps + 1 summary page = 5 screen components
- Estimated 40-60% mobile traffic
- Support for existing multi-tenant architecture
- Integration with existing Budget Cart and pricing engine

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Reference: `.specify/memory/constitution.md` - verify feature complies with all principles.

### Core Values Compliance

- [x] **Clarity Over Complexity**: Design uses clear, descriptive names and simple logic
  - Wizard step components have clear names (location-step, dimensions-step, glass-step, services-step, summary-step)
  - File organization follows SOLID principles with clear separation of concerns
  - Room location options are predefined with clear labels (Spanish UI text)

- [x] **Server-First Performance**: Heavy work done on server, appropriate caching strategy defined
  - [x] Caching strategy documented:
    - Glass solutions: 5-minute cache (rarely-changing)
    - Services: 5-minute cache (rarely-changing)
    - Model data: Already fetched server-side in parent page
    - User budget: Short cache (user-specific)
  - [x] SSR mutations use two-step invalidation: `invalidate()` + `router.refresh()`
    - Add-to-budget mutation will invalidate budget cache and refresh router

- [x] **One Job, One Place (SOLID Architecture)**: Modular architecture with clear separation
  - [x] Forms follow mandatory file organization (_components, _hooks, _schemas, _utils, _constants)
    - `_components/quote-wizard/` contains UI components only
    - `_hooks/` contains use-wizard-form, use-wizard-navigation, use-wizard-persistence, use-add-to-budget
    - `_schemas/` contains wizard-form.schema and wizard-steps.schema
    - `_utils/` contains wizard-form.utils and wizard-validation.utils
    - `_constants/` contains room-locations.constants and wizard-config.constants
  - [x] No SOLID violations: forms <100 lines UI-only, mutations in hooks, schemas extracted
    - Each step component targets <100 lines (UI orchestration only)
    - Mutation logic in use-add-to-budget.ts hook
    - Validation schemas extracted to _schemas/
  - [x] Magic numbers extracted to constants file
    - MIN_DIMENSION (500), MAX_DIMENSION (3000), DEBOUNCE_DELAY (300), LOCALSTORAGE_KEY_PREFIX
  - [x] Default values in utils, not hardcoded
    - getWizardDefaults() in wizard-form.utils.ts
  - [x] Business logic separated from UI rendering
    - Navigation logic in use-wizard-navigation.ts
    - Persistence logic in use-wizard-persistence.ts
    - Price calculation via existing tRPC procedure

- [x] **Flexible Testing**: Testing strategy defined (before/during/after - all features require tests before merge)
  - Unit tests: Vitest for utils, validation, hooks
  - Integration tests: React Testing Library for step components
  - E2E tests: Playwright for complete wizard flow (4 steps + summary + add to budget)
  - Tests will be written during implementation phase

- [x] **Extend, Don't Modify**: New features add code, don't change existing working code
  - Wizard implemented as NEW component in `_components/quote-wizard/`
  - Existing catalog page (`/catalog/[modelId]`) and ModelFormWrapper remain unchanged
  - Conditional rendering allows coexistence of wizard and technical form
  - No modifications to existing pricing engine or budget cart

- [x] **Security From the Start**: Input validation and authorization checks at every entry point
  - [x] User permissions checked server-side (middleware, tRPC, Server Components)
    - Budget cart already has auth checks (existing tRPC procedures)
    - Wizard reads from authenticated budget context
  - [x] All user input validated with Zod schemas
    - Dimension validation: min 500mm, max 3000mm
    - Room location: enum or free text with max length 100
    - Glass solution ID: exists in database
    - Service IDs: array of valid IDs

- [x] **Track Everything Important**: Logging strategy defined for errors and significant events
  - [x] Winston logger used ONLY in server-side code (never in Client Components)
    - Wizard components are Client Components (no Winston usage)
    - Server-side logging in tRPC procedures (existing)
  - [x] Error messages to users in Spanish, technical logs in English
    - All UI error messages in Spanish (validation errors, network failures)
    - Console errors in English for debugging

### Language & Communication

- [x] Code/comments/commits in English only
  - All code, function names, comments in English
  - Example: `useWizardForm()`, `getWizardDefaults()`, `validateDimensions()`

- [x] UI text in Spanish (es-LA) only
  - Step titles: "¿Dónde irá la ventana?", "Dimensiones", "Vidrio", "Servicios Adicionales"
  - Buttons: "Siguiente", "Atrás", "Ver Resumen", "Agregar al Presupuesto"
  - Error messages: "El ancho debe estar entre 500mm y 3000mm"
  - Room locations: "Alcoba principal", "Sala / Comedor", etc.

- [x] Commit messages follow Conventional Commits format
  - Example: `feat(wizard): add client quote wizard with 4-step flow`
  - Example: `feat(wizard): implement localStorage persistence`

### Technology Constraints

- [x] Uses required stack: Next.js 15 (App Router), TypeScript (strict), React 19, tRPC, Prisma, PostgreSQL
  - Next.js 15.2.3 App Router with Server Components (page.tsx)
  - Client Components for wizard interactivity ('use client')
  - tRPC 11.0.0 for API calls (existing procedures + potential new ones)
  - Prisma 6.16.2 for database access (existing models)
  - TypeScript 5.8.2 strict mode

- [x] No prohibited technologies (Vue/Angular/Svelte, non-TailwindCSS frameworks, Winston in browser)
  - Pure React 19 with Next.js
  - TailwindCSS for all styling
  - No Winston in Client Components

- [x] UI components use Shadcn/ui + Radix UI + TailwindCSS
  - Button, Card, Input, Select (Combobox for location), Checkbox, Progress components
  - Custom step indicator component built with Radix primitives

### Quality Gates

- [x] TypeScript strict mode enabled, no type errors expected
  - `tsconfig.json` already has strict: true
  - All wizard code will pass type checking

- [x] Biome/Ultracite formatting rules followed
  - Existing config will be applied
  - Pre-commit hooks ensure compliance

- [x] Tests planned for all user journeys (unit/integration/E2E as appropriate)
  - Unit: validation utils, wizard navigation logic, localStorage persistence
  - Integration: step components with React Testing Library
  - E2E: Full wizard flow with Playwright (US1, US2, US3, US4)

- [x] Changelog entry planned for user-facing changes
  - Entry will be added to CHANGELOG.md under "Added" section
  - Format: "Added simplified 4-step quote wizard for end customers (US-007)"

- [x] Migration notes prepared if breaking changes
  - No breaking changes (wizard is additive feature)
  - No database migrations required (uses existing schema)

### Principle Priority Resolution

No conflicts detected. All principles align for this feature:
- Security: Input validation with Zod, server-side auth checks
- SOLID: Clear file organization enforced
- Clarity: Simple step-by-step flow, descriptive naming
- Server-First: Data fetched server-side, client handles interactivity only
- Testing: Comprehensive test coverage planned
- Extend: No modifications to existing code
- Logging: Spanish errors for users, English logs for debugging

**Result**: ✅ PASS - No violations, no justification needed

## Project Structure

### Documentation (this feature)

```text
specs/015-client-quote-wizard/
├── spec.md              # Feature specification (completed)
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (to be generated)
├── data-model.md        # Phase 1 output (to be generated)
├── quickstart.md        # Phase 1 output (to be generated)
├── contracts/           # Phase 1 output (to be generated)
│   └── wizard-api.yaml  # tRPC procedure contracts
├── checklists/
│   └── requirements.md  # Spec quality checklist (completed)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
src/app/(public)/catalog/[modelId]/
├── page.tsx                         # EXISTING - Server Component (fetch model data)
├── _components/
│   ├── form/
│   │   └── model-form-wrapper.tsx   # EXISTING - Technical form for commercials
│   ├── model-sidebar-wrapper.tsx    # EXISTING - Desktop sidebar
│   └── quote-wizard/                # NEW - Client quote wizard
│       ├── quote-wizard.tsx         # Main wizard orchestrator (<150 lines)
│       ├── wizard-progress.tsx      # Progress indicator (dots/steps)
│       ├── wizard-step-container.tsx # Generic step wrapper with animations
│       └── steps/
│           ├── location-step.tsx    # Step 1: Room location selector
│           ├── dimensions-step.tsx  # Step 2: Width/height + color
│           ├── glass-step.tsx       # Step 3: Glass solution cards
│           ├── services-step.tsx    # Step 4: Optional services checkboxes
│           └── summary-step.tsx     # Step 5: Review and confirm
├── _hooks/
│   ├── use-wizard-form.ts           # Multi-step form state management
│   ├── use-wizard-navigation.ts     # Step navigation logic (next/back/jump)
│   ├── use-wizard-persistence.ts    # localStorage save/restore with graceful degradation
│   └── use-add-to-budget.ts         # Mutation: add item to budget + cache invalidation
├── _schemas/
│   ├── wizard-form.schema.ts        # Main wizard Zod schema (all steps combined)
│   └── wizard-steps.schema.ts       # Individual step schemas (location, dimensions, glass, services)
├── _utils/
│   ├── wizard-form.utils.ts         # getWizardDefaults(), transformWizardData(), types
│   └── wizard-validation.utils.ts   # Custom validators (dimension range, glass availability)
└── _constants/
    ├── room-locations.constants.ts  # ROOM_LOCATIONS array (matches US-008)
    └── wizard-config.constants.ts   # MIN_DIMENSION, MAX_DIMENSION, DEBOUNCE_DELAY, etc.

src/server/api/routers/
├── budget.ts                        # EXISTING - May need extension for wizard
└── catalog.ts                       # EXISTING - get-model-by-id already exists

prisma/
└── schema.prisma                    # EXISTING - No changes needed (uses QuoteItem model)

tests/
├── unit/
│   └── wizard/
│       ├── wizard-navigation.test.ts    # Navigation logic tests
│       ├── wizard-persistence.test.ts   # localStorage persistence tests
│       └── wizard-validation.test.ts    # Dimension validation tests
├── integration/
│   └── wizard/
│       ├── location-step.test.tsx       # Step component tests
│       ├── dimensions-step.test.tsx
│       ├── glass-step.test.tsx
│       ├── services-step.test.tsx
│       └── summary-step.test.tsx
└── e2e/
    └── wizard/
        ├── wizard-complete-flow.spec.ts     # US1: Complete quotation
        ├── wizard-navigation.spec.ts        # US2: Back navigation
        ├── wizard-persistence.spec.ts       # US3: Auto-save progress
        └── wizard-mobile.spec.ts            # US4: Mobile responsive
```

**Structure Decision**: 

This feature uses the **single Next.js App Router project structure** (Option 1). The wizard is implemented as a new component tree within the existing `/catalog/[modelId]` route, following the established pattern of private folders (`_components/`, `_hooks/`, etc.) for feature colocation.

**Key Architectural Decisions**:

1. **Colocation**: All wizard-related code lives under `/catalog/[modelId]/` for proximity to its usage point
2. **SOLID Compliance**: Strict separation of concerns with dedicated folders for hooks, schemas, utils, and constants
3. **Additive Implementation**: No modifications to existing ModelFormWrapper (technical form for commercials)
4. **Conditional Rendering**: Page.tsx can conditionally render wizard vs technical form based on user role or feature flag
5. **Reuse Existing Infrastructure**: Leverages existing tRPC procedures, Prisma models, and Server Component data fetching

**No Complexity Tracking Required**: Feature adheres to all constitution principles without violations.

---

## Planning Summary

### Phase 0: Research (Completed) ✅

**Output**: `research.md`

**Key Decisions**:
1. **State Management**: React Hook Form + useState for wizard-level state
2. **Persistence**: localStorage with progressive enhancement (graceful degradation)
3. **Performance**: 300ms debounce + TanStack Query caching
4. **Responsive Design**: Mobile-first TailwindCSS with Radix UI (44x44px touch targets)
5. **Animations**: Framer Motion (optional) or CSS transitions (200ms duration)
6. **Icons**: Lucide icons from Shadcn/ui with category-color mapping
7. **Integration**: Existing `budget.add-item` API + two-step invalidation pattern
8. **Data Source**: Shared `ROOM_LOCATIONS` constants (matching US-008)

**Research Tasks Resolved**: 8/8
- Multi-step form state management
- localStorage persistence strategy
- Debounced price calculation
- Mobile touch targets & responsive design
- Step transition animations
- Glass solution visual categorization
- Wizard-to-budget integration
- Room location data source

---

### Phase 1: Design & Contracts (Completed) ✅

**Outputs**: 
- `data-model.md` - Data structures and entity definitions
- `contracts/wizard-api.md` - tRPC API contracts and specifications
- `quickstart.md` - Step-by-step implementation guide
- `.github/copilot-instructions.md` - Updated with wizard technologies

**Key Artifacts**:

1. **Data Model**:
   - `WizardFormData` (client-side state)
   - `WizardStepConfig` (step metadata)
   - `GlassSolutionWithIcon` (enriched glass solutions)
   - `PriceCalculation` (transient calculations)
   - No database migrations required (uses existing models)

2. **API Contracts**:
   - ✅ Reuses existing: `catalog.get-model-by-id`
   - ⚠️ Minor changes: `quote.calculate-item-price` (add `serviceIds`)
   - ⚠️ Minor changes: `budget.add-item` (add `roomLocation` from US-008)
   - ❓ Verify exists: `catalog.get-services`

3. **File Organization** (SOLID Architecture):
   - `_components/quote-wizard/` - UI components only
   - `_hooks/` - State, navigation, persistence, mutations
   - `_schemas/` - Zod validation schemas
   - `_utils/` - Pure functions, transformations, types
   - `_constants/` - Magic numbers, room locations, config

4. **Quickstart Guide**:
   - 8-phase implementation plan
   - Code samples for hooks, components, schemas
   - Testing strategy (unit/integration/E2E)
   - Troubleshooting common issues

---

## Constitution Re-Check (Post-Design) ✅

All design decisions comply with constitution principles:

- ✅ **SOLID Architecture**: Strict file organization enforced
- ✅ **Server-First Performance**: Caching strategy defined, two-step invalidation pattern
- ✅ **Security**: Input validation with Zod, server-side auth checks
- ✅ **Clarity**: Clear naming, Spanish UI, English code
- ✅ **Testing**: Comprehensive test strategy across all layers
- ✅ **Extend, Don't Modify**: Additive implementation (no changes to existing form)
- ✅ **Logging**: Winston server-side only, Spanish errors for users

**No violations detected** - Ready for implementation phase

---

## Next Steps

### Ready for Implementation

✅ **Planning Phase Complete** - All research and design artifacts generated

**To Begin Implementation**:

1. Run `/speckit.tasks` to generate task breakdown for development
2. Follow `quickstart.md` phase-by-phase approach
3. Start with Phase 0 (verify existing APIs) before writing new code
4. Implement tests alongside features (unit → integration → E2E)
5. Conduct user testing after MVP (P1 user stories) complete

**Estimated Development Time**: 8-13 days (based on 8-point story)

**Critical Path**:
1. Verify/update tRPC procedures (1 day)
2. Create file structure + constants + schemas (1 day)
3. Implement custom hooks (2 days)
4. Build step components (3 days)
5. Integrate with page + main wizard orchestrator (2 days)
6. Testing + bug fixes (2-3 days)
7. User testing + iteration (1-2 days)

**Success Metrics** (from spec.md):
- Quotation time: <3 minutes (vs current 10+ min)
- Abandonment rate: <15% (vs current 35%)
- Budget→Quote conversion: ≥55% (vs current 42%)
- Mobile completion rate: ≥90%
- SUS Score: ≥8/10

---

## Documentation Index

All planning artifacts completed and ready for reference:

- ✅ `spec.md` - Feature specification (User Stories, Requirements, Success Criteria)
- ✅ `plan.md` - This file (Technical Context, Constitution Check, Project Structure)
- ✅ `research.md` - Technical decisions and alternatives considered
- ✅ `data-model.md` - Entity definitions, schemas, transformations
- ✅ `contracts/wizard-api.md` - tRPC API contracts and error handling
- ✅ `quickstart.md` - Step-by-step implementation guide with code samples
- ✅ `checklists/requirements.md` - Spec quality validation (all checks passed)
- ✅ `tasks.md` - Implementation task breakdown (55 tasks across 8 phases)
- ✅ `checklists/tasks.md` - Task validation checklist (all checks passed)

**Agent Context Updated**: `.github/copilot-instructions.md` includes wizard technologies

---

## Phase 2 Summary: Task Generation (COMPLETE)

**Generated**: `tasks.md` with 55 implementation tasks  
**Validated**: `checklists/tasks.md` - all quality checks passed

### Task Organization

**Total Tasks**: 55 tasks across 8 implementation phases

1. **Phase 1: Setup** (4 tasks) - Directory structure and constants
2. **Phase 2: Foundational** (7 tasks) - BLOCKING prerequisites (schema, APIs, types)
3. **Phase 3: User Story 1 - Complete Simple Quotation** (14 tasks) - P1 MVP
4. **Phase 4: User Story 4 - Mobile-Optimized** (8 tasks) - P2
5. **Phase 5: User Story 2 - Navigate Backward** (4 tasks) - P2
6. **Phase 6: User Story 3 - Auto-save Progress** (6 tasks) - P3
7. **Phase 7: Polish** (7 tasks) - Animations, accessibility, UX refinements
8. **Phase 8: Documentation** (5 tasks) - README, linting, testing, PR

### Key Highlights

- **Parallel Execution**: 23 tasks marked with [P] can run independently
- **SOLID Compliance**: All tasks follow mandatory file organization (_components/, _hooks/, _schemas/, _utils/, _constants/)
- **Test Coverage**: 5 test tasks (E2E, integration, unit) covering all user stories
- **Estimated Effort**: 23-31 hours total (3-4 working days for one developer)
- **Critical Path**: 11 tasks on shortest path to MVP

### Documentation Index

All planning documents complete:
- ✅ `spec.md` - Feature specification with 4 user stories
- ✅ `plan.md` - Technical implementation plan (this file)
- ✅ `research.md` - 8 technical decisions with alternatives
- ✅ `data-model.md` - Entity definitions, schemas, transformations
- ✅ `contracts/wizard-api.md` - tRPC API contracts and error handling
- ✅ `quickstart.md` - Step-by-step implementation guide with code samples
- ✅ `tasks.md` - 55 implementation tasks organized by user story
- ✅ `checklists/requirements.md` - Spec quality validation (all checks passed)
- ✅ `checklists/tasks.md` - Task validation checklist (all checks passed)

---

**Planning Status**: ✅ **COMPLETE**  
**Tasks Status**: ✅ **READY FOR IMPLEMENTATION**  
**Constitution Compliance**: ✅ **PASS**  
**Next Step**: Begin Phase 1 (Setup) with task T001
