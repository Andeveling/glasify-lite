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
import { Skeleton } from '@/components/ui/skeleton';
import { api } from '@/trpc/server-client';
import { GlassTypeForm } from '../_components/glass-type-form';

type EditGlassTypePageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: EditGlassTypePageProps): Promise<Metadata> {
  const { id } = await params;
  const glassType = await api.admin[ 'glass-type' ].getById({ id });

  return {
    description: `Editar tipo de vidrio: ${glassType?.name ?? 'No encontrado'}`,
    title: `Editar ${glassType?.name ?? 'Tipo de Vidrio'} | Admin`,
  };
}

export default async function EditGlassTypePage({ params }: EditGlassTypePageProps) {
  const { id } = await params;
  const glassType = await api.admin[ 'glass-type' ].getById({ id });

  if (!glassType) {
    notFound();
  }

  return (
    <div className="flex h-full flex-col gap-6 overflow-hidden p-0">
      <div className="space-y-2">
        <h1 className="font-bold text-3xl tracking-tight">Editar Tipo de Vidrio</h1>
        <p className="text-muted-foreground">Actualiza la información del tipo de vidrio: {glassType.name}</p>
      </div>
      <div className="flex flex-1 gap-4 overflow-hidden rounded-lg">
        {/* Formulario - Ocupa espacio flexible */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-0">
            <GlassTypeForm defaultValues={glassType} mode="edit" />
          </div>
        </div>
        {/* Preview - Ancho fijo mínimo o flexible en pantallas grandes */}
        <div className="hidden w-full flex-1 lg:block">
          <Skeleton className="h-full w-full" />
        </div>
      </div>
    </div>
  );
}
