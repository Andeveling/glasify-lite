---
description: "Implementation tasks for Dashboard Informativo con Métricas y Charts"
---

# Tasks: Dashboard Informativo con Métricas y Charts

**Input**: Design documents from `/specs/016-admin-dashboard-charts/`
**Prerequisites**: plan.md ✓, spec.md ✓, research.md ✓, data-model.md ✓, contracts/ ✓, quickstart.md ✓

**Tests**: Not explicitly requested in spec - tests included as best practice following Pragmatic Testing Discipline

**Organization**: Tasks grouped by user story (P1-P4) to enable independent implementation and testing

**Total Estimated Time**: ~6 hours

---

## 🚨 CAMBIOS CRÍTICOS (24 Oct 2025)

### Eliminada Dependencia Duplicada
- ✂️ **NO agregar `date-fns-tz`** - Ya tenemos `@formkit/tempo` en package.json
- 📍 Localización de fechas: **SOLO via `@lib/format`** + Tempo
- Verificar: `grep -r "date-fns-tz" src/` debe retornar 0 resultados en dashboard

### Centralización de Formateo (OBLIGATORIO)
- 🎯 **TODAS las tareas requieren `@lib/format`** como única fuente de formateo
- ❌ NUNCA: Strings manuales como `${}`, `%`, hardcoded separadores
- ✅ SIEMPRE: `formatCurrency()`, `formatPercent()`, `formatDate*()`, etc.
- 📋 Ref: Nuevo archivo `FORMATTING-STRATEGY.md` en este directorio

### Auditoría Pre-Merge
```bash
grep -r "\$\{" src/app/(dashboard)/admin/dashboard    # Manual currency
grep -r "toLocaleString" src/app/(dashboard)/admin/dashboard
grep -r "toLocaleDateString" src/app/(dashboard)/admin/dashboard
grep -r "date-fns-tz" src/app/(dashboard)/admin/dashboard  # DEBE ser 0
```

---

## Format: `[ID] [P?] [Story] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3, US4)
- Exact file paths included in all descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Install dependencies and create shared types

**Estimated Time**: 15 minutes

- [x] T001 Install shadcn/ui chart components via `pnpm dlx shadcn@latest add chart`
- [x] T002 [P] Verify `@formkit/tempo` is installed (already in package.json for date formatting with timezone support)
- [x] T003 [P] Create shared dashboard types in `src/types/dashboard.ts` (DashboardPeriod, QuoteMetrics, TrendDataPoint, CatalogAnalytics, MonetaryMetrics, PriceRange)
- [x] T004 [P] Verify recharts peer dependency installed and chart components exist in `src/components/ui/chart.tsx`
- [x] T004b [P] Verify all formatters available in `src/lib/format/index.ts` (formatDate, formatCurrency, formatNumber, formatPercent, formatDateShort, formatCurrencyCompact)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story implementation

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

**Estimated Time**: 75 minutes

