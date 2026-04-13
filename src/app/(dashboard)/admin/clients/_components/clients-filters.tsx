/**
 * Clients Filters Component
 *
 * Filter controls for Clients admin table.
 *
 * Features:
 * - Search input with debounce (300ms)
 * - Create button (navigates to new client page)
 * - Always visible during table loading
 */

"use client"

import { Plus } from "lucide-react"
import { TableSearch } from "@/app/_components/server-table/table-search"
import { Button } from "@/components/ui/button"

type ClientsFiltersProps = {
  searchParams: {
    page?: string
    search?: string
  }
  onCreateClickAction?: () => void
}

export function ClientsFilters({ searchParams, onCreateClickAction }: ClientsFiltersProps) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      {/* Search - max width to prevent huge inputs */}
      <div className="max-w-sm flex-1">
        <TableSearch
          defaultValue={searchParams.search}
          placeholder="Buscar por nombre, empresa o correo..."
        />
      </div>

      {/* Create button - always visible, clear action */}
      <Button onClick={onCreateClickAction}>
        <Plus className="mr-2 size-4" />
        Nuevo Cliente
      </Button>
    </div>
  )
}
