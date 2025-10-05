# Architecture: Glasify MVP - Next.js App Router Screaming Architecture

## Overview
Glasify MVP uses Next.js 15 App Router with a "Screaming Architecture" approach, where the folder structure immediately communicates the business domains through route groups. The architecture prioritizes Spanish user experience with English technical implementation.

## Core Principles

### 1. Screaming Architecture
The project structure screams about business domains, not technical layers:
- `(public)` - Public glass catalog and quote creation
- `(auth)` - User authentication flows  
- `(dashboard)` - Protected admin functionality

### 2. English Routes, Spanish Content
- **Routes**: Clean English URLs (`/catalog`, `/quote`, `/dashboard`)
- **Content**: All user-facing text in Spanish (es-LA)
- **Code**: English variable names, comments, and technical terminology

### 3. Component Co-location
Components live close to where they're used:
- `_components/` folders within each route group
- Shared components in `src/app/_components/`
- UI primitives in `src/components/ui/`

## Directory Structure

```
src/app/
├── layout.tsx               # Root layout with providers, metadata
├── page.tsx                # Home page (redirects to /catalog)
├── global-error.tsx        # Catastrophic error boundary
├── not-found.tsx           # Global 404 page
├── _components/            # Global shared components
│   ├── navigation.tsx      # Main navigation
│   └── footer.tsx          # Site footer
├── (public)/               # Public routes (no authentication)
│   ├── layout.tsx          # Public layout with nav/footer
│   ├── loading.tsx         # Public loading states
│   ├── error.tsx           # Public error boundary
│   ├── not-found.tsx       # Public 404 page
│   ├── _components/        # Public-specific components
│   │   ├── catalog/        # Catalog domain components
│   │   │   ├── model-card.tsx
│   │   │   └── model-filter.tsx
│   │   └── quote/          # Quote domain components
│   │       ├── quote-item.tsx
│   │       └── price-calculator.tsx
│   ├── catalog/            # Glass catalog browsing
│   │   ├── page.tsx        # Catalog listing
│   │   ├── loading.tsx     # Catalog-specific loading
│   │   ├── error.tsx       # Catalog-specific errors
│   │   └── [modelId]/      # Dynamic model routes
│   │       └── page.tsx    # Model detail page
│   └── quote/              # Quote creation (no auth required)
│       ├── page.tsx        # Quote configuration
│       ├── loading.tsx     # Quote loading states
│       ├── error.tsx       # Quote error handling
│       ├── _components/    # Quote page components
│       └── review/         # Quote review
│           └── page.tsx
├── (auth)/                 # Authentication routes
│   ├── layout.tsx          # Centered form layout
│   ├── loading.tsx         # Auth loading states
│   ├── error.tsx           # Auth error handling
│   ├── _components/        # Auth-specific components
│   │   ├── signin-form.tsx
│   │   └── auth-card.tsx
│   └── signin/             # Sign in flow
│       └── page.tsx
└── (dashboard)/            # Protected admin routes
    ├── layout.tsx          # Dashboard layout with sidebar
    ├── loading.tsx         # Admin loading states
    ├── error.tsx           # Admin error handling
    ├── not-found.tsx       # Admin 404 page
    ├── page.tsx            # Dashboard home
    ├── _components/        # Admin-specific components
    │   ├── sidebar.tsx     # Dashboard sidebar
    │   ├── stats-card.tsx  # Statistics display
    │   ├── model-form.tsx  # Model CRUD form
    │   └── quote-list.tsx  # Quote management
    ├── models/             # Model management
    │   └── page.tsx
    ├── quotes/             # Quote management
    │   └── page.tsx
    └── settings/           # Admin settings
        └── page.tsx
```
```
src/app/
├── (public)/                 # Public routes (no auth required)
│   ├── layout.tsx
│   ├── loading.tsx
│   ├── error.tsx
│   ├── not-found.tsx
│   ├── _components/          # Shared components for public routes
│   ├── catalog/              # Glass catalog browsing
│   │   ├── page.tsx
│   │   ├── loading.tsx
│   │   ├── [modelId]/
│   │   └── _components/
│   ├── quote/                # Quote creation
│   │   ├── page.tsx
│   │   ├── review/
│   │   ├── loading.tsx
│   │   └── _components/
│   └── @modal/               # Parallel route for modals
├── (auth)/                   # Authentication routes
│   ├── layout.tsx
│   ├── signin/
│   └── _components/
├── (dashboard)/              # Protected admin routes
│   ├── layout.tsx
│   ├── middleware.ts
│   ├── loading.tsx
│   ├── page.tsx
│   ├── _components/          # Admin-specific components
│   ├── models/              # Model management
│   ├── quotes/              # Quote management
│   └── settings/            # Settings
├── _components/             # Global shared components
├── api/                     # API routes
├── globals.css
├── layout.tsx               # Root layout
└── page.tsx                # Home redirect
```