- [x] T005 Create dashboard metrics service layer in `src/server/services/dashboard-metrics.ts` with helper functions (getPeriodDateRange, formatPeriodLabel)
- [x] T006 [P] Implement calculateConversionRate function in `src/server/services/dashboard-metrics.ts`
- [x] T007 [P] Implement calculatePercentageChange function in `src/server/services/dashboard-metrics.ts`
- [x] T008 Create unit tests for service layer in `tests/unit/server/services/dashboard-metrics.test.ts`
- [x] T009 Create tRPC dashboard router skeleton in `src/server/api/routers/dashboard.ts` with protectedProcedure base
- [x] T010 Add dashboard router to root router in `src/server/api/root.ts`
- [x] T011 Create integration test setup for dashboard router in `tests/integration/api/routers/dashboard.test.ts`
- [x] T012 Create dashboard page route structure in `src/app/(dashboard)/admin/metrics/page.tsx` with SSR config (`dynamic = 'force-dynamic'`)
- [x] T013 [P] Create loading state in `src/app/(dashboard)/admin/metrics/loading.tsx`
- [x] T014 [P] Create reusable MetricCard component in `src/app/(dashboard)/admin/metrics/_components/metric-card.tsx`
- [x] T015 [P] Create reusable ChartContainer wrapper in `src/app/(dashboard)/admin/metrics/_components/chart-container.tsx`
- [x] T016 [P] Create EmptyDashboardState component in `src/app/(dashboard)/admin/metrics/_components/empty-dashboard-state.tsx`
- [x] T017 [P] Create PeriodSelector component in `src/app/(dashboard)/admin/metrics/_components/period-selector.tsx`
- [x] T018 [P] Verify dashboard date formatters in `src/lib/format/index.ts` are exported (formatDateShort, formatDate, formatDateCustom)
- [x] T019 [P] Verify dashboard number formatters in `src/lib/format/index.ts` are exported (formatPercent, formatCurrency, formatCurrencyCompact)
- [x] T019b [P] **CRITICAL**: All dashboard components MUST use formatters from `@lib/format` only. NO ad-hoc formatting. Example: `formatCurrency(value, { context: tenantConfig })` instead of manual currency strings

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Visualización de Rendimiento de Cotizaciones (Priority: P1) 🎯 MVP

**Goal**: Display key quote performance metrics (total generated, conversion rates, temporal trends) in centralized dashboard

**Independent Test**: Access dashboard and verify it displays: total quotes by status (draft/sent/canceled), conversion rate, and 30-day trend chart. Delivers immediate business value showing current state.

**Estimated Time**: 75 minutes

### Implementation for User Story 1

- [x] T020 [P] [US1] Implement calculateQuoteMetrics function in `src/server/services/dashboard-metrics.ts` (aggregate counts by status, calculate conversion rate)
- [x] T021 [P] [US1] Implement aggregateQuotesByDate function in `src/server/services/dashboard-metrics.ts` (group quotes by creation date with zero-filling)
- [x] T022 [US1] Create getQuotesMetrics tRPC procedure in `src/server/api/routers/dashboard.ts` with RBAC (admin sees all, seller sees own), period comparison, and Winston logging. **Use `@lib/format` for all date/currency formatting in responses**
- [x] T023 [US1] Create getQuotesTrend tRPC procedure in `src/server/api/routers/dashboard.ts` with daily aggregation and tenant timezone handling via `@formkit/tempo`. **Return dates pre-formatted using `formatDateShort` from `@lib/format`**
- [x] T024 [P] [US1] Create QuotesMetricsCards component in `src/app/(dashboard)/admin/metrics/_components/quotes-metrics-cards.tsx` (4 metric cards: total, draft, sent, canceled with trends)
- [x] T025 [P] [US1] Create QuotesTrendChart component in `src/app/(dashboard)/admin/metrics/_components/quotes-trend-chart.tsx` (LineChart from recharts with tooltips, empty state handling)
- [x] T026 [US1] Integrate US1 components into DashboardContent in `src/app/(dashboard)/admin/metrics/_components/dashboard-content.tsx` with TanStack Query hooks and SSR pattern (router.refresh)
- [x] T027 [US1] Update dashboard page.tsx to fetch initial P1 metrics server-side and pass as props to DashboardContent
- [x] T028 [US1] Add integration tests for getQuotesMetrics and getQuotesTrend procedures (admin access, seller filtering, FORBIDDEN for user role)

**Checkpoint**: At this point, User Story 1 (P1 metrics) should be fully functional and testable independently. Dashboard shows quote performance with trend visualization.

---

## Phase 4: User Story 2 - Análisis de Catálogo y Productos Populares (Priority: P2)

**Goal**: Display most quoted models and glass types for inventory optimization and pricing decisions

**Independent Test**: Verify dashboard shows: top 5 most quoted models, top 5 glass types used, and distribution of quotes by profile supplier. Works independently of other metrics.

**Estimated Time**: 60 minutes

### Implementation for User Story 2

