/**
 * Profile Suppliers List Page (US4 - T025)
 *
 * Server Component that fetches initial data and delegates
 * interactivity to ProfileSupplierList Client Component
 *
 * Route: /admin/profile-suppliers
 * Access: Admin only (protected by middleware)
 */

import type { Metadata } from 'next';
import { api } from '@/trpc/server-client';
import { ProfileSupplierList } from './_components/profile-supplier-list';

export const metadata: Metadata = {
  description: 'Administra los fabricantes de perfiles (ventanas y puertas)',
  title: 'Proveedores de Perfiles | Admin',
};

export default async function ProfileSuppliersPage() {
  // Fetch initial data server-side
  const initialData = await api.admin['profile-supplier'].list({
    limit: 20,
    page: 1,
    sortBy: 'name',
    sortOrder: 'asc',
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-bold text-3xl tracking-tight">Proveedores de Perfiles</h1>
        <p className="text-muted-foreground">Administra los fabricantes de perfiles para ventanas y puertas</p>
      </div>

      <ProfileSupplierList initialData={initialData} />
    </div>
  );
}
