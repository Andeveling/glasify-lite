# Quickstart Guide: Dashboard Implementation

**Feature**: Dashboard Informativo con Métricas y Charts  
**Date**: 2025-10-23  
**Audience**: Developers implementing this feature

## Prerequisites

Before starting implementation, ensure you have:

- [x] Read `spec.md` (feature requirements)
- [x] Read `research.md` (technical decisions)
- [x] Read `data-model.md` (domain design)
- [x] Read `contracts/trpc-dashboard-router.md` (API contracts)
- [x] Access to development database with test data
- [x] Next.js development server running
- [x] shadcn/ui CLI installed (`pnpm dlx shadcn@latest`)

---

## Phase 2: Implementation Order

Follow this sequence for implementing the dashboard feature. Each step is designed to be independently testable before moving to the next.

### Step 1: Install Dependencies (5 min)

**Goal**: Add required packages for charts and date handling

```bash
# Install shadcn/ui chart components
pnpm dlx shadcn@latest add chart

# Install date-fns-tz for timezone support
pnpm add date-fns-tz

# Verify recharts was installed as peer dependency
pnpm list recharts
```

**Verification**:
- [ ] `components/ui/chart.tsx` exists
- [ ] `recharts` in `package.json` dependencies
- [ ] `date-fns-tz` in `package.json` dependencies

**Notes**:
- shadcn CLI will prompt for chart installation options (accept defaults)
- date-fns is already in project, only date-fns-tz is new

---

### Step 2: Create Shared Types (10 min)

**Goal**: Define TypeScript interfaces for dashboard data structures

**File**: `src/types/dashboard.ts`

**Content**: Copy types from `data-model.md` section "Domain Types"

**Key Types to Define**:
- `DashboardPeriod` enum
- `QuoteMetrics` interface
- `TrendDataPoint` interface
- `CatalogAnalytics` interface
- `MonetaryMetrics` interface
- `PriceRange` interface

**Test**:
```typescript
import type { DashboardPeriod, QuoteMetrics } from '~/types/dashboard';

// ✅ TypeScript should not show errors
const period: DashboardPeriod = '30d';
const metrics: QuoteMetrics = {
  totalQuotes: 0,
  draftQuotes: 0,
  sentQuotes: 0,
  canceledQuotes: 0,
  conversionRate: 0,
  previousPeriodTotal: 0,
  percentageChange: 0,
};
```

**Verification**:
- [ ] TypeScript compilation passes
- [ ] No type errors in IDE
- [ ] All 6+ types exported

---

### Step 3: Create Service Layer (30 min)

**Goal**: Implement business logic for metrics calculation

**File**: `src/server/services/dashboard-metrics.ts`

**Functions to Implement** (see `data-model.md` for signatures):
1. `calculateQuoteMetrics()` - Aggregate quote counts by status
2. `calculateConversionRate()` - (sent / total) * 100
3. `aggregateQuotesByDate()` - Group quotes by creation date
4. `getTopModels()` - Top 5 models by usage
5. `getGlassTypeDistribution()` - Glass type usage percentages
6. `calculateMonetaryMetrics()` - Sum and average of quote totals
7. `groupQuotesByPriceRange()` - Distribute quotes into price ranges
8. `calculatePeriodComparison()` - Compare current vs previous period

**Helper Functions**:
- `getPeriodDateRange(period, timezone)` - Convert period to UTC date range
- `formatPeriodLabel(period)` - Spanish label for period

**Unit Tests**: `tests/unit/server/services/dashboard-metrics.test.ts`

**Test Cases**:
```typescript
describe('calculateConversionRate', () => {
  it('returns 0 when no quotes', () => {
    expect(calculateConversionRate(0, 0)).toBe(0);
  });
  
  it('calculates rate correctly', () => {
    expect(calculateConversionRate(7, 10)).toBe(70);
  });
  
  it('rounds to 2 decimals', () => {
    expect(calculateConversionRate(1, 3)).toBe(33.33);
  });
});
```

