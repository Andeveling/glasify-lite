/**
 * ModelsFilters Component
 *
 * Filter controls for Models admin table.
 * Extracted outside Suspense to prevent disappearing during loading states.
 *
 * Features:
 * - Search input with debounce (300ms)
 * - Status filter (all, draft, published)
 * - Supplier filter (dropdown)
 * - Create button
 * - Always visible during table loading
 *
 * Architecture:
 * - Client Component for interactivity
 * - URL-based state management
 * - Receives suppliers from server (fetched outside Suspense)
 */

"use client";

import Link from "next/link";
import {
  type FilterDefinition,
  TableFilters,
} from "@/app/_components/server-table/table-filters";
import { TableSearch } from "@/app/_components/server-table/table-search";
import { Button } from "@/components/ui/button";
import type { MaterialType } from "@/lib/types/prisma-types";

/**
 * Supplier data type
 */
type Supplier = {
  id: string;
  name: string;
  materialType: MaterialType;
};

type ModelsFiltersProps = {
  searchParams: {
    search?: string;
    status?: string;
    profileSupplierId?: string;
    page?: string;
  };
  suppliers: Supplier[];
};

export function ModelsFilters({ searchParams, suppliers }: ModelsFiltersProps) {
  /**
   * Filter definitions
   */
  const filters: FilterDefinition[] = [
    {
      defaultValue: "all",
      id: "status",
      label: "Estado",
      options: [
        { label: "Todos", value: "all" },
        { label: "Borrador", value: "draft" },
        { label: "Publicado", value: "published" },
      ],
      type: "select",
    },
    {
      defaultValue: "all",
      id: "profileSupplierId",
      label: "Proveedor de Perfiles",
      options: [
        { label: "Todos", value: "all" },
        ...suppliers.map((s) => ({ label: s.name, value: s.id })),
      ],
      type: "select",
    },
  ];

  return (
    <div className="flex items-end justify-between gap-4">
      {/* Search */}
      <div className="max-w-sm flex-1">
        <TableSearch
          defaultValue={searchParams.search}
          placeholder="Buscar por nombre..."
        />
      </div>

      {/* Filters */}
      <TableFilters filters={filters} />

      {/* Create button */}
      <Button asChild>
        <Link href="/admin/models/new">Nuevo Modelo</Link>
      </Button>
    </div>
  );
}
