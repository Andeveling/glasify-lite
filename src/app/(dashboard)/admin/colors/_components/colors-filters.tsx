/**
 * Colors Filters Component
 *
 * Filter controls for Colors admin table.
 * Extracted outside Suspense to prevent disappearing during loading.
 * Consolidated filter block - single source of truth.
 *
 * Features:
 * - Search input with debounce (300ms)
 * - Active status filter (all, active, inactive)
 * - Create button (navigates to new color page)
 * - Always visible during table loading
 *
 * Architecture:
 * - Client Component for interactivity
 * - URL-based state management via TableSearch and TableFilters
 * - Receives filters from server (passed as props)
 * - onCreateClick callback to parent for navigation
 */

"use client";

import { Plus } from "lucide-react";
import {
  type FilterDefinition,
  TableFilters,
} from "@/app/_components/server-table/table-filters";
import { TableSearch } from "@/app/_components/server-table/table-search";
import { Button } from "@/components/ui/button";

type ColorsFiltersProps = {
  searchParams: {
    isActive?: string;
    page?: string;
    search?: string;
  };
  onCreateClickAction?: () => void;
};

export function ColorsFilters({
  searchParams,
  onCreateClickAction,
}: ColorsFiltersProps) {
  /**
   * Filter definitions
   * Consistent with "Don't Make Me Think" principle:
   * - Clear labels in Spanish
   * - Logical grouping
   * - Sensible defaults
   */
  const filters: FilterDefinition[] = [
    {
      defaultValue: "all",
      id: "isActive",
      label: "Estado",
      options: [
        { label: "Todos", value: "all" },
        { label: "Activo", value: "active" },
        { label: "Inactivo", value: "inactive" },
      ],
      type: "select",
    },
  ];

  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      {/* Search - max width to prevent huge inputs */}
      <div className="max-w-sm flex-1">
        <TableSearch
          defaultValue={searchParams.search}
          placeholder="Buscar por nombre o código..."
        />
      </div>

      {/* Filters - reusable component that syncs with URL */}
      <TableFilters filters={filters} />

      {/* Create button - always visible, clear action */}
      <Button onClick={onCreateClickAction}>
        <Plus className="mr-2 size-4" />
        Nuevo Color
      </Button>
    </div>
  );
}
