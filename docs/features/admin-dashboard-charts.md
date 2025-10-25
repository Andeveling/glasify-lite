# Admin Dashboard Charts

**Feature**: Comprehensive analytics dashboard for admin users  
**Epic**: 016-admin-dashboard-charts  
**Status**: ✅ Complete (Implementation Phase)  
**Last Updated**: 2025-10-24

---

## Overview

The Admin Dashboard provides real-time business intelligence and analytics for quote management. It displays key performance indicators (KPIs), trend analysis, and catalog usage metrics with period-over-period comparisons.

### User Stories

- **US1: Quote Performance Metrics** - Track total quotes, conversion rates, and daily averages
- **US2: Catalog Analytics** - Identify popular models, glass types, and supplier distribution
- **US3: Monetary Metrics** - Monitor total quote value, average ticket, and price range distribution
- **US4: Temporal Filters** - Compare metrics across 7d, 30d, 90d, and yearly periods

---

## Architecture

### Component Hierarchy

```
app/(dashboard)/admin/metrics/
├── page.tsx                                 # Server Component (SSR with force-dynamic)
│   └── <DashboardContent />                 # Client Component
│       ├── <PeriodSelector />               # URL state management
│       ├── <QuotesMetricsCards />           # US1: 3 metric cards
│       ├── <QuotesTrendChart />             # US1: Line chart
│       ├── <TopModelsChart />               # US2: Horizontal bar chart
│       ├── <GlassTypesChart />              # US2: Pie chart
│       ├── <SupplierDistributionChart />    # US2: Pie chart
│       ├── <MonetaryMetricsCards />         # US3: 2 metric cards
│       └── <PriceRangesChart />             # US3: Horizontal bar chart
```

### Data Flow

1. **URL State**: Period selector updates `searchParams.period` → triggers router.push + router.refresh
2. **Server Component**: Reads period from URL, passes to Client Component as `initialPeriod`
3. **Client Queries**: tRPC useQuery hooks fetch data based on period (reactive to URL changes)
4. **Cache Invalidation**: Mutations call `invalidate()` + `router.refresh()` (two-step SSR pattern)

### Backend Architecture

```
server/
├── api/routers/dashboard.ts                 # 6 tRPC procedures with RBAC
│   ├── getQuoteMetrics()
│   ├── getQuoteTrend()
│   ├── getTopModels()
│   ├── getTopGlassTypes()
│   ├── getSupplierDistribution()
│   ├── getMonetaryMetrics()
│   └── getPriceRanges()
│
└── services/dashboard-metrics.ts           # Pure business logic
    ├── calculateQuoteMetrics()
    ├── calculateConversionRate()
    ├── fillDateGaps()
    ├── calculateMonetaryMetrics()
    ├── groupQuotesByPriceRange()
    └── calculatePeriodComparison()
```

---

## Features

### Quote Performance (US1)

**Metrics Displayed**:
- Total de Cotizaciones (con tendencia)
- Tasa de Conversión (% de cotizaciones enviadas)
- Cotizaciones Promedio por Día

**Visualizations**:
- Line chart con tendencia diaria (zero-filled gaps para continuidad)
- Color coding: verde (mejora), rojo (decline)

**RBAC**:
- Admin: Ve todas las cotizaciones del tenant
- Seller: Ve solo sus propias cotizaciones

### Catalog Analytics (US2)

**Metrics Displayed**:
- Top 5 modelos más cotizados (nombre + manufacturer)
- Top 5 tipos de vidrio (código + manufacturer)
- Distribución por fabricante/proveedor

**Visualizations**:
- Horizontal bar charts con porcentajes
- Pie charts con leyendas interactivas
- Tooltips con detalles completos

### Monetary Metrics (US3)

**Metrics Displayed**:
- Valor Total de Cotizaciones (suma de Quote.total)
- Ticket Promedio (average por cotización)
- Distribución por Rangos de Precio:
  - $0 - $1M
  - $1M - $5M
  - $5M - $10M
  - $10M+

**Formateo**:
- Usa `formatCurrency` con tenant context (locale + currency)
- Usa `formatCurrencyCompact` para labels ($1,5 M)
- Maneja Prisma Decimal correctamente (.toNumber())

### Temporal Filters (US4)

**Períodos Disponibles**:
- Últimos 7 días
- Últimos 30 días
- Últimos 90 días
- Último año

**Period Comparison**:
- Calcula automáticamente período anterior (mismo rango de días)
- Muestra tendencia en todas las métricas
- Label: "vs período anterior"

**Implementation**:
- URL-based state (preserva estado en navegación)
- `calculatePeriodComparison()` retorna {current, previous, percentageChange, isPositive}
- Timezone-aware usando tenant config

---

## Technical Patterns

### shadcn/ui Chart Pattern

All charts follow this structure:

```tsx
<Card>
  <CardHeader>
    <CardTitle>Título</CardTitle>
    <CardDescription>Descripción</CardDescription>
  </CardHeader>
  <CardContent>
    <ChartContainer config={chartConfig} className="aspect-auto h-[250px]">
      <BarChart data={chartData} layout="horizontal">
        <CartesianGrid vertical={false} />
        <XAxis />
        <YAxis width={180} />
        <ChartTooltip content={<CustomTooltip />} />
        <Bar dataKey="count" fill="var(--chart-1)" radius={[0, 4, 4, 0]} />
      </BarChart>
    </ChartContainer>
  </CardContent>
  <CardFooter>
    <TrendingUp /> Stats summary
  </CardFooter>
</Card>
```

### Centralized Formatters

**CRITICAL**: All formatting goes through `@lib/format`:

