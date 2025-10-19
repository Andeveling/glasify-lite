/**
 * Glass Types List Page (US8 - T067)
 *
 * Server Component with server-side filtering via URL search params
 *
 * Architecture:
 * - Reads filters from URL search params
 * - Fetches filtered data from server
 * - Passes data to GlassTypesTable component
 * - On filter change (URL update), page automatically refetches
 *
 * Route: /admin/glass-types
 * Access: Admin only (protected by middleware)
 */

import type { Metadata } from 'next';
import { api } from '@/trpc/server-client';
import { GlassTypesTable } from './_components/glass-types-table';

export const metadata: Metadata = {
  description: 'Administra los tipos de vidrio con sus soluciones y características',
  title: 'Tipos de Vidrio | Admin',
};

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

export default async function GlassTypesPage({ searchParams }: PageProps) {
  const params = await searchParams;

  // Parse search params with server-side filtering
  const page = Number(params.page) || 1;
  const purpose = params.purpose === 'all' || !params.purpose ? undefined : params.purpose;
  const glassSupplierId =
    params.glassSupplierId === 'all' || !params.glassSupplierId ? undefined : params.glassSupplierId;
  const isActive = params.isActive === 'all' || !params.isActive ? undefined : params.isActive;
  const search = params.search || undefined;
  const sortBy = params.sortBy || 'name';
  const sortOrder = params.sortOrder || 'asc';

  // Fetch filtered data from server
  const initialData = await api.admin['glass-type'].list({
    glassSupplierId,
    isActive: isActive as 'all' | 'active' | 'inactive' | undefined,
    limit: 20,
    page,
    purpose: purpose as 'general' | 'insulation' | 'security' | 'decorative' | undefined,
    search,
    sortBy: sortBy as 'name' | 'thicknessMm' | 'pricePerSqm' | 'createdAt' | 'purpose',
    sortOrder,
  });

  // Fetch suppliers for filter dropdown
  const suppliersData = await api.admin['glass-supplier'].list({
    isActive: 'active',
    limit: 100,
    page: 1,
    sortBy: 'name',
    sortOrder: 'asc',
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
    <div className="space-y-6">
      <div>
        <h1 className="font-bold text-3xl tracking-tight">Tipos de Vidrio</h1>
        <p className="text-muted-foreground">Administra los tipos de vidrio con sus soluciones y características</p>
      </div>

      <GlassTypesTable initialData={serializedData} searchParams={params} suppliers={suppliersData.items} />
    </div>
  );
}
