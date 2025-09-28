# Tasks: UI/UX Glasify MVP

**Input**: Design documents from `/specs/002-ui-ux-requirements/`
**Prerequisites**: plan.md (required), research.md, data-model.md, contracts/, quickstart.md

## Execution Flow (main)
```
1. Load plan.md from feature directory
   → Tech stack: Next.js 15 App Router, shadcn/ui v3, Tailwind v4, tRPC, Prisma
   → Structure: Route groups (catalog), (quote), (checkout), (dashboard)/(admin)
2. Load design documents:
   → data-model.md: Modelo, GlassType, Service, Quote, QuoteItem entities
   → contracts/: tRPC contracts (catalog, quote) + UI navigation patterns
   → research.md: App Router with route groups, shadcn/ui, NextAuth v5
   → quickstart.md: Validation criteria and success metrics
3. Generate tasks by category:
   → Setup: Project structure, dependencies, route groups
   → Tests: Contract tests for tRPC endpoints, UI integration tests
   → Core: UI components, pages, navigation flows
   → Integration: Route handlers, middleware, state management
   → Polish: Accessibility, performance, error states
4. Apply task rules:
   → Different route groups/files = [P] for parallel
   → Same file/component = sequential (no [P])
   → Tests before implementation (TDD)
5. Tasks numbered T001-T030+ with dependencies
6. Focus on UI/UX implementation over backend logic
```

## Format: `[ID] [P?] Description`
- **[P]**: Can run in parallel (different files/route groups, no dependencies)
- Include exact file paths for Next.js App Router structure

## Phase 3.1: Setup & Project Structure
- [ ] T001 Create Next.js App Router structure with route groups: `(catalog)`, `(quote)`, `(checkout)`, `(dashboard)/(admin)`
- [ ] T002 Configure shadcn/ui v3 components with Tailwind v4 CSS variables from `src/styles/globals.css`
- [ ] T003 [P] Set up routing layouts for each route group with proper TypeScript types
- [ ] T004 [P] Configure NextAuth v5 middleware and session management for admin routes

## Phase 3.2: Tests First (TDD) ⚠️ MUST COMPLETE BEFORE 3.3
**CRITICAL: These tests MUST be written and MUST FAIL before ANY implementation**
- [ ] T005 [P] Contract test `catalog.list-models` tRPC endpoint in `tests/contract/catalog.list-models.spec.ts`
- [ ] T006 [P] Contract test `quote.calculate-item` tRPC endpoint in `tests/contract/quote.calculate-item.spec.ts`  
- [ ] T007 [P] Contract test `quote.add-item` tRPC endpoint in `tests/contract/quote.add-item.spec.ts`
- [ ] T008 [P] Contract test `quote.submit` tRPC endpoint in `tests/contract/quote.submit.spec.ts`
- [ ] T009 [P] Integration test catalog navigation flow in `tests/integration/catalog-flow.spec.ts`
- [ ] T010 [P] Integration test quote creation flow in `tests/integration/quote-flow.spec.ts`
- [ ] T011 [P] Integration test admin panel access in `tests/integration/admin-flow.spec.ts`

## Phase 3.3: UI Components (ONLY after tests are failing)
- [ ] T012 [P] `EmptyState` component in `src/components/ui/empty-state.tsx` with Spanish messages
- [ ] T013 [P] `LoadingSpinner` component in `src/components/ui/loading.tsx` with accessibility attributes
- [ ] T014 [P] `ErrorBoundary` component in `src/components/ui/error-boundary.tsx` with recovery actions
- [ ] T015 [P] `ModelCard` component in `src/app/(catalog)/_components/model-card.tsx`
- [ ] T016 [P] `QuoteItem` component in `src/app/(quote)/_components/quote-item.tsx`
- [ ] T017 [P] `PriceCalculator` component in `src/app/(quote)/_components/price-calculator.tsx`

