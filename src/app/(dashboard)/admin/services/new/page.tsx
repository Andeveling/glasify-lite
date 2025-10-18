/**
 * Create Service Page (US10 - T097)
 *
 * Server Component that renders the form for creating a new service
 *
 * Route: /admin/services/new
 */

import type { Metadata } from 'next';
import { ServiceForm } from '../_components/service-form';

export const metadata: Metadata = {
  title: 'Crear Servicio | Admin',
};

export default function NewServicePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-bold text-3xl tracking-tight">Crear Servicio</h1>
        <p className="text-muted-foreground">Crea un nuevo servicio adicional para cotizaciones</p>
      </div>

      <ServiceForm mode="create" />
    </div>
  );
}
