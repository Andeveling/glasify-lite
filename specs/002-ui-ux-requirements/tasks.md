# Tasks: UI/UX Glasify MVP - Next.js App Router Architecture

**Input**: Design documents from `/specs/002-ui-ux-requirements/`
**Prerequisites**: plan.md (required), research.md, data-model.md, contracts/, quickstart.md

## Next.js App Router Structure (Screaming Architecture)
```
src/app/
├── layout.tsx               # Root layout with providers
├── page.tsx                # Home redirect to /catalog  
├── global-error.tsx        # Global error boundary
├── not-found.tsx           # Global 404 page
├── (public)/               # Public routes (no auth required)
│   ├── layout.tsx          # Public layout with navigation
│   ├── loading.tsx         # Loading UI for public routes
│   ├── error.tsx           # Error UI for public routes
│   ├── not-found.tsx       # 404 for public routes
│   ├── _components/        # Shared components for public routes
│   ├── catalog/            # Glass catalog browsing
│   │   ├── page.tsx        # Catalog listing
│   │   ├── loading.tsx     # Catalog loading state
│   │   ├── [modelId]/      # Dynamic model routes
│   │   │   └── page.tsx    # Model detail page
│   │   └── _components/    # Catalog-specific components
│   └── quote/              # Quote creation (no auth)
│       ├── page.tsx        # Quote configuration
│       ├── review/         # Quote review
│       │   └── page.tsx    
│       ├── loading.tsx     # Quote loading states
│       └── _components/    # Quote-specific components
├── (auth)/                 # Authentication routes  
│   ├── layout.tsx          # Auth layout (centered forms)
│   ├── loading.tsx         # Auth loading states
│   ├── error.tsx           # Auth error handling
│   ├── signin/             # Sign in page
│   │   └── page.tsx
│   └── _components/        # Auth-specific components
└── (dashboard)/            # Protected admin routes
    ├── layout.tsx          # Dashboard layout with sidebar
    ├── loading.tsx         # Dashboard loading states  
    ├── error.tsx           # Dashboard error handling
    ├── not-found.tsx       # Protected 404 page
    ├── page.tsx            # Dashboard home
    ├── _components/        # Dashboard-specific components
    ├── models/             # Model management
    │   └── page.tsx
    ├── quotes/             # Quote management  
    │   └── page.tsx
    └── settings/           # Settings
        └── page.tsx
```

## Execution Flow (main)
```
1. Load plan.md from feature directory
   → Tech stack: Next.js 15 App Router, shadcn/ui v3, Tailwind v4, tRPC, Prisma
   → Structure: Route groups (public), (auth), (dashboard) with English routes
2. Load design documents:
   → data-model.md: Modelo, GlassType, Service, Quote, QuoteItem entities
   → contracts/: tRPC contracts (catalog, quote) + UI navigation patterns
   → research.md: App Router with route groups, shadcn/ui, NextAuth v5
   → quickstart.md: Validation criteria and success metrics
3. Generate tasks by category:
   → Setup: Project structure, dependencies, route groups
   → Tests: Contract tests for tRPC endpoints, UI integration tests
   → Core: UI components, pages, navigation flows using Next.js conventions
   → Integration: Route handlers, middleware, state management
   → Polish: Accessibility, performance, error states using Next.js special files
4. Apply task rules:
   → Different route groups/files = [P] for parallel development
   → Same file/component = sequential (no [P])
   → Tests before implementation (TDD)
   → Use Next.js special files explicitly (loading.tsx, error.tsx, not-found.tsx, etc.)
5. Tasks numbered T001-T060+ with dependencies and clear Next.js file paths
6. Focus on UI/UX implementation leveraging all Next.js App Router features
```

## Format: `[ID] [P?] Description`
- **[P]**: Can run in parallel (different files/route groups, no dependencies)
- Include exact file paths following Next.js App Router conventions
- All routes in English, content in Spanish (es-LA)
- Use Next.js special files explicitly: `loading.tsx`, `error.tsx`, `not-found.tsx`, etc.

## Phase 3.1: Setup & Next.js App Router Structure
- [ ] T001 Create Next.js App Router structure with route groups: `(public)`, `(auth)`, `(dashboard)`
- [ ] T002 Configure shadcn/ui v3 components with Tailwind v4 CSS variables from `src/styles/globals.css`
- [ ] T003 [P] Set up root layout `src/app/layout.tsx` with providers, metadata, and Spanish locale
- [ ] T004 [P] Configure NextAuth v5 middleware in `src/middleware.ts` for protected routes
- [ ] T005 [P] Create home page `src/app/page.tsx` with redirect to `/catalog`

