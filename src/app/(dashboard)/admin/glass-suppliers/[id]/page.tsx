/**
 * Edit Glass Supplier Page (US5 - T040)
 *
 * Server Component that fetches GlassSupplier data and renders the edit form.
 *
 * Route: /admin/glass-suppliers/[id]
 * Access: Admin only (protected by middleware)
 */

import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { api } from '@/trpc/server-client';
import { GlassSupplierForm } from '../_components/glass-supplier-form';

type EditGlassSupplierPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: EditGlassSupplierPageProps): Promise<Metadata> {
  const { id } = await params;
  const supplier = await api.admin['glass-supplier'].getById({ id });

  return {
    description: `Editar proveedor de vidrio: ${supplier?.name ?? 'No encontrado'}`,
    title: `Editar ${supplier?.name ?? 'Proveedor'} | Admin`,
  };
}

export default async function EditGlassSupplierPage({ params }: EditGlassSupplierPageProps) {
  const { id } = await params;
  const supplier = await api.admin['glass-supplier'].getById({ id });

  if (!supplier) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-bold text-3xl tracking-tight">Editar Proveedor de Vidrio</h1>
        <p className="text-muted-foreground">Actualiza la información del proveedor: {supplier.name}</p>
      </div>

      <GlassSupplierForm defaultValues={supplier} mode="edit" />
    </div>
  );
}
