/**
 * Glass Types Empty State Component
 *
 * Displays when no glass types are found matching the filters
 * Follows "Don't Make Me Think": Clear, contextual message with CTA
 *
 * Usage: Shows when glassTypes.length === 0
 */

'use client';

import { Wine } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty';

type GlassTypesEmptyProps = {
  hasFilters?: boolean;
};

export function GlassTypesEmpty({ hasFilters = false }: GlassTypesEmptyProps) {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Wine className="size-6" />
        </EmptyMedia>
        <EmptyTitle>{hasFilters ? 'Sin resultados' : 'Sin tipos de cristal'}</EmptyTitle>
        <EmptyDescription>
          {hasFilters
            ? 'No hay tipos de cristal que coincidan con los filtros aplicados. Intenta ajustar la búsqueda.'
            : 'No se encontraron tipos de cristal. Crea uno nuevo para comenzar.'}
        </EmptyDescription>
      </EmptyHeader>
      {!hasFilters && (
        <EmptyContent>
          <Button asChild>
            <Link href="/admin/glass-types/new">Crear tipo de cristal</Link>
          </Button>
        </EmptyContent>
      )}
    </Empty>
  );
}