**Verification**:
- [ ] All unit tests pass (`pnpm test dashboard-metrics`)
- [ ] Functions are pure (no side effects)
- [ ] Edge cases handled (zero division, empty arrays)

**Estimated Time**: 30 minutes

---

### Step 4: Create tRPC Router (45 min)

**Goal**: Implement API endpoints for dashboard data

**File**: `src/server/api/routers/dashboard.ts`

**Procedures to Implement** (see `contracts/trpc-dashboard-router.md`):
1. `getQuotesMetrics` - P1 metrics
2. `getQuotesTrend` - P1 trend chart data
3. `getCatalogAnalytics` - P2 catalog analysis
4. `getMonetaryMetrics` - P3 financial metrics
5. `getPriceRanges` - P3 price distribution

**Pattern**:
```typescript
export const dashboardRouter = createTRPCRouter({
  getQuotesMetrics: protectedProcedure
    .input(z.object({ period: z.enum(['7d', '30d', '90d', 'year']) }))
    .query(async ({ ctx, input }) => {
      // 1. Check authorization
      const isAdminOrSeller = ['admin', 'seller'].includes(ctx.session.user.role);
      if (!isAdminOrSeller) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'No tienes permisos para acceder al dashboard',
        });
      }
      
      // 2. Get role-based filter
      const roleFilter = ctx.session.user.role === 'admin'
        ? {}
        : { userId: ctx.session.user.id };
      
      // 3. Calculate date range
      const tenantConfig = await ctx.db.tenantConfig.findUnique({
        where: { id: '1' },
      });
      const dateRange = getPeriodDateRange(input.period, tenantConfig.timezone);
      
      // 4. Query database
      const quotes = await ctx.db.quote.findMany({
        where: {
          ...roleFilter,
          createdAt: {
            gte: dateRange.start,
            lte: dateRange.end,
          },
        },
        select: {
          id: true,
          status: true,
        },
      });
      
      // 5. Calculate metrics
      const metrics = calculateQuoteMetrics(quotes);
      
      // 6. Calculate previous period for comparison
      const previousRange = getPeriodDateRange(
        input.period,
        tenantConfig.timezone,
        true // isPrevious flag
      );
      const previousQuotes = await ctx.db.quote.count({
        where: {
          ...roleFilter,
          createdAt: {
            gte: previousRange.start,
            lte: previousRange.end,
          },
        },
      });
      
      return {
        ...metrics,
        previousPeriodTotal: previousQuotes,
        percentageChange: calculatePercentageChange(
          metrics.totalQuotes,
          previousQuotes
        ),
      };
    }),
  
  // ... other procedures
});
```

**Add to Root Router**: `src/server/api/root.ts`
```typescript
import { dashboardRouter } from './routers/dashboard';

export const appRouter = createTRPCRouter({
  // ... existing routers
  dashboard: dashboardRouter,
});
```

**Integration Tests**: `tests/integration/api/routers/dashboard.test.ts`

**Test Cases**:
```typescript
describe('dashboard.getQuotesMetrics', () => {
  it('returns metrics for admin', async () => {
    const caller = createCallerWithAdminSession();
    const result = await caller.dashboard.getQuotesMetrics({ period: '30d' });
    
    expect(result).toMatchObject({
      totalQuotes: expect.any(Number),
      conversionRate: expect.any(Number),
    });
  });
  
  it('filters quotes for seller', async () => {
    // Test that seller only sees own quotes
  });
  
  it('throws FORBIDDEN for regular user', async () => {
    const caller = createCallerWithUserSession();
    
    await expect(
      caller.dashboard.getQuotesMetrics({ period: '30d' })
    ).rejects.toThrow('No tienes permisos');
  });
});
```

**Verification**:
- [ ] All integration tests pass
- [ ] RBAC enforced (admin vs seller filtering)
- [ ] Error messages in Spanish
- [ ] Winston logging added for slow queries (>1s)

**Estimated Time**: 45 minutes

---

### Step 5: Create Dashboard Route (15 min)

**Goal**: Set up the dashboard page route structure

