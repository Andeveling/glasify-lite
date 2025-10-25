# tRPC Dashboard Router Contracts

**Feature**: Dashboard Informativo con Métricas y Charts  
**Date**: 2025-10-23  
**API Style**: tRPC (Type-safe RPC)

## Overview

This document defines the tRPC procedure contracts for the dashboard feature. All procedures are type-safe using Zod validation and TypeScript inference.

**Router Name**: `dashboard`  
**Base Path**: `api.dashboard.*`  
**Authorization**: All procedures require authentication (admin or seller role)

---

## Procedures

### 1. getQuotesMetrics

**Description**: Get aggregated quote metrics for the selected period

**Access**: Admin (all quotes) | Seller (own quotes only)

**Input Schema**:
```typescript
{
  period: '7d' | '30d' | '90d' | 'year'
}
```

**Output Schema**:
```typescript
{
  totalQuotes: number;          // Total quotes in period
  draftQuotes: number;          // Quotes with status 'draft'
  sentQuotes: number;           // Quotes with status 'sent'
  canceledQuotes: number;       // Quotes with status 'canceled'
  conversionRate: number;       // (sent / total) * 100
  previousPeriodTotal: number;  // Total from previous equivalent period
  percentageChange: number;     // ((current - previous) / previous) * 100
}
```

**Example Usage**:
```typescript
const metrics = await trpc.dashboard.getQuotesMetrics.query({
  period: '30d'
});

console.log(metrics);
// {
//   totalQuotes: 45,
//   draftQuotes: 12,
//   sentQuotes: 28,
//   canceledQuotes: 5,
//   conversionRate: 62.22,
//   previousPeriodTotal: 38,
//   percentageChange: 18.42
// }
```

**Errors**:
- `UNAUTHORIZED`: User not authenticated
- `FORBIDDEN`: User role is 'user' (not admin/seller)
- `INTERNAL_SERVER_ERROR`: Database query failed

---

### 2. getQuotesTrend

**Description**: Get daily quote creation trend for the selected period

**Access**: Admin (all quotes) | Seller (own quotes only)

**Input Schema**:
```typescript
{
  period: '7d' | '30d' | '90d' | 'year'
}
```

**Output Schema**:
```typescript
{
  dataPoints: Array<{
    date: string;    // ISO 8601 format (YYYY-MM-DD)
    count: number;   // Quotes created on this date
    label: string;   // Formatted date for display (e.g., "15 Ene")
  }>;
  period: string;    // Echo back the requested period
}
```

**Example Usage**:
```typescript
const trend = await trpc.dashboard.getQuotesTrend.query({
  period: '7d'
});

console.log(trend);
// {
//   dataPoints: [
//     { date: '2025-10-17', count: 3, label: '17 Oct' },
//     { date: '2025-10-18', count: 5, label: '18 Oct' },
//     { date: '2025-10-19', count: 2, label: '19 Oct' },
//     // ... 4 more days
//   ],
//   period: '7d'
// }
```

**Errors**:
- `UNAUTHORIZED`: User not authenticated
- `FORBIDDEN`: User role is 'user'
- `INTERNAL_SERVER_ERROR`: Database query failed

**Notes**:
- Returns one data point per day in the period
- Days with zero quotes still included (count: 0)
- Dates are in tenant timezone, then converted to UTC for query

---

### 3. getCatalogAnalytics

**Description**: Get top models, glass types, and supplier distribution

**Access**: Admin (all data) | Seller (own quotes data only)

**Input Schema**:
```typescript
{
  period: '7d' | '30d' | '90d' | 'year'
}
```

**Output Schema**:
```typescript
{
  topModels: Array<{
    modelId: string;
    modelName: string;
    supplierName: string | null;  // null if no ProfileSupplier
    count: number;                 // Times this model appears in quote items
    percentage: number;            // (count / totalItems) * 100
  }>;  // Max 5 items
  
  topGlassTypes: Array<{
    glassTypeId: string;
    glassTypeName: string;
    glassTypeCode: string;
    manufacturer: string | null;
    count: number;
    percentage: number;
  }>;  // Max 5 items
  
  supplierDistribution: Array<{
    supplierId: string | null;
    supplierName: string;          // "Sin fabricante" if null
    count: number;
    percentage: number;
  }>;
}
```