- [x] T029 [P] [US2] Implement getTopModels function in `src/server/services/dashboard-metrics.ts` (aggregate QuoteItem by modelId, join Model and ProfileSupplier, calculate percentages, limit 5)
- [x] T030 [P] [US2] Implement getGlassTypeDistribution function in `src/server/services/dashboard-metrics.ts` (aggregate QuoteItem by glassTypeId, join GlassType, calculate percentages, limit 5)
- [x] T031 [P] [US2] Implement getSupplierDistribution function in `src/server/services/dashboard-metrics.ts` (aggregate via Model.profileSupplierId, handle null case with "Sin fabricante")
- [x] T032 [US2] Create getCatalogAnalytics tRPC procedure in `src/server/api/routers/dashboard.ts` (combine top models, glass types, supplier distribution with RBAC filtering). **Format all percentages using `formatPercent` from `@lib/format`**
- [x] T033 [P] [US2] Create TopModelsChart component in `src/app/(dashboard)/admin/metrics/_components/top-models-chart.tsx` (BarChart with model names and supplier labels, tooltips showing percentages)
- [x] T034 [P] [US2] Create GlassTypesChart component in `src/app/(dashboard)/admin/metrics/_components/glass-types-chart.tsx` (PieChart with glass type names and codes, legend with percentages)
- [x] T035 [P] [US2] Create SupplierDistributionChart component in `src/app/(dashboard)/admin/metrics/_components/supplier-distribution-chart.tsx` (PieChart with supplier names and counts)
- [x] T036 [US2] Integrate US2 components into DashboardContent with getCatalogAnalytics query hook
- [x] T037 [US2] Add integration tests for getCatalogAnalytics procedure (verify top 5 limits, percentage calculations, empty array handling, RBAC filtering)

**Checkpoint**: At this point, User Story 2 (catalog analytics) should be fully functional. Dashboard shows product popularity insights for business decisions.

---

## Phase 5: User Story 3 - Métricas de Valor Monetario (Priority: P3)

**Goal**: Display monetary metrics (total value, average value, price range distribution) for financial volume understanding

**Independent Test**: Verify dashboard shows: total quote value in period, average ticket, and distribution of quotes by price ranges. Works independently using Quote.total data.

**Estimated Time**: 60 minutes

### Implementation for User Story 3

- [x] T038 [P] [US3] Implement calculateMonetaryMetrics function in `src/server/services/dashboard-metrics.ts` (sum Quote.total, calculate average, handle Decimal type, period comparison)
- [x] T039 [P] [US3] Implement groupQuotesByPriceRange function in `src/server/services/dashboard-metrics.ts` (configurable ranges: 0-1M, 1M-5M, 5M-10M, 10M+, count distribution)
- [x] T040 [P] [US3] Verify `formatCurrencyCompact` and `formatCurrency` exported from `src/lib/format/index.ts` (format large numbers: 5M, 10M+ using Intl with tenant currency and locale)
- [x] T041 [US3] Create getMonetaryMetrics tRPC procedure in `src/server/api/routers/dashboard.ts` (aggregate Quote.total with RBAC, use `formatCurrency` from `@lib/format` for all responses, period comparison)
- [x] T042 [US3] Create getPriceRanges tRPC procedure in `src/server/api/routers/dashboard.ts` (group by configurable price ranges with RBAC)
- [x] T043 [P] [US3] Create MonetaryMetricsCards component in `src/app/(dashboard)/admin/metrics/_components/monetary-metrics-cards.tsx` (2-3 metric cards: total value, average value with trends. **Use `formatCurrency` from `@lib/format` for all currency display**)
- [x] T044 [P] [US3] Create PriceRangesChart component in `src/app/(dashboard)/admin/metrics/_components/price-ranges-chart.tsx` (BarChart with price range labels and quote counts. **Use `formatCurrency` from `@lib/format` in tooltips**)
- [x] T045 [US3] Integrate US3 components into DashboardContent with getMonetaryMetrics and getPriceRanges query hooks
- [ ] T046 [US3] Add integration tests for getMonetaryMetrics and getPriceRanges procedures (verify `formatCurrency` applied consistently, Decimal handling, empty data, RBAC)

