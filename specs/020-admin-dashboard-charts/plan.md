# Implementation Plan: Dashboard Informativo con Métricas y Charts

**Branch**: `016-admin-dashboard-charts` | **Date**: 2025-10-23 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/016-admin-dashboard-charts/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Implement an informative dashboard with interactive charts for admins and sellers to visualize business metrics and platform usage data for decision-making. The dashboard will use shadcn/ui chart components to display quote performance metrics, catalog analytics (popular models/glass types), monetary metrics, and temporal filters with period comparisons. The solution follows a server-first architecture with RBAC-based data isolation (admins see all data, sellers see only their own quotes).

## Technical Context

**Language/Version**: TypeScript 5.8.2 (strict mode), Node.js (ES2022 target)  
**Primary Dependencies**: Next.js 15.2.3 (App Router), React 19.0.0, tRPC 11.0.0, Prisma 6.16.2, shadcn/ui charts (NEEDS CLARIFICATION: exact package name), TanStack Query 5.69.0, Zod 4.1.1  
**Storage**: PostgreSQL via Prisma ORM (existing schema: Quote, QuoteItem, Model, GlassType, ProfileSupplier, User, TenantConfig)  
**Testing**: Vitest 3.2.4 (unit/integration with jsdom), Playwright 1.55.1 (E2E)  
**Target Platform**: Web application (Server-Side Rendering with Next.js App Router)  
**Project Type**: Web (Next.js full-stack application)  
**Performance Goals**: 
- Dashboard initial load < 3 seconds
- P1 metrics render < 2 seconds with up to 1,000 quotes
- Chart interactions responsive < 100ms
- Support up to 10,000 quotes without performance degradation (NEEDS CLARIFICATION: aggregation strategy for larger datasets)  
**Constraints**: 
- RBAC enforcement: Sellers must see only their own quotes (userId filtering)
- All monetary values must use TenantConfig.currency and TenantConfig.locale for formatting
- All temporal calculations must respect TenantConfig.timezone
- Charts must be responsive (min viewport 375px)
- UI text must be in Spanish (es-LA)
- Winston logger server-side only (no client-side logging)  
**Scale/Scope**: 
- 4 prioritized user stories (P1-P4)
- 35 functional requirements
- 7 key entities involved
- Estimated 3-4 new dashboard page/sections
- Estimated 10-15 new React components
- Estimated 5-8 new tRPC procedures

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

This feature must align with Glasify Lite Constitution v2.1.1 principles:

### Single Responsibility (SRP)
- [x] Each component/module has ONE clear responsibility
  - Dashboard page: orchestration only
  - Chart components: visualization only
  - tRPC procedures: data aggregation only
  - Service layer: business logic for metrics calculation
- [x] Business logic is separated from UI and data access
  - Metrics calculation in `/server/services/dashboard-metrics.ts`
  - Data fetching in tRPC routers `/server/api/routers/dashboard.ts`
  - UI components in `/app/(dashboard)/admin/dashboard/_components/`
- [x] Tests and docs exist for each public abstraction
  - Unit tests for metrics calculation logic
  - Integration tests for tRPC procedures
  - E2E tests for user flows (P1-P4)

### Open/Closed (OCP)
- [x] New features use extension patterns (hooks, procedures, adapters)
  - New dashboard route without modifying existing admin routes
  - New tRPC router `dashboard` as extension of existing API
  - Reusable chart components for future dashboard features
- [x] No modification of stable modules unless documented with migration plan
  - No changes to existing Quote/Model/GlassType schemas
  - No changes to existing RBAC middleware (reuse only)
- [x] Breaking API changes include MAJOR version bump + migration guide
  - N/A - no breaking changes planned

### Pragmatic Testing Discipline
- [x] Tests MAY be written before/during/after implementation
  - Flexible approach based on developer preference
- [x] Tests MUST cover happy paths and critical edge cases before merge
  - Admin viewing all quotes metrics
  - Seller viewing only own quotes metrics
  - Empty states (no data)
  - Large datasets (performance validation)
  - Period filtering and comparisons