## Execution Flow (main)
```
1. Load plan.md from feature directory
   → Tech stack: Next.js 15 App Router, shadcn/ui v3, Tailwind v4, tRPC, Prisma
   → Structure: Route groups (public), (auth), (dashboard) with Spanish routes
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
5. Tasks numbered T001-T050+ with dependencies
6. Focus on UI/UX implementation with English routes and Spanish content
```

## Format: `[ID] [P?] Description`
- **[P]**: Can run in parallel (different files/route groups, no dependencies)
- Include exact file paths for Next.js App Router structure
- All routes and content in Spanish

## Phase 3.1: Setup & Project Structure
- [ ] T001 Create Next.js App Router structure with Spanish route groups: `(public)`, `(auth)`, `(dashboard)`
- [ ] T002 Configure shadcn/ui v3 components with Tailwind v4 CSS variables from `src/styles/globals.css`
- [ ] T003 [P] Set up root layout `src/app/layout.tsx` with providers and Spanish locale
- [ ] T004 [P] Configure NextAuth v5 middleware for protected routes in `src/middleware.ts`

## Phase 3.2: Route Group Layouts & Templates
- [ ] T005 [P] Public layout `src/app/(public)/layout.tsx` with navigation and footer
- [ ] T006 [P] Auth layout `src/app/(auth)/layout.tsx` with centered form design
- [ ] T007 [P] Dashboard layout `src/app/(dashboard)/layout.tsx` with sidebar navigation
- [ ] T008 [P] Global template `src/app/template.tsx` for shared animations/transitions

## Phase 3.3: Tests First (TDD) ⚠️ MUST COMPLETE BEFORE 3.4
**CRITICAL: These tests MUST be written and MUST FAIL before ANY implementation**
- [ ] T009 [P] Contract test `catalog.list-models` tRPC endpoint in `tests/contract/catalog.list-models.spec.ts`
- [ ] T010 [P] Contract test `quote.calculate-item` tRPC endpoint in `tests/contract/quote.calculate-item.spec.ts`  
- [ ] T011 [P] Contract test `quote.add-item` tRPC endpoint in `tests/contract/quote.add-item.spec.ts`
- [ ] T012 [P] Contract test `quote.submit` tRPC endpoint in `tests/contract/quote.submit.spec.ts`
- [ ] T013 [P] Integration test catalog navigation flow in `tests/integration/catalog-flow.spec.ts`
- [ ] T014 [P] Integration test quote creation flow in `tests/integration/quote-flow.spec.ts`
- [ ] T015 [P] Integration test admin panel access in `tests/integration/admin-flow.spec.ts`

## Phase 3.4: Global Shared Components (ONLY after tests are failing)
- [ ] T016 [P] `EmptyState` component in `src/app/_components/ui/empty-state.tsx` with Spanish messages
- [ ] T017 [P] `LoadingSpinner` component in `src/app/_components/ui/loading-spinner.tsx` with accessibility
- [ ] T018 [P] `ErrorBoundary` component in `src/app/_components/ui/error-boundary.tsx` with recovery actions
- [ ] T019 [P] `MainNavigation` component in `src/app/_components/navigation/main-nav.tsx`
- [ ] T020 [P] `Footer` component in `src/app/_components/layout/footer.tsx`

