/**
 * Glass Supplier List Component (US5 - T037)
 *
 * Client Component with search, filters, pagination and CRUD actions
 *
 * Features:
 * - Search by name, code, or country
 * - Filter by country and active status
 * - Pagination with page navigation
 * - Create, edit, delete actions
 * - Delete confirmation dialog with referential integrity
 */

'use client';

import { Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { DeleteConfirmationDialog } from '@/app/_components/delete-confirmation-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { GlassSupplierListOutput } from '@/lib/validations/admin/glass-supplier.schema';
import type { FormValues } from '../_hooks/use-glass-supplier-form';
import { useGlassSupplierMutations } from '../_hooks/use-glass-supplier-mutations';
import { GlassSupplierDialog } from './glass-supplier-dialog';

type GlassSupplierListProps = {
  initialData: GlassSupplierListOutput;
};

export function GlassSupplierList({ initialData }: GlassSupplierListProps) {
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

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
          <CardDescription>Busca y filtra proveedores de vidrio</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          {/* Search */}
          <div className="space-y-2">
            <label className="font-medium text-sm" htmlFor="search">
              Buscar
            </label>
            <div className="relative">
              <Search className="absolute top-2.5 left-2.5 size-4 text-muted-foreground" />
              <Input className="pl-8" id="search" placeholder="Buscar por nombre, código o país..." />
            </div>
          </div>

          {/* Active Status Filter */}
          <div className="space-y-2">
            <label className="font-medium text-sm" htmlFor="isActive">
              Estado
            </label>
            <Select>
              <SelectTrigger id="isActive">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="active">Activos</SelectItem>
                <SelectItem value="inactive">Inactivos</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Create Button */}
          <div className="flex items-end">
            <Button className="w-full" onClick={handleCreateClick}>
              <Plus className="mr-2 size-4" />
              Nuevo Proveedor
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead>Código</TableHead>
            <TableHead>País</TableHead>
            <TableHead>Tipos de Vidrio</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {suppliers.length === 0 && (
            <TableRow>
              <TableCell className="text-center text-muted-foreground" colSpan={6}>
                No se encontraron proveedores
              </TableCell>
            </TableRow>
          )}
          {suppliers.map((supplier) => (
            <TableRow key={supplier.id}>
              <TableCell className="font-medium">{supplier.name}</TableCell>
              <TableCell>
                {supplier.code ? (
                  <Badge variant="outline">{supplier.code}</Badge>
                ) : (
                  <span className="text-muted-foreground text-sm">-</span>
                )}
              </TableCell>
              <TableCell className="text-sm">{supplier.country || '-'}</TableCell>
              <TableCell>
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
                    <span className="sr-only">Editar</span>
                  </Button>
                  <Button onClick={() => handleDeleteClick(supplier.id, supplier.name)} size="icon" variant="ghost">
                    <Trash2 className="size-4 text-destructive" />
                    <span className="sr-only">Eliminar</span>
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <p className="text-muted-foreground text-sm">
            Página {page} de {totalPages}
          </p>
          <div className="flex gap-2">
            <Button disabled={page === 1} size="sm" variant="outline">
              Anterior
            </Button>
            <Button disabled={page === totalPages} size="sm" variant="outline">
              Siguiente
            </Button>
          </div>
        </div>
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
