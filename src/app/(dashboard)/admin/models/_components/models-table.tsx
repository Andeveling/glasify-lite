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
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { formatCurrency } from '@/lib/export/pdf/pdf-utils';
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

export function ModelsTable({ initialData }: ModelsTableProps) {
  const utils = api.useUtils();
  const [ deleteDialogOpen, setDeleteDialogOpen ] = useState(false);
  const [ modelToDelete, setModelToDelete ] = useState<{ id: string; name: string } | null>(null);

  // Delete mutation
  const deleteMutation = api.admin.model.delete.useMutation({
    onError: (error) => {
      toast.error('Error al eliminar modelo', {
        description: error.message,
      });
    },
    onSuccess: () => {
      toast.success('Modelo eliminado correctamente');
      setDeleteDialogOpen(false);
      setModelToDelete(null);
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
   * Confirm delete
   */
  const handleConfirmDelete = async () => {
    if (!modelToDelete) return;
    await deleteMutation.mutateAsync({ id: modelToDelete.id });
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
      cell: (model) => formatCurrency(model.basePrice),
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
      {/* Table Card */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle>Modelos ({initialData.total})</CardTitle>
              <CardDescription>Gestiona los modelos de perfiles disponibles en el catálogo</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Table */}
          <ServerTable columns={columns} data={initialData.items} emptyMessage="No se encontraron modelos" />

          {/* Pagination */}
          <TablePagination
            currentPage={initialData.page}
            totalItems={initialData.total}
            totalPages={initialData.totalPages}
          />
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
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
