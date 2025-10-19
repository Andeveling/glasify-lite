/**
 * Glass Types List Page (US8 - T067)
 *
 * Server Component with Suspense boundaries for streaming
 *
 * Architecture:
 * - Reads filters from URL search params (Promise in Next.js 15)
 * - Initiates parallel data fetching (no await in main component)
 * - Uses Suspense boundaries for streaming and loading states
 * - On filter change (URL update), page automatically refetches
 *
 * Performance:
 * - Streaming with Suspense for immediate navigation
 * - Parallel data fetching for better performance
 * - No force-dynamic needed (Suspense handles dynamic rendering)
 *
 * Route: /admin/glass-types
 * Access: Admin only (protected by middleware)
 */

import type { Metadata } from 'next';
import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { api } from '@/trpc/server-client';
import { GlassTypesTable } from './_components/glass-types-table';

export const metadata: Metadata = {
  description: 'Administra los tipos de vidrio con sus soluciones y características',
  title: 'Tipos de Vidrio | Admin',
};

// Force dynamic rendering to ensure searchParams changes trigger re-renders
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
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Skeleton className="h-10 w-full max-w-sm" />
        <Skeleton className="h-10 w-[180px]" />
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
async function GlassTypesTableContent({ params }: { params: Awaited<SearchParams> }) {
  // Parse search params with server-side filtering
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
  const sortOrder = params.sortOrder || 'asc';

  // Parallel data fetching
  const [ initialData, suppliersData ] = await Promise.all([
    api.admin[ 'glass-type' ].list({
      glassSupplierId,
      isActive,
      limit: 20,
      page,
      purpose: purpose as 'general' | 'insulation' | 'security' | 'decorative' | undefined,
      search,
      sortBy: sortBy as 'name' | 'thicknessMm' | 'pricePerSqm' | 'createdAt' | 'purpose',
      sortOrder,
    }),
    api.admin[ 'glass-supplier' ].list({
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
    items: initialData.items.map((glassType) => ({
      ...glassType,
      lightTransmission: glassType.lightTransmission?.toNumber() ?? null,
      pricePerSqm: glassType.pricePerSqm.toNumber(),
      solarFactor: glassType.solarFactor?.toNumber() ?? null,
      uValue: glassType.uValue?.toNumber() ?? null,
    })),
  };

  return <GlassTypesTable initialData={serializedData} searchParams={params} suppliers={suppliersData.items} />;
}

export default async function GlassTypesPage({ searchParams }: PageProps) {
  const params = await searchParams;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-bold text-3xl tracking-tight">Tipos de Vidrio</h1>
        <p className="text-muted-foreground">Administra los tipos de vidrio con sus soluciones y características</p>
      </div>

      <Suspense fallback={<GlassTypesTableSkeleton />} key={JSON.stringify(params)}>
        <GlassTypesTableContent params={params} />
      </Suspense>
    </div>
  );
}
