/**
 * Services Filters Component
 *
 * Filter controls for Services admin table.
 * Extracted outside Suspense to prevent disappearing during loading.
 * Consolidated filter block - single source of truth.
 *
 * Features:
 * - Search input with debounce (300ms)
 * - Type filter (area, perimeter, fixed)
 * - Active status filter (all, active, inactive)
 * - Create button (opens modal)
 * - Always visible during table loading
 *
 * Architecture:
 * - Client Component for interactivity
 * - URL-based state management via useServerFilters hook
 * - Receives filters from server (passed as props)
 * - onCreateClick callback to parent for modal control
 */

'use client';

import { Plus } from 'lucide-react';
import { type FilterDefinition, TableFilters } from '@/app/_components/server-table/table-filters';
import { TableSearch } from '@/app/_components/server-table/table-search';
import { Button } from '@/components/ui/button';

type ServicesFiltersProps = {
  searchParams: {
    isActive?: string;
    page?: string;
    search?: string;
    type?: string;
  };
  onCreateClick?: () => void;
};

export function ServicesFilters({ searchParams, onCreateClick }: ServicesFiltersProps) {
  /**
   * Filter definitions
   * Consistent with "Don't Make Me Think" principle:
   * - Clear labels in Spanish
   * - Logical grouping
   * - Sensible defaults
   */
  const filters: FilterDefinition[] = [
    {
      defaultValue: 'all',
      id: 'type',
      label: 'Tipo',
      options: [
        { label: 'Todos', value: 'all' },
        { label: 'Área (m²)', value: 'area' },
        { label: 'Perímetro (ml)', value: 'perimeter' },
        { label: 'Fijo (unidad)', value: 'fixed' },
      ],
      type: 'select',
    },
    {
      defaultValue: 'all',
      id: 'isActive',
      label: 'Estado',
      options: [
        { label: 'Todos', value: 'all' },
        { label: 'Activo', value: 'active' },
        { label: 'Inactivo', value: 'inactive' },
      ],
      type: 'select',
    },
  ];

  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      {/* Search - max width to prevent huge inputs */}
      <div className="max-w-sm flex-1">
        <TableSearch defaultValue={searchParams.search} placeholder="Buscar por nombre..." />
      </div>

      {/* Filters - reusable component that syncs with URL */}
      <TableFilters filters={filters} />

      {/* Create button - always visible, clear action */}
      <Button onClick={onCreateClick}>
        <Plus className="mr-2 size-4" />
        Nuevo Servicio
      </Button>
    </div>
  );
}