- [x] Unit tests run in CI
  - Vitest for metrics calculation functions
- [x] Integration/contract tests for cross-service changes
  - tRPC contract tests for dashboard procedures
  - Database integration tests for aggregation queries

### Server-First Architecture (Next.js 15)
- [x] Pages are Server Components by default (`page.tsx`)
  - `/app/(dashboard)/admin/dashboard/page.tsx` as Server Component
  - Fetch initial metrics server-side for fast first paint
- [x] Client Components (`'use client'`) ONLY for: React hooks, browser APIs, event handlers, client-required libraries
  - Chart components (recharts requires client-side)
  - Period filter selector (user interaction)
  - Interactive tooltips (hover events)
- [x] Public pages export `metadata` for SEO
  - N/A - dashboard is admin/seller only (no SEO needed)
- [x] Dynamic rendering uses `export const dynamic = 'force-dynamic'`
  - Dashboard uses `dynamic = 'force-dynamic'` (real-time metrics)
  - Cache invalidation with `router.refresh()` after data changes
- [x] Pattern: Server Page + Client Content (interactivity in `_components/*-content.tsx`)
  - `page.tsx` fetches data, passes to `dashboard-content.tsx`
  - Client components handle user interactions only

### Integration & Contract Testing
- [x] Contract tests for shared schemas/API contracts
  - Zod schemas for dashboard tRPC input/output
  - Shared types for metrics data structures
- [x] Integration tests for service boundaries (DB, external APIs, client-server)
  - Prisma aggregation queries testing
  - tRPC procedure integration tests
- [x] Contracts are explicit and versioned
  - API contracts in `/specs/016-admin-dashboard-charts/contracts/`

### Observability & Versioning
- [x] Structured logging with correlation IDs
  - Log dashboard access with userId and timestamp
  - Log slow queries (> 1 second) with query details
- [x] **Winston logger ONLY in server-side code** (Server Components, Server Actions, API routes, tRPC, middleware)
  - Logging in tRPC procedures only
  - No Winston imports in chart components
- [x] **NO Winston in Client Components** (use console, toast, error boundaries)
  - Use Error Boundary for chart render failures
  - Use toast for user-facing error messages
- [x] Semantic versioning: MAJOR.MINOR.PATCH
  - Feature version: 1.0.0 (initial implementation)
- [x] Authorization checks + audit logging for sensitive operations
  - RBAC check at route level (middleware)
  - RBAC check at tRPC procedure level (adminOrSellerProcedure)
  - Audit log for dashboard access attempts

### Technology Stack Compliance
- [x] Next.js 15 App Router with React Server Components
  - Dashboard route in App Router structure
- [x] TypeScript (strict), Zod 4, tRPC, Prisma
  - All procedures use Zod input validation
  - TypeScript strict mode enabled
- [x] React Hook Form + @hookform/resolvers
  - N/A - no complex forms in dashboard (only filter selects)
- [x] shadcn/ui + Radix + TailwindCSS
  - Use shadcn/ui chart components
  - TailwindCSS for layout and styling
- [x] Biome/Ultracite for formatting/linting
  - Standard project linting rules apply
- [x] UI text in Spanish (es-LA); code/comments/commits in English
  - All labels, tooltips, empty states in Spanish
  - Code/comments/commits in English

### Security & Compliance
- [x] All inputs validated server-side (Zod schemas in tRPC `.input()`)
  - Period selection validated (enum)
  - Date ranges validated (start <= end)
- [x] No secrets committed (use env variables + @t3-oss/env-nextjs)
  - N/A - no new secrets required
- [x] Sensitive operations include authorization + audit logging
  - Dashboard access logged with user ID
  - RBAC enforced at every data access point

### Development Workflow
- [x] Conventional commits format
  - Example: `feat(dashboard): add quote metrics visualization`
- [x] PR descriptions reference affected principles
  - PR will reference Server-First Architecture and Security principles
- [x] CI gates: typecheck, lint, unit tests, E2E tests (if user flows affected)
  - All gates must pass before merge
