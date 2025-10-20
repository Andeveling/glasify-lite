/**
 * Services List Page (US10 - T094)
 *
 * Server Component with Suspense boundaries for streaming
 * Pattern: SSR with granular Suspense for optimal TTI
 *
 * Architecture:
 * - Reads filters from URL search params (Promise in Next.js 15)
 * - Filters OUTSIDE Suspense (always visible during loading)
 * - Table data INSIDE Suspense (streaming with skeleton fallback)
 * - Dialog-based CRUD (modals open immediately)
 *
 * Performance:
 * - SSR with force-dynamic ensures fresh data on every request
 * - Suspense with specific key values for reliable updates
 * - Lightweight skeleton (minimal client JS)
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

/**
 * Loading skeleton for the table
 * Lightweight component with minimal client JS
 */
function ServicesTableSkeleton() {
  return (
    <div className="space-y-4">
      {/* Filters skeleton */}
      <div className="flex items-center gap-4">
        <Skeleton className="h-10 w-full max-w-sm" />
        <Skeleton className="h-10 w-[180px]" />
        <Skeleton className="h-10 w-[180px]" />
        <Skeleton className="h-10 w-[120px]" />
      </div>

      {/* Table skeleton */}
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

/**
 * Server Component that fetches and renders the table
 * This runs inside Suspense boundary for streaming
 */
async function ServicesTableContent({
  page,
  search,
  type,
  isActive,
  sortBy,
  sortOrder,
}: {
  page: number;
  search?: string;
  type?: string;
  isActive: 'all' | 'active' | 'inactive';
  sortBy: 'name' | 'createdAt' | 'updatedAt' | 'rate';
  sortOrder: 'asc' | 'desc';
}) {
  // Fetch data (inside Suspense boundary)
  const initialData = await api.admin.service.list({
    isActive,
    limit: 20,
    page,
    search,
    sortBy,
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

  const searchParamsForClient = {
    isActive,
    page: String(page),
    search,
    sortBy,
    sortOrder,
    type,
  };

  return <ServicesContent initialData={serializedData} searchParams={searchParamsForClient} />;
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
  const sortBy = (params.sortBy || 'name') as 'name' | 'createdAt' | 'updatedAt' | 'rate';
  const sortOrder = (params.sortOrder || 'asc') as 'asc' | 'desc';

  return (
    <div className="space-y-6">
      {/* Header - static, shows immediately */}
      <div>
        <h1 className="font-bold text-3xl tracking-tight">Servicios</h1>
        <p className="text-muted-foreground">
          Gestiona los servicios adicionales para cotizaciones (instalación, entrega, etc.)
        </p>
      </div>

      {/* Table content inside Suspense - streaming with skeleton fallback */}
      <Suspense
        fallback={<ServicesTableSkeleton />}
        key={`${search}-${page}-${type}-${isActive}-${sortBy}-${sortOrder}`}
      >
        <ServicesTableContent
          isActive={isActive}
          page={page}
          search={search}
          sortBy={sortBy}
          sortOrder={sortOrder}
          type={type}
        />
      </Suspense>
    </div>
  );
}