## Phase 3.2: Route Group Layouts & Global Files
- [ ] T006 [P] Public layout `src/app/(public)/layout.tsx` with main navigation and footer
- [ ] T007 [P] Auth layout `src/app/(auth)/layout.tsx` with centered form design
- [ ] T008 [P] Dashboard layout `src/app/(dashboard)/layout.tsx` with sidebar navigation
- [ ] T009 [P] Global error boundary `src/app/global-error.tsx` with Spanish messages
- [ ] T010 [P] Global not-found page `src/app/not-found.tsx` with navigation options

## Phase 3.3: Tests First (TDD) ⚠️ MUST COMPLETE BEFORE 3.4
**CRITICAL: These tests MUST be written and MUST FAIL before ANY implementation**
- [ ] T011 [P] Contract test `catalog.list-models` tRPC endpoint in `tests/contract/catalog.list-models.spec.ts`
- [ ] T012 [P] Contract test `quote.calculate-item` tRPC endpoint in `tests/contract/quote.calculate-item.spec.ts`  
- [ ] T013 [P] Contract test `quote.add-item` tRPC endpoint in `tests/contract/quote.add-item.spec.ts`
- [ ] T014 [P] Contract test `quote.submit` tRPC endpoint in `tests/contract/quote.submit.spec.ts`
- [ ] T015 [P] Integration test catalog navigation flow in `tests/integration/catalog-flow.spec.ts`
- [ ] T016 [P] Integration test quote creation flow in `tests/integration/quote-flow.spec.ts`
- [ ] T017 [P] Integration test admin panel access in `tests/integration/admin-flow.spec.ts`

## Phase 3.4: Shared UI Components (ONLY after tests are failing)
- [ ] T018 [P] `EmptyState` component in `src/components/ui/empty-state.tsx` with Spanish messages
- [ ] T019 [P] `LoadingSpinner` component in `src/components/ui/loading-spinner.tsx` with accessibility
- [ ] T020 [P] `ErrorBoundary` component in `src/components/ui/error-boundary.tsx` with recovery actions
- [ ] T021 [P] `MainNavigation` component in `src/app/_components/navigation.tsx` for route group navigation
- [ ] T022 [P] `Footer` component in `src/app/_components/footer.tsx` with company info

## Phase 3.5: Public Route Components & Pages
- [ ] T023 [P] `ModelCard` component in `src/app/(public)/_components/catalog/model-card.tsx`
- [ ] T024 [P] `ModelFilter` component in `src/app/(public)/_components/catalog/model-filter.tsx`
- [ ] T025 [P] `QuoteItem` component in `src/app/(public)/_components/quote/quote-item.tsx`
- [ ] T026 [P] `PriceCalculator` component in `src/app/(public)/_components/quote/price-calculator.tsx`
- [ ] T027 Public catalog page `src/app/(public)/catalog/page.tsx` with model filtering and search
- [ ] T028 Public model detail page `src/app/(public)/catalog/[modelId]/page.tsx` with compatibility display
- [ ] T029 Public quote page `src/app/(public)/quote/page.tsx` with real-time pricing (<200ms SLA)
- [ ] T030 Public quote review page `src/app/(public)/quote/review/page.tsx` with item management

## Phase 3.6: Auth Route Components & Pages
- [ ] T031 [P] `SignInForm` component in `src/app/(auth)/_components/signin-form.tsx` with Spanish validation
- [ ] T032 [P] `AuthCard` component in `src/app/(auth)/_components/auth-card.tsx` for consistent form styling
- [ ] T033 Auth signin page `src/app/(auth)/signin/page.tsx` with OAuth and credentials

## Phase 3.7: Dashboard Route Components & Pages  
- [ ] T034 [P] `DashboardSidebar` component in `src/app/(dashboard)/_components/sidebar.tsx`
- [ ] T035 [P] `StatsCard` component in `src/app/(dashboard)/_components/stats-card.tsx`
- [ ] T036 [P] `ModelForm` component in `src/app/(dashboard)/_components/model-form.tsx`
- [ ] T037 [P] `QuoteList` component in `src/app/(dashboard)/_components/quote-list.tsx`
- [ ] T038 Dashboard home page `src/app/(dashboard)/page.tsx` with overview stats
- [ ] T039 Models management page `src/app/(dashboard)/models/page.tsx` with CRUD operations
- [ ] T040 Quotes management page `src/app/(dashboard)/quotes/page.tsx` with status tracking
- [ ] T041 Settings page `src/app/(dashboard)/settings/page.tsx` with admin preferences

