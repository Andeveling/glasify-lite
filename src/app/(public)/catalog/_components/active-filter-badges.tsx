'use client';

import { Building2, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

type ActiveFilterBadgesProps = {
  selectedManufacturerName?: string | null;
  onRemoveManufacturer?: () => void;
};

/**
 * ActiveFilterBadges Component
 * Issue: #002-ui-ux-requirements
 *
 * Displays active filter badges with individual removal actions.
 * Follows Single Responsibility Principle - only handles badge display.
 * Reusable and composable with other filter components.
 */
export default function ActiveFilterBadges({
  selectedManufacturerName,
  onRemoveManufacturer,
}: ActiveFilterBadgesProps) {
  const hasActiveFilters = Boolean(selectedManufacturerName);

  if (!hasActiveFilters) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-muted-foreground text-xs">Filtros activos:</span>

      {/* Manufacturer badge */}
      {selectedManufacturerName && (
        <Badge className="gap-1.5 pr-1 pl-2" variant="secondary">
          <Building2 className="size-3" />
          <span>{selectedManufacturerName}</span>
          <button
            aria-label={`Quitar filtro de ${selectedManufacturerName}`}
            className="ml-0.5 rounded-full opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            onClick={onRemoveManufacturer}
            type="button"
          >
            <X className="size-3" />
          </button>
        </Badge>
      )}
    </div>
  );
}
