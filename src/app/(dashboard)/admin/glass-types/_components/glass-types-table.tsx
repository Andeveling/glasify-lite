/**
 * GlassTypesTable Component
 *
 * Server-optimized table for Glass Types admin page using ServerTable components.
 * Pure presentation component - filters managed by GlassTypesFilters component.
 *
 * Features:
 * - Server-side data fetching via tRPC
 * - URL-based state management
 * - Debounced search (300ms)
 * - Sortable columns
 * - Delete confirmation with referential integrity check
 * - Optimistic UI updates for delete operations
 *
 * Architecture:
 * - Uses ServerTable organism with molecular components
 * - Follows SOLID principles (Single Responsibility)
 * - Type-safe with Zod validation
 */
/** biome-ignore-all assist/source/useSortedKeys: El problema era que Biome estaba reordenando alfabéticamente las propiedades del objeto de configuración de la mutación, poniendo onError antes de onMutate. TypeScript necesita que onMutate se defina primero para inferir el tipo del contexto que luego se usa en onError.
 */

"use client";

import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { DeleteConfirmationDialog } from "@/app/_components/delete-confirmation-dialog";
import type { ServerTableColumn } from "@/app/_components/server-table";
import { ServerTable } from "@/app/_components/server-table";
import { TablePagination } from "@/app/_components/server-table/table-pagination";
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
import { formatCurrency, formatThickness } from "@/lib/format";
import { api } from "@/trpc/react";

/**
 * Glass Type data type (from tRPC)
 */
type GlassType = {
  id: string;
  name: string;
  thicknessMm: number;
  pricePerSqm: number;
  sku: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  solutions: Array<{
    isPrimary: boolean;
    solution: {
      nameEs: string;
    };
  }>;
  _count: {
    solutions: number;
    characteristics: number;
  };
};

type GlassTypesTableProps = {
  initialData: {
    items: GlassType[];
    total: number;
    page: number;
    totalPages: number;
    limit: number;
  };
  searchParams: {
    search?: string;
    isActive?: string;
    page?: string;
  };
};

/**
 * Active status badge
 */
function ActiveBadge({ isActive }: { isActive: boolean }) {
  return (
    <Badge variant={isActive ? "default" : "secondary"}>
      {isActive ? "Activo" : "Inactivo"}
    </Badge>
  );
}

/**
 * Solutions display
 */
function SolutionsBadges({ solutions }: { solutions: GlassType["solutions"] }) {
  if (solutions.length === 0) {
    return <span className="text-muted-foreground text-sm">—</span>;
  }

  const primary = solutions.find((s) => s.isPrimary);
  const displaySolution = primary ?? solutions[0];

  if (!displaySolution) {
    return <span className="text-muted-foreground text-sm">—</span>;
  }

  return (
    <div className="flex flex-wrap items-center gap-1">
      <Badge variant={displaySolution.isPrimary ? "default" : "secondary"}>
        {displaySolution.solution.nameEs}
      </Badge>
      {solutions.length > 1 && (
        <span className="text-muted-foreground text-xs">
          +{solutions.length - 1}
        </span>
      )}
    </div>
  );
}

/**
 * Actions dropdown menu
 */
