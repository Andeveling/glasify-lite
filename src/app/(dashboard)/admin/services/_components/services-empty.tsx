/**
 * Services Empty State Component
 *
 * Displays when no services are found matching the filters
 * Follows "Don't Make Me Think": Clear, contextual message
 *
 * Usage: Shows when services.length === 0
 */

'use client';

import { Package } from 'lucide-react';
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty';

type ServicesEmptyProps = {
  hasFilters?: boolean;
};

export function ServicesEmpty({ hasFilters = false }: ServicesEmptyProps) {
  return (
    <Empty className="border-0 bg-transparent">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Package className="h-6 w-6 text-muted-foreground" />
        </EmptyMedia>
        <div>
          <EmptyTitle>{hasFilters ? 'Sin resultados' : 'Sin servicios'}</EmptyTitle>
          <EmptyDescription>
            {hasFilters
              ? 'No hay servicios que coincidan con los filtros aplicados. Intenta ajustar la búsqueda.'
              : 'Aún no hay servicios registrados. Crea uno para comenzar.'}
          </EmptyDescription>
        </div>
      </EmptyHeader>
    </Empty>
  );
}
