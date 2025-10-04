'use client';

import { ArrowDownAZ, ArrowDownZA, ArrowUpDown, Building2, Filter, SortAsc, SortDesc, X } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useCallback, useMemo } from 'react';
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
import ActiveSearchParameters from './active-filter-badges';
import { ResultCount } from './result-count';

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
 * Client component for filtering and sorting catalog items.
 * Refactored following SOLID principles:
 * - Single Responsibility: Only handles filter controls (selects)
 * - Open/Closed: Extensible through composition with subcomponents
 * - Dependency Inversion: Delegates to specialized components
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
  const router = useRouter();
  const pathname = usePathname();

  // Get manufacturer name for badge display
  const selectedManufacturerName = useMemo(() => {
    if (currentManufacturer === 'all') {
      return null;
    }
    return manufacturers.find((m) => m.id === currentManufacturer)?.name;
  }, [currentManufacturer, manufacturers]);

  // Utility to create query string following Next.js best practices
  // Build params from current state instead of using useSearchParams()
  const createQueryString = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams();

      // Preserve current parameters
      if (currentSearchQuery) {
        params.set('q', currentSearchQuery);
      }
      if (currentManufacturer && currentManufacturer !== 'all') {
        params.set('manufacturer', currentManufacturer);
      }
      if (currentSort && currentSort !== 'name-asc') {
        params.set('sort', currentSort);
      }

      // Apply updates
      for (const [key, value] of Object.entries(updates)) {
        if (value === null || value === '') {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      }

      return params.toString();
    },
    [currentSearchQuery, currentManufacturer, currentSort]
  );

  const handleManufacturerChange = useCallback(
    (value: string) => {
      const queryString = createQueryString({
        manufacturer: value === 'all' ? null : value,
        page: null, // Reset to page 1 when filtering
      });

      router.push(`${pathname}?${queryString}`);
    },
    [pathname, router, createQueryString]
  );

  const handleSortChange = useCallback(
    (value: string) => {
      const queryString = createQueryString({
        page: null, // Reset to page 1 when sorting
        sort: value,
      });

      router.push(`${pathname}?${queryString}`);
    },
    [pathname, router, createQueryString]
  );

  const handleRemoveManufacturer = useCallback(() => {
    handleManufacturerChange('all');
  }, [handleManufacturerChange]);

  const handleRemoveSort = useCallback(() => {
    handleSortChange('name-asc');
  }, [handleSortChange]);

  const handleRemoveSearch = useCallback(() => {
    const queryString = createQueryString({
      page: null, // Reset to page 1
      q: null, // Remove search query
    });

    router.push(`${pathname}?${queryString}`);
  }, [pathname, router, createQueryString]);

  const handleClearFilters = useCallback(() => {
    router.push(pathname);
  }, [pathname, router]);

  const hasActiveParameters =
    currentManufacturer !== 'all' || currentSort !== 'name-asc' || Boolean(currentSearchQuery);

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
          sortType={currentSort}
        />
      )}

      {/* Results count */}
      {showResultCount && <ResultCount totalResults={totalResults} />}
    </div>
  );
}
