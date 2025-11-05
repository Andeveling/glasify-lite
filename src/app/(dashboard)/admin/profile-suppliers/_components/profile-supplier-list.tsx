/**
 * Profile Supplier List Component
 *
 * Client Component - Server-optimized pattern
 *
 * Receives:
 * - initialData: Datos precargados del servidor (SSR)
 * - searchParams: Estado actual de filtros (para sincronización)
 *
 * Responsibilities:
 * - Display tabla con datos
 * - Handle CRUD actions (edit, delete)
 * - Manage optimistic UI
 *
 * Features:
 * - Optimistic delete with rollback on error
 * - Toast notifications with loading states
 * - Cache invalidation after mutations
 *
 * Key differences from old ServiceList:
 * ✅ Eliminado: React state para filtros (page, search, typeFilter)
 * ✅ Agregado: Recibe datos iniciales del servidor
 * ✅ Agregado: Sincroniza con URL via searchParams
 * ✅ Simplificado: Enfocado en presentación, no state management
 */
/** biome-ignore-all assist/source/useSortedKeys: TypeScript necesita que onMutate se defina primero para inferir el tipo del contexto que luego se usa en onError. */

"use client";

import type { MaterialType, ProfileSupplier } from "@prisma/client";
import { Pencil, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { DeleteConfirmationDialog } from "@/app/_components/delete-confirmation-dialog";
import { TablePagination } from "@/app/_components/server-table/table-pagination";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { api } from "@/trpc/react";
import { ProfileSupplierEmpty } from "./profile-supplier-empty";

type ProfileSupplierListProps = {
  initialData: {
    items: ProfileSupplier[];
    limit: number;
    page: number;
    total: number;
    totalPages: number;
  };
  onEditClick: (supplier: ProfileSupplier) => void;
  searchParams: {
    isActive?: string;
    materialType?: string;
    page?: string;
    search?: string;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
  };
};

/**
 * Material type labels (Spanish)
 * Used for badges and UI display
 */
const MATERIAL_TYPE_LABELS: Record<MaterialType, string> = {
  ALUMINUM: "Aluminio",
  MIXED: "Mixto",
  PVC: "PVC",
  WOOD: "Madera",
};

/**
 * Material type badge variants
 * Visual distinction for different material types
 */
const MATERIAL_TYPE_VARIANTS: Record<
  MaterialType,
  "default" | "secondary" | "outline" | "destructive"
> = {
  ALUMINUM: "default",
  MIXED: "outline",
  PVC: "secondary",
  WOOD: "destructive",
};

export function ProfileSupplierList({
  initialData,
  searchParams,
  onEditClick,
}: ProfileSupplierListProps) {
  const utils = api.useUtils();
  const router = useRouter();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [supplierToDelete, setSupplierToDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);

  // Delete mutation with optimistic UI
  const deleteMutation = api.admin["profile-supplier"].delete.useMutation({
    onMutate: async (variables) => {
      // Cancel any outgoing refetches
      await utils.admin["profile-supplier"].list.cancel();

      // Snapshot the previous value
      const previousData = utils.admin["profile-supplier"].list.getData();

      // Optimistically remove the item from cache
      if (previousData) {
        utils.admin["profile-supplier"].list.setData(
          // Match the input parameters of the current query
          {
            isActive: searchParams.isActive as
              | "all"
              | "active"
              | "inactive"
              | undefined,
            limit: initialData.limit,
            materialType: searchParams.materialType as MaterialType | undefined,
            page: Number(searchParams.page) || 1,
            search: searchParams.search,
            sortBy: (searchParams.sortBy || "name") as
              | "name"
              | "createdAt"
              | "materialType",
            sortOrder: (searchParams.sortOrder || "asc") as "asc" | "desc",
          },
          (old) => {
            if (!old) {
              return old;
            }
            return {
              ...old,
              items: old.items.filter((item) => item.id !== variables.id),
              total: old.total - 1,
            };
          }
        );
      }

      // Show immediate feedback
      toast.loading("Eliminando proveedor...", { id: "delete-supplier" });

      // Return context with snapshot for rollback
      return { previousData };
    },
    onError: (error, _variables, context) => {
      // Rollback to previous data on error
      if (context?.previousData) {
        utils.admin["profile-supplier"].list.setData(
          {
            isActive: searchParams.isActive as
              | "all"
              | "active"
              | "inactive"
              | undefined,
            limit: initialData.limit,
            materialType: searchParams.materialType as MaterialType | undefined,
            page: Number(searchParams.page) || 1,
            search: searchParams.search,
            sortBy: (searchParams.sortBy || "name") as
              | "name"
              | "createdAt"
              | "materialType",
            sortOrder: (searchParams.sortOrder || "asc") as "asc" | "desc",
          },
          context.previousData
        );
      }

      toast.error("Error al eliminar proveedor", {
        description: error.message,
        id: "delete-supplier",
      });
    },
    onSuccess: () => {
      toast.success("Proveedor eliminado correctamente", {
        id: "delete-supplier",
      });
      setDeleteDialogOpen(false);
      setSupplierToDelete(null);
    },
    onSettled: () => {
      // Invalidate cache and refresh server data
      utils.admin["profile-supplier"].list.invalidate().catch(() => {
        // Ignore cache invalidation errors - page refresh will handle state update
      });
      router.refresh();
    },
  });

  const handleDeleteClick = (supplier: { id: string; name: string }) => {
    setSupplierToDelete(supplier);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (supplierToDelete) {
      deleteMutation.mutate({ id: supplierToDelete.id });
    }
  };

  const {
    items: suppliers,
    page: currentPage,
    total,
    totalPages,
  } = initialData;

  // Check if there are filters active
  const hasFilters = Boolean(
    searchParams?.search ||
      (searchParams?.materialType && searchParams.materialType !== "all") ||
      (searchParams?.isActive && searchParams.isActive !== "all")
  );

  return (
    <>
      {/* Empty state */}
      {suppliers.length === 0 ? (
        <ProfileSupplierEmpty hasFilters={hasFilters} />
      ) : (
        <>
          {/* Table */}
          <div className="overflow-x-auto rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Material</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Notas</TableHead>
                  <TableHead className="w-[100px] text-right">
                    Acciones
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {suppliers.map((supplier) => (
                  <TableRow key={supplier.id}>
                    <TableCell className="font-medium">
                      {supplier.name}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={MATERIAL_TYPE_VARIANTS[supplier.materialType]}
                      >
                        {MATERIAL_TYPE_LABELS[supplier.materialType]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={supplier.isActive ? "default" : "secondary"}
                      >
                        {supplier.isActive ? "Activo" : "Inactivo"}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate text-muted-foreground text-sm">
                      {supplier.notes || "-"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          onClick={() => onEditClick(supplier)}
                          size="sm"
                          variant="ghost"
                        >
                          <Pencil className="h-4 w-4" />
                          <span className="sr-only">Editar</span>
                        </Button>
                        <Button
                          onClick={() =>
                            handleDeleteClick({
                              id: supplier.id,
                              name: supplier.name,
                            })
                          }
                          size="sm"
                          variant="ghost"
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Eliminar</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination - reutilizable component */}
          <TablePagination
            currentPage={currentPage}
            totalItems={total}
            totalPages={totalPages}
          />
        </>
      )}

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        dependencies={[]}
        entityLabel={supplierToDelete?.name ?? ""}
        entityName="proveedor"
        loading={deleteMutation.isPending}
        onConfirm={handleDeleteConfirm}
        onOpenChange={setDeleteDialogOpen}
        open={deleteDialogOpen}
        warningMessage="Esta acción no se puede deshacer."
      />
    </>
  );
}
