'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';

type CatalogEmptyProps = {
  hasActiveFilters: boolean;
};

/**
 * Catalog Empty State Component
 * Issue: #002-ui-ux-requirements
 *
 * Displays empty state when no models are found.
 * Shows different messages based on whether filters are active.
 */
export function CatalogEmpty({ hasActiveFilters }: CatalogEmptyProps) {
  return (
    <div className="py-12 text-center">
      <div className="mx-auto mb-4 size-16 opacity-50">
        <svg
          aria-labelledby="no-results-icon"
          className="size-full text-muted-foreground"
          fill="none"
          role="img"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <title id="no-results-icon">Sin resultados</title>
          <path
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
          />
        </svg>
      </div>
      <h3 className="mb-2 font-medium text-foreground text-lg">No se encontraron modelos</h3>
      <p className="mx-auto mb-6 max-w-md text-muted-foreground">
        {hasActiveFilters
          ? 'Intente ajustar los filtros de búsqueda para encontrar modelos que coincidan con sus criterios.'
          : 'No hay modelos disponibles en el catálogo en este momento.'}
      </p>
      {hasActiveFilters && (
        <Button asChild variant="outline">
          <Link href="/catalog">Limpiar filtros</Link>
        </Button>
      )}
    </div>
  );
}