function ActionsMenu({
  glassType,
  onDelete,
}: {
  glassType: GlassType;
  onDelete: (id: string, name: string) => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button aria-label="Abrir menú de acciones" size="icon" variant="ghost">
          <MoreHorizontal className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Acciones</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href={`/admin/glass-types/${glassType.id}`}>
            <Pencil className="mr-2 size-4" />
            Editar
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem
          className="text-destructive"
          onClick={() => onDelete(glassType.id, glassType.name)}
        >
          <Trash2 className="mr-2 size-4" />
          Eliminar
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function GlassTypesTable({
  initialData,
  searchParams,
}: GlassTypesTableProps) {
  const { formatContext } = useTenantConfig();
  const utils = api.useUtils();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [glassTypeToDelete, setGlassTypeToDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);

  // Delete mutation with optimistic updates
  // biome-ignore format: Order matters for TypeScript inference (onMutate must come before onError)
  const deleteMutation = api.admin[ 'glass-type' ].delete.useMutation({
    // onMutate MUST be first to establish context type for onError
    async onMutate(variables) {
      // Cancel outgoing refetches to prevent optimistic update from being overwritten
      await utils.admin[ 'glass-type' ].list.cancel();

      // Snapshot the previous value
      const previousData = utils.admin[ 'glass-type' ].list.getData();

      // Optimistically remove the item from cache
      if (previousData) {
        utils.admin[ 'glass-type' ].list.setData(
          // Match the input parameters of the current query
          {
            isActive: searchParams.isActive as 'all' | 'active' | 'inactive' | undefined,
            limit: initialData.limit,
            page: Number(searchParams.page) || 1,
            search: searchParams.search,
          },
          (old) => {
            if (!old) { return old; }
            return {
              ...old,
              items: old.items.filter((item) => item.id !== variables.id),
              total: old.total - 1,
            };
          }
        );
      }

      // Show immediate feedback
      toast.loading('Eliminando tipo de vidrio...', { id: 'delete-glass-type' });

      // Return context with snapshot for rollback
      return { previousData };
    },
    onError(error, _variables, context) {
      // Rollback to previous data on error
      if (context?.previousData) {
        utils.admin[ 'glass-type' ].list.setData(
          {
            isActive: searchParams.isActive as 'all' | 'active' | 'inactive' | undefined,
            limit: initialData.limit,
            page: Number(searchParams.page) || 1,
            search: searchParams.search,
          },
          context.previousData
        );
      }

      toast.error('Error al eliminar tipo de vidrio', {
        description: error.message,
        id: 'delete-glass-type',
      });
    },
    onSuccess() {
      toast.success('Tipo de vidrio eliminado correctamente', { id: 'delete-glass-type' });
      setDeleteDialogOpen(false);
      setGlassTypeToDelete(null);
    },
    onSettled() {
      // Always refetch to ensure data consistency
      utils.admin["glass-type"].list.invalidate().catch(undefined);
    },
  });

  /**
   * Handle delete click
   */
  const handleDeleteClick = (id: string, name: string) => {
    setGlassTypeToDelete({ id, name });
    setDeleteDialogOpen(true);
  };

  /**
   * Confirm delete
   */
  const handleConfirmDelete = async () => {
    if (!glassTypeToDelete) {
      return;
    }
    await deleteMutation.mutateAsync({ id: glassTypeToDelete.id });
  };

  /**
   * Column definitions
   */
  const columns: ServerTableColumn<GlassType>[] = [
    {
      cell: (item) => (
        <div>
          <div className="font-medium">{item.name}</div>
          {item.sku && (
            <div className="text-muted-foreground text-xs">SKU: {item.sku}</div>
          )}
        </div>
      ),
      header: "Nombre",
      id: "name",
      sortable: true,
    },
    {
      align: "center",
      cell: (item) => formatThickness(item.thicknessMm, formatContext),
      header: "Espesor",
      id: "thicknessMm",
      sortable: true,
    },
    {
      cell: (item) =>
        formatCurrency(item.pricePerSqm, { context: formatContext }),
      header: "Precio/m²",
      id: "pricePerSqm",
      sortable: true,
    },
    {
      cell: (item) => <SolutionsBadges solutions={item.solutions} />,
      header: "Soluciones",
      id: "solutions",
      sortable: false,
    },
    {
      align: "center",
      cell: (item) => <ActiveBadge isActive={item.isActive} />,
      header: "Estado",
      id: "isActive",
      sortable: false,
    },
    {
      align: "right",
      cell: (item) => (
        <ActionsMenu glassType={item} onDelete={handleDeleteClick} />
      ),
      header: "Acciones",
      id: "actions",
      sortable: false,
      width: "80px",
    },
  ];

  return (
    <>
      <ServerTable
        columns={columns}
        data={initialData.items}
        emptyMessage="No se encontraron tipos de vidrio"
      />
      {/* Pagination */}
      <TablePagination
        currentPage={initialData.page}
        totalItems={initialData.total}
        totalPages={initialData.totalPages}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        dependencies={[]}
        entityLabel={glassTypeToDelete?.name ?? ""}
        entityName="tipo de vidrio"
        loading={deleteMutation.isPending}
        onConfirm={handleConfirmDelete}
        onOpenChange={setDeleteDialogOpen}
        open={deleteDialogOpen}
      />
    </>
  );
}