**Example Usage**:
```typescript
const analytics = await trpc.dashboard.getCatalogAnalytics.query({
  period: '30d'
});

console.log(analytics.topModels);
// [
//   {
//     modelId: 'cm1abc...',
//     modelName: 'Ventana Corrediza 2H',
//     supplierName: 'Rehau',
//     count: 24,
//     percentage: 18.5
//   },
//   // ... up to 4 more
// ]
```

**Errors**:
- `UNAUTHORIZED`: User not authenticated
- `FORBIDDEN`: User role is 'user'
- `INTERNAL_SERVER_ERROR`: Database query failed

**Notes**:
- Empty arrays if no data (not null)
- Percentages sum to ≤100 (top 5 may not cover all data)
- Sorted by count descending

---

### 4. getMonetaryMetrics

**Description**: Get total value, average value, and comparison with previous period

**Access**: Admin (all quotes) | Seller (own quotes only)

**Input Schema**:
```typescript
{
  period: '7d' | '30d' | '90d' | 'year'
}
```

**Output Schema**:
```typescript
{
  totalValue: number;           // Sum of Quote.total
  averageValue: number;         // totalValue / quoteCount (0 if no quotes)
  currency: string;             // From TenantConfig (e.g., "COP")
  locale: string;               // From TenantConfig (e.g., "es-CO")
  previousPeriodTotal: number;  // Total from previous equivalent period
  percentageChange: number;     // ((current - previous) / previous) * 100
}
```

**Example Usage**:
```typescript
const monetary = await trpc.dashboard.getMonetaryMetrics.query({
  period: '30d'
});

console.log(monetary);
// {
//   totalValue: 45_750_000,
//   averageValue: 1_016_666.67,
//   currency: 'COP',
//   locale: 'es-CO',
//   previousPeriodTotal: 38_200_000,
//   percentageChange: 19.76
// }
```

**Errors**:
- `UNAUTHORIZED`: User not authenticated
- `FORBIDDEN`: User role is 'user'
- `INTERNAL_SERVER_ERROR`: Database query failed
- `NOT_FOUND`: TenantConfig not found (should never happen)

**Notes**:
- Values are in database Decimal format (converted to number)
- Currency and locale used for client-side formatting
- Zero quotes returns totalValue: 0, averageValue: 0

---

### 5. getPriceRanges

**Description**: Get distribution of quotes across price ranges

**Access**: Admin (all quotes) | Seller (own quotes only)

**Input Schema**:
```typescript
{
  period: '7d' | '30d' | '90d' | 'year'
}
```

**Output Schema**:
```typescript
{
  ranges: Array<{
    min: number;          // Range minimum (inclusive)
    max: number;          // Range maximum (exclusive), Infinity for last range
    label: string;        // Formatted label (e.g., "$1M - $5M")
    count: number;        // Quotes in this range
    percentage: number;   // (count / total quotes) * 100
  }>;
  currency: string;       // From TenantConfig
}
```

**Example Usage**:
```typescript
const priceRanges = await trpc.dashboard.getPriceRanges.query({
  period: '30d'
});

console.log(priceRanges);
// {
//   ranges: [
//     { min: 0, max: 1000000, label: 'Hasta $1M', count: 12, percentage: 26.67 },
//     { min: 1000000, max: 5000000, label: '$1M - $5M', count: 25, percentage: 55.56 },
//     { min: 5000000, max: 10000000, label: '$5M - $10M', count: 6, percentage: 13.33 },
//     { min: 10000000, max: Infinity, label: 'Más de $10M', count: 2, percentage: 4.44 }
//   ],
//   currency: 'COP'
// }
```

**Errors**:
- `UNAUTHORIZED`: User not authenticated
- `FORBIDDEN`: User role is 'user'
- `INTERNAL_SERVER_ERROR`: Database query failed

**Notes**:
- Ranges are fixed (see data-model.md for definitions)
- All ranges included even if count is 0
- Percentages sum to 100

---

## Common Error Responses

All procedures use standard tRPC error codes:

### UNAUTHORIZED (401)
```json
{
  "code": "UNAUTHORIZED",
  "message": "Debes iniciar sesión para acceder al dashboard"
}
```

### FORBIDDEN (403)
```json
{
  "code": "FORBIDDEN",
  "message": "No tienes permisos para acceder al dashboard"
}
```

### BAD_REQUEST (400)
```json
{
  "code": "BAD_REQUEST",
  "message": "Período inválido. Usa: 7d, 30d, 90d, o year"
}
```

### INTERNAL_SERVER_ERROR (500)
```json
{
  "code": "INTERNAL_SERVER_ERROR",
  "message": "No se pudieron cargar las métricas. Por favor, intenta de nuevo."
}
```

