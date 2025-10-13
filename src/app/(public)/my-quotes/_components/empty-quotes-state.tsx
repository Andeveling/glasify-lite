/**
 * EmptyQuotesState Component
 *
 * Displays a message when the user has no quotes or when filters return no results.
 * Supports two variants:
 * - 'no-quotes': User has no quotes yet (shows catalog link)
 * - 'no-results': Filters returned no results (shows clear filters button)
 *
 * @example
 * ```tsx
 * // No quotes at all
 * <EmptyQuotesState variant="no-quotes" />
 *
 * // No results from filters
 * <EmptyQuotesState variant="no-results" onClearFilters={() => clearFilters()} />
 * ```
 */

import { FileText, Search } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export interface EmptyQuotesStateProps {
  /**
   * Variant to display:
   * - 'no-quotes': User has no quotes yet
   * - 'no-results': Filters returned no results
   */
  variant?: 'no-quotes' | 'no-results';

  /**
   * Callback to clear filters (required for 'no-results' variant)
   */
  onClearFilters?: () => void;
}

export function EmptyQuotesState({ variant = 'no-quotes', onClearFilters }: EmptyQuotesStateProps) {
  if (variant === 'no-results') {
    return (
      <Card data-testid="empty-filtered-state">
        <CardContent className="flex flex-col items-center justify-center gap-4 py-16">
          <Search className="h-16 w-16 text-muted-foreground" />
          <div className="text-center">
            <h3 className="mb-2 font-semibold text-lg">No se encontraron cotizaciones</h3>
            <p className="text-muted-foreground">
              No hay cotizaciones que coincidan con los filtros aplicados.
              <br />
              Intenta ajustar los filtros o eliminarlos para ver más resultados.
            </p>
          </div>
          {onClearFilters && (
            <Button onClick={onClearFilters} variant="outline">
              Limpiar filtros
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card data-testid="empty-quotes-state">
      <CardContent className="flex flex-col items-center justify-center gap-4 py-16">
        <FileText className="h-16 w-16 text-muted-foreground" />
        <div className="text-center">
          <h3 className="mb-2 font-semibold text-lg">No tienes cotizaciones aún</h3>
          <p className="text-muted-foreground">
            Explora nuestro catálogo y configura ventanas para generar tu primera cotización
          </p>
        </div>
        <Button asChild>
          <Link href="/catalog">Ir al catálogo</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
