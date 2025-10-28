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
import { FileText, Search } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

export type EmptyQuotesStateProps = {
  /**
   * Variant to display:
   * - 'no-quotes': User has no quotes yet
   * - 'no-results': Filters returned no results
   */
  variant?: "no-quotes" | "no-results";

  /**
   * Callback to clear filters (required for 'no-results' variant)
   */
  onClearFilters?: () => void;
};

export function EmptyQuotesState({
  variant = "no-quotes",
  onClearFilters,
}: EmptyQuotesStateProps) {
  if (variant === "no-results") {
    return (
      <Empty data-testid="empty-filtered-state">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Search />
          </EmptyMedia>
          <EmptyTitle>No se encontraron cotizaciones</EmptyTitle>
          <EmptyDescription>
            No hay cotizaciones que coincidan con los filtros aplicados.
            <br />
            Intenta ajustar los filtros o eliminarlos para ver más resultados.
          </EmptyDescription>
        </EmptyHeader>
        {onClearFilters && (
          <EmptyContent>
            <Button onClick={onClearFilters} variant="outline">
              Limpiar filtros
            </Button>
          </EmptyContent>
        )}
      </Empty>
    );
  }

  return (
    <Empty data-testid="empty-quotes-state">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <FileText className="size-12" />
        </EmptyMedia>
        <EmptyTitle>No tienes cotizaciones aún</EmptyTitle>
        <EmptyDescription>
          Explora nuestro catálogo y configura ventanas para generar tu primera
          cotización
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button asChild>
          <Link href="/catalog">Ir al catálogo</Link>
        </Button>
      </EmptyContent>
    </Empty>
  );
}
