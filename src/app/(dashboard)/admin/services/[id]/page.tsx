/**
 * Edit Service Page (US10 - T098)
 *
 * Server Component that fetches service data and renders the edit form
 *
 * Route: /admin/services/[id]
 */

import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { api } from '@/trpc/server-client';
import { ServiceForm } from '../_components/service-form';

type EditServicePageProps = {
  params: Promise<{
    id: string;
  }>;
};

export const metadata: Metadata = {
  title: 'Editar Servicio | Admin',
};

export default async function EditServicePage({ params }: EditServicePageProps) {
  const { id } = await params;

  // Fetch service
  const service = await api.admin.service.getById({ id });

  if (!service) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-bold text-3xl tracking-tight">Editar Servicio</h1>
        <p className="text-muted-foreground">
          Edita el servicio <span className="font-medium">{service.name}</span>
        </p>
      </div>

      <ServiceForm defaultValues={service} mode="edit" />
    </div>
  );
}
