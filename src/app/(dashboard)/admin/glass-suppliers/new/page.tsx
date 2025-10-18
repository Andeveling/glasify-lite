/**
 * New Glass Supplier Page (US5 - T039)
 *
 * Server Component wrapper for creating a new GlassSupplier.
 *
 * Route: /admin/glass-suppliers/new
 * Access: Admin only (protected by middleware)
 */

import type { Metadata } from 'next';

import { GlassSupplierForm } from '../_components/glass-supplier-form';

export const metadata: Metadata = {
  description: 'Crear nuevo proveedor de vidrio',
  title: 'Nuevo Proveedor de Vidrio | Admin',
};

export default function NewGlassSupplierPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-bold text-3xl tracking-tight">Nuevo Proveedor de Vidrio</h1>
        <p className="text-muted-foreground">Crea un nuevo fabricante de vidrio</p>
      </div>

      <GlassSupplierForm mode="create" />
    </div>
  );
}
