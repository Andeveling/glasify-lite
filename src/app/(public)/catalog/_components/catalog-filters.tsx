'use client';

import { ArrowDownAZ, ArrowDownZA, ArrowUpDown, Building2, Filter, SortAsc, SortDesc, X } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
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
import ActiveFilterBadges from './active-filter-badges';
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
 * - ActiveFilterBadges: Displays active filter badges
 * - ResultCount: Displays result count
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
}: CatalogFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentManufacturer = searchParams.get('manufacturer') ?? 'all';
  const currentSort = searchParams.get('sort') ?? 'name-asc';

  // Get manufacturer name for badge display
  const selectedManufacturerName = useMemo(() => {
    if (currentManufacturer === 'all') {
      return null;
    }
    return manufacturers.find((m) => m.id === currentManufacturer)?.name;
  }, [currentManufacturer, manufacturers]);

  // Utility to create query string following Next.js best practices
  const createQueryString = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams?.toString());

      for (const [key, value] of Object.entries(updates)) {
        if (value === null || value === '') {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      }

      return params.toString();
    },
    [searchParams]
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

  const handleClearFilters = useCallback(() => {
    router.push(pathname);
  }, [pathname, router]);

  const hasActiveFilters = currentManufacturer !== 'all' || currentSort !== 'name-asc';

  return (
    <div className="mb-4 space-y-4">
      {/* Filter Controls */}
      {showControls && (
        <div className="flex flex-wrap items-center justify-end gap-3">
          {/* Clear all filters button */}
          {hasActiveFilters && (
            <Button
              aria-label="Limpiar todos los filtros"
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

      {/* Active Filters - Badges Section */}
      {showBadges && (
        <ActiveFilterBadges
          onRemoveManufacturer={handleRemoveManufacturer}
          selectedManufacturerName={selectedManufacturerName}
        />
      )}

      {/* Results count */}
      {showResultCount && <ResultCount totalResults={totalResults} />}
    </div>
  );
}