**Checkpoint**: At this point, User Story 3 (monetary metrics) should be fully functional. Dashboard shows financial insights with proper currency formatting from TenantConfig.

---

## Phase 6: User Story 4 - Filtros Temporales y Comparativas (Priority: P4)

**Goal**: Enable period filtering (7d, 30d, 90d, year) for all metrics with previous period comparison for trend identification

**Independent Test**: Select different time periods and verify all metrics update correctly. Works as enhancement layer over previous stories.

**Estimated Time**: 45 minutes

### Implementation for User Story 4

- [x] T047 [P] [US4] Implement calculatePeriodComparison function in `src/server/services/dashboard-metrics.ts` (compare current vs previous period, calculate percentage change, handle zero division)
- [x] T048 [P] [US4] Add period state management to DashboardContent in `src/app/(dashboard)/admin/metrics/_components/dashboard-content.tsx` (useState for selected period, default '30d')
- [x] T049 [US4] Connect PeriodSelector component to period state with onChange handler that invalidates all queries and calls router.refresh()
- [x] T050 [US4] Update all existing query hooks (US1, US2, US3) to use selected period from state instead of hardcoded '30d'
- [x] T051 [P] [US4] Add period comparison indicators to all MetricCard components (show "vs período anterior" with +/- percentage using `formatPercent` from `@lib/format` and colored arrows)
- [x] T052 [P] [US4] Update chart labels and tooltips to reflect selected period (e.g., "Últimos 7 días", "Últimos 30 días", "Últimos 90 días", "Año actual")
- [ ] T053 [US4] Add integration tests for period comparison logic (verify 7d vs 30d data differences, year-crossing scenarios, N/A handling when no previous data)
- [ ] T054 [US4] Add E2E test for period selector interaction in `e2e/admin/dashboard.spec.ts` (select different periods, verify metric updates, verify chart re-renders)

**Checkpoint**: At this point, User Story 4 (temporal filters) should be fully functional. Users can analyze metrics across different time periods with comparative insights.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Final quality checks, accessibility, performance, and documentation

**Estimated Time**: 60 minutes

- [ ] T055 [P] Add responsive design tests for mobile viewports (375px min-width) - verify all charts render correctly on small screens
- [ ] T056 [P] Add accessibility tests for dashboard components (keyboard navigation, screen reader labels, ARIA attributes for charts)
- [ ] T057 [P] Add error boundary for dashboard in `src/app/(dashboard)/admin/dashboard/error.tsx` with Spanish error messages and retry functionality
- [ ] T058 [P] Optimize chart performance with React.memo for chart components to prevent unnecessary re-renders
- [ ] T059 [P] Add Winston logging for slow queries (>1s) in all tRPC procedures with query execution time metrics
- [ ] T060 [P] Add Spanish tooltips and help text for all metrics explaining business meaning (e.g., "Tasa de conversión: porcentaje de cotizaciones enviadas respecto al total")
- [x] T061 [P] **CRITICAL**: Verify all monetary values use `formatCurrency` from `@lib/format` with tenant context, NO manual formatting
- [x] T062 [P] **CRITICAL**: Verify all date values use `formatDate` or `formatDateShort` from `@lib/format` with tenant context, NO manual formatting
- [x] T062b [P] **CRITICAL**: Verify all percentage values use `formatPercent` from `@lib/format`, NO manual "xx%" strings
- [x] T063 [P] **CRITICAL**: Audit codebase - NO direct date-fns-tz imports, ONLY use `@formkit/tempo` via `@lib/format`, remove any date-fns-tz usage
- [ ] T063 Create comprehensive E2E test suite in `e2e/admin/dashboard.spec.ts` (admin access, seller access, metric calculations, chart interactions, period filtering, empty states)
- [ ] T064 Run full test suite (`pnpm test` for unit/integration, `pnpm test:e2e` for E2E) and ensure all tests pass
- [ ] T066 Manual testing checklist: Test on Chrome, Firefox, Safari, Edge | Test on mobile (iOS Safari, Android Chrome) | Test with screen reader | Test RBAC (admin vs seller vs user) | Test empty states | Test large datasets (>1000 quotes)
- [x] T067 Update CHANGELOG.md with feature summary and breaking changes (none expected)
- [x] T068 [P] Update project documentation in `docs/` with dashboard architecture and usage guide
- [ ] T069 Create PR with checklist from quickstart.md pre-merge section (26 items)

