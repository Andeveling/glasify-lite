"use client";

import { MoreHorizontal } from "lucide-react";
import Link from "next/link";
import { TableFilters } from "@/app/_components/server-table/table-filters";
import { TablePagination } from "@/app/_components/server-table/table-pagination";
import { TableSearch } from "@/app/_components/server-table/table-search";
import { useTenantConfig } from "@/app/_hooks/use-tenant-config";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatCurrency } from "@/lib/format";

type QuoteStatus = "draft" | "sent" | "canceled";

type Quote = {
  id: string;
  projectName: string;
  status: QuoteStatus;
  total: number;
  currency: string;
  itemCount: number;
  createdAt: Date;
  isExpired: boolean;
  validUntil: Date | null;
  sentAt: Date | null;
};

type QuotesTableData = {
  quotes: Quote[];
  total: number;
  page: number;
  totalPages: number;
  limit: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
};

type QuotesTableProps = {
  data: QuotesTableData;
};

/**
 * QuotesTable Component
 *
 * Server-optimized table for displaying user quotes with:
 * - Status filtering (draft, sent, canceled)
 * - Search by project name
 * - Sort by date or price
 * - Pagination
 * - URL-based state management
 *
 * Uses the established ServerTable pattern with reusable molecules.
 */
export function QuotesTable({ data }: QuotesTableProps) {
  const { formatContext } = useTenantConfig();
  return (
    <div className="space-y-4">
      {/* Search and Filters - Mobile stacked, Desktop in row */}
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:gap-6">
        {/* Search - takes flex-1 on desktop */}
        <div className="flex-1">
          <TableSearch placeholder="Buscar por nombre de proyecto..." />
        </div>

        {/* Filters wrapper - keeps them together on desktop */}
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:gap-4">
          <TableFilters
            filters={[
              {
                id: "status",
                label: "Estado",
                options: [
                  { label: "Todos", value: "all" },
                  { label: "Borrador", value: "draft" },
                  { label: "Enviada", value: "sent" },
                  { label: "Cancelada", value: "canceled" },
                ],
                type: "select",
              },
              {
                id: "sort",
                label: "Ordenar por",
                options: [
                  { label: "Más recientes", value: "newest" },
                  { label: "Más antiguas", value: "oldest" },
                  { label: "Precio: Mayor a menor", value: "price-high" },
                  { label: "Precio: Menor a mayor", value: "price-low" },
                ],
                type: "select",
              },
            ]}
          />
        </div>
      </div>

      {/* Results Count */}
      <div className="text-muted-foreground text-sm">
        {data.total === 0 ? (
          "No se encontraron cotizaciones"
        ) : (
          <>
            Mostrando{" "}
            <span className="font-medium text-foreground">
              {data.quotes.length}
            </span>{" "}
            de <span className="font-medium text-foreground">{data.total}</span>{" "}
            cotizaciones
          </>
        )}
      </div>

      {/* Table */}
      <div className="rounded-lg border">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-sm">
                  Proyecto
                </th>
                <th className="px-4 py-3 text-left font-medium text-sm">
                  Estado
                </th>
                <th className="px-4 py-3 text-right font-medium text-sm">
                  Total
                </th>
                <th className="px-4 py-3 text-center font-medium text-sm">
                  Items
                </th>
                <th className="px-4 py-3 text-left font-medium text-sm">
                  Fecha
                </th>
                <th className="px-4 py-3 text-right font-medium text-sm">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {data.quotes.length === 0 ? (
                <tr>
                  <td
                    className="px-4 py-8 text-center text-muted-foreground"
                    colSpan={6}
                  >
                    No hay cotizaciones para mostrar
                  </td>
                </tr>
              ) : (
                data.quotes.map((quote) => (
                  <tr
                    className="transition-colors hover:bg-muted/50"
                    key={quote.id}
                  >
                    <td className="px-4 py-3">
                      <div>
                        <Link
                          className="font-medium text-sm hover:underline"
                          href={`/my-quotes/${quote.id}`}
                        >
                          {quote.projectName}
                        </Link>
                        {quote.isExpired && (
                          <p className="text-destructive text-xs">Vencida</p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <QuoteStatusBadge status={quote.status} />
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-sm">
                      {formatCurrency(quote.total, { context: formatContext })}
                    </td>
                    <td className="px-4 py-3 text-center text-muted-foreground text-sm">
                      {quote.itemCount}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <div>
                        <p>
                          {new Date(quote.createdAt).toLocaleDateString(
                            "es-ES"
                          )}
                        </p>
                        {quote.sentAt && (
                          <p className="text-muted-foreground text-xs">
                            Enviada:{" "}
                            {new Date(quote.sentAt).toLocaleDateString("es-ES")}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <QuoteActionsMenu quoteId={quote.id} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {data.totalPages > 1 && (
        <TablePagination
          currentPage={data.page}
          totalItems={data.total}
          totalPages={data.totalPages}
        />
      )}
    </div>
  );
}

/**
 * QuoteStatusBadge - Status indicator with appropriate styling
 */
function QuoteStatusBadge({ status }: { status: QuoteStatus }) {
  const config: Record<
    QuoteStatus,
    {
      label: string;
      variant: "default" | "secondary" | "destructive" | "outline";
    }
  > = {
    canceled: { label: "Cancelada", variant: "destructive" },
    draft: { label: "Borrador", variant: "secondary" },
    sent: { label: "Enviada", variant: "default" },
  };

  const { label, variant } = config[status];

  return <Badge variant={variant}>{label}</Badge>;
}

/**
 * QuoteActionsMenu - Dropdown menu with quote actions
 */
function QuoteActionsMenu({ quoteId }: { quoteId: string }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button aria-haspopup="true" size="icon" variant="ghost">
          <MoreHorizontal className="size-4" />
          <span className="sr-only">Abrir menú de acciones</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Acciones</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href={`/my-quotes/${quoteId}`}>Ver detalles</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={`/my-quotes/${quoteId}/edit`}>Editar</Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href={`/api/quotes/${quoteId}/pdf`} target="_blank">
            Descargar PDF
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
