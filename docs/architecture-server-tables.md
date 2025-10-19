# Server-Optimized Data Tables Architecture

**Version**: 1.0  
**Last Updated**: 2025-10-18  
**Status**: Implemented

## Overview

This document describes the server-optimized data table pattern implemented in Glasify Lite using Next.js 15, tRPC, and Prisma. This architecture replaces client-heavy TanStack Table with reusable server-first components for improved performance and SEO.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│ Browser (Client)                                             │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  URL: /admin/models?status=published&sortBy=name&page=2     │
│                           │                                  │
│                           ▼                                  │
│  ┌─────────────────────────────────────────────┐            │
│  │ Next.js 15 Server Component (Page)          │            │
│  │ • Reads searchParams (async)                │            │
│  │ • Calls tRPC procedure server-side          │            │
│  │ • Passes data to Client Component           │            │
│  └─────────────────────────────────────────────┘            │
│                           │                                  │
│                           ▼                                  │
│  ┌─────────────────────────────────────────────┐            │
│  │ ModelsTable (Client Component)              │            │
│  │ ├── TableFilters (Molecular)                │            │
│  │ ├── TableSearch (Molecular - Debounced)     │            │
│  │ ├── ServerTable (Organism)                  │            │
│  │ │   └── TableHeader (Sortable)              │            │
│  │ └── TablePagination (Molecular)             │            │
│  └─────────────────────────────────────────────┘            │
│                           │                                  │
│                           ▼                                  │
│  User interactions update URL → Page refetches              │
│                                                              │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│ Server (Next.js + tRPC)                                      │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─────────────────────────────────────────────┐            │
│  │ tRPC Procedure (admin.model.list)           │            │
│  │ • Validates input with Zod schema           │            │
│  │ • Builds Prisma WHERE clause                │            │
│  │ • Builds Prisma ORDER BY clause             │            │
│  │ • Executes optimized query                  │            │
│  └─────────────────────────────────────────────┘            │
│                           │                                  │
│                           ▼                                  │
│  ┌─────────────────────────────────────────────┐            │
│  │ Prisma ORM                                  │            │
│  │ • Uses database indexes                     │            │
│  │ • Returns only selected fields              │            │
│  │ • Offset-based pagination                   │            │
│  └─────────────────────────────────────────────┘            │
│                           │                                  │
│                           ▼                                  │
│                    PostgreSQL Database                       │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Core Principles

### 1. Server Components First

**Rule**: All pages with data tables MUST be Server Components with `async searchParams`.

```tsx
// ✅ GOOD
export default async function ModelsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const data = await api.admin.model.list({
    page: Number(params.page) || 1,
    status: params.status,
    search: params.search,
  });
  
  return <ModelsTable initialData={data} searchParams={params} />;
}

// ❌ BAD - Don't fetch client-side
'use client';
export default function ModelsPage() {
  const { data } = api.admin.model.list.useQuery({ page: 1 });
  return <ModelsTable data={data} />;
}
```

### 2. URL as Single Source of Truth

**Rule**: All table state (filters, sorting, search, pagination) MUST be in URL search params.

**Benefits**:
- Deep linking (shareable URLs)
- Browser back/forward works correctly
- SEO-friendly (indexed states)
- No client state management complexity

```typescript
// URL structure
/admin/models?status=published&sortBy=name&sortOrder=desc&search=ventana&page=2

// Automatically triggers server-side refetch when any param changes
```

### 3. Debounced Search (300ms)

**Rule**: Search inputs MUST use `useDebouncedCallback` to reduce server load.

```tsx
// Implementation in TableSearch component
const debouncedUpdate = useDebouncedCallback((value: string) => {
  updateParams({
    search: value || undefined,
    page: '1', // Reset to first page
  });
}, 300); // REQ-002, PERF-003
```

### 4. Database Indexing

**Rule**: All filterable/sortable columns MUST have database indexes.

```prisma
// prisma/schema.prisma
model Model {
  // ... fields
  
  @@index([name]) // Search by name
  @@index([status]) // Filter by status
  @@index([profileSupplierId, status]) // Composite filter
  @@index([createdAt(sort: Desc)]) // Sort by date
}
```

## Component Hierarchy

### Atoms (UI Components)

Located in `src/components/ui/` - Basic UI with no business logic.

- `Button`
- `Input`
- `Select`
- `Table` (shadcn/ui)
- `Badge`

### Molecules (Reusable Table Components)

Located in `src/app/_components/server-table/` - Composable table parts.

#### TableHeader

```tsx
<TableHeader columns={[
  { id: 'name', header: 'Nombre', sortable: true },
  { id: 'status', header: 'Estado', sortable: true },
  { id: 'actions', header: 'Acciones', sortable: false },
]} />
```

**Features**:
- Sortable columns with visual indicators (↑↓)
- Updates URL with `sortBy` and `sortOrder` params
- Resets to page 1 on sort change

#### TableSearch

