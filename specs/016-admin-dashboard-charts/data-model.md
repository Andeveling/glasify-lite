# Phase 1: Data Model & Domain Design

**Feature**: Dashboard Informativo con Métricas y Charts  
**Date**: 2025-10-23  
**Status**: Complete

## Overview

This document defines the data structures and domain logic for the dashboard feature. No database schema changes are required - we aggregate existing data from Quote, QuoteItem, Model, GlassType, and related entities.

---

## Data Entities (Read-Only Aggregations)

### Existing Database Entities (No Changes)

The dashboard reads from existing entities without modification:

#### Quote
```prisma
model Quote {
  id         String      @id @default(cuid())
  userId     String?     // RBAC: Filter by userId for sellers
  status     QuoteStatus // draft | sent | canceled
  total      Decimal     @db.Decimal(12, 2)
  createdAt  DateTime    @default(now())
  sentAt     DateTime?   // Timestamp when sent
  // ... other fields
  items      QuoteItem[]
  user       User?       @relation(...)
}
```

**Indexes Used**:
- `@@index([userId, status])` - For role-based filtering
- `@@index([userId, createdAt(sort: Desc)])` - For temporal queries
- `@@index([status])` - For status-based aggregations

#### QuoteItem
```prisma
model QuoteItem {
  id          String    @id @default(cuid())
  quoteId     String
  modelId     String    // For top models analysis
  glassTypeId String    // For glass distribution analysis
  quantity    Int       @default(1)
  subtotal    Decimal   @db.Decimal(12, 2)
  // ... other fields
  quote       Quote     @relation(...)
  model       Model     @relation(...)
  glassType   GlassType @relation(...)
}
```

**Indexes Used**:
- `@@index([quoteId])` - Join with Quote
- `@@index([modelId])` - Top models aggregation
- `@@index([glassTypeId])` - Glass type distribution

#### Model
```prisma
model Model {
  id                String            @id @default(cuid())
  profileSupplierId String?
  name              String
  status            ModelStatus       // draft | published
  // ... other fields
  profileSupplier   ProfileSupplier?  @relation(...)
  quoteItems        QuoteItem[]
}
```

**Indexes Used**:
- `@@index([profileSupplierId, status])` - For supplier distribution
- `@@index([name])` - For display in charts

#### GlassType
```prisma
model GlassType {
  id           String      @id @default(cuid())
  name         String      @unique
  code         String      @unique
  manufacturer String?
  // ... other fields
  quoteItems   QuoteItem[]
}
```

**Indexes Used**:
- `@@index([name])` - For display in charts
- `@@index([code])` - For secondary display

#### ProfileSupplier
```prisma
model ProfileSupplier {
  id           String       @id @default(cuid())
  name         String       @unique
  materialType MaterialType
  isActive     Boolean      @default(true)
  // ... other fields
  models       Model[]
}
```

**Indexes Used**:
- `@@index([isActive])` - Filter active suppliers
- `@@index([materialType])` - Group by material

#### User
```prisma
model User {
  id     String   @id @default(cuid())
  role   UserRole // admin | seller | user
  // ... other fields
  quotes Quote[]
}
```

**Indexes Used**:
- `@@index([role])` - RBAC filtering

#### TenantConfig
```prisma
model TenantConfig {
  id                String   @id @default("1") // Singleton
  currency          String   @db.Char(3)       // COP, USD, etc.
  locale            String   @default("es-CO") // Date/number formatting
  timezone          String   @default("America/Bogota")
  quoteValidityDays Int      @default(15)
  // ... other fields
}
```

**Usage**: Read once at server startup, cache for formatting operations

---

## Domain Types (TypeScript)

### Enums

```typescript
// Period selection for temporal filtering
export enum DashboardPeriod {
  LAST_7_DAYS = '7d',
  LAST_30_DAYS = '30d',
  LAST_90_DAYS = '90d',
  CURRENT_YEAR = 'year',
}

// Chart type for rendering
export enum ChartType {
  LINE = 'line',
  BAR = 'bar',
  PIE = 'pie',
  AREA = 'area',
}
```

### Aggregated Data Structures

