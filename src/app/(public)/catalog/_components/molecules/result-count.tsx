'use client';

import { getResultCountParts } from '@views/catalog/_utils/text-formatting.utils';
import { Separator } from '@/components/ui/separator';

type ResultCountProps = {
  totalResults?: number;
};

/**
 * ResultCount Component
 * Issue: #002-ui-ux-requirements
 *
 * Displays the count of filtered results with proper Spanish pluralization.
 *
 * SOLID Principles Applied:
 * - Single Responsibility: Only handles result count display (UI/presentation)
 * - Dependency Inversion: Depends on utility function, not implementation details
 *
 * Business logic extracted to:
 * - text-formatting.utils.ts (formatResultCount, getResultCountParts)
 */
export function ResultCount({ totalResults }: ResultCountProps) {
  if (totalResults === undefined) {
    return null;
  }

  const { count, hasResults } = getResultCountParts(totalResults);

  return (
    <>
      <Separator className="my-2" />
      <div className="text-muted-foreground text-sm">
        {!hasResults && <span>No se encontraron resultados</span>}
        {hasResults && totalResults === 1 && (
          <span>
            <strong className="font-medium text-foreground">{count}</strong> modelo encontrado
          </span>
        )}
        {hasResults && totalResults > 1 && (
          <span>
            <strong className="font-medium text-foreground">{count}</strong> modelos encontrados
          </span>
        )}
      </div>
    </>
  );
}
