# Dashboard Route Standard

This document establishes the standard pattern for all dashboard routes in Glasify Lite. Follow these guidelines to ensure consistency, performance, and maintainability across admin pages.

## Architecture Overview

Dashboard routes use **Server-Side Rendering (SSR)** with Next.js 15 App Router, Suspense boundaries for streaming, and URL-based state management.

**Key Principles**:
- SSR for fresh data on every request (no ISR for private routes)
- Filters outside Suspense to remain visible during loading
- Single source of truth for filter definitions
- Centralized formatters from `@lib/format`
- Optimistic UI for mutations
- SOLID principles and Atomic Design patterns

---

## Standard File Structure

```
src/app/(dashboard)/admin/[feature]/
├── _components/
│   ├── [feature]-table.tsx       # Pure presentation component
│   └── [feature]-filters.tsx     # Filter controls (outside Suspense)
├── [id]/
│   └── page.tsx                  # Detail/edit page
├── new/
│   └── page.tsx                  # Create page
└── page.tsx                      # List page (Server Component)
```

---

## 1. Page Component Pattern (Server Component)

### Required Exports

```typescript
// SSR Configuration: Force dynamic rendering
export const dynamic = 'force-dynamic';

// Metadata for SEO (if applicable)
export const metadata: Metadata = {
  title: 'Feature Name | Admin',
  description: 'Manage feature description',
};
```

### Page Structure

```typescript
type SearchParams = Promise<{
  page?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  // ... feature-specific filters
}>;

type PageProps = {
  searchParams: SearchParams;
};

export default async function FeaturePage({ searchParams }: PageProps) {
  const params = await searchParams;

  // Parse search params
  const page = Number(params.page) || 1;
  const search = params.search || undefined;
  const sortBy = params.sortBy || 'createdAt';
  const sortOrder = (params.sortOrder || 'desc') as 'asc' | 'desc';

  // Lightweight queries OUTSIDE Suspense (for filters)
  const auxiliaryData = await api.auxiliary.list({ /* ... */ });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-bold text-3xl tracking-tight">Feature Name</h1>
        <p className="text-muted-foreground">Feature description</p>
      </div>

      {/* Filters outside Suspense - always visible */}
      <FeatureFilters
        searchParams={params}
        auxiliaryData={auxiliaryData.items}
      />

      {/* Table content inside Suspense - streaming */}
      <Suspense
        fallback={<FeatureTableSkeleton />}
        key={`${search}-${page}-${sortBy}-${sortOrder}`}
      >
        <FeatureTableContent
          page={page}
          search={search}
          sortBy={sortBy}
          sortOrder={sortOrder}
        />
      </Suspense>
    </div>
  );
}
```

### Key Points

- **SSR Config**: Always use `export const dynamic = 'force-dynamic'`
- **No ISR**: Private dashboard routes don't need caching
- **Suspense Key**: Include all query parameters for proper re-suspension
- **Filter Placement**: Filters OUTSIDE Suspense to prevent disappearing during loading
- **Heavy Queries**: Data fetching INSIDE Suspense for streaming

---

## 2. Table Component Pattern (Client Component)

### Responsibilities

- Pure presentation component
- Display data in table format
- Handle user interactions (edit, delete)
- Optimistic UI updates for mutations
- NO filter logic (delegated to FiltersComponent)

### Example Structure