```typescript
// P1: Quote Metrics
export interface QuoteMetrics {
  totalQuotes: number;
  draftQuotes: number;
  sentQuotes: number;
  canceledQuotes: number;
  conversionRate: number; // (sent / total) * 100
  previousPeriodTotal: number;
  percentageChange: number; // ((current - previous) / previous) * 100
}

// P1: Trend Data Point
export interface TrendDataPoint {
  date: string; // ISO 8601 format
  count: number;
  label: string; // Formatted date for display (e.g., "15 Ene")
}

export interface QuotesTrendData {
  dataPoints: TrendDataPoint[];
  period: DashboardPeriod;
}

// P2: Top Model
export interface TopModel {
  modelId: string;
  modelName: string;
  supplierName: string | null;
  count: number;
  percentage: number; // (count / totalItems) * 100
}

export interface CatalogAnalytics {
  topModels: TopModel[]; // Max 5
  topGlassTypes: TopGlassType[]; // Max 5
  supplierDistribution: SupplierDistribution[];
}

// P2: Top Glass Type
export interface TopGlassType {
  glassTypeId: string;
  glassTypeName: string;
  glassTypeCode: string;
  manufacturer: string | null;
  count: number;
  percentage: number; // (count / totalItems) * 100
}

// P2: Supplier Distribution
export interface SupplierDistribution {
  supplierId: string | null; // null for models without supplier
  supplierName: string;
  count: number;
  percentage: number;
}

// P3: Monetary Metrics
export interface MonetaryMetrics {
  totalValue: number; // Sum of Quote.total
  averageValue: number; // totalValue / quoteCount
  currency: string; // From TenantConfig
  locale: string; // From TenantConfig for formatting
  previousPeriodTotal: number;
  percentageChange: number;
}

// P3: Price Range
export interface PriceRange {
  min: number;
  max: number;
  label: string; // e.g., "$1M - $5M"
  count: number;
  percentage: number;
}

export interface PriceRangeDistribution {
  ranges: PriceRange[];
  currency: string;
}

// P4: Period Comparison
export interface PeriodComparison {
  currentPeriod: DateRange;
  previousPeriod: DateRange;
  currentValue: number;
  previousValue: number;
  percentageChange: number;
  isPositive: boolean; // true if increase, false if decrease
}

// Utility Types
export interface DateRange {
  start: Date;
  end: Date;
  label: string; // Human-readable (e.g., "Últimos 30 días")
}

export interface ChartConfig {
  type: ChartType;
  title: string;
  description?: string;
  dataKey: string;
  xAxisKey?: string;
  yAxisKey?: string;
}
```

---

## Validation Rules (Zod Schemas)

### Input Validation

```typescript
import { z } from 'zod';

// Dashboard period filter input
export const dashboardPeriodSchema = z.enum(['7d', '30d', '90d', 'year']);

// Generic dashboard query input
export const dashboardQueryInput = z.object({
  period: dashboardPeriodSchema,
});

// Custom date range input (for future flexibility)
export const customDateRangeInput = z.object({
  startDate: z.date(),
  endDate: z.date(),
}).refine(
  (data) => data.startDate <= data.endDate,
  { message: "Start date must be before or equal to end date" }
);
```

### Output Validation

```typescript
// Quote metrics output
export const quoteMetricsSchema = z.object({
  totalQuotes: z.number().int().nonnegative(),
  draftQuotes: z.number().int().nonnegative(),
  sentQuotes: z.number().int().nonnegative(),
  canceledQuotes: z.number().int().nonnegative(),
  conversionRate: z.number().min(0).max(100),
  previousPeriodTotal: z.number().int().nonnegative(),
  percentageChange: z.number(),
});

// Catalog analytics output
export const catalogAnalyticsSchema = z.object({
  topModels: z.array(z.object({
    modelId: z.string(),
    modelName: z.string(),
    supplierName: z.string().nullable(),
    count: z.number().int().positive(),
    percentage: z.number().min(0).max(100),
  })).max(5),
  topGlassTypes: z.array(z.object({
    glassTypeId: z.string(),
    glassTypeName: z.string(),
    glassTypeCode: z.string(),
    manufacturer: z.string().nullable(),
    count: z.number().int().positive(),
    percentage: z.number().min(0).max(100),
  })).max(5),
  supplierDistribution: z.array(z.object({
    supplierId: z.string().nullable(),
    supplierName: z.string(),
    count: z.number().int().positive(),
    percentage: z.number().min(0).max(100),
  })),
});

// Monetary metrics output
export const monetaryMetricsSchema = z.object({
  totalValue: z.number().nonnegative(),
  averageValue: z.number().nonnegative(),
  currency: z.string().length(3),
  locale: z.string(),
  previousPeriodTotal: z.number().nonnegative(),
  percentageChange: z.number(),
});
```

