'use client';

import ActiveSearchParameters from '@views/catalog/_components/molecules/active-filter-badges';
import { ResultCount } from '@views/catalog/_components/molecules/result-count';
import { useCatalogFilters } from '@views/catalog/_hooks/use-catalog';
import type { CatalogSortOption } from '@views/catalog/_utils/search-parameters.utils';
import { ArrowDownAZ, ArrowDownZA, ArrowUpDown, Building2, Filter, SortAsc, SortDesc, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type CatalogFiltersProps = {
  manufacturers?: Array<{
    id: string;
    name: string;
  }>;
  totalResults?: number;
  showControls?: boolean;
  showBadges?: boolean;
  showResultCount?: boolean;
  // Receive current search params as props to avoid multiple useSearchParams() calls
  currentManufacturer?: string;
  currentSort?: string;
  currentSearchQuery?: string;
};

/**
 * Catalog Filters Component
 * Issue: #002-ui-ux-requirements
 *
 * Presentational component for filtering and sorting catalog items.
 * Refactored following SOLID principles:
 * - Single Responsibility: Only handles UI rendering and event delegation
 * - Open/Closed: Extensible through composition with subcomponents
 * - Dependency Inversion: Delegates all logic to useCatalogFilters hook
 *
 * Composition with:
 * - ActiveSearchParameters: Displays ALL search parameters (q, sort, filters)
 * - ResultCount: Displays result count
 *
 * Memory Leak Fix:
 * - Receives searchParams as props instead of calling useSearchParams()
 * - Prevents EventEmitter memory leak warning
 *
 * Following UX best practices from Lollypop Design:
 * - Icon-first minimalist design
 * - Clear filter state visibility
 * - URL-based state management with query params
 * - Type-safe navigation with Next.js hooks
 */
export function CatalogFilters({
  manufacturers = [],
  totalResults,
  showControls = true,
  showBadges = true,
  showResultCount = true,
  currentManufacturer = 'all',
  currentSort = 'name-asc',
  currentSearchQuery,
}: CatalogFiltersProps) {
  // Delegate all logic to custom hook (SRP - Single Responsibility)
  const {
    handleClearFilters,
    handleManufacturerChange,
    handleRemoveManufacturer,
    handleRemoveSearch,
    handleRemoveSort,
    handleSortChange,
    hasActiveParameters,
    selectedManufacturerName,
  } = useCatalogFilters(
    {
      currentManufacturer,
      currentSearchQuery,
      currentSort,
    },
    manufacturers
  );

  return (
    <div className="mb-4 space-y-4">
      {/* Filter Controls */}
      {showControls && (
        <div className="flex flex-wrap items-center justify-end gap-3">
          {/* Clear all parameters button */}
          {hasActiveParameters && (
            <Button
              aria-label="Limpiar todos los parámetros de búsqueda"
              className="gap-2"
              onClick={handleClearFilters}
              size="icon"
              variant="ghost"
            >
              <X className="size-4" />
              <span className="sr-only hidden lg:not-sr-only">Limpiar</span>
            </Button>
          )}
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <Filter className="size-4" />
            <span className="sr-only hidden md:not-sr-only">Filtros</span>
          </div>

          {/* Manufacturer filter */}
          {manufacturers.length > 0 && (
            <Select onValueChange={handleManufacturerChange} value={currentManufacturer}>
              <SelectTrigger className="w-[160px] gap-2 md:w-[180px]">
                <Building2 className="size-4 opacity-70" />
                <SelectValue placeholder="Fabricante" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Fabricante</SelectLabel>
                  <SelectItem value="all">Todos</SelectItem>
                  {manufacturers.map((manufacturer) => (
                    <SelectItem key={manufacturer.id} value={manufacturer.id}>
                      {manufacturer.name}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          )}

          {/* Sort filter */}
          <Select onValueChange={handleSortChange} value={currentSort}>
            <SelectTrigger className="w-[160px] gap-2 md:w-[180px]">
              <ArrowUpDown className="size-4 opacity-70" />
              <SelectValue placeholder="Ordenar" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Ordenar por</SelectLabel>
                <SelectItem value="name-asc">
                  <div className="flex items-center gap-2">
                    <ArrowDownAZ className="size-4 opacity-70" />
                    Nombre (A-Z)
                  </div>
                </SelectItem>
                <SelectItem value="name-desc">
                  <div className="flex items-center gap-2">
                    <ArrowDownZA className="size-4 opacity-70" />
                    Nombre (Z-A)
                  </div>
                </SelectItem>
                <SelectItem value="price-asc">
                  <div className="flex items-center gap-2">
                    <SortAsc className="size-4 opacity-70" />
                    Precio (menor)
                  </div>
                </SelectItem>
                <SelectItem value="price-desc">
                  <div className="flex items-center gap-2">
                    <SortDesc className="size-4 opacity-70" />
                    Precio (mayor)
                  </div>
                </SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Active Search Parameters - Badges Section */}
      {showBadges && (
        <ActiveSearchParameters
          onRemoveManufacturer={handleRemoveManufacturer}
          onRemoveSearch={handleRemoveSearch}
          onRemoveSort={handleRemoveSort}
          searchQuery={currentSearchQuery}
          selectedManufacturerName={selectedManufacturerName}
          sortType={currentSort as CatalogSortOption}
        />
      )}

      {/* Results count */}
      {showResultCount && <ResultCount totalResults={totalResults} />}
    </div>
  );
}