**Files to Create**:
1. `src/app/(dashboard)/admin/dashboard/page.tsx` - Server Component
2. `src/app/(dashboard)/admin/dashboard/loading.tsx` - Loading state

**Page Structure** (`page.tsx`):
```typescript
import { api } from '~/trpc/server';
import type { Metadata } from 'next';
import DashboardContent from './_components/dashboard-content';

export const dynamic = 'force-dynamic'; // ⚠️ Required for SSR

export const metadata: Metadata = {
  title: 'Dashboard',
  description: 'Dashboard de métricas y análisis',
};

export default async function DashboardPage() {
  // Fetch initial data server-side for fast first paint
  const initialMetrics = await api.dashboard.getQuotesMetrics.query({
    period: '30d',
  });
  
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      <DashboardContent initialMetrics={initialMetrics} />
    </div>
  );
}
```

**Loading State** (`loading.tsx`):
```typescript
import { Skeleton } from '~/components/ui/skeleton';

export default function DashboardLoading() {
  return (
    <div className="container mx-auto p-6">
      <Skeleton className="h-10 w-48 mb-6" />
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Skeleton key={i} className="h-48" />
        ))}
      </div>
    </div>
  );
}
```

**Verification**:
- [ ] Route accessible at `/admin/dashboard`
- [ ] Loading state shows while page loads
- [ ] Middleware RBAC protects route (admin/seller only)

**Estimated Time**: 15 minutes

---

### Step 6: Create Reusable Components (30 min)

**Goal**: Build atomic components for dashboard UI

**Files to Create**:
1. `metric-card.tsx` - Display single metric with label
2. `chart-container.tsx` - Wrapper for charts with title/description
3. `empty-dashboard-state.tsx` - Empty state when no data
4. `period-selector.tsx` - Dropdown for time period selection

**Example** (`metric-card.tsx`):
```typescript
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { ArrowUp, ArrowDown } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  description?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  icon?: React.ReactNode;
}

export function MetricCard({
  title,
  value,
  description,
  trend,
  icon,
}: MetricCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
        {trend && (
          <div className="flex items-center gap-1 mt-2">
            {trend.isPositive ? (
              <ArrowUp className="h-4 w-4 text-green-500" />
            ) : (
              <ArrowDown className="h-4 w-4 text-red-500" />
            )}
            <span
              className={`text-sm ${
                trend.isPositive ? 'text-green-500' : 'text-red-500'
              }`}
            >
              {Math.abs(trend.value).toFixed(1)}%
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
```

**Verification**:
- [ ] Components render without errors
- [ ] Props typed correctly
- [ ] Responsive on mobile (test at 375px)
- [ ] Accessible (keyboard navigation, screen readers)

**Estimated Time**: 30 minutes

---

### Step 7: Create Feature Components (P1) (60 min)

**Goal**: Implement Priority 1 features (quote metrics + trend)

**Files to Create**:
1. `quotes-metrics-card.tsx` - Display quote metrics (4 cards)
2. `quotes-trend-chart.tsx` - Line chart for 30-day trend

**Example** (`quotes-trend-chart.tsx`):
```typescript
'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '~/components/ui/card';
import type { TrendDataPoint } from '~/types/dashboard';

interface QuotesTrendChartProps {
  data: TrendDataPoint[];
  period: string;
}

export function QuotesTrendChart({ data, period }: QuotesTrendChartProps) {
  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Tendencia de Cotizaciones</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No hay datos disponibles para el período seleccionado.
          </p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Tendencia de Cotizaciones</CardTitle>
        <CardDescription>
          Evolución diaria en los últimos {period === '7d' ? '7' : '30'} días
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 12 }}
              interval="preserveStartEnd"
            />
            <YAxis />
            <Tooltip
              labelStyle={{ color: 'black' }}
              formatter={(value: number) => [`${value} cotizaciones`, '']}
            />
            <Line
              type="monotone"
              dataKey="count"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
```

