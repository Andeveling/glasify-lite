/**
 * ModelsTable Component
 *
 * Server-optimized table for Models admin page using new ServerTable components.
 * Implements server-side filtering, sorting, search, and pagination.
 *
 * Features:
 * - Server-side data fetching via tRPC
 * - URL-based state management
 * - Debounced search (300ms)
 * - Sortable columns
 * - Filter by status and supplier
 * - Delete confirmation
 *
 * Architecture:
 * - Uses ServerTable organism with molecular components
 * - Follows SOLID principles (Single Responsibility)
 * - Type-safe with Zod validation
 */

'use client';

import type { MaterialType, ModelStatus } from '@prisma/client';
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { toast } from 'sonner';
import { DeleteConfirmationDialog } from '@/app/_components/delete-confirmation-dialog';
import type { ServerTableColumn } from '@/app/_components/server-table';
import { ServerTable } from '@/app/_components/server-table';
import { TablePagination } from '@/app/_components/server-table/table-pagination';
import { useTenantConfig } from '@/app/_hooks/use-tenant-config';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { formatCurrency } from '@/lib/format';
import type { RouterOutputs } from '@/trpc/react';
import { api } from '@/trpc/react';

/**
 * Model data type (from tRPC)
 */
type Model = {
  id: string;
  name: string;
  status: ModelStatus;
  basePrice: number;
  minWidthMm: number;
  maxWidthMm: number;
  minHeightMm: number;
  maxHeightMm: number;
  createdAt: Date;
  updatedAt: Date;
  profileSupplier: {
    id: string;
    name: string;
    materialType: MaterialType;
  } | null;
};

type ModelsTableProps = {
  initialData: {
    items: Model[];
    total: number;
    page: number;
    totalPages: number;
    limit: number;
  };
  searchParams: {
    page: number;
    status: 'all' | 'draft' | 'published';
    profileSupplierId?: string;
    search?: string;
    sortBy: 'name' | 'createdAt' | 'updatedAt' | 'basePrice';
    sortOrder: 'asc' | 'desc';
  };
};

/**
 * Status badge component
 */
function StatusBadge({ status }: { status: ModelStatus }) {
  const variant = status === 'published' ? 'default' : 'secondary';
  const label = status === 'published' ? 'Publicado' : 'Borrador';

  return <Badge variant={variant}>{label}</Badge>;
}

/**
 * Actions dropdown menu
 */
