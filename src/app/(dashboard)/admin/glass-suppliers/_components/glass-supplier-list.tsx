/**
 * Glass Supplier List Component (US5 - T037)
 *
 * Client Component with search, filters, pagination and CRUD actions
 *
 * Features:
 * - Search by name, code, or country
 * - Filter by active status
 * - Pagination with page navigation
 * - Create, edit, delete actions
 * - Delete confirmation dialog with referential integrity
 *
 * Architecture:
 * - Filters extracted to separate component (always visible)
 * - Empty state component for no results
 * - URL-based state management via server params
 */

'use client';

import { Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { DeleteConfirmationDialog } from '@/app/_components/delete-confirmation-dialog';
import { TablePagination } from '@/app/_components/server-table/table-pagination';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { GlassSupplierListOutput } from '@/lib/validations/admin/glass-supplier.schema';
import type { FormValues } from '../_hooks/use-glass-supplier-form';
import { useGlassSupplierMutations } from '../_hooks/use-glass-supplier-mutations';
import { GlassSupplierDialog } from './glass-supplier-dialog';
import { GlassSupplierEmpty } from './glass-supplier-empty';
import { GlassSupplierFilters } from './glass-supplier-filters';

type GlassSupplierListProps = {
  initialData: GlassSupplierListOutput;
  searchParams: {
    country?: string;
    isActive?: string;
    page?: string;
    search?: string;
    sortBy?: string;
    sortOrder?: string;
  };
};

export function GlassSupplierList({ initialData, searchParams }: GlassSupplierListProps) {
  const [ dialogOpen, setDialogOpen ] = useState(false);
  const [ dialogMode, setDialogMode ] = useState<'create' | 'edit'>('create');
  const [ selectedSupplier, setSelectedSupplier ] = useState<(FormValues & { id: string }) | undefined>(undefined);

  const { deleteMutation } = useGlassSupplierMutations();
  const [ deleteDialogOpen, setDeleteDialogOpen ] = useState(false);
  const [ supplierToDelete, setSupplierToDelete ] = useState<{ id: string; name: string } | null>(null);

  const handleCreateClick = () => {
    setDialogMode('create');
    setSelectedSupplier(undefined);
    setDialogOpen(true);
  };

  const handleEditClick = (supplier: (FormValues & { id: string }) | GlassSupplierListOutput[ 'items' ][ number ]) => {
    setDialogMode('edit');
    setSelectedSupplier(supplier as FormValues & { id: string });
    setDialogOpen(true);
  };

  const handleDeleteClick = (id: string, name: string) => {
    setSupplierToDelete({ id, name });
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!supplierToDelete) return;
    deleteMutation.mutate(
      { id: supplierToDelete.id },
      {
        onSuccess: () => {
          setDeleteDialogOpen(false);
          setSupplierToDelete(null);
        },
      }
    );
  };

  const suppliers = initialData.items ?? [];
  const totalPages = initialData.totalPages ?? 1;
  const page = initialData.page ?? 1;
  const hasFilters = Boolean(searchParams.search || (searchParams.isActive && searchParams.isActive !== 'all'));

  return (
    <div className="space-y-6">
      {/* Filters - always visible */}
      <GlassSupplierFilters onCreateClickAction={handleCreateClick} searchParams={searchParams} />

      {/* Table or Empty State */}
      {suppliers.length === 0 ? (
        <GlassSupplierEmpty hasFilters={hasFilters} />
      ) : (
        <>
          {/* Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[30%]">Nombre</TableHead>
                  <TableHead className="w-[10%]">Código</TableHead>
                  <TableHead className="w-[20%]">País</TableHead>
                  <TableHead className="w-[15%] text-center">Tipos de Vidrio</TableHead>
                  <TableHead className="w-[15%]">Estado</TableHead>
                  <TableHead className="w-[10%] text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {suppliers.map((supplier) => (
                  <TableRow key={supplier.id}>
                    <TableCell className="font-medium">{supplier.name}</TableCell>
                    <TableCell>
                      {supplier.code ? (
                        <Badge variant="outline">{supplier.code}</Badge>
                      ) : (
                        <span className="text-muted-foreground text-sm">—</span>
                      )}
                    </TableCell>
                    <TableCell>{supplier.country || <span className="text-muted-foreground">—</span>}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant="secondary">{supplier._count.glassTypes}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={supplier.isActive ? 'default' : 'secondary'}>
                        {supplier.isActive ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button onClick={() => handleEditClick(supplier)} size="icon" variant="ghost">
                          <Pencil className="size-4" />
                          <span className="sr-only">Editar {supplier.name}</span>
                        </Button>
                        <Button
                          onClick={() => handleDeleteClick(supplier.id, supplier.name)}
                          size="icon"
                          variant="ghost"
                        >
                          <Trash2 className="size-4 text-destructive" />
                          <span className="sr-only">Eliminar {supplier.name}</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <TablePagination currentPage={page} totalItems={initialData.total} totalPages={totalPages} />
        </>
      )}

      <GlassSupplierDialog
        defaultValues={selectedSupplier}
        mode={dialogMode}
        onOpenChangeAction={setDialogOpen}
        open={dialogOpen}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        dependencies={[]}
        entityLabel={supplierToDelete?.name ?? ''}
        entityName="proveedor de vidrio"
        loading={deleteMutation.isPending}
        onConfirm={handleConfirmDelete}
        onOpenChange={setDeleteDialogOpen}
        open={deleteDialogOpen}
      />
    </div>
  );
}