---

## State Transitions

### Dashboard Loading States

```
Initial → Loading → Success
                 → Error → Retry → Loading
                 → Empty → (No data state)
```

**State Definitions**:
- **Initial**: Component mounted, no data fetch yet
- **Loading**: Data fetch in progress (show skeleton)
- **Success**: Data loaded successfully (render charts)
- **Error**: Fetch failed (show error message + retry button)
- **Empty**: No data available for selected period (show empty state)

### Period Filter State

```
Default (30d) → User selects → Validating → Loading → Success
                                          → Error → Revert to previous
```

**Validation Rules**:
- Period must be one of: 7d, 30d, 90d, year
- Custom date ranges: start <= end
- Max date range: 1 year (prevent performance issues)

---

## Business Logic Rules

### Metrics Calculation

#### Conversion Rate
```typescript
conversionRate = totalSent === 0 ? 0 : (totalSent / totalQuotes) * 100
```

**Edge Cases**:
- No quotes: Return 0 (not NaN)
- All draft: Return 0
- Round to 2 decimal places

#### Percentage Change
```typescript
percentageChange = previousValue === 0 
  ? (currentValue > 0 ? 100 : 0) 
  : ((currentValue - previousValue) / previousValue) * 100
```

**Edge Cases**:
- No previous data: Return 0 or "N/A" (UI decision)
- Negative change: Show with red indicator
- Zero to zero: Return 0

#### Top Items Selection
```typescript
// Always return top 5, even if fewer exist
topItems = allItems
  .sort((a, b) => b.count - a.count)
  .slice(0, 5)
  .map(item => ({
    ...item,
    percentage: (item.count / totalCount) * 100
  }))
```

**Edge Cases**:
- Fewer than 5 items: Return all available
- Tied counts: Sort alphabetically by name as tiebreaker
- Zero total: Return empty array

### RBAC Rules

#### Admin Access
```typescript
// Admins see ALL quotes
const adminFilter = {} // No filtering
```

#### Seller Access
```typescript
// Sellers see ONLY their quotes
const sellerFilter = {
  userId: currentUserId
}
```

**Enforcement Points**:
1. tRPC procedure level (primary)
2. Service function level (secondary validation)
3. UI level (hide admin-only features)

### Date Range Calculations

#### Period to Date Range
```typescript
function getPeriodDateRange(period: DashboardPeriod, timezone: string): DateRange {
  const now = utcToZonedTime(new Date(), timezone);
  const endDate = endOfDay(now, timezone);
  
  let startDate: Date;
  switch (period) {
    case '7d':
      startDate = subDays(endDate, 7);
      break;
    case '30d':
      startDate = subDays(endDate, 30);
      break;
    case '90d':
      startDate = subDays(endDate, 90);
      break;
    case 'year':
      startDate = startOfYear(now);
      break;
  }
  
  return {
    start: zonedTimeToUtc(startOfDay(startDate, timezone), timezone),
    end: zonedTimeToUtc(endDate, timezone),
    label: formatPeriodLabel(period), // Spanish label
  };
}
```

**Timezone Handling**:
- Always convert to UTC before database queries
- Always convert back to tenant timezone for display
- Use `TenantConfig.timezone` as source of truth

---

## Relationships & Joins

### Quote Metrics Query
```typescript
// Prisma aggregation
const metrics = await prisma.quote.groupBy({
  by: ['status'],
  where: {
    ...roleFilter, // Admin: {}, Seller: { userId }
    createdAt: {
      gte: dateRange.start,
      lte: dateRange.end,
    },
  },
  _count: {
    id: true,
  },
});
```

### Top Models Query
```typescript
// Prisma aggregation with join
const topModels = await prisma.quoteItem.groupBy({
  by: ['modelId'],
  where: {
    quote: {
      ...roleFilter,
      createdAt: {
        gte: dateRange.start,
        lte: dateRange.end,
      },
    },
  },
  _count: {
    id: true,
  },
  orderBy: {
    _count: {
      id: 'desc',
    },
  },
  take: 5,
});

// Then fetch model details
const modelDetails = await prisma.model.findMany({
  where: {
    id: {
      in: topModels.map(m => m.modelId),
    },
  },
  include: {
    profileSupplier: {
      select: {
        name: true,
      },
    },
  },
});
```

