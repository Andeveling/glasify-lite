/**
 * Server Filters Component
 *
 * Filter controls that sync with URL search params for server-side filtering
 * Follows Next.js 15 pattern with useRouter + URLSearchParams
 *
 * Features:
 * - Updates URL on filter change
 * - Server Component refetches with new params
 * - Deep linking support
 * - Type-safe filter options
 */

"use client";

import { Plus } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useServerFilters } from "../_hooks/use-server-filters";

type Supplier = {
  id: string;
  name: string;
};

type ServerFiltersProps = {
  suppliers: Supplier[];
};

export function ServerFilters({ suppliers }: ServerFiltersProps) {
  const { getFilterValue, updateFilter } = useServerFilters();

  const status = getFilterValue("status");
  const profileSupplierId = getFilterValue("profileSupplierId");

  return (
    <div className="flex flex-wrap items-end gap-4">
      {/* Status Filter */}
      <div className="min-w-[200px] flex-1 space-y-2">
        <label className="font-medium text-sm" htmlFor="status">
          Estado
        </label>
        <Select
          onValueChange={(value) => updateFilter("status", value)}
          value={status}
        >
          <SelectTrigger id="status">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="draft">Borrador</SelectItem>
            <SelectItem value="published">Publicado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Profile Supplier Filter */}
      <div className="min-w-[200px] flex-1 space-y-2">
        <label className="font-medium text-sm" htmlFor="profileSupplierId">
          Proveedor de Perfiles
        </label>
        <Select
          onValueChange={(value) => updateFilter("profileSupplierId", value)}
          value={profileSupplierId}
        >
          <SelectTrigger id="profileSupplierId">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            {suppliers.map((supplier) => (
              <SelectItem key={supplier.id} value={supplier.id}>
                {supplier.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Create Button */}
      <Button asChild>
        <Link href="/admin/models/new">
          <Plus className="mr-2 size-4" />
          Nuevo Modelo
        </Link>
      </Button>
    </div>
  );
}
