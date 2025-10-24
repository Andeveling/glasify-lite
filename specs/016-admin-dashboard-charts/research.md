# Phase 0: Research & Technical Decisions

**Feature**: Dashboard Informativo con Métricas y Charts  
**Date**: 2025-10-23  
**Status**: Complete

## Research Tasks

### 1. shadcn/ui Charts Package Identification

**Unknown from Technical Context**: Exact package name and version for shadcn/ui charts

**Research Question**: What is the official shadcn/ui charts package and how is it installed?

**Findings**:

shadcn/ui charts are built on top of **Recharts** (recharts.org) and are available as shadcn/ui components through the CLI.

**Package Details**:
- **Base Library**: `recharts` v2.12.7 (peer dependency)
- **Installation**: Via shadcn CLI command (not npm package)
- **Components Available**: 
  - Line Chart (`chart-line`)
  - Bar Chart (`chart-bar`)
  - Pie Chart (`chart-pie`)
  - Area Chart (`chart-area`)
  - Radar Chart (`chart-radar`)

**Installation Command**:
```bash
pnpm dlx shadcn@latest add chart
```

This installs:
- `components/ui/chart.tsx` - Base chart component with theme support
- Required dependencies: `recharts`, `recharts-scale`

**Decision**: Use shadcn/ui chart components (which wrap Recharts)

**Rationale**: 
- Official shadcn/ui integration ensures consistency with existing UI components
- Built-in theme support (dark/light mode)
- TypeScript support out of the box
- Responsive by default
- Maintained as part of shadcn/ui ecosystem

**Alternatives Considered**:
- **Chart.js**: More configuration required, less Next.js-friendly
- **Victory**: Heavier bundle size, more complex API
- **Raw Recharts**: No theme integration, requires custom styling
- **TanStack Charts**: Too new, less stable than Recharts

**Implementation Notes**:
- Recharts components require `'use client'` directive (no SSR)
- Chart data must be prepared server-side, passed as props
- Tooltips and interactions handled client-side

---

### 2. Data Aggregation Strategy for Large Datasets

**Unknown from Technical Context**: How to handle > 10,000 quotes without performance degradation

**Research Question**: What aggregation strategy should we use for dashboard metrics at scale?

**Findings**:

For the MVP (<10,000 quotes), real-time aggregation is acceptable. For larger datasets, consider these patterns:

**Option A: Real-Time Aggregation (MVP)**
- Prisma aggregate queries with proper indexes
- Server-side calculation in tRPC procedures
- Acceptable for < 10,000 quotes
- No additional infrastructure needed

**Option B: Materialized Views (Future)**
- PostgreSQL materialized views for pre-computed metrics
- Refresh on-demand or scheduled
- Requires migration and refresh strategy

**Option C: Cached Aggregations (Future)**
- Redis/Vercel KV for cached metrics
- TTL-based invalidation (5-15 minutes)
- Requires additional infrastructure

**Decision**: Use **Option A (Real-Time Aggregation)** for MVP

**Rationale**:
- Project assumption states < 10,000 quotes is target scale
- Prisma supports efficient aggregation queries
- PostgreSQL indexes will be sufficient for performance
- Simpler architecture (no cache layer needed)
- Can migrate to Option B or C if scale demands it

**Performance Optimizations**:
1. **Database Indexes** (already exist or will be added):
   - `Quote.userId` + `Quote.createdAt` (composite)
   - `Quote.status` (for filtering)
   - `QuoteItem.modelId` (for top models)
   - `QuoteItem.glassTypeId` (for glass distribution)

2. **Query Optimization**:
   - Use Prisma `groupBy` and `aggregate` for counts/sums
   - Limit date ranges to reduce data scanned
   - Use `select` to fetch only needed fields

3. **Caching Strategy** (if needed later):
   - 30-60 second cache for semi-static metrics
   - Invalidate on quote creation/update/deletion

**Alternatives Considered**:
- **Option B (Materialized Views)**: Over-engineering for MVP, adds complexity
- **Option C (Redis Cache)**: Requires new infrastructure, premature optimization

**Implementation Notes**:
- Monitor query performance with logging
- Add database query logging for queries > 1 second
- Consider pagination if displaying large result sets

---

### 3. Period Filtering and Date Calculations

**Research Question**: How to handle timezone-aware date calculations for period filtering?

**Findings**:

Next.js runs in UTC on the server. We must respect `TenantConfig.timezone` for accurate period boundaries.

**Approach**:
- Use `date-fns` (already in project) for date calculations
- Use `date-fns-tz` for timezone conversions
- Convert user-selected periods to UTC range queries

