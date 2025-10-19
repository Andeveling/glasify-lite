/**
 * Models List Page (US9 - T083)
 *
 * Server Component with server-side filtering via URL search params
 *
 * Architecture:
 * - Reads filters from URL search params
 * - Fetches filtered data from server
 * - Passes data to ModelsTable component
 * - On filter change (URL update), page automatically refetches
 *
 * Scalability:
 * - No limit on dataset size (server filters before returning)
 * - Pagination server-side (20 items per page by default)
 * - Deep linking support (filters in URL)
 *
 * Route: /admin/models
 * Access: Admin only (protected by middleware)
 */

import type { Metadata } from 'next';
import { api } from '@/trpc/server-client';
import { ModelsTable } from './_components/models-table';

export const metadata: Metadata = {
  description: 'Administra los modelos de ventanas y puertas con sus dimensiones y precios',
  title: 'Modelos | Admin',
};

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

export default async function ModelsPage({ searchParams }: PageProps) {
  const params = await searchParams;

  // Parse search params with server-side filtering
  const page = Number(params.page) || 1;
  const status = params.status === 'all' || !params.status ? undefined : (params.status as 'draft' | 'published');
  const profileSupplierId =
    params.profileSupplierId === 'all' || !params.profileSupplierId ? undefined : params.profileSupplierId;
  const search = params.search || undefined;
  const sortBy = params.sortBy || 'createdAt';
  const sortOrder = params.sortOrder || 'desc';

  // Fetch filtered data from server
  const initialData = await api.admin.model.list({
    limit: 20, // Items per page
    page,
    profileSupplierId,
    search,
    sortBy: sortBy as 'name' | 'createdAt' | 'updatedAt' | 'basePrice',
    sortOrder,
    status,
  });

  // Fetch suppliers for filter dropdown
  const suppliersData = await api.admin['profile-supplier'].list({
    isActive: 'active',
    limit: 100,
    page: 1,
    sortBy: 'name',
    sortOrder: 'asc',
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-bold text-3xl tracking-tight">Modelos</h1>
        <p className="text-muted-foreground">
          Administra los modelos de ventanas y puertas con sus dimensiones y precios
        </p>
      </div>

      <ModelsTable initialData={serializedData} searchParams={params} suppliers={suppliersData.items} />
    </div>
  );
}
