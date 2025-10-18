/**
 * Services List Page (US10 - T094)
 *
 * Server Component that fetches initial service data and renders the list.
 *
 * Route: /admin/services
 * Access: Admin only (protected by middleware)
 */

import { Plus } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';
import { Button } from '@/components/ui/button';
import { api } from '@/trpc/server-client';
import { ServiceList } from './_components/service-list';

export const metadata: Metadata = {
  title: 'Servicios | Admin',
};

export default async function ServicesPage() {
  // Fetch initial data server-side
  const initialData = await api.admin.service.list({
    limit: 20,
    page: 1,
    sortBy: 'name',
    sortOrder: 'asc',
    type: 'all',
  });

  // Transform Decimal to number for Client Component serialization
  const serializedData = {
    ...initialData,
    items: initialData.items.map((service) => ({
      ...service,
      rate: service.rate.toNumber(),
    })),
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-bold text-3xl tracking-tight">Servicios</h1>
          <p className="text-muted-foreground">
            Gestiona los servicios adicionales para cotizaciones (instalación, entrega, etc.)
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/services/new">
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Servicio
          </Link>
        </Button>
      </div>

      <Suspense fallback={<div>Cargando servicios...</div>}>
        <ServiceList initialData={serializedData} />
      </Suspense>
    </div>
  );
}