```typescript
'use client';

import { useTenantConfig } from '@/app/_hooks/use-tenant-config';
import { formatCurrency, formatThickness } from '@/lib/format';
import { api } from '@/trpc/react';

type FeatureTableProps = {
  initialData: {
    items: FeatureType[];
    total: number;
    page: number;
    totalPages: number;
    limit: number;
  };
  searchParams: {
    search?: string;
    // ... other params for optimistic updates
  };
};

export function FeatureTable({ initialData, searchParams }: FeatureTableProps) {
  const { formatContext } = useTenantConfig();
  const utils = api.useUtils();

  // Mutation with optimistic updates
  const deleteMutation = api.feature.delete.useMutation({
    onMutate: async (variables) => {
      // Cancel outgoing refetches
      await utils.feature.list.cancel();

      // Snapshot previous data
      const previousData = utils.feature.list.getData();

      // Optimistically update cache
      if (previousData) {
        utils.feature.list.setData(
          { /* query params */ },
          (old) => ({
            ...old,
            items: old.items.filter((item) => item.id !== variables.id),
            total: old.total - 1,
          })
        );
      }

      toast.loading('Eliminando...', { id: 'delete-feature' });
      return { previousData };
    },
    onError: (error, _variables, context) => {
      // Rollback on error
      if (context?.previousData) {
        utils.feature.list.setData({ /* query params */ }, context.previousData);
      }
      toast.error('Error al eliminar', { id: 'delete-feature' });
    },
    onSuccess: () => {
      toast.success('Eliminado correctamente', { id: 'delete-feature' });
    },
    onSettled: () => {
      void utils.feature.list.invalidate();
    },
  });

  // Column definitions with centralized formatters
  const columns = [
    {
      id: 'name',
      header: 'Nombre',
      cell: (item) => item.name,
      sortable: true,
    },
    {
      id: 'price',
      header: 'Precio',
      cell: (item) => formatCurrency(item.price, { context: formatContext }),
      sortable: true,
    },
    // ... more columns
  ];

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Features ({initialData.total})</CardTitle>
          <CardDescription>Manage features</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <TableSearch placeholder="Buscar..." />
          <ServerTable columns={columns} data={initialData.items} />
          <TablePagination {...paginationProps} />
        </CardContent>
      </Card>

      {/* Delete confirmation dialog */}
      <DeleteConfirmationDialog {...dialogProps} />
    </>
  );
}
```

### Key Points

- **Formatters**: Use centralized formatters from `@lib/format`
- **Optimistic UI**: Implement for delete/update operations
- **No Filters**: Filter logic in separate component
- **Single Responsibility**: Display and interaction only

---

## 3. Filters Component Pattern (Client Component)

### Responsibilities

- Manage all filter controls
- Handle search input with debounce
- Provide create button
- Stay outside Suspense for visibility during loading

### Example Structure

```typescript
'use client';

import { Plus } from 'lucide-react';
import Link from 'next/link';
import { TableFilters, type FilterDefinition } from '@/app/_components/server-table/table-filters';
import { TableSearch } from '@/app/_components/server-table/table-search';
import { Button } from '@/components/ui/button';

type FiltersProps = {
  searchParams: {
    search?: string;
    // ... filter params
  };
  auxiliaryData: Array<{ id: string; name: string }>;
};

export function FeatureFilters({ searchParams, auxiliaryData }: FiltersProps) {
  const filters: FilterDefinition[] = [
    {
      id: 'status',
      label: 'Estado',
      type: 'select',
      defaultValue: 'all',
      options: [
        { label: 'Todos', value: 'all' },
        { label: 'Activos', value: 'active' },
        { label: 'Inactivos', value: 'inactive' },
      ],
    },
    // ... more filters
  ];

  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      {/* Search */}
      <div className="max-w-sm flex-1">
        <TableSearch
          defaultValue={searchParams.search}
          placeholder="Buscar por nombre..."
        />
      </div>

      {/* Filters */}
      <TableFilters filters={filters} />

      {/* Create button */}
      <Button asChild>
        <Link href="/admin/feature/new">
          <Plus className="mr-2 size-4" />
          Nuevo Feature
        </Link>
      </Button>
    </div>
  );
}
```

### Key Points

- **Single Source**: All filter definitions in one place
- **Outside Suspense**: Component rendered outside Suspense boundary
- **Debounced Search**: Uses `TableSearch` with 300ms debounce
- **Responsive Layout**: Wrap on small screens with `flex-wrap`

---

## 4. Centralized Formatters

### Usage Pattern

Always import from `@lib/format` and pass tenant context:

```typescript
import { formatCurrency, formatThickness, formatDate } from '@/lib/format';
import { useTenantConfig } from '@/app/_hooks/use-tenant-config';

export function MyComponent() {
  const { formatContext } = useTenantConfig();

  return (
    <div>
      {formatCurrency(285000, { context: formatContext })}
      {formatThickness(6, formatContext)}
      {formatDate(new Date(), { date: 'medium' }, formatContext)}
    </div>
  );
}
```

### Available Formatters

- `formatCurrency(amount, options?)` - Currency formatting
- `formatThickness(mm, context?)` - Thickness in millimeters
- `formatDimensions(width, height, context?)` - Dimensions (mm × mm)
- `formatArea(sqm, context?)` - Area in square meters
- `formatDate(date, style, context?)` - Date formatting
- `formatNumber(value, options?)` - Number formatting
- `formatPercent(value, options?)` - Percentage formatting

---

## 5. Optimistic UI Pattern

### Required Steps