```typescript
import { formatCurrency, formatPercent, formatNumber, formatDate } from '@/lib/format';

// ✅ CORRECT
formatCurrency(1500000, { context: tenantConfig }); // "$1.500.000"
formatPercent(0.125, { context: tenantConfig });     // "12,5%"
formatNumber(142);                                    // "142"

// ❌ WRONG
value.toLocaleString();
`${value.toFixed(2)}%`;
new Intl.NumberFormat().format(value);
```

### SSR Cache Invalidation Pattern

Dashboard uses `dynamic = 'force-dynamic'` for real-time data:

```typescript
// mutations in Client Components
const mutation = api.quote.create.useMutation({
  onSettled: () => {
    void utils.dashboard.getQuoteMetrics.invalidate();  // Step 1: Clear cache
    router.refresh();                                    // Step 2: Re-fetch server data
  },
});
```

**Why Both Steps**:
- `invalidate()` clears TanStack Query cache
- `router.refresh()` forces Server Component re-render with fresh data

### RBAC Implementation

**Middleware** (`src/middleware.ts`):
```typescript
if (pathname.startsWith('/admin') && session.user.role !== 'admin') {
  return NextResponse.redirect(new URL('/unauthorized', request.url));
}
```

**tRPC Procedures** (`src/server/api/routers/dashboard.ts`):
```typescript
getQuoteMetrics: protectedProcedure
  .input(z.object({ period: z.enum(['7d', '30d', '90d', 'year']) }))
  .query(async ({ ctx, input }) => {
    const filter = ctx.session.user.role === 'admin' 
      ? {} 
      : { userId: ctx.session.user.id };
    
    const quotes = await ctx.db.quote.findMany({ where: filter });
    // ...
  }),
```

**UI Guards** (UX only, NOT security):
```tsx
{session?.user.role === 'admin' && <AdminDashboard />}
```

---

## Empty States

All charts implement graceful empty states:

```tsx
if (data.length === 0) {
  return (
    <EmptyDashboardState
      title="Sin datos de tendencia"
      description="No hay cotizaciones para mostrar en este período."
    />
  );
}
```

---

## Performance Considerations

### Database Indexes

Required indexes for optimal query performance:

```prisma
model Quote {
  @@index([createdAt])           // For period filtering
  @@index([userId])              // For RBAC filtering
  @@index([createdAt, userId])   // Composite for admin queries
}
```

### Query Optimization

- Filters aplicados en database (WHERE clauses)
- Solo campos necesarios en SELECT
- Límites en TOP N queries (5 items max)
- Agregaciones en Prisma (count, sum, avg)

### Client-Side Performance

- React.memo NO necesario (charts re-render es aceptable)
- Debouncing NO necesario (URL state ya es throttled)
- TanStack Query maneja cache automáticamente

---

## Testing Strategy

### Unit Tests

```typescript
describe('calculateQuoteMetrics', () => {
  it('should calculate total, sent, draft counts correctly', () => {
    const quotes = [
      { status: 'sent', createdAt: new Date() },
      { status: 'draft', createdAt: new Date() },
    ];
    const result = calculateQuoteMetrics(quotes, { start, end });
    expect(result.total).toBe(2);
  });
});
```

### Integration Tests

```typescript
describe('dashboard.getQuoteMetrics', () => {
  it('should enforce RBAC for seller role', async () => {
    const caller = trpc.createCaller({ session: sellerSession });
    const result = await caller.dashboard.getQuoteMetrics({ period: '30d' });
    expect(result.total).toBe(5); // Only seller's quotes
  });
});
```

### E2E Tests

```typescript
test('admin can view all quotes metrics', async ({ page }) => {
  await page.goto('/admin/metrics');
  await expect(page.getByText('Total de Cotizaciones')).toBeVisible();
  await page.selectOption('[name="period"]', '30d');
  await expect(page.getByText(/142 cotizaciones/)).toBeVisible();
});
```

---

## Troubleshooting

### Charts Not Updating After Mutations

**Symptom**: UI doesn't refresh after creating/editing quotes  
**Cause**: Missing `router.refresh()` in mutation callback  
**Fix**: Add both steps in `onSettled`:
```typescript
onSettled: () => {
  void utils.dashboard.getQuoteMetrics.invalidate();
  router.refresh(); // <-- Missing this
}
```

### Manual Formatting in Charts

**Symptom**: Numbers show as "1500000" instead of "$1.500.000"  
**Cause**: Using `.toLocaleString()` or `.toFixed()` instead of centralized formatters  
**Fix**: Import and use `@lib/format` functions with tenant context

### Date-fns-tz Import Errors

**Symptom**: Build fails with "Module not found: date-fns-tz"  
**Cause**: Direct import of date-fns-tz (deprecated pattern)  
**Fix**: Use `@formkit/tempo` via `@lib/format` functions only

### Trend Indicators Incorrect

**Symptom**: Negative trend shows green arrow  
**Cause**: Inverted logic in `isPositive` calculation  
**Fix**: Use `calculatePeriodComparison()` which returns correct `isPositive` boolean

---

## Future Enhancements

### Planned Features (Phase 7)

- [ ] Export dashboard to PDF
- [ ] Scheduled email reports
- [ ] Custom date range selector
- [ ] Drill-down to quote detail from charts
- [ ] Comparison with previous year
- [ ] Forecast models using historical data

### Performance Improvements

- [ ] Add database materialized views for aggregations
- [ ] Implement Redis cache for heavy queries
- [ ] Use WebSockets for real-time updates
- [ ] Add service worker for offline support

---

## References

- **Spec**: `/specs/016-admin-dashboard-charts/quickstart.md`
- **Tasks**: `/specs/016-admin-dashboard-charts/tasks.md`
- **shadcn/ui Charts**: https://ui.shadcn.com/charts
- **Recharts Docs**: https://recharts.org/en-US
- **TanStack Query**: https://tanstack.com/query/latest