## Phase 3.5: Public Route Components
- [ ] T021 [P] `ModelCard` component in `src/app/(public)/_components/catalog/model-card.tsx`
- [ ] T022 [P] `ModelFilter` component in `src/app/(public)/_components/catalog/model-filter.tsx`
- [ ] T023 [P] `ModelSearch` component in `src/app/(public)/_components/catalog/model-search.tsx`
- [ ] T024 [P] `QuoteItem` component in `src/app/(public)/_components/quote/quote-item.tsx`
- [ ] T025 [P] `PriceCalculator` component in `src/app/(public)/_components/quote/price-calculator.tsx`
- [ ] T026 [P] `QuoteReview` component in `src/app/(public)/_components/quote/quote-review.tsx`

## Phase 3.6: Public Pages (English Routes)
- [ ] T027 Home/redirect page `src/app/page.tsx` redirecting to `/catalog`
- [ ] T028 Public catalog listing page `src/app/(public)/catalog/page.tsx` with model filtering
- [ ] T029 Public model detail page `src/app/(public)/catalog/[modelId]/page.tsx` with compatibility
- [ ] T030 Public quote configuration page `src/app/(public)/quote/page.tsx` with real-time pricing
- [ ] T031 Public quote review page `src/app/(public)/quote/review/page.tsx` with item management

## Phase 3.7: Auth Components & Pages
- [ ] T032 [P] `SignInForm` component in `src/app/(auth)/_components/signin-form.tsx`
- [ ] T033 [P] `AuthCard` component in `src/app/(auth)/_components/auth-card.tsx`
- [ ] T034 Auth signin page `src/app/(auth)/signin/page.tsx`

## Phase 3.8: Dashboard Components
- [ ] T035 [P] `DashboardSidebar` component in `src/app/(dashboard)/_components/layout/sidebar.tsx`
- [ ] T036 [P] `StatsCard` component in `src/app/(dashboard)/_components/ui/stats-card.tsx`
- [ ] T037 [P] `DataTable` component in `src/app/(dashboard)/_components/ui/data-table.tsx`
- [ ] T038 [P] `ModelForm` component in `src/app/(dashboard)/_components/models/model-form.tsx`
- [ ] T039 [P] `QuoteList` component in `src/app/(dashboard)/_components/quotes/quote-list.tsx`

## Phase 3.9: Dashboard Pages
- [ ] T040 Dashboard home `src/app/(dashboard)/page.tsx` with overview stats
- [ ] T041 Models management `src/app/(dashboard)/models/page.tsx` with CRUD operations
- [ ] T042 Quotes management `src/app/(dashboard)/quotes/page.tsx` with status tracking
- [ ] T043 Settings page `src/app/(dashboard)/settings/page.tsx` with admin preferences

## Phase 3.10: Next.js Special Files (Route Group Specific)
**Public Route Group**
- [ ] T044 [P] `src/app/(public)/loading.tsx` - Catalog and quote loading states
- [ ] T045 [P] `src/app/(public)/error.tsx` - Public error handling with retry
- [ ] T046 [P] `src/app/(public)/not-found.tsx` - 404 with navigation back to catalog

**Auth Route Group**
- [ ] T047 [P] `src/app/(auth)/loading.tsx` - Authentication loading states
- [ ] T048 [P] `src/app/(auth)/error.tsx` - Auth error handling

**Dashboard Route Group**
- [ ] T049 [P] `src/app/(dashboard)/loading.tsx` - Admin dashboard loading
- [ ] T050 [P] `src/app/(dashboard)/error.tsx` - Dashboard error handling
- [ ] T051 [P] `src/app/(dashboard)/not-found.tsx` - Protected 404 page

**Global Special Files**
- [ ] T052 [P] `src/app/global-error.tsx` - Global error boundary
- [ ] T053 [P] `src/app/not-found.tsx` - Global 404 page

## Phase 3.11: Parallel Routes & Intercepting Routes
- [ ] T054 [P] Modal slot `src/app/(public)/@modal/default.tsx` for intercepted routes
- [ ] T055 [P] Intercepted model detail `src/app/(public)/@modal/catalog/[modelId]/page.tsx`
- [ ] T056 [P] Modal layout `src/app/(public)/@modal/layout.tsx`

## Phase 3.12: Navigation & State Management
- [ ] T057 Breadcrumb navigation component with route group awareness
- [ ] T058 Shopping cart state management with TanStack Query v5 integration
- [ ] T059 Form validation with Zod schemas and Spanish error messages
- [ ] T060 tRPC client configuration with error boundaries and retry logic

