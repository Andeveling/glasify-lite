/**
 * Models Empty State Component
 *
 * Displays when no models are found matching the filters
 * Follows "Don't Make Me Think": Clear, contextual message with CTA
 *
 * Usage: Shows when models.length === 0
 */

'use client';

import { Plus } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty';

type ModelsEmptyProps = {
  hasFilters?: boolean;
};

export function ModelsEmpty({ hasFilters = false }: ModelsEmptyProps) {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Plus className="size-6" />
        </EmptyMedia>
        <EmptyTitle>{hasFilters ? 'Sin resultados' : 'No hay modelos'}</EmptyTitle>
        <EmptyDescription>
          {hasFilters
            ? 'No hay modelos que coincidan con los filtros aplicados. Intenta ajustar la búsqueda.'
            : 'Comienza creando tu primer modelo de ventana o marco.'}
        </EmptyDescription>
      </EmptyHeader>
      {!hasFilters && (
        <EmptyContent>
          <Button asChild>
            <Link href="/admin/models/new">Crear modelo</Link>
          </Button>
        </EmptyContent>
      )}
    </Empty>
  );
}