## Phase 3.8: Next.js Special Files - Loading States
- [ ] T042 [P] Public loading states:
  - `src/app/(public)/loading.tsx` - General public loading
  - `src/app/(public)/catalog/loading.tsx` - Catalog specific loading
  - `src/app/(public)/quote/loading.tsx` - Quote specific loading
- [ ] T043 [P] Auth loading states:
  - `src/app/(auth)/loading.tsx` - Authentication loading states
- [ ] T044 [P] Dashboard loading states:
  - `src/app/(dashboard)/loading.tsx` - Dashboard loading with skeleton

## Phase 3.9: Next.js Special Files - Error Handling
- [ ] T045 [P] Public error handling:
  - `src/app/(public)/error.tsx` - Public routes error with retry functionality
  - `src/app/(public)/catalog/error.tsx` - Catalog specific error handling
  - `src/app/(public)/quote/error.tsx` - Quote specific error handling
- [ ] T046 [P] Auth error handling:
  - `src/app/(auth)/error.tsx` - Authentication error handling with redirect options
- [ ] T047 [P] Dashboard error handling:
  - `src/app/(dashboard)/error.tsx` - Dashboard error with admin context

## Phase 3.10: Next.js Special Files - Not Found Pages
- [ ] T048 [P] Not found pages:
  - `src/app/(public)/not-found.tsx` - Public 404 with navigation to catalog
  - `src/app/(dashboard)/not-found.tsx` - Dashboard 404 with admin navigation

## Phase 3.11: State Management & Navigation
- [ ] T049 Shopping cart state management with TanStack Query v5 integration
- [ ] T050 Form validation with Zod schemas and Spanish error messages  
- [ ] T051 tRPC client configuration with error boundaries and retry logic
- [ ] T052 Breadcrumb navigation component for route group context

## Phase 3.12: Integration & Middleware
- [ ] T053 NextAuth v5 session integration in route handlers
- [ ] T054 tRPC middleware for authentication and logging
- [ ] T055 Real-time price updates with optimistic UI updates
- [ ] T056 Form persistence across navigation (quote state)

## Phase 3.13: Accessibility & Performance
- [ ] T057 [P] WCAG 2.1 AA compliance audit for all components
- [ ] T058 [P] Mobile-responsive design validation across route groups
- [ ] T059 [P] Performance optimization: code splitting by route groups
- [ ] T060 [P] Internationalization setup for Spanish (es-LA) locale

## Phase 3.14: Advanced Next.js Features (Optional)
- [ ] T061 [P] Template files for route group transitions:
  - `src/app/(public)/template.tsx` - Public route transitions
  - `src/app/(dashboard)/template.tsx` - Dashboard route transitions
- [ ] T062 [P] Server Actions for form submissions in dashboard components
- [ ] T063 [P] Streaming UI with Suspense boundaries per route group
- [ ] T064 [P] Dynamic imports for route-specific components

## Phase 3.15: Testing & Polish
- [ ] T065 [P] Unit tests for route-specific components in `tests/unit/`
- [ ] T066 [P] E2E tests with Playwright covering all route groups and special files
- [ ] T067 [P] Performance tests for <200ms pricing SLA in `tests/perf/`
- [ ] T068 [P] Test Next.js special files behavior (loading, error, not-found states)
- [ ] T069 [P] Update documentation in `docs/architecture.md`
- [ ] T070 Manual testing following `specs/002-ui-ux-requirements/quickstart.md`

## Dependencies
- Setup & structure (T001-T010) before all other phases
- Route group layouts before components and pages
- Tests (T011-T017) before implementation (T018-T041)
- Shared components (T018-T022) before route-specific components
- Components before their respective pages
- Core implementation before Next.js special files (T042-T048)
- Special files before advanced features (T061-T064)
- All implementation before testing & polish (T065-T070)

