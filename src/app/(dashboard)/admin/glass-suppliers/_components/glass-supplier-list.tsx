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
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { DeleteConfirmationDialog } from '@/app/_components/delete-confirmation-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { GlassSupplierListOutput } from '@/lib/validations/admin/glass-supplier.schema';
import { api } from '@/trpc/react';

type GlassSupplierListProps = {
  initialData: GlassSupplierListOutput;
};

export function GlassSupplierList({ initialData }: GlassSupplierListProps) {
  const router = useRouter();
  const utils = api.useUtils();
  const [ search, setSearch ] = useState('');
  const [ isActive, setIsActive ] = useState<'all' | 'active' | 'inactive'>('all');
  const [ page, setPage ] = useState(1);
  const [ deleteDialogOpen, setDeleteDialogOpen ] = useState(false);
  const [ supplierToDelete, setSupplierToDelete ] = useState<{ id: string; name: string } | null>(null);

  // Query with filters
  const { data, isLoading } = api.admin[ 'glass-supplier' ].list.useQuery(
    {
      isActive,
      limit: 20,
      page,
      search: search || undefined,
      sortBy: 'name',
      sortOrder: 'asc',
    },
    {
      initialData,
      placeholderData: (previousData) => previousData, // TanStack Query v5 replacement for keepPreviousData
    }
  );

  // Delete mutation
  const deleteMutation = api.admin[ 'glass-supplier' ].delete.useMutation({
    onError: (error) => {
      toast.error('Error al eliminar proveedor', {
        description: error.message,
      });
    },
    onSuccess: () => {
      toast.success('Proveedor eliminado correctamente');
      setDeleteDialogOpen(false);
      setSupplierToDelete(null);
      // Invalidate list to refresh
      void utils.admin[ 'glass-supplier' ].list.invalidate();
    },
  });

  const handleCreateClick = () => {
    router.push('/admin/glass-suppliers/new');
  };

  const handleEditClick = (id: string) => {
    router.push(`/admin/glass-suppliers/${id}`);
  };

  const handleDeleteClick = (id: string, name: string) => {
    setSupplierToDelete({ id, name });
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!supplierToDelete) return;
    await deleteMutation.mutateAsync({ id: supplierToDelete.id });
  };

  const suppliers = data?.items ?? [];
  const totalPages = data?.totalPages ?? 1;

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
              <Input
                className="pl-8"
                id="search"
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1); // Reset to first page on search
                }}
                placeholder="Buscar por nombre, código o país..."
                value={search}
              />
            </div>
          </div>

          {/* Active Status Filter */}
          <div className="space-y-2">
            <label className="font-medium text-sm" htmlFor="isActive">
              Estado
            </label>
            <Select
              onValueChange={(value) => {
                setIsActive(value as 'all' | 'active' | 'inactive');
                setPage(1);
              }}
              value={isActive}
            >
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
          {isLoading && (
            <TableRow>
              <TableCell className="text-center" colSpan={6}>
                Cargando...
              </TableCell>
            </TableRow>
          )}
          {!isLoading && suppliers.length === 0 && (
            <TableRow>
              <TableCell className="text-center text-muted-foreground" colSpan={6}>
                No se encontraron proveedores
              </TableCell>
            </TableRow>
          )}
          {!isLoading &&
            suppliers.map((supplier) => (
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
                    <Button onClick={() => handleEditClick(supplier.id)} size="icon" variant="ghost">
                      <Pencil className="size-4" />
                      <span className="sr-only">Editar</span>
                    </Button>
                    <Button
                      onClick={() => handleDeleteClick(supplier.id, supplier.name)}
                      size="icon"
                      variant="ghost"
                    >
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
            <Button disabled={page === 1} onClick={() => setPage((p) => p - 1)} size="sm" variant="outline">
              Anterior
            </Button>
            <Button
              disabled={page === totalPages}
              onClick={() => setPage((p) => p + 1)}
              size="sm"
              variant="outline"
            >
              Siguiente
            </Button>
          </div>
        </div>
      )}


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
