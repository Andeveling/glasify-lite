/**
 * GlassTypesFilters Component
 *
 * Filter controls for Glass Types admin table.
 * Extracted outside Suspense to prevent disappearing during loading states.
 *
 * Features:
 * - Search input with debounce (300ms)
 * - Purpose filter (general, insulation, security, decorative)
 * - Supplier filter (dropdown)
 * - Active status filter (all, active, inactive)
 * - Create button
 * - Always visible during table loading
 *
 * Architecture:
 * - Client Component for interactivity
 * - URL-based state management
 * - Receives suppliers from server (fetched outside Suspense)
 */

'use client';

import Link from 'next/link';
import { type FilterDefinition, TableFilters } from '@/app/_components/server-table/table-filters';
import { TableSearch } from '@/app/_components/server-table/table-search';
import { Button } from '@/components/ui/button';

/**
 * Supplier data type
 */
type Supplier = {
  id: string;
  name: string;
};

type GlassTypesFiltersProps = {
  searchParams: {
    search?: string;
    purpose?: string;
    glassSupplierId?: string;
    isActive?: string;
    page?: string;
  };
  suppliers: Supplier[];
};

export function GlassTypesFilters({ searchParams, suppliers }: GlassTypesFiltersProps) {
  /**
   * Filter definitions
   */
  const filters: FilterDefinition[] = [
    {
      defaultValue: 'all',
      id: 'purpose',
      label: 'Propósito',
      options: [
        { label: 'Todos', value: 'all' },
        { label: 'General', value: 'general' },
        { label: 'Aislamiento', value: 'insulation' },
        { label: 'Seguridad', value: 'security' },
        { label: 'Decorativo', value: 'decorative' },
      ],
      type: 'select',
    },
    {
      defaultValue: 'all',
      id: 'glassSupplierId',
      label: 'Proveedor de Vidrio',
      options: [{ label: 'Todos', value: 'all' }, ...suppliers.map((s) => ({ label: s.name, value: s.id }))],
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
    <div className="flex items-end justify-between gap-4">
      {/* Search */}
      <div className="max-w-sm flex-1">
        <TableSearch defaultValue={searchParams.search} placeholder="Buscar por nombre..." />
      </div>

      {/* Filters */}
      <TableFilters filters={filters} />

      {/* Create button */}
      <Button asChild>
        <Link href="/admin/glass-types/new">Nuevo Tipo de Vidrio</Link>
      </Button>
    </div>
  );
}