1. **onMutate**: Cancel queries, snapshot data, update cache optimistically
2. **onError**: Rollback to snapshot on error
3. **onSuccess**: Show success message
4. **onSettled**: Invalidate queries to refetch

### Example

```typescript
const deleteMutation = api.feature.delete.useMutation({
  onMutate: async (variables) => {
    await utils.feature.list.cancel();
    const previousData = utils.feature.list.getData();

    if (previousData) {
      utils.feature.list.setData(
        { page: 1, limit: 10 }, // Match query params
        (old) => ({
          ...old,
          items: old.items.filter((item) => item.id !== variables.id),
          total: old.total - 1,
        })
      );
    }

    toast.loading('Eliminando...', { id: 'delete-feature' });
    return { previousData };
  },
  onError: (error, _variables, context) => {
    if (context?.previousData) {
      utils.feature.list.setData({ page: 1, limit: 10 }, context.previousData);
    }
    toast.error('Error', { id: 'delete-feature' });
  },
  onSuccess: () => {
    toast.success('Eliminado', { id: 'delete-feature' });
  },
  onSettled: () => {
    void utils.feature.list.invalidate();
  },
});
```

---

## 6. Checklist for New Dashboard Routes

### Setup Phase
- [ ] Create route folder: `src/app/(dashboard)/admin/[feature]/`
- [ ] Add `page.tsx` with SSR config (`dynamic = 'force-dynamic'`)
- [ ] Add metadata export for SEO (if applicable)
- [ ] Create `_components/` folder

### Components Phase
- [ ] Create `[feature]-table.tsx` (Client Component)
- [ ] Create `[feature]-filters.tsx` (Client Component)
- [ ] Remove filter logic from table component
- [ ] Use centralized formatters from `@lib/format`

### Data Fetching Phase
- [ ] Lightweight queries OUTSIDE Suspense (for filters)
- [ ] Heavy queries INSIDE Suspense (for table data)
- [ ] Proper Suspense key with all query params
- [ ] Transform Prisma Decimal fields to numbers

### Optimistic UI Phase
- [ ] Implement `onMutate` for cache update
- [ ] Implement `onError` for rollback
- [ ] Implement `onSuccess` for feedback
- [ ] Implement `onSettled` for invalidation
- [ ] Match query params in cache updates

### Testing Phase
- [ ] E2E test for page navigation
- [ ] E2E test for filters and search
- [ ] E2E test for optimistic delete
- [ ] Verify no persistent loading bar

### Documentation Phase
- [ ] Update feature documentation
- [ ] Add JSDoc comments to components
- [ ] Document any feature-specific patterns

---

## 7. Common Pitfalls

### ❌ DON'T

- Use ISR (`revalidate`) for private dashboard routes
- Put filters inside Suspense boundaries
- Duplicate filter definitions in table and filters components
- Use ad-hoc formatting functions
- Skip optimistic UI for mutations
- Forget to rollback on error
- Hard-code locale/currency values

### ✅ DO

- Use SSR (`dynamic = 'force-dynamic'`) for dashboard routes
- Keep filters outside Suspense for visibility
- Single source of truth for filter definitions
- Use centralized formatters with tenant context
- Implement optimistic UI for better UX
- Always handle error rollback
- Use tenant config for internationalization

---

## 8. Performance Considerations

### Database Level
- Add indexes for sortable/filterable columns
- Use `select` to retrieve only needed fields
- Parallel queries with `Promise.all` when applicable

### Network Level
- Debounce search inputs (300ms)
- URL-based state (no redundant fetches)
- Server Components for zero JS

### UX Level
- Optimistic UI updates
- Loading states during mutations
- Proper error boundaries

---

## 9. Related Documentation

- [Server-Optimized Data Tables](./architecture-server-tables.md)
- [Glasify Architecture](./architecture.md)
- [GitHub Copilot Instructions](../.github/copilot-instructions.md)
- [Next.js 15 App Router](https://nextjs.org/docs/app)
- [TanStack Query Optimistic Updates](https://tanstack.com/query/latest/docs/framework/react/guides/optimistic-updates)

---

## 10. Example Implementation

See reference implementation:
- **Page**: `src/app/(dashboard)/admin/glass-types/page.tsx`
- **Table**: `src/app/(dashboard)/admin/glass-types/_components/glass-types-table.tsx`
- **Filters**: `src/app/(dashboard)/admin/glass-types/_components/glass-types-filters.tsx`

---

**Last Updated**: 2025-01-19  
**Version**: 1.0  
**Status**: Active Standard
