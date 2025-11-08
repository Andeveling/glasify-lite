/**
 * Model Table Columns Definition
 *
 * Column definitions for TanStack Table with sorting, filtering, and actions
 */

"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import { useCurrencyFormatter } from "@/app/_hooks/use-currency-formatter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { MaterialType, ModelStatus } from "@/lib/types/prisma-types";

export type Model = {
  id: string;
  name: string;
  status: ModelStatus;
  minWidthMm: number;
  maxWidthMm: number;
  minHeightMm: number;
  maxHeightMm: number;
  basePrice: number;
  compatibleGlassTypeIds: string[];
  profileSupplier: {
    id: string;
    name: string;
    materialType: MaterialType;
  } | null;
};

const statusLabels: Record<ModelStatus, string> = {
  draft: "Borrador",
  published: "Publicado",
};

const getStatusVariant = (status: ModelStatus): "default" | "secondary" =>
  status === "published" ? "default" : "secondary";

// Helper component for price formatting
function PriceCell({ price }: { price: number }) {
  const { formatPrice } = useCurrencyFormatter();
  return <span className="text-sm">{formatPrice(price)}</span>;
}

export const createColumns = (
  onDeleteClick: (id: string, name: string) => void
): ColumnDef<Model>[] => [
  {
    cell: ({ row }) => (
      <Checkbox
        aria-label="Seleccionar fila"
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
      />
    ),
    enableHiding: false,
    enableSorting: false,
    header: ({ table }) => (
      <Checkbox
        aria-label="Seleccionar todo"
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
      />
    ),
    id: "select",
  },
  {
    accessorKey: "name",
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue("name")}</div>
    ),
    header: ({ column }) => (
      <Button
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        variant="ghost"
      >
        Nombre
        <ArrowUpDown className="ml-2 size-4" />
      </Button>
    ),
  },
  {
    cell: () => <Badge variant="outline">Sin SKU</Badge>,
    enableSorting: false,
    header: "SKU",
    id: "sku",
  },
  {
    cell: ({ row }) => {
      const { minWidthMm, maxWidthMm, minHeightMm, maxHeightMm } = row.original;
      return (
        <div className="flex flex-col gap-0.5 text-sm">
          <span>
            Ancho: {minWidthMm}-{maxWidthMm}mm
          </span>
          <span className="text-muted-foreground text-xs">
            Alto: {minHeightMm}-{maxHeightMm}mm
          </span>
        </div>
      );
    },
    enableSorting: false,
    header: "Dimensiones",
    id: "dimensions",
  },
  {
    accessorKey: "basePrice",
    cell: ({ row }) => <PriceCell price={row.getValue("basePrice")} />,
    header: ({ column }) => (
      <Button
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        variant="ghost"
      >
        Precio Base
        <ArrowUpDown className="ml-2 size-4" />
      </Button>
    ),
  },
  {
    accessorFn: (row) => row.profileSupplier?.id ?? "",
    cell: ({ row }) => {
      const supplier = row.original.profileSupplier;
      return (
        <span className="text-sm">
          {supplier?.name || (
            <span className="text-muted-foreground">Sin proveedor</span>
          )}
        </span>
      );
    },
    enableSorting: false,
    header: "Proveedor",
    id: "profileSupplierId",
  },
  {
    cell: ({ row }) => {
      const count = row.original.compatibleGlassTypeIds.length;
      return <Badge variant="secondary">{count} tipos</Badge>;
    },
    enableSorting: false,
    header: "Tipos Compatibles",
    id: "glassTypes",
  },
  {
    accessorKey: "status",
    cell: ({ row }) => {
      const status = row.getValue("status") as ModelStatus;
      return (
        <Badge variant={getStatusVariant(status)}>{statusLabels[status]}</Badge>
      );
    },
    header: ({ column }) => (
      <Button
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        variant="ghost"
      >
        Estado
        <ArrowUpDown className="ml-2 size-4" />
      </Button>
    ),
  },
  {
    cell: ({ row }) => {
      const model = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="size-8 p-0" variant="ghost">
              <span className="sr-only">Abrir menú</span>
              <MoreHorizontal className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Acciones</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(model.id)}
            >
              Copiar ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href={`/admin/models/${model.id}`}>
                <Pencil className="mr-2 size-4" />
                Editar
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-destructive"
              onClick={() => onDeleteClick(model.id, model.name)}
            >
              <Trash2 className="mr-2 size-4" />
              Eliminar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
    enableHiding: false,
    id: "actions",
  },
];