**Checkpoint**: Feature complete, tested, documented, and ready for code review

---

## Dependencies & Execution Strategy

### User Story Dependencies

```
Setup (Phase 1) ──┐
                  ├──> Foundational (Phase 2) ──┐
                  │                              ├──> US1 (P1) ──┐
                  │                              ├──> US2 (P2) ──┼──> US4 (P4) ──> Polish
                  │                              └──> US3 (P3) ──┘
                  └──────────────────────────────────────────────────────────────^
```

- **Setup → Foundational**: Sequential (Setup MUST complete first)
- **Foundational → User Stories**: Sequential (Foundation MUST be complete before ANY user story)
- **US1, US2, US3**: Parallel (can be implemented simultaneously by different developers)
- **US4**: Depends on US1, US2, US3 (builds on top of all previous stories)
- **Polish**: Depends on US4 (final quality pass after all features complete)

### Parallel Execution Opportunities

**After Foundational Phase Complete**:
- Developer A: US1 (P1) - Quote metrics and trend chart (75 min)
- Developer B: US2 (P2) - Catalog analytics charts (60 min)
- Developer C: US3 (P3) - Monetary metrics charts (60 min)

**After US1, US2, US3 Complete**:
- Developer A: US4 (P4) - Temporal filters integration (45 min)

**During Polish Phase**:
- Developer A: Tests and accessibility (T055-T058)
- Developer B: Logging and formatting verification (T059-T062)
- Developer C: E2E tests and documentation (T063-T069)

### MVP Definition

**Minimum Viable Product = Phase 1 + Phase 2 + Phase 3 (US1 only)**

For fastest time-to-value, implement only User Story 1 first:
- Total tasks: T001-T028 (28 tasks)
- Estimated time: ~2.5 hours
- Delivers: Core quote performance metrics with trend visualization
- Independent value: Admins/sellers can immediately see business health

Then incrementally add US2 (catalog), US3 (monetary), US4 (filters) in separate releases.

---

## Implementation Notes

### Critical Patterns to Follow

1. **SSR Cache Invalidation**: All mutations MUST use two-step pattern:
   ```typescript
   onSettled: () => {
     void utils.dashboard.invalidate();  // Step 1: Clear cache
     router.refresh();                   // Step 2: Re-fetch server data
   }
   ```

2. **Winston Logger**: Server-side ONLY (tRPC procedures, service layer, middleware). NEVER in Client Components.

3. **RBAC Enforcement**: All tRPC procedures MUST check role and apply appropriate filter:
   ```typescript
   const roleFilter = ctx.session.user.role === 'admin'
     ? {}
     : { userId: ctx.session.user.id };
   ```

4. **Centralized Formatting**: ALL formatters MUST use `@lib/format` with TenantConfig context (MANDATORY, NO exceptions):
   - Currency: `formatCurrency(value, { context: tenantConfig })`
   - Dates: `formatDate(date, 'long', tenantConfig)` or `formatDateShort(date, tenantConfig)`
   - Numbers: `formatNumber(value, { context: tenantConfig })`
   - Percentages: `formatPercent(value, { context: tenantConfig })`
   - **⚠️ NEVER use manual formatting like `${value}%` or `$${value}` - ALWAYS use formatters**

