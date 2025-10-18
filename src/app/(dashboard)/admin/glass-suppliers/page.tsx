/**
 * Glass Suppliers List Page (US5 - T036)
 *
 * Server Component that fetches initial data and delegates
 * interactivity to GlassSupplierList Client Component
 *
 * Route: /admin/glass-suppliers
 * Access: Admin only (protected by middleware)
 */

import type { Metadata } from 'next';
import { api } from '@/trpc/server-client';
import { GlassSupplierList } from './_components/glass-supplier-list';

export const metadata: Metadata = {
  description: 'Administra los fabricantes de vidrio',
  title: 'Proveedores de Vidrio | Admin',
};

export default async function GlassSuppliersPage() {
  // Fetch initial data server-side
  const initialData = await api.admin['glass-supplier'].list({
    limit: 20,
    page: 1,
    sortBy: 'name',
    sortOrder: 'asc',
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-bold text-3xl tracking-tight">Proveedores de Vidrio</h1>
        <p className="text-muted-foreground">Administra los fabricantes de vidrio y sus productos</p>
      </div>

      <GlassSupplierList initialData={initialData} />
    </div>
  );
}
