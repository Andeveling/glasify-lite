/**
 * Colors List Component
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
 * - Three-tier deletion warning dialog
 *
 * Key differences from old patterns:
 * ✅ Eliminado: React state para filtros
 * ✅ Agregado: Recibe datos iniciales del servidor
 * ✅ Agregado: Sincroniza con URL via searchParams
 * ✅ Simplificado: Enfocado en presentación, no state management
 */

"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { DeleteConfirmationDialog } from "@/app/_components/delete-confirmation-dialog";
import { TablePagination } from "@/app/_components/server-table/table-pagination";
import { api } from "@/trpc/react";
import { ColorsEmpty } from "./colors-empty";
import { ColorsTable } from "./colors-table";

type SerializedColor = {
  id: string;
  name: string;
  hexCode: string;
  ralCode: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

type ColorsListProps = {
  initialData: {
    items: SerializedColor[];
    limit: number;
    page: number;
    total: number;
    totalPages: number;
  };
  searchParams: {
    isActive?: string;
    page?: string;
    search?: string;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
  };
};

export function ColorsList({ initialData, searchParams }: ColorsListProps) {
  const utils = api.useUtils();
  const router = useRouter();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [colorToDelete, setColorToDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);

  // Delete mutation with optimistic UI
  const deleteMutation = api.admin.colors.delete.useMutation({
    onMutate: async (variables) => {
      // Cancel any outgoing refetches
      await utils.admin.colors.list.cancel();

      // Snapshot the previous value
      const previousData = utils.admin.colors.list.getData();

      // Optimistically remove the item from cache
      if (previousData) {
        utils.admin.colors.list.setData(
          {
            isActive: (searchParams.isActive || "all") as
              | "all"
              | "active"
              | "inactive",
            limit: initialData.limit,
            page: Number(searchParams.page) || 1,
            search: searchParams.search,
            sortBy: (searchParams.sortBy || "name") as
              | "name"
              | "createdAt"
              | "updatedAt",
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
      toast.loading("Eliminando color...", { id: "delete-color" });

      // Return context with snapshot for rollback
      return { previousData };
    },
    onError: (error, _variables, context) => {
      // Rollback to previous data on error
      if (context?.previousData) {
        utils.admin.colors.list.setData(
          {
            isActive: (searchParams.isActive || "all") as
              | "all"
              | "active"
              | "inactive",
            limit: initialData.limit,
            page: Number(searchParams.page) || 1,
            search: searchParams.search,
            sortBy: (searchParams.sortBy || "name") as
              | "name"
              | "createdAt"
              | "updatedAt",
            sortOrder: (searchParams.sortOrder || "asc") as "asc" | "desc",
          },
          context.previousData
        );
      }
      toast.error("Error al eliminar color", {
        description: error.message,
        id: "delete-color",
      });
    },
    onSettled: () => {
      void utils.admin.colors.list.invalidate();
      router.refresh();
    },
    onSuccess: () => {
      toast.success("Color eliminado correctamente", { id: "delete-color" });
    },
  });

  // Handle edit action - navigate to edit page
  const handleEditAction = (id: string) => {
    router.push(`/admin/colors/${id}/edit`);
  };

  // Handle delete action - show confirmation dialog
  const handleDeleteAction = (color: { id: string; name: string }) => {
    setColorToDelete(color);
    setDeleteDialogOpen(true);
  };

  // Confirm delete - execute mutation
  const handleDeleteConfirm = () => {
    if (colorToDelete) {
      deleteMutation.mutate({ id: colorToDelete.id });
    }
    setDeleteDialogOpen(false);
    setColorToDelete(null);
  };

  // Cancel delete - close dialog
  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setColorToDelete(null);
  };

  // Empty state - no data found
  if (initialData.total === 0) {
    return <ColorsEmpty searchTerm={searchParams.search} />;
  }

  return (
    <>
      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        entityLabel={colorToDelete?.name ?? ""}
        entityName="color"
        loading={deleteMutation.isPending}
        onConfirm={handleDeleteConfirm}
        onOpenChange={(open) => {
          if (!open) {
            handleDeleteCancel();
          }
        }}
        open={deleteDialogOpen}
      />

      {/* Colors Table */}
      <ColorsTable
        colors={initialData.items}
        onDeleteAction={handleDeleteAction}
        onEditAction={handleEditAction}
      />

      {/* Pagination */}
      {initialData.totalPages > 1 && (
        <TablePagination
          currentPage={initialData.page}
          totalItems={initialData.total}
          totalPages={initialData.totalPages}
        />
      )}
    </>
  );
}
