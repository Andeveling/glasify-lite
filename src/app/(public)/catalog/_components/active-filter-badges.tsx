'use client';

import { ArrowDownAZ, ArrowDownZA, Building2, Search, SortAsc, SortDesc, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

type SearchParameter = {
  key: string;
  icon: React.ElementType;
  label: string;
  onRemove: () => void;
  ariaLabel: string;
};

type ActiveSearchParametersProps = {
  searchQuery?: string | null;
  selectedManufacturerName?: string | null;
  sortType?: string | null;
  onRemoveSearch?: () => void;
  onRemoveManufacturer?: () => void;
  onRemoveSort?: () => void;
};

/**
 * ActiveSearchParameters Component (formerly ActiveFilterBadges)
 * Issue: #002-ui-ux-requirements
 *
 * Displays ALL active search parameters as removable badges:
 * - Search query (q)
 * - Manufacturer filter
 * - Sort order (when not default)
 *
 * Renamed from "Filtros activos" to "Parámetros de búsqueda"
 * to accurately represent all search state, not just filters.
 *
 * Follows Single Responsibility Principle - only handles badge display.
 * Reusable and composable with other catalog components.
 */
export default function ActiveSearchParameters({
  searchQuery,
  selectedManufacturerName,
  sortType,
  onRemoveSearch,
  onRemoveManufacturer,
  onRemoveSort,
}: ActiveSearchParametersProps) {
  // Build array of active parameters
  const activeParameters: SearchParameter[] = [];

  const noop = () => {
    // Intentionally empty - fallback for optional handlers
  };

  // Search query parameter
  if (searchQuery) {
    activeParameters.push({
      ariaLabel: `Quitar búsqueda: ${searchQuery}`,
      icon: Search,
      key: 'search',
      label: searchQuery,
      onRemove: onRemoveSearch ?? noop,
    });
  }

  // Manufacturer filter parameter
  if (selectedManufacturerName) {
    activeParameters.push({
      ariaLabel: `Quitar filtro de ${selectedManufacturerName}`,
      icon: Building2,
      key: 'manufacturer',
      label: selectedManufacturerName,
      onRemove: onRemoveManufacturer ?? noop,
    });
  }

  // Sort parameter (only show if not default)
  if (sortType && sortType !== 'name-asc') {
    const sortLabels: Record<string, { icon: React.ElementType; label: string }> = {
      'name-asc': { icon: ArrowDownAZ, label: 'A-Z' },
      'name-desc': { icon: ArrowDownZA, label: 'Z-A' },
      'price-asc': { icon: SortAsc, label: 'Precio ↑' },
      'price-desc': { icon: SortDesc, label: 'Precio ↓' },
    };

    const sortConfig = sortLabels[sortType];
    if (sortConfig) {
      activeParameters.push({
        ariaLabel: `Quitar ordenamiento: ${sortConfig.label}`,
        icon: sortConfig.icon,
        key: 'sort',
        label: sortConfig.label,
        onRemove: onRemoveSort ?? noop,
      });
    }
  }

  // Don't render if no active parameters
  if (activeParameters.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-muted-foreground text-xs">Parámetros de búsqueda:</span>

      {activeParameters.map((param) => {
        const Icon = param.icon;
        return (
          <Badge className="gap-1.5 pr-1 pl-2" key={param.key} variant="secondary">
            <Icon className="size-3" />
            <span className="max-w-[200px] truncate">{param.label}</span>
            <button
              aria-label={param.ariaLabel}
              className="ml-0.5 rounded-full opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              onClick={param.onRemove}
              type="button"
            >
              <X className="size-3" />
            </button>
          </Badge>
        );
      })}
    </div>
  );
}
