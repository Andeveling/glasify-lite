/**
 * Models List Page (US9 - T083)
 *
 * Server Component that fetches initial data and delegates
 * interactivity to ModelList Client Component
 *
 * Route: /admin/models
 * Access: Admin only (protected by middleware)
 */

import type { Metadata } from 'next';
import { api } from '@/trpc/server-client';
import { ModelList } from './_components/model-list';

export const metadata: Metadata = {
  description: 'Administra los modelos de ventanas y puertas con sus dimensiones y precios',
  title: 'Modelos | Admin',
};

export default async function ModelsPage() {
  // Fetch initial data server-side
  const initialData = await api.admin.model.list({
    limit: 20,
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

      <ModelList initialData={serializedData} />
    </div>
  );
}
