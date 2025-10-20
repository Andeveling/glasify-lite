/**
 * Glass Types List Page (US8 - T067)
 *
 * Server Component with Suspense boundaries for streaming
 * Pattern: SSR (Server-Side Rendering) for dashboard routes
 *
 * Architecture:
 * - Reads filters from URL search params (Promise in Next.js 15)
 * - Lightweight queries (suppliers) outside Suspense
 * - Heavy query (glass types list) inside Suspense
 * - Template literal key for proper re-suspension
 *
 * Performance:
 * - SSR with force-dynamic ensures fresh data on every request
 * - Suspense with specific key values for reliable updates
 * - Parallel data fetching where applicable
 *
 * Route: /admin/glass-types
 * Access: Admin only (protected by middleware)
 */

import type { Metadata } from 'next';
import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { api } from '@/trpc/server-client';
import { GlassTypesFilters } from './_components/glass-types-filters';
import { GlassTypesTable } from './_components/glass-types-table';

export const metadata: Metadata = {
  description: 'Administra los tipos de vidrio con sus soluciones y características',
  title: 'Tipos de Vidrio | Admin',
};

/**
 * SSR Configuration: Force dynamic rendering
 * - No caching for admin routes (always fresh data)
 * - Suspense key triggers re-fetch when filters change
 * - Private dashboard routes don't benefit from ISR
 */
export const dynamic = 'force-dynamic';

type SearchParams = Promise<{
  purpose?: string;
  glassSupplierId?: string;
  isActive?: string;
  page?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}>;

type PageProps = {
  searchParams: SearchParams;
};

// Loading skeleton for the table
function GlassTypesTableSkeleton() {
  return (
    <div className="rounded-md border">
      <div className="space-y-3 p-4">
        {Array.from({ length: 10 }).map((_, i) => (
          <Skeleton className="h-16 w-full" key={i} />
        ))}
      </div>
    </div>
  );
}

// Server Component that fetches and renders the table
async function GlassTypesTableContent({
  page,
  purpose,
  glassSupplierId,
  isActive,
  search,
  sortBy,
  sortOrder,
}: {
  page: number;
  purpose?: string;
  glassSupplierId?: string;
  isActive: 'all' | 'active' | 'inactive';
  search?: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}) {
  // Fetch glass types data (heavy query inside Suspense)
  const initialData = await api.admin['glass-type'].list({
    glassSupplierId,
    isActive,
    limit: 20,
    page,
    purpose: purpose as 'general' | 'insulation' | 'security' | 'decorative' | undefined,
    search,
    sortBy: sortBy as 'name' | 'thicknessMm' | 'pricePerSqm' | 'createdAt' | 'purpose',
    sortOrder,
  });

  // Transform Decimal fields to number for Client Component serialization
  const serializedData = {
    ...initialData,
    items: initialData.items.map((glassType) => ({
      ...glassType,
      lightTransmission: glassType.lightTransmission?.toNumber() ?? null,
      pricePerSqm: glassType.pricePerSqm.toNumber(),
      solarFactor: glassType.solarFactor?.toNumber() ?? null,
      uValue: glassType.uValue?.toNumber() ?? null,
    })),
  };

  return (
    <GlassTypesTable
      initialData={serializedData}
      searchParams={{
        glassSupplierId,
        isActive,
        page: String(page),
        purpose,
        search,
      }}
    />
  );
}

export default async function GlassTypesPage({ searchParams }: PageProps) {
  const params = await searchParams;

  // Parse search params (outside Suspense)
  const page = Number(params.page) || 1;
  const purpose = params.purpose && params.purpose !== 'all' ? params.purpose : undefined;
  const glassSupplierId =
    params.glassSupplierId && params.glassSupplierId !== 'all' ? params.glassSupplierId : undefined;
  const isActive = (params.isActive && params.isActive !== 'all' ? params.isActive : 'all') as
    | 'all'
    | 'active'
    | 'inactive';
  const search = params.search || undefined;
  const sortBy = params.sortBy || 'name';
  const sortOrder = (params.sortOrder || 'asc') as 'asc' | 'desc';

  // Fetch suppliers for filter dropdown (lightweight query outside Suspense)
  const suppliersData = await api.admin['glass-supplier'].list({
    isActive: 'active',
    limit: 100,
    page: 1,
    sortBy: 'name',
    sortOrder: 'asc',
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-bold text-3xl tracking-tight">Tipos de Vidrio</h1>
        <p className="text-muted-foreground">Administra los tipos de vidrio con sus soluciones y características</p>
      </div>

      {/* Filters outside Suspense - always visible */}
      <GlassTypesFilters
        searchParams={{
          glassSupplierId: params.glassSupplierId,
          isActive: params.isActive,
          page: String(page),
          purpose: params.purpose,
          search,
        }}
        suppliers={suppliersData.items}
      />

      {/* Table content inside Suspense - streaming */}
      <Suspense
        fallback={<GlassTypesTableSkeleton />}
        key={`${search}-${page}-${purpose}-${glassSupplierId}-${isActive}-${sortBy}-${sortOrder}`}
      >
        <GlassTypesTableContent
          glassSupplierId={glassSupplierId}
          isActive={isActive}
          page={page}
          purpose={purpose}
          search={search}
          sortBy={sortBy}
          sortOrder={sortOrder}
        />
      </Suspense>
    </div>
  );
}