**Dashboard Content** (`dashboard-content.tsx`):
```typescript
'use client';

import { useState } from 'react';
import { api } from '~/trpc/react';
import { useRouter } from 'next/navigation';
import { MetricCard } from './metric-card';
import { QuotesTrendChart } from './quotes-trend-chart';
import { PeriodSelector } from './period-selector';
import type { QuoteMetrics } from '~/types/dashboard';

interface DashboardContentProps {
  initialMetrics: QuoteMetrics;
}

export default function DashboardContent({ initialMetrics }: DashboardContentProps) {
  const router = useRouter();
  const [period, setPeriod] = useState<'7d' | '30d' | '90d' | 'year'>('30d');
  
  const utils = api.useUtils();
  
  // Use initialMetrics for SSR, then client-side query takes over
  const { data: metrics } = api.dashboard.getQuotesMetrics.useQuery(
    { period },
    { initialData: period === '30d' ? initialMetrics : undefined }
  );
  
  const { data: trendData } = api.dashboard.getQuotesTrend.useQuery({ period });
  
  const handlePeriodChange = (newPeriod: typeof period) => {
    setPeriod(newPeriod);
    // Invalidate and refresh for SSR pattern
    void utils.dashboard.getQuotesMetrics.invalidate();
    router.refresh();
  };
  
  return (
    <div className="space-y-6">
      <PeriodSelector value={period} onChange={handlePeriodChange} />
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Cotizaciones"
          value={metrics?.totalQuotes ?? 0}
          trend={{
            value: metrics?.percentageChange ?? 0,
            isPositive: (metrics?.percentageChange ?? 0) >= 0,
          }}
        />
        <MetricCard
          title="Enviadas"
          value={metrics?.sentQuotes ?? 0}
        />
        <MetricCard
          title="Borradores"
          value={metrics?.draftQuotes ?? 0}
        />
        <MetricCard
          title="Tasa de Conversión"
          value={`${(metrics?.conversionRate ?? 0).toFixed(1)}%`}
        />
      </div>
      
      <QuotesTrendChart
        data={trendData?.dataPoints ?? []}
        period={period}
      />
    </div>
  );
}
```

**Verification**:
- [ ] Metrics cards display correctly
- [ ] Line chart renders with data
- [ ] Empty state shows when no data
- [ ] Period selector updates data
- [ ] SSR + client hydration works (no flash of wrong data)
- [ ] `router.refresh()` called after period change

**Estimated Time**: 60 minutes

---

### Step 8: Create Feature Components (P2 & P3) (90 min)

**Goal**: Implement Priority 2 and 3 features (catalog analytics + monetary metrics)

**Files to Create**:
1. `catalog-analytics-card.tsx` - Container for P2 metrics
2. `top-models-chart.tsx` - Bar chart for top 5 models
3. `glass-distribution-chart.tsx` - Pie chart for glass types
4. `monetary-metrics-card.tsx` - Financial metrics display
5. `price-range-chart.tsx` - Bar chart for price distribution

**Follow similar patterns to Step 7** (components for charts, handle empty states, responsive design)

**Verification**:
- [ ] Bar charts render correctly
- [ ] Pie chart shows percentages
- [ ] Monetary values formatted with currency symbol
- [ ] All charts responsive on mobile

**Estimated Time**: 90 minutes

---

### Step 9: Create E2E Tests (45 min)

**Goal**: Test complete user flows from login to dashboard interaction

**Files to Create**:
1. `e2e/dashboard/admin-dashboard.spec.ts`
2. `e2e/dashboard/seller-dashboard.spec.ts`