- [x] Code review: 1 approver (2 for large/risky changes)
  - Standard review process (1 approver sufficient for this feature)

---

**Notes**:
- All constitution checks passed ✅
- No exceptions or complexity tracking needed
- Feature aligns with all constitutional principles
- Will re-validate after Phase 1 design decisions

## Project Structure

### Documentation (this feature)

```
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```
src/
├── app/
│   └── (dashboard)/
│       └── admin/
│           └── dashboard/                        # NEW: Dashboard feature route
│               ├── _components/                   # Private dashboard components
│               │   ├── dashboard-content.tsx      # Main client wrapper
│               │   ├── quotes-metrics-card.tsx    # P1: Quote metrics display
│               │   ├── quotes-trend-chart.tsx     # P1: Line chart (30-day trend)
│               │   ├── catalog-analytics-card.tsx # P2: Catalog analysis
│               │   ├── top-models-chart.tsx       # P2: Bar chart (top 5 models)
│               │   ├── glass-distribution-chart.tsx # P2: Pie chart (glass types)
│               │   ├── monetary-metrics-card.tsx  # P3: Financial metrics
│               │   ├── price-range-chart.tsx      # P3: Bar chart (price ranges)
│               │   ├── period-selector.tsx        # P4: Time period filter
│               │   ├── metric-card.tsx            # Reusable metric display
│               │   ├── chart-container.tsx        # Reusable chart wrapper
│               │   └── empty-dashboard-state.tsx  # Empty state component
│               ├── page.tsx                       # Server Component (SSR)
│               └── loading.tsx                    # Loading state
│
├── server/
│   ├── api/
│   │   └── routers/
│   │       └── dashboard.ts                       # NEW: Dashboard tRPC router
│   │           # Procedures:
│   │           # - getQuotesMetrics
│   │           # - getQuotesTrend
│   │           # - getTopModels
│   │           # - getGlassDistribution
│   │           # - getMonetaryMetrics
│   │           # - getPriceRanges
│   │
│   └── services/
│       └── dashboard-metrics.ts                   # NEW: Business logic service
│           # Functions:
│           # - calculateQuoteMetrics()
│           # - calculateConversionRate()
│           # - aggregateQuotesByDate()
│           # - getTopModels()
│           # - getGlassTypeDistribution()
│           # - calculateMonetaryMetrics()
│           # - groupQuotesByPriceRange()
│           # - calculatePeriodComparison()
│
├── lib/
│   └── format.ts                                  # EXISTING: Formatters (extend if needed)
│       # - formatCurrency() - use TenantConfig
│       # - formatDate() - use TenantConfig.timezone
│       # - formatNumber() - use TenantConfig.locale
│
└── types/
    └── dashboard.ts                               # NEW: Shared TypeScript types
        # - DashboardPeriod enum
        # - QuoteMetrics interface
        # - CatalogAnalytics interface
        # - MonetaryMetrics interface
        # - ChartDataPoint interface

tests/
├── unit/
│   └── server/
│       └── services/
│           └── dashboard-metrics.test.ts          # NEW: Service unit tests
│
├── integration/
│   └── api/
│       └── routers/
│           └── dashboard.test.ts                  # NEW: tRPC procedure tests
│
└── e2e/
    └── dashboard/
        ├── admin-dashboard.spec.ts                # NEW: Admin dashboard E2E
        └── seller-dashboard.spec.ts               # NEW: Seller dashboard E2E