function ActionsMenu({ model, onDelete }: { model: Model; onDelete: (id: string, name: string) => void }) {
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
          <Link href={`/admin/models/${model.id}`}>
            <Pencil className="mr-2 size-4" />
            Editar
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem className="text-destructive" onClick={() => onDelete(model.id, model.name)}>
          <Trash2 className="mr-2 size-4" />
          Eliminar
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function ModelsTable({ initialData, searchParams }: ModelsTableProps) {
  const utils = api.useUtils();
  const [ deleteDialogOpen, setDeleteDialogOpen ] = useState(false);
  const [ modelToDelete, setModelToDelete ] = useState<{ id: string; name: string } | null>(null);

  // Active query with placeholderData (enables cache invalidation)
  const { data } = api.admin.model.list.useQuery(
    {
      limit: 20,
      page: searchParams.page,
      profileSupplierId: searchParams.profileSupplierId,
      search: searchParams.search,
      sortBy: searchParams.sortBy,
      sortOrder: searchParams.sortOrder,
      status: searchParams.status,
    },
    {
      placeholderData: initialData as never, // Use server data as placeholder
      refetchOnMount: false, // Don't refetch on mount (use server data)
      staleTime: 30_000, // Consider data fresh for 30 seconds
    }
  );

  // Use fetched data or fallback to initialData
  const tableData = data ?? initialData;

  // Tenant config for tenant-aware formatting (aggressively cached, never refetches)
  const { formatContext } = useTenantConfig();

  // Context type for optimistic update snapshot
  type DeleteModelContext = {
    previousData?: RouterOutputs[ 'admin' ][ 'model' ][ 'list' ];
  };

  // Delete mutation with optimistic updates
  const deleteMutation = api.admin.model.delete.useMutation<DeleteModelContext>({
    onError: (_error, _variables, context) => {
      // Rollback to previous data on error
      if (context?.previousData) {
        utils.admin.model.list.setData(
          {
            limit: 20,
            page: searchParams.page,
            profileSupplierId: searchParams.profileSupplierId,
            search: searchParams.search,
            sortBy: searchParams.sortBy,
            sortOrder: searchParams.sortOrder,
            status: searchParams.status,
          },
          context.previousData
        );
      }
    },
    onMutate: async (variables) => {
      // Cancel any outgoing refetches to avoid overwriting optimistic update
      await utils.admin.model.list.cancel();

      // Snapshot the previous value
      const previousData = utils.admin.model.list.getData();

      // Optimistically update to remove the deleted model
      utils.admin.model.list.setData(
        {
          limit: 20,
          page: searchParams.page,
          profileSupplierId: searchParams.profileSupplierId,
          search: searchParams.search,
          sortBy: searchParams.sortBy,
          sortOrder: searchParams.sortOrder,
          status: searchParams.status,
        },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            items: old.items.filter((model) => model.id !== variables.id),
            total: old.total - 1,
          };
        }
      );

      // Return context with snapshot
      return { previousData };
    },
    onSettled: () => {
      // Always refetch after error or success to ensure sync with server
      void utils.admin.model.list.invalidate();
    },
  });

  /**
   * Handle delete click
   */
  const handleDeleteClick = (id: string, name: string) => {
    setModelToDelete({ id, name });
    setDeleteDialogOpen(true);
  };

  /**
   * Confirm delete with optimistic UI and toast.promise
   */
  const handleConfirmDelete = async () => {
    if (!modelToDelete) return;

    const deletePromise = deleteMutation.mutateAsync({ id: modelToDelete.id });

    toast.promise(deletePromise, {
      error: (error: Error) => error.message || 'No se pudo eliminar el modelo',
      loading: `Eliminando ${modelToDelete.name}...`,
      success: `${modelToDelete.name} eliminado correctamente`,
    });

    // Close dialog and reset state after promise resolves (success or error)
    await deletePromise
      .then(() => {
        setDeleteDialogOpen(false);
        setModelToDelete(null);
      })
      .catch(() => {
        // Error already handled by toast.promise and onError
        // Keep dialog open so user can try again or cancel
      });
  };

  /**
   * Column definitions
   */
  const columns: ServerTableColumn<Model>[] = [
    {
      cell: (model) => model.name,
      header: 'Nombre',
      id: 'name',
      sortable: true,
    },
    {
      cell: (model) => <StatusBadge status={model.status} />,
      header: 'Estado',
      id: 'status',
      sortable: true,
    },
    {
      cell: (model) => (model.profileSupplier ? model.profileSupplier.name : '—'),
      header: 'Proveedor',
      id: 'profileSupplier',
      sortable: false,
    },
    {
      cell: (model) => formatCurrency(model.basePrice, { context: formatContext }),
      header: 'Precio Base',
      id: 'basePrice',
      sortable: true,
    },
    {
      align: 'center',
      cell: (model) => `${model.minWidthMm}-${model.maxWidthMm}mm`,
      header: 'Ancho',
      id: 'width',
      sortable: false,
    },
    {
      align: 'center',
      cell: (model) => `${model.minHeightMm}-${model.maxHeightMm}mm`,
      header: 'Alto',
      id: 'height',
      sortable: false,
    },
    {
      align: 'right',
      cell: (model) => <ActionsMenu model={model} onDelete={handleDeleteClick} />,
      header: 'Acciones',
      id: 'actions',
      sortable: false,
      width: '80px',
    },
  ];

  return (
    <>
      <ServerTable columns={columns} data={tableData.items as Model[]} emptyMessage="No se encontraron modelos" />

      <TablePagination currentPage={tableData.page} totalItems={tableData.total} totalPages={tableData.totalPages} />

      <DeleteConfirmationDialog
        dependencies={[]}
        entityLabel={modelToDelete?.name ?? ''}
        entityName="modelo"
        loading={deleteMutation.isPending}
        onConfirm={handleConfirmDelete}
        onOpenChange={setDeleteDialogOpen}
        open={deleteDialogOpen}
      />
    </>
  );
}