```tsx
<TableSearch 
  placeholder="Buscar modelos..." 
  defaultValue={searchParams.search} 
/>
```

**Features**:
- Debounced input (300ms)
- Clear button
- Updates URL with `search` param
- Loading indicator during debounce

#### TableFilters

```tsx
<TableFilters filters={[
  {
    id: 'status',
    label: 'Estado',
    type: 'select',
    options: [
      { value: 'all', label: 'Todos' },
      { value: 'draft', label: 'Borrador' },
    ],
  },
]} />
```

**Features**:
- Generic filter definitions
- URL-based state
- Clear all filters button
- Resets to page 1 on filter change

#### TablePagination

```tsx
<TablePagination
  currentPage={1}
  totalPages={10}
  totalItems={200}
/>
```

**Features**:
- Next/Previous navigation
- Jump to first/last page
- Page indicator
- Updates URL with `page` param

### Organisms (Feature-Specific Tables)

Located in `src/app/(dashboard)/admin/[feature]/_components/` - Full table implementation.

Example: `ModelsTable`, `GlassTypesTable`

**Responsibilities**:
- Column definitions
- Filter definitions
- Row rendering
- CRUD actions (edit, delete)
- Mutation handling

### Pages (Orchestration)

Located in `src/app/(dashboard)/admin/[feature]/page.tsx` - Server Components.

**Responsibilities**:
- Parse `searchParams`
- Call tRPC procedures
- Transform data (Decimal → number)
- Render table organism

## Data Flow

### 1. Initial Load

```
User navigates to /admin/models
         ↓
Next.js renders Server Component (page.tsx)
         ↓
Reads searchParams (empty on first load)
         ↓
Calls api.admin.model.list({ page: 1, sortBy: 'createdAt' })
         ↓
tRPC validates input with Zod schema
         ↓
Prisma executes optimized query with indexes
         ↓
Returns paginated data
         ↓
Server Component serializes Decimal → number
         ↓
Passes data to ModelsTable Client Component
         ↓
Table renders with TableFilters, TableSearch, TablePagination
```

### 2. Filter Change

```
User selects "Publicado" in status filter
         ↓
TableFilters updates URL: ?status=published&page=1
         ↓
Next.js detects URL change
         ↓
Server Component refetches with new params
         ↓
tRPC procedure filters with WHERE { status: 'published' }
         ↓
Prisma uses index on 'status' column
         ↓
Returns filtered data
         ↓
Table re-renders with new data
```

### 3. Search Input

```
User types "ven" in search input
         ↓
TableSearch debounces for 300ms
         ↓
After delay, updates URL: ?search=ven&page=1
         ↓
Server Component refetches
         ↓
tRPC procedure filters with WHERE { name: { contains: 'ven' } }
         ↓
Prisma uses index on 'name' column
         ↓
Returns search results
         ↓
Table re-renders
```

## Performance Optimizations

### 1. Database Indexes

All filterable/sortable columns have indexes:

```sql
-- Automatically created by Prisma migrations
CREATE INDEX "Model_name_idx" ON "Model"("name");
CREATE INDEX "Model_status_idx" ON "Model"("status");
CREATE INDEX "Model_createdAt_idx" ON "Model"("createdAt" DESC);
```

**Impact**: Query time reduced from ~500ms to ~50ms on 10k records.

### 2. Select Only Needed Fields

```tsx
// ✅ GOOD - Select only needed fields
await ctx.db.model.findMany({
  select: {
    id: true,
    name: true,
    status: true,
    basePrice: true,
    profileSupplier: {
      select: { id: true, name: true, materialType: true },
    },
  },
});

// ❌ BAD - Fetch all fields
await ctx.db.model.findMany(); // Includes all relations
```

### 3. Parallel Queries

```tsx
// Execute count and findMany in parallel
const [total, items] = await Promise.all([
  ctx.db.model.count({ where }),
  ctx.db.model.findMany({ where, orderBy, skip, take }),
]);
```

### 4. Debounced Search

Reduces server requests from ~10/s (typing "ventana") to 1 request after 300ms.

## Security

### 1. Input Validation

All tRPC procedures validate inputs with Zod:

```tsx
export const listModelsSchema = paginationSchema.extend({
  status: z.enum(['all', 'draft', 'published']).default('all'),
  search: searchQuerySchema, // Max 100 chars, trimmed
  sortBy: z.enum(['name', 'createdAt', 'basePrice']).default('createdAt'),
  sortOrder: sortOrderSchema, // 'asc' | 'desc'
});
```

### 2. SQL Injection Prevention

Prisma uses parameterized queries:

```tsx
// ✅ SAFE - Prisma prevents SQL injection
await ctx.db.model.findMany({
  where: { name: { contains: userInput } }, // Parameterized
});

// ❌ UNSAFE - Never use raw SQL with user input
await ctx.db.$executeRawUnsafe(`SELECT * FROM Model WHERE name LIKE '%${userInput}%'`);
```

### 3. Role-Based Access Control

Admin-only procedures use `adminProcedure`:

