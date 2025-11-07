/**
 * Glass Supplier Empty State Component
 *
 * Displays when no glass suppliers match current filters
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

type GlassSupplierEmptyProps = {
  hasFilters: boolean;
};

export function GlassSupplierEmpty({ hasFilters }: GlassSupplierEmptyProps) {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Factory />
        </EmptyMedia>
        <EmptyTitle>
          {hasFilters
            ? "No se encontraron proveedores"
            : "No hay proveedores de vidrio"}
        </EmptyTitle>
        <EmptyDescription>
          {hasFilters
            ? "No se encontraron proveedores que coincidan con los filtros aplicados. Intenta ajustar los criterios de búsqueda."
            : "Comienza agregando tu primer proveedor de vidrio para gestionar los fabricantes."}
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>{/* Create button is in filters component */}</EmptyContent>
    </Empty>
  );
}
