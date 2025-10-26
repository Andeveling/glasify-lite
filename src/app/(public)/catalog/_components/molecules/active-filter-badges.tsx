'use client';

import { buildActiveParameters, type CatalogSortOption } from '@views/catalog/_utils/search-parameters.utils';
import { X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface ActiveSearchParametersProps {
  searchQuery: string;
  selectedProfileSupplierName: string | null;
  sortType: CatalogSortOption;
  onRemoveSearchAction?: () => void;
  onRemoveProfileSupplierAction?: () => void;
  onRemoveSortAction?: () => void;
  onClearAllAction?: () => void;
}

/**
 * ActiveSearchParameters Component
 * Issue: #002-ui-ux-requirements
 *
 * Displays ALL active search parameters as removable badges:
 * - Search query (q)
 * - Profile Supplier filter
 * - Sort order (when not default)
 *
 * Follows Single Responsibility Principle - only handles badge rendering.
 * Business logic delegated to pure utility functions for better testability.
 *
 * Architecture:
 * - Molecule component (composes Badge atoms)
 * - Presentation only - no business logic
 * - Fully accessible with ARIA labels
 * - Testable utilities in search-parameters.utils.ts
 */
export function ActiveSearchParameters({
  searchQuery,
  selectedProfileSupplierName,
  sortType,
  onRemoveSearchAction,
  onRemoveProfileSupplierAction,
  onRemoveSortAction,
  onClearAllAction,
}: ActiveSearchParametersProps) {
  // Build active parameters using pure function
  const activeParameters = buildActiveParameters({
    profileSupplierName: selectedProfileSupplierName,
    searchQuery,
    sortType,
  });

  // Map handlers to parameter keys
  const handlers: Record<string, (() => void) | undefined> = {
    profileSupplier: onRemoveProfileSupplierAction,
    search: onRemoveSearchAction,
    sort: onRemoveSortAction,
  };

  // Don't render if no active parameters
  if (activeParameters.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-muted-foreground text-xs">Parámetros de búsqueda:</span>

      {activeParameters.map((param) => {
        const Icon = param.icon;
        const handleRemove = handlers[param.key];

        return (
          <Badge className="gap-1.5 pr-1 pl-2" key={param.key} variant="secondary">
            <Icon className="size-3" />
            <span className="max-w-[200px] truncate">{param.label}</span>
            {handleRemove && (
              <button
                aria-label={param.ariaLabel}
                className="ml-0.5 rounded-full opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                onClick={handleRemove}
                type="button"
              >
                <X className="size-3" />
              </button>
            )}
          </Badge>
        );
      })}

      {/* Clear all button */}
      {onClearAllAction && (
        <Button
          aria-label="Limpiar todos los parámetros de búsqueda"
          className="h-6 gap-1 px-2 py-0 text-xs"
          onClick={onClearAllAction}
          variant="ghost"
        >
          <X className="size-3" />
          <span>Limpiar</span>
        </Button>
      )}
    </div>
  );
}