## Phase 3.4: Route Group Pages (Sequential dependencies)
- [ ] T018 Catalog listing page `src/app/(catalog)/page.tsx` with model filtering and search
- [ ] T019 Model detail page `src/app/(catalog)/[modelId]/page.tsx` with compatibility display
- [ ] T020 Quote configuration page `src/app/(quote)/page.tsx` with real-time pricing (<200ms SLA)
- [ ] T021 Quote review page `src/app/(quote)/review/page.tsx` with item management
- [ ] T022 Checkout page `src/app/(checkout)/page.tsx` with contact form and validation
- [ ] T023 Admin dashboard `src/app/(dashboard)/(admin)/page.tsx` with model/pricing management

## Phase 3.5: Navigation & State Management
- [ ] T024 Navigation component in `src/app/_components/navigation.tsx` with route group awareness
- [ ] T025 Shopping cart state management with TanStack Query v5 integration
- [ ] T026 Form validation with Zod schemas and Spanish error messages
- [ ] T027 tRPC client configuration with error boundaries and retry logic

## Phase 3.6: Loading & Error States
- [ ] T028 [P] Loading templates for each route group: `loading.tsx` files
- [ ] T029 [P] Error templates for each route group: `error.tsx` files with recovery actions
- [ ] T030 [P] Not-found pages: `not-found.tsx` files with navigation back to catalog

## Phase 3.7: Integration & Middleware
- [ ] T031 NextAuth v5 session integration in route handlers
- [ ] T032 tRPC middleware for authentication and logging
- [ ] T033 Real-time price updates with optimistic UI updates
- [ ] T034 Form persistence across navigation (quote state)

## Phase 3.8: Accessibility & Performance
- [ ] T035 [P] WCAG 2.1 AA compliance audit for all components
- [ ] T036 [P] Mobile-responsive design validation across route groups
- [ ] T037 [P] Performance optimization: code splitting by route groups
- [ ] T038 [P] Internationalization setup for Spanish (es-LA) locale

## Phase 3.9: Polish & Testing
- [ ] T039 [P] Unit tests for UI components in `tests/unit/components/`
- [ ] T040 [P] E2E tests with Playwright for complete user flows
- [ ] T041 [P] Performance tests for <200ms pricing SLA in `tests/perf/`
- [ ] T042 [P] Update documentation in `docs/ui-patterns.md`
- [ ] T043 Manual testing following `specs/002-ui-ux-requirements/quickstart.md`

## Dependencies
- Setup (T001-T004) before all other phases
- Tests (T005-T011) before implementation (T012-T034)
- Components (T012-T017) before pages (T018-T023)
- Pages (T018-T023) before navigation (T024-T027)
- Core implementation before loading states (T028-T030)
- Integration (T031-T034) before polish (T035-T043)

## Parallel Execution Examples
```bash
# Phase 3.2 - Contract tests (all parallel, different files)
Task: "Contract test catalog.list-models in tests/contract/catalog.list-models.spec.ts"
Task: "Contract test quote.calculate-item in tests/contract/quote.calculate-item.spec.ts"
Task: "Contract test quote.add-item in tests/contract/quote.add-item.spec.ts"
Task: "Contract test quote.submit in tests/contract/quote.submit.spec.ts"

# Phase 3.3 - UI Components (all parallel, different files)
Task: "EmptyState component in src/components/ui/empty-state.tsx"
Task: "LoadingSpinner component in src/components/ui/loading.tsx"
Task: "ErrorBoundary component in src/components/ui/error-boundary.tsx"
Task: "ModelCard component in src/app/(catalog)/_components/model-card.tsx"
```

## Notes
- [P] tasks = different files/route groups, no dependencies
- All UI text must be in Spanish (es-LA)
- Use CSS variables from `src/styles/globals.css`, no hardcoded colors
- Verify tests fail before implementing features
- Route groups provide natural boundaries for parallel development
- Each route group has its own layout, loading, and error templates
- TanStack Query v5 for state management and caching
- NextAuth v5 for admin route protection

## Performance & Accessibility Requirements
- Price calculations must respond <200ms (SLA from contracts)
- Catalog loading must be <500ms
- WCAG 2.1 AA compliance mandatory
- Mobile-first responsive design
- Support modern browsers: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+

## Task Generation Rules
- Route groups enable parallel development of different domains
- shared components can be developed in parallel with route-specific components
- Loading and error states are developed after core functionality
- Accessibility and performance testing runs throughout, not just at the end
- Manual testing validates the complete user journey per quickstart.md