```

**Structure Decision**: 

This feature follows the **Next.js 15 App Router** structure with server-first architecture. Key decisions:

1. **Route Organization**: Dashboard is under `(dashboard)/admin/` route group for admin/seller access
2. **Component Colocation**: Private components in `_components/` folder (not routable)
3. **Server/Client Split**: 
   - `page.tsx` = Server Component (data fetching)
   - `*-content.tsx` = Client Components (interactivity, charts)
4. **Business Logic Layer**: `/server/services/dashboard-metrics.ts` for pure calculation logic (testable)
5. **API Layer**: `/server/api/routers/dashboard.ts` for tRPC procedures (RBAC + data access)
6. **Shared Types**: `/types/dashboard.ts` for type safety across client/server boundary
7. **Testing Strategy**: Unit → Integration → E2E (separate test files by concern)

## Complexity Tracking

*Fill ONLY if Constitution Check has violations that must be justified*

**No violations detected.** All constitution checks passed. This feature aligns with existing architecture patterns and introduces no additional complexity.

---

## Phase Summary

### Phase 0: Research ✅ Complete

**Artifacts Created**:
- `research.md` - All technical decisions documented

**Key Decisions**:
1. Use shadcn/ui chart components (built on Recharts 2.12.7)
2. Real-time Prisma aggregations for MVP (<10,000 quotes)
3. date-fns-tz for timezone-aware calculations
4. Reuse existing RBAC patterns (getQuoteFilter helper)
5. Dedicated empty state components
6. Mobile-first responsive design
7. Configurable price ranges with COP defaults
8. Structured logging for performance monitoring

**Technologies Finalized**:
- shadcn/ui charts + Recharts 2.12.7
- date-fns-tz (new dependency)
- Existing: Next.js 15.2.3, tRPC 11.0.0, Prisma 6.16.2, Zod 4.1.1

---

### Phase 1: Design & Contracts ✅ Complete

**Artifacts Created**:
- `data-model.md` - Domain types and business logic
- `contracts/trpc-dashboard-router.md` - API contracts
- `quickstart.md` - Implementation guide

**Data Model**:
- 7 existing entities (read-only, no schema changes)
- 11 TypeScript domain types defined
- Business logic documented (RBAC, calculations, date handling)
- Performance optimizations planned

**API Contracts**:
- 5 tRPC procedures defined
- All procedures type-safe with Zod validation
- RBAC enforced at procedure level
- Error messages in Spanish

**Implementation Guide**:
- 10-step quickstart (6 hours estimated)
- Unit, integration, and E2E test strategies
- Troubleshooting guide
- Pre-merge checklist

**Agent Context Updated**:
- `.github/copilot-instructions.md` updated with new technologies

---

### Constitution Re-Validation ✅ Passed

**Post-Design Constitution Check**: All checks passed (38/38)

No violations introduced during design phase. Feature maintains:
- Server-First Architecture (SSR with force-dynamic)
- Single Responsibility (separated layers)
- RBAC Security (admin vs seller filtering)
- Type Safety (Zod + TypeScript)
- Observability (Winston logging server-side only)
- Testing Discipline (unit → integration → E2E)

---

## Ready for Phase 2: Implementation

**Next Command**: `/speckit.tasks`

This will generate:
- `tasks.md` - Detailed implementation tasks
- GitHub issues (optional)
- Task dependencies and milestones

**Current Status**:
- ✅ Specification complete (spec.md)
- ✅ Research complete (research.md)
- ✅ Data model complete (data-model.md)
- ✅ API contracts complete (contracts/)
- ✅ Implementation guide complete (quickstart.md)
- ✅ Constitution validated (no violations)
- ✅ Agent context updated

**Branch**: `016-admin-dashboard-charts`  
**Files Created**: 6  
**Estimated Implementation Time**: 6 hours  
**Test Coverage Required**: Unit + Integration + E2E

---

## Quick Reference

**Spec**: [spec.md](./spec.md) - Feature requirements  
**Research**: [research.md](./research.md) - Technical decisions  
**Data Model**: [data-model.md](./data-model.md) - Domain design  
**API Contracts**: [contracts/trpc-dashboard-router.md](./contracts/trpc-dashboard-router.md)  
**Quickstart**: [quickstart.md](./quickstart.md) - Implementation guide  
**Plan**: This file - Overall planning document

**Constitution**: [.specify/memory/constitution.md](../../.specify/memory/constitution.md)  
**Copilot Instructions**: [.github/copilot-instructions.md](../../.github/copilot-instructions.md)