## Phase 3.13: Middleware & Route Handlers
- [ ] T061 NextAuth v5 session integration in route handlers
- [ ] T062 tRPC middleware for authentication and logging
- [ ] T063 Real-time price updates with optimistic UI updates
- [ ] T064 Form persistence across navigation (quote state)

## Phase 3.14: Accessibility & Performance
- [ ] T065 [P] WCAG 2.1 AA compliance audit for all components
- [ ] T066 [P] Mobile-responsive design validation across route groups
- [ ] T067 [P] Performance optimization: code splitting by route groups
- [ ] T068 [P] Internationalization setup for Spanish (es-LA) locale with proper routing

## Phase 3.15: Advanced Next.js Features
- [ ] T069 [P] Route groups middleware for different behaviors per group
- [ ] T070 [P] Streaming UI with Suspense boundaries per route group
- [ ] T071 [P] Server Actions for form submissions in dashboard
- [ ] T072 [P] Dynamic imports for route-specific components

## Phase 3.16: Testing & Polish
- [ ] T073 [P] Unit tests for route-specific components in `tests/unit/`
- [ ] T074 [P] E2E tests with Playwright covering all route groups
- [ ] T075 [P] Performance tests for <200ms pricing SLA in `tests/perf/`
- [ ] T076 [P] Route group integration tests
- [ ] T077 [P] Update documentation in `docs/architecture.md`
- [ ] T078 Manual testing following `specs/002-ui-ux-requirements/quickstart.md`

## Dependencies
- Setup (T001-T004) before all other phases
- Route layouts (T005-T008) before components and pages
- Tests (T009-T015) before implementation (T016-T043)
- Global components (T016-T020) before route-specific components
- Components before their respective pages
- Special files (T044-T053) after core implementation
- Advanced features (T069-T072) after core functionality

## Parallel Execution Examples
```bash
# Phase 3.3 - Contract tests (all parallel, different files)
Task: "Contract test catalog.list-models in tests/contract/catalog.list-models.spec.ts"
Task: "Contract test quote.calculate-item in tests/contract/quote.calculate-item.spec.ts"

# Phase 3.4 - Global components (all parallel, different files)
Task: "EmptyState component in src/app/_components/ui/empty-state.tsx"
Task: "LoadingSpinner component in src/app/_components/ui/loading-spinner.tsx"

# Phase 3.5 - Public route components (all parallel, different files)
Task: "ModelCard component in src/app/(public)/_components/catalog/model-card.tsx"
Task: "QuoteItem component in src/app/(public)/_components/quote/quote-item.tsx"
```

## English Route Structure
```
/                           → Redirect to /catalog
/catalog                    → Glass catalog (Public)
/catalog/[modelId]          → Model detail (Public)
/quote                      → Quote creation (Public)
/quote/review               → Quote review (Public)
/signin                     → Sign in (Auth)
/dashboard                  → Dashboard home (Protected)
/dashboard/models           → Model management (Protected)
/dashboard/quotes           → Quote management (Protected)
/dashboard/settings         → Settings (Protected)
```

## Architecture Benefits
- **Screaming Architecture**: Route groups clearly separate domains (public, auth, dashboard)
- **Component Co-location**: Components live close to where they're used
- **English Routes**: Clean English URLs for consistency with codebase
- **Parallel Development**: Different route groups can be developed simultaneously
- **Next.js Conventions**: Leverages all App Router features (special files, parallel routes, intercepting routes)
- **Clear Boundaries**: Each route group has its own layout, loading, error states
- **Scalable Structure**: Easy to add new features within existing route groups

## Performance & Accessibility Requirements
- Price calculations must respond <200ms (SLA from contracts)
- Catalog loading must be <500ms
- WCAG 2.1 AA compliance mandatory
- Mobile-first responsive design
- Support modern browsers: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- Spanish (es-LA) locale with proper semantic HTML

## Task Generation Rules
- Route groups enable parallel development of different domains
- Components are co-located with their usage (screaming architecture)
- English routes for consistency with codebase
- Special Next.js files provide clear error boundaries and loading states
- Tests must fail before implementation (TDD approach)
- Each route group maintains its own component ecosystem