**Example** (`admin-dashboard.spec.ts`):
```typescript
import { test, expect } from '@playwright/test';

test.describe('Admin Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Login as admin
    await page.goto('/auth/signin');
    await page.fill('[name="email"]', 'admin@test.com');
    await page.fill('[name="password"]', 'password');
    await page.click('button[type="submit"]');
    await page.waitForURL('/admin/dashboard');
  });
  
  test('should display quote metrics', async ({ page }) => {
    await expect(page.getByText('Total Cotizaciones')).toBeVisible();
    await expect(page.getByText('Enviadas')).toBeVisible();
    await expect(page.getByText('Tasa de Conversión')).toBeVisible();
  });
  
  test('should render trend chart', async ({ page }) => {
    await expect(page.getByText('Tendencia de Cotizaciones')).toBeVisible();
    // Wait for chart to render
    await page.waitForSelector('svg.recharts-surface');
  });
  
  test('should filter by period', async ({ page }) => {
    await page.click('[data-testid="period-selector"]');
    await page.click('[data-value="7d"]');
    
    // Wait for data to reload
    await page.waitForTimeout(1000);
    
    // Verify chart updated (different data)
    await expect(page.locator('svg.recharts-surface')).toBeVisible();
  });
  
  test('should show empty state when no data', async ({ page }) => {
    // Test with period that has no data
    await page.click('[data-testid="period-selector"]');
    await page.click('[data-value="year"]');
    
    await expect(
      page.getByText('No hay datos disponibles')
    ).toBeVisible();
  });
});
```

**Verification**:
- [ ] All E2E tests pass
- [ ] Tests run in CI/CD pipeline
- [ ] Both admin and seller flows tested

**Estimated Time**: 45 minutes

---

### Step 10: Polish & Accessibility (30 min)

**Goal**: Ensure UX quality and accessibility standards

**Checklist**:
- [ ] All text in Spanish (labels, tooltips, empty states)
- [ ] Color contrast meets WCAG AA standards
- [ ] Keyboard navigation works (tab through all interactive elements)
- [ ] Screen reader announces chart data
- [ ] Loading states for all async operations
- [ ] Error boundaries for chart render failures
- [ ] Responsive layout tested at 375px, 768px, 1024px
- [ ] Touch targets ≥44px on mobile
- [ ] Tooltips show additional context on hover

**Accessibility Fixes**:
```typescript
// Add ARIA labels
<LineChart aria-label="Gráfico de tendencia de cotizaciones">
  ...
</LineChart>

// Add role="status" for live regions
<div role="status" aria-live="polite">
  {isLoading ? 'Cargando métricas...' : null}
</div>

// Ensure color is not the only indicator
<span className="text-green-500">
  <ArrowUp className="inline" aria-hidden="true" />
  <span className="sr-only">Aumento de</span>
  +15%
</span>
```

**Verification**:
- [ ] axe DevTools reports 0 critical issues
- [ ] Lighthouse accessibility score ≥90
- [ ] Manual keyboard navigation test passed
- [ ] Manual screen reader test passed (NVDA/JAWS)

**Estimated Time**: 30 minutes

---

## Total Estimated Time

| Step                                   | Time        |
| -------------------------------------- | ----------- |
| 1. Install Dependencies                | 5 min       |
| 2. Create Shared Types                 | 10 min      |
| 3. Create Service Layer                | 30 min      |
| 4. Create tRPC Router                  | 45 min      |
| 5. Create Dashboard Route              | 15 min      |
| 6. Create Reusable Components          | 30 min      |
| 7. Create Feature Components (P1)      | 60 min      |
| 8. Create Feature Components (P2 & P3) | 90 min      |
| 9. Create E2E Tests                    | 45 min      |
| 10. Polish & Accessibility             | 30 min      |
| **Total**                              | **6 hours** |

**Note**: Times are estimates for experienced developers. Add buffer time for learning curve and debugging.

---

## Development Workflow

### Running Tests During Development

```bash
# Unit tests (watch mode)
pnpm test:watch

# Integration tests
pnpm test:integration

# E2E tests (headless)
pnpm test:e2e

# E2E tests (headed - see browser)
pnpm test:e2e:ui

# All tests
pnpm test
```

### Type Checking

```bash
# Check types
pnpm typecheck

# Watch mode
pnpm typecheck:watch
```

### Linting & Formatting

```bash
# Lint
pnpm lint

# Format
pnpm format
```

### Development Server

```bash
# Start Next.js dev server
pnpm dev

# Dashboard will be at:
# http://localhost:3000/admin/dashboard
```

---

## Troubleshooting

### Issue: Charts not rendering

