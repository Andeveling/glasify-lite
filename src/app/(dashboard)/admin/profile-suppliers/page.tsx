/**
 * Profile Suppliers List Page
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
 * Route: /admin/profile-suppliers
 * Access: Admin only (protected by middleware)
 */

import type { Metadata } from 'next';
import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { api } from '@/trpc/server-client';
import { ProfileSupplierContent } from './_components/profile-supplier-content';

export const metadata: Metadata = {
  description: 'Administra los fabricantes de perfiles (ventanas y puertas)',
  title: 'Proveedores de Perfiles | Admin',
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
  materialType?: string;
  page?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}>;

type PageProps = {
  searchParams: SearchParams;
};

/**
 * Loading skeleton for the table
 * Lightweight component with minimal client JS
 */
function ProfileSuppliersTableSkeleton() {
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
async function ProfileSuppliersTableContent({
  page,
  search,
  materialType,
  isActive,
  sortBy,
  sortOrder,
}: {
  page: number;
  search?: string;
  materialType?: string;
  isActive: 'all' | 'active' | 'inactive';
  sortBy: 'name' | 'createdAt' | 'materialType';
  sortOrder: 'asc' | 'desc';
}) {
  // Fetch data (inside Suspense boundary)
  const initialData = await api.admin['profile-supplier'].list({
    isActive,
    limit: 20,
    materialType: materialType as 'PVC' | 'ALUMINUM' | 'WOOD' | 'MIXED' | undefined,
    page,
    search,
    sortBy,
    sortOrder,
  });

  const searchParamsForClient = {
    isActive,
    materialType,
    page: String(page),
    search,
    sortBy,
    sortOrder,
  };

  return <ProfileSupplierContent initialData={initialData} searchParams={searchParamsForClient} />;
}

export default async function ProfileSuppliersPage({ searchParams }: PageProps) {
  const params = await searchParams;

  // Parse search params (outside Suspense)
  const page = Number(params.page) || 1;
  const search = params.search && params.search !== '' ? params.search : undefined;
  const materialType = params.materialType && params.materialType !== 'all' ? params.materialType : undefined;
  const isActive = (params.isActive && params.isActive !== 'all' ? params.isActive : 'all') as
    | 'all'
    | 'active'
    | 'inactive';
  const sortBy = (params.sortBy || 'name') as 'name' | 'createdAt' | 'materialType';
  const sortOrder = (params.sortOrder || 'asc') as 'asc' | 'desc';

  return (
    <div className="space-y-6">
      {/* Header - static, shows immediately */}
      <div>
        <h1 className="font-bold text-3xl tracking-tight">Proveedores de Perfiles</h1>
        <p className="text-muted-foreground">Administra los fabricantes de perfiles para ventanas y puertas</p>
      </div>

      {/* Table content inside Suspense - streaming with skeleton fallback */}
      <Suspense
        fallback={<ProfileSuppliersTableSkeleton />}
        key={`${search}-${page}-${materialType}-${isActive}-${sortBy}-${sortOrder}`}
      >
        <ProfileSuppliersTableContent
          isActive={isActive}
          materialType={materialType}
          page={page}
          search={search}
          sortBy={sortBy}
          sortOrder={sortOrder}
        />
      </Suspense>
    </div>
  );
}