5. **Date Handling**: ALL date operations use `@formkit/tempo` (already in package.json):
   - NO `date-fns-tz` imports (removed from dependencies consideration)
   - Server-side date formatting: Use `formatDate*` from `@lib/format` 
   - Timezone handling: Via TenantConfig.timezone passed to Tempo through formatters
   - **⚠️ Audit: Verify NO direct date-fns-tz imports exist anywhere in dashboard code**

6. **Chart Components**: MUST use `'use client'` directive. Data prepared server-side, passed as props.

7. **Empty States**: ALL charts and metrics MUST handle empty data gracefully with Spanish messages.

8. **Mobile Responsive**: Test all components at 375px min-width (iPhone SE).

### Testing Strategy

- **Unit Tests**: Service layer functions (pure business logic)
- **Integration Tests**: tRPC procedures (database queries + RBAC)
- **E2E Tests**: User flows (admin vs seller, period selection, chart interactions)
- **Manual Tests**: Cross-browser, mobile devices, accessibility

### Performance Targets

- Dashboard initial load: < 3 seconds
- P1 metrics render: < 2 seconds (up to 1,000 quotes)
- Chart interactions: < 100ms response time
- Support up to 10,000 quotes without degradation

---

## Pre-Merge Checklist

Before creating PR, verify:

- [ ] All unit tests pass (`pnpm test`)
- [ ] All integration tests pass
- [ ] All E2E tests pass (`pnpm test:e2e`)
- [ ] TypeScript compilation successful (no errors)
- [ ] Biome linting passes (`pnpm lint`)
- [ ] No Winston logger in Client Components
- [ ] **ALL formatters use `@lib/format` ONLY** (audit: grep for manual `$` and `%` formatting)
- [ ] **NO `date-fns-tz` imports** (only `@formkit/tempo` via `@lib/format`)
- [ ] RBAC enforced in all tRPC procedures
- [ ] SSR cache invalidation pattern applied (two-step: invalidate + router.refresh)
- [ ] All UI text in Spanish
- [ ] All charts responsive (tested at 375px)
- [ ] All charts have tooltips with formatted values from `@lib/format`
- [ ] All empty states implemented
- [ ] All error boundaries implemented
- [ ] Lighthouse Performance > 90
- [ ] Lighthouse Accessibility = 100
- [ ] Manual cross-browser testing complete
- [ ] Manual mobile testing complete
- [ ] Manual screen reader testing complete
- [ ] Admin can see all data
- [ ] Seller sees only own data
- [ ] User role blocked from dashboard
- [ ] Documentation updated
- [ ] CHANGELOG.md updated with formatting centralization note
- [ ] PR description includes screenshots and mentions "@lib/format ONLY" formatting strategy

---

## Quick Reference

- **Spec**: [spec.md](./spec.md) - User stories and requirements
- **Plan**: [plan.md](./plan.md) - Technical context and constitution check
- **Research**: [research.md](./research.md) - Technical decisions (shadcn charts, aggregation strategy)
- **Data Model**: [data-model.md](./data-model.md) - Domain types and business logic
- **Contracts**: [contracts/trpc-dashboard-router.md](./contracts/trpc-dashboard-router.md) - tRPC API procedures
- **Quickstart**: [quickstart.md](./quickstart.md) - Step-by-step implementation guide
- **Instructions**: [../../.github/copilot-instructions.md](../../.github/copilot-instructions.md) - Project patterns

---

## Summary

- **Total Tasks**: 69
- **Estimated Time**: ~6 hours
- **User Stories**: 4 (P1-P4)
- **tRPC Procedures**: 5 (metrics, trend, catalog, monetary, price ranges)
- **React Components**: ~15 (cards, charts, containers, states)
- **Service Functions**: ~8 (calculations, aggregations, helpers)
- **Test Files**: 3 (unit, integration, E2E)
- **MVP Scope**: Phase 1 + Phase 2 + Phase 3 (US1) = 28 tasks, ~2.5 hours
- **Parallel Opportunities**: US1, US2, US3 can be developed simultaneously after Foundation complete
- **Dependencies**: Setup → Foundation → User Stories → Polish (with US1/US2/US3 parallelizable)