**Symptoms**: Blank space where chart should be

**Solutions**:
1. Check browser console for errors
2. Verify `'use client'` directive in chart components
3. Verify recharts is installed (`pnpm list recharts`)
4. Check data format matches Recharts expectations

### Issue: RBAC not working (seller sees all quotes)

**Symptoms**: Seller user sees admin-level data

**Solutions**:
1. Verify `getQuoteFilter()` is called in tRPC procedure
2. Check session.user.role is correct
3. Add logging to verify filter is applied
4. Test with different user accounts

### Issue: Dates showing wrong timezone

**Symptoms**: Metrics don't match expected date ranges

**Solutions**:
1. Verify TenantConfig.timezone is set correctly
2. Check `getPeriodDateRange()` uses `date-fns-tz`
3. Ensure all dates converted to UTC before database query
4. Log UTC date ranges to debug

### Issue: Slow query performance

**Symptoms**: Dashboard takes >3 seconds to load

**Solutions**:
1. Check PostgreSQL query execution plan (`EXPLAIN ANALYZE`)
2. Verify indexes exist (see schema.prisma)
3. Add query duration logging
4. Consider pagination or caching if >10,000 quotes

### Issue: SSR cache not invalidating

**Symptoms**: Dashboard doesn't update after creating quote

**Solutions**:
1. Verify `router.refresh()` is called after mutations
2. Check `dynamic = 'force-dynamic'` is set in page.tsx
3. Ensure `invalidate()` is called before `refresh()`
4. Test in production build (not just dev mode)

---

## Pre-Merge Checklist

Before creating pull request:

- [ ] All unit tests pass
- [ ] All integration tests pass
- [ ] All E2E tests pass
- [ ] TypeScript compilation succeeds
- [ ] Linting passes (no errors)
- [ ] Code formatted correctly
- [ ] All UI text in Spanish
- [ ] All code/comments in English
- [ ] Conventional commit format used
- [ ] PR description references constitution principles
- [ ] Manual testing on mobile (375px)
- [ ] Manual testing on tablet (768px)
- [ ] Manual testing on desktop (1024px+)
- [ ] Tested as admin user
- [ ] Tested as seller user
- [ ] Tested with empty data
- [ ] Tested with large dataset (>1000 quotes)
- [ ] Lighthouse accessibility score ≥90
- [ ] No console errors or warnings
- [ ] No React hydration errors

---

## Next Steps After Implementation

1. **Deploy to staging**: Test with real data
2. **User acceptance testing**: Get feedback from admin/seller users
3. **Performance monitoring**: Watch Winston logs for slow queries
4. **Iterate based on feedback**: Implement P4 (temporal filters) if needed
5. **Consider future enhancements**:
   - Export to Excel/PDF
   - Custom date range selector
   - More advanced charts (heat maps, etc.)
   - Real-time updates (WebSocket)
   - Dashboard customization (drag & drop widgets)

---

## Additional Resources

- [shadcn/ui Charts Documentation](https://ui.shadcn.com/docs/components/chart)
- [Recharts Documentation](https://recharts.org/en-US/api)
- [tRPC Best Practices](https://trpc.io/docs/best-practices)
- [Next.js 15 App Router](https://nextjs.org/docs/app)
- [date-fns-tz Documentation](https://github.com/marnusw/date-fns-tz)
- [Prisma Aggregations](https://www.prisma.io/docs/concepts/components/prisma-client/aggregation-grouping-summarizing)

---

## Summary

This quickstart guide provides a step-by-step implementation plan for the dashboard feature, designed to be completed in approximately **6 hours** of focused development time. Each step builds on the previous one and is independently testable, following best practices from the Glasify Lite Constitution.

Key principles applied:
- **Server-First Architecture**: SSR with `force-dynamic`, `router.refresh()` pattern
- **Single Responsibility**: Service layer, API layer, UI layer separated
- **Pragmatic Testing**: Unit → Integration → E2E
- **Security**: RBAC enforced at every layer
- **Observability**: Winston logging for slow queries

Ready for implementation! 🚀
