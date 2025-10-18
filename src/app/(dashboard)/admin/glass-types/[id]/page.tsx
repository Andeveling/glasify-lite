/**
 * Edit Glass Type Page (US8 - T073)
 *
 * Server Component that fetches GlassType data with full relations and renders the edit form.
 *
 * Route: /admin/glass-types/[id]
 * Access: Admin only (protected by middleware)
 */

import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { api } from '@/trpc/server-client';
import { GlassTypeForm } from '../_components/glass-type-form';

type EditGlassTypePageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: EditGlassTypePageProps): Promise<Metadata> {
  const { id } = await params;
  const glassType = await api.admin['glass-type'].getById({ id });

  return {
    description: `Editar tipo de vidrio: ${glassType?.name ?? 'No encontrado'}`,
    title: `Editar ${glassType?.name ?? 'Tipo de Vidrio'} | Admin`,
  };
}

export default async function EditGlassTypePage({ params }: EditGlassTypePageProps) {
  const { id } = await params;
  const glassType = await api.admin['glass-type'].getById({ id });

  if (!glassType) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="font-bold text-3xl tracking-tight">Editar Tipo de Vidrio</h1>
        <p className="text-muted-foreground">Actualiza la información del tipo de vidrio: {glassType.name}</p>
      </div>

      <GlassTypeForm defaultValues={glassType} mode="edit" />
    </div>
  );
}
