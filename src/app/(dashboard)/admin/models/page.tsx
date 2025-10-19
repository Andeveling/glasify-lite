/**
 * Models List Page (US9 - T083)
 *
 * Server Component with Suspense boundaries for streaming
 *
 * Architecture:
 * - Reads filters from URL search params (Promise in Next.js 15)
 * - Initiates parallel data fetching (no await in main component)
 * - Uses Suspense boundaries for streaming and loading states
 * - On filter change (URL update), page automatically refetches
 *
 * Scalability:
 * - No limit on dataset size (server filters before returning)
 * - Pagination server-side (20 items per page by default)
 * - Deep linking support (filters in URL)
 *
 * Performance:
 * - Streaming with Suspense for immediate navigation
 * - Parallel data fetching for better performance
 * - No force-dynamic needed (Suspense handles dynamic rendering)
 *
 * Route: /admin/models
 * Access: Admin only (protected by middleware)
 */

import type { Metadata } from 'next';
import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { api } from '@/trpc/server-client';
import { ModelsTable } from './_components/models-table';

export const metadata: Metadata = {
  description: 'Administra los modelos de ventanas y puertas con sus dimensiones y precios',
  title: 'Modelos | Admin',
};

// Force dynamic rendering to ensure searchParams changes trigger re-renders
export const dynamic = 'force-dynamic';

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
async function ModelsTableContent({ params }: { params: Awaited<SearchParams> }) {
  // Parse search params with server-side filtering
  const page = Number(params.page) || 1;
  const status = (params.status && params.status !== 'all' ? params.status : 'all') as 'all' | 'draft' | 'published';
  const profileSupplierId =
    params.profileSupplierId && params.profileSupplierId !== 'all' ? params.profileSupplierId : undefined;
  const search = params.search || undefined;
  const sortBy = params.sortBy || 'createdAt';
  const sortOrder = params.sortOrder || 'desc';

  // Parallel data fetching
  const [ initialData, suppliersData ] = await Promise.all([
    api.admin.model.list({
      limit: 20,
      page,
      profileSupplierId,
      search,
      sortBy: sortBy as 'name' | 'createdAt' | 'updatedAt' | 'basePrice',
      sortOrder,
      status,
    }),
    api.admin[ 'profile-supplier' ].list({
      isActive: 'active',
      limit: 100,
      page: 1,
      sortBy: 'name',
      sortOrder: 'asc',
    }),
  ]);

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

  return <ModelsTable initialData={serializedData} searchParams={params} suppliers={suppliersData.items} />;
}

export default async function ModelsPage({ searchParams }: PageProps) {
  const params = await searchParams;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-bold text-3xl tracking-tight">Modelos</h1>
        <p className="text-muted-foreground">
          Administra los modelos de ventanas y puertas con sus dimensiones y precios
        </p>
      </div>

      <Suspense fallback={<ModelsTableSkeleton />} key={JSON.stringify(params)}>
        <ModelsTableContent params={params} />
      </Suspense>
    </div>
  );
}
