/**
 * Edit Glass Solution Page (US6 - T050)
 *
 * Server Component that fetches GlassSolution data and renders the edit form.
 *
 * Route: /admin/glass-solutions/[id]
 * Access: Admin only (protected by middleware)
 */

import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { api } from '@/trpc/server-client';
import { GlassSolutionForm } from '../_components/glass-solution-form';

type EditGlassSolutionPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: EditGlassSolutionPageProps): Promise<Metadata> {
  const { id } = await params;
  const solution = await api.admin['glass-solution'].getById({ id });

  return {
    description: `Editar solución de cristal: ${solution?.name ?? 'No encontrada'}`,
    title: `Editar ${solution?.name ?? 'Solución'} | Admin`,
  };
}

export default async function EditGlassSolutionPage({ params }: EditGlassSolutionPageProps) {
  const { id } = await params;
  const solution = await api.admin['glass-solution'].getById({ id });

  if (!solution) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-bold text-3xl tracking-tight">Editar Solución de Vidrio</h1>
        <p className="text-muted-foreground">Actualiza la información de la solución: {solution.name}</p>
      </div>

      <GlassSolutionForm defaultValues={solution} mode="edit" />
    </div>
  );
}
