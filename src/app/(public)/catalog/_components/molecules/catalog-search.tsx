'use client';

import { useDebouncedSearch } from '@views/catalog/_hooks/use-catalog';
import { Search, X } from 'lucide-react';
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from '@/components/ui/input-group';
import { Spinner } from '@/components/ui/spinner';

type CatalogSearchProps = {
  initialValue?: string;
};

/**
 * CatalogSearch - Presentational Component
 * Issue: #002-ui-ux-requirements
 *
 * Clean, minimalist search bar inspired by Saleor Storefront.
 *
 * Responsibilities (Single Responsibility Principle):
 * - Render search input UI
 * - Delegate logic to useDebouncedSearch hook
 *
 * Benefits:
 * - Easy to test (just props in/out)
 * - Easy to maintain (no complex logic)
 * - Reusable (logic extracted to hook)
 */
export function CatalogSearch({ initialValue = '' }: CatalogSearchProps) {
  const { query, isPending, handleSearchChange, handleClear } = useDebouncedSearch(initialValue);

  return (
    <div>
      <div className="relative max-w-xl">
        <InputGroup>
          <InputGroupInput
            className="h-11 border-foreground/20 pr-9 pl-10 transition-colors focus-visible:border-foreground/40 focus-visible:ring-0"
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Buscar productos..."
            type="text"
            value={query}
          />
          <InputGroupAddon>
            <Search className="size-4 text-foreground/40" />
          </InputGroupAddon>
          {query && !isPending && (
            <InputGroupAddon align="inline-end">
              <InputGroupButton className="size-8" onClick={handleClear} size="icon-sm" variant="ghost">
                <X className="size-4" />
                <span className="sr-only">Limpiar búsqueda</span>
              </InputGroupButton>
            </InputGroupAddon>
          )}
          {isPending && (
            <InputGroupAddon align="inline-end">
              <Spinner />
            </InputGroupAddon>
          )}
        </InputGroup>
      </div>
    </div>
  );
}
