/**
 * TableFilters Component
 *
 * Generic filter controls molecule for server-optimized tables.
 * Manages filter state via URL parameters for deep linking support.
 *
 * Features:
 * - Generic filter definitions
 * - URL-based filter state
 * - Select/Radio/Checkbox filters
 * - Clear all filters button
 * - Accessible (ARIA labels)
 * - Responsive design
 *
 * Usage:
 * ```tsx
 * <TableFilters
 *   filters={[
 *     {
 *       id: 'status',
 *       label: 'Estado',
 *       type: 'select',
 *       options: [
 *         { value: 'all', label: 'Todos' },
 *         { value: 'draft', label: 'Borrador' },
 *         { value: 'published', label: 'Publicado' },
 *       ],
 *     },
 *   ]}
 * />
 * ```
 *
 * @see REQ-001: Server-side filtering via URL params
 */

"use client";

import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useServerParams } from "@/hooks/use-server-params";

/**
 * Filter option definition
 */
export interface FilterOption {
  value: string;
  label: string;
}

/**
 * Filter definition
 */
export interface FilterDefinition {
  id: string;
  label: string;
  type: "select";
  options: FilterOption[];
  defaultValue?: string;
}

export interface TableFiltersProps {
  /** Filter definitions */
  filters: FilterDefinition[];

  /** Show clear all button */
  showClearAll?: boolean;
}

export function TableFilters({
  filters,
  showClearAll = true,
}: TableFiltersProps) {
  const { getParam, updateParams, getAllParams } = useServerParams();

  /**
   * Check if any filter is active (not default value)
   */
  const hasActiveFilters = filters.some((filter) => {
    const value = getParam(filter.id);
    const defaultValue = filter.defaultValue ?? "all";
    return value && value !== defaultValue;
  });

  /**
   * Handle filter change
   */
  const handleFilterChange = (filterId: string, value: string) => {
    const currentParams = getAllParams();
    const updates: Record<string, string | undefined> = { ...currentParams };

    // Treat 'all' as empty filter (remove the parameter)
    if (value && value !== "all") {
      updates[filterId] = value;
    } else {
      delete updates[filterId];
    }

    // Reset to page 1 on filter change
    updates.page = "1";
    updateParams(updates);
  }; /**
   * Clear all filters
   */
  const handleClearAll = () => {
    const updates: Record<string, string | undefined> = {};

    for (const filter of filters) {
      updates[filter.id] = undefined;
    }

    updates.page = "1";
    updateParams(updates);
  };

  return (
    <div className="flex flex-wrap items-end gap-4">
      {/* Render each filter */}
      {filters.map((filter) => {
        const value = getParam(filter.id) ?? filter.defaultValue ?? "all";

        return (
          <div className="min-w-[180px] space-y-2" key={filter.id}>
            <Label htmlFor={filter.id}>{filter.label}</Label>

            {filter.type === "select" && (
              <Select
                onValueChange={(val) => handleFilterChange(filter.id, val)}
                value={value}
              >
                <SelectTrigger id={filter.id}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {filter.options.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        );
      })}

      {/* Clear all button */}
      {showClearAll && hasActiveFilters && (
        <Button onClick={handleClearAll} size="sm" variant="outline">
          <X className="mr-2 size-4" />
          Limpiar filtros
        </Button>
      )}
    </div>
  );
}