```tsx
export const modelRouter = createTRPCRouter({
  list: adminProcedure // ← Only admins can access
    .input(listModelsSchema)
    .query(async ({ ctx, input }) => { /* ... */ }),
});
```

## Accessibility

- **Keyboard Navigation**: All interactive elements focusable with Tab
- **ARIA Labels**: Search inputs, filter selects, pagination buttons
- **Screen Readers**: Proper table structure (`<thead>`, `<tbody>`)
- **Focus Management**: Trap focus in dropdown menus

## Testing

### Unit Tests (Vitest)

- `use-server-params.test.ts` - URL param updates
- `use-debounced-callback.test.ts` - Debouncing behavior
- `table-query-builder.test.ts` - Prisma query generation

### E2E Tests (Playwright)

- `models-table.spec.ts` - Full table interactions
- `glass-types-table.spec.ts` - Filter/sort/search/pagination
- Tests for deep linking, URL persistence, RBAC

## Migration Guide

### Step 1: Update Prisma Schema

Add indexes for filterable/sortable columns:

```prisma
model YourModel {
  // ... fields
  
  @@index([searchableField])
  @@index([filterableField])
  @@index([sortableField(sort: Desc)])
}
```

Run migration:

```bash
pnpm prisma db push
```

### Step 2: Update tRPC Procedure

Add filter/sort/search parameters to schema:

```tsx
export const listYourModelsSchema = paginationSchema.extend({
  search: searchQuerySchema,
  status: z.enum(['all', 'active', 'inactive']).default('all'),
  sortBy: z.enum(['name', 'createdAt']).default('createdAt'),
  sortOrder: sortOrderSchema,
});
```

Implement filtering in procedure:

```tsx
list: adminProcedure.input(listYourModelsSchema).query(async ({ ctx, input }) => {
  const where = buildWhereClause(input);
  const orderBy = buildOrderByClause(input.sortBy, input.sortOrder);
  
  const [total, items] = await Promise.all([
    ctx.db.yourModel.count({ where }),
    ctx.db.yourModel.findMany({ where, orderBy, skip, take }),
  ]);
  
  return { items, total, page, totalPages };
});
```

### Step 3: Create Table Component

Create `your-models-table.tsx` using the pattern:

```tsx
import { ServerTable } from '@/app/_components/server-table';
import { TableFilters } from '@/app/_components/server-table/table-filters';
import { TableSearch } from '@/app/_components/server-table/table-search';
import { TablePagination } from '@/app/_components/server-table/table-pagination';

export function YourModelsTable({ initialData, searchParams }: Props) {
  const columns: ServerTableColumn<YourModel>[] = [/* ... */];
  const filters: FilterDefinition[] = [/* ... */];
  
  return (
    <>
      <TableFilters filters={filters} />
      <TableSearch placeholder="Buscar..." />
      <ServerTable columns={columns} data={initialData.items} />
      <TablePagination {...initialData} />
    </>
  );
}
```

### Step 4: Update Page Component

Update `page.tsx` to use Server Component pattern:

```tsx
type SearchParams = Promise<{
  search?: string;
  status?: string;
  page?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}>;

export default async function YourModelsPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  
  const data = await api.yourRouter.list({
    page: Number(params.page) || 1,
    search: params.search,
    status: params.status,
    sortBy: params.sortBy || 'createdAt',
    sortOrder: params.sortOrder || 'desc',
  });
  
  return <YourModelsTable initialData={data} searchParams={params} />;
}
```

### Step 5: Add E2E Tests

Create `your-models-table.spec.ts` with tests for:
- Filtering
- Sorting
- Search
- Pagination
- Deep linking

## Best Practices

### ✅ DO

- Use Server Components for data fetching
- Put all table state in URL params
- Debounce search inputs (300ms)
- Add database indexes for filters/sorts
- Use `adminProcedure` for admin-only routes
- Validate inputs with Zod schemas
- Reset to page 1 when filters/search change
- Use `replaceState` for search (avoid history pollution)

### ❌ DON'T

- Fetch data client-side with `useQuery`
- Store table state in React state/context
- Update URL without debounce for search
- Skip database indexes (slow queries)
- Trust client-side authorization
- Use raw SQL with user inputs
- Use `pushState` for all URL updates (pollutes history)
- Forget to transform Decimal fields to numbers

## Related Documentation

- [Next.js 15 Server Components](https://nextjs.org/docs/app/building-your-application/rendering/server-components)
- [tRPC Best Practices](https://trpc.io/docs/server/procedures)
- [Prisma Query Optimization](https://www.prisma.io/docs/orm/prisma-client/queries/query-optimization-performance)
- [Developer Guide: Creating Server Tables](./guides/create-server-table.md)

## Changelog

- **2025-10-18**: Initial implementation
  - Migrated Models table
  - Migrated Glass Types table
  - Created reusable components (TableHeader, TableSearch, TableFilters, TablePagination)
  - Added database indexes
  - Created E2E tests
