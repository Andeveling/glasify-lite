/**
 * Quotes Empty State Component (US1 - T014)
 *
 * Displayed when no quotes match current filters
 * Spanish message with icon
 */

"use client";

import { FileText } from "lucide-react";

export function QuotesEmptyState() {
  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
      <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-muted">
        <FileText className="size-6 text-muted-foreground" />
      </div>
      <h3 className="mt-4 font-semibold text-lg">No hay cotizaciones</h3>
      <p className="mt-2 mb-4 text-muted-foreground text-sm">
        No se encontraron cotizaciones con los filtros aplicados.
      </p>
    </div>
  );
}
