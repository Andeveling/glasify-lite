/**
 * Glass Types List Page (US8 - T067)
 *
 * Server Component that fetches initial data and delegates
 * interactivity to GlassTypeList Client Component
 *
 * Route: /admin/glass-types
 * Access: Admin only (protected by middleware)
 */

import type { Metadata } from 'next';
import { api } from '@/trpc/server-client';
import { GlassTypeList } from './_components/glass-type-list';

export const metadata: Metadata = {
  description: 'Administra los tipos de vidrio con sus soluciones y características',
  title: 'Tipos de Vidrio | Admin',
};

export default async function GlassTypesPage() {
  // Fetch initial data server-side
  const initialData = await api.admin[ 'glass-type' ].list({
    limit: 20,
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

      <GlassTypeList initialData={serializedData} />
    </div>
  );
}
