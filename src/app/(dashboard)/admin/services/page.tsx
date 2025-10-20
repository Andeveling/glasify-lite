/**
 * Services List Page (US10 - T094)
 *
 * Server Component with Suspense boundaries for streaming
 * Pattern: SSR (Server-Side Rendering) for dashboard routes
 *
 * Architecture:
 * - Reads filters from URL search params (Promise in Next.js 15)
 * - Lightweight queries (none) outside Suspense
 * - Heavy query (services list) inside Suspense
 * - Template literal key for proper re-suspension
 *
 * Performance:
 * - SSR with force-dynamic ensures fresh data on every request
 * - Suspense with specific key values for reliable updates
 * - Parallel data fetching where applicable
 *
 * Route: /admin/services
 * Access: Admin only (protected by middleware)
 */

import type { Metadata } from 'next';
import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { api } from '@/trpc/server-client';
import { ServicesContent } from './_components/services-content';

export const metadata: Metadata = {
  description: 'Administra los servicios adicionales para cotizaciones',
  title: 'Servicios | Admin',
};

/**
 * SSR Configuration: Force dynamic rendering
 * - No caching for admin routes (always fresh data)
 * - Suspense key triggers re-fetch when filters change
 * - Private dashboard routes don't benefit from ISR
 */
export const dynamic = 'force-dynamic';

type SearchParams = Promise<{
  isActive?: string;
  page?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  type?: string;
}>;

type PageProps = {
  searchParams: SearchParams;
};

// Loading skeleton for the table
function ServicesListSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <Skeleton className="h-10 w-full max-w-sm" />
        <Skeleton className="h-10 w-[180px]" />
        <Skeleton className="h-10 w-[180px]" />
      </div>
      <div className="rounded-md border">
        <div className="space-y-1 border-b p-4">
          <div className="flex justify-between">
            <Skeleton className="h-4 w-[100px]" />
            <Skeleton className="h-4 w-[80px]" />
            <Skeleton className="h-4 w-[80px]" />
            <Skeleton className="h-4 w-[60px]" />
          </div>
        </div>
        <div className="space-y-0 divide-y">
          {Array.from({ length: 10 }).map((_, i) => (
            <div className="flex justify-between p-4" key={i}>
              <Skeleton className="h-4 w-[150px]" />
              <Skeleton className="h-4 w-[80px]" />
              <Skeleton className="h-4 w-[60px]" />
              <Skeleton className="h-4 w-[60px]" />
              <Skeleton className="h-4 w-[40px]" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Server Component that fetches and renders the table
async function ServicesListContent({
  isActive,
  page,
  search,
  sortBy,
  sortOrder,
  type,
}: {
  isActive: 'all' | 'active' | 'inactive';
  page: number;
  search?: string;
  sortBy: 'name' | 'createdAt' | 'updatedAt' | 'rate';
  sortOrder: 'asc' | 'desc';
  type?: string;
}) {
  // Fetch services data (heavy query inside Suspense)
  const initialData = await api.admin.service.list({
    isActive,
    limit: 20,
    page,
    search,
    sortBy: sortBy as 'name' | 'createdAt' | 'updatedAt' | 'rate',
    sortOrder,
    type: (type === 'all' ? 'all' : type) as 'all' | 'area' | 'perimeter' | 'fixed',
  });

  // Transform Decimal fields to number for Client Component serialization
  const serializedData = {
    ...initialData,
    items: initialData.items.map((service) => ({
      ...service,
      rate: service.rate.toNumber(),
    })),
  };

  return (
    <ServicesContent
      initialData={serializedData}
      searchParams={{
        isActive,
        page: String(page),
        search,
        sortBy,
        sortOrder,
        type,
      }}
    />
  );
}

export default async function ServicesPage({ searchParams }: PageProps) {
  const params = await searchParams;

  // Parse search params (outside Suspense)
  const page = Number(params.page) || 1;
  const search = params.search && params.search !== '' ? params.search : undefined;
  const type = params.type && params.type !== 'all' ? params.type : undefined;
  const isActive = (params.isActive && params.isActive !== 'all' ? params.isActive : 'all') as
    | 'all'
    | 'active'
    | 'inactive';
  const sortBy = params.sortBy || 'name';
  const sortOrder = (params.sortOrder || 'asc') as 'asc' | 'desc';

  return (
    <div className="space-y-6">
      {/* Header - always visible */}
      <div>
        <h1 className="font-bold text-3xl tracking-tight">Servicios</h1>
        <p className="text-muted-foreground">
          Gestiona los servicios adicionales para cotizaciones (instalación, entrega, etc.)
        </p>
      </div>

      {/* Content with filters and table inside Suspense - streaming */}
      <Suspense
        fallback={<ServicesListSkeleton />}
        key={`${search}-${page}-${type}-${isActive}-${sortBy}-${sortOrder}`}
      >
        <ServicesListContent
          isActive={isActive}
          page={page}
          search={search}
          sortBy={sortBy as 'name' | 'createdAt' | 'updatedAt' | 'rate'}
          sortOrder={sortOrder}
          type={type}
        />
      </Suspense>
    </div>
  );
}