### Glass Distribution Query
```typescript
// Similar pattern to top models
const glassDistribution = await prisma.quoteItem.groupBy({
  by: ['glassTypeId'],
  where: {
    quote: {
      ...roleFilter,
      createdAt: {
        gte: dateRange.start,
        lte: dateRange.end,
      },
    },
  },
  _count: {
    id: true,
  },
});

// Fetch glass type details
const glassTypes = await prisma.glassType.findMany({
  where: {
    id: {
      in: glassDistribution.map(g => g.glassTypeId),
    },
  },
  select: {
    id: true,
    name: true,
    code: true,
    manufacturer: true,
  },
});
```

---

## Performance Considerations

### Query Optimization

1. **Use Prisma Aggregations** instead of fetching all data
   ```typescript
   // ❌ Bad: Fetch all, aggregate in JS
   const quotes = await prisma.quote.findMany({ where: ... });
   const total = quotes.length;
   
   // ✅ Good: Aggregate in database
   const total = await prisma.quote.count({ where: ... });
   ```

2. **Limit Result Sets**
   ```typescript
   // Always use take/limit for top-N queries
   topModels.take(5)
   ```

3. **Select Only Needed Fields**
   ```typescript
   // Don't fetch entire objects if only need specific fields
   select: {
     id: true,
     name: true,
     // Don't include heavy fields like descriptions
   }
   ```

4. **Use Composite Indexes**
   ```typescript
   // Queries benefit from compound indexes
   where: {
     userId: '...',
     createdAt: { gte: ... },
   }
   // Uses index: @@index([userId, createdAt])
   ```

### Caching Strategy (Future)

For MVP: No caching (real-time data)

For scale (>10,000 quotes):
- Cache metrics for 30-60 seconds
- Invalidate on quote creation/update/deletion
- Use `router.refresh()` pattern from constitution

---

## Error Handling

### Database Errors
```typescript
try {
  const metrics = await getQuoteMetrics(...);
  return metrics;
} catch (error) {
  logger.error("Failed to fetch quote metrics", {
    userId,
    period,
    error: error.message,
  });
  throw new TRPCError({
    code: 'INTERNAL_SERVER_ERROR',
    message: 'No se pudieron cargar las métricas. Por favor, intenta de nuevo.',
  });
}
```

### Empty Data Handling
```typescript
// Always return valid structure, never null
if (quotes.length === 0) {
  return {
    totalQuotes: 0,
    draftQuotes: 0,
    sentQuotes: 0,
    canceledQuotes: 0,
    conversionRate: 0,
    previousPeriodTotal: 0,
    percentageChange: 0,
  };
}
```

### Validation Errors
```typescript
// Zod validation errors are handled by tRPC automatically
// Custom validation messages in Spanish
const schema = z.object({
  period: z.enum(['7d', '30d', '90d', 'year'], {
    errorMap: () => ({ message: "Período inválido" }),
  }),
});
```

---

## Testing Considerations

### Unit Test Scenarios

1. **Metrics Calculation**
   - Zero quotes
   - All same status
   - Mixed statuses
   - Edge cases (negative, infinity)

2. **Date Range Calculation**
   - All period types
   - Timezone boundaries (midnight)
   - Year transitions
   - Leap years

3. **Percentage Calculation**
   - Zero denominator
   - Zero to positive change
   - Positive to zero change
   - Negative values

### Integration Test Scenarios

1. **RBAC Enforcement**
   - Admin sees all quotes
   - Seller sees only own quotes
   - User cannot access (403)

2. **Period Filtering**
   - Each period returns correct date range
   - Data filtered correctly
   - Previous period calculated correctly

3. **Database Queries**
   - Aggregations return correct counts
   - Joins return correct related data
   - Performance acceptable (<1s)

---

## Summary

- **No database schema changes required** ✅
- **7 existing entities used** (Quote, QuoteItem, Model, GlassType, ProfileSupplier, User, TenantConfig)
- **11 domain types defined** (TypeScript interfaces for aggregated data)
- **Business logic documented** (calculations, RBAC, date handling)
- **Performance optimizations planned** (indexes, aggregations, select limitations)
- **Error handling strategy defined** (graceful fallbacks, Spanish messages)

Ready to proceed to **Contracts** phase.
