/**
 * Models List Page (US9 - T083)
 *
 * Server Component with Suspense boundaries for streaming
 * Pattern based on /catalog/page.tsx for consistent behavior
 *
 * Architecture:
 * - Reads filters from URL search params (Promise in Next.js 15)
 * - Lightweight queries (suppliers) outside Suspense
 * - Heavy query (models list) inside Suspense
 * - Template literal key for proper re-suspension
 *
 * Scalability:
 * - No limit on dataset size (server filters before returning)
 * - Pagination server-side (20 items per page by default)
 * - Deep linking support (filters in URL)
 *
 * Performance:
 * - force-dynamic ensures searchParams changes trigger re-renders
 * - Suspense with specific key values for reliable updates
 * - Optimized query separation
 *
 * Route: /admin/models
 * Access: Admin only (protected by middleware)
 */

import type { Metadata } from 'next';
import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { api } from '@/trpc/server-client';
import { ModelsFilters } from './_components/models-filters';
import { ModelsTable } from './_components/models-table';

export const metadata: Metadata = {
  description: 'Administra los modelos de ventanas y puertas con sus dimensiones y precios',
  title: 'Modelos | Admin',
};

/**
 * ISR Configuration: Revalidate every 30 seconds
 * - Server renders are cached for 30 seconds
 * - Suspense key triggers re-fetch when filters change
 * - Background revalidation on cache miss
 */
export const revalidate = 30;

type SearchParams = Promise<{
  status?: string;
  profileSupplierId?: string;
  page?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}>;

type PageProps = {
  searchParams: SearchParams;
};

// Loading skeleton for the table
function ModelsTableSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Skeleton className="h-10 w-full max-w-sm" />
        <Skeleton className="h-10 w-[180px]" />
        <Skeleton className="h-10 w-[180px]" />
      </div>
      <div className="rounded-md border">
        <div className="space-y-3 p-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <Skeleton className="h-16 w-full" key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}

// Server Component that fetches and renders the table
async function ModelsTableContent({
  page,
  status,
  profileSupplierId,
  search,
  sortBy,
  sortOrder,
}: {
  page: number;
  status: 'all' | 'draft' | 'published';
  profileSupplierId?: string;
  search?: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}) {
  // Fetch models data (heavy query inside Suspense)
  const initialData = await api.admin.model.list({
    limit: 20,
    page,
    profileSupplierId,
    search,
    sortBy: sortBy as 'name' | 'createdAt' | 'updatedAt' | 'basePrice',
    sortOrder,
    status,
  });

  // Transform Decimal fields to number for Client Component serialization
  const serializedData = {
    ...initialData,
    items: initialData.items.map((model) => ({
      ...model,
      accessoryPrice: model.accessoryPrice?.toNumber() ?? 0,
      basePrice: model.basePrice.toNumber(),
      costPerMmHeight: model.costPerMmHeight.toNumber(),
      costPerMmWidth: model.costPerMmWidth.toNumber(),
      profitMarginPercentage: model.profitMarginPercentage?.toNumber() ?? null,
    })),
  };

  return <ModelsTable initialData={serializedData} />;
}

export default async function ModelsPage({ searchParams }: PageProps) {
  const params = await searchParams;

  // Parse search params (outside Suspense)
  const page = Number(params.page) || 1;
  const status = (params.status && params.status !== 'all' ? params.status : 'all') as 'all' | 'draft' | 'published';
  const profileSupplierId =
    params.profileSupplierId && params.profileSupplierId !== 'all' ? params.profileSupplierId : undefined;
  const search = params.search || undefined;
  const sortBy = params.sortBy || 'createdAt';
  const sortOrder = (params.sortOrder || 'desc') as 'asc' | 'desc';

  // Fetch suppliers for filter dropdown (lightweight query outside Suspense)
  const suppliersData = await api.admin[ 'profile-supplier' ].list({
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
        <h1 className="font-bold text-3xl tracking-tight">Modelos</h1>
        <p className="text-muted-foreground">
          Administra los modelos de ventanas y puertas con sus dimensiones y precios
        </p>
      </div>

      {/* Filters outside Suspense - always visible */}
      <ModelsFilters
        searchParams={{
          page: String(page),
          profileSupplierId: params.profileSupplierId,
          search,
          status: params.status,
        }}
        suppliers={suppliersData.items}
      />

      {/* Table content inside Suspense - streaming */}
      <Suspense
        fallback={<ModelsTableSkeleton />}
        key={`${search}-${page}-${status}-${profileSupplierId}-${sortBy}-${sortOrder}`}
      >
        <ModelsTableContent
          page={page}
          profileSupplierId={profileSupplierId}
          search={search}
          sortBy={sortBy}
          sortOrder={sortOrder}
          status={status}
        />
      </Suspense>
    </div>
  );
}