---

## Authorization Flow

```
Client Request
     ↓
Middleware (NextAuth)
     ↓
Check session.user exists?
     ↓ No → UNAUTHORIZED
     ↓ Yes
Check session.user.role in ['admin', 'seller']?
     ↓ No → FORBIDDEN
     ↓ Yes (admin)
Apply filter: {} (no filtering)
     ↓
Execute query
     ↓ 
     ↓ Yes (seller)
Apply filter: { userId: session.user.id }
     ↓
Execute query
     ↓
Return data
```

---

## Type Safety Examples

### Client-Side Usage with Full Type Inference

```typescript
import { api } from '~/trpc/react';

function DashboardPage() {
  // ✅ TypeScript knows the exact return type
  const { data: metrics, isLoading } = api.dashboard.getQuotesMetrics.useQuery({
    period: '30d', // ✅ Autocomplete for valid periods
  });
  
  // ✅ TypeScript knows metrics structure
  if (metrics) {
    console.log(metrics.totalQuotes);     // ✅ number
    console.log(metrics.conversionRate);  // ✅ number
    // console.log(metrics.invalidField); // ❌ TypeScript error
  }
  
  return <div>...</div>;
}
```

### Server-Side Usage in tRPC Procedure

```typescript
export const dashboardRouter = createTRPCRouter({
  getQuotesMetrics: protectedProcedure
    .input(z.object({
      period: z.enum(['7d', '30d', '90d', 'year']),
    }))
    .query(async ({ ctx, input }) => {
      // ✅ input.period is typed as '7d' | '30d' | '90d' | 'year'
      const dateRange = getPeriodDateRange(input.period);
      
      // Query database...
      
      // ✅ Return type must match QuoteMetrics interface
      return {
        totalQuotes: 45,
        draftQuotes: 12,
        sentQuotes: 28,
        canceledQuotes: 5,
        conversionRate: 62.22,
        previousPeriodTotal: 38,
        percentageChange: 18.42,
      };
    }),
});
```

---

## Contract Testing Strategy

### Unit Tests (Zod Schemas)
```typescript
describe('Dashboard Input Schemas', () => {
  it('should validate period enum', () => {
    expect(dashboardPeriodSchema.parse('30d')).toBe('30d');
    expect(() => dashboardPeriodSchema.parse('invalid')).toThrow();
  });
});
```

### Integration Tests (tRPC Procedures)
```typescript
describe('dashboard.getQuotesMetrics', () => {
  it('should return metrics for admin user', async () => {
    const caller = createCallerWithAdminSession();
    const result = await caller.dashboard.getQuotesMetrics({ period: '30d' });
    
    expect(result).toMatchObject({
      totalQuotes: expect.any(Number),
      draftQuotes: expect.any(Number),
      sentQuotes: expect.any(Number),
      canceledQuotes: expect.any(Number),
      conversionRate: expect.any(Number),
      previousPeriodTotal: expect.any(Number),
      percentageChange: expect.any(Number),
    });
  });
  
  it('should return only own quotes for seller', async () => {
    const caller = createCallerWithSellerSession({ userId: 'seller-123' });
    const result = await caller.dashboard.getQuotesMetrics({ period: '30d' });
    
    // Assert metrics only count seller's quotes
    // (requires test data setup with known seller quotes)
  });
  
  it('should throw FORBIDDEN for regular user', async () => {
    const caller = createCallerWithUserSession();
    
    await expect(
      caller.dashboard.getQuotesMetrics({ period: '30d' })
    ).rejects.toThrow('No tienes permisos');
  });
});
```

---

## Versioning

**Current Version**: 1.0.0

**Change Log**:
- 2025-10-23: Initial contract definition (v1.0.0)

**Breaking Changes Policy**:
- Input schema changes: MAJOR version bump
- Output schema changes (removing fields): MAJOR version bump
- Output schema changes (adding optional fields): MINOR version bump
- Error message changes: PATCH version bump

---

## Summary

- **5 tRPC procedures defined** (getQuotesMetrics, getQuotesTrend, getCatalogAnalytics, getMonetaryMetrics, getPriceRanges)
- **All procedures type-safe** (Zod validation + TypeScript inference)
- **RBAC enforced at procedure level** (admin vs seller filtering)
- **Consistent error handling** (Spanish messages, standard tRPC codes)
- **Contract testing strategy** (unit + integration tests)
- **Versioning policy** (semantic versioning)

Ready to proceed to **Quickstart Guide**.