**Example Flow**:
1. User selects "Last 30 days" in UI
2. Server reads `TenantConfig.timezone` (e.g., "America/Bogota")
3. Calculate "today" in tenant timezone
4. Convert to UTC range: `[startOfDay(30 days ago, UTC), endOfDay(today, UTC)]`
5. Query database with UTC range
6. Format results back to tenant timezone for display

**Decision**: Use `date-fns-tz` for timezone-aware calculations

**Rationale**:
- Lightweight library (vs moment.js)
- Immutable date objects (safer)
- Tree-shakeable (smaller bundle)
- Works with TenantConfig pattern

**Alternatives Considered**:
- **Day.js**: Smaller but less feature-rich
- **Luxon**: Heavier, more complex API
- **Native Temporal API**: Not yet widely supported

**Implementation Notes**:
- Create helper function `getDateRangeInTenantTz(period, timezone)`
- Convert all dates to UTC before Prisma queries
- Format dates for display using tenant locale + timezone

---

### 4. RBAC Implementation for Dashboard

**Research Question**: How to enforce seller data isolation without code duplication?

**Findings**:

The project already has RBAC patterns in place. We should reuse them:

**Existing Patterns**:
1. **Middleware**: `src/middleware.ts` checks routes by role
2. **tRPC Procedures**: `adminProcedure`, `protectedProcedure` in `src/server/api/trpc.ts`
3. **Helper Functions**: `getQuoteFilter(userId, role)` returns role-based WHERE clauses

**Decision**: Use existing `adminOrSellerProcedure` + `getQuoteFilter()` helper

**Rationale**:
- Consistent with existing codebase patterns
- Single source of truth for authorization logic
- Testable in isolation
- Prevents SQL injection through parameterized queries

**Implementation Pattern**:
```typescript
// In dashboard.ts router
export const dashboardRouter = createTRPCRouter({
  getQuotesMetrics: protectedProcedure
    .input(z.object({ period: z.enum(['7d', '30d', '90d', 'year']) }))
    .query(async ({ ctx, input }) => {
      // Get role-based filter
      const filter = getQuoteFilter(ctx.session.user.id, ctx.session.user.role);
      
      // Apply period + role filter
      const metrics = await ctx.db.quote.aggregate({
        where: {
          ...filter,
          createdAt: {
            gte: calculatePeriodStart(input.period),
          },
        },
        _count: { id: true },
      });
      
      return metrics;
    }),
});
```

**Alternatives Considered**:
- **Row-Level Security (RLS)**: Requires PostgreSQL setup, over-engineering
- **Manual role checks**: Error-prone, duplicates logic

**Implementation Notes**:
- Every dashboard procedure must use `getQuoteFilter()`
- Log unauthorized access attempts
- Test both admin and seller access paths

---

### 5. Empty State Handling

**Research Question**: How to provide good UX when users have no data?

**Findings**:

Empty states are critical for onboarding and user guidance.

**Scenarios to Handle**:
1. **New user (no quotes ever)**: Show motivational message + CTA to create first quote
2. **Filtered period has no data**: Show message explaining no data in selected period
3. **Chart has insufficient data**: Show partial chart with explanation
4. **Seller with no quotes**: Different message than admin (permission vs no data)

**Decision**: Create dedicated empty state components with contextual messaging

**Component Structure**:
- `EmptyDashboardState` - No quotes at all
- `EmptyPeriodState` - No data in selected period
- `InsufficientDataState` - < 3 data points for chart

**Rationale**:
- Better UX than blank screens or errors
- Guides users to next action
- Reduces support tickets

**Alternatives Considered**:
- **Generic "No data" message**: Less helpful
- **Hide empty sections**: Confusing (where did it go?)

**Implementation Notes**:
- All empty states in Spanish
- Include friendly illustrations (shadcn/ui icons)
- Provide actionable CTAs where appropriate

---

### 6. Chart Responsiveness Strategy

**Research Question**: How to make charts readable on mobile (375px min viewport)?

**Findings**:

Recharts is responsive by default, but requires configuration for small screens.

**Approach**:
- Use `<ResponsiveContainer>` wrapper (Recharts built-in)
- Adjust font sizes for mobile
- Simplify tooltips on small screens
- Stack charts vertically on mobile
- Reduce data points on mobile if needed

**Decision**: Mobile-first responsive design with conditional rendering

**Layout Strategy**:
- **Desktop (≥768px)**: 2-column grid for cards, full chart labels
- **Tablet (≥640px)**: 2-column grid, abbreviated labels
- **Mobile (<640px)**: Single column, minimal labels, larger touch targets

**Rationale**:
- TailwindCSS breakpoints align with this strategy
- Most users will view on desktop, but mobile should be functional
- Shadcn/ui components are already responsive

