'use client';

import { Filter, Search, SortAsc, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { QuoteSortOption, QuoteStatus } from '../_hooks/use-quote-filters';
import { useQuoteFilters } from '../_hooks/use-quote-filters';

/**
 * Status filter options with Spanish labels
 */
const STATUS_OPTIONS: Array<{ value: QuoteStatus | 'all'; label: string }> = [
  { label: 'Todas', value: 'all' },
  { label: 'En edición', value: 'draft' },
  { label: 'Enviada al cliente', value: 'sent' },
  { label: 'Cancelada', value: 'canceled' },
];

/**
 * Sort options with Spanish labels
 */
const SORT_OPTIONS: Array<{ value: QuoteSortOption; label: string }> = [
  { label: 'Más recientes', value: 'newest' },
  { label: 'Más antiguas', value: 'oldest' },
  { label: 'Mayor valor', value: 'price-high' },
  { label: 'Menor valor', value: 'price-low' },
];

/**
 * Quote Filters Component
 *
 * Provides filtering and sorting controls for the quotes list:
 * - Status filter dropdown (Todas, En edición, Enviada, Cancelada)
 * - Search input with debouncing (searches project name, address, item names)
 * - Sort dropdown (newest, oldest, price high/low)
 * - Clear filters button (shown when filters active)
 * - Active filters count badge
 *
 * Memory Leak Fix:
 * - Receives search params as props instead of calling useSearchParams()
 * - Prevents EventEmitter memory leak warning
 *
 * Features:
 * - URL synchronization via useQuoteFilters hook
 * - Debounced search (300ms)
 * - Keyboard accessible
 * - Loading states
 * - Responsive layout
 *
 * @example
 * ```tsx
 * <QuoteFilters
 *   currentStatus={status}
 *   currentSort={sortBy}
 *   currentSearchQuery={searchQuery}
 * />
 * ```
 */
export function QuoteFilters({
  currentStatus,
  currentSort,
  currentSearchQuery,
}: {
  currentStatus?: QuoteStatus;
  currentSort?: QuoteSortOption;
  currentSearchQuery?: string;
}) {
  const {
    filters,
    setStatus,
    setSearchQuery,
    setSortBy,
    clearFilters,
    activeFiltersCount,
    hasActiveFilters,
    isPending,
  } = useQuoteFilters({
    currentSearchQuery,
    currentSort,
    currentStatus,
  });

  /**
   * Handle status filter change
   */
  const handleStatusChange = (value: string) => {
    if (value === 'all') {
      setStatus(undefined);
    } else {
      setStatus(value as QuoteStatus);
    }
  };

  /**
   * Handle sort change
   */
  const handleSortChange = (value: string) => {
    setSortBy(value as QuoteSortOption);
  };

  /**
   * Handle search input change
   */
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  /**
   * Clear search input
   */
  const handleClearSearch = () => {
    setSearchQuery('');
  };

  return (
    <div className="space-y-4">
      {/* Filters Row */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Left Side: Status Filter + Search */}
        <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
          {/* Status Filter */}
          <div className="w-full sm:w-48">
            <Select disabled={isPending} onValueChange={handleStatusChange} value={filters.status ?? 'all'}>
              <SelectTrigger
                aria-label="Filtrar cotizaciones por estado"
                className="w-full"
                data-testid="status-filter"
              >
                <Filter className="mr-2 size-4" />
                <SelectValue placeholder="Filtrar por estado" />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="-translate-y-1/2 absolute top-1/2 left-3 size-4 text-muted-foreground" />
            <Input
              aria-label="Buscar cotizaciones por nombre de proyecto, dirección o items"
              className="pr-9 pl-9"
              data-testid="search-input"
              disabled={isPending}
              onChange={handleSearchChange}
              placeholder="Buscar por proyecto, dirección o items..."
              type="search"
              value={filters.searchQuery}
            />
            {filters.searchQuery && (
              <button
                aria-label="Limpiar búsqueda"
                className="-translate-y-1/2 absolute top-1/2 right-3 text-muted-foreground hover:text-foreground"
                data-testid="search-clear"
                onClick={handleClearSearch}
                type="button"
              >
                <X className="size-4" />
              </button>
            )}
          </div>
        </div>

        {/* Right Side: Sort Select */}
        <div className="w-full sm:w-48">
          <Select disabled={isPending} onValueChange={handleSortChange} value={filters.sortBy}>
            <SelectTrigger aria-label="Ordenar cotizaciones" className="w-full" data-testid="sort-select">
              <SortAsc className="mr-2 size-4" />
              <SelectValue placeholder="Ordenar por" />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Active Filters Bar */}
      {hasActiveFilters && (
        <div className="flex items-center justify-between rounded-md border bg-muted/50 p-3">
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground text-sm">Filtros activos:</span>
            <Badge data-testid="active-filters-count" variant="secondary">
              {activeFiltersCount}
            </Badge>
          </div>
          <Button data-testid="clear-filters" disabled={isPending} onClick={clearFilters} size="sm" variant="ghost">
            <X className="mr-2 size-4" />
            Limpiar filtros
          </Button>
        </div>
      )}

      {/* Loading State Indicator */}
      {isPending && (
        <div className="flex items-center justify-center py-2">
          <div className="text-muted-foreground text-sm">Aplicando filtros...</div>
        </div>
      )}
    </div>
  );
}
