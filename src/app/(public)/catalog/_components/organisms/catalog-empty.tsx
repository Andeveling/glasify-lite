import { SearchX } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty';

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
    <Empty>
      <EmptyHeader>
        <EmptyMedia>
          <SearchX className="size-12" />
        </EmptyMedia>
        <EmptyTitle>No se encontraron modelos</EmptyTitle>
        <EmptyDescription>
          {hasActiveFilters
            ? 'Intente ajustar los filtros de búsqueda para encontrar modelos que coincidan con sus criterios.'
            : 'No hay modelos disponibles en el catálogo en este momento.'}
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        {hasActiveFilters && (
          <Button asChild variant="outline">
            <Link href="/catalog">Limpiar filtros</Link>
          </Button>
        )}
      </EmptyContent>
    </Empty>
  );
}