**Alternatives Considered**:
- **Desktop-only**: Poor UX for mobile users
- **Separate mobile views**: Code duplication

**Implementation Notes**:
- Test all charts at 375px, 768px, 1024px
- Use TailwindCSS responsive classes (`sm:`, `md:`, `lg:`)
- Ensure touch targets ≥44px for mobile

---

### 7. Price Range Grouping for Monetary Metrics

**Research Question**: What price ranges make sense for COP (Colombian Peso) quotes?

**Findings**:

Assumption: TenantConfig uses COP currency (based on Colombian context).

Typical window/door quote ranges in COP:
- Budget: 0 - 1,000,000 COP
- Mid-range: 1,000,000 - 5,000,000 COP
- Premium: 5,000,000 - 10,000,000 COP
- Luxury: 10,000,000+ COP

**Decision**: Use configurable price ranges with sensible COP defaults

**Default Ranges**:
```typescript
const DEFAULT_PRICE_RANGES = [
  { min: 0, max: 1_000_000, label: "Hasta $1M" },
  { min: 1_000_000, max: 5_000_000, label: "$1M - $5M" },
  { min: 5_000_000, max: 10_000_000, label: "$5M - $10M" },
  { min: 10_000_000, max: Infinity, label: "Más de $10M" },
];
```

**Rationale**:
- Based on typical Colombian market prices
- Round numbers for easy interpretation
- Configurable for future multi-currency support

**Alternatives Considered**:
- **Dynamic ranges based on data**: Complex, less predictable
- **Fixed USD ranges**: Not relevant for COP market

**Implementation Notes**:
- Format ranges using `TenantConfig.locale` and `TenantConfig.currency`
- Consider making ranges configurable in TenantConfig (future)

---

### 8. Performance Monitoring

**Research Question**: How to detect slow queries and performance issues?

**Findings**:

Winston logging is already in place for server-side operations.

**Approach**:
- Log all dashboard queries with execution time
- Alert on queries > 1 second
- Log cache hits/misses (if caching added later)

**Decision**: Add structured logging for dashboard operations

**Logging Strategy**:
```typescript
logger.info("Dashboard metrics query", {
  userId: ctx.session.user.id,
  role: ctx.session.user.role,
  period: input.period,
  duration: queryDuration,
  quoteCount: result.length,
});

if (queryDuration > 1000) {
  logger.warn("Slow dashboard query detected", {
    userId: ctx.session.user.id,
    procedure: "getQuotesMetrics",
    duration: queryDuration,
  });
}
```

**Rationale**:
- Proactive performance monitoring
- Helps identify optimization opportunities
- Supports debugging production issues

**Alternatives Considered**:
- **APM tool (New Relic, DataDog)**: Over-budget for MVP
- **No logging**: Blind to performance issues

**Implementation Notes**:
- Use `performance.now()` for duration tracking
- Log to Winston (server-side only)
- Consider adding Vercel Analytics (if on Vercel)

---

## Research Summary

All NEEDS CLARIFICATION items from Technical Context have been resolved:

1. ✅ **shadcn/ui charts package**: Use shadcn CLI to install chart components (built on Recharts)
2. ✅ **Aggregation strategy**: Real-time Prisma aggregations for MVP (<10,000 quotes)
3. ✅ **Timezone handling**: Use `date-fns-tz` with `TenantConfig.timezone`
4. ✅ **RBAC implementation**: Reuse existing `getQuoteFilter()` helper pattern
5. ✅ **Empty states**: Dedicated components with contextual messaging
6. ✅ **Mobile responsiveness**: Responsive grid + conditional rendering
7. ✅ **Price ranges**: Configurable with COP-focused defaults
8. ✅ **Performance monitoring**: Structured logging with query duration tracking

## Technology Stack Finalized

**Runtime**:
- TypeScript 5.8.2, Node.js (ES2022)
- Next.js 15.2.3 (App Router, SSR with `force-dynamic`)

**Data Visualization**:
- shadcn/ui chart components (via CLI)
- recharts v2.12.7 (peer dependency)
- recharts-scale (for proper scaling)

**Date/Time**:
- date-fns (already in project)
- date-fns-tz (add as dependency for timezone support)

**Database**:
- PostgreSQL via Prisma 6.16.2
- Real-time aggregation queries
- Existing indexes (no schema changes needed)

**Formatting**:
- Use existing `@lib/format` helpers
- Extend with dashboard-specific formatters if needed

**Testing**:
- Vitest for unit tests (metrics calculations)
- Playwright for E2E (user flows)
- tRPC test utilities for integration tests

## Next Phase

Phase 0 research is complete. Ready to proceed to **Phase 1: Design & Contracts**.
