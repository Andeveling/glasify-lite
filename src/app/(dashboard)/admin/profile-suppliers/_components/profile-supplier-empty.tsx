/**
 * Profile Supplier Empty State Component
 *
 * Displays when no profile suppliers match current filters
 * or when the database is empty.
 *
 * Conditional messaging based on filter state:
 * - With filters: "No results found"
 * - Without filters: "Get started by adding your first supplier"
 */

"use client";

import { Factory } from "lucide-react";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

type ProfileSupplierEmptyProps = {
  hasFilters: boolean;
};

export function ProfileSupplierEmpty({
  hasFilters,
}: ProfileSupplierEmptyProps) {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Factory />
        </EmptyMedia>
        <EmptyTitle>
          {hasFilters
            ? "No se encontraron proveedores"
            : "No hay proveedores de perfiles"}
        </EmptyTitle>
        <EmptyDescription>
          {hasFilters
            ? "No se encontraron proveedores que coincidan con los filtros aplicados. Intenta ajustar los criterios de búsqueda."
            : "Comienza agregando tu primer proveedor de perfiles para ventanas y puertas."}
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>{/* Create button is in filters component */}</EmptyContent>
    </Empty>
  );
}
