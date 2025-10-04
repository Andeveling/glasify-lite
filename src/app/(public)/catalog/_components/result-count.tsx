'use client';

import { Separator } from '@/components/ui/separator';

type ResultCountProps = {
  totalResults?: number;
};

/**
 * ResultCount Component
 * Issue: #002-ui-ux-requirements
 *
 * Displays the count of filtered results with proper Spanish pluralization.
 * Follows Single Responsibility Principle - only handles result count display.
 */
export function ResultCount({ totalResults }: ResultCountProps) {
  if (totalResults === undefined) {
    return null;
  }

  return (
    <>
      <Separator className="my-2" />
      <div className="text-muted-foreground text-sm">
        {totalResults === 0 && <span>No se encontraron resultados</span>}
        {totalResults === 1 && (
          <span>
            <strong className="font-medium text-foreground">1</strong> modelo encontrado
          </span>
        )}
        {totalResults > 1 && (
          <span>
            <strong className="font-medium text-foreground">{totalResults}</strong> modelos encontrados
          </span>
        )}
      </div>
    </>
  );
}