## Parallel Execution Examples
```bash
# Phase 3.2 - Route Group Layouts (all parallel, different route groups)
Task: "Public layout in src/app/(public)/layout.tsx"
Task: "Auth layout in src/app/(auth)/layout.tsx" 
Task: "Dashboard layout in src/app/(dashboard)/layout.tsx"
Task: "Global error boundary in src/app/global-error.tsx"

# Phase 3.3 - Contract tests (all parallel, different files)
Task: "Contract test catalog.list-models in tests/contract/catalog.list-models.spec.ts"
Task: "Contract test quote.calculate-item in tests/contract/quote.calculate-item.spec.ts"

# Phase 3.4 - Shared components (all parallel, different files)
Task: "EmptyState component in src/components/ui/empty-state.tsx"
Task: "LoadingSpinner component in src/components/ui/loading-spinner.tsx"
Task: "MainNavigation component in src/app/_components/navigation.tsx"

# Phase 3.8 - Loading states (all parallel, different route groups)
Task: "Public loading in src/app/(public)/loading.tsx"
Task: "Auth loading in src/app/(auth)/loading.tsx"
Task: "Dashboard loading in src/app/(dashboard)/loading.tsx"

# Phase 3.9 - Error handling (all parallel, different route groups)
Task: "Public error handling in src/app/(public)/error.tsx"
Task: "Auth error handling in src/app/(auth)/error.tsx"
Task: "Dashboard error handling in src/app/(dashboard)/error.tsx"
```

## English Route Structure with Spanish Content
```
/                           → Redirect to /catalog
/catalog                    → Glass catalog (Public route group)
/catalog/[modelId]          → Model detail (Public route group)
/quote                      → Quote creation (Public route group)
/quote/review               → Quote review (Public route group)
/signin                     → Sign in (Auth route group)
/dashboard                  → Dashboard home (Protected route group)
/dashboard/models           → Model management (Protected route group)
/dashboard/quotes           → Quote management (Protected route group)
/dashboard/settings         → Settings (Protected route group)
```

## Next.js Special Files Usage
- **loading.tsx**: Loading UI states for each route group
- **error.tsx**: Error boundaries with recovery actions for each route group  
- **not-found.tsx**: 404 pages with contextual navigation for each route group
- **global-error.tsx**: Root-level error boundary for catastrophic failures
- **template.tsx**: Re-rendered layouts for route transitions (optional)
- **default.tsx**: Fallback for parallel routes (future use)

## Architecture Benefits
- **Screaming Architecture**: Route groups clearly separate domains (public, auth, dashboard)
- **Component Co-location**: Components live close to where they're used
- **English Routes**: Clean English URLs for SEO and consistency
- **Spanish Content**: All UI text and validation messages in Spanish (es-LA)
- **Explicit Error Handling**: Next.js special files provide clear error boundaries
- **Parallel Development**: Different route groups can be developed simultaneously
- **Clear Loading States**: Each route group has contextual loading experiences
- **Scalable Structure**: Easy to add new features within existing route groups

## Notes
- **[P] tasks**: Different files/route groups that can be developed in parallel
- **English routes**: Clean URLs for consistency with codebase 
- **Spanish content**: All UI text, validation messages, and user content in Spanish (es-LA)
- **Next.js conventions**: Use explicit special files (loading.tsx, error.tsx, not-found.tsx)
- **CSS variables**: Use variables from `src/styles/globals.css`, no hardcoded colors
- **TDD approach**: Verify tests fail before implementing features
- **Route groups**: Natural boundaries for parallel development and different behaviors
- **Component co-location**: Components live in `_components/` folders near their usage
- **Screaming architecture**: Project structure screams about the business domains
- **TanStack Query v5**: State management and caching with React Server Components
- **NextAuth v5**: Admin route protection with middleware
- **Accessibility first**: WCAG 2.1 AA compliance from the start

## Performance & Accessibility Requirements
- **Price calculations**: Must respond <200ms (SLA from contracts)
- **Catalog loading**: Must be <500ms with proper loading states
- **WCAG 2.1 AA compliance**: Mandatory across all route groups
- **Mobile-first**: Responsive design starting from mobile breakpoints
- **Browser support**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **Spanish locale**: Proper semantic HTML with lang="es-LA"
- **Loading states**: Each route group must have contextual loading experiences
- **Error recovery**: Error boundaries must provide clear recovery actions

## Task Generation Rules for Agents
- **Route groups**: Enable parallel development of different business domains
- **Component co-location**: Components are placed close to their usage context
- **English file/folder names**: Consistent with codebase conventions
- **Spanish user content**: All user-facing text in Spanish (es-LA)
- **Next.js special files**: Explicit usage for loading, error, and not-found states
- **Tests first**: All contract and integration tests must fail before implementation
- **Accessibility throughout**: Not just at the end, but considered in every task
- **Performance by design**: Loading states and optimizations built-in from start
- **Manual validation**: Final testing validates complete user journey per quickstart